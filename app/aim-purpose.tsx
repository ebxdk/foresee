import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AimPurpose() {
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');
  const [customPurpose, setCustomPurpose] = useState<string>('');

  const commonPurposes = [
    'Financial freedom',
    'Making a difference',
    'Personal growth',
    'Family security',
    'Creative expression',
    'Helping others',
    'Building legacy',
    'Inner peace'
  ];

  const handlePurposeSelect = (purpose: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPurpose(purpose);
    setCustomPurpose('');
  };

  const handleCustomPurpose = (text: string) => {
    setCustomPurpose(text);
    setSelectedPurpose('');
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/aim-complete' as any);
  };

  const canContinue = selectedPurpose !== '' || customPurpose.trim() !== '';

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
          What's your deeper why?
        </Text>
        
        <Text style={styles.subtitle}>
          Connect your project to a deeper purpose that gives it meaning beyond just getting things done
        </Text>

        <View style={styles.purposesGrid}>
          {commonPurposes.map((purpose) => (
            <TouchableOpacity
              key={purpose}
              style={[
                styles.purposeCard,
                selectedPurpose === purpose && styles.purposeCardSelected
              ]}
              onPress={() => handlePurposeSelect(purpose)}
            >
              <Text style={[
                styles.purposeText,
                selectedPurpose === purpose && styles.purposeTextSelected
              ]}>
                {purpose}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customSection}>
          <Text style={styles.customLabel}>Or add your own:</Text>
          <TextInput
            style={styles.customInput}
            value={customPurpose}
            onChangeText={handleCustomPurpose}
            placeholder="e.g., Building community, Learning for curiosity, Creating beauty..."
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.connectionContainer}>
          <Text style={styles.connectionTitle}>🔗 Making the connection</Text>
          <Text style={styles.connectionText}>
            Think about how your project serves this deeper purpose. For example: "I'm working on this presentation because it helps me make a difference in my team's success" or "I'm learning this skill because it contributes to my personal growth."
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
  purposesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  purposeCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignItems: 'center',
  },
  purposeCardSelected: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  purposeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  purposeTextSelected: {
    color: '#FFFFFF',
  },
  customSection: {
    marginBottom: 32,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  customInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  connectionContainer: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 32,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  connectionText: {
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



