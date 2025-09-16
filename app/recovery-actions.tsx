import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecoveryActions() {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const ritualActions = [
    { action: 'Tidy desk', emoji: '🧹' },
    { action: 'Write tomorrow\'s top task', emoji: '✍️' },
    { action: 'Close all tabs', emoji: '📱' },
    { action: 'Stretch', emoji: '🧘' },
    { action: 'Set status to offline', emoji: '🔴' },
    { action: 'Change into comfy clothes', emoji: '👕' },
    { action: 'Make a cup of tea', emoji: '☕' },
    { action: 'Take 3 deep breaths', emoji: '🫁' },
    { action: 'Journal for 5 minutes', emoji: '📖' },
    { action: 'Listen to calming music', emoji: '🎵' }
  ];

  const handleActionSelect = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (selectedActions.includes(action)) {
      setSelectedActions(selectedActions.filter(a => a !== action));
    } else if (selectedActions.length < 3) {
      setSelectedActions([...selectedActions, action]);
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/recovery-timing' as any);
  };

  const canContinue = selectedActions.length === 3;

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
          Choose your 3 ritual actions
        </Text>
        
        <Text style={styles.subtitle}>
          Pick 3 simple actions that will signal to your brain that the workday is over
        </Text>

        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedActions.length}/3 selected
          </Text>
        </View>

        <View style={styles.actionsGrid}>
          {ritualActions.map((item) => (
            <TouchableOpacity
              key={item.action}
              style={[
                styles.actionCard,
                selectedActions.includes(item.action) && styles.actionCardSelected
              ]}
              onPress={() => handleActionSelect(item.action)}
            >
              <Text style={styles.actionEmoji}>{item.emoji}</Text>
              <Text style={[
                styles.actionText,
                selectedActions.includes(item.action) && styles.actionTextSelected
              ]}>
                {item.action}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Why a ritual?</Text>
          <Text style={styles.explanationText}>
            A consistent closing ritual helps your brain create a clear boundary between work and rest, reducing mental residue and making the end of each day feel satisfying.
          </Text>
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
  selectionInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    width: '48%',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    alignItems: 'center',
  },
  actionCardSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,
  },
  actionTextSelected: {
    color: '#FFFFFF',
  },
  explanationContainer: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 32,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
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



