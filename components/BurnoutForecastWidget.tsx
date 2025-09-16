import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getGreenToOrangeGradient } from '../utils/colorUtils';

const { width: screenWidth } = Dimensions.get('window');

interface ForecastDay {
  day: string;
  date: string;
  percentage: number;
  fullDate: Date;
  icon: string;
  high: number;
  low: number;
}

interface BurnoutForecastWidgetProps {
  data: ForecastDay[];
  onPress: () => void;
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

const BurnoutForecastWidget: React.FC<BurnoutForecastWidgetProps> = ({ data, onPress }) => {
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
            <View style={styles.forecastRow}>
              {/* Day */}
              <View style={styles.dayContainer}>
                <Text style={[styles.dayText, index === 0 && styles.todayText]}>
                  {index === 0 ? 'Today' : day.day}
                </Text>
              </View>

              {/* Ring indicator instead of emoji */}
              <View style={styles.ringContainer}>
                <BurnoutRing percentage={day.percentage} size={28} />
              </View>

              {/* Burnout percentage bar */}
              <View style={styles.burnoutContainer}>
                <View style={styles.burnoutBar}>
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
                <Text style={[styles.burnoutText, { color: getBurnoutColor(day.percentage) }]}>
                  {day.percentage}%
                </Text>
              </View>
            </View>
            
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
    borderRadius: 20,
    padding: 16,
    margin: 8, // Reduced from 16 to make card wider
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 12, // Reduced from 13 (5% smaller)
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  forecastList: {
    gap: 4, // Reduced from 8 to make rows slimmer
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6, // Reduced from 8 to make rows slimmer
    paddingHorizontal: 4,
  },
  dayContainer: {
    width: 60,
    alignItems: 'flex-start',
  },
  dayText: {
    fontSize: 17, // Increased from 15 to make it bigger
    fontWeight: '500',
    color: '#1C1C1E',
  },
  todayText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  ringContainer: {
    width: 36, // Reduced from 40 to match smaller ring size
    alignItems: 'center',
    marginLeft: 8,
  },
  burnoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  burnoutBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  burnoutFill: {
    height: '100%',
    borderRadius: 4,
  },
  burnoutText: {
    fontSize: 15, // Reduced from 16 (5% smaller)
    fontWeight: '600',
    width: 44,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 6, // Reduced from 8 to match slimmer row design
  },
});

export default BurnoutForecastWidget; 