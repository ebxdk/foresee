import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

export default function PhoneFreePausePage() {
  const router = useRouter();
  const phoneScale = useSharedValue(1);
  const phoneOpacity = useSharedValue(1);

  useEffect(() => {
    // Animate phone icon with gentle breathing effect
    phoneScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 3000 }), // Gentle expand
        withDelay(500, withTiming(1, { duration: 3000 })) // Gentle contract
      ),
      -1,
      false
    );

    // Subtle opacity pulse
    phoneOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 4000 }), // Fade slightly
        withDelay(1000, withTiming(1, { duration: 4000 })) // Return to full
      ),
      -1,
      false
    );
  }, []);

  const animatedPhoneStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: phoneScale.value }],
      opacity: phoneOpacity.value,
    };
  });

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/phone-free-setup');
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
              {/* Phone Icon with Animation */}
              <View style={styles.iconContainer}>
                <Animated.View style={[styles.phoneIcon, animatedPhoneStyle]}>
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
                </Animated.View>
              </View>
              
              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>Research shows that even brief breaks from screens can reset your attention span and reduce mental fatigue.</Text>
                <Text style={styles.subtitle}>A 5-minute digital pause can be surprisingly restorative for your mind.</Text>
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
  phoneIcon: {
    alignItems: 'center',
    justifyContent: 'center',
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