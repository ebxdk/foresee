import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Import storage utility to complete onboarding

interface HealthSource {
  id: string;
  name: string;
  description: string;
  category: 'Sleep' | 'Activity' | 'HR/HRV' | 'Mindfulness' | 'Mood';
  integrationMethod: 'HealthKit' | 'Direct API';
  isConnected: boolean;
  isAvailable: boolean;
  icon: string;
}

// Enterprise-friendly health sources only
const HEALTH_SOURCES: HealthSource[] = [
  // Sleep
  {
    id: 'apple-sleep',
    name: 'Apple Sleep',
    description: 'Sleep tracking from Apple Watch and iPhone',
    category: 'Sleep',
    integrationMethod: 'HealthKit',
    isConnected: true, // Mock connection for demo
    isAvailable: true,
    icon: '😴'
  },
  {
    id: 'autosleep',
    name: 'AutoSleep',
    description: 'Automatic sleep tracking with Apple Watch',
    category: 'Sleep',
    integrationMethod: 'HealthKit',
    isConnected: false,
    isAvailable: true,
    icon: '🌙'
  },
  
  // Activity
  {
    id: 'apple-fitness',
    name: 'Apple Fitness',
    description: 'Activity rings and workout data',
    category: 'Activity',
    integrationMethod: 'HealthKit',
    isConnected: true, // Mock connection for demo
    isAvailable: true,
    icon: '🏃‍♂️'
  },
  {
    id: 'apple-watch',
    name: 'Apple Watch',
    description: 'Steps, heart rate, and activity data',
    category: 'Activity',
    integrationMethod: 'HealthKit',
    isConnected: true, // Mock connection for demo
    isAvailable: true,
    icon: '⌚'
  },
  
  // Heart Rate / HRV
  {
    id: 'apple-watch-hr',
    name: 'Apple Watch Heart Rate',
    description: 'Continuous heart rate and HRV monitoring',
    category: 'HR/HRV',
    integrationMethod: 'HealthKit',
    isConnected: true, // Mock connection for demo
    isAvailable: true,
    icon: '❤️'
  },
  {
    id: 'heartwatch',
    name: 'HeartWatch',
    description: 'Advanced heart rate analysis and trends',
    category: 'HR/HRV',
    integrationMethod: 'HealthKit',
    isConnected: false,
    isAvailable: true,
    icon: '💓'
  },
  
  // Mindfulness
  {
    id: 'apple-mindfulness',
    name: 'Apple Mindfulness',
    description: 'Breathe app and mindfulness minutes',
    category: 'Mindfulness',
    integrationMethod: 'HealthKit',
    isConnected: true, // Mock connection for demo
    isAvailable: true,
    icon: '🧘‍♀️'
  },
  {
    id: 'headspace',
    name: 'Headspace',
    description: 'Meditation and mindfulness sessions',
    category: 'Mindfulness',
    integrationMethod: 'HealthKit',
    isConnected: false,
    isAvailable: true,
    icon: '🎯'
  },
  
  // Mood
  {
    id: 'apple-health-checkin',
    name: 'Apple Health Check-In',
    description: 'Daily mood and emotion tracking',
    category: 'Mood',
    integrationMethod: 'HealthKit',
    isConnected: true, // Mock connection for demo
    isAvailable: true,
    icon: '😊'
  },
  {
    id: 'moodnotes',
    name: 'MoodNotes',
    description: 'Mood tracking with insights',
    category: 'Mood',
    integrationMethod: 'HealthKit',
    isConnected: false,
    isAvailable: true,
    icon: '📝'
  }
];

export default function ConnectHealthSourcesScreen() {
  const [healthSources, setHealthSources] = useState<HealthSource[]>(HEALTH_SOURCES);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleConnection = (id: string) => {
    setHealthSources(prev =>
      prev.map(source =>
        source.id === id
          ? { ...source, isConnected: !source.isConnected }
          : source
      )
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getConnectedCount = () => {
    return healthSources.filter(source => source.isConnected).length;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sleep': return '#6366F1';
      case 'Activity': return '#10B981';
      case 'HR/HRV': return '#EF4444';
      case 'Mindfulness': return '#8B5CF6';
      case 'Mood': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const groupedSources = healthSources.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = [];
    }
    acc[source.category].push(source);
    return acc;
  }, {} as Record<string, HealthSource[]>);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect Health Sources</Text>
        <Text style={styles.subtitle}>
          Connect health sources to get more accurate burnout predictions. This step is optional but recommended for better insights.
        </Text>
        
        {/* Demo Banner */}
        <View style={styles.demoBanner}>
          <Text style={styles.demoIcon}>🧪</Text>
          <View style={styles.demoTextContainer}>
            <Text style={styles.demoTitle}>Demo Mode</Text>
            <Text style={styles.demoDescription}>
              Using realistic mock health data for Expo/Replit environment
            </Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getConnectedCount()}</Text>
            <Text style={styles.statLabel}>Connected</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{healthSources.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedSources).map(([category, sources]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            
            {sources.map((source) => (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.sourceCard,
                  source.isConnected && styles.sourceCardConnected
                ]}
                onPress={() => toggleConnection(source.id)}
                disabled={isLoading}
              >
                <View style={styles.sourceInfo}>
                  <Text style={styles.sourceIcon}>{source.icon}</Text>
                  <View style={styles.sourceText}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text style={styles.sourceDescription}>{source.description}</Text>
                  </View>
                </View>
                
                <View style={styles.sourceAction}>
                  <View style={[
                    styles.connectionToggle,
                    source.isConnected && styles.connectionToggleConnected
                  ]}>
                    {source.isConnected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🎯 How Health Data Improves Predictions</Text>
          <Text style={styles.infoText}>
            • Sleep quality affects your Energy score (±15 points){'\n'}
            • Activity levels influence Energy and Purpose{'\n'}
            • Heart rate variability indicates recovery status{'\n'}
            • Mood tracking enhances Purpose and Connection insights{'\n'}
            • Mindfulness data helps calibrate stress levels
          </Text>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🔒 Privacy & Security</Text>
          <Text style={styles.infoText}>
            • All health data stays on your device{'\n'}
            • We only access aggregate trends, not raw data{'\n'}
            • You can disconnect sources anytime{'\n'}
            • Enterprise-grade security and compliance
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push('/(tabs)/radar')}
        >
          <Text style={styles.continueButtonText}>Continue to Radar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push('/(tabs)/radar')}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  categorySection: {
    marginTop: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sourceCardConnected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sourceText: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  sourceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  integrationBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  integrationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  connectionToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionToggleActive: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 100,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  demoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 2,
  },
  demoDescription: {
    fontSize: 12,
    color: '#856404',
    opacity: 0.8,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sourceAction: {
    alignItems: 'flex-end',
  },
  connectionToggleConnected: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  checkmark: {
    fontSize: 18,
    color: '#FFFFFF',
  },
}); 