import { useEffect } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useHaptic } from '@/hooks/useHaptic';
import { verticalScale } from '../utils/responsive';
import { ThemedText } from './ThemedText';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CapacityRingProps {
  size: number;
  progress: number;
  color: string;
  title: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export function CapacityRing({ size, progress, color, title, style, onPress }: CapacityRingProps) {
  // Calculate stroke width based on size (2-3x thicker)
  const strokeWidth = Math.max(15, size * 0.12); // Minimum 15px (was 6px), scale with size (was 0.05)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const progressValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.1);
  
  // Apple-inspired animation values
  const breathingScale = useSharedValue(1);
  const rotationValue = useSharedValue(0);
  const glowOpacity = useSharedValue(0.2);
  
  const haptic = useHaptic();

  useEffect(() => {
    // Original progress animation
    progressValue.value = withSpring(progress, {
      damping: 25,
      stiffness: 120,
      mass: 1,
    });

    // Apple-inspired breathing animation
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Very subtle rotation
    rotationValue.value = withRepeat(
      withTiming(360, { duration: 180000, easing: Easing.linear }), // 3 minutes for full rotation
      -1,
      false
    );

    // Gentle glow pulsing
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - progressValue.value),
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value * breathingScale.value },
        { rotate: `${rotationValue.value}deg` }
      ],
      shadowOpacity: shadowOpacity.value,
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scaleValue.value,
      [0.95, 1, 1.05],
      [size * 0.16, size * 0.18, size * 0.19]
    );
    
    return {
      fontSize,
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    shadowOpacity.value = withSpring(0.2, { damping: 15, stiffness: 200 });
    runOnJS(haptic.light)();
  };

  const handlePressOut = () => {
    scaleValue.value = withSequence(
      withSpring(1.05, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    shadowOpacity.value = withSpring(0.1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    // Additional bounce animation
    scaleValue.value = withSequence(
      withSpring(0.95, { damping: 8, stiffness: 300 }),
      withSpring(1.1, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    runOnJS(haptic.medium)();
    onPress?.();
  };

  const RingContent = (
    <Animated.View style={[styles.container, style, animatedContainerStyle]}>
      {/* Glow effect */}
      <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
        <View 
          style={[
            styles.glowEffect, 
            { 
              width: size + 16, 
              height: size + 16,
              borderRadius: (size + 16) / 2,
              backgroundColor: color,
            }
          ]} 
        />
      </Animated.View>
      
      <View style={[styles.shadowContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <RadialGradient id={`gradient-${title}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={color} stopOpacity="1" />
            </RadialGradient>
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={0.15}
            fill="none"
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#gradient-${title})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            fill="none"
          />
        </Svg>
        
        <View style={styles.content}>
          <Animated.Text style={[styles.percentage, { color }, animatedTextStyle]}>
            {Math.round(progress * 100)}%
          </Animated.Text>
          <ThemedText style={[styles.title, { fontSize: size * 0.1 }]}>{title}</ThemedText>
        </View>
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      >
        {RingContent}
      </Pressable>
    );
  }

  return RingContent;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: verticalScale(-8),
    left: verticalScale(-8),
    zIndex: 0, // Keep fixed
  },
  glowEffect: {
    position: 'absolute',
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    }, // Keep fixed
    shadowRadius: 12, // Keep fixed
    shadowOpacity: 0.1, // Keep fixed
    elevation: 6, // Keep fixed
    borderRadius: 1000, // Very large to ensure circular shadow
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Glassmorphism background
    backdropFilter: 'blur(10px)',
    zIndex: 1, // Keep fixed
  },
  svg: {
    transform: [{ rotateZ: '0deg' }],
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Keep fixed
  },
  percentage: {
    fontWeight: '700',
    marginBottom: verticalScale(2),
    textAlign: 'center',
  },
  title: {
    opacity: 0.8, // Keep fixed
    fontWeight: '500',
    textAlign: 'center',
  },
}); 