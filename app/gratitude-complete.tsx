import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function GratitudeComplete() {
  const handleBackToTools = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Gratitude Guardrail
      const cooldownStatus = await getToolCooldownStatus('gratitudeGuardrail');
      
      // Store the tool usage with effective points
      await storeToolUsage('gratitudeGuardrail', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('gratitudeGuardrail', cooldownStatus.effectivePoints);
      
      console.log('Gratitude Guardrail completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Gratitude Guardrail:', error);
    }
    
    router.push('/tools' as any);
  };

  return (
    <LinearGradient
      colors={['#8B5CF6', '#EC4899']}
      style={StyleSheet.absoluteFillObject}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="55" fill="#8B5CF6" stroke="#000000" strokeWidth={6} />
              <Path
                d="M45 50 Q60 35 75 50 Q60 65 45 50"
                fill="#FCD34D"
                stroke="#000000"
                strokeWidth={2}
              />
              <Path
                d="M60 35 L60 25 M55 30 L65 30"
                stroke="#000000"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          
          <Text style={styles.title}>
            Gratitude cultivated! 💖
          </Text>
          
          <Text style={styles.subtitle}>
            You've created a meaningful connection through appreciation. This kind of reflection strengthens relationships and deepens your own sense of gratitude.
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.getStartedButton} onPress={handleBackToTools}>
            <Text style={styles.getStartedButtonText}>Back to Tools</Text>
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
  header: {
    paddingTop: 40,
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
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



