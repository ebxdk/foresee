import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TeachSharing() {
  const [selectedOption, setSelectedOption] = useState<string>('');

  const sharingOptions = [
    {
      id: 'tip-stream',
      title: 'Share to Tip Stream',
      subtitle: 'Add to our anonymous collection of wisdom',
      emoji: '🌊',
      description: 'Your tip joins a stream of insights that others can browse for inspiration. Completely anonymous and community-driven.'
    },
    {
      id: 'copy-template',
      title: 'Copy Template',
      subtitle: 'Get a formatted message to share manually',
      emoji: '📋',
      description: 'We\'ll format your tip into a shareable message that starts with "Quick tip I learned this week..." You can then send it to specific friends.'
    },
    {
      id: 'teach-yourself',
      title: 'Teach Yourself',
      subtitle: 'Reflect on how you\'d explain it',
      emoji: '📖',
      description: 'Journal about how you\'d teach this concept to someone else. This deepens your own understanding and prepares you for future sharing.'
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/teach-complete' as any);
  };

  const canContinue = selectedOption !== '';

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
          How would you like to share?
        </Text>
        
        <Text style={styles.subtitle}>
          Choose how you want to spread your wisdom. All options are valuable and help you grow.
        </Text>

        <View style={styles.optionsContainer}>
          {sharingOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedOption === option.id && styles.optionCardSelected
              ]}
              onPress={() => handleOptionSelect(option.id)}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    selectedOption === option.id && styles.optionTitleSelected
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.optionSubtitle,
                    selectedOption === option.id && styles.optionSubtitleSelected
                  ]}>
                    {option.subtitle}
                  </Text>
                </View>
              </View>
              
              <Text style={[
                styles.optionDescription,
                selectedOption === option.id && styles.optionDescriptionSelected
              ]}>
                {option.description}
              </Text>
              
              {selectedOption === option.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓ Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Why share what you learn?</Text>
          <Text style={styles.explanationText}>
            Teaching others reinforces your own learning, creates positive impact, and builds a culture of knowledge sharing. Even if you don't feel ready to share publicly, reflecting on how you'd explain something deepens your understanding.
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
  optionsContainer: {
    marginBottom: 32,
  },
  optionCard: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    backgroundColor: '#06B6D4',
    borderColor: '#06B6D4',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#FFFFFF',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  optionSubtitleSelected: {
    color: '#E0F2FE',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  optionDescriptionSelected: {
    color: '#FFFFFF',
  },
  selectedIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  explanationContainer: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 32,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#0369A1',
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



