import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function GratitudePerson() {
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [customPerson, setCustomPerson] = useState<string>('');

  const commonPeople = [
    'My partner',
    'My best friend',
    'My mom',
    'My dad',
    'My sibling',
    'My colleague',
    'My mentor',
    'My neighbor'
  ];

  const handlePersonSelect = (person: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPerson(person);
    setCustomPerson('');
  };

  const handleCustomPerson = (text: string) => {
    setCustomPerson(text);
    setSelectedPerson('');
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/gratitude-reflection' as any);
  };

  const canContinue = selectedPerson !== '' || customPerson.trim() !== '';

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
          Who made an impact on you?
        </Text>
        
        <Text style={styles.subtitle}>
          Think of someone who supported you, changed your mood, or gave you insight recently
        </Text>

        <View style={styles.peopleGrid}>
          {commonPeople.map((person) => (
            <TouchableOpacity
              key={person}
              style={[
                styles.personCard,
                selectedPerson === person && styles.personCardSelected
              ]}
              onPress={() => handlePersonSelect(person)}
            >
              <Text style={[
                styles.personText,
                selectedPerson === person && styles.personTextSelected
              ]}>
                {person}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customSection}>
          <Text style={styles.customLabel}>Or add someone else:</Text>
          <TextInput
            style={styles.customInput}
            value={customPerson}
            onChangeText={handleCustomPerson}
            placeholder="e.g., My teacher, My coach, My therapist..."
            placeholderTextColor="#999"
          />
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
  peopleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  personCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignItems: 'center',
  },
  personCardSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  personText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  personTextSelected: {
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



