import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEnergyBuffer, getScoreTails } from '../utils/storage';

interface EffectsMonitorProps {
  refreshTrigger?: number;
}

interface BufferInfo {
  source: string;
  multiplier: number;
  timeRemaining: number;
  progress: number;
}

interface TailInfo {
  source: string;
  duration: number;
  timeRemaining: number;
  progress: number;
  points: { P: number; C: number };
}

export default function EffectsMonitor({ refreshTrigger }: EffectsMonitorProps) {
  const [buffers, setBuffers] = useState<BufferInfo[]>([]);
  const [tails, setTails] = useState<TailInfo[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [pulseAnimation] = useState(new Animated.Value(1));

  // Fetch effects data
  const fetchEffectsData = async () => {
    try {
      const [buffer, tailsData] = await Promise.all([
        getEnergyBuffer(),
        getScoreTails()
      ]);

      console.log('🔍 Effects Monitor Debug:', { buffer, tailsData });

      const now = new Date();
      const newBuffers: BufferInfo[] = [];
      const newTails: TailInfo[] = [];

      // Process energy buffer
      if (buffer && buffer.active) {
        const startTime = new Date(buffer.startTime);
        const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const timeRemaining = Math.max(0, buffer.duration - hoursElapsed);
        const progress = Math.max(0, Math.min(1, hoursElapsed / buffer.duration));
        
        if (timeRemaining > 0) {
          newBuffers.push({
            source: buffer.source,
            multiplier: buffer.multiplier,
            timeRemaining: Math.max(0, timeRemaining),
            progress
          });
        }
      }

      // Process score tails
      tailsData.activeTails.forEach(tail => {
        const startTime = new Date(tail.startTime);
        const timeElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const timeRemaining = Math.max(0, tail.duration - timeElapsed);
        const progress = Math.min(1, timeElapsed / tail.duration);

        newTails.push({
          source: tail.source,
          duration: tail.duration,
          timeRemaining,
          progress,
          points: tail.initialPoints
        });
      });

      setBuffers(newBuffers);
      setTails(newTails);
      setLastUpdate(now);
    } catch (error) {
      console.error('Error fetching effects data:', error);
    }
  };

  // Fetch data every minute and when refreshTrigger changes
  useEffect(() => {
    fetchEffectsData();
    
    const interval = setInterval(fetchEffectsData, 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Pulse animation when effects are active
  useEffect(() => {
    if (buffers.length > 0 || tails.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [buffers.length, tails.length]);

  const formatTimeRemaining = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  const getToolDisplayName = (toolId: string): string => {
    const toolNames: Record<string, string> = {
      hydrationHero: 'Hydration Hero',
      postItPriority: 'Post-It Priority',
      oxygenMask: 'Oxygen Mask',
      nourishmentCheck: 'Nourishment Check',
      freshAirFix: 'Fresh Air Fix',
      phoneFreePause: 'Phone-Free Pause',
      pleasurePlaylist: 'Pleasure Playlist',
      mentalUnload: 'Mental Unload',
      connectionSpark: 'Connection Spark',
      sweetSpotScan: 'Sweet Spot Scan',
      boundaryBuilder: 'Boundary Builder',
      scheduleScrub: 'Schedule Scrub',
      energyBudgetCheck: 'Energy Budget Check',
      gratitudeGuardrail: 'Gratitude Guardrail',
      capacityAudit: 'Capacity Audit',
      recoveryRitual: 'Recovery Ritual',
      teachItForward: 'Teach It Forward',
      aimReview: 'AIM Review'
    };
    return toolNames[toolId] || toolId;
  };

  if (buffers.length === 0 && tails.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Effects Monitor</Text>
        <View style={styles.noEffectsContainer}>
          <Text style={styles.noEffectsIcon}>✨</Text>
          <Text style={styles.noEffectsText}>No active effects</Text>
          <Text style={styles.noEffectsSubtext}>Complete tools to see buffers and tails</Text>
        </View>
        <Text style={styles.lastUpdateText}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnimation }] }]}>
      <Text style={styles.title}>Effects Monitor</Text>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Energy Buffers */}
        {buffers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ Energy Buffers</Text>
            {buffers.map((buffer, index) => (
              <View key={index} style={styles.effectCard}>
                <View style={styles.effectHeader}>
                  <Text style={styles.effectName}>{getToolDisplayName(buffer.source)}</Text>
                  <Text style={styles.effectValue}>
                    {(buffer.multiplier * 100).toFixed(0)}% decay slowdown
                  </Text>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(1 - buffer.progress) * 100}%`,
                          backgroundColor: '#4CAF50'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.timeRemaining}>
                    {formatTimeRemaining(buffer.timeRemaining)} remaining
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Score Tails */}
        {tails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌊 Score Tails</Text>
            {tails.map((tail, index) => (
              <View key={index} style={styles.effectCard}>
                <View style={styles.effectHeader}>
                  <Text style={styles.effectName}>{getToolDisplayName(tail.source)}</Text>
                  <Text style={styles.effectValue}>
                    +{tail.points.P}P +{tail.points.C}C fading
                  </Text>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(1 - tail.progress) * 100}%`,
                          backgroundColor: '#2196F3'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.timeRemaining}>
                    {formatTimeRemaining(tail.timeRemaining)} remaining
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Text style={styles.lastUpdateText}>
        Last updated: {lastUpdate.toLocaleTimeString()}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    maxHeight: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  noEffectsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEffectsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noEffectsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  noEffectsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  effectCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  effectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  effectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  effectValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'right',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  timeRemaining: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
});

