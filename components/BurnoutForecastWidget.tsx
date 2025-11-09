import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getGreenToOrangeGradient } from '../utils/colorUtils';
import { RFValue, moderateScale, scale, verticalScale } from '../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

interface ForecastDay {
  day: string;
  date: string;
  percentage: number;
  fullDate: Date;
  icon: string;
  high: number;
  low: number;
  confidence?: number;
  uncertainty?: number;
}

interface BurnoutForecastWidgetProps {
  data: ForecastDay[];
  onPress: () => void;
  onDayPress?: (dayIndex: number) => void;
}

// Small ring component for each forecast day
const BurnoutRing: React.FC<{ percentage: number; size: number }> = ({ percentage, size }) => {
  const strokeWidth = 7; // Adjusted from 8 for smaller ring size
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getBurnoutColor = (percentage: number) => {
    return getGreenToOrangeGradient(percentage);
  };

  const color = getBurnoutColor(percentage);

  return (
    <Svg width={size} height={size}>
      {/* Background ring */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E5EA"
        strokeWidth={strokeWidth}
        fill="transparent"
        opacity={0.3}
      />
      
      {/* Progress ring */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

const BurnoutForecastWidget: React.FC<BurnoutForecastWidgetProps> = ({ data, onPress, onDayPress }) => {
  const getBurnoutColor = (percentage: number) => {
    return getGreenToOrangeGradient(percentage);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  // Show only first 10 days
  const forecastData = data.slice(0, 10);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>10-DAY FORECAST</Text>
      </View>

      {/* Forecast List */}
      <View style={styles.forecastList}>
        {forecastData.map((day, index) => (
          <View key={index}>
            <TouchableOpacity 
              style={styles.forecastRow}
              onPress={() => onDayPress?.(index)}
              activeOpacity={0.7}
            >
              {/* Day */}
              <View style={styles.dayContainer}>
                <Text style={[styles.dayText, index === 0 && styles.todayText]}>
                  {index === 0 ? 'Today' : day.day}
                </Text>
              </View>

              {/* Ring indicator instead of emoji */}
              <View style={styles.ringContainer}>
                <BurnoutRing percentage={day.percentage} size={scale(28)} />
              </View>

              {/* Burnout percentage bar with confidence indicators */}
              <View style={styles.burnoutContainer}>
                <View style={styles.burnoutBar}>
                  {/* Confidence interval background */}
                  {day.high && day.low && (
                    <View 
                      style={[
                        styles.confidenceInterval,
                        { 
                          left: `${day.low}%`,
                          width: `${day.high - day.low}%`,
                          backgroundColor: getBurnoutColor(day.percentage) + '20'
                        }
                      ]} 
                    />
                  )}
                  
                  {/* Main forecast bar */}
                  <View 
                    style={[
                      styles.burnoutFill,
                      { 
                        width: `${day.percentage}%`,
                        backgroundColor: getBurnoutColor(day.percentage)
                      }
                    ]} 
                  />
                </View>
                
                {/* Burnout percentage */}
                <View style={styles.percentageContainer}>
                  <Text style={[styles.burnoutText, { color: getBurnoutColor(day.percentage) }]}>
                    {day.percentage}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Light grey divider between items (except last item) */}
            {index < forecastData.length - 1 && (
              <View style={styles.divider} />
            )}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: scale(16),
    margin: scale(8), // Reduced from 16 to make card wider
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Keep fixed for shadows
    shadowOpacity: 0.08, // Keep fixed
    shadowRadius: 12, // Keep fixed
    elevation: 4, // Keep fixed
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    paddingBottom: verticalScale(8),
    borderBottomWidth: 0.5, // Keep fixed for hairlines
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: RFValue(12), // Reduced from 13 (5% smaller)
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5, // Keep fixed
  },
  forecastList: {
    gap: verticalScale(4), // Reduced from 8 to make rows slimmer
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(6), // Reduced from 8 to make rows slimmer
    paddingHorizontal: scale(4),
  },
  dayContainer: {
    width: scale(60),
    alignItems: 'flex-start',
  },
  dayText: {
    fontSize: RFValue(17), // Increased from 15 to make it bigger
    fontWeight: '500',
    color: '#1C1C1E',
  },
  todayText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  ringContainer: {
    width: scale(32),
    alignItems: 'center',
    marginLeft: scale(4),
  },
  burnoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: scale(8),
  },
  burnoutBar: {
    flex: 1,
    height: verticalScale(8),
    backgroundColor: '#E5E5EA',
    borderRadius: 4, // Keep small radius fixed
    marginRight: scale(12),
    overflow: 'hidden',
    position: 'relative',
  },
  confidenceInterval: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4, // Keep small radius fixed
    opacity: 0.3, // Keep fixed
  },
  burnoutFill: {
    height: '100%',
    borderRadius: 4, // Keep small radius fixed
    position: 'relative',
    zIndex: 1,
  },
  percentageContainer: {
    alignItems: 'flex-end',
    minWidth: scale(60),
  },
  burnoutText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    textAlign: 'right',
  },
  divider: {
    height: 1, // Keep hairline fixed
    backgroundColor: '#E5E5EA',
    marginVertical: verticalScale(6), // Reduced from 8 to match slimmer row design
  },
});

export default BurnoutForecastWidget; 
