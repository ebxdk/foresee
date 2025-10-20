import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ForecastInfluenceCards from '../components/ForecastInfluenceCards';
import { EPCScores } from '../utils/epcScoreCalc';
import { ForecastConfidence } from '../utils/forecastCalc';
import * as Storage from '../utils/storage';

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

export default function ForecastDetailsScreen() {
  const router = useRouter();
  const { dayIndex } = useLocalSearchParams();
  const selectedDayIndex = parseInt(dayIndex as string) || 0;
  
  const [epcScores, setEpcScores] = useState<EPCScores | null>(null);
  const [recentHistory, setRecentHistory] = useState<number[]>([]);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [currentBurnout, setCurrentBurnout] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    try {
      setIsLoading(true);
      
      const [scores, history] = await Promise.all([
        Storage.getEPCScores(),
        Storage.getRecentBurnoutLevels(7)
      ]);
      
      setEpcScores(scores);
      setRecentHistory(history);
      
      if (scores) {
        const burnout = calculateBurnoutFromScores(scores);
        setCurrentBurnout(burnout);
      }
      
      // Generate forecast data (simplified for this example)
      const forecast = await generateForecastData();
      setForecastData(forecast);
      
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateForecastData = async (): Promise<ForecastDay[]> => {
    // This would normally call your forecast generation function
    // For now, return mock data
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
    const today = new Date();
    
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      
      return {
        day,
        date: date.getDate().toString(),
        percentage: 45 + (index * 2) + Math.random() * 10,
        fullDate: date,
        icon: '🔥',
        high: 55 + (index * 2),
        low: 35 + (index * 2),
        confidence: Math.max(60, 100 - (index * 5)),
        uncertainty: 10 + (index * 2)
      };
    });
  };

  const calculateBurnoutFromScores = (scores: EPCScores): number => {
    // Simplified burnout calculation
    return (100 - scores.energy + 100 - scores.purpose + 100 - scores.connection) / 3;
  };

  const selectedDay = forecastData[selectedDayIndex];
  const forecastDay = selectedDayIndex;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading forecast details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedDay) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Forecast data not available</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedDay.day}</Text>
          <Text style={styles.headerSubtitle}>
            {selectedDay.fullDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Forecast Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Forecasted Burnout</Text>
          <Text style={styles.summaryValue}>{Math.round(selectedDay.percentage)}%</Text>
          <Text style={styles.summaryRange}>
            Range: {Math.round(selectedDay.low)}% - {Math.round(selectedDay.high)}%
          </Text>
          {selectedDay.confidence && (
            <Text style={styles.summaryConfidence}>
              Confidence: {selectedDay.confidence}%
            </Text>
          )}
        </View>

        {/* Dynamic Influence Cards */}
        {epcScores && (
          <ForecastInfluenceCards
            epcScores={epcScores}
            currentBurnout={currentBurnout}
            confidence={{
              score: selectedDay.confidence || 0,
              dataQuality: 'good' as const,
              daysAvailable: recentHistory.length,
              variance: 0,
              standardDeviation: 0
            }}
            recentHistory={recentHistory}
            forecastDay={forecastDay}
            selectedForecastDay={selectedDay}
          />
        )}

        {/* Additional Context */}
        <View style={styles.contextCard}>
          <Text style={styles.contextTitle}>Forecast Context</Text>
          <Text style={styles.contextText}>
            This prediction is based on your current EPC scores, recent burnout history, 
            and behavioral patterns. The influence factors above show what's most 
            relevant for this specific day.
          </Text>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  summaryRange: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryConfidence: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  contextCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contextTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  contextText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

