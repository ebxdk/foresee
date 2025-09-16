import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 4000;
const HOLD2_MS = 4000;
const TOTAL_PHASES = 4; // inhale, hold, exhale, hold
const TOTAL_CYCLES = 5;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function OxygenMaskBreathePage() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // Visual animation values
  const gradientOpacity = useSharedValue(0);
  const breathLevel = useSharedValue(0); // 0 = exhale, 1 = inhale peak

  const timersRef = useRef<number[]>([]);

  const currentPhase = useMemo(() => {
    switch (phaseIndex) {
      case 0: return 'Inhale';
      case 1: return 'Hold';
      case 2: return 'Exhale';
      case 3: return 'Hold';
      default: return 'Inhale';
    }
  }, [phaseIndex]);

  const currentDuration = useMemo(() => {
    if (phaseIndex === 0) return INHALE_MS;
    if (phaseIndex === 1) return HOLD_MS;
    if (phaseIndex === 2) return EXHALE_MS;
    return HOLD2_MS;
  }, [phaseIndex]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!running) return;

    // Haptic cue at phase start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate breath level to match phase
    if (phaseIndex === 0) {
      // Inhale up to 1
      breathLevel.value = withTiming(1, { duration: INHALE_MS, easing: Easing.inOut(Easing.cubic) });
    } else if (phaseIndex === 1) {
      // Hold at peak
      breathLevel.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear });
    } else if (phaseIndex === 2) {
      // Exhale down to 0
      breathLevel.value = withTiming(0, { duration: EXHALE_MS, easing: Easing.inOut(Easing.cubic) });
    } else if (phaseIndex === 3) {
      // Hold at base
      breathLevel.value = withTiming(0, { duration: HOLD2_MS, easing: Easing.linear });
    }

    // Schedule next phase
    const t = setTimeout(() => {
      const nextPhase = (phaseIndex + 1) % TOTAL_PHASES;
      if (nextPhase === 0) {
        setCycleCount((c) => c + 1);
      }
      setPhaseIndex(nextPhase);
    }, currentDuration) as unknown as number;

    timersRef.current.push(t);

    return () => {
      clearTimeout(t);
    };
  }, [running, phaseIndex, currentDuration]);

  useEffect(() => {
    if (!running) return;
    if (cycleCount >= TOTAL_CYCLES) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Immediately transition to completion page without showing finished text
      router.replace('/oxygen-mask-complete' as any);
    }
  }, [cycleCount, running, router]);

  const handleStart = () => {
    if (running) return;
    setCycleCount(0);
    setPhaseIndex(0);
    setRunning(true);

    // Fade in the sunset gradient fully across the screen
    gradientOpacity.value = withTiming(1, { duration: 800, easing: Easing.inOut(Easing.cubic) });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Gradient overlay style
  const gradientStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Sunset gradient overlay */}
      <Animated.View style={[styles.gradientOverlay, gradientStyle]} pointerEvents="none">
        <LinearGradient
          colors={[ '#FFF1E0', '#FFD4A3', '#FFA24C', '#FF7A3D', '#E24B2B' ]}
          locations={[0, 0.22, 0.5, 0.75, 1]}
          start={{ x: 0.15, y: 0.0 }}
          end={{ x: 0.95, y: 1.0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path fill="#000000" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" />
        </Svg>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Breathe with the rhythm</Text>
        <Text style={styles.subtitle}>{running ? `${currentPhase}…` : 'Press the button, then follow the flow: inhale · hold · exhale · hold.'}</Text>
      </View>

      {/* Start button */}
      {!running && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.primaryButtonText}>Push to breathe</Text>
        </TouchableOpacity>
      )}

      {/* Cycle counter */}
      {running && (
        <View style={styles.bottomInfo}>
          <Text style={styles.counterText}>Round {Math.min(cycleCount + 1, TOTAL_CYCLES)} of {TOTAL_CYCLES}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 60,
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
    justifyContent: 'flex-start',
    paddingTop: 140,
    paddingBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButton: {
    position: 'absolute',
    bottom: 40,
    left: 32,
    right: 32,
    backgroundColor: '#000000',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 46,
    left: 32,
    right: 32,
    alignItems: 'center',
  },
  counterText: {
    color: '#000000',
    fontWeight: '600',
  },
}); 