import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function PhoneFreeSummaryPage() {
  const router = useRouter();
  const { reflection } = useLocalSearchParams<{ reflection: string }>();

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Phone-Free Pause
      const cooldownStatus = await getToolCooldownStatus('phoneFreePause');
      
      // Store the tool usage with effective points
      await storeToolUsage('phoneFreePause', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('phoneFreePause', cooldownStatus.effectivePoints);
      
      console.log('Phone-Free Pause completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Phone-Free Pause:', error);
    }
    
    router.push('/tools');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              fill="#000"
              d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"
            />
          </Svg>
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Celebration Section */}
          <View style={styles.celebrationSection}>
            <View style={styles.iconContainer}>
              <Svg width={120} height={140} viewBox="0 0 120 140">
                {/* Phone body */}
                <Rect
                  x="30"
                  y="20"
                  width="60"
                  height="100"
                  rx="8"
                  fill="#333"
                  stroke="#000"
                  strokeWidth="2"
                />
                {/* Screen */}
                <Rect
                  x="35"
                  y="30"
                  width="50"
                  height="70"
                  rx="4"
                  fill="#4A90E2"
                />
                {/* Home button */}
                <Rect
                  x="55"
                  y="110"
                  width="10"
                  height="10"
                  rx="5"
                  fill="#666"
                />
              </Svg>
            </View>
            
            <Text style={styles.title}>Great job! 🎉{'\n'}You just gave your mind a 5-minute vacation from screens.</Text>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What you just accomplished:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🧠</Text>
              <Text style={styles.benefitText}>Reset your attention span</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>😌</Text>
              <Text style={styles.benefitText}>Reduced mental fatigue</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>👁️</Text>
              <Text style={styles.benefitText}>Practiced mindful observation</Text>
            </View>
          </View>
        </View>

        {/* Bottom Section with Done Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 80,
  },
  celebrationSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 40,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  benefitsSection: {
    marginTop: -20,
    marginBottom: 40,
    alignItems: 'flex-start',
    width: '100%',
  },
  spacer: {
    height: 60,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: 40,
  },
  doneButton: {
    width: 280,
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
