import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuestionnaire } from '../utils/QuestionnaireContext';

export default function Question3Page() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { setAnswer } = useQuestionnaire();

  const question = {
    id: 3,
    question: "How's your focus today?",
    options: [
      { value: "Reserved", text: "Focused, but only when left alone." },
      { value: "Maximized", text: "Sharp as ever — I'm flying through things." },
      { value: "Indulgent", text: "Focus? Oh look, a cat video." },
      { value: "Fatigued", text: "Brain = mush. I forgot what I was doing twice." }
    ]
  };

  const handleOptionSelect = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Store the answer (question index 2 for question 3)
      setAnswer(2, selectedOption);
      router.push('/question-4');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>3 of 10</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{question.question}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  selectedOption === option.value && styles.optionButtonSelected
                ]}
                onPress={() => handleOptionSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionCircle,
                  selectedOption === option.value && styles.optionCircleSelected
                ]}>
                  {selectedOption === option.value && (
                    <View style={styles.optionCircleInner} />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  selectedOption === option.value && styles.optionTextSelected
                ]}>
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedOption === null && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={selectedOption === null}
        >
          <Text style={[
            styles.nextButtonText,
            selectedOption === null && styles.nextButtonTextDisabled
          ]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    width: '30%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionContainer: {
    paddingVertical: 20,
  },
  questionTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 44,
    marginBottom: 32,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionButtonSelected: {
    borderColor: '#000000',
    backgroundColor: '#F2F2F7',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCircleSelected: {
    borderColor: '#000000',
  },
  optionCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    color: '#000000',
    fontWeight: '500',
    lineHeight: 22,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  optionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
  },
  nextButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  nextButtonTextDisabled: {
    color: '#8E8E93',
  },
}); 