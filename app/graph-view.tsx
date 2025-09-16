import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { getGreenToOrangeGradient } from '../utils/colorUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Type definitions
interface HourlyData {
  hour: number;
  percentage: number;
}

interface DayData {
  day: string;
  date: string;
  fullDate: Date;
  dayName: string;
  hourlyData: HourlyData[];
  averagePercentage: number;
}

// Generate hourly burnout data for a single day
const generateHourlyData = (): HourlyData[] => {
  const hourlyData: HourlyData[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    let percentage = 0;
    
    // Create realistic burnout patterns throughout the day
    if (hour >= 0 && hour <= 6) {
      // Night/early morning - low burnout (rest period)
      percentage = Math.random() * 20 + 5; // 5-25%
    } else if (hour >= 7 && hour <= 9) {
      // Morning - gradually increasing
      percentage = Math.random() * 30 + 20; // 20-50%
    } else if (hour >= 10 && hour <= 12) {
      // Late morning - moderate to high
      percentage = Math.random() * 40 + 40; // 40-80%
    } else if (hour >= 13 && hour <= 14) {
      // Lunch time - slight dip
      percentage = Math.random() * 25 + 30; // 30-55%
    } else if (hour >= 15 && hour <= 17) {
      // Afternoon peak - highest burnout
      percentage = Math.random() * 30 + 60; // 60-90%
    } else if (hour >= 18 && hour <= 20) {
      // Evening - declining
      percentage = Math.random() * 35 + 35; // 35-70%
    } else if (hour >= 21 && hour <= 23) {
      // Night - winding down
      percentage = Math.random() * 25 + 15; // 15-40%
    }
    
    hourlyData.push({ hour, percentage: Math.round(percentage) });
  }
  
  return hourlyData;
};

// Generate 14 days of mock data starting from current day
const generateMockData = (): DayData[] => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const data: DayData[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const hourlyData = generateHourlyData();
    const averagePercentage = Math.round(
      hourlyData.reduce((sum, hour) => sum + hour.percentage, 0) / hourlyData.length
    );
    
    data.push({
      day: shortDays[date.getDay()],
      date: date.getDate().toString(),
      fullDate: date,
      dayName: days[date.getDay()],
      hourlyData,
      averagePercentage,
    });
  }
  
  return data;
};

const mockBurnoutData = generateMockData();

// Color utility function
const getBurnoutColor = (percentage: number) => {
  return getGreenToOrangeGradient(percentage);
};

const getBurnoutStatus = (percentage: number) => {
  if (percentage <= 30) return 'Low Risk';
  if (percentage <= 60) return 'Moderate Risk';
  return 'High Risk';
};

// Clean, simple bar chart
const SimpleBarChart = ({ data, selectedHour, onHourSelect }: { 
  data: HourlyData[], 
  selectedHour: number,
  onHourSelect: (hour: number) => void 
}) => {
  const chartWidth = screenWidth - 48;
  const chartHeight = 320;
  const padding = 24;
  const barWidth = (chartWidth - 2 * padding) / data.length * 0.75;
  const barSpacing = (chartWidth - 2 * padding) / data.length;
  
  const handleBarPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onHourSelect(index);
  };
  
  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
        {data.map((item, index) => {
          const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
          const barHeight = ((item.percentage / 100) * (chartHeight - 2 * padding));
          const y = chartHeight - padding - barHeight;
          const isSelected = index === selectedHour;
          
          return (
            <Rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              fill={getBurnoutColor(item.percentage)}
              rx="2"
              opacity={isSelected ? 1 : 0.7}
              onPress={() => handleBarPress(index)}
            />
          );
        })}
      </Svg>
      
      {/* Touch overlay */}
      <View style={styles.touchOverlay}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.touchZone, { width: barSpacing }]}
            onPress={() => handleBarPress(index)}
          />
        ))}
      </View>
      
      {/* Simple hour labels */}
      <View style={styles.hourLabels}>
        <Text style={styles.hourLabel}>12a</Text>
        <Text style={styles.hourLabel}>6a</Text>
        <Text style={styles.hourLabel}>12p</Text>
        <Text style={styles.hourLabel}>6p</Text>
        <Text style={styles.hourLabel}>12a</Text>
      </View>
    </View>
  );
};

export default function GraphViewScreen() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedHour, setSelectedHour] = useState(12);
  const router = useRouter();
  
  const selectedDay = mockBurnoutData[selectedDayIndex];
  const currentHourData = selectedDay.hourlyData[selectedHour];
  const burnoutColor = getBurnoutColor(currentHourData.percentage);
  const burnoutStatus = getBurnoutStatus(currentHourData.percentage);

  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour);
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
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
    <SafeAreaView style={styles.container}>
      {/* Simple header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.back();
          }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hourly Breakdown</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Day selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}
        >
          {mockBurnoutData.map((day, index) => {
            const isSelected = index === selectedDayIndex;
            const isToday = index === 0;
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDayIndex(index);
                }}
              >
                <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                  {day.day}
                </Text>
                <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                  {day.date}
                </Text>
                {isToday && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Date and selected hour info */}
        <View style={styles.infoSection}>
          <Text style={styles.dateTitle}>{formatDate(selectedDay.fullDate)}</Text>
          <Text style={styles.selectedHourInfo}>
            {formatHour(selectedHour)} • {currentHourData.percentage}% • 
            <Text style={{ color: burnoutColor }}> {burnoutStatus}</Text>
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartSection}>
          <SimpleBarChart 
            data={selectedDay.hourlyData} 
            selectedHour={selectedHour}
            onHourSelect={handleHourSelect}
          />
        </View>

        {/* Simple stats */}
        <View style={styles.statsSection}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{selectedDay.averagePercentage}%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Peak</Text>
            <Text style={styles.statValue}>{Math.max(...selectedDay.hourlyData.map(h => h.percentage))}%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Lowest</Text>
            <Text style={styles.statValue}>{Math.min(...selectedDay.hourlyData.map(h => h.percentage))}%</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '400',
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    width: 44,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Day selector
  daySelector: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 50,
    position: 'relative',
  },
  dayItemSelected: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 2,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF3B30',
  },
  
  // Info section
  infoSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  selectedHourInfo: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  
  // Chart section
  chartSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
  },
  chart: {
    // No additional styles needed
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 320,
    flexDirection: 'row',
  },
  touchZone: {
    height: '100%',
  },
  hourLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  hourLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  
  // Stats section
  statsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
}); 