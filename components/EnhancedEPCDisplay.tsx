import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EPCScores } from '../utils/epcScoreCalc';
import { getEnergyBuffer, getScoreTails } from '../utils/storage';
import EPCExplanationModal from './EPCExplanationModal';

interface EnhancedEPCDisplayProps {
  scores: EPCScores;
  onScoresChange?: (newScores: EPCScores) => void;
}

interface EffectStatus {
  bufferActive: boolean;
  bufferMultiplier: number;
  bufferTimeRemaining: number;
  tailsActive: number;
  tailEffects: { P: number; C: number };
}

export default function EnhancedEPCDisplay({ scores, onScoresChange }: EnhancedEPCDisplayProps) {
  const [effectStatus, setEffectStatus] = useState<EffectStatus>({
    bufferActive: false,
    bufferMultiplier: 1,
    bufferTimeRemaining: 0,
    tailsActive: 0,
    tailEffects: { P: 0, C: 0 }
  });

  const [pulseAnimation] = useState(new Animated.Value(1));
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch effect status every minute
  useEffect(() => {
    const fetchEffectStatus = async () => {
      try {
        const [buffer, tails] = await Promise.all([
          getEnergyBuffer(),
          getScoreTails()
        ]);

        const now = new Date();
        let bufferTimeRemaining = 0;
        let bufferMultiplier = 1;

        if (buffer && buffer.endTime > now) {
          bufferTimeRemaining = Math.max(0, (buffer.endTime.getTime() - now.getTime()) / (1000 * 60 * 60));
          bufferMultiplier = buffer.multiplier;
        }

        setEffectStatus({
          bufferActive: !!(buffer && buffer.endTime && buffer.endTime > now),
          bufferMultiplier,
          bufferTimeRemaining: Math.round(bufferTimeRemaining * 10) / 10,
          tailsActive: tails.activeTails.length,
          tailEffects: tails.currentImpact
        });
      } catch (error) {
        console.error('Error fetching effect status:', error);
      }
    };

    // Fetch immediately
    fetchEffectStatus();

    // Update every minute
    const interval = setInterval(fetchEffectStatus, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Pulse animation when effects are active
  useEffect(() => {
    if (effectStatus.bufferActive || effectStatus.tailsActive > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [effectStatus.bufferActive, effectStatus.tailsActive]);

  const formatTimeRemaining = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  const handleEPCPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const getBarColor = (label: string) => {
    switch (label) {
      case 'Energy': return '#FF6B6B';
      case 'Purpose': return '#4ECDC4';
      case 'Connection': return '#45B7D1';
      default: return '#8E8E93';
    }
  };

  const renderScoreBar = (label: string, value: number, key: keyof EPCScores) => {
    const isEnergy = key === 'energy';
    const hasBuffer = isEnergy && effectStatus.bufferActive;
    const tailKey = (key === 'purpose' ? 'P' : key === 'connection' ? 'C' : undefined);
    const hasTail = !isEnergy && tailKey && effectStatus.tailEffects[tailKey] > 0;

    return (
      <View key={label} style={styles.scoreBarContainer}>
        <View style={styles.scoreLabelRow}>
          <Text style={styles.scoreLabel}>{label}</Text>
          {hasBuffer && (
            <View style={styles.bufferIndicator}>
              <Text style={styles.bufferText}>🛡️ {effectStatus.bufferMultiplier}x</Text>
            </View>
          )}
          {hasTail && (
            <View style={styles.tailIndicator}>
              <Text style={styles.tailText}>🌊 +{effectStatus.tailEffects[tailKey!]}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.barContainer}>
          <View style={[styles.barBackground, { backgroundColor: getBarColor(label) + '20' }]}>
            <Animated.View 
              style={[
                styles.barFill, 
                { 
                  width: `${value}%`,
                  backgroundColor: getBarColor(label),
                  transform: [{ scale: hasBuffer || hasTail ? pulseAnimation : 1 }]
                }
              ]} 
            />
          </View>
          <Text style={styles.scoreValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.touchableContainer}
        onPress={handleEPCPress}
        activeOpacity={0.95}
      >
        <Animated.View style={[styles.container, { transform: [{ scale: pulseAnimation }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>EPC Scores</Text>
            {(effectStatus.bufferActive || effectStatus.tailsActive > 0) && (
              <View style={styles.activeEffectsIndicator}>
                <Text style={styles.activeEffectsText}>
                  {effectStatus.bufferActive && effectStatus.tailsActive > 0 ? '🛡️🌊' : 
                   effectStatus.bufferActive ? '🛡️' : '🌊'}
                </Text>
              </View>
            )}
          </View>

      <View style={styles.scoresContainer}>
        {renderScoreBar('Energy', scores.energy, 'energy')}
        {renderScoreBar('Purpose', scores.purpose, 'purpose')}
        {renderScoreBar('Connection', scores.connection, 'connection')}
      </View>

      {/* Effects Status */}
      {(effectStatus.bufferActive || effectStatus.tailsActive > 0) && (
        <View style={styles.effectsStatus}>
          {effectStatus.bufferActive && (
            <View style={styles.effectItem}>
              <Text style={styles.effectIcon}>🛡️</Text>
              <Text style={styles.effectText}>
                Energy decay slowed by {((1 - effectStatus.bufferMultiplier) * 100).toFixed(0)}%
              </Text>
              <Text style={styles.effectTime}>
                {formatTimeRemaining(effectStatus.bufferTimeRemaining)} remaining
              </Text>
            </View>
          )}
          
          {effectStatus.tailsActive > 0 && (
            <View style={styles.effectItem}>
              <Text style={styles.effectIcon}>🌊</Text>
              <Text style={styles.effectText}>
                {effectStatus.tailsActive} active score tail{effectStatus.tailsActive > 1 ? 's' : ''}
              </Text>
              <Text style={styles.effectTime}>
                +{effectStatus.tailEffects.P}P +{effectStatus.tailEffects.C}C active
              </Text>
            </View>
          )}
        </View>
      )}
        </Animated.View>
      </TouchableOpacity>

      <EPCExplanationModal 
        visible={modalVisible} 
        onClose={handleModalClose} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  touchableContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  activeEffectsIndicator: {
    backgroundColor: '#FFE4E1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeEffectsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoresContainer: {
    gap: 16,
  },
  scoreBarContainer: {
    gap: 8,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  bufferIndicator: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bufferText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tailIndicator: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    minWidth: 30,
    textAlign: 'right',
  },
  effectsStatus: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  effectIcon: {
    fontSize: 16,
  },
  effectText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  effectTime: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
});

