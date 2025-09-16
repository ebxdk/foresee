import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming
} from "react-native-reanimated";

type RainyBackgroundProps = {
  /** 0 = drizzle, 1 = storm */
  intensity?: number;
  /** -1 = strong left wind, 0 = calm, 1 = strong right wind */
  wind?: number;
  /** 0 = day tint, 1 = night tint */
  night?: number;
};

const { width: W, height: H } = Dimensions.get("window");

/** A stationary cloud with more realistic cloud shape */
function Cloud({ scale = 1, opacity = 0.6, y = 50, x = 0 }) {
  return (
    <View style={[styles.cloud, { top: y, left: x, opacity, transform: [{ scale }] }]}>
      <View style={styles.cloudShape}>
        {/* More realistic cloud shape with overlapping circles */}
        <View style={[styles.cloudCircle, { width: 90, height: 90, top: 25, left: 50 }]} />
        <View style={[styles.cloudCircle, { width: 80, height: 80, top: 15, left: 110 }]} />
        <View style={[styles.cloudCircle, { width: 100, height: 100, top: 30, left: 160 }]} />
        <View style={[styles.cloudCircle, { width: 70, height: 70, top: 10, left: 220 }]} />
        <View style={[styles.cloudCircle, { width: 85, height: 85, top: 35, left: 270 }]} />
        <View style={[styles.cloudCircle, { width: 75, height: 75, top: 20, left: 320 }]} />
        <View style={[styles.cloudCircle, { width: 65, height: 65, top: 40, left: 370 }]} />
        <View style={[styles.cloudCircle, { width: 60, height: 60, top: 25, left: 420 }]} />
      </View>
    </View>
  );
}

/** A raindrop that falls with wind effect and proper animation */
function Raindrop({ delay = 0, x = 0, speed = 1, wind = 0 }) {
  const dropY = useSharedValue(-100); // Start just above the screen
  const dropX = useSharedValue(x);

  useEffect(() => {
    // Create smooth continuous falling animation with seamless loop
    const animationDuration = 4000 / speed; // Slightly faster for smoother effect
    
    // Use withRepeat but with proper timing to avoid glitches
    dropY.value = withDelay(
      delay,
      withRepeat(
        withTiming(H + 100, { 
          duration: animationDuration 
        }),
        -1, // Infinite loop
        false
      )
    );

    // Apply wind effect with slight horizontal movement
    if (wind !== 0) {
      const windOffset = wind * 50; // Wind moves raindrops left/right
      dropX.value = withDelay(
        delay,
        withRepeat(
          withTiming(x + windOffset, { 
            duration: animationDuration 
          }),
          -1,
          false
        )
      );
    }
  }, [dropY, dropX, delay, speed, wind, x]);

  const dropStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: dropY.value },
      { translateX: wind !== 0 ? dropX.value - x : 0 }
    ],
  }));

  return (
    <Animated.View style={[styles.raindrop, dropStyle, { left: x }]} />
  );
}

export default function RainyBackground({
  intensity = 0.6,
  wind = 0,
  night = 0,
}: RainyBackgroundProps) {
  // Create raindrops in columns for seamless continuous flow
  const columns = Math.floor(W / 30); // 30px spacing between columns
  const raindropsPerColumn = Math.max(3, Math.floor(intensity * 8)); // 3-11 drops per column
  const totalRaindrops = columns * raindropsPerColumn;
  
  const raindrops = Array.from({ length: totalRaindrops }, (_, i) => {
    const column = i % columns;
    const row = Math.floor(i / columns);
    const x = column * 30 + (Math.random() * 20); // Column position with slight variation
    const delay = row * (4000 / raindropsPerColumn) + (Math.random() * 500); // Staggered timing
    const speed = 0.8 + Math.random() * 0.4; // Consistent speed range
    
    return {
      id: i,
      x,
      delay,
      speed,
      wind: wind + (Math.random() - 0.5) * 0.2,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: night ? "#1a2030" : "#1e3a5f" }]}>
      {/* Stationary cloud layers - positioned lower and prominent */}
      <Cloud scale={1.0} opacity={0.8} y={-20} x={-50} />
      <Cloud scale={0.8} opacity={0.7} y={10} x={200} />
      <Cloud scale={0.9} opacity={0.75} y={40} x={-100} />

      {/* Raindrops - optimized for performance */}
      {raindrops.map((drop) => (
        <Raindrop
          key={drop.id}
          delay={drop.delay}
          x={drop.x}
          speed={drop.speed}
          wind={drop.wind}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  cloud: {
    position: "absolute",
    width: 600,
    height: 120,
  },
  cloudShape: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  cloudCircle: {
    position: "absolute",
    backgroundColor: "#FFFFFF", // Solid white color
    borderRadius: 50,
  },
  raindrop: {
    position: "absolute",
    width: 2,
    height: 80, // Increased height for longer raindrops
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 1,
    top: 0, // Base position, will be overridden by animation
  },
});
