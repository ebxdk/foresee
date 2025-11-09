import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuestionnaire } from '../utils/QuestionnaireContext';
import { RFValue, moderateScale, scale, verticalScale } from '../utils/responsive';

export default function Question2Page() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { setAnswer } = useQuestionnaire();

  const question = {
    id: 2,
    question: "You're asked to join a last-minute project. What's your reaction?",
    options: [
      { value: "Indulgent", text: "\"Only if there's snacks. And even then... maybe.\"" },
      { value: "Fatigued", text: "\"Sure... but I'll probably crash later.\"" },
      { value: "Reserved", text: "\"Do I have to talk to people for this?\"" },
      { value: "Maximized", text: "\"Sounds exciting — count me in!\"" }
    ]
  };

  const handleOptionSelect = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Store the answer (question index 1 for question 2)
      setAnswer(1, selectedOption);
      router.push('/question-3');
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
          <Text style={styles.progressText}>2 of 10</Text>
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
    paddingBottom: verticalScale(16),
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
    borderRadius: 3,
    marginBottom: verticalScale(8),
  },
  progressFill: {
    width: '20%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 3,
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
    paddingBottom: verticalScale(20),
  },
  questionContainer: {
    paddingVertical: verticalScale(12),
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
    letterSpacing: 0.5,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  questionTitle: {
    fontSize: RFValue(34),
    fontWeight: '700',
    color: '#000000',
    lineHeight: RFValue(42),
    marginBottom: verticalScale(24),
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  optionsContainer: {
    gap: verticalScale(12),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: verticalScale(60),
  },
  optionButtonSelected: {
    borderColor: '#000000',
    backgroundColor: '#F2F2F7',
  },
  optionCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#8E8E93',
    marginRight: scale(12),
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
    fontSize: RFValue(16),
    color: '#000000',
    fontWeight: '500',
    lineHeight: RFValue(21),
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  optionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(34),
    paddingTop: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  nextButton: {
    backgroundColor: '#000000',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(28),
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
    fontSize: RFValue(18),
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  nextButtonTextDisabled: {
    color: '#8E8E93',
  },
}); 