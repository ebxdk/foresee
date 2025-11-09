import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RFValue, moderateScale, scale, verticalScale } from '../utils/responsive';
import { useQuestionnaire } from '../utils/QuestionnaireContext';

export default function Question1Page() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { setAnswer, clearAnswers } = useQuestionnaire();

  // Clear answers only once when component mounts
  useEffect(() => {
    clearAnswers();
  }, []); // Empty dependency array - only run once

  const question = {
    id: 1,
    question: "When you look at your to-do list, what's your vibe?",
    options: [
      { value: "Fatigued", text: "\"Honestly, can this list just disappear?\"" },
      { value: "Maximized", text: "\"Let's knock this out — I'm in the zone!\"" },
      { value: "Reserved", text: "\"I'll chip away at it quietly... please no group huddles.\"" },
      { value: "Indulgent", text: "\"Hmm... I'll just vibe and wait for inspiration.\"" }
    ]
  };

  const handleOptionSelect = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Store the answer (question index 0 for question 1)
      setAnswer(0, selectedOption);
      router.push('/question-2');
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
          <Text style={styles.progressText}>1 of 10</Text>
        </View>
      </View>

      {/* Content - Now Scrollable */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>

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
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16), // Reduced from 24 to save space
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: RFValue(20),
    color: '#000000',
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    marginLeft: scale(16),
  },
  progressBar: {
    height: verticalScale(6),
    backgroundColor: '#E5E5EA',
    borderRadius: 3, // Keep small radius fixed
    marginBottom: verticalScale(8),
  },
  progressFill: {
    width: '10%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 3, // Keep small radius fixed
  },
  progressText: {
    fontSize: RFValue(14),
    color: '#8E8E93',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(20), // Ensure space at bottom
  },
  questionContainer: {
    paddingVertical: verticalScale(12), // Reduced from 20
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#000000',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(24),
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: RFValue(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5, // Keep fixed
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  questionTitle: {
    fontSize: RFValue(34), // Slightly smaller from 36
    fontWeight: '700',
    color: '#000000',
    lineHeight: RFValue(42), // Adjusted from 44
    marginBottom: verticalScale(24), // Reduced from 32
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  optionsContainer: {
    gap: verticalScale(12), // Reduced from 16 for tighter spacing
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16), // Reduced from 20
    paddingHorizontal: scale(16), // Reduced from 20
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 2, // Keep fixed
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Keep fixed
    shadowOpacity: 0.05, // Keep fixed
    shadowRadius: 2, // Keep fixed
    elevation: 1, // Keep fixed
    minHeight: verticalScale(60), // Ensure minimum height for touch target
  },
  optionButtonSelected: {
    borderColor: '#000000',
    backgroundColor: '#F2F2F7',
  },
  optionCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2, // Keep fixed
    borderColor: '#8E8E93',
    marginRight: scale(12), // Reduced from 16
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCircleSelected: {
    borderColor: '#000000',
  },
  optionCircleInner: {
    width: scale(12),
    height: scale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#000000',
  },
  optionText: {
    flex: 1,
    fontSize: RFValue(16), // Slightly smaller from 17
    color: '#000000',
    fontWeight: '500',
    lineHeight: RFValue(21), // Adjusted from 22
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  optionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(34),
    paddingTop: verticalScale(12), // Reduced from 16
    backgroundColor: '#FFFFFF', // Ensure it's not transparent
    borderTopWidth: 1, // Add subtle border
    borderTopColor: '#F2F2F7', // Subtle separator
  },
  nextButton: {
    backgroundColor: '#000000',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(28),
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 }, // Keep fixed
    shadowOpacity: 0.1, // Keep fixed
    shadowRadius: 8, // Keep fixed
    elevation: 4, // Keep fixed
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0, // Keep fixed
    elevation: 0, // Keep fixed
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(18),
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  nextButtonTextDisabled: {
    color: '#8E8E93',
  },
}); 