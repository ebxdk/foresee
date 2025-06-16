import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { BURNOUT_COLOR_SCHEMES, createColoredLottieAnimation, getColorSchemeForPercentage } from '../../utils/lottieColorUtils';

// Import the base animation
const baseAnimation = require('../../assets/Animation - 1750062394107.json');

export default function RadarScreen() {
  const [burnoutPercentage, setBurnoutPercentage] = useState(25); // Demo value
  const animationRef = useRef<LottieView>(null);
  const colorTransition = useRef(new Animated.Value(0)).current;

  // Simulate changing burnout levels for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setBurnoutPercentage(prev => {
        const newValue = prev + 5;
        return newValue > 100 ? 0 : newValue;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animate color transitions
  useEffect(() => {
    Animated.timing(colorTransition, {
      toValue: burnoutPercentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [burnoutPercentage]);

  // Get status and colors based on burnout percentage
  const getBurnoutStatus = (percentage: number) => {
    if (percentage <= 33) return { status: 'Thriving', level: 'low' };
    if (percentage <= 66) return { status: 'Moderate', level: 'medium' };
    return { status: 'Burnout Risk', level: 'high' };
  };

  // Get modern Apple-level colors based on burnout percentage
  const getStatusColors = (percentage: number) => {
    const colorScheme = getColorSchemeForPercentage(percentage);
    const colors = BURNOUT_COLOR_SCHEMES[colorScheme];
    
    return {
      primary: colors.primary,
      secondary: colors.secondary,
      glow: colors.glow,
      background: colors.background,
    };
  };

  // Create the colored animation based on current burnout level
  const coloredAnimation = useMemo(() => {
    const colorScheme = getColorSchemeForPercentage(burnoutPercentage);
    return createColoredLottieAnimation(baseAnimation, colorScheme);
  }, [burnoutPercentage]);

  const { status, level } = getBurnoutStatus(burnoutPercentage);
  const colors = getStatusColors(burnoutPercentage);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Burnout Radar</Text>
        <Text style={styles.subtitle}>AI-Powered Wellness Detection</Text>
      </View>
      
      <View style={styles.content}>
        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <Text style={[styles.percentageText, { color: colors.primary }]}>
            {burnoutPercentage}%
          </Text>
          <Text style={[styles.statusLabel, { color: colors.primary }]}>
            {status}
          </Text>
        </View>

        {/* Animated orb container with dynamic colors */}
        <View style={styles.orbContainer}>
          <Animated.View
            style={[
              styles.orbGlow,
              {
                backgroundColor: colors.background,
                shadowColor: colors.primary,
              }
            ]}
          />
          
          <LottieView
            ref={animationRef}
            source={coloredAnimation}
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>

        {/* Status description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.statusText}>
            {level === 'low' && 'Your wellness levels are optimal. You\'re thriving and maintaining excellent balance!'}
            {level === 'medium' && 'Moderate stress detected. Consider taking mindful breaks and prioritizing self-care.'}
            {level === 'high' && 'High burnout risk detected. Time to prioritize rest and seek support.'}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${burnoutPercentage}%`,
                  backgroundColor: colors.primary,
                }
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Thriving</Text>
            <Text style={styles.progressLabel}>Moderate</Text>
            <Text style={styles.progressLabel}>Burnout</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    marginTop: 4,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  orbContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  orbGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 50,
    elevation: 20,
  },
  lottieAnimation: {
    width: 280,
    height: 280,
  },
  descriptionContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1C1C1E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 