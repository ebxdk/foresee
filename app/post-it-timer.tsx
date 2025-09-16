import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const TOTAL_SECONDS = 25 * 60;

export default function PostItTimerScreen() {
  const router = useRouter();
  const { task = '' } = useLocalSearchParams<{ task?: string }>();

  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = useMemo(() => `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, [minutes, seconds]);

  useEffect(() => {
    // Auto start timer
    startedAtRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (!startedAtRef.current) return;
      const elapsedMs = Date.now() - startedAtRef.current;
      const remaining = Math.max(0, TOTAL_SECONDS - Math.floor(elapsedMs / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(intervalRef.current as number);
        intervalRef.current = null;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({ pathname: '/post-it-congrats', params: { task: String(task) } });
      }
    }, 250);

    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current as number);
      intervalRef.current = null;
    };
  }, [router, task]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/tools');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
              fill="#000000"
              d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Focus timer</Text>
          <Text style={styles.subtitle}>
            Stay with it for 25 minutes. You chose:
          </Text>
          {!!task && <Text style={styles.taskText}>{String(task)}</Text>}

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeString}</Text>
          </View>
        </View>

        {/* Bottom buttons */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip to tools</Text>
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
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    textAlign: 'left',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 32,
    marginBottom: 16,
    textAlign: 'left',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  taskText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
  },
  timerContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 2,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomRow: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 40,
  },
  skipButton: {
    width: '100%',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  skipButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 18,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 