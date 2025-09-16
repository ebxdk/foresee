import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function SweetSpotScanCompletePage() {
  const router = useRouter();

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Sweet Spot Scan
      const cooldownStatus = await getToolCooldownStatus('sweetSpotScan');
      
      // Store the tool usage with effective points
      await storeToolUsage('sweetSpotScan', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('sweetSpotScan', cooldownStatus.effectivePoints);
      
      console.log('Sweet Spot Scan completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Sweet Spot Scan:', error);
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
          {/* Message Section */}
          <View style={styles.messageSection}>
            {/* Icon and text container */}
            <View style={styles.iconAndTextContainer}>
              {/* Sweet Spot Discovery Icon */}
              <View style={styles.iconContainer}>
                <Svg width={120} height={140} viewBox="0 0 120 140">
                  {/* Magnifying glass with enhanced detail */}
                  <Path
                    fill="none"
                    stroke="#000"
                    strokeWidth="3"
                    d="M100,40 L120,20 M120,20 L130,20 M120,20 L120,30"
                  />
                  
                  {/* Magnifying glass lens with better proportions */}
                  <Circle cx="70" cy="70" r="45" fill="none" stroke="#000" strokeWidth="3"/>
                  
                  {/* Central discovery spark - more detailed star */}
                  <Path
                    fill="#FFD93D"
                    d="M70,45 L78,62 L95,62 L82,75 L88,92 L70,80 L52,92 L58,75 L45,62 L62,62 Z"
                  />
                  
                  {/* Radiating light beams from the center */}
                  <Path
                    fill="none"
                    stroke="#FFD93D"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    d="M70,25 L70,15 M70,115 L70,125 M25,70 L15,70 M115,70 L125,70"
                  />
                  
                  {/* Additional discovery elements - smaller stars */}
                  <Path
                    fill="#FFD93D"
                    d="M35,35 L38,42 L45,42 L39,47 L41,54 L35,50 L29,54 L31,47 L25,42 L32,42 Z"
                  />
                  <Path
                    fill="#FFD93D"
                    d="M105,35 L108,42 L115,42 L109,47 L111,54 L105,50 L99,54 L101,47 L95,42 L102,42 Z"
                  />
                  
                  {/* Connection dots representing the "sweet spot" discovery */}
                  <Circle cx="40" cy="100" r="4" fill="#4ECDC4"/>
                  <Circle cx="100" cy="100" r="4" fill="#4ECDC4"/>
                  <Circle cx="70" cy="110" r="3" fill="#4ECDC4"/>
                </Svg>
              </View>
              
              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  Sweet Spot Amplified! ✨🎯{'\n'}You've discovered your inner spark and created space for more moments of genuine contentment.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Section with Sounds Good Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.soundsGoodButton}
            onPress={handleDone}
          >
            <Text style={styles.soundsGoodButtonText}>Sounds good</Text>
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
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 50,
  },
  messageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconAndTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 40,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    height: 140,
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
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  soundsGoodButton: {
    width: 280,
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundsGoodButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
