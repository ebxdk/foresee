import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
}

export default function AnimatedScreenWrapper({ children }: AnimatedScreenWrapperProps) {
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200).springify()}
      exiting={FadeOut.duration(150)}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 