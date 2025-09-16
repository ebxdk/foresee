import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EnergyBudgetDrains() {
  const [drains, setDrains] = useState(['', '', '']);

  const handleDrainChange = (text: string, index: number) => {
    const newDrains = [...drains];
    newDrains[index] = text;
    setDrains(newDrains);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/energy-budget-categorize' as any);
  };

  const canContinue = drains.every(drain => drain.trim().length > 0);

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
          What drained your energy today?
        </Text>
        
        <Text style={styles.subtitle}>
          List 3 things that cost you mental or physical energy
        </Text>

        {drains.map((drain, index) => (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Drain #{index + 1}</Text>
            <TextInput
              style={styles.input}
              value={drain}
              onChangeText={(text) => handleDrainChange(text, index)}
              placeholder={`e.g., ${getPlaceholder(index)}`}
              placeholderTextColor="#999"
              multiline
            />
          </View>
        ))}

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

function getPlaceholder(index: number): string {
  const placeholders = [
    "difficult conversation with boss",
    "overwhelming task list",
    "negative social media scrolling"
  ];
  return placeholders[index] || "energy drain";
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
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




