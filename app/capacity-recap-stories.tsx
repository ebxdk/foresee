import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { EPCScores } from '../utils/epcScoreCalc';
import * as Storage from '../utils/storage';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    FadeIn,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Story data structure
interface StorySlide {
  id: number;
  type: 'welcome' | 'stat' | 'achievement' | 'challenge' | 'growth';
  title: string;
  subtitle?: string;
  mainText: string;
  icon: string;
  backgroundColor: [string, string];
  textColor: string;
}

// Function to generate dynamic story slides based on user data
const generateStorySlides = (userName: string, epcScores: EPCScores | null, hasEnoughData: boolean): StorySlide[] => {
  if (!hasEnoughData || !epcScores) {
    return [
      {
        id: 1,
        type: 'welcome',
        title: "WELCOME",
        subtitle: "2025",
        mainText: `Hi ${userName || 'there'}!\n\nYour capacity journey\nis just beginning`,
        icon: "👋",
        backgroundColor: ['#1A4A5C', '#2D6B7A'],
        textColor: '#FFFFFF'
      },
      {
        id: 2,
        type: 'growth',
        title: "KEEP GOING!",
        mainText: "Use the app more to see\nyour personalized\ncapacity recap\n\nTrack your energy,\npurpose, and connections",
        icon: "📊",
        backgroundColor: ['#3498DB', '#2980B9'],
        textColor: '#FFFFFF'
      },
      {
        id: 3,
        type: 'growth',
        title: "YOUR JOURNEY",
        mainText: "Every interaction helps\nbuild your capacity profile\n\nKeep checking in to\nunlock your full recap!",
        icon: "🌟",
        backgroundColor: ['#16A085', '#27AE60'],
        textColor: '#FFFFFF'
      }
    ];
  }

  // Generate stories with real user data
  return [
    {
      id: 1,
      type: 'welcome',
      title: "CAPACITY RECAP",
      subtitle: "2025",
      mainText: `${userName}'s journey through\nbuilding resilience\nand managing capacity`,
      icon: "🚀",
      backgroundColor: ['#1A4A5C', '#2D6B7A'],
      textColor: '#FFFFFF'
    },
    {
      id: 2,
      type: 'stat',
      title: "ENERGY LEVELS",
      mainText: `Your current energy level is\n\n${Math.round(epcScores.energy)}%\n\nKeep building your capacity!`,
      icon: "⚡",
      backgroundColor: ['#FF6B35', '#F7931E'],
      textColor: '#FFFFFF'
    },
    {
      id: 3,
      type: 'stat',
      title: "PURPOSE CLARITY",
      mainText: `Your sense of purpose is at\n\n${Math.round(epcScores.purpose)}%\n\nContinue nurturing your goals!`,
      icon: "🎯",
      backgroundColor: ['#6A4C93', '#9B59B6'],
      textColor: '#FFFFFF'
    },
    {
      id: 4,
      type: 'stat',
      title: "CONNECTION STRENGTH",
      mainText: `Your connection strength is\n\n${Math.round(epcScores.connection)}%\n\nKeep building meaningful relationships!`,
      icon: "💚",
      backgroundColor: ['#16A085', '#27AE60'],
      textColor: '#FFFFFF'
    },
    {
      id: 5,
      type: 'achievement',
      title: "YOUR PROGRESS",
      mainText: "You're actively tracking\nyour capacity!\n\nKeep using the app to\nbuild your full year recap",
      icon: "🏆",
      backgroundColor: ['#F39C12', '#E67E22'],
      textColor: '#FFFFFF'
    },
    {
      id: 6,
      type: 'growth',
      title: "KEEP GOING",
      mainText: "You're building the\nskills to thrive\n\nKeep nurturing your\ncapacity in 2025",
      icon: "🌟",
      backgroundColor: ['#3498DB', '#2980B9'],
      textColor: '#FFFFFF'
    }
  ];
};

export default function CapacityRecapStories() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [epcScores, setEpcScores] = useState<EPCScores | null>(null);
  const [hasEnoughData, setHasEnoughData] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Function to load user data
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        const user = JSON.parse(userData);
        const firstName = user.name ? user.name.split(' ')[0] : '';
        setUserName(firstName);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Function to load EPC scores and check if user has enough data
  const loadUserProgress = async () => {
    try {
      const scores = await Storage.getEPCScores();
      setEpcScores(scores);
      
      // Check if user has enough data for a meaningful recap
      const hasData = scores && (scores.energy > 0 || scores.purpose > 0 || scores.connection > 0);
      setHasEnoughData(hasData || false);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await loadUserData();
      await loadUserProgress();
    };
    
    loadInitialData();
  }, []);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Animation values
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Progress animation - fixed to prevent state updates during render
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentSlideIndex(currentIndex => {
            if (currentIndex < storySlides.length - 1) {
              return currentIndex + 1;
            } else {
              // End of stories, go back
              router.back();
              return currentIndex;
            }
          });
          return 0;
        }
        return prev + 1.5; // Progress 1.5% every 100ms = ~6.7 seconds per slide
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPaused, router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < storySlides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      handleClose();
    }
  }, [currentSlideIndex, handleClose]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentSlideIndex]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withTiming(0.98, { duration: 150 });
  }, [scale]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    scale.value = withTiming(1, { duration: 150 });
  }, [scale]);

  // Memoized gesture handlers to prevent recreation on every render
  const panGesture = useMemo(() => Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        scale.value = interpolate(
          event.translationY,
          [0, 200],
          [1, 0.85],
          Extrapolate.CLAMP
        );
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        // Close the stories
        runOnJS(handleClose)();
      } else {
        // Snap back
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      }
    }), [translateY, scale, handleClose]);

  // Swipe down to close gesture only for main container
  const mainGesture = useMemo(() => Gesture.Simultaneous(panGesture), [panGesture]);

  // Left tap to go back
  const leftTapGesture = useMemo(() => Gesture.Tap()
    .onEnd(() => {
      runOnJS(handlePrevSlide)();
    }), [handlePrevSlide]);

  // Right tap to go forward  
  const rightTapGesture = useMemo(() => Gesture.Tap()
    .onEnd(() => {
      runOnJS(handleNextSlide)();
    }), [handleNextSlide]);

  // Long press to pause - for the touch areas
  const longPressGesture = useMemo(() => Gesture.LongPress()
    .minDuration(150)
    .onStart(() => {
      runOnJS(handlePause)();
    })
    .onEnd(() => {
      runOnJS(handleResume)();
    })
    .onFinalize(() => {
      runOnJS(handleResume)();
    }), [handlePause, handleResume]);

  // Combined gestures for touch areas
  const leftCombinedGesture = useMemo(() => Gesture.Race(longPressGesture, leftTapGesture), [longPressGesture, leftTapGesture]);
  const rightCombinedGesture = useMemo(() => Gesture.Race(longPressGesture, rightTapGesture), [longPressGesture, rightTapGesture]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  // Generate dynamic stories based on user data
  const storySlides = generateStorySlides(userName, epcScores, hasEnoughData);
  const currentSlide = storySlides[currentSlideIndex];

  return (
    <SafeAreaView style={styles.container}>
      <GestureDetector gesture={mainGesture}>
        <Animated.View style={[styles.storyContainer, containerStyle]}>
          {/* Progress bars */}
          <View style={styles.progressContainer}>
            {storySlides.map((_, index) => (
              <View key={index} style={styles.progressBarBackground}>
                <Animated.View 
                  style={[
                    styles.progressBarFill,
                    {
                      width: index < currentSlideIndex ? '100%' : 
                             index === currentSlideIndex ? `${progress}%` : '0%'
                    }
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Story frame with bezels */}
          <View style={styles.storyFrame}>
            {/* Story content */}
            <Animated.View 
              key={currentSlide.id}
              style={styles.slideContainer}
              entering={FadeIn.duration(400)}
            >
              <LinearGradient
                colors={currentSlide.backgroundColor}
                style={styles.slideGradient}
              >
                <View style={styles.slideContent}>
                  <Text style={[styles.slideIcon, { color: currentSlide.textColor }]}>
                    {currentSlide.icon}
                  </Text>
                  
                  <Text style={[styles.slideTitle, { color: currentSlide.textColor }]}>
                    {currentSlide.title}
                  </Text>
                  
                  {currentSlide.subtitle && (
                    <Text style={[styles.slideSubtitle, { color: currentSlide.textColor }]}>
                      {currentSlide.subtitle}
                    </Text>
                  )}
                  
                  <Text style={[styles.slideMainText, { color: currentSlide.textColor }]}>
                    {currentSlide.mainText}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Left touch area */}
          <GestureDetector gesture={leftCombinedGesture}>
            <View style={styles.leftTouchArea} />
          </GestureDetector>

          {/* Right touch area */}
          <GestureDetector gesture={rightCombinedGesture}>
            <View style={styles.rightTouchArea} />
          </GestureDetector>


        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 40,
  },
  storyFrame: {
    width: screenWidth - 24,
    height: screenHeight * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8, // Moved higher up on screen from 20 to 8
    paddingBottom: 12,
    gap: 4,
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  slideContainer: {
    flex: 1,
  },
  slideGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
    flex: 1,
    justifyContent: 'center',
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1.5,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  slideSubtitle: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  slideMainText: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 32,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  leftTouchArea: {
    position: 'absolute',
    left: 0,
    top: 60,
    bottom: 0,
    width: '30%',
    zIndex: 5,
  },
  rightTouchArea: {
    position: 'absolute',
    right: 0,
    top: 60,
    bottom: 0,
    width: '70%',
    zIndex: 5,
  },

}); 