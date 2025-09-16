import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function NourishmentReminderSetupPage() {
  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Nourishment Check
      const cooldownStatus = await getToolCooldownStatus('nourishmentCheck');
      
      // Store the tool usage with effective points
      await storeToolUsage('nourishmentCheck', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('nourishmentCheck', cooldownStatus.effectivePoints);
      
      console.log('Nourishment Check completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Nourishment Check:', error);
    }
    
    router.push('/tools' as any);
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
            <Path fill="#000" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" />
          </Svg>
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Message Section */}
          <View style={styles.messageSection}>
            {/* Icon and text container */}
            <View style={styles.iconAndTextContainer}>
              {/* Nourishment Icon */}
              <View style={styles.iconContainer}>
                <Svg width={180} height={180} viewBox="0 0 180 180">
                  {/* Apple body - refined for "Apple level" quality */}
                  <Path d="M 90 30 C 55 10, 20 40, 20 80 C 20 120, 50 160, 90 160 C 130 160, 160 120, 160 80 C 160 40, 125 10, 90 30 Z" 
                        fill="#EF4444" stroke="#000000" strokeWidth={6} />
                  {/* Apple stem - refined */}
                  <Path d="M 90 30 L 95 10 L 105 15 L 100 35 Z" fill="#000000" />
                  {/* Apple leaf - refined */}
                  <Path d="M 100 35 Q 115 20, 130 35 Q 115 50, 100 35 Z" fill="#22C55E" />
                </Svg>
              </View>

              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>We'll keep you on track to crush your energy goals today! 🚀</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section with Continue Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.getStartedButton} onPress={handleContinue}>
              <Text style={styles.getStartedButtonText}>Sounds good</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 50,
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
  messageSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 80,
  },
  iconAndTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 30,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 32,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  getStartedButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
