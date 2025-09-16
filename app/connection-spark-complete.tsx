import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function ConnectionSparkCompletePage() {
  const router = useRouter();

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Connection Spark
      const cooldownStatus = await getToolCooldownStatus('connectionSpark');
      
      // Store the tool usage with effective points
      await storeToolUsage('connectionSpark', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('connectionSpark', cooldownStatus.effectivePoints);
      
      console.log('Connection Spark completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Connection Spark:', error);
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
                {/* Heart with wings */}
                <Path
                  fill="#FF6B6B"
                  stroke="#000"
                  strokeWidth="2"
                  d="M60,120 C60,120 10,80 10,50 C10,30 25,15 60,15 C95,15 110,30 110,50 C110,80 60,120 60,120 Z"
                />
                
                {/* Heart highlight */}
                <Path
                  fill="#FF8E8E"
                  d="M60,120 C60,120 25,85 25,55 C25,40 35,30 60,30 C85,30 95,40 95,55 C95,85 60,120 60,120 Z"
                />
                
                {/* Left wing */}
                <Path
                  fill="#4ECDC4"
                  stroke="#000"
                  strokeWidth="1.5"
                  d="M10,60 Q0,50 -5,40 Q0,30 10,40 Q5,50 10,60"
                />
                
                {/* Right wing */}
                <Path
                  fill="#4ECDC4"
                  stroke="#000"
                  strokeWidth="1.5"
                  d="M110,60 Q120,50 125,40 Q120,30 110,40 Q115,50 110,60"
                />
                
                {/* Sparkles around the heart */}
                <Circle cx="20" cy="30" r="3" fill="#FFD93D"/>
                <Circle cx="100" cy="30" r="3" fill="#FFD93D"/>
                <Circle cx="15" cy="70" r="2" fill="#FFD93D"/>
                <Circle cx="105" cy="70" r="2" fill="#FFD93D"/>
                
                {/* Connection lines */}
                <Path
                  fill="none"
                  stroke="#4ECDC4"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  d="M20,80 Q40,70 60,80 Q80,70 100,80"
                />
              </Svg>
            </View>
            
            <Text style={styles.title}>Connection sent! 💫✨{'\n'}You just created a social win.</Text>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What you just accomplished:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>💝</Text>
              <Text style={styles.benefitText}>Reached out to someone who gives you energy</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>⚡</Text>
              <Text style={styles.benefitText}>Created a low-pressure social connection</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🌟</Text>
              <Text style={styles.benefitText}>Combat loneliness with meaningful outreach</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>💕</Text>
              <Text style={styles.benefitText}>Lifted both your mood and theirs</Text>
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
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  benefitsSection: {
    marginTop: -20,
    marginBottom: 40,
    alignItems: 'flex-start',
    width: '100%',
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

