import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ClipPath, Defs, Path, Svg } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function HydrationSummaryScreen() {
  const router = useRouter();
  const { habit } = useLocalSearchParams<{ habit: string }>();

  const handleSoundsGood = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Hydration Hero
      const cooldownStatus = await getToolCooldownStatus('hydrationHero');
      
      // Update EPC scores with the tool points (this also creates buffers/tails)
      await updateEPCScoresFromTool('hydrationHero', cooldownStatus.effectivePoints);
      
      // Store the tool usage
      await storeToolUsage('hydrationHero', cooldownStatus.effectivePoints);
      
      console.log('Hydration Hero completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error storing tool usage:', error);
    }
    
    console.log('Hydration Hero flow completed');
    // Navigate back to tools page
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

        {/* Content */}
        <View style={styles.content}>
          {/* Message Section */}
          <View style={styles.messageSection}>
            {/* Icon and text container */}
            <View style={styles.iconAndTextContainer}>
              {/* Water Glass Icon - nearly full for completion */}
              <View style={styles.iconContainer}>
                <View style={styles.glassContainer}>
                  <Svg width={120} height={140} viewBox="0 0 120 140" style={styles.glassSvg}>
                    {/* Glass outline */}
                    <Path
                      fill="none"
                      stroke="#000"
                      strokeWidth="3"
                      d="M30,20 L90,20 L85,120 Q80,130 60,130 Q40,130 35,120 L30,20 Z"
                    />
                    {/* Glass bottom */}
                    <Path
                      fill="none"
                      stroke="#000"
                      strokeWidth="3"
                      d="M35,120 Q60,125 85,120"
                    />
                  </Svg>
                  
                  {/* Static water fill - nearly full for completion */}
                  <View style={styles.staticWaterContainer}>
                    <Svg width={120} height={140} viewBox="0 0 120 140" style={styles.waterSvg}>
                      <Defs>
                        <ClipPath id="glassClip">
                          <Path d="M36,26 L84,26 L81,118 Q78,126 60,126 Q42,126 39,118 L36,26 Z" />
                        </ClipPath>
                      </Defs>
                      {/* Water fill clipped to glass shape - nearly full */}
                      <Path
                        fill="#4ECDC4"
                        opacity="0.6"
                        d="M39,35 L81,35 L81,118 Q78,120 60,120 Q42,120 39,118 L39,35 Z"
                        clipPath="url(#glassClip)"
                      />
                      {/* Water surface with slight curve */}
                      <Path
                        fill="#4ECDC4"
                        opacity="0.8"
                        d="M39,35 Q48,33 60,35 Q72,37 81,35 L81,37 Q72,39 60,37 Q48,35 39,37 Z"
                        clipPath="url(#glassClip)"
                      />
                    </Svg>
                  </View>
                </View>
              </View>
              
              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  Awesome! 🎉{'\n'}Now every time you {habit || 'do that habit'}, it's your cue to hydrate! I'll send you friendly reminders to keep this new superpower going strong. 💧✨
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Section with Sounds Good Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.soundsGoodButton}
              onPress={handleSoundsGood}
            >
              <Text style={styles.soundsGoodButtonText}>Sounds good</Text>
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
  glassContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassSvg: {
    width: '100%',
    height: '100%',
  },
  staticWaterContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterSvg: {
    width: '100%',
    height: '100%',
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
    width: '100%',
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