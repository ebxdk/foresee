import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Import components and utilities
import BurnoutForecastWidget from '../../components/BurnoutForecastWidget';
import BurnoutGraphChart from '../../components/BurnoutGraphChart';
import { getActionablesForWeakestPillar } from '../../utils/actionables';
import { getAppleHealthDataOrMock } from '../../utils/appleHealth';
import { calculateBurnoutFromScores } from '../../utils/burnoutCalc';
import { getAppleWeatherGradientColor } from '../../utils/colorUtils';
import { EPCScores } from '../../utils/epcScoreCalc';
import { generateSmartForecast } from '../../utils/forecastCalc';
import { convertAppleHealthToEPCAdjustments } from '../../utils/mockAppleHealthData';
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
      return generateMockForecast();
    }

    // Get Apple Health data (real on iOS with fallback to mock) and apply adjustments
    const appleHealthData = await getAppleHealthDataOrMock();
    const healthAdjustments = convertAppleHealthToEPCAdjustments(appleHealthData);
    
    // Apply health adjustments to EPC scores
    const adjustedScores = {
      energy: Math.max(0, Math.min(100, epcScores.energy + healthAdjustments.energyAdjustment)),
      purpose: Math.max(0, Math.min(100, epcScores.purpose + healthAdjustments.purposeAdjustment)),
      connection: Math.max(0, Math.min(100, epcScores.connection + healthAdjustments.connectionAdjustment)),
    };

    const todayBurnout = calculateBurnoutFromScores(adjustedScores);
    const recentHistory = await Storage.getRecentBurnoutLevels(7);
    const { forecast } = generateSmartForecast(todayBurnout, recentHistory);

    // Store today's burnout for history
    await Storage.storeBurnoutHistory(todayBurnout);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data: ForecastDay[] = [];
    const today = new Date();

    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const percentage = Math.round(i === 0 ? todayBurnout : forecast[Math.min(i - 1, forecast.length - 1)]);
      
      data.push({
        day: days[date.getDay()],
        date: date.getDate().toString(),
        percentage,
        fullDate: date,
        icon: getBurnoutIcon(percentage),
        high: Math.min(100, percentage + Math.floor(Math.random() * 10 + 5)),
        low: Math.max(0, percentage - Math.floor(Math.random() * 10 + 5)),
      });
    }

    console.log('Extended forecast generated with Apple Health data:', {
      todayBurnout: Math.round(todayBurnout),
      healthAdjustments,
      appleHealthSummary: {
        sleep: `${appleHealthData.sleep.hoursSlept}h - ${appleHealthData.sleep.sleepQuality}`,
        activityRings: `${appleHealthData.activityRings.move.percentage}% • ${appleHealthData.activityRings.exercise.percentage}% • ${appleHealthData.activityRings.stand.percentage}%`,
        mood: `${appleHealthData.mood.currentMood} (Stress: ${appleHealthData.mood.stressLevel}/10)`,
      }
    });

    return data;
  } catch (error) {
    console.error('Error generating extended forecast:', error);
    return generateMockForecast();
  }
};

// Fallback mock data generation
const generateMockForecast = (): ForecastDay[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data: ForecastDay[] = [];
  const today = new Date();

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const percentage = Math.floor(Math.random() * 80) + 10;
    
    data.push({
      day: days[date.getDay()],
      date: date.getDate().toString(),
      percentage,
      fullDate: date,
      icon: getBurnoutIcon(percentage),
      high: Math.min(100, percentage + Math.floor(Math.random() * 10 + 5)),
      low: Math.max(0, percentage - Math.floor(Math.random() * 10 + 5)),
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

// Accurate minute-based tracking for Today tab
const generateTodayMinuteData = async (currentBurnout: number): Promise<BurnoutDataPoint[]> => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const data: BurnoutDataPoint[] = [];

    console.log(`📊 Generating minute data for current time: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);

    // Optimize data fetching: Get all hourly and minute data for today once
    const allHourlyData = await Storage.getTodayHourlyBurnoutData();
    console.log('DEBUG: All Hourly Data for Today:', allHourlyData);

    // Use the new efficient function to get all minute data for the day
    const allMinuteDataForToday = await Storage.getAllMinuteBurnoutDataForDay();
    console.log('DEBUG: All Minute Data for Today (optimized fetch):', allMinuteDataForToday);

    // Generate data points every minute for the entire day (1440 data points)
    let lastKnownBurnout: number = currentBurnout; // Carry-forward to avoid dips to 0 when data missing
    for (let totalMinutes = 0; totalMinutes < 1440; totalMinutes += 1) {
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      
      let burnoutValue: number | null = null;
      let label = '';

      // Format labels for key times
      if (minute === 0) {
        if (hour === 0) label = '12a';
        else if (hour < 12) label = `${hour}a`;
        else if (hour === 12) label = '12p';
        else label = `${hour - 12}p`;
      }

      // Determine burnout value for the current minute
      if (totalMinutes === currentTotalMinutes) {
        // For the current minute, use real-time data
        burnoutValue = currentBurnout;
        lastKnownBurnout = burnoutValue;
        console.log(`📊 Current minute ${hour}:${minute.toString().padStart(2, '0')} - Real-time: ${burnoutValue}%`);
      } else if (totalMinutes < currentTotalMinutes) {
        // For past minutes, try minute data first, then hourly fallback
        const storedMinuteData = allMinuteDataForToday[hour]?.[minute];
        if (storedMinuteData !== undefined) {
          burnoutValue = storedMinuteData;
          lastKnownBurnout = burnoutValue;
        } else {
          // Fallback to hourly data for that hour if minute data isn't available
          const hourlyData = allHourlyData[hour];
          if (hourlyData !== undefined) {
            burnoutValue = hourlyData;
            lastKnownBurnout = burnoutValue;
          } else {
            // If no data for a past minute, carry forward last known value to avoid zero dips
            burnoutValue = lastKnownBurnout;
          }
        }
      } else {
        // For future minutes, burnoutValue remains null, and hasData will be false
        burnoutValue = null; // Explicitly set to null for clarity
      }

      data.push({
        hour,
        minute, // Ensure minute is included
        value: burnoutValue === null ? 0 : burnoutValue, // 0 only for future
        label,
        hasData: burnoutValue !== null // hasData is false only for future minutes
      });
    }

    const dataPointsWithData = data.filter(d => d.hasData).length;
    console.log(`📊 Generated ${dataPointsWithData} data points up to current time ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    console.log('DEBUG: Full Minute Data for Today (before return):', data);
    
    return data;
  } catch (error) {
    console.error('Error generating today minute data:', error);
    return [];
  }
};

const generateWeeklyData = async (currentBurnout: number): Promise<BurnoutDataPoint[]> => {
  try {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const data: BurnoutDataPoint[] = [];
    const today = new Date();
    
    // Find the Sunday of the current week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
    const currentDayOfWeek = today.getDay(); 
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - currentDayOfWeek); // Set to Sunday of the current week

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i); // Iterate from Sunday to Saturday
      const dateString = date.toISOString().split('T')[0];
      const todayString = today.toISOString().split('T')[0]; // Get today's date string
      
      let burnoutValue: number | null = null;

      if (dateString === todayString) {
        // For the current day, use the live currentBurnout value
        burnoutValue = currentBurnout;
        console.log(`📊 Week day ${days[date.getDay()]} - Current burnout: ${burnoutValue}%`);
      } else {
        // For past days, get daily average burnout
        burnoutValue = await Storage.getDailyAverageBurnout(dateString);
      }
      
      if (burnoutValue !== null) {
        data.push({
          value: burnoutValue,
          label: days[date.getDay()],
          hasData: true
        });
        console.log(`📊 Week day ${days[date.getDay()]} - Average burnout: ${burnoutValue}%`);
      } else {
        data.push({
          value: 0,
          label: days[date.getDay()],
          hasData: false
        });
        console.log(`📊 Week day ${days[date.getDay()]} - No stored data (gap)`);
      }
    }
    
    console.log('DEBUG: Full Data for Week tab before setting state:', data); // Changed to log entire data array
    return data;
  } catch (error) {
    console.error('Error generating weekly data:', error);
    return [];
  }
};

const generateMonthlyData = async (): Promise<BurnoutDataPoint[]> => {
  try {
    // Get actual burnout history from storage
    const history = await Storage.getBurnoutHistory();
    const data: BurnoutDataPoint[] = [];
    
    // Get last 4 weeks of data (weekly averages)
    const today = new Date();
    const weekLabels = ['1', '8', '15', '22', '29'];
    
    for (let week = 4; week >= 0; week--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (week * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Find all data points in this week
      const weekData = history.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      if (weekData.length > 0) {
        // Calculate average for the week
        const average = weekData.reduce((sum, entry) => sum + entry.burnout, 0) / weekData.length;
        data.push({
          value: Math.round(average),
          label: weekLabels[4 - week],
          hasData: true
        });
        console.log(`📊 Month week ${weekLabels[4 - week]} - Average burnout: ${Math.round(average)}% (${weekData.length} days)`);
      } else {
        data.push({
          value: 0,
          label: weekLabels[4 - week],
          hasData: false
        });
        console.log(`📊 Month week ${weekLabels[4 - week]} - No stored data (gap)`);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error generating monthly data:', error);
    return [];
  }
};

const generateYearlyData = async (): Promise<BurnoutDataPoint[]> => {
  try {
    // Get actual burnout history from storage
    const history = await Storage.getBurnoutHistory();
    const data: BurnoutDataPoint[] = [];
    
    // Get last 12 months of data (monthly averages)
    const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const today = new Date();
    
    for (let month = 11; month >= 0; month--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - month, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - month + 1, 0);
      
      // Find all data points in this month
      const monthData = history.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });
      
      if (monthData.length > 0) {
        // Calculate average for the month
        const average = monthData.reduce((sum, entry) => sum + entry.burnout, 0) / monthData.length;
        data.push({
          value: Math.round(average),
          label: monthLabels[11 - month],
          hasData: true
        });
        console.log(`📊 Year month ${monthLabels[11 - month]} - Average burnout: ${Math.round(average)}% (${monthData.length} days)`);
      } else {
        data.push({
          value: 0,
          label: monthLabels[11 - month],
          hasData: false
        });
        console.log(`📊 Year month ${monthLabels[11 - month]} - No stored data (gap)`);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error generating yearly data:', error);
    return [];
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
  const [todayBurnout, setTodayBurnout] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Today');
  const [graphData, setGraphData] = useState<BurnoutDataPoint[]>([]);
  const [selectedDataIndex, setSelectedDataIndex] = useState(0);
  const [graphDataCache, setGraphDataCache] = useState<Record<string, BurnoutDataPoint[]>>({}); // New cache for graph data
  
  const router = useRouter();

  // Load initial data only once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await loadRadarData();
      // No need to call loadGraphData here, it will be called by its own effect
    };

    loadInitialData();
  }, []); // Empty dependency array means this effect runs only once on mount

  // Refresh data when EPC scores change (every 30 seconds for responsive updates)
  useEffect(() => {
    const interval = setInterval(() => {
      loadRadarData(false); // Refresh in background
      loadGraphData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Effect to load graph data whenever selectedPeriod or todayBurnout changes
  useEffect(() => {
    loadGraphData();
  }, [selectedPeriod, todayBurnout]);

  const loadRadarData = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      // Load EPC scores and extended forecast data
      const [scores, extendedForecast] = await Promise.all([
        Storage.getEPCScores(),
        generateExtendedForecast()
      ]);
      
      setEpcScores(scores);
      setForecastData(extendedForecast);
      
      if (scores) {
        // Use raw EPC scores for burnout calculation (same as home screen)
        const burnoutPercentage = calculateBurnoutFromScores(scores);
        setTodayBurnout(Math.round(burnoutPercentage));
        
        // Store burnout data with accurate timing
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Store hourly data (for Week tab daily averages)
        await Storage.storeHourlyBurnoutData(currentHour, burnoutPercentage);
        
        // Store minute-level data (for Today tab smooth plotting)
        await Storage.storeMinuteBurnoutData(currentMinute, burnoutPercentage);
        
        console.log(`📊 Data stored for ${currentHour}:${currentMinute.toString().padStart(2, '0')} = ${burnoutPercentage}%`);

        // Apply Apple Health adjustments for display purposes only (not for burnout calculation)
        const appleHealthData = await getAppleHealthDataOrMock();
        const healthAdjustments = convertAppleHealthToEPCAdjustments(appleHealthData);
        
        const adjustedScores = {
          energy: Math.max(0, Math.min(100, scores.energy + healthAdjustments.energyAdjustment)),
          purpose: Math.max(0, Math.min(100, scores.purpose + healthAdjustments.purposeAdjustment)),
          connection: Math.max(0, Math.min(100, scores.connection + healthAdjustments.connectionAdjustment)),
        };
        
        // Store adjusted scores for other purposes (forecast, etc.) but not for burnout
        console.log(`📊 Raw EPC burnout: ${burnoutPercentage}%, Adjusted EPC:`, adjustedScores);
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
      // Fallback to mock data
      setForecastData(generateMockForecast());
      setTodayBurnout(Math.floor(Math.random() * 80) + 10);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadRadarData();
    await loadGraphData();
  };

  const loadGraphData = async () => {
    try {
      const cachedData = graphDataCache[selectedPeriod];

      if (cachedData) {
        setGraphData(cachedData);
        // Set selected index immediately for cached data if applicable
        if (selectedPeriod === 'Today') {
          // Select the last minute that actually has data to avoid pointing at a future 0
          let lastHasDataIndex = 0;
          for (let i = cachedData.length - 1; i >= 0; i--) {
            if (cachedData[i].hasData) { lastHasDataIndex = i; break; }
          }
          setSelectedDataIndex(lastHasDataIndex);
        } else if (selectedPeriod === 'Week') {
          setSelectedDataIndex(new Date().getDay());
        } else if (selectedPeriod === 'Month') {
          setSelectedDataIndex(Math.floor(new Date().getDate() / 7));
        } else if (selectedPeriod === 'Year') {
          setSelectedDataIndex(new Date().getMonth());
        }
        console.log(`⚡ Instantly displaying cached data for ${selectedPeriod}`);
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
              // Select the last minute that actually has data to avoid future 0
              newSelectedIndex = 0;
              for (let i = fetchedData.length - 1; i >= 0; i--) {
                if (fetchedData[i].hasData) { newSelectedIndex = i; break; }
              }
              break;
            case 'Week':
              fetchedData = await generateWeeklyData(todayBurnout);
              newSelectedIndex = new Date().getDay();
              break;
            case 'Month':
              fetchedData = await generateMonthlyData();
              newSelectedIndex = Math.floor(new Date().getDate() / 7);
              break;
            case 'Year':
              fetchedData = await generateYearlyData();
              newSelectedIndex = new Date().getMonth();
              break;
            default:
              fetchedData = [];
          }

          // Only update state if data has changed or if it was not initially cached
          if (!cachedData || JSON.stringify(fetchedData) !== JSON.stringify(cachedData)) {
            setGraphDataCache(prevCache => ({
              ...prevCache,
              [selectedPeriod]: fetchedData,
            }));
            setGraphData(fetchedData);
            setSelectedDataIndex(newSelectedIndex); // Update selected index with fresh data
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
      console.error("Error loading graph data:", error);
      // If there was no cached data to display instantly, ensure graph is empty on error
      if (!graphDataCache[selectedPeriod]) {
        setGraphData([]);
      }
    }
  };

  // Effect to load graph data whenever selectedPeriod or todayBurnout changes
  useEffect(() => {
    loadGraphData();
  }, [selectedPeriod, todayBurnout]);

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
      case 'Year':
        return {
          subtitle: `This Year Average • ${selectedData.value}%`,
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
                {(['Today', 'Week', 'Month', 'Year'] as const).map((period) => (
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