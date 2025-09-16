import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';

export default function HydrationHeroPage() {
  const router = useRouter();
  const fillHeight = useSharedValue(0);

  useEffect(() => {
    // Animate water filling the glass in a loop with pause when full
    fillHeight.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3500 }), // Slower fill (3.5 seconds)
        withDelay(1500, withTiming(1, { duration: 0 })), // Stay full for 1.5 seconds
        withTiming(0, { duration: 2000 }) // Empty in 2 seconds
      ),
      -1,
      false
    );
  }, []);

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      height: `${fillHeight.value * 65}%`,
    };
  });

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/hydration-intake-modal');
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
              {/* Water Glass Icon with Animation */}
              <View style={styles.iconContainer}>
                <View style={styles.glassContainer}>
                  {/* Glass outline */}
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
                  
                  {/* Animated water fill with glass shape mask */}
                  <Animated.View style={[styles.waterFillContainer, animatedFillStyle]}>
                    <Svg width={120} height={140} viewBox="0 0 120 140" style={styles.waterSvg}>
                      <Defs>
                        <ClipPath id="glassClip">
                          <Path d="M36,26 L84,26 L81,118 Q78,126 60,126 Q42,126 39,118 L36,26 Z" />
                        </ClipPath>
                      </Defs>
                      {/* Water fill clipped to glass shape */}
                      <Rect
                        x="35"
                        y="25"
                        width="50"
                        height="105"
                        fill="#4ECDC4"
                        opacity="0.6"
                        clipPath="url(#glassClip)"
                      />
                      {/* Water surface with slight curve */}
                      <Path
                        fill="#4ECDC4"
                        opacity="0.8"
                        d="M36,26 Q48,24 60,26 Q72,28 84,26 L84,28 Q72,30 60,28 Q48,26 36,28 Z"
                        clipPath="url(#glassClip)"
                      />
                    </Svg>
                  </Animated.View>
                </View>
              </View>
              
              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>Without proper hydration, your mind isn't working the way it should.</Text>
                <Text style={styles.subtitle}>Burnout becomes inevitable.</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section with Get Started Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
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
  glassContainer: {
    position: 'relative',
    width: 120,
    height: 140,
  },
  glassSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  waterFillContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  waterSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
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