import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';

export default function EnergyBudgetCheck() {
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/energy-budget-drains' as any);
  };

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FFE66D']}
      style={StyleSheet.absoluteFillObject}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="55" fill="#FF6B6B" stroke="#000000" strokeWidth={6} />
              <Path
                d="M40 45 L80 45 M40 60 L80 60 M40 75 L80 75"
                stroke="#000000"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <Circle cx="35" cy="45" r="3" fill="#22C55E" />
              <Circle cx="35" cy="60" r="3" fill="#EF4444" />
              <Circle cx="35" cy="75" r="3" fill="#6B7280" />
            </Svg>
          </View>
          
          <Text style={styles.prompt}>
            Ready to find your hidden energy drains?
          </Text>
          
          <Text style={styles.subtext}>
            Let's identify what's really costing you energy and make a plan to protect it tomorrow.
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