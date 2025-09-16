import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function BoundaryBuilderRehearsePage() {
  const router = useRouter();
  const { situation, finalScript } = useLocalSearchParams<{ situation: string; finalScript: string }>();
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePracticeAloud = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In the future, this could trigger voice recording or other practice features
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000); // Simulate practice session
  };

  const handleHearSpoken = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In the future, this would integrate with AI voice generation
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000); // Simulate AI voice playback
  };

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/boundary-builder-complete',
      params: { 
        situation: situation,
        finalScript: finalScript 
      }
    });
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
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Rehearse Your Boundary</Text>
            <Text style={styles.subtitle}>Practice builds confidence. The more you rehearse, the easier it becomes to set boundaries in real situations.</Text>
          </View>

          {/* Script Display Section */}
          <View style={styles.scriptSection}>
            <Text style={styles.sectionTitle}>Your boundary script:</Text>
            <View style={styles.scriptContainer}>
              <Text style={styles.scriptText}>
                {finalScript || "No script available. Please go back and try again."}
              </Text>
            </View>
          </View>

          {/* Rehearsal Options Section */}
          <View style={styles.rehearsalSection}>
            <Text style={styles.sectionTitle}>Choose how to practice:</Text>
            
            {/* Practice Aloud Button */}
            <TouchableOpacity
              style={[
                styles.rehearsalButton,
                isPlaying && styles.rehearsalButtonActive
              ]}
              onPress={handlePracticeAloud}
              disabled={isPlaying}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonIcon}>
                  <Svg width={32} height={32} viewBox="0 0 32 32">
                    <Circle cx="16" cy="16" r="14" fill="none" stroke="#000" strokeWidth="2"/>
                    <Path
                      fill="#000"
                      d="M12,12 L20,16 L12,20 Z"
                    />
                  </Svg>
                </View>
                <View style={styles.buttonText}>
                  <Text style={styles.buttonTitle}>Practice Aloud</Text>
                  <Text style={styles.buttonSubtitle}>Say your boundary script out loud to yourself</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Hear Spoken Button */}
            <TouchableOpacity
              style={[
                styles.rehearsalButton,
                isPlaying && styles.rehearsalButtonActive
              ]}
              onPress={handleHearSpoken}
              disabled={isPlaying}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonIcon}>
                  <Svg width={32} height={32} viewBox="0 0 32 32">
                    <Circle cx="16" cy="16" r="14" fill="none" stroke="#000" strokeWidth="2"/>
                    <Path
                      fill="#000"
                      d="M10,12 L22,12 L22,20 L10,20 Z"
                    />
                    <Path
                      fill="#000"
                      d="M12,14 L20,14 M12,16 L18,16 M12,18 L16,18"
                    />
                  </Svg>
                </View>
                <View style={styles.buttonText}>
                  <Text style={styles.buttonTitle}>Hear It Spoken</Text>
                  <Text style={styles.buttonSubtitle}>Listen to your boundary script being spoken</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Complete Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>Complete</Text>
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
    paddingTop: 100,
    paddingBottom: 60,
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
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
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
    paddingHorizontal: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scriptSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scriptContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    padding: 24,
    alignItems: 'center',
    minHeight: 100,
  },
  scriptText: {
    fontSize: 18,
    color: '#92400E',
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  rehearsalSection: {
    flex: 1,
    marginBottom: 40,
  },
  rehearsalButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 20,
    marginBottom: 16,
    minHeight: 80,
  },
  rehearsalButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 16,
  },
  buttonText: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  completeButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
