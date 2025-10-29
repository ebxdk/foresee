import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import components and utilities
import BurnoutGraphChart from '../components/BurnoutGraphChart';
import { getAppleHealthDataRealOnly } from '../utils/appleHealth';
import { calculateBurnoutFromScores } from '../utils/burnoutCalc';
import { getGreenToOrangeGradient } from '../utils/colorUtils';
import { generateSmartForecast } from '../utils/forecastCalc';
// Removed mock data imports - using real HealthKit only
import { getEPCScores, getRecentBurnoutLevels, storeBurnoutHistory } from '../utils/storage';

const { width: screenWidth } = Dimensions.get('window');

interface ForecastDay {
  day: string;
  date: string;
  percentage: number;
  fullDate: Date;
  month: string;
  dayOfWeek: string;
  epcScores?: {
    energy: number;
    purpose: number;
    connection: number;
  };
  biometricData?: {
    steps: number;
    sleep: number;
    heartRate: number;
    activeEnergy: number;
  };
}

// Add interface for graph data points
interface BurnoutDataPoint {
  hour?: number;
  minute?: number;
  day?: string;
  value: number;
  label: string;
  hasData: boolean;
}

// Generate extended 10-day forecast
const generateExtendedForecast = async (): Promise<ForecastDay[]> => {
  try {
    const epcScores = await getEPCScores();
    if (!epcScores) {
      return buildBaselineForecast();
    }

    let adjustedScores = { ...epcScores };

    try {
      const appleHealthData = await getAppleHealthDataRealOnly();
      if (appleHealthData.source === 'real' && appleHealthData.permissionsGranted) {
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
        console.log('📊 Burnout details using real HealthKit data for adjustments');
      } else {
        console.log('📊 Burnout details using baseline EPC (no real HealthKit data)');
      }
    } catch (error) {
      console.log('⚠️ Burnout details fallback to EPC scores only:', (error as Error).message);
    }

    const todayBurnout = calculateBurnoutFromScores(adjustedScores);
    const recentHistory = await getRecentBurnoutLevels(7);
    const { forecast } = generateSmartForecast(todayBurnout, recentHistory);

    await storeBurnoutHistory(todayBurnout);

    // Get biometric data for the forecast
    let biometricData = undefined;
    try {
      const appleHealthData = await getAppleHealthDataRealOnly();
      if (appleHealthData.source === 'real' && appleHealthData.permissionsGranted) {
        biometricData = {
          steps: appleHealthData.steps.count,
          sleep: appleHealthData.sleep.hoursSlept,
          heartRate: appleHealthData.heartRate.resting,
          activeEnergy: appleHealthData.activityRings.move.current,
        };
      }
    } catch (error) {
      // Biometric data not available
    }

    return buildForecastDays(todayBurnout, forecast, adjustedScores, biometricData);
  } catch (error) {
    console.error('Error generating extended forecast:', error);
    return buildBaselineForecast();
  }
};

const buildForecastDays = (
  todayBurnout: number, 
  forecast: number[], 
  epcScores?: { energy: number; purpose: number; connection: number },
  biometricData?: { steps: number; sleep: number; heartRate: number; activeEnergy: number }
): ForecastDay[] => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const truncatedForecast = forecast.slice(0, 9);
  const values = [todayBurnout, ...truncatedForecast];
  const startDate = new Date();

  return values.map((value, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const percentage = Math.round(Math.max(0, Math.min(100, value)));

    return {
      day: daysOfWeek[date.getDay()],
      date: date.getDate().toString(),
      percentage,
      fullDate: date,
      month: months[date.getMonth()],
      dayOfWeek: daysOfWeek[date.getDay()],
      // Only include EPC scores and biometric data for today (index 0)
      epcScores: index === 0 ? epcScores : undefined,
      biometricData: index === 0 ? biometricData : undefined,
    };
  });
};

const buildBaselineForecast = (): ForecastDay[] => {
  const baselineBurnout = 50;
  const baselineForecast = Array(9).fill(baselineBurnout);
  return buildForecastDays(baselineBurnout, baselineForecast);
};

// Replace generateHourlyDataForSelectedDay with the exact same data as radar page
const getRadarTodayGraphData = (): BurnoutDataPoint[] => [
  { hour: 0, minute: 0, value: 15, label: '12a', hasData: true },
  { hour: 1, minute: 0, value: 12, label: '1a', hasData: true },
  { hour: 2, minute: 0, value: 10, label: '2a', hasData: true },
  { hour: 3, minute: 0, value: 8, label: '3a', hasData: true },
  { hour: 4, minute: 0, value: 12, label: '4a', hasData: true },
  { hour: 5, minute: 0, value: 18, label: '5a', hasData: true },
  { hour: 6, minute: 0, value: 25, label: '6a', hasData: true },
  { hour: 7, minute: 0, value: 35, label: '7a', hasData: true },
  { hour: 8, minute: 0, value: 45, label: '8a', hasData: true },
  { hour: 9, minute: 0, value: 52, label: '9a', hasData: true },
  { hour: 10, minute: 0, value: 58, label: '10a', hasData: true },
  { hour: 11, minute: 0, value: 65, label: '11a', hasData: true },
  { hour: 12, minute: 0, value: 62, label: '12p', hasData: true },
  { hour: 13, minute: 0, value: 55, label: '1p', hasData: true },
  { hour: 14, minute: 0, value: 68, label: '2p', hasData: true },
  { hour: 15, minute: 0, value: 75, label: '3p', hasData: true },
  { hour: 16, minute: 0, value: 72, label: '4p', hasData: true },
  { hour: 17, minute: 0, value: 65, label: '5p', hasData: true },
  { hour: 18, minute: 0, value: 58, label: '6p', hasData: true },
  { hour: 19, minute: 0, value: 45, label: '7p', hasData: true },
  { hour: 20, minute: 0, value: 35, label: '8p', hasData: true },
  { hour: 21, minute: 0, value: 28, label: '9p', hasData: true },
  { hour: 22, minute: 0, value: 22, label: '10p', hasData: true },
  { hour: 23, minute: 0, value: 18, label: '11p', hasData: true }
];

// Component for individual day content
const DayContent = React.memo(({ 
  day, 
  selectedDataIndex, 
  onDataPointPress, 
  selectedPeriod 
}: { 
  day: ForecastDay; 
  selectedDataIndex: number; 
  onDataPointPress: (index: number) => void; 
  selectedPeriod: 'Today' | 'Week' | 'Month' | 'Year';
}) => {
  const graphData = getRadarTodayGraphData();
  const currentHourData = graphData[selectedDataIndex];
  const currentValue = currentHourData?.value || day.percentage;

  const getBurnoutStatus = (percentage: number) => {
    if (percentage <= 30) return 'Low Risk';
    if (percentage <= 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const getBurnoutColor = (percentage: number) => {
    return getGreenToOrangeGradient(percentage);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.dayContentContainer}>
      {/* Burnout Graph Display */}
      <View style={styles.graphSection}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>
            {formatDate(day.fullDate)}
          </Text>
          <Text style={styles.graphSubtitle}>
            Current Hour • {currentValue}% • 
            <Text style={{ color: getBurnoutColor(currentValue) }}>
              {' '}{getBurnoutStatus(currentValue)}
            </Text>
          </Text>
        </View>
        <BurnoutGraphChart
          data={graphData}
          selectedPeriod={selectedPeriod}
          selectedIndex={selectedDataIndex}
          onDataPointPress={onDataPointPress}
        />
      </View>

      {/* Forecast Reasoning Sections */}
      <View style={styles.reasoningSection}>
        <Text style={styles.reasoningTitle}>What's Influencing This Forecast</Text>
        
        {/* EPC Scores Card */}
        {day.epcScores && (
          <View style={styles.reasonCard}>
            <View style={styles.reasonHeader}>
              <Text style={styles.reasonIcon}>📊</Text>
              <Text style={styles.reasonCardTitle}>EPC Score Breakdown</Text>
              <Text style={styles.reasonImpact}>{day.percentage}%</Text>
            </View>
            <Text style={styles.reasonDescription}>
              Your current Energy, Purpose, and Connection scores are the primary factors in your burnout forecast.
            </Text>
            <View style={styles.reasonMetrics}>
              <Text style={styles.reasonMetric}>⚡ Energy: {Math.round(day.epcScores.energy)}</Text>
              <Text style={styles.reasonMetric}>🎯 Purpose: {Math.round(day.epcScores.purpose)}</Text>
              <Text style={styles.reasonMetric}>🤝 Connection: {Math.round(day.epcScores.connection)}</Text>
            </View>
          </View>
        )}

        {/* Sleep Quality - Only show if biometric data available */}
        {day.biometricData && day.biometricData.sleep > 0 && (
          <View style={styles.reasonCard}>
            <View style={styles.reasonHeader}>
              <Text style={styles.reasonIcon}>😴</Text>
              <Text style={styles.reasonCardTitle}>Sleep Quality</Text>
              <Text style={[styles.reasonImpact, { color: day.biometricData.sleep >= 7 ? '#34C759' : day.biometricData.sleep >= 6 ? '#FF9500' : '#FF3B30' }]}>
                {day.biometricData.sleep >= 7 ? '+5%' : day.biometricData.sleep >= 6 ? '±0%' : '-5%'}
              </Text>
            </View>
            <Text style={styles.reasonDescription}>
              {day.biometricData.sleep >= 8 
                ? 'Excellent sleep (8+ hours) is helping reduce your burnout risk significantly.' 
                : day.biometricData.sleep >= 7
                ? 'Good sleep (7+ hours) is supporting your energy levels.'
                : day.biometricData.sleep >= 6
                ? 'Sleep is adequate but could be improved for better energy levels.'
                : 'Poor sleep (<6 hours) is significantly increasing your burnout risk.'}
            </Text>
            <View style={styles.reasonMetrics}>
              <Text style={styles.reasonMetric}>Sleep: {day.biometricData.sleep.toFixed(1)} hrs</Text>
              <Text style={styles.reasonMetric}>Quality: {day.biometricData.sleep >= 8 ? 'Excellent' : day.biometricData.sleep >= 7 ? 'Good' : day.biometricData.sleep >= 6 ? 'Fair' : 'Poor'}</Text>
            </View>
          </View>
        )}

        {/* Activity Levels - Steps */}
        {day.biometricData && day.biometricData.steps > 0 && (
          <View style={styles.reasonCard}>
            <View style={styles.reasonHeader}>
              <Text style={styles.reasonIcon}>👟</Text>
              <Text style={styles.reasonCardTitle}>Activity Level</Text>
              <Text style={[styles.reasonImpact, { color: day.biometricData.steps >= 10000 ? '#34C759' : day.biometricData.steps >= 5000 ? '#FF9500' : '#FF3B30' }]}>
                {day.biometricData.steps >= 10000 ? '+5%' : day.biometricData.steps >= 5000 ? '±0%' : '-5%'}
              </Text>
            </View>
            <Text style={styles.reasonDescription}>
              {day.biometricData.steps >= 10000
                ? 'Great activity! 10,000+ steps helps boost energy and reduce burnout.'
                : day.biometricData.steps >= 5000
                ? 'Moderate activity. Consider adding more movement to boost energy.'
                : 'Low activity (<5,000 steps) is contributing to lower energy levels.'}
            </Text>
            <View style={styles.reasonMetrics}>
              <Text style={styles.reasonMetric}>Steps: {day.biometricData.steps.toLocaleString()}</Text>
              <Text style={styles.reasonMetric}>Active Energy: {Math.round(day.biometricData.activeEnergy)} kcal</Text>
            </View>
          </View>
        )}

        {/* Heart Rate - Health Status */}
        {day.biometricData && day.biometricData.heartRate > 0 && (
          <View style={styles.reasonCard}>
            <View style={styles.reasonHeader}>
              <Text style={styles.reasonIcon}>❤️</Text>
              <Text style={styles.reasonCardTitle}>Heart Rate & Fitness</Text>
              <Text style={[styles.reasonImpact, { color: day.biometricData.heartRate < 60 ? '#34C759' : day.biometricData.heartRate <= 80 ? '#FF9500' : '#FF3B30' }]}>
                {day.biometricData.heartRate < 60 ? '+3%' : day.biometricData.heartRate <= 80 ? '±0%' : '-3%'}
              </Text>
            </View>
            <Text style={styles.reasonDescription}>
              {day.biometricData.heartRate < 60
                ? 'Low resting heart rate indicates excellent fitness and helps maintain high energy.'
                : day.biometricData.heartRate <= 80
                ? 'Resting heart rate is in the normal range.'
                : 'Elevated resting heart rate (>80 bpm) may indicate stress or lower fitness, affecting energy.'}
            </Text>
            <View style={styles.reasonMetrics}>
              <Text style={styles.reasonMetric}>Resting HR: {day.biometricData.heartRate} bpm</Text>
              <Text style={styles.reasonMetric}>Status: {day.biometricData.heartRate < 60 ? 'Excellent' : day.biometricData.heartRate <= 80 ? 'Normal' : 'Elevated'}</Text>
            </View>
          </View>
        )}

        {/* Fallback for future days or no data */}
        {!day.epcScores && !day.biometricData && (
          <View style={styles.reasonCard}>
            <View style={styles.reasonHeader}>
              <Text style={styles.reasonIcon}>🔮</Text>
              <Text style={styles.reasonCardTitle}>Forecast Prediction</Text>
              <Text style={styles.reasonImpact}>{day.percentage}%</Text>
            </View>
            <Text style={styles.reasonDescription}>
              This forecast is based on your recent burnout history and trends. Actual data will be available once biometric tracking is active.
            </Text>
            <View style={styles.reasonMetrics}>
              <Text style={styles.reasonMetric}>Status: Predicted</Text>
              <Text style={styles.reasonMetric}>Confidence: Medium</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
});

export default function BurnoutDetailsScreen() {
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Today');
  const [selectedDataIndex, setSelectedDataIndex] = useState(12); // Default to noon
  const router = useRouter();

  // Animation values for continuous scrolling
  const scrollX = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const horizontalScrollViewRef = React.useRef<ScrollView>(null);
  const isProgrammaticScroll = useSharedValue(false);

  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    try {
      setIsLoading(true);
      const data = await generateExtendedForecast();
      setForecastData(data);
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataPointPress = (index: number) => {
    setSelectedDataIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle scroll events for continuous scrolling
  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    scrollX.value = contentOffset.x;
    
    // Only update selected day if it's not a programmatic scroll
    if (!isProgrammaticScroll.value) {
      const pageIndex = Math.round(contentOffset.x / screenWidth);
      if (pageIndex !== selectedDayIndex && pageIndex >= 0 && pageIndex < forecastData.length) {
        setSelectedDayIndex(pageIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [selectedDayIndex, forecastData.length]);

  // Function to scroll to specific day
  const scrollToDay = useCallback((dayIndex: number) => {
    if (horizontalScrollViewRef.current && dayIndex >= 0 && dayIndex < forecastData.length) {
      // Set flag to prevent scroll events from updating selected day during animation
      isProgrammaticScroll.value = true;
      
      // Scroll to the target page
      horizontalScrollViewRef.current.scrollTo({
        x: dayIndex * screenWidth,
        animated: true,
      });
      
      // Update selected day after a short delay to allow scroll animation to complete
      setTimeout(() => {
        setSelectedDayIndex(dayIndex);
        isProgrammaticScroll.value = false;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 300); // Match the scroll animation duration
    }
  }, [forecastData.length]);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading forecast...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!forecastData.length) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load forecast data</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Forecast Details</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Static Day Selector - No Animation */}
        <View style={styles.daySelector}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.daysScrollView}
            contentContainerStyle={styles.daysContainer}
          >
            {forecastData.map((day, index) => {
              const dayLetter = day.day.charAt(0);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.dayItem}
                  onPress={() => scrollToDay(index)}
                >
                  <Text style={styles.dayLetter}>
                    {dayLetter}
                  </Text>
                  <View style={[
                    styles.dayNumberContainer,
                    index === selectedDayIndex && styles.selectedDayNumberContainer
                  ]}>
                    <Text style={[
                      styles.dayNumber,
                      index === selectedDayIndex && styles.selectedDayNumber
                    ]}>
                      {day.date}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Continuous Horizontal Scroll View */}
        <ScrollView
          ref={horizontalScrollViewRef}
          horizontal
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.horizontalScrollView}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {forecastData.map((day, index) => (
            <View key={index} style={styles.dayPageContainer}>
              <ScrollView 
                style={styles.dayPageScrollView}
                contentContainerStyle={styles.dayPageScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
              >
                <DayContent
                  day={day}
                  selectedDataIndex={selectedDataIndex}
                  onDataPointPress={handleDataPointPress}
                  selectedPeriod={selectedPeriod}
                />
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerSpacer: {
    width: 32,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  daySelector: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
    paddingVertical: 16,
    marginBottom: 0,
    marginTop: -8,
  },
  daysScrollView: {
    marginBottom: 0,
  },
  daysContainer: {
    paddingHorizontal: 20,
    gap: 5,
    justifyContent: 'space-between',
    minWidth: screenWidth - 40,
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 12,
    minWidth: 44,
  },
  dayLetter: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 10,
    textAlign: 'center',
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayNumberContainer: {
    backgroundColor: '#5AC8FA',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  selectedDayNumber: {
    color: '#FFFFFF',
  },
  selectedDateDisplay: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    textAlign: 'center',
    marginTop: 4,
  },
  horizontalScrollView: {
    flex: 1,
  },
  horizontalScrollContent: {
    // No additional styling needed for continuous scrolling
  },
  dayPageContainer: {
    width: screenWidth,
    flex: 1,
  },
  dayPageScrollView: {
    flex: 1,
  },
  dayPageScrollContent: {
    paddingTop: 16,
    paddingBottom: 44,
  },
  dayContentContainer: {
    flex: 1,
  },
  graphSection: {
    marginBottom: 20,
    marginHorizontal: 0,
    padding: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  graphHeader: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  graphTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  reasoningSection: {
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  reasoningTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  reasonCard: {
    backgroundColor: '#FFFCF0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reasonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  reasonCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  reasonImpact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  reasonDescription: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 12,
  },
  reasonMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  reasonMetric: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
}); 
