import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EPCScores } from '../../utils/epcScoreCalc'; // Adjusted path

const getBarColor = (label: string) => {
  switch (label) {
    case 'Energy': return '#FF6B6B';
    case 'Purpose': return '#4ECDC4';
    case 'Connection': return '#45B7D1';
    default: return '#8E8E93';
  }
};

export default function EPCExplanationProfile() {
  const router = useRouter();
  const { scores: scoresParam } = useLocalSearchParams();
  const scores: EPCScores = JSON.parse(scoresParam as string); // Parse scores from param

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeXButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={24} color="#1C1C1E" />
      </TouchableOpacity>
      <BlurView intensity={80} tint="light" style={styles.headerContainer}>
        <Text style={styles.title}>Your EPC Breakdown</Text>
        <Text style={styles.subtitle}>Understand your Energy, Purpose, and Connection scores</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Energy Section */}
        <BlurView intensity={60} tint="light" style={styles.mainCard}>
          <LinearGradient
            colors={[getBarColor('Energy') + '80', getBarColor('Energy') + '60']}
            style={styles.mainCardHeader}
          >
            <View style={styles.mainCardTitleRow}>
              <Text style={styles.mainCardEmoji}>⚡</Text>
              <View style={styles.mainCardTitleContainer}>
                <Text style={styles.mainCardTitle}>Energy</Text>
                <Text style={styles.mainCardScore}>{scores.energy}%</Text>
              </View>
            </View>
            <View style={styles.mainCardBarContainer}>
              <View style={[styles.mainCardBarBackground, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <View style={[styles.mainCardBarFill, { width: `${scores.energy}%`, backgroundColor: getBarColor('Energy') }]} />
              </View>
            </View>
          </LinearGradient>
          
          <View style={styles.subCardsContainer}>
            <View style={[styles.subCard, { backgroundColor: getBarColor('Energy') + '10' }]}>
              <Text style={styles.subCardTitle}>What it means</Text>
              <Text style={styles.subCardText}>
                Your physical and mental vitality level. Think of it as your battery charge - how ready you are to tackle challenges and seize opportunities.
              </Text>
            </View>
            
            <View style={[styles.subCard, { backgroundColor: getBarColor('Energy') + '10' }]}>
              <Text style={styles.subCardTitle}>Quick wins</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>😴</Text>
                <Text style={styles.tipText}>Get 7-9 hours of quality sleep</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>💧</Text>
                <Text style={styles.tipText}>Stay hydrated throughout the day</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>🚶</Text>
                <Text style={styles.tipText}>Take 5-minute movement breaks</Text>
              </View>
            </View>
          </View>
        </BlurView>

        {/* Purpose Section */}
        <BlurView intensity={60} tint="light" style={styles.mainCard}>
          <LinearGradient
            colors={[getBarColor('Purpose') + '80', getBarColor('Purpose') + '60']}
            style={styles.mainCardHeader}
          >
            <View style={styles.mainCardTitleRow}>
              <Text style={styles.mainCardEmoji}>💡</Text>
              <View style={styles.mainCardTitleContainer}>
                <Text style={styles.mainCardTitle}>Purpose</Text>
                <Text style={styles.mainCardScore}>{scores.purpose}%</Text>
              </View>
            </View>
            <View style={styles.mainCardBarContainer}>
              <View style={[styles.mainCardBarBackground, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <View style={[styles.mainCardBarFill, { width: `${scores.purpose}%`, backgroundColor: getBarColor('Purpose') }]} />
              </View>
            </View>
          </LinearGradient>
          
          <View style={styles.subCardsContainer}>
            <View style={[styles.subCard, { backgroundColor: getBarColor('Purpose') + '10' }]}>
              <Text style={styles.subCardTitle}>What it means</Text>
              <Text style={styles.subCardText}>
                Your sense of direction and meaning in life. It's about feeling aligned with your values and having goals that truly matter to you.
              </Text>
            </View>
            
            <View style={[styles.subCard, { backgroundColor: getBarColor('Purpose') + '10' }]}>
              <Text style={styles.subCardTitle}>Quick wins</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>🎯</Text>
                <Text style={styles.tipText}>Write down your core values</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>📝</Text>
                <Text style={styles.tipText}>Set one meaningful goal this week</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>🔥</Text>
                <Text style={styles.tipText}>Do something that ignites your passion</Text>
              </View>
            </View>
          </View>
        </BlurView>

        {/* Connection Section */}
        <BlurView intensity={60} tint="light" style={styles.mainCard}>
          <LinearGradient
            colors={[getBarColor('Connection') + '80', getBarColor('Connection') + '60']}
            style={styles.mainCardHeader}
          >
            <View style={styles.mainCardTitleRow}>
              <Text style={styles.mainCardEmoji}>🤝</Text>
              <View style={styles.mainCardTitleContainer}>
                <Text style={styles.mainCardTitle}>Connection</Text>
                <Text style={styles.mainCardScore}>{scores.connection}%</Text>
              </View>
            </View>
            <View style={styles.mainCardBarContainer}>
              <View style={[styles.mainCardBarBackground, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <View style={[styles.mainCardBarFill, { width: `${scores.connection}%`, backgroundColor: getBarColor('Connection') }]} />
              </View>
            </View>
          </LinearGradient>
          
          <View style={styles.subCardsContainer}>
            <View style={[styles.subCard, { backgroundColor: getBarColor('Connection') + '10' }]}>
              <Text style={styles.subCardTitle}>What it means</Text>
              <Text style={styles.subCardText}>
                The quality of your relationships and sense of belonging. It's about feeling supported, understood, and connected to others.
              </Text>
            </View>
            
            <View style={[styles.subCard, { backgroundColor: getBarColor('Connection') + '10' }]}>
              <Text style={styles.subCardTitle}>Quick wins</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>📱</Text>
                <Text style={styles.tipText}>Text someone you care about</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>👥</Text>
                <Text style={styles.tipText}>Join a community or group</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipEmoji}>👂</Text>
                <Text style={styles.tipText}>Practice active listening</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA', // Match app theme background
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 5,
  },
  closeXButton: {
    position: 'absolute',
    top: 30,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1C1C1E',
    paddingHorizontal: 24,
    paddingTop: 30,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
    lineHeight: 22,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingTop: 140, // Adjusted for slimmer header
    paddingBottom: 100, // More bottom padding
  },
  mainCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mainCardHeader: {
    padding: 24,
  },
  mainCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainCardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  mainCardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  mainCardScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  mainCardBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCardBarBackground: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  mainCardBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  subCardsContainer: {
    padding: 20,
    gap: 16,
  },
  subCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  subCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subCardText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  closeButton: {
    display: 'none',
  },
  closeButtonText: {
    display: 'none',
  },
});