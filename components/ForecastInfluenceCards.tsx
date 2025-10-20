import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EPCScores } from '../utils/epcScoreCalc';
import { ForecastConfidence } from '../utils/forecastCalc';

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

interface ForecastInfluenceCardsProps {
  epcScores: EPCScores | null;
  currentBurnout: number;
  confidence: ForecastConfidence;
  recentHistory: number[];
  forecastDay?: number; // Which day in the forecast (0 = today, 1 = tomorrow, etc.)
  selectedForecastDay?: ForecastDay; // The specific forecast day data
}

interface InfluenceCard {
  title: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number; // 0-100, how much this factor influences the forecast
}

const ForecastInfluenceCards: React.FC<ForecastInfluenceCardsProps> = ({
  epcScores,
  currentBurnout,
  confidence,
  recentHistory,
  forecastDay = 0,
  selectedForecastDay
}) => {
  
  const getInfluenceCards = (): InfluenceCard[] => {
    const cards: InfluenceCard[] = [];
    
    if (!epcScores) {
      return [{
        title: 'Limited Data',
        value: 'Insufficient',
        impact: 'neutral',
        description: 'Need more EPC assessments for accurate forecasting',
        weight: 0
      }];
    }

    // Dynamic factor selection based on forecast day and data patterns
    const isToday = forecastDay === 0;
    const isNearTerm = forecastDay <= 2;
    const isLongTerm = forecastDay >= 7;
    
    // 1. Current State (always relevant for today, less for future)
    if (isToday || isNearTerm) {
      const burnoutLevel = currentBurnout;
      const burnoutImpact = burnoutLevel > 70 ? 'negative' : burnoutLevel < 30 ? 'positive' : 'neutral';
      cards.push({
        title: isToday ? 'Current Burnout' : 'Starting Point',
        value: `${Math.round(burnoutLevel)}%`,
        impact: burnoutImpact,
        description: isToday 
          ? (burnoutLevel > 70 ? 'High burnout suggests continued stress' 
             : burnoutLevel < 30 ? 'Low burnout indicates good recovery potential'
             : 'Moderate burnout with mixed signals')
          : `Starting from ${Math.round(burnoutLevel)}% burnout level`,
        weight: isToday ? 40 : 25
      });
    }

    // 2. EPC Score Analysis (dynamic based on which scores are most relevant)
    const energyScore = epcScores.energy;
    const purposeScore = epcScores.purpose;
    const connectionScore = epcScores.connection;
    
    const scores = [
      { name: 'Energy', value: energyScore, key: 'energy' },
      { name: 'Purpose', value: purposeScore, key: 'purpose' },
      { name: 'Connection', value: connectionScore, key: 'connection' }
    ];
    
    // Only show the most impactful EPC scores (not all 3)
    const sortedScores = scores.sort((a, b) => Math.abs(50 - a.value) - Math.abs(50 - b.value));
    const relevantScores = sortedScores.slice(0, Math.min(2, sortedScores.length));
    
    relevantScores.forEach((score, index) => {
      const impact = score.value < 40 ? 'negative' : score.value > 70 ? 'positive' : 'neutral';
      const weight = isNearTerm ? 30 - (index * 5) : 20 - (index * 3);
      
      cards.push({
        title: score.name,
        value: `${Math.round(score.value)}%`,
        impact,
        description: getEPCDescription(score.name, score.value, forecastDay),
        weight
      });
    });

    // 3. Historical Patterns (more relevant for longer forecasts)
    if (recentHistory.length >= 3 && (isLongTerm || isNearTerm)) {
      const recentTrend = recentHistory.slice(-3);
      const trendSlope = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length;
      const trendImpact = trendSlope > 5 ? 'negative' : trendSlope < -5 ? 'positive' : 'neutral';
      
      cards.push({
        title: isLongTerm ? 'Historical Pattern' : 'Recent Trend',
        value: trendSlope > 0 ? `+${Math.round(trendSlope)}%` : `${Math.round(trendSlope)}%`,
        impact: trendImpact,
        description: getTrendDescription(trendSlope, forecastDay),
        weight: isLongTerm ? 25 : 20
      });
    }

    // 4. Day-Specific Factors
    if (selectedForecastDay) {
      const targetDate = selectedForecastDay.fullDate;
      const dayOfWeek = targetDate.getDay();
      
      // Weekend vs weekday patterns
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        cards.push({
          title: 'Weekend Effect',
          value: 'Recovery',
          impact: 'positive',
          description: 'Weekends typically provide recovery opportunities',
          weight: 15
        });
      } else if (dayOfWeek === 1) {
        cards.push({
          title: 'Monday Effect',
          value: 'Stress',
          impact: 'negative',
          description: 'Mondays often bring increased work stress',
          weight: 20
        });
      }

      // Seasonal patterns (if relevant)
      const month = targetDate.getMonth();
      if (month === 11 || month === 0 || month === 1) {
        cards.push({
          title: 'Winter Season',
          value: 'Higher Risk',
          impact: 'negative',
          description: 'Winter months often increase burnout risk',
          weight: 10
        });
      }
    }

    // 5. Forecast Confidence (more important for distant days)
    if (isLongTerm || confidence.score < 70) {
      const dataQualityImpact = confidence.score > 80 ? 'positive' : confidence.score < 50 ? 'negative' : 'neutral';
      cards.push({
        title: 'Prediction Confidence',
        value: `${confidence.score}%`,
        impact: dataQualityImpact,
        description: getConfidenceDescription(confidence.score, forecastDay),
        weight: isLongTerm ? 15 : 10
      });
    }

    // 6. Volatility/Uncertainty (only if high)
    if (selectedForecastDay && selectedForecastDay.uncertainty && selectedForecastDay.uncertainty > 15) {
      cards.push({
        title: 'High Uncertainty',
        value: `${Math.round(selectedForecastDay.uncertainty)}% range`,
        impact: 'negative',
        description: 'Large prediction range indicates unstable patterns',
        weight: 20
      });
    }

    // 7. Recovery Potential (for improving trends)
    if (recentHistory.length >= 2) {
      const lastTwo = recentHistory.slice(-2);
      const isImproving = lastTwo[1] < lastTwo[0];
      const improvement = lastTwo[0] - lastTwo[1];
      
      if (isImproving && improvement > 5) {
        cards.push({
          title: 'Recovery Momentum',
          value: `-${Math.round(improvement)}%`,
          impact: 'positive',
          description: 'Recent improvement suggests continued recovery',
          weight: 15
        });
      }
    }

    // Sort by weight and limit to most relevant (3-5 cards max)
    return cards
      .sort((a, b) => b.weight - a.weight)
      .slice(0, Math.min(5, cards.length));
  };

  const getEPCDescription = (name: string, value: number, dayOffset: number): string => {
    const isFuture = dayOffset > 0;
    const timeContext = isFuture ? ` in ${dayOffset} day${dayOffset > 1 ? 's' : ''}` : ' now';
    
    if (value < 40) {
      return `${name} is low${timeContext}, suggesting fatigue accumulation`;
    } else if (value > 70) {
      return `${name} is strong${timeContext}, supporting resilience`;
    } else {
      return `${name} is moderate${timeContext}, providing stability`;
    }
  };

  const getTrendDescription = (slope: number, dayOffset: number): string => {
    if (slope > 5) {
      return `Rising trend of +${Math.round(slope)}% per day continues`;
    } else if (slope < -5) {
      return `Improving trend of ${Math.round(slope)}% per day continues`;
    } else {
      return 'Stable burnout levels with minimal change';
    }
  };

  const getConfidenceDescription = (score: number, dayOffset: number): string => {
    if (score > 80) {
      return `High confidence in ${dayOffset === 0 ? 'current' : `${dayOffset}-day`} prediction`;
    } else if (score < 50) {
      return `Low confidence - ${dayOffset === 0 ? 'current' : `${dayOffset}-day`} prediction uncertain`;
    } else {
      return `Moderate confidence in ${dayOffset === 0 ? 'current' : `${dayOffset}-day`} forecast`;
    }
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return '#34C759';
      case 'negative': return '#FF3B30';
      case 'neutral': return '#8E8E93';
    }
  };

  const getImpactIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return '↗';
      case 'negative': return '↘';
      case 'neutral': return '→';
    }
  };

  const influenceCards = getInfluenceCards();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forecast Influences</Text>
      <Text style={styles.subtitle}>Factors affecting your 10-day prediction</Text>
      
      {influenceCards.map((card, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <View style={styles.valueContainer}>
              <Text style={[styles.value, { color: getImpactColor(card.impact) }]}>
                {card.value}
              </Text>
              <Text style={[styles.impactIcon, { color: getImpactColor(card.impact) }]}>
                {getImpactIcon(card.impact)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.description}>{card.description}</Text>
          
          <View style={styles.weightBar}>
            <View 
              style={[
                styles.weightFill, 
                { 
                  width: `${card.weight}%`,
                  backgroundColor: getImpactColor(card.impact)
                }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  impactIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  weightBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  weightFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default ForecastInfluenceCards;
