import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { calculateEPCScores } from '../utils/epcScoreCalc';
import { setOnboardingComplete, storeEPCScores, storeOnboardingAnswers } from '../utils/storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Question data
const QUESTIONS = [
  {
    id: 1,
    question: "How energized do you feel on a typical day?",
    category: "Energy",
    options: [
      { value: 1, text: "Completely drained" },
      { value: 2, text: "Often tired" },
      { value: 3, text: "Moderate energy" },
      { value: 4, text: "Usually energetic" },
      { value: 5, text: "Always full of energy" }
    ]
  },
  {
    id: 2,
    question: "How well do you recover from stressful situations?",
    category: "Energy",
    options: [
      { value: 1, text: "Very poorly" },
      { value: 2, text: "Takes a long time" },
      { value: 3, text: "Eventually bounce back" },
      { value: 4, text: "Recover fairly quickly" },
      { value: 5, text: "Bounce back immediately" }
    ]
  },
  {
    id: 3,
    question: "How meaningful does your work/daily activities feel?",
    category: "Purpose",
    options: [
      { value: 1, text: "Completely meaningless" },
      { value: 2, text: "Rarely meaningful" },
      { value: 3, text: "Sometimes meaningful" },
      { value: 4, text: "Usually meaningful" },
      { value: 5, text: "Deeply meaningful" }
    ]
  },
  {
    id: 4,
    question: "How clear are you about your life goals and direction?",
    category: "Purpose", 
    options: [
      { value: 1, text: "Completely unclear" },
      { value: 2, text: "Mostly confused" },
      { value: 3, text: "Somewhat clear" },
      { value: 4, text: "Pretty clear" },
      { value: 5, text: "Crystal clear" }
    ]
  },
  {
    id: 5,
    question: "How connected do you feel to the people around you?",
    category: "Connection",
    options: [
      { value: 1, text: "Very isolated" },
      { value: 2, text: "Often lonely" },
      { value: 3, text: "Sometimes connected" },
      { value: 4, text: "Usually connected" },
      { value: 5, text: "Deeply connected" }
    ]
  }
];

export default function OnboardingScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Animation values
  const slideX = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  const currentQuestionData = QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  // Update progress bar animation
  React.useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 300 });
  }, [currentQuestion]);

  const handleOptionSelect = (value: number) => {
    setSelectedOption(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = async () => {
    if (selectedOption === null) {
      Alert.alert('Please select an answer', 'Choose one option to continue.');
      return;
    }

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Process final answers
      setIsProcessing(true);
      
      try {
        // Calculate EPC scores
        const epcScores = calculateEPCScores(newAnswers);
        
        // Store everything
        await Promise.all([
          storeOnboardingAnswers(newAnswers),
          storeEPCScores(epcScores),
          setOnboardingComplete(true)
        ]);

        // Show processing animation for 2 seconds
        setTimeout(() => {
          router.replace('/connect-apps');
        }, 2000);

      } catch (error) {
        console.error('Error processing onboarding:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
        setIsProcessing(false);
      }
    } else {
      // Move to next question with proper animation sequence
      slideX.value = withSpring(-screenWidth, {
        damping: 20,
        stiffness: 90,
      }, (finished) => {
        if (finished) {
          runOnJS(moveToNextQuestion)();
        }
      });
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const moveToNextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedOption(null);
    slideX.value = screenWidth;
    slideX.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      slideX.value = withSpring(screenWidth, {
        damping: 20,
        stiffness: 90,
      }, (finished) => {
        if (finished) {
          runOnJS(moveToPreviousQuestion)();
        }
      });
      
      // Remove last answer
      setAnswers(answers.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const moveToPreviousQuestion = () => {
    setCurrentQuestion(currentQuestion - 1);
    setSelectedOption(answers[currentQuestion - 1] || null);
    slideX.value = -screenWidth;
    slideX.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
  };

  const questionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.processingContainer}>
          <View style={styles.processingContent}>
            <Text style={styles.processingTitle}>🧠 Analyzing Your Responses</Text>
            <Text style={styles.processingSubtitle}>
              Creating your personalized burnout profile...
            </Text>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
          <Text style={styles.progressText}>
            {currentQuestion + 1} of {QUESTIONS.length}
          </Text>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.questionContainer, questionAnimatedStyle]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{currentQuestionData.category}</Text>
          </View>
          
          <Text style={styles.questionTitle}>{currentQuestionData.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestionData.options.map((option) => (
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
        </Animated.View>
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
            {isLastQuestion ? 'Complete Assessment' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionContainer: {
    paddingVertical: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
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
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
}); 