import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function OxygenMaskCompleteScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      // Get cooldown status and effective points for Oxygen Mask
      const cooldownStatus = await getToolCooldownStatus('oxygenMask');
      
      // Store the tool usage with effective points
      await storeToolUsage('oxygenMask', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('oxygenMask', cooldownStatus.effectivePoints);
      
      console.log('Oxygen Mask completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Oxygen Mask:', error);
    }
    
    router.push('/tools');
  };

  return (
    <View style={styles.container}>
      {/* Sunset gradient background */}
      <LinearGradient
        colors={[ '#FFF1E0', '#FFD4A3', '#FFA24C', '#FF7A3D', '#E24B2B' ]}
        locations={[0, 0.22, 0.5, 0.75, 1]}
        start={{ x: 0.15, y: 0.0 }}
        end={{ x: 0.95, y: 1.0 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path fill="#000000" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" />
        </Svg>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>All clear. Nicely done.</Text>
        <Text style={styles.subtitle}>Five calm rounds complete — your nervous system just got a reset.</Text>
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Sounds good</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 30,
  },
  finishButton: {
    position: 'absolute',
    bottom: 40,
    left: 32,
    right: 32,
    backgroundColor: '#000000',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
}); 