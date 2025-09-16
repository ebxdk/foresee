import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getBurnoutRiskLevel } from '../utils/burnoutCalc';
import { getGreenToOrangeGradient } from '../utils/colorUtils';
import { EPCScores } from '../utils/epcScoreCalc';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function getBarColor(label: string) {
  switch (label) {
    case 'Energy': return '#34C759'; // soft green
    case 'Purpose': return '#007AFF'; // iOS blue
    case 'Connection': return '#AF52DE'; // soft purple
    default: return '#8E8E93';
  }
}

function getScoreColor(score: number): string {
  return getGreenToOrangeGradient(score);
}

function getScoreLevel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

function getScoreDescription(score: number, category: string): string {
  if (score >= 80) {
    switch (category) {
      case 'Energy': return 'You have excellent energy levels and recovery capacity. Keep up your current habits!';
      case 'Purpose': return 'You have a strong sense of purpose and clear direction. Your work feels deeply meaningful.';
      case 'Connection': return 'You feel deeply connected to those around you. Your relationships are thriving.';
      default: return 'You\'re doing great in this area!';
    }
  } else if (score >= 60) {
    switch (category) {
      case 'Energy': return 'Your energy levels are good, but there\'s room for improvement in recovery and daily vitality.';
      case 'Purpose': return 'You have a good sense of purpose, though you might benefit from clarifying your goals further.';
      case 'Connection': return 'You feel connected to others, but could deepen these relationships for even better well-being.';
      default: return 'You\'re doing well, with some room for growth.';
    }
  } else if (score >= 40) {
    switch (category) {
      case 'Energy': return 'Your energy levels need attention. Focus on better sleep, nutrition, and stress management.';
      case 'Purpose': return 'Your sense of purpose could be stronger. Consider exploring what truly motivates and drives you.';
      case 'Connection': return 'You may feel somewhat isolated. Try reaching out to others and building stronger connections.';
      default: return 'This area needs some attention and care.';
    }
  } else {
    switch (category) {
      case 'Energy': return 'Your energy levels are significantly depleted. Prioritize rest, recovery, and stress reduction.';
      case 'Purpose': return 'You may feel lost or directionless. Consider seeking guidance to rediscover your purpose.';
      case 'Connection': return 'You may feel very isolated. Reaching out for support could make a big difference.';
      default: return 'This area needs immediate attention and support.';
    }
  }
}

function getRecommendations(score: number, category: string): string[] {
  if (score >= 80) {
    switch (category) {
      case 'Energy':
        return [
          'Maintain your current energy management practices',
          'Share your energy-boosting strategies with others',
          'Consider mentoring others on wellness practices'
        ];
      case 'Purpose':
        return [
          'Continue pursuing your meaningful goals',
          'Share your sense of purpose with others',
          'Consider how you can inspire others'
        ];
      case 'Connection':
        return [
          'Nurture your existing relationships',
          'Help others build connections',
          'Consider community leadership roles'
        ];
      default:
        return ['Keep up the great work!'];
    }
  } else if (score >= 60) {
    switch (category) {
      case 'Energy':
        return [
          'Establish a consistent sleep schedule',
          'Incorporate regular exercise into your routine',
          'Practice stress management techniques'
        ];
      case 'Purpose':
        return [
          'Reflect on what truly matters to you',
          'Set specific, meaningful goals',
          'Connect your daily activities to larger values'
        ];
      case 'Connection':
        return [
          'Schedule regular catch-ups with friends',
          'Join groups or clubs with shared interests',
          'Practice active listening in conversations'
        ];
      default:
        return ['Focus on small, consistent improvements'];
    }
  } else if (score >= 40) {
    switch (category) {
      case 'Energy':
        return [
          'Prioritize 7-9 hours of quality sleep',
          'Start with gentle exercise like walking',
          'Consider consulting a healthcare provider',
          'Reduce caffeine and screen time before bed'
        ];
      case 'Purpose':
        return [
          'Spend time journaling about your values',
          'Seek guidance from a mentor or coach',
          'Explore new hobbies or interests',
          'Consider volunteering to find meaning'
        ];
      case 'Connection':
        return [
          'Reach out to one person this week',
          'Consider joining support groups',
          'Practice vulnerability in safe relationships',
          'Seek professional help if needed'
        ];
      default:
        return ['Start with small, manageable steps'];
    }
  } else {
    switch (category) {
      case 'Energy':
        return [
          'Seek professional medical advice',
          'Focus on basic self-care: sleep, nutrition, rest',
          'Consider taking time off if possible',
          'Build a support network for recovery'
        ];
      case 'Purpose':
        return [
          'Consider working with a therapist or counselor',
          'Take time to rediscover what brings you joy',
          'Don\'t rush - finding purpose takes time',
          'Connect with others who can support your journey'
        ];
      case 'Connection':
        return [
          'Consider professional counseling or therapy',
          'Start with small social interactions',
          'Join online communities for support',
          'Don\'t hesitate to ask for help'
        ];
      default:
        return ['Professional support may be beneficial'];
    }
  }
}

export default function ScoresDetailsScreen() {
  const router = useRouter();
  const [scores, setScores] = React.useState<EPCScores | null>(null);

  React.useEffect(() => {
    // Get scores from storage
    const loadScores = async () => {
      try {
        const { getEPCScores } = await import('../utils/storage');
        const storedScores = await getEPCScores();
        if (storedScores) {
          setScores(storedScores);
        }
      } catch (error) {
        console.error('Error loading scores:', error);
      }
    };
    
    loadScores();
  }, []);

  const handleClose = () => {
    router.back();
  };

  if (!scores) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading scores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const burnoutRisk = getBurnoutRiskLevel(100 - (scores.energy + scores.purpose + scores.connection) / 3);

    return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Score Details</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >

            {/* Energy Score */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreTitle}>Energy</Text>
                <Text style={styles.scoreValue}>{scores.energy}</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBarFill, {
                    width: `${scores.energy}%`,
                    backgroundColor: getBarColor('Energy')
                  }]} />
                </View>
              </View>
              <Text style={styles.scoreLevel}>{getScoreLevel(scores.energy)}</Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(scores.energy, 'Energy')}
              </Text>
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                {getRecommendations(scores.energy, 'Energy').map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Purpose Score */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreTitle}>Purpose</Text>
                <Text style={styles.scoreValue}>{scores.purpose}</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBarFill, {
                    width: `${scores.purpose}%`,
                    backgroundColor: getBarColor('Purpose')
                  }]} />
                </View>
              </View>
              <Text style={styles.scoreLevel}>{getScoreLevel(scores.purpose)}</Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(scores.purpose, 'Purpose')}
              </Text>
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                {getRecommendations(scores.purpose, 'Purpose').map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Connection Score */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreTitle}>Connection</Text>
                <Text style={styles.scoreValue}>{scores.connection}</Text>
              </View>
              <View style={styles.scoreBarContainer}>
                <View style={styles.scoreBarBg}>
                  <View style={[styles.scoreBarFill, {
                    width: `${scores.connection}%`,
                    backgroundColor: getBarColor('Connection')
                  }]} />
                </View>
              </View>
              <Text style={styles.scoreLevel}>{getScoreLevel(scores.connection)}</Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(scores.connection, 'Connection')}
              </Text>
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                {getRecommendations(scores.connection, 'Connection').map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* How Scores Are Calculated */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>How Your Scores Are Calculated</Text>
              <Text style={styles.infoText}>
                Your scores are based on your responses to our wellness assessment questions:
              </Text>
              <View style={styles.questionList}>
                <Text style={styles.questionItem}>• Energy: Based on your daily energy levels and stress recovery</Text>
                <Text style={styles.questionItem}>• Purpose: Based on work meaning and life direction clarity</Text>
                <Text style={styles.questionItem}>• Connection: Based on your sense of connection to others</Text>
              </View>
              <Text style={styles.infoText}>
                Each score ranges from 0-100%, where higher scores indicate better wellness in that area.
              </Text>
            </View>
          </ScrollView>
        </View>
      );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  scoreCard: {
    backgroundColor: '#FFFCF0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  scoreBarContainer: {
    marginBottom: 12,
  },
  scoreBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  scoreLevel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 12,
  },
  scoreDescription: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 22,
    marginBottom: 16,
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: 15,
    color: '#3A3A3C',
    flex: 1,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 0,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 20,
    marginBottom: 12,
  },
  questionList: {
    marginBottom: 12,
  },
  questionItem: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 20,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '500',
  },
}); 