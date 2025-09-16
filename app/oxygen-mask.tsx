import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function OxygenMaskPage() {
  const [completed, setCompleted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!timerRunning && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, seconds]);

  const handleStartTimer = () => {
    setTimerRunning(true);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    if (seconds >= 60) { // 1 minute minimum
      setCompleted(true);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8FA" />

      {/* Main Content */}
      <Animated.View style={styles.content} entering={FadeIn.duration(400)}>
        <Text style={styles.title}>The Oxygen Mask</Text>
        <Text style={styles.subtitle}>Step away and breathe for at least 1 minute.</Text>
        
        <Animated.View style={styles.iconContainer} entering={FadeIn.duration(600).delay(200)}>
          <Text style={styles.icon}>😮‍💨</Text>
        </Animated.View>

        {!completed && !timerRunning && (
          <Animated.View style={styles.actionContainer} entering={FadeIn.duration(400).delay(400)}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartTimer}>
              <Text style={styles.primaryButtonText}>Start Breathing</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {timerRunning && !completed && (
          <Animated.View style={styles.actionContainer} entering={FadeIn.duration(300)}>
            <Text style={styles.timer}>{formatTime(seconds)}</Text>
            <Text style={styles.timerInstruction}>Breathe deeply and mindfully...</Text>
            <TouchableOpacity style={styles.stopButton} onPress={handleStopTimer}>
              <Text style={styles.stopButtonText}>
                {seconds >= 60 ? 'Complete' : `Continue (${60 - seconds}s remaining)`}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {completed && (
          <Animated.View style={styles.completionContainer} entering={FadeIn.duration(500)}>
            <Text style={styles.completionEmoji}>🌬️</Text>
            <Text style={styles.completionText}>Perfect! You've given yourself the gift of breath and presence.</Text>
            <TouchableOpacity style={styles.doneButton} onPress={handleBack}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 26,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  icon: {
    fontSize: 120,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 20,
  },
  timerInstruction: {
    fontSize: 20,
    color: '#374151',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  stopButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  completionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  completionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  completionText: {
    fontSize: 22,
    color: '#1D4ED8',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
  },
  doneButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 50,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
}); 