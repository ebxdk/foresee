import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { generateWellnessTasks } from '../utils/aiTaskGenerator';
import { EPCScores } from '../utils/epcScoreCalc';
import { getEPCScores, getUserState, shouldRegenerateTasks, storeDailyTasks } from '../utils/storage';

export default function EPCScorePage() {
  const router = useRouter();
  const [displayedText, setDisplayedText] = useState('');
  const [showScores, setShowScores] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [userState, setUserState] = useState<'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued'>('Maximized');
  const [scores, setScores] = useState<EPCScores>({ energy: 0, purpose: 0, connection: 0 });
  
  // Animation values for score bars
  const energyAnim = useRef(new Animated.Value(0)).current;
  const purposeAnim = useRef(new Animated.Value(0)).current;
  const connectionAnim = useRef(new Animated.Value(0)).current;

  // Load real data from storage and generate tasks
  useEffect(() => {
    const loadDataAndGenerateTasks = async () => {
      try {
        const [storedScores, storedState] = await Promise.all([
          getEPCScores(),
          getUserState()
        ]);
        
        if (storedScores) {
          setScores(storedScores);
        }
        
        if (storedState) {
          setUserState(storedState);
        }
        
        setIsLoading(false);
        
        // Check if we need to generate new tasks for today
        const needsNewTasks = await shouldRegenerateTasks();
        if (needsNewTasks && storedScores && storedState) {
          setIsGeneratingTasks(true);
          console.log('Generating new wellness tasks for today...');
          
          try {
            const newTasks = await generateWellnessTasks(storedScores, storedState);
            await storeDailyTasks(newTasks);
            console.log('Successfully generated and stored new tasks:', newTasks);
          } catch (error) {
            console.error('Error generating tasks:', error);
          } finally {
            setIsGeneratingTasks(false);
          }
        }
        
      } catch (error) {
        console.error('Error loading questionnaire results:', error);
        setIsLoading(false);
      }
    };
    
    loadDataAndGenerateTasks();
  }, []);

  const getStateMessage = (state: string) => {
    switch (state) {
      case "Maximized":
        return "You're Maximized! 🔥 You're absolutely crushing it. Let's keep this magic going!";
      case "Fatigued":
        return "You're Fatigued! 😮‍💨 Your tank is running low. Time for some serious self-care.";
      case "Reserved":
        return "You're Reserved! 🛡️ You're in protection mode, conserving your precious energy.";
      case "Indulgent":
        return "You're Indulgent! 🌊 You're going with the flow, maybe a little too much.";
      default:
        return "Your capacity assessment is complete.";
    }
  };

  // Add task generation status to the message
  const getFullMessage = () => {
    const baseMessage = getStateMessage(userState);
    if (isGeneratingTasks) {
      return baseMessage + "\n\nGenerating your personalized wellness tasks...";
    }
    return baseMessage;
  };

  const fullMessage = getFullMessage();

  // Typewriter effect
  useEffect(() => {
    if (!isLoading && currentIndex < fullMessage.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullMessage.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 30); // Typing speed
      return () => clearTimeout(timer);
    }
  }, [currentIndex, fullMessage, isLoading]);

  // Cursor blinking effect - updated to consider task generation
  useEffect(() => {
    if (currentIndex < fullMessage.length) {
      const cursorTimer = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(cursorTimer);
    } else {
      // Keep cursor visible after typing completes
      setShowCursor(true);
      // Only show scores after task generation is complete
      if (!isGeneratingTasks) {
        const showScoresTimer = setTimeout(() => {
          setShowScores(true);
          animateScores();
        }, 500);
        return () => clearTimeout(showScoresTimer);
      }
    }
  }, [currentIndex, fullMessage.length, isGeneratingTasks]);

  // Show scores when task generation completes
  useEffect(() => {
    if (!isGeneratingTasks && currentIndex >= fullMessage.length && !showScores) {
      const showScoresTimer = setTimeout(() => {
        setShowScores(true);
        animateScores();
      }, 500);
      return () => clearTimeout(showScoresTimer);
    }
  }, [isGeneratingTasks, currentIndex, fullMessage.length, showScores]);

  const animateScores = () => {
    // Animate each bar with staggered timing
    Animated.stagger(200, [
      Animated.timing(energyAnim, {
        toValue: scores.energy,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(purposeAnim, {
        toValue: scores.purpose,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(connectionAnim, {
        toValue: scores.connection,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/home');
  };

  const ScoreBar = ({ 
    label, 
    score, 
    animatedValue, 
    color 
  }: { 
    label: string; 
    score: number; 
    animatedValue: Animated.Value; 
    color: string; 
  }) => (
    <View style={styles.scoreContainer}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{score}%</Text>
      </View>
      <View style={styles.scoreBarContainer}>
        <Animated.View
          style={[
            styles.scoreBar,
            {
              backgroundColor: color,
              width: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.messageSection}>
          {/* Typewriter Message */}
          <View style={styles.messageContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#000000" />
            ) : (
              <Text style={styles.message}>
                {displayedText}
                {showCursor && <Text style={styles.cursor}>●</Text>}
              </Text>
            )}
          </View>

          {/* Score Bars */}
          {showScores && (
            <View style={styles.scoresSection}>
              <Text style={styles.scoresTitle}>Your EPC Breakdown</Text>
              
              <ScoreBar 
                label="Energy" 
                score={scores.energy} 
                animatedValue={energyAnim}
                color="#FF6B6B"
              />
              
              <ScoreBar 
                label="Purpose" 
                score={scores.purpose} 
                animatedValue={purposeAnim}
                color="#4ECDC4"
              />
              
              <ScoreBar 
                label="Connection" 
                score={scores.connection} 
                animatedValue={connectionAnim}
                color="#45B7D1"
              />
              
            </View>
          )}
        </View>
      </View>

      {/* Footer - Fixed at bottom */}
      {showScores && !isGeneratingTasks && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA', // Match tools screen background
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 120, // Add space for fixed footer
  },
  messageSection: {
    marginBottom: 32,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  message: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    lineHeight: 36,
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  cursor: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    opacity: 1,
  },
  scoresSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  scoresTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scoreContainer: {
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 50, // Account for safe area
    paddingTop: 24,
    backgroundColor: '#F8F8FA',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  continueButton: {
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
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 