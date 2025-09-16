import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getEnergyDecayStatus, getDailyActivity } from '../utils/storage';

interface EnergyDecayStatusProps {
  onRefresh?: () => void;
}

export default function EnergyDecayStatus({ onRefresh }: EnergyDecayStatusProps) {
  const [decayStatus, setDecayStatus] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDecayStatus = async () => {
    try {
      setIsLoading(true);
      const [status, dailyActivity] = await Promise.all([
        getEnergyDecayStatus(),
        getDailyActivity()
      ]);
      
      setDecayStatus(status);
      setActivity(dailyActivity);
    } catch (error) {
      console.error('Error loading energy decay status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDecayStatus();
    
    // Refresh every minute to show real-time updates
    const interval = setInterval(loadDecayStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadDecayStatus();
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading energy status...</Text>
      </View>
    );
  }

  if (!decayStatus) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load energy status</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getActivityLevel = (steps: number) => {
    if (steps <= 2000) return 'Sedentary';
    if (steps <= 8000) return 'Light';
    if (steps <= 15000) return 'Moderate';
    return 'High';
  };

  const getDecayRateDescription = (rate: number) => {
    if (rate === 0) return 'No decay (sleeping)';
    if (rate <= 0.5) return 'Slow decay';
    if (rate <= 1.0) return 'Normal decay';
    if (rate <= 1.5) return 'Fast decay';
    return 'Very fast decay';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚡ Energy Decay Status</Text>
      
      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Decay Rate:</Text>
          <Text style={styles.value}>
            {decayStatus.currentDecayRate.toFixed(1)}/hour
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>
            {decayStatus.isDecayDue ? 'Decay Due' : 'Waiting'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Next Decay:</Text>
          <Text style={styles.value}>
            {formatTime(decayStatus.nextDecay)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Hours Until:</Text>
          <Text style={styles.value}>
            {decayStatus.hoursUntilDecay.toFixed(1)}h
          </Text>
        </View>
      </View>

      {/* Activity & Multipliers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity & Multipliers</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Today's Steps:</Text>
          <Text style={styles.value}>
            {activity?.steps?.toLocaleString() || 'N/A'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Activity Level:</Text>
          <Text style={styles.value}>
            {activity?.steps ? getActivityLevel(activity.steps) : 'N/A'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Activity Multiplier:</Text>
          <Text style={styles.value}>
            {decayStatus.activityMultiplier}x
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Buffer Active:</Text>
          <Text style={styles.value}>
            {decayStatus.bufferActive ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>

      {/* Decay Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Decay Description</Text>
        <Text style={styles.description}>
          {getDecayRateDescription(decayStatus.currentDecayRate)}
        </Text>
        {decayStatus.bufferActive && (
          <Text style={styles.bufferInfo}>
            🛡️ Energy buffer is slowing down decay
          </Text>
        )}
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>🔄 Refresh Status</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'right',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  bufferInfo: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
});
