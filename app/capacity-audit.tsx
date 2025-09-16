import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Rect, Svg } from 'react-native-svg';

export default function CapacityAudit() {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/capacity-tasks' as any);
  };

  return (
    <LinearGradient
      colors={['#10B981', '#3B82F6']}
      style={StyleSheet.absoluteFillObject}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="55" fill="#10B981" stroke="#000000" strokeWidth={6} />
              <Rect x="35" y="40" width="50" height="8" rx="4" fill="#000000" />
              <Rect x="35" y="55" width="40" height="8" rx="4" fill="#000000" />
              <Rect x="35" y="70" width="45" height="8" rx="4" fill="#000000" />
              <Circle cx="45" cy="44" r="2" fill="#10B981" />
              <Circle cx="45" cy="59" r="2" fill="#10B981" />
              <Circle cx="45" cy="74" r="2" fill="#10B981" />
            </Svg>
          </View>
          
          <Text style={styles.prompt}>
            Ready to protect your capacity?
          </Text>
          
          <Text style={styles.subtext}>
            Let's identify your top 3 priorities that will move your week forward, not just fill your time.
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