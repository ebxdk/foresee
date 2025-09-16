import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function RecoveryComplete() {
  const handleBackToTools = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Recovery Ritual
      const cooldownStatus = await getToolCooldownStatus('recoveryRitual');
      
      // Store the tool usage with effective points
      await storeToolUsage('recoveryRitual', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('recoveryRitual', cooldownStatus.effectivePoints);
      
      console.log('Recovery Ritual completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Recovery Ritual:', error);
    }
    
    router.push('/tools' as any);
  };

  return (
    <LinearGradient
      colors={['#F59E0B', '#EF4444']}
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
              <Circle cx="60" cy="60" r="55" fill="#F59E0B" stroke="#000000" strokeWidth={6} />
              <Path
                d="M40 50 L80 50 M40 65 L80 65 M40 80 L80 80"
                stroke="#000000"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <Circle cx="35" cy="50" r="3" fill="#10B981" />
              <Circle cx="35" cy="65" r="3" fill="#10B981" />
              <Circle cx="35" cy="80" r="3" fill="#10B981" />
              <Path
                d="M85 45 L95 45 L90 55 Z"
                fill="#000000"
              />
            </Svg>
          </View>
          
          <Text style={styles.title}>
            Recovery ritual created! 🕯️
          </Text>
          
          <Text style={styles.subtitle}>
            You now have a personal closing ritual that will help you disconnect from work and protect your mental energy. Each day at your chosen time, we'll guide you through your ritual steps.
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



