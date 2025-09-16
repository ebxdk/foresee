import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function MentalUnloadCompletePage() {
  const router = useRouter();

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Mental Unload
      const cooldownStatus = await getToolCooldownStatus('mentalUnload');
      
      // Store the tool usage with effective points
      await storeToolUsage('mentalUnload', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('mentalUnload', cooldownStatus.effectivePoints);
      
      console.log('Mental Unload completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Mental Unload:', error);
    }
    
    router.push('/(tabs)/tools');
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
                {/* Brain with wings */}
                <Path
                  fill="#F3F4F6"
                  stroke="#000"
                  strokeWidth="2"
                  d="M60,20 C40,20 25,35 25,55 C25,65 30,75 40,80 C35,85 30,95 30,105 C30,115 40,125 60,125 C80,125 90,115 90,105 C90,95 85,85 80,80 C90,75 95,65 95,55 C95,35 80,20 60,20 Z"
                />
                
                {/* Brain folds */}
                <Path
                  fill="none"
                  stroke="#000"
                  strokeWidth="1.5"
                  d="M35,30 Q60,25 85,30 M35,40 Q60,35 85,40 M35,50 Q60,45 85,50 M35,60 Q60,55 85,60 M35,70 Q60,65 85,70 M35,80 Q60,75 85,80 M35,90 Q60,85 85,90 M35,100 Q60,95 85,100"
                />
                
                {/* Left wing */}
                <Path
                  fill="#E5E7EB"
                  stroke="#000"
                  strokeWidth="1.5"
                  d="M25,60 Q15,50 10,40 Q15,30 25,40 Q20,50 25,60"
                />
                
                {/* Right wing */}
                <Path
                  fill="#E5E7EB"
                  stroke="#000"
                  strokeWidth="1.5"
                  d="M95,60 Q105,50 110,40 Q105,30 95,40 Q100,50 95,60"
                />
                
                {/* Peace symbol */}
                <Circle cx="60" cy="70" r="15" fill="none" stroke="#000" strokeWidth="2"/>
                <Path
                  fill="#000"
                  d="M60,55 L60,85 M50,65 L70,65"
                />
              </Svg>
            </View>
            
            <Text style={styles.title}>Mental RAM cleared! 🧠✨{'\n'}Your mind now has space to breathe.</Text>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What you just accomplished:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🕊️</Text>
              <Text style={styles.benefitText}>Released mental clutter</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🧘</Text>
              <Text style={styles.benefitText}>Experienced instant catharsis</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>💭</Text>
              <Text style={styles.benefitText}>Cleared mental bandwidth</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>✨</Text>
              <Text style={styles.benefitText}>Created space for new thoughts</Text>
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

