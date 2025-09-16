import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

export default function AimReview() {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/aim-project' as any);
  };

  return (
    <LinearGradient
      colors={['#F97316', '#DC2626']}
      style={StyleSheet.absoluteFillObject}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="55" fill="#F97316" stroke="#000000" strokeWidth={6} />
              <Circle cx="60" cy="60" r="15" fill="#000000" />
              <Circle cx="60" cy="60" r="8" fill="#F97316" />
              <Path
                d="M60 25 L60 35 M60 85 L60 95 M25 60 L35 60 M85 60 L95 60"
                stroke="#000000"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          
          <Text style={styles.prompt}>
            Ready to reconnect with your why?
          </Text>
          
          <Text style={styles.subtext}>
            Let's link your daily tasks to deeper meaning and purpose.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  prompt: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtext: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.8,
  },
  bottomSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  getStartedButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    width: '85%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 