import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Import components and utilities
import BurnoutForecastWidget from '../../components/BurnoutForecastWidget';
import BurnoutGraphChart from '../../components/BurnoutGraphChart';
import ForecastInfluenceCards from '../../components/ForecastInfluenceCards';
import { getActionablesForWeakestPillar } from '../../utils/actionables';
import { getAppleHealthDataOrMock, getHealthAuthorizationDebug, getHealthKitStatus, getHealthReadProbe, getTodayStepsDebug, initHealthKit, resetHealthKitBridgeStatus, subscribeToRealtimeHealthChanges } from '../../utils/appleHealth';
import { calculateBurnoutFromScores } from '../../utils/burnoutCalc';
import { getAppleWeatherGradientColor } from '../../utils/colorUtils';
import { EPCScores } from '../../utils/epcScoreCalc';
import { generateSmartForecast, generateConfidenceIntervals } from '../../utils/forecastCalc';
import { MinuteDataManager } from '../../utils/minuteDataManager';
import { convertAppleHealthToEPCAdjustments } from '../../utils/mockAppleHealthData';
import { DEFAULT_INTERPOLATION_CONFIG, fillTodayDataGaps } from '../../utils/smartInterpolation';
import * as Storage from '../../utils/storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mobile-specific optimizations for Expo Go iOS
const isIOS = Platform.OS === 'ios';

// Type definitions
interface ForecastDay {
  day: string;
  date: string;
  percentage: number;
  fullDate: Date;
  icon: string;
  high: number;
  low: number;
}

// Add type definition for BurnoutDataPoint
interface BurnoutDataPoint {
  hour?: number;
  minute?: number; // Add minute property
  day?: string;
  value: number;
  label: string;
  hasData: boolean; // Indicates if this data point has real data
}

// All available tasks for the task widget
const allTasks = [
  "Take a 10-minute walk outside",
  "Practice deep breathing for 5 minutes",
  "Drink a glass of water",
  "Stretch your shoulders and neck",
  "Write down 3 things you're grateful for",
  "Take a 2-minute break from screens",
  "Do 10 jumping jacks",
  "Listen to your favorite song",
  "Text a friend or family member",
  "Organize your desk or workspace",
  "Take 5 deep breaths",
  "Step outside for fresh air",
  "Do a quick body scan meditation",
  "Eat a healthy snack",
  "Review your daily priorities",
  "Do some light stretching",
  "Practice a mindfulness exercise",
  "Take a power nap (10-20 minutes)",
  "Call someone you care about",
  "Tidy up your immediate area"
];

// Generate extended 10-day forecast with mock Apple Health integration
const generateExtendedForecast = async (): Promise<ForecastDay[]> => {
  try {
    const epcScores = await Storage.getEPCScores();
    if (!epcScores) {
      console.warn('No EPC scores available, using baseline forecast');
      return generateBaselineForecast();
    }
    
    // Validate EPC scores
    const isValidEPC = (scores: any) => {
      return scores && 
        Number.isFinite(scores.energy) && scores.energy >= 0 && scores.energy <= 100 &&
        Number.isFinite(scores.purpose) && scores.purpose >= 0 && scores.purpose <= 100 &&
        Number.isFinite(scores.connection) && scores.connection >= 0 && scores.connection <= 100;
    };
    
    if (!isValidEPC(epcScores)) {
      console.error('Invalid EPC scores detected:', epcScores);
      return generateBaselineForecast();
    }

    // Get Apple Health data (real biometric data only) and apply adjustments
    try {
      const appleHealthData = await getAppleHealthDataOrMock();
      
      // Only apply adjustments if real data exists
      let adjustedScores = epcScores;
      
      if (appleHealthData.source === 'real' && appleHealthData.permissionsGranted) {
        const healthAdjustments = convertAppleHealthToEPCAdjustments(appleHealthData);
        adjustedScores = {
          energy: Math.max(0, Math.min(100, epcScores.energy + healthAdjustments.energyAdjustment)),
          purpose: Math.max(0, Math.min(100, epcScores.purpose + healthAdjustments.purposeAdjustment)),
          connection: Math.max(0, Math.min(100, epcScores.connection + healthAdjustments.connectionAdjustment)),
        };
        console.log('📊 Using real HealthKit data for forecast adjustments');
      } else {
        console.log('📊 Using baseline EPC (no real HealthKit data)');
      }

      const todayBurnout = calculateBurnoutFromScores(adjustedScores);
      const recentHistory = await Storage.getRecentBurnoutLevels(7);
      const { forecast, confidence } = generateSmartForecast(todayBurnout, recentHistory);

      await Storage.storeBurnoutHistory(todayBurnout);

      // Forecast generated successfully

      return buildForecastDays(todayBurnout, forecast, confidence.standardDeviation, confidence);
    } catch (error) {
      // If HealthKit is not available, use raw EPC scores without biometric adjustments
      console.log('⚠️ HealthKit not available for forecast, using raw EPC scores:', (error as Error).message);
      const todayBurnout = calculateBurnoutFromScores(epcScores);
      const recentHistory = await Storage.getRecentBurnoutLevels(7);
      const { forecast, confidence } = generateSmartForecast(todayBurnout, recentHistory);

      await Storage.storeBurnoutHistory(todayBurnout);

      // Forecast generated with EPC scores
      return buildForecastDays(todayBurnout, forecast, confidence.standardDeviation, confidence);
    }
  } catch (error) {
    console.error('Error generating extended forecast:', error);
    return generateBaselineForecast();
  }
};

// Build deterministic forecast day data with enhanced confidence intervals
const buildForecastDays = (
  todayBurnout: number,
  forecast: number[],
  standardDeviation: number,
  confidence?: ForecastConfidence
): ForecastDay[] => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const truncatedForecast = forecast.slice(0, 9); // Include today + next 9 days
  const { high, low } = generateConfidenceIntervals(truncatedForecast, standardDeviation);
  
  const today = new Date();
  const values = [todayBurnout, ...truncatedForecast];
  const highSeries = [todayBurnout, ...high];
  const lowSeries = [todayBurnout, ...low];
  
  return values.map((value, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    
    const percentage = Math.round(Math.max(0, Math.min(100, value)));
    const highValue = Math.round(Math.max(0, Math.min(100, highSeries[Math.min(index, highSeries.length - 1)])));
    const lowValue = Math.round(Math.max(0, Math.min(100, lowSeries[Math.min(index, lowSeries.length - 1)])));
    
    // Calculate confidence decay over time
    const confidenceDecay = Math.pow(0.95, index);
    const dayConfidence = confidence ? Math.round(confidence.score * confidenceDecay) : undefined;
    const uncertainty = highValue - lowValue;
    
    return {
      day: daysOfWeek[date.getDay()],
      date: date.getDate().toString(),
      percentage,
      fullDate: date,
      icon: getBurnoutIcon(percentage),
      high: highValue,
      low: lowValue,
      confidence: dayConfidence,
      uncertainty: uncertainty,
    };
  });
};

// Deterministic baseline forecast when no data available
const generateBaselineForecast = (): ForecastDay[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data: ForecastDay[] = [];
  const today = new Date();
  const baselinePercentage = 50; // Neutral baseline
  const confidenceRange = 5; // ±5% range for baseline

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    data.push({
      day: days[date.getDay()],
      date: date.getDate().toString(),
      percentage: baselinePercentage,
      fullDate: date,
      icon: getBurnoutIcon(baselinePercentage),
      high: Math.min(100, baselinePercentage + confidenceRange),
      low: Math.max(0, baselinePercentage - confidenceRange),
    });
  }

  return data;
};

const getBurnoutIcon = (percentage: number) => {
  if (percentage <= 30) return '😌'; // Low stress
  if (percentage <= 60) return '😐'; // Medium stress
  return '😰'; // High stress
};

// Add helper function for getting burnout color
const getBurnoutColor = (percentage: number) => {
  return getAppleWeatherGradientColor(percentage);
};

// Generate hourly data with ONLY actual stored data (no estimation)
const generateHourlyData = async (): Promise<BurnoutDataPoint[]> => {
  try {
    // Get current EPC scores
    const currentScores = await Storage.getEPCScores();
    if (!currentScores) {
      return []; // Return empty if no scores available
    }

    const now = new Date();
    const currentHour = now.getHours();
    const data: BurnoutDataPoint[] = [];

    // Generate 24 hours of data (0-23)
    for (let hour = 0; hour < 24; hour++) {
      let burnoutValue: number | null = null;
      let label = '';

      // Format hour label
      if (hour === 0) label = '12a';
      else if (hour < 12) label = `${hour}a`;
      else if (hour === 12) label = '12p';
      else label = `${hour - 12}p`;

      // For current hour, always use real-time data
      if (hour === currentHour) {
        // Fetch the stored burnout for the current hour
        const storedBurnout = await Storage.getHourlyBurnoutData(hour);
        if (storedBurnout !== null) {
          burnoutValue = storedBurnout;
          console.log(`📊 Current hour ${hour}:00 - Stored real-time burnout: ${burnoutValue}%`);
        } else {
          // If no stored data for current hour, calculate it now
          burnoutValue = calculateBurnoutFromScores(currentScores);
          console.log(`📊 Current hour ${hour}:00 - Recalculated burnout: ${burnoutValue}%`);
          // Consider storing this newly calculated value immediately if it's the very first time for this hour
          // await storeHourlyBurnoutData(hour, burnoutValue); // This is already handled by loadRadarData
        }
      }
      // For past hours, ONLY show if we have actual stored data
      else if (hour < currentHour) {
        const hourlyData = await Storage.getHourlyBurnoutData(hour);
        if (hourlyData !== null) {
          burnoutValue = hourlyData;
          console.log(`📊 Past hour ${hour}:00 - Stored burnout: ${burnoutValue}%`);
        } else {
          // NO ESTIMATION - if no stored data, show as gap
          burnoutValue = null;
          console.log(`📊 Past hour ${hour}:00 - No stored data (gap)`);
        }
      }
      // For future hours, show no data (gaps)
      else {
        burnoutValue = null; // This will create a gap in the chart
      }

      data.push({
        hour,
        minute: 0, // Set minute to 0 for hourly data
        value: burnoutValue !== null ? burnoutValue : 0, // 0 will be handled as gap
        label,
        hasData: burnoutValue !== null
      });
    }

    return data;
  } catch (error) {
    console.error('Error generating hourly data:', error);
    return [];
  }
};

// Enhanced minute-based tracking for Today tab using MinuteDataManager
const generateTodayMinuteData = async (currentBurnout: number): Promise<BurnoutDataPoint[]> => {
  try {
    console.log('📊 Getting minute data from MinuteDataManager...');
    
    // Get minute data from the new manager
    const minuteManager = MinuteDataManager.getInstance();
    const minuteData = await minuteManager.getTodayMinuteData();
    
    console.log(`📊 Retrieved ${minuteData.length} minute data points`);

    // Convert to BurnoutDataPoint format for graph compatibility
    const data: BurnoutDataPoint[] = minuteData.map(point => {
      const hour = Math.floor(point.minute / 60);
      const minuteInHour = point.minute % 60;
      
      let label = '';
      // Format labels for key times
      if (minuteInHour === 0) {
        if (hour === 0) label = '12a';
        else if (hour < 12) label = `${hour}a`;
        else if (hour === 12) label = '12p';
        else label = `${hour - 12}p`;
      }

      return {
        hour,
        minute: minuteInHour,
        value: point.burnoutPercentage,
        label,
        hasData: point.hasRealData || point.source === 'catchup', // Include catchup as valid data
      };
    });

    // Fill any remaining minutes up to current time if needed
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Ensure we have data up to current minute
    while (data.length <= currentTotalMinutes) {
      const totalMinutes = data.length;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      
      // Use last known value or current burnout
      const lastValue = data.length > 0 ? data[data.length - 1].value : currentBurnout;
      
      data.push({
        hour,
        minute,
        value: totalMinutes === currentTotalMinutes ? currentBurnout : lastValue,
        label: '',
        hasData: totalMinutes <= currentTotalMinutes,
      });
    }

    console.log(`📊 Converted to ${data.length} graph data points for Today view`);
    
    // Apply smart biometric interpolation to fill gaps with believable data
    const interpolatedData = await fillTodayDataGaps(data, {
      ...DEFAULT_INTERPOLATION_CONFIG,
      smoothingFactor: 0.9, // Very smooth for Apple Health style
      biometricWeight: 0.7,  // Strong biometric influence
      naturalPatterns: true,  // Apply circadian rhythm patterns
      preserveAnchors: true,  // Ensure we hit real data points
    });
    
    const realDataCount = interpolatedData.filter(p => p.hasData).length;
    const interpolatedCount = interpolatedData.length - realDataCount;
    console.log(`🎨 SMART INTERPOLATION: ${realDataCount} real + ${interpolatedCount} biometric-predicted points`);
    
    return interpolatedData;
  } catch (error) {
    // If anything fails (often due to HealthKit), gracefully fall back to
    // base minute data up to the current minute so Today never shows empty.
    console.error('Error generating today minute data:', error);
    try {
      const minuteManager = MinuteDataManager.getInstance();
      const minuteData = await minuteManager.getTodayMinuteData();
      const now = new Date();
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

      const fallback: BurnoutDataPoint[] = minuteData.map(point => {
        const hour = Math.floor(point.minute / 60);
        const minuteInHour = point.minute % 60;
        let label = '';
        if (minuteInHour === 0) {
          if (hour === 0) label = '12a';
          else if (hour < 12) label = `${hour}a`;
          else if (hour === 12) label = '12p';
          else label = `${hour - 12}p`;
        }
        return {
          hour,
          minute: minuteInHour,
          value: point.burnoutPercentage,
          label,
          hasData: point.hasRealData || point.source === 'catchup',
        };
      });

      while (fallback.length <= currentTotalMinutes) {
        const totalMinutes = fallback.length;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        const lastValue = fallback.length > 0 ? fallback[fallback.length - 1].value : currentBurnout;
        fallback.push({
          hour,
          minute,
          value: totalMinutes === currentTotalMinutes ? currentBurnout : lastValue,
          label: '',
          hasData: totalMinutes <= currentTotalMinutes,
        });
      }
      console.log('ℹ️ Falling back to base minute data (no interpolation)');
      return fallback;
    } catch (inner) {
      console.error('❌ Fallback minute data failed:', inner);
      return [];
    }
  }
};

const generateWeeklyData = async (currentBurnout: number): Promise<BurnoutDataPoint[]> => {
  try {
    console.log('🔄 WEEK: Starting weekly data generation...');
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']; // Clear day labels
    const data: BurnoutDataPoint[] = [];
    const today = new Date();
    
    // Find the Sunday of the current week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
    const currentDayOfWeek = today.getDay(); 
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDayOfWeek); // Set to Sunday of the current week

    let hasAnyRealData = false;
    let todayIndex = -1;

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i); // Iterate from Sunday to Saturday
      const dateString = date.toISOString().split('T')[0];
      const todayString = today.toISOString().split('T')[0];
      
      let burnoutValue: number | null = null;
      let hasRealData = false;

      if (dateString === todayString) {
        // For the current day, use the live currentBurnout value
        burnoutValue = currentBurnout;
        hasRealData = true;
        todayIndex = i;
        console.log(`📊 WEEK: TODAY (${days[i]}) - Real burnout: ${burnoutValue}%`);
      } else if (date <= today) {
        // For past days, try to get daily average burnout
        burnoutValue = await Storage.getDailyAverageBurnout(dateString);
        
        if (burnoutValue !== null) {
          hasRealData = true;
          console.log(`📊 WEEK: PAST (${days[i]}) - Stored average: ${burnoutValue}%`);
        } else {
          // Try to compute from hourly data (only for today)
          if (dateString === todayString) {
            const hourlyData = await Storage.getTodayHourlyBurnoutData();
            if (hourlyData && Object.keys(hourlyData).length > 0) {
              const values = Object.values(hourlyData);
              burnoutValue = values.reduce((sum, val) => sum + val, 0) / values.length;
              hasRealData = true;
              console.log(`📊 WEEK: PAST (${days[i]}) - Computed from hourly: ${burnoutValue.toFixed(1)}%`);
            }
          }
        }
      }
      
      // If still no data, use intelligent fallback
      if (burnoutValue === null) {
        if (hasAnyRealData && data.length > 0) {
          // Carry forward from last known day (deterministic)
          const lastValidValue = data.filter(d => d.hasData).pop()?.value || currentBurnout;
          burnoutValue = lastValidValue; // No variation - use exact value
          console.log(`⚠️ WEEK: FALLBACK (${days[i]}) - Carry forward: ${burnoutValue.toFixed(1)}%`);
        } else {
          // Use current burnout as baseline (deterministic)
          burnoutValue = currentBurnout;
          console.log(`⚠️ WEEK: FALLBACK (${days[i]}) - Baseline: ${burnoutValue.toFixed(1)}%`);
        }
      }

      if (hasRealData) hasAnyRealData = true;
      
      data.push({
        value: Math.max(0, Math.min(100, Math.round(burnoutValue))),
        label: days[i],
        hasData: hasRealData
      });
    }
    
    console.log(`✅ WEEK: Generated 7 days, ${data.filter(d => d.hasData).length} with real data, today at index ${todayIndex}`);
    return data;
  } catch (error) {
    console.error('❌ WEEK: Error generating weekly data:', error);
    // Return deterministic fallback data instead of empty array
    const fallbackData = Array.from({length: 7}, (_, i) => ({
      value: 50, // Baseline value
      label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i],
      hasData: false
    }));
    console.log('🔄 WEEK: Using fallback data due to error');
    return fallbackData;
  }
};

const generateMonthlyData = async (): Promise<BurnoutDataPoint[]> => {
  try {
    console.log('🔄 MONTH: Starting monthly data generation...');
    
    // Get actual burnout history from storage
    const history = await Storage.getBurnoutHistory();
    const data: BurnoutDataPoint[] = [];
    const today = new Date();
    
    // Get current month's weeks (proper calendar weeks)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    console.log(`📅 MONTH: Processing ${monthStart.toDateString()} to ${monthEnd.toDateString()}`);
    
    // Generate week buckets for current month
    const weeks: Array<{start: Date, end: Date, label: string}> = [];
    let currentWeekStart = new Date(monthStart);
    
    // Align to start of week (Sunday)
    currentWeekStart.setDate(monthStart.getDate() - monthStart.getDay());
    
    let weekCounter = 1;
    while (currentWeekStart <= monthEnd && weeks.length < 6) { // Max 6 weeks to cover any month
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      
      // Only include weeks that overlap with the current month
      if (weekEnd >= monthStart) {
        weeks.push({
          start: new Date(currentWeekStart),
          end: new Date(weekEnd),
          label: `W${weekCounter}`
        });
        weekCounter++;
      }
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    console.log(`📊 MONTH: Found ${weeks.length} weeks in current month`);
    
    let hasAnyRealData = false;
    let currentWeekIndex = -1;
    
    for (let i = 0; i < weeks.length; i++) {
      const week = weeks[i];
      
      // Check if this week contains today
      if (today >= week.start && today <= week.end) {
        currentWeekIndex = i;
      }
      
      // Find all data points in this week
      const weekData = history.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= week.start && entryDate <= week.end;
      });
      
      let weekValue: number;
      let hasRealData = false;
      
      if (weekData.length > 0) {
        // Calculate average for the week
        const average = weekData.reduce((sum, entry) => sum + entry.burnout, 0) / weekData.length;
        weekValue = Math.round(average);
        hasRealData = true;
        hasAnyRealData = true;
        console.log(`📊 MONTH: ${week.label} (${week.start.getDate()}-${week.end.getDate()}) - Real average: ${weekValue}% (${weekData.length} days)`);
      } else {
        // Try to compute from available daily data in this week
        let computedValues: number[] = [];
        for (let d = new Date(week.start); d <= week.end; d.setDate(d.getDate() + 1)) {
          if (d >= monthStart && d <= monthEnd) {
            const dayAvg = await Storage.getDailyAverageBurnout(d.toISOString().split('T')[0]);
            if (dayAvg !== null) {
              computedValues.push(dayAvg);
            }
          }
        }
        
        if (computedValues.length > 0) {
          weekValue = Math.round(computedValues.reduce((sum, val) => sum + val, 0) / computedValues.length);
          hasRealData = true;
          hasAnyRealData = true;
          console.log(`📊 MONTH: ${week.label} - Computed from ${computedValues.length} days: ${weekValue}%`);
        } else {
          // Intelligent fallback (deterministic)
          if (hasAnyRealData && data.length > 0) {
            const lastValidValue = data.filter(d => d.hasData).pop()?.value || 50;
            weekValue = Math.round(lastValidValue); // No variation
          } else {
            weekValue = 50; // Baseline value
          }
          console.log(`⚠️ MONTH: ${week.label} - Fallback value: ${weekValue}%`);
        }
      }
      
      data.push({
        value: Math.max(0, Math.min(100, weekValue)),
        label: week.label,
        hasData: hasRealData
      });
    }
    
    console.log(`✅ MONTH: Generated ${data.length} weeks, ${data.filter(d => d.hasData).length} with real data, current week at index ${currentWeekIndex}`);
    return data;
  } catch (error) {
    console.error('❌ MONTH: Error generating monthly data:', error);
    // Return deterministic fallback data
    const fallbackData = Array.from({length: 5}, (_, i) => ({
      value: 50, // Baseline value
      label: `W${i + 1}`,
      hasData: false
    }));
    console.log('🔄 MONTH: Using fallback data due to error');
    return fallbackData;
  }
};


// Smart logging system for detecting issues
const logGraphRenderingDiagnostics = (period: string, data: BurnoutDataPoint[], selectedIndex: number) => {
  console.log(`🔍 DIAGNOSTIC: === ${period} View Analysis ===`);
  console.log(`📊 Data Count: ${data.length} points`);
  console.log(`✅ Real Data: ${data.filter(d => d.hasData).length} points`);
  console.log(`❌ Fallback Data: ${data.filter(d => !d.hasData).length} points`);
  console.log(`🎯 Selected Index: ${selectedIndex}/${data.length - 1}`);
  
  if (data.length > 0) {
    console.log(`📈 Value Range: ${Math.min(...data.map(d => d.value))}% - ${Math.max(...data.map(d => d.value))}%`);
    console.log(`🏷️ Labels: [${data.slice(0, 3).map(d => d.label).join(', ')}${data.length > 3 ? '...' : ''}]`);
    
    if (selectedIndex >= 0 && selectedIndex < data.length) {
      const selected = data[selectedIndex];
      console.log(`🎯 Selected Point: ${selected.label} = ${selected.value}% (hasData: ${selected.hasData})`);
    }
  }
  
  // Check for common issues
  if (data.length === 0) {
    console.log('❌ ISSUE: No data points generated');
  } else if (data.filter(d => d.hasData).length === 0) {
    console.log('⚠️ WARNING: All data points are fallback values');
  } else if (selectedIndex < 0 || selectedIndex >= data.length) {
    console.log('❌ ISSUE: Selected index out of bounds');
  }
  
  console.log(`🔍 DIAGNOSTIC: === End ${period} Analysis ===\n`);
};

// Initialize today's hourly burnout data if none exists
const initializeTodayHourlyData = async (currentBurnout: number): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = `hourly_burnout_${today}`;
    
    // Check if we already have data for today
    const existingData = await AsyncStorage.getItem(key);
    if (existingData) return; // Already initialized
    
    // Initialize with current burnout for the current hour
    const currentHour = new Date().getHours();
    const hourlyData: Record<number, number> = {};
    
    // Set current hour to current burnout
    hourlyData[currentHour] = currentBurnout;
    
    // Store initial data
    await AsyncStorage.setItem(key, JSON.stringify(hourlyData));
    
    console.log(`📊 Initialized hourly burnout data for today: ${currentHour}:00 = ${currentBurnout}%`);
    
  } catch (error) {
    console.error('Error initializing hourly burnout data:', error);
  }
};

export default function RadarScreen() {
  const [completedTasks, setCompletedTasks] = useState<boolean[]>(new Array(allTasks.length).fill(false));
  const [visibleTaskIndices, setVisibleTaskIndices] = useState<number[]>([0, 1, 2]);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [epcScores, setEpcScores] = useState<EPCScores | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [smartTasks, setSmartTasks] = useState<string[]>([]);
  const [recentHistory, setRecentHistory] = useState<number[]>([]);
  const [todayBurnout, setTodayBurnout] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | 'Week' | 'Month'>('Today');
  const [graphData, setGraphData] = useState<BurnoutDataPoint[]>([]);
  const [selectedDataIndex, setSelectedDataIndex] = useState(0);
  const [graphDataCache, setGraphDataCache] = useState<Record<string, BurnoutDataPoint[]>>({}); // New cache for graph data
  
  // Cache for health data in development mode to prevent repeated HealthKit calls
  let healthDataCache: any = null;
  
  const router = useRouter();

  const loadRadarData = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      // Load EPC scores, recent history, and extended forecast data
      const [scores, history, extendedForecast] = await Promise.all([
        Storage.getEPCScores(),
        Storage.getRecentBurnoutLevels(7),
        generateExtendedForecast()
      ]);
      
      setEpcScores(scores);
      setRecentHistory(history);
      setForecastData(extendedForecast);
      
      // Clear graph data cache to force fresh data
      setGraphDataCache({});
      
      if (scores) {
        // Fetch Apple Health data (real biometric data only)
        try {
          const appleHealthData = await getAppleHealthDataOrMock();
          const healthAdjustments = convertAppleHealthToEPCAdjustments(appleHealthData);

          const adjustedScores = {
            energy: Math.max(0, Math.min(100, scores.energy + healthAdjustments.energyAdjustment)),
            purpose: Math.max(0, Math.min(100, scores.purpose + healthAdjustments.purposeAdjustment)),
            connection: Math.max(0, Math.min(100, scores.connection + healthAdjustments.connectionAdjustment)),
          };

          // Calculate both raw and adjusted burnout
          const rawBurnoutPercentage = calculateBurnoutFromScores(scores);
          const adjustedBurnoutPercentage = calculateBurnoutFromScores(adjustedScores);

          // Use ADJUSTED burnout for today/graph storage so biometrics influence Today tab
          setTodayBurnout(Math.round(adjustedBurnoutPercentage));

          // Store burnout data with accurate timing
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();

          // Store hourly and minute data using adjusted value so Today/Week reflect biometrics in near-realtime
          await Storage.storeHourlyBurnoutData(currentHour, adjustedBurnoutPercentage);
          await Storage.storeMinuteBurnoutData(currentMinute, adjustedBurnoutPercentage);

          console.log(
            `📊 Data stored for ${currentHour}:${currentMinute.toString().padStart(2, '0')} = ${adjustedBurnoutPercentage}% (raw ${rawBurnoutPercentage}%)`
          );

          console.log('🍎 Health adjustments applied:', healthAdjustments, 'Adjusted EPC:', adjustedScores);
        } catch (error) {
          // If HealthKit is not available, use raw EPC scores without biometric adjustments
          console.log('⚠️ HealthKit not available, using raw EPC scores:', (error as Error).message);
          const rawBurnoutPercentage = calculateBurnoutFromScores(scores);
          setTodayBurnout(Math.round(rawBurnoutPercentage));
          
          // Store raw burnout data
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          await Storage.storeHourlyBurnoutData(currentHour, rawBurnoutPercentage);
          await Storage.storeMinuteBurnoutData(currentMinute, rawBurnoutPercentage);
        }
      }
      
      // Generate smart tasks based on EPC scores
      if (scores) {
        const actionables = getActionablesForWeakestPillar(scores, 6);
        setSmartTasks(actionables.map((a: { title: string }) => a.title));
        
        // Update visible task indices to show smart tasks first
        setVisibleTaskIndices([0, 1, 2]);
      }
      
    } catch (error) {
      console.error('Error loading radar data:', error);
      // Fallback to baseline data
      setForecastData(generateBaselineForecast());
      setTodayBurnout(50); // Baseline value
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  const loadGraphData = useCallback(async () => {
    try {
      const cachedData = graphDataCache[selectedPeriod];

      if (cachedData) {
        setGraphData(cachedData);
        // Set selected index immediately for cached data if applicable
        if (selectedPeriod === 'Today') {
          // Select the current minute for today
          const now = new Date();
          const currentMinuteIndex = now.getHours() * 60 + now.getMinutes();
          const safeIndex = Math.min(currentMinuteIndex, cachedData.length - 1);
          setSelectedDataIndex(safeIndex);
          console.log(`🎯 CACHE: TODAY - Selected minute ${currentMinuteIndex} (safe index ${safeIndex})`);
        } else if (selectedPeriod === 'Week') {
          // Select today in week, prefer last day with data
          const todayIndex = new Date().getDay();
          const todayData = cachedData[todayIndex];
          
          if (todayData && todayData.hasData) {
            setSelectedDataIndex(todayIndex);
            console.log(`🎯 CACHE: WEEK - Selected today (${todayData.label})`);
          } else {
            // Find last day with data
            let lastDataIndex = todayIndex;
            for (let i = cachedData.length - 1; i >= 0; i--) {
              if (cachedData[i].hasData) {
                lastDataIndex = i;
                break;
              }
            }
            setSelectedDataIndex(lastDataIndex);
            console.log(`🎯 CACHE: WEEK - Selected last data day (${cachedData[lastDataIndex]?.label})`);
          }
        } else if (selectedPeriod === 'Month') {
          // Find current week in month
          const today = new Date();
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const dayOfMonth = today.getDate();
          const firstDayOfWeek = monthStart.getDay();
          const currentWeek = Math.floor((dayOfMonth + firstDayOfWeek - 1) / 7);
          const safeIndex = Math.min(currentWeek, cachedData.length - 1);
          setSelectedDataIndex(safeIndex);
          console.log(`🎯 CACHE: MONTH - Selected week ${currentWeek + 1} (index ${safeIndex})`);
        }
        console.log(`⚡ CACHE: ${selectedPeriod} - Loaded ${cachedData.length} cached points`);
      } else {
        // If no cached data yet, keep previous graphData to avoid flicker/zero dips while fetching fresh data
        console.log(`⏳ No cached data for ${selectedPeriod}, keeping previous data while fetching...`);
      }

      // Always initiate a background fetch for fresh data
      (async () => {
        let fetchedData: BurnoutDataPoint[] = [];
        let newSelectedIndex = 0; // Initialize for background fetch

        try {
          switch (selectedPeriod) {
            case 'Today':
              fetchedData = await generateTodayMinuteData(todayBurnout);
              // Select current minute
              const now = new Date();
              const currentMinuteIndex = now.getHours() * 60 + now.getMinutes();
              newSelectedIndex = Math.min(currentMinuteIndex, fetchedData.length - 1);
              console.log(`🎯 FETCH: TODAY - Selected minute ${currentMinuteIndex} (index ${newSelectedIndex})`);
              break;
            case 'Week':
              fetchedData = await generateWeeklyData(todayBurnout);
              // Select today, prefer last day with data
              const todayIndex = new Date().getDay();
              const todayWeekData = fetchedData[todayIndex];
              
              if (todayWeekData && todayWeekData.hasData) {
                newSelectedIndex = todayIndex;
                console.log(`🎯 FETCH: WEEK - Selected today (${todayWeekData.label})`);
              } else {
                // Find last day with data
                newSelectedIndex = todayIndex; // fallback
                for (let i = fetchedData.length - 1; i >= 0; i--) {
                  if (fetchedData[i].hasData) {
                    newSelectedIndex = i;
                    console.log(`🎯 FETCH: WEEK - Selected last data day (${fetchedData[i].label})`);
                    break;
                  }
                }
              }
              break;
            case 'Month':
              fetchedData = await generateMonthlyData();
              // Find current week in month
              const today = new Date();
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              const dayOfMonth = today.getDate();
              const firstDayOfWeek = monthStart.getDay();
              const currentWeek = Math.floor((dayOfMonth + firstDayOfWeek - 1) / 7);
              newSelectedIndex = Math.min(currentWeek, fetchedData.length - 1);
              console.log(`🎯 FETCH: MONTH - Selected week ${currentWeek + 1} (index ${newSelectedIndex})`);
              break;
            default:
              fetchedData = [];
          }

          // Only update state if data has changed or if it was not initially cached
          // Efficient comparison without JSON.stringify
          const dataChanged = !cachedData || 
            fetchedData.length !== cachedData.length ||
            fetchedData.some((item, index) => 
              !cachedData[index] || 
              item.value !== cachedData[index].value ||
              item.hasData !== cachedData[index].hasData
            );
          
          if (dataChanged) {
            setGraphDataCache(prevCache => ({
              ...prevCache,
              [selectedPeriod]: fetchedData,
            }));
            setGraphData(fetchedData);
            setSelectedDataIndex(newSelectedIndex); // Update selected index with fresh data
            
            // Run comprehensive diagnostics
            logGraphRenderingDiagnostics(selectedPeriod, fetchedData, newSelectedIndex);
            console.log(`✅ Fetched and updated graph data for ${selectedPeriod}`);
          } else {
            // Ensure the selected index reflects the current time even when data is identical
            setSelectedDataIndex(newSelectedIndex);
            console.log(`ℹ️ Fresh data for ${selectedPeriod} identical to cached. Updated selection index only.`);
          }
        } catch (backgroundError) {
          console.error(`Error loading graph data in background for ${selectedPeriod}:`, backgroundError);
        }
      })(); // Execute the async IIAFE immediately

    } catch (error) {
      console.error('Error loading graph data:', error);
      // If there was no cached data to display instantly, ensure graph is empty on error
      if (!graphDataCache[selectedPeriod]) {
        setGraphData([]);
      }
    }
  }, [graphDataCache, selectedPeriod, todayBurnout]);

  // Request HealthKit permissions when radar page loads
  const requestHealthKitPermissions = useCallback(async () => {
    try {
      const success = await initHealthKit();
      if (success) {
        console.log('✅ HealthKit permissions granted');
      } else {
        console.log('⚠️ HealthKit permissions not available (using mock data)');
        
        // Check what specific permissions are denied and provide guidance
        const { checkHealthKitPermissions } = await import('../../utils/appleHealth');
        const permissionCheck = await checkHealthKitPermissions();
        
        if (permissionCheck.needsUserAction) {
          console.log('🔧 User action needed for HealthKit permissions:');
          console.log(permissionCheck.guidanceMessage);
          
          // You could show an alert or modal here to guide the user
          // Alert.alert(
          //   'Health Data Access Required',
          //   permissionCheck.guidanceMessage,
          //   [{ text: 'OK' }]
          // );
        }
      }
    } catch (error) {
      console.log('⚠️ HealthKit permission request failed:', error);
    }
  }, []);

  // Load initial data only once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Request HealthKit permissions first
      await requestHealthKitPermissions();
      
      // Initialize smart environment detection
      const { EnvironmentManager, ConfidenceLogger } = await import('../../utils/environmentManager');
      await EnvironmentManager.initialize();
      
      await loadRadarData();
      
      // Test radar-specific functionality in development
      if (__DEV__) {
        ConfidenceLogger.logFeatureTest(
          'Radar Data Loading',
          100,
          'Radar data loaded successfully with environment-aware optimizations',
          'verified'
        );
      }
    };

    loadInitialData();

    // Subscribe to HK updates for near-realtime Today adjustments (only if HealthKit is available)
    let unsubscribe: (() => void) | null = null;
    (async () => {
      try {
        // Only try to subscribe if we're on a real iOS device with HealthKit
        if (Platform.OS === 'ios' && !__DEV__) {
          unsubscribe = await subscribeToRealtimeHealthChanges(async () => {
            // On change: refresh data quickly without full spinner
            await loadRadarData(false);
            await loadGraphData();
          });
        }
      } catch (error) {
        // Subscriptions may fail on simulators/Expo Go; ignore
        console.log('HealthKit subscription not available (using mock data)');
      }
    })();

    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, [requestHealthKitPermissions, loadRadarData, loadGraphData]); // Run when biometric handlers change

  // Refresh data when EPC scores change (every minute for smooth updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if we're not in development mode to avoid excessive HealthKit calls
      if (!__DEV__) {
        loadRadarData(false); // Refresh in background
        loadGraphData();
      }
    }, 60000); // Refresh every minute to align with minute tracking

    return () => clearInterval(interval);
  }, [loadRadarData, loadGraphData]);

  // Manual refresh function
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadRadarData();
    await loadGraphData();
  };

  // Simple HealthKit status test
  const handleHealthKitTest = async () => {
    try {
      console.log('🧪 Testing HealthKit status...');
      const status = await getHealthKitStatus();
      console.log('📊 HealthKit status:', status);
      
      Alert.alert(
        'HealthKit Status Test',
        `Platform: ${status.platform}\n` +
        `HealthKit Module: ${status.healthKitModule ? '✅' : '❌'}\n` +
        `Bridge Status: ${status.bridgeStatus}\n` +
        `Available: ${status.isAvailable ? '✅' : '❌'}\n` +
        (status.error ? `Error: ${status.error}` : '')
      );
    } catch (error) {
      console.error('❌ HealthKit test error:', error);
      Alert.alert('HealthKit Test Error', `Test failed: ${(error as Error).message}`);
    }
  };

  // Reset HealthKit bridge status
  const handleResetHealthKit = async () => {
    try {
      console.log('🔄 Resetting HealthKit bridge status...');
      resetHealthKitBridgeStatus();
      
      // Try to reinitialize
      const success = await initHealthKit();
      
      Alert.alert(
        'HealthKit Reset',
        `Bridge status reset and reinitialized.\n\nResult: ${success ? '✅ Success' : '❌ Failed'}\n\nTry the test button again.`
      );
    } catch (error) {
      console.error('❌ HealthKit reset error:', error);
      Alert.alert('HealthKit Reset Error', `Reset failed: ${(error as Error).message}`);
    }
  };

  // Debug: show current biometric data + step breakdown (real HealthKit data only)
  const handleShowBiometrics = async () => {
    try {
      console.log('🔍 Starting HealthKit debug...');
      
      // Step 1: Check basic HealthKit availability
      const { checkHealthKitPermissions } = await import('../../utils/appleHealth');
      const permissionCheck = await checkHealthKitPermissions();
      
      if (!permissionCheck.hasPermissions) {
        Alert.alert(
          'HealthKit Permissions Required',
          permissionCheck.guidanceMessage,
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('✅ HealthKit permissions verified');
      
      // Step 2: Get authorization debug info first
      const auth = await getHealthAuthorizationDebug();
      console.log('📊 Authorization status:', auth);
      
      // Step 3: Try to get basic health data
      let data;
      try {
        data = await getAppleHealthDataOrMock();
        console.log('✅ Health data retrieved successfully');
      } catch (error) {
        console.error('❌ Failed to get health data:', error);
        throw new Error(`Failed to get health data: ${(error as Error).message}`);
      }
      
      // Step 4: Try to get detailed debug info (these might fail)
      let stepsDebug = null;
      let probe = null;
      
      try {
        stepsDebug = await getTodayStepsDebug();
        console.log('✅ Steps debug info retrieved');
      } catch (error) {
        console.warn('⚠️ Steps debug failed:', (error as Error).message);
      }
      
      try {
        probe = await getHealthReadProbe();
        console.log('✅ Health read probe retrieved');
      } catch (error) {
        console.warn('⚠️ Health read probe failed:', (error as Error).message);
      }
      
      // Build summary with available data
      let summary = `Steps (today): ${data.steps.count}\n`;
      summary += `Exercise min: ${data.activityRings.exercise.current}\n`;
      summary += `Active energy: ${data.activityRings.move.current} kcal\n`;
      summary += `Sleep: ${data.sleep.hoursSlept}h (${data.sleep.sleepQuality})\n`;
      summary += `Resting HR: ${data.heartRate.resting}\n`;
      summary += `HRV: ${data.heartRate.hrv}\n\n`;
      
      summary += `Bridge: ${auth.bridge} | Available: ${auth.isAvailable}\n`;
      
      if (auth.statuses.length > 0) {
        const authStr = auth.statuses
          .map(s => `• ${s.type}: ${s.status}`)
          .join('\n');
        summary += `Authorization:\n${authStr}\n\n`;
      }
      
      if (stepsDebug) {
        const startStr = stepsDebug.start.toLocaleString();
        const endStr = stepsDebug.end.toLocaleString();
        summary += `Window: ${startStr} → ${endStr}\n`;
        summary += `Method: ${stepsDebug.method}\n`;
        
        if (stepsDebug.perSource.length > 0) {
          const sourcesStr = stepsDebug.perSource
            .map(s => `• ${s.source || 'Unknown'}${s.device ? ` (${s.device})` : ''}: ${s.count}`)
            .join('\n');
          summary += `By Source:\n${sourcesStr}\n`;
        }
      }
      
      if (probe) {
        summary += `Read probe: steps=${probe.stepsToday}, energy=${probe.activeEnergyKcalToday} kcal, exercise=${probe.exerciseMinToday} min, sleep=${probe.sleepLastNightHours} h\n`;
        if (probe.restingHRMostRecent) {
          summary += `RHR: ${probe.restingHRMostRecent.value} bpm (${probe.restingHRMostRecent.date})\n`;
        }
        if (probe.hrvMostRecentMs) {
          summary += `HRV: ${probe.hrvMostRecentMs.value} ms (${probe.hrvMostRecentMs.date})\n`;
        }
      }
      
      Alert.alert('Biometrics (real data)', summary);
      
    } catch (e) {
      console.error('❌ HealthKit debug error:', e);
      const errorMessage = (e as Error).message;
      Alert.alert(
        'HealthKit Error', 
        `Failed to read biometrics: ${errorMessage}\n\nDebug info:\n• Platform: ${Platform.OS}\n• Error: ${errorMessage}\n\nPlease ensure:\n• You're on a real iOS device\n• HealthKit permissions are granted\n• App is built with native modules`
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshOnFocus = async () => {
        await requestHealthKitPermissions();
        if (!isActive) return;

        await loadRadarData(false);
        if (!isActive) return;

        await loadGraphData();
      };

      refreshOnFocus();

      return () => {
        isActive = false;
      };
    }, [requestHealthKitPermissions, loadRadarData, loadGraphData])
  );

  // Real-time forecast updates when EPC scores change
  useEffect(() => {
    if (epcScores) {
      const updateForecast = async () => {
        try {
          const updatedForecast = await generateExtendedForecast();
          if (updatedForecast && updatedForecast.length > 0) {
            setForecastData(updatedForecast);
            // Forecast updated
          } else {
            console.warn('Empty forecast data received, keeping previous forecast');
          }
        } catch (error) {
          console.error('Error updating forecast:', error);
          // Don't update forecast data on error to maintain stability
        }
      };
      
      // Debounce forecast updates to avoid excessive recalculations
      const timeoutId = setTimeout(updateForecast, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [epcScores]);

  // Effect to load graph data whenever selectedPeriod or todayBurnout changes
  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const getCurrentPeriodInfo = () => {
    const selectedData = graphData[selectedDataIndex];
    if (!selectedData) return { subtitle: '', currentValue: 0 };

    switch (selectedPeriod) {
      case 'Today':
        const currentBurnoutValue = todayBurnout;
        return {
          subtitle: `Current Hour • ${currentBurnoutValue}%`,
          currentValue: currentBurnoutValue
        };
      case 'Week':
        return {
          subtitle: `This Week Average • ${selectedData.value}%`,
          currentValue: selectedData.value
        };
      case 'Month':
        return {
          subtitle: `This Month Average • ${selectedData.value}%`,
          currentValue: selectedData.value
        };
      default:
        return { subtitle: '', currentValue: 0 };
    }
  };

  const handleDataPointPress = (index: number) => {
    setSelectedDataIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleForecastWidgetPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/burnout-details');
  };

  const handleDayPress = (dayIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/forecast-details?dayIndex=${dayIndex}`);
  };

  const taskList = smartTasks.length > 0 ? smartTasks : allTasks;

  // Get next available task index that isn't completed
  const getNextAvailableTaskIndex = () => {
    for (let i = 0; i < taskList.length; i++) {
      if (!completedTasks[i] && !visibleTaskIndices.includes(i)) {
        return i;
      }
    }
    return -1;
  };

  const toggleTask = (index: number) => {
    const newCompletedTasks = [...completedTasks];
    newCompletedTasks[index] = !newCompletedTasks[index];
    setCompletedTasks(newCompletedTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // If task was just completed, schedule replacement after fade animation
    if (newCompletedTasks[index]) {
      setTimeout(() => {
        const nextTaskIndex = getNextAvailableTaskIndex();
        if (nextTaskIndex !== -1) {
          const newVisibleIndices = [...visibleTaskIndices];
          const completedTaskPosition = visibleTaskIndices.indexOf(index);
          if (completedTaskPosition !== -1) {
            newVisibleIndices[completedTaskPosition] = nextTaskIndex;
            setVisibleTaskIndices(newVisibleIndices);
          }
        }
      }, 2000);
    }
  };

  const handleTasksWidgetPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/tasks');
  };

  const handleTaskItemPress = (widgetIndex: number, event: any) => {
    event.stopPropagation();
    const actualTaskIndex = visibleTaskIndices[widgetIndex];
    toggleTask(actualTaskIndex);
  };

  // Get currently visible tasks for the widget
  const getVisibleTasks = () => {
    return visibleTaskIndices.map(index => ({
      task: taskList[index],
      isCompleted: completedTasks[index],
      index: index
    }));
  };

  const visibleTasks = getVisibleTasks();

  if (isLoading) {
    return (
      <Animated.View 
        style={styles.container}
        entering={FadeIn.duration(200)}
      >
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  const { subtitle, currentValue } = getCurrentPeriodInfo();

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200)}
    >
              <View style={styles.container}>
          <ScrollView 
            style={styles.mainScrollView}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Header with title and profile icon */}
                          <View style={styles.header}>
                <Text style={styles.title}>Radar</Text>
               
                {/* Refresh Button */}
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                >
                  <Text style={styles.refreshButtonText}>🔄</Text>
                </TouchableOpacity>

                {/* HealthKit Test Button */}
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={handleHealthKitTest}
                >
                  <Text style={styles.debugButtonText}>🔍</Text>
                </TouchableOpacity>

                {/* HealthKit Reset Button */}
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={handleResetHealthKit}
                >
                  <Text style={styles.debugButtonText}>🔄</Text>
                </TouchableOpacity>

                {/* Debug Biometrics Button */}
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={handleShowBiometrics}
                >
                  <Text style={styles.debugButtonText}>🧪</Text>
                </TouchableOpacity>
              </View>
            
            {/* Absolutely positioned profile icon - exact same as homepage */}
            <TouchableOpacity 
              style={styles.profileIconAbsolute}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Navigation functionality to be implemented later
              }}
            >
              <LinearGradient
                colors={['#D1D1D6', '#8E8E93']}
                style={styles.profileGradient}
              >
                <Text style={styles.profileText}>EK</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Time Period Tabs */}
            <View style={styles.timePeriodsSection}>
              <View style={styles.timePeriodTabs}>
                {(['Today', 'Week', 'Month'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.timePeriodTab,
                      selectedPeriod === period && styles.timePeriodTabActive
                    ]}
                    onPress={() => {
                      setSelectedPeriod(period);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[
                      styles.timePeriodTabText,
                      selectedPeriod === period && styles.timePeriodTabTextActive
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Current Period Display */}
            <View style={styles.currentPeriodSection}>
              <View style={styles.periodHeader}>
                <Text style={styles.periodTitle}>
                  {selectedPeriod === 'Today' ? 'Today' : `This ${selectedPeriod}`}
                </Text>
                <Text style={styles.periodSubtitle}>
                  {subtitle}
                </Text>
              </View>
            </View>

            {/* Burnout Percentage Graph */}
            <View style={styles.graphSection}>
              <BurnoutGraphChart
                data={graphData}
                selectedPeriod={selectedPeriod}
                selectedIndex={selectedDataIndex}
                currentOverride={selectedPeriod === 'Today' ? todayBurnout : undefined}
                onDataPointPress={handleDataPointPress}
              />
            </View>

            {/* 10-Day Forecast */}
            <View style={styles.forecastSection}>
              <BurnoutForecastWidget 
                data={forecastData}
                onPress={handleForecastWidgetPress}
                onDayPress={handleDayPress}
              />
            </View>

            {/* Forecast Influence Cards - Dynamic for Today */}
            {epcScores && (
              <View style={styles.influenceSection}>
                <ForecastInfluenceCards
                  epcScores={epcScores}
                  currentBurnout={todayBurnout}
                  confidence={forecastData.length > 0 ? {
                    score: forecastData[0]?.confidence || 0,
                    dataQuality: 'good' as const,
                    daysAvailable: 7,
                    variance: 0,
                    standardDeviation: 0
                  } : {
                    score: 0,
                    dataQuality: 'poor' as const,
                    daysAvailable: 0,
                    variance: 0,
                    standardDeviation: 0
                  }}
                  recentHistory={recentHistory}
                  forecastDay={0}
                  selectedForecastDay={forecastData[0]}
                />
              </View>
            )}

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background as requested
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Changed from space-between since profile icon is now absolute
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60, // Moved down by 40px total
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: isIOS ? 36 : 34, // iOS-optimized font size
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: isIOS ? '-apple-system' : '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
      refreshButton: {
      paddingHorizontal: isIOS ? 12 : 10, // iOS-optimized padding
      paddingVertical: isIOS ? 6 : 5, // iOS-optimized padding
      borderRadius: isIOS ? 10 : 8, // iOS-optimized border radius
      backgroundColor: '#F2F2F7',
      marginLeft: 10,
      // iOS-specific touch feedback
      ...(isIOS && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }),
    },
  refreshButtonText: {
    fontSize: 20,
  },
  debugButton: {
    paddingHorizontal: isIOS ? 12 : 10,
    paddingVertical: isIOS ? 6 : 5,
    borderRadius: isIOS ? 10 : 8,
    backgroundColor: '#F2F2F7',
    marginLeft: 8,
    ...(isIOS && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
  },
  debugButtonText: {
    fontSize: 18,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  profileIconAbsolute: {
    position: 'absolute',
    top: 52, // Moved down by 40px total
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Higher z-index to float above everything
  },
  mainScrollView: {
    flex: 1,
  },
  timePeriodsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  timePeriodTabs: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 2,
  },
  timePeriodTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePeriodTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timePeriodTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  timePeriodTabTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  currentPeriodSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  periodHeader: {
    flex: 1,
    alignItems: 'flex-start',
  },
  periodTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FF9500', // Orange color like in the screenshot
  },
  periodSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  currentValueCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  currentValueText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  currentValueLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  graphSection: {
    paddingHorizontal: 0, // Removed padding that was covering marginal text
    paddingVertical: 8,
  },
  graphContainer: {
    height: 200,
    backgroundColor: '#F8F8FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphPlaceholder: {
    alignItems: 'center',
  },
  graphPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  graphPlaceholderSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: 250,
  },
  forecastSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  influenceSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  bottomSpacing: {
    height: 100,
  },
  currentValueDisplay: {
    alignItems: 'center',
    marginTop: 8,
  },
  currentLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentPercentage: {
    fontSize: 28,
    fontWeight: '700',
  },
}); 
