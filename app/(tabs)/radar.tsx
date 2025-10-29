import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, NativeModules, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Import components and utilities
import BurnoutForecastWidget from '../../components/BurnoutForecastWidget';
import BurnoutGraphChart from '../../components/BurnoutGraphChart';
import { getActionablesForWeakestPillar } from '../../utils/actionables';
import { getAppleHealthDataRealOnly, getHealthKitStatus, initHealthKit, resetHealthKitBridgeStatus, subscribeToRealtimeHealthChanges } from '../../utils/appleHealth';
import { calculateBurnoutFromScores } from '../../utils/burnoutCalc';
import { getAppleWeatherGradientColor } from '../../utils/colorUtils';
import { EPCScores } from '../../utils/epcScoreCalc';
import { ForecastConfidence, generateConfidenceIntervals, generateSmartForecast } from '../../utils/forecastCalc';
import { MinuteDataManager } from '../../utils/minuteDataManager';
// Removed mock data imports - using real HealthKit only
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
      const appleHealthData = await getAppleHealthDataRealOnly();
      
      // Apply adjustments using real data
      let adjustedScores = epcScores;
      
      if (appleHealthData && appleHealthData.source === 'real' && appleHealthData.permissionsGranted) {
        // Apply health adjustments based on real data
        const healthAdjustments = {
          energyAdjustment: 0,
          purposeAdjustment: 0,
          connectionAdjustment: 0,
        };
        
        // Positive adjustments (good health metrics)
        if (appleHealthData.steps.count >= 10000) {
          healthAdjustments.energyAdjustment += 5;
        }
        if (appleHealthData.sleep.hoursSlept >= 8) {
          healthAdjustments.energyAdjustment += 5;
        }
        if (appleHealthData.activityRings.exercise.current >= 30) {
          healthAdjustments.purposeAdjustment += 3;
        }
        
        // Negative adjustments (poor health metrics)
        if (appleHealthData.steps.count < 5000) {
          healthAdjustments.energyAdjustment -= 5;
        }
        if (appleHealthData.sleep.hoursSlept < 6) {
          healthAdjustments.energyAdjustment -= 5;
        }
        if (appleHealthData.sleep.hoursSlept < 5) {
          healthAdjustments.energyAdjustment -= 3; // Additional penalty for very poor sleep
        }
        
        // Heart rate adjustments
        if (appleHealthData.heartRate.resting > 0) {
          if (appleHealthData.heartRate.resting < 60) {
            // Low resting HR (good fitness) = more energy
            healthAdjustments.energyAdjustment += 3;
          } else if (appleHealthData.heartRate.resting > 80) {
            // High resting HR (stress/poor fitness) = less energy
            healthAdjustments.energyAdjustment -= 3;
          }
        }
        
        // Active energy adjustments
        if (appleHealthData.activityRings.move.current >= 500) {
          healthAdjustments.energyAdjustment += 3;
          healthAdjustments.purposeAdjustment += 2;
        } else if (appleHealthData.activityRings.move.current < 200) {
          healthAdjustments.energyAdjustment -= 3;
        }
        
        adjustedScores = {
          energy: Math.max(0, Math.min(100, epcScores.energy + healthAdjustments.energyAdjustment)),
          purpose: Math.max(0, Math.min(100, epcScores.purpose + healthAdjustments.purposeAdjustment)),
          connection: Math.max(0, Math.min(100, epcScores.connection + healthAdjustments.connectionAdjustment)),
        };
      }

      const todayBurnout = calculateBurnoutFromScores(adjustedScores);
      const recentHistory = await Storage.getRecentBurnoutLevels(7);
      const { forecast, confidence } = generateSmartForecast(todayBurnout, recentHistory);

      await Storage.storeBurnoutHistory(todayBurnout);

      // Forecast generated successfully

      return buildForecastDays(todayBurnout, forecast, confidence.standardDeviation, confidence);
    } catch (error) {
      // If HealthKit is not available, use raw EPC scores without biometric adjustments
      // console.log('⚠️ HealthKit not available for forecast, using raw EPC scores:', (error as Error).message);
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
        } else {
          // If no stored data for current hour, calculate it now
          burnoutValue = calculateBurnoutFromScores(currentScores);
          // Consider storing this newly calculated value immediately if it's the very first time for this hour
          // await storeHourlyBurnoutData(hour, burnoutValue); // This is already handled by loadRadarData
        }
      }
      // For past hours, ONLY show if we have actual stored data
      else if (hour < currentHour) {
        const hourlyData = await Storage.getHourlyBurnoutData(hour);
        if (hourlyData !== null) {
          burnoutValue = hourlyData;
        } else {
          // NO ESTIMATION - if no stored data, show as gap
          burnoutValue = null;
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
    // Get minute data from the new manager
    const minuteManager = MinuteDataManager.getInstance();
    const minuteData = await minuteManager.getTodayMinuteData();

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

    
    // Apply smart biometric interpolation to fill gaps with believable data
    const interpolatedData = await fillTodayDataGaps(data, {
      ...DEFAULT_INTERPOLATION_CONFIG,
      smoothingFactor: 0.9, // Very smooth for Apple Health style
      biometricWeight: 0.7,  // Strong biometric influence
      naturalPatterns: true,  // Apply circadian rhythm patterns
      preserveAnchors: true,  // Ensure we hit real data points
    });
    
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
      return fallback;
    } catch (inner) {
      console.error('❌ Fallback minute data failed:', inner);
      return [];
    }
  }
};

const generateWeeklyData = async (currentBurnout: number): Promise<BurnoutDataPoint[]> => {
  try {
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
      } else if (date <= today) {
        // For past days, try to get daily average burnout
        burnoutValue = await Storage.getDailyAverageBurnout(dateString);
        
        if (burnoutValue !== null) {
          hasRealData = true;
        } else {
          // Try to compute from hourly data (only for today)
          if (dateString === todayString) {
            const hourlyData = await Storage.getTodayHourlyBurnoutData();
            if (hourlyData && Object.keys(hourlyData).length > 0) {
              const values = Object.values(hourlyData);
              burnoutValue = values.reduce((sum, val) => sum + val, 0) / values.length;
              hasRealData = true;
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
        } else {
          // Use current burnout as baseline (deterministic)
          burnoutValue = currentBurnout;
        }
      }

      if (hasRealData) hasAnyRealData = true;
      
      data.push({
        value: Math.max(0, Math.min(100, Math.round(burnoutValue))),
        label: days[i],
        hasData: hasRealData
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ WEEK: Error generating weekly data:', error);
    // Return deterministic fallback data instead of empty array
    const fallbackData = Array.from({length: 7}, (_, i) => ({
      value: 50, // Baseline value
      label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i],
      hasData: false
    }));
    return fallbackData;
  }
};

const generateMonthlyData = async (): Promise<BurnoutDataPoint[]> => {
  try {
    
    // Get actual burnout history from storage
    const history = await Storage.getBurnoutHistory();
    const data: BurnoutDataPoint[] = [];
    const today = new Date();
    
    // Get current month's weeks (proper calendar weeks)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    
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
        } else {
          // Intelligent fallback (deterministic)
          if (hasAnyRealData && data.length > 0) {
            const lastValidValue = data.filter(d => d.hasData).pop()?.value || 50;
            weekValue = Math.round(lastValidValue); // No variation
          } else {
            weekValue = 50; // Baseline value
          }
        }
      }
      
      data.push({
        value: Math.max(0, Math.min(100, weekValue)),
        label: week.label,
        hasData: hasRealData
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ MONTH: Error generating monthly data:', error);
    // Return deterministic fallback data
    const fallbackData = Array.from({length: 5}, (_, i) => ({
      value: 50, // Baseline value
      label: `W${i + 1}`,
      hasData: false
    }));
    return fallbackData;
  }
};


// Smart logging system for detecting issues (disabled to reduce console spam)
const logGraphRenderingDiagnostics = (period: string, data: BurnoutDataPoint[], selectedIndex: number) => {
  // Only log in development mode and only for errors
  if (__DEV__ && data.length === 0) {
    console.log(`❌ ISSUE: No data points generated for ${period}`);
  }
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
  const [userName, setUserName] = useState<string>('');
  const [profileInitials, setProfileInitials] = useState<string>('');
  
  // Cache for health data in development mode to prevent repeated HealthKit calls
  let healthDataCache: any = null;
  
  const router = useRouter();

  // Function to load user data and extract first name
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        const user = JSON.parse(userData);
        // Extract first name from full name
        const firstName = user.name ? user.name.split(' ')[0] : '';
        setUserName(firstName);
        // Compute initials from full name or email
        const fullName: string = user.name || '';
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        let initials = '';
        if (nameParts.length > 0) {
          initials = nameParts[0]?.[0] || '';
          if (nameParts.length > 1) initials += nameParts[1]?.[0] || '';
        } else if (user.email) {
          initials = user.email[0] || '';
        }
        setProfileInitials(initials.toUpperCase());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

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
          const appleHealthData = await getAppleHealthDataRealOnly();
          
          // Only proceed if we have HealthKit data
          if (!appleHealthData) {
            // No HealthKit data available, use raw EPC scores
            const rawBurnoutPercentage = calculateBurnoutFromScores(scores);
            setTodayBurnout(Math.round(rawBurnoutPercentage));
            
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            await Storage.storeHourlyBurnoutData(currentHour, rawBurnoutPercentage);
            await Storage.storeMinuteBurnoutData(currentMinute, rawBurnoutPercentage);
          } else {
            // Apply health adjustments based on real data
            const healthAdjustments = {
              energyAdjustment: 0,
              purposeAdjustment: 0,
              connectionAdjustment: 0,
            };
            
            // Positive adjustments (good health metrics)
            if (appleHealthData.steps.count >= 10000) {
              healthAdjustments.energyAdjustment += 5;
            }
            if (appleHealthData.sleep.hoursSlept >= 8) {
              healthAdjustments.energyAdjustment += 5;
            }
            if (appleHealthData.activityRings.exercise.current >= 30) {
              healthAdjustments.purposeAdjustment += 3;
            }
            
            // Negative adjustments (poor health metrics)
            if (appleHealthData.steps.count < 5000) {
              healthAdjustments.energyAdjustment -= 5;
            }
            if (appleHealthData.sleep.hoursSlept < 6) {
              healthAdjustments.energyAdjustment -= 5;
            }
            if (appleHealthData.sleep.hoursSlept < 5) {
              healthAdjustments.energyAdjustment -= 3; // Additional penalty for very poor sleep
            }
            
            // Heart rate adjustments
            if (appleHealthData.heartRate.resting > 0) {
              if (appleHealthData.heartRate.resting < 60) {
                // Low resting HR (good fitness) = more energy
                healthAdjustments.energyAdjustment += 3;
              } else if (appleHealthData.heartRate.resting > 80) {
                // High resting HR (stress/poor fitness) = less energy
                healthAdjustments.energyAdjustment -= 3;
              }
            }
            
            // Active energy adjustments
            if (appleHealthData.activityRings.move.current >= 500) {
              healthAdjustments.energyAdjustment += 3;
              healthAdjustments.purposeAdjustment += 2;
            } else if (appleHealthData.activityRings.move.current < 200) {
              healthAdjustments.energyAdjustment -= 3;
            }

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
          }
        } catch (error) {
          // If HealthKit is not available, use raw EPC scores without biometric adjustments
          // console.log('⚠️ HealthKit not available, using raw EPC scores:', (error as Error).message);
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
        } else if (selectedPeriod === 'Week') {
          // Select today in week, prefer last day with data
          const todayIndex = new Date().getDay();
          const todayData = cachedData[todayIndex];
          
          if (todayData && todayData.hasData) {
            setSelectedDataIndex(todayIndex);
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
        }
      } else {
        // If no cached data yet, keep previous graphData to avoid flicker/zero dips while fetching fresh data
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
              break;
            case 'Week':
              fetchedData = await generateWeeklyData(todayBurnout);
              // Select today, prefer last day with data
              const todayIndex = new Date().getDay();
              const todayWeekData = fetchedData[todayIndex];
              
              if (todayWeekData && todayWeekData.hasData) {
                newSelectedIndex = todayIndex;
              } else {
                // Find last day with data
                newSelectedIndex = todayIndex; // fallback
                for (let i = fetchedData.length - 1; i >= 0; i--) {
                  if (fetchedData[i].hasData) {
                    newSelectedIndex = i;
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
            
            // Run comprehensive diagnostics (only in development)
            if (__DEV__) {
              logGraphRenderingDiagnostics(selectedPeriod, fetchedData, newSelectedIndex);
            }
          } else {
            // Ensure the selected index reflects the current time even when data is identical
            setSelectedDataIndex(newSelectedIndex);
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

  // Keep a ref to the latest loadGraphData implementation for one-time init effect
  const loadGraphDataRef = useRef(loadGraphData);
  useEffect(() => {
    loadGraphDataRef.current = loadGraphData;
  }, [loadGraphData]);

  // Request HealthKit permissions when radar page loads (ONCE)
  const requestHealthKitPermissionsRef = useRef(false);
  const requestHealthKitPermissions = useCallback(async () => {
    // Prevent repeated calls
    if (requestHealthKitPermissionsRef.current) {
      return;
    }
    requestHealthKitPermissionsRef.current = true;
    
    try {
      const success = await initHealthKit();
      // Silent success - no logging needed
    } catch (error) {
      // Silent error - only log if critical
      if (__DEV__) {
        console.warn('HealthKit initialization failed:', error);
      }
    }
  }, []);

  // Load initial data only once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Request HealthKit permissions first
      try {
        await requestHealthKitPermissions();
      } catch (permissionError) {
        console.warn(
          'HealthKit permission request failed (continuing without permissions):',
          permissionError instanceof Error ? permissionError.message : permissionError
        );
      }
      
      // Initialize smart environment detection (optional for Expo Go/web)
      let confidenceLoggerRef: { logFeatureTest: (...args: any[]) => void } | null = null;
      try {
        const { EnvironmentManager, ConfidenceLogger } = await import('../../utils/environmentManager');
        await EnvironmentManager.initialize();
        confidenceLoggerRef = ConfidenceLogger;
      } catch (envError) {
        console.warn(
          'EnvironmentManager initialization skipped for Radar screen:',
          envError instanceof Error ? envError.message : envError
        );
      }
      
      await loadUserData();
      await loadRadarData();
      await loadGraphDataRef.current();
      
      // Test radar-specific functionality in development
      if (__DEV__ && false && confidenceLoggerRef) { // Disabled excessive logging
        confidenceLoggerRef?.logFeatureTest(
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
        // console.log('HealthKit subscription not available (using mock data)');
      }
    })();

    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch (_) {}
      }
    };
  }, [loadRadarData]); // Run when radar data handler changes

  // Refresh data when EPC scores change (every 5 minutes for smooth updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if we're not in development mode to avoid excessive HealthKit calls
      if (!__DEV__) {
        loadRadarData(false); // Refresh in background
        loadGraphData();
      }
    }, 300000); // Refresh every 5 minutes instead of every minute

    return () => clearInterval(interval);
  }, [loadRadarData, loadGraphData]);

  // Manual refresh function
  const handleRefresh = async () => {
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

  // Debug: Fetch and display HealthKit data (following react-native-health implementation guide)
  const handleShowBiometrics = () => {
    const AppleHealthKit = NativeModules.AppleHealthKit;
    
      console.log('🔍 Starting HealthKit debug...');
    console.log('NativeModules:', Object.keys(NativeModules));
    console.log('AppleHealthKit module:', AppleHealthKit);
    
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'HealthKit is only available on iOS devices.');
      return;
    }
    
    if (!AppleHealthKit || typeof AppleHealthKit.isAvailable !== 'function') {
        Alert.alert(
        'HealthKit Not Available',
        'HealthKit module is not available. This app requires a native iOS build with react-native-health.\n\nPlease ensure:\n• You are on a real iOS device (not simulator)\n• App is built with native modules\n• react-native-health is properly installed'
        );
        return;
      }
      
    // Step 1: Check if HealthKit is available on this device
    AppleHealthKit.isAvailable((err: any, available: boolean) => {
      if (err) {
        console.log('❌ Error checking HealthKit availability:', err);
        Alert.alert('Error', `Failed to check HealthKit availability: ${err}`);
        return;
      }
      
      if (!available) {
        Alert.alert('HealthKit Not Available', 'HealthKit is not available on this device.');
        return;
      }
      
      console.log('✅ HealthKit is available');
      
      // Step 2: Initialize HealthKit and request permissions
      const permissions = {
        permissions: {
          read: [
            'StepCount',
            'DistanceWalkingRunning',
            'FlightsClimbed',
            'ActiveEnergyBurned',
            'HeartRate',
            'RestingHeartRate',
            'HeartRateVariability',
            'SleepAnalysis',
            'MindfulSession',
          ],
          write: [],
        },
      };
      
      AppleHealthKit.initHealthKit(permissions, (initErr: any, initResults: any) => {
        if (initErr) {
          console.log('❌ HealthKit initialization error:', initErr);
          Alert.alert('Authorization Required', 'Please grant HealthKit permissions in Settings > Health > Data Access & Devices.');
          return;
        }
        
        console.log('✅ HealthKit initialized successfully');
        
        // Step 3: Fetch health data using callback-based API
        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        const options = {
          startDate: startOfToday.toISOString(),
          endDate: now.toISOString(),
        };
        
        const healthData: any = {};
        let queriesCompleted = 0;
        const totalQueries = 5;
        
        const checkIfComplete = () => {
          queriesCompleted++;
          if (queriesCompleted === totalQueries) {
            // All queries completed, show results
            let summary = '📊 HealthKit Data (Today):\n\n';
            
            // Show all data points, including those with 0 or no data
            summary += `Steps: ${healthData.StepCount ? `${healthData.StepCount.value} ${healthData.StepCount.unit}` : 'No data'}\n`;
            summary += `Active Energy: ${healthData.ActiveEnergyBurned ? `${healthData.ActiveEnergyBurned.value} ${healthData.ActiveEnergyBurned.unit}` : 'No data'}\n`;
            summary += `Distance: ${healthData.DistanceWalkingRunning ? `${healthData.DistanceWalkingRunning.value} ${healthData.DistanceWalkingRunning.unit}` : 'No data'}\n`;
            summary += `Heart Rate: ${healthData.HeartRate ? `${healthData.HeartRate.value} ${healthData.HeartRate.unit}` : 'No data'}\n`;
            summary += `Sleep (24h): ${healthData.Sleep ? `${healthData.Sleep.value} ${healthData.Sleep.unit}` : 'No data'}\n`;
            
            console.log('✅ All health data fetched:', healthData);
            Alert.alert('Health Data Retrieved', summary);
          }
        };
        
        // Query 1: Step Count
        AppleHealthKit.getStepCount(options, (err: any, results: any) => {
          if (!err && results && results.value) {
            console.log('✅ Step count:', results.value);
            healthData.StepCount = { value: Math.round(results.value), unit: 'steps' };
          } else {
            console.log('⚠️ Step count error:', err);
          }
          checkIfComplete();
        });
        
        // Query 2: Active Energy Burned
        AppleHealthKit.getActiveEnergyBurned(options, (err: any, results: any) => {
          if (!err && results && results.value) {
            console.log('✅ Active energy:', results.value);
            healthData.ActiveEnergyBurned = { value: Math.round(results.value), unit: 'kcal' };
          } else {
            console.log('⚠️ Active energy - err:', err, 'results:', results);
          }
          checkIfComplete();
        });
        
        // Query 3: Distance Walking/Running
        AppleHealthKit.getDistanceWalkingRunning(options, (err: any, results: any) => {
          if (!err && results && results.value) {
            console.log('✅ Distance:', results.value);
            healthData.DistanceWalkingRunning = { value: (results.value / 1000).toFixed(2), unit: 'km' };
          } else {
            console.log('⚠️ Distance error:', err);
          }
          checkIfComplete();
        });
        
        // Query 4: Heart Rate (get latest sample)
        AppleHealthKit.getHeartRateSamples(options, (err: any, results: any) => {
          if (!err && results && results.length > 0) {
            const latest = results[results.length - 1];
            console.log('✅ Heart rate:', latest.value);
            healthData.HeartRate = { value: Math.round(latest.value), unit: 'bpm' };
          } else {
            console.log('⚠️ Heart rate - err:', err, 'results length:', results?.length || 0);
          }
          checkIfComplete();
        });
        
        // Query 5: Sleep Analysis (last 24 hours)
        const sleepOptions = {
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: now.toISOString(),
        };
        
        AppleHealthKit.getSleepSamples(sleepOptions, (err: any, results: any) => {
          if (!err && results && results.length > 0) {
            const totalMinutes = results.reduce((sum: number, sample: any) => {
              if (sample.value === 'ASLEEP' || sample.value === 'INBED') {
                const duration = (new Date(sample.endDate).getTime() - new Date(sample.startDate).getTime()) / (1000 * 60);
                return sum + duration;
              }
              return sum;
            }, 0);
            const hours = (totalMinutes / 60).toFixed(1);
            console.log('✅ Sleep:', hours, 'hours');
            healthData.Sleep = { value: hours, unit: 'hours' };
          } else {
            console.log('⚠️ Sleep - err:', err, 'results length:', results?.length || 0);
          }
          checkIfComplete();
        });
      });
    });
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshOnFocus = async () => {
        // HealthKit permissions already requested on mount - no need to repeat
        if (!isActive) return;

        await loadRadarData(false);
        if (!isActive) return;

        await loadGraphData();
      };

      refreshOnFocus();

      return () => {
        isActive = false;
      };
    }, [loadRadarData, loadGraphData])
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
    router.push('/burnout-details');
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
               
                {/* Refresh Button - COMMENTED OUT */}
                {/* <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                >
                  <Text style={styles.refreshButtonText}>🔄</Text>
                </TouchableOpacity> */}

                {/* HealthKit Test Button - COMMENTED OUT */}
                {/* <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={handleHealthKitTest}
                >
                  <Text style={styles.debugButtonText}>🔍</Text>
                </TouchableOpacity> */}

                {/* HealthKit Reset Button - COMMENTED OUT */}
                {/* <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={handleResetHealthKit}
                >
                  <Text style={styles.debugButtonText}>🔄</Text>
                </TouchableOpacity> */}

                {/* Debug Biometrics Button - COMMENTED OUT */}
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={handleShowBiometrics}
                >
                  <Text style={styles.debugButtonText}>🧪</Text>
                </TouchableOpacity>
              </View>
            
            {/* Absolutely positioned profile icon - exact same as homepage */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (epcScores) {
                  router.push({
                    pathname: '/epc-explanation-profile',
                    params: { scores: JSON.stringify(epcScores) }
                  });
                }
              }}
              activeOpacity={0.8}
              style={styles.profileIconAbsolute}
            >
              <LinearGradient
                colors={['#D1D1D6', '#8E8E93']} // Subtle gradient from lighter to darker grey
                style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={styles.profileInitials}>{profileInitials || 'U'}</Text>
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
  profileInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
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
