import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function MentalUnloadRecordPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  // Animation values for recording feedback
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const startRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(true);
    
    // Start pulsing animation
    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 800 }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.6, { duration: 800 }),
      -1,
      true
    );
    
    // TODO: Implement actual recording logic here
    // For now, simulate transcription after 3 seconds
    setTimeout(() => {
      setTranscription("This is a simulated transcription of your mental unload. In the real app, this would be your actual voice converted to text.");
    }, 3000);
  };

  const stopRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(false);
    
    // Stop animations
    pulseScale.value = withTiming(1, { duration: 200 });
    pulseOpacity.value = withTiming(1, { duration: 200 });
    
    // Navigate to transcription page after a brief delay
    setTimeout(() => {
      router.push({
        pathname: '/mental-unload-transcribe',
        params: { transcription }
      });
    }, 500);
  };

  const animatedMicStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

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
          {/* Instructions */}
          <View style={styles.instructionsSection}>
            <Text style={styles.title}>Mental Unload</Text>
            <Text style={styles.subtitle}>
              Press and hold the microphone to record your thoughts.{'\n'}
              Speak freely for up to 60 seconds — no filters.
            </Text>
          </View>

          {/* Microphone Section */}
          <View style={styles.microphoneSection}>
            <TouchableOpacity
              style={styles.microphoneButton}
              onPressIn={startRecording}
              onPressOut={stopRecording}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.microphoneContainer, animatedMicStyle]}>
                <Svg width={120} height={120} viewBox="0 0 120 120">
                  {/* Microphone body */}
                  <Circle cx="60" cy="60" r="50" fill={isRecording ? "#EF4444" : "#F3F4F6"} stroke="#000" strokeWidth="3"/>
                  
                  {/* Microphone top */}
                  <Path
                    fill="#000"
                    d="M60,20 L60,40 M50,40 L70,40 M50,40 L50,50 M70,40 L70,50"
                  />
                  
                  {/* Microphone stand */}
                  <Rect x="55" y="50" width="10" height="40" rx="5" fill="#000"/>
                  
                  {/* Recording indicator */}
                  {isRecording && (
                    <Circle cx="60" cy="60" r="45" fill="none" stroke="#EF4444" strokeWidth="4" opacity="0.6"/>
                  )}
                </Svg>
              </Animated.View>
            </TouchableOpacity>
            
            <Text style={styles.recordingText}>
              {isRecording ? 'Release to stop recording' : 'Press and hold to record'}
            </Text>
          </View>

          {/* Status Section */}
          <View style={styles.statusSection}>
            {isRecording && (
              <View style={styles.recordingStatus}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingStatusText}>Recording...</Text>
              </View>
            )}
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
  instructionsSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 44,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  microphoneSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  microphoneButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  microphoneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  recordingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 12,
  },
  recordingStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

