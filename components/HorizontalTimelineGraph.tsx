import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { RFValue, moderateScale, scale, verticalScale } from '../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

interface TimelineDataPoint {
  hour: number;
  value: number; // Stress/burnout intensity (0-100)
  type: 'rest' | 'light' | 'moderate' | 'intense';
  stressLevel?: number;
  workloadIntensity?: number;
}

interface HorizontalTimelineGraphProps {
  data: TimelineDataPoint[];
  maxValue?: number;
  height?: number;
  showHours?: boolean;
  showMetrics?: boolean;
}

const HorizontalTimelineGraph: React.FC<HorizontalTimelineGraphProps> = ({
  data,
  maxValue = 100,
  height = 160,
  showHours = true,
  showMetrics = true,
}) => {
  const chartWidth = screenWidth - 88; // Account for card padding
  const chartHeight = 100; // Fixed chart height
  const barWidth = 3;
  const barSpacing = (chartWidth - (24 * barWidth)) / 23;

  // Generate realistic 24-hour stress/burnout data
  const generateRealisticDayData = (): TimelineDataPoint[] => {
    const fullDayData: TimelineDataPoint[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const existingData = data.find(d => d.hour === hour);
      if (existingData) {
        fullDayData.push(existingData);
      } else {
        const stressPatterns = getStressLevelForHour(hour);
        fullDayData.push({
          hour,
          value: stressPatterns.value,
          type: stressPatterns.type,
          stressLevel: stressPatterns.stressLevel,
          workloadIntensity: stressPatterns.workloadIntensity,
        });
      }
    }
    
    return fullDayData;
  };

  const getStressLevelForHour = (hour: number) => {
    // Sleep period (11 PM - 6 AM) - minimal stress
    if (hour >= 23 || hour <= 5) {
      return {
        value: Math.random() * 10 + 5,
        type: 'rest' as const,
        stressLevel: Math.floor(Math.random() * 2 + 1),
        workloadIntensity: 0,
      };
    }
    
    // Early morning (6-8 AM) - building stress
    if (hour >= 6 && hour <= 8) {
      return {
        value: Math.random() * 25 + 20,
        type: 'light' as const,
        stressLevel: Math.floor(Math.random() * 3 + 2),
        workloadIntensity: Math.floor(Math.random() * 3 + 1),
      };
    }

    // Morning work (9-11 AM) - moderate stress buildup
    if (hour >= 9 && hour <= 11) {
      return {
        value: Math.random() * 35 + 35,
        type: 'moderate' as const,
        stressLevel: Math.floor(Math.random() * 4 + 4),
        workloadIntensity: Math.floor(Math.random() * 4 + 3),
      };
    }

    // Lunch time (12-1 PM) - variable stress
    if (hour >= 12 && hour <= 13) {
      return {
        value: Math.random() * 30 + 25,
        type: 'moderate' as const,
        stressLevel: Math.floor(Math.random() * 3 + 3),
        workloadIntensity: Math.floor(Math.random() * 3 + 2),
      };
    }

    // Afternoon peak (2-5 PM) - highest stress/burnout risk
    if (hour >= 14 && hour <= 17) {
      return {
        value: Math.random() * 30 + 70,
        type: 'intense' as const,
        stressLevel: Math.floor(Math.random() * 3 + 7),
        workloadIntensity: Math.floor(Math.random() * 3 + 7),
      };
    }

    // Early evening (6-8 PM) - winding down but still elevated
    if (hour >= 18 && hour <= 20) {
      return {
        value: Math.random() * 40 + 30,
        type: 'moderate' as const,
        stressLevel: Math.floor(Math.random() * 4 + 4),
        workloadIntensity: Math.floor(Math.random() * 4 + 3),
      };
    }

    // Wind down (9-10 PM) - decreasing stress
    return {
      value: Math.random() * 25 + 15,
      type: 'light' as const,
      stressLevel: Math.floor(Math.random() * 3 + 2),
      workloadIntensity: Math.floor(Math.random() * 3 + 1),
    };
  };

  const fullDayData = generateRealisticDayData();

  const formatTimeLabel = (hour: number): string => {
    if (hour === 0) return '12:00';
    if (hour === 6) return '6:00';
    if (hour === 12) return '12:00';
    if (hour === 18) return '6:00';
    return '';
  };

  const avgStressLevel = Math.round(
    fullDayData.reduce((sum, point) => sum + (point.stressLevel || 0), 0) / fullDayData.length
  );

  const peakStressHour = fullDayData.reduce((max, point) => 
    point.value > max.value ? point : max
  ).hour;

  // Get the maximum value for proper scaling
  const actualMaxValue = Math.max(...fullDayData.map(p => p.value));

  return (
    <View style={styles.container}>
      {/* Chart with bars */}
      <View style={styles.chartContainer}>
        {/* Stress level indicator */}
        <View style={styles.chartHeader}>
          <Text style={styles.activityLevel}>STRESS LEVEL</Text>
        </View>

        {/* Dotted grid lines */}
        <View style={styles.gridContainer}>
          {[...Array(3)].map((_, index) => (
            <View key={index} style={styles.gridLine} />
          ))}
        </View>

        {/* Bars container */}
        <View style={styles.barsContainer}>
          {fullDayData.map((point, index) => {
            const barHeight = Math.max(
              2,
              (point.value / actualMaxValue) * chartHeight * 0.8
            );
            const leftPosition = index * (barWidth + barSpacing);

            return (
              <View
                key={index}
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    width: barWidth,
                    left: leftPosition,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Time labels */}
        {showHours && (
          <View style={styles.timeLabels}>
            {[0, 6, 12, 18].map((hour) => {
              const position = hour * (barWidth + barSpacing) - 12;
              return (
                <View
                  key={hour}
                  style={[
                    styles.timeLabel,
                    {
                      left: Math.max(0, Math.min(position, chartWidth - 24)),
                    },
                  ]}
                >
                  <Text style={styles.timeLabelText}>{formatTimeLabel(hour)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Stress metrics at bottom */}
      {showMetrics && (
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{avgStressLevel.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>AVG STRESS</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatTimeLabel(peakStressHour) || `${peakStressHour}:00`}</Text>
              <Text style={styles.metricLabel}>PEAK TIME</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{fullDayData.filter(p => p.value > 60).length}</Text>
              <Text style={styles.metricLabel}>HIGH STRESS HRS</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: scale(20),
    marginHorizontal: scale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Keep fixed
    shadowOpacity: 0.08, // Keep fixed
    shadowRadius: 12, // Keep fixed
    elevation: 4, // Keep fixed
  },
  chartContainer: {
    position: 'relative',
    height: verticalScale(140),
    marginBottom: verticalScale(16),
  },
  chartHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2, // Keep fixed
  },
  activityLevel: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5, // Keep fixed
  },
  gridContainer: {
    position: 'absolute',
    top: verticalScale(20),
    left: 0,
    right: 0,
    height: verticalScale(80),
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1, // Keep fixed
    backgroundColor: '#F2F2F7',
  },
  barsContainer: {
    position: 'absolute',
    top: verticalScale(25),
    left: 0,
    right: 0,
    height: verticalScale(100),
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    position: 'absolute',
    backgroundColor: '#FF453A',
    borderRadius: 1.5, // Keep small radius fixed
    bottom: verticalScale(20), // Leave space for time labels
    shadowColor: '#FF453A',
    shadowOffset: { width: 0, height: 1 }, // Keep fixed
    shadowOpacity: 0.2, // Keep fixed
    shadowRadius: 2, // Keep fixed
    elevation: 2, // Keep fixed
  },
  timeLabels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(16),
    flexDirection: 'row',
  },
  timeLabel: {
    position: 'absolute',
    width: scale(24),
    alignItems: 'center',
  },
  timeLabelText: {
    fontSize: RFValue(10),
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: 0.1, // Keep fixed
  },
  metricsContainer: {
    paddingTop: verticalScale(12),
    borderTopWidth: 1, // Keep fixed
    borderTopColor: '#F2F2F7',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#FF453A',
    letterSpacing: -0.3, // Keep fixed
  },
  metricLabel: {
    fontSize: RFValue(9),
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: verticalScale(2),
    letterSpacing: 0.4, // Keep fixed
  },
});

export default HorizontalTimelineGraph; 