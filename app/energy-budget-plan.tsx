import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DrainItem {
  text: string;
  category: string;
}

export default function EnergyBudgetPlan() {
  const [selectedDrain, setSelectedDrain] = useState<number | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const drains: DrainItem[] = [
    { text: 'Difficult conversation with boss', category: 'Drain' },
    { text: 'Overwhelming task list', category: 'Drain' },
    { text: 'Negative social media scrolling', category: 'Drain' },
  ];

  const handleDrainSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDrain(index);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/energy-budget-complete' as any);
  };

  const canContinue = selectedDrain !== null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Pick one drain to reduce tomorrow
        </Text>
        
        <Text style={styles.subtitle}>
          Choose the most impactful energy drain to work on
        </Text>

        {drains.map((drain, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.drainCard,
              selectedDrain === index && styles.drainCardSelected
            ]}
            onPress={() => handleDrainSelect(index)}
          >
            <View style={styles.drainHeader}>
              <Text style={styles.drainText}>{drain.text}</Text>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{drain.category}</Text>
              </View>
            </View>
            
            {selectedDrain === index && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedText}>✓ Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.reminderSection}>
          <Text style={styles.reminderTitle}>Set a reminder?</Text>
          <Text style={styles.reminderSubtitle}>
            We'll check in tomorrow to see how it went
          </Text>
          
          <TouchableOpacity
            style={[
              styles.reminderToggle,
              reminderEnabled && styles.reminderToggleEnabled
            ]}
            onPress={() => setReminderEnabled(!reminderEnabled)}
          >
            <Text style={styles.reminderToggleText}>
              {reminderEnabled ? 'Reminder enabled' : 'No reminder'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.continueContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
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
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  drainCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  drainCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  drainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  categoryTag: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedIndicator: {
    marginTop: 12,
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  reminderSection: {
    marginTop: 32,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  reminderSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  reminderToggle: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  reminderToggleEnabled: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  reminderToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  continueContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    width: '85%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});




