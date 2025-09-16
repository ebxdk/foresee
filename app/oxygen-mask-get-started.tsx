import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function OxygenMaskGetStartedPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/oxygen-mask-breathe' as any);
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
            <Path fill="#000000" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" />
          </Svg>
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Visual + Text */}
          <View style={styles.messageSection}>
            <View style={styles.iconAndTextContainer}>
              {/* Oxygen Mask SVG */}
              <View style={styles.iconContainer}>
                <Svg width={180} height={180} viewBox="0 0 180 180">
                  {/* Mask body */}
                  <Rect x={40} y={60} rx={24} ry={24} width={100} height={70} fill="#0EA5E9" />
                  {/* Central filter circle */}
                  <Circle cx={90} cy={95} r={18} fill="#38BDF8" />
                  {/* Straps */}
                  <Path d="M40 90 C 20 80, 20 60, 40 50" stroke="#0EA5E9" strokeWidth={12} fill="none" />
                  <Path d="M140 90 C 160 80, 160 60, 140 50" stroke="#0EA5E9" strokeWidth={12} fill="none" />
                  {/* Shine */}
                  <Path d="M62 68 C 82 58, 108 58, 118 68" stroke="#7DD3FC" strokeWidth={6} fill="none" />
                </Svg>
              </View>

              {/* Title + Subtitle */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>When your system is sounding the alarm…</Text>
                <Text style={styles.subtitle}>
                  The Oxygen Mask helps you regulate in minutes. Rate your tension, then follow a guided box-breath — inhale, hold, exhale, hold — synced with subtle cues. Five rounds to downshift your nervous system.
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom CTA */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
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
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 50,
  },
  messageSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 80,
  },
  iconAndTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 30,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 0,
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
    textAlign: 'left',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
}); 