import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function LoadingScreen() {
  const router = useRouter();

  // Circle bounce animation
  const jumpY = useSharedValue(0);
  const scaleX = useSharedValue(1);

  const triggerHaptic = () => {
    try {
      // Stronger haptic for realistic impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Ignore haptic errors
    }
  };

  const triggerLightHaptic = () => {
    try {
      // Light haptic for secondary bounce
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Ignore haptic errors
    }
  };

  const triggerVeryLightHaptic = () => {
    try {
      // Very light haptic for tiny bounces
      Haptics.selectionAsync();
    } catch (error) {
      // Ignore haptic errors
    }
  };

  useEffect(() => {
    let isActive = true;
    
    const bounce = () => {
      if (!isActive) return;
      
      // Realistic bounce with diminishing bounces
      jumpY.value = withSequence(
        // Main jump up
        withTiming(-20, { 
          duration: 300, 
          easing: Easing.out(Easing.quad) 
        }),
        // Main drop down
        withTiming(0, { 
          duration: 400, 
          easing: Easing.in(Easing.quad) 
        }, () => {
          if (!isActive) return;
          // Strong haptic for main impact
          runOnJS(triggerHaptic)();
        }),
        // First small bounce
        withTiming(-8, { 
          duration: 120, 
          easing: Easing.out(Easing.quad) 
        }),
        withTiming(0, { 
          duration: 150, 
          easing: Easing.in(Easing.quad) 
        }, () => {
          if (!isActive) return;
          runOnJS(triggerLightHaptic)();
        }),
        // Second smaller bounce
        withTiming(-4, { 
          duration: 80, 
          easing: Easing.out(Easing.quad) 
        }),
        withTiming(0, { 
          duration: 100, 
          easing: Easing.in(Easing.quad) 
        }, () => {
          if (!isActive) return;
          runOnJS(triggerVeryLightHaptic)();
        }),
        // Third tiny bounce
        withTiming(-2, { 
          duration: 60, 
          easing: Easing.out(Easing.quad) 
        }),
        withTiming(0, { 
          duration: 80, 
          easing: Easing.in(Easing.quad) 
        }, () => {
          if (!isActive) return;
          runOnJS(triggerVeryLightHaptic)();
        })
      );
      
      if (isActive) {
        setTimeout(bounce, 1400); // Slightly longer to accommodate all bounces
      }
    };

    // Start the bouncing animation
    setTimeout(bounce, 500);

    // Navigate after loading
    const timer = setTimeout(() => {
      if (isActive) {
        router.replace('/(tabs)');
      }
    }, 10000); // Extended to 10 seconds for demonstration
    
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [router]);

  // Realistic bounce animation style
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: jumpY.value }],
  }));

  return (
    <SafeAreaView style={styles.container}> 
      <View style={styles.content}>
        {/* Realistically bouncing black circle */}
        <Animated.View style={[styles.circle, circleStyle]} />
        
        {/* Static text */}
        <Text style={styles.mainTitle}>
          AI Is Processing
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#000000',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    letterSpacing: -0.5,
  },
}); 