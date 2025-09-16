import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Rect, Svg } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function CapacityComplete() {
  const handleBackToTools = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Get cooldown status and effective points for Capacity Audit
      const cooldownStatus = await getToolCooldownStatus('capacityAudit');
      
      // Store the tool usage with effective points
      await storeToolUsage('capacityAudit', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('capacityAudit', cooldownStatus.effectivePoints);
      
      console.log('Capacity Audit completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Capacity Audit:', error);
    }
    
    router.push('/tools' as any);
  };

  return (
    <LinearGradient
      colors={['#10B981', '#3B82F6']}
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
              <Circle cx="60" cy="60" r="55" fill="#10B981" stroke="#000000" strokeWidth={6} />
              <Rect x="35" y="40" width="50" height="8" rx="4" fill="#000000" />
              <Rect x="35" y="55" width="40" height="8" rx="4" fill="#000000" />
              <Rect x="35" y="70" width="45" height="8" rx="4" fill="#000000" />
              <Circle cx="45" cy="44" r="2" fill="#10B981" />
              <Circle cx="45" cy="59" r="2" fill="#10B981" />
              <Circle cx="45" cy="74" r="2" fill="#10B981" />
            </Svg>
          </View>
          
          <Text style={styles.title}>
            Capacity protected! 🎯
          </Text>
          
          <Text style={styles.subtitle}>
            You've identified your 3 priorities that will move your week forward. Tomorrow, focus on these first - everything else is bonus. This approach builds pattern awareness around intentionality vs. overloading.
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



