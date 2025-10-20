import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, GestureResponderEvent, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Import components and utilities
import EnhancedEPCDisplay from '../../components/EnhancedEPCDisplay';
import { getBackgroundDecayServiceStatus } from '../../utils/backgroundDecayService';
import { calculateBurnoutFromScores } from '../../utils/burnoutCalc';
import { getGreenToOrangeGradient } from '../../utils/colorUtils';
import { EPCScores } from '../../utils/epcScoreCalc';
import { initializeMockSleepSystem } from '../../utils/mockSleepSystem';
import { getDailyTasks, getEPCScores, getUserState, shouldRegenerateTasks, storeEPCScores, updateTaskCompletion } from '../../utils/storage';

const { width: screenWidth } = Dimensions.get('window');

// Tool state mapping based on TOOL_CONFIG
const toolStateMapping: { [key: string]: 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued' } = {
  // Fatigued tools
  'HydrationHero': 'Fatigued',
  'PostItPriority': 'Fatigued',
  'OxygenMask': 'Fatigued',
  'NourishmentCheck': 'Fatigued',
  'PhoneFreePause': 'Fatigued',
  
  // Indulgent tools
  'PleasurePlaylist': 'Indulgent',
  'MentalUnload': 'Indulgent',
  'ConnectionSpark': 'Indulgent',
  'SweetSpotScan': 'Indulgent',
  
  // Reserved tools
  'BoundaryBuilder': 'Reserved',
  'ScheduleScrub': 'Reserved',
  'EnergyBudgetCheck': 'Reserved',
  'GratitudeGuardrail': 'Reserved',
  
  // Maximized tools
  'CapacityAudit': 'Maximized',
  'RecoveryRitual': 'Maximized',
  'TeachItForward': 'Maximized',
  'AimReview': 'Maximized',
};

// Tool data for filtering
const toolsData = [
  { id: 'HydrationHero', name: 'Hydration Hero' },
  { id: 'PostItPriority', name: 'Post-it Priority' },
  { id: 'OxygenMask', name: 'The Oxygen Mask' },
  { id: 'NourishmentCheck', name: 'Nourishment Check' },
  { id: 'PhoneFreePause', name: 'Phone-Free Pause' },
  { id: 'PleasurePlaylist', name: 'Pleasure Playlist' },
  { id: 'MentalUnload', name: 'Mental Unload' },
  { id: 'ConnectionSpark', name: 'Connection Spark' },
  { id: 'SweetSpotScan', name: 'Sweet Spot Scan' },
  { id: 'BoundaryBuilder', name: 'Boundary Builder' },
  { id: 'ScheduleScrub', name: 'Schedule Scrub' },
  { id: 'EnergyBudgetCheck', name: 'Energy Budget Check' },
  { id: 'GratitudeGuardrail', name: 'Gratitude Guardrail' },
  { id: 'CapacityAudit', name: 'Capacity Audit' },
  { id: 'RecoveryRitual', name: 'Recovery Ritual' },
  { id: 'TeachItForward', name: 'Teach It Forward' },
  { id: 'AimReview', name: 'Aim Review' },
];

// Fallback tasks if AI generation fails
const fallbackTasks = [
  "Take 5 deep breaths",
  "Drink a glass of water",
  "Do 10 jumping jacks",
  "Text someone you care about",
  "Write down one thing you're grateful for",
  "Step outside for 2 minutes"
];

function getBarColor(label: string) {
  switch (label) {
    case 'Energy': return '#FF6B6B'; // Red to match EPC score screen
    case 'Purpose': return '#4ECDC4'; // Teal to match EPC score screen
    case 'Connection': return '#45B7D1'; // Blue to match EPC score screen
    default: return '#8E8E93';
  }
}

function getBurnoutColor(percentage: number) {
  return getGreenToOrangeGradient(percentage);
}

export default function HomeScreen() {
  const [epcScores, setEpcScores] = useState<EPCScores | null>(null);
  const [userState, setUserState] = useState<'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyTasks, setDailyTasks] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>([]);
  const [visibleTaskIndices, setVisibleTaskIndices] = useState<number[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [backgroundServiceStatus, setBackgroundServiceStatus] = useState<string>('Starting...');
  const [userName, setUserName] = useState<string>('');
  const [profileInitials, setProfileInitials] = useState<string>('');
  const [recommendedTool, setRecommendedTool] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

  // Check for new tasks when screen comes into focus (new day)
  useFocusEffect(
    useCallback(() => {
      const checkForNewDay = async () => {
        if (epcScores && userState) {
          const needsNewTasks = await shouldRegenerateTasks();
          if (needsNewTasks) {
            console.log('New day detected, refreshing tasks...');
            await loadDailyTasks(epcScores, userState);
          }
        }
      };
      
      checkForNewDay();
    }, [epcScores, userState])
  );

  // Function to load user data and extract first name
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        const user = JSON.parse(userData);
        // Extract first name from full name
        const firstName = user.name ? user.name.split(' ')[0] : '';
        setUserName(firstName);
        // Compute initials from full name or email
        const fullName: string = user.name || '';
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        let initials = '';
        if (nameParts.length > 0) {
          initials = nameParts[0]?.[0] || '';
          if (nameParts.length > 1) initials += nameParts[1]?.[0] || '';
        } else if (user.email) {
          initials = user.email[0] || '';
        }
        setProfileInitials(initials.toUpperCase());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [scores, state] = await Promise.all([
          getEPCScores(),
          getUserState()
        ]);
        setEpcScores(scores);
        setUserState(state);
        
        // Set recommended tool based on user state
        if (state) {
          const filteredTools = toolsData.filter(tool => toolStateMapping[tool.id] === state);
          if (filteredTools.length > 0) {
            setRecommendedTool(filteredTools[0]); // First tool for this state
          }
        }
        
        // Load user data
        await loadUserData();
        
        // Load daily tasks
        await loadDailyTasks(scores, state);
        
        // Initialize mock sleep system
        await initializeMockSleepSystem();
        
        // Start SMART background service (works in both Expo Go and builds)
        const { initializeSmartBackgroundService, testBackgroundFunctionality } = await import('../../utils/smartBackgroundService');
        await initializeSmartBackgroundService();
        
        // Test background functionality in development
        if (__DEV__) {
          await testBackgroundFunctionality();
          
          // Run Phase 1 tests
          const { runPhase1Tests } = await import('../../utils/phase1TestSuite');
          const phase1Success = await runPhase1Tests();
          console.log(`🎯 Phase 1 Tests: ${phase1Success ? 'PASSED' : 'FAILED'}`);
        }
        
        // Update background service status
        const status = getBackgroundDecayServiceStatus();
        setBackgroundServiceStatus(`Running (Last: ${status.lastCheckTime ? status.lastCheckTime.toLocaleTimeString() : 'Never'})`);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Refresh user data whenever Home screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  // Add background service listener for real-time updates
  useEffect(() => {
    const handleDecayUpdate = (update: {
      energyLost: number;
      newEnergy: number;
      previousEnergy: number;
      decayRate: number;
      isSleeping: boolean;
      tailsApplied?: number;
      pointsFaded?: { P: number; C: number };
    }) => {
      console.log('🔄 Real-time decay update received:', update);
      
      // Update EPC scores in real-time
      if (epcScores) {
        const newScores = { 
          ...epcScores, 
          energy: update.newEnergy,
          // Apply tail effects to P/C scores if any
          purpose: update.pointsFaded ? Math.max(0, Math.min(100, epcScores.purpose - update.pointsFaded.P)) : epcScores.purpose,
          connection: update.pointsFaded ? Math.max(0, Math.min(100, epcScores.connection - update.pointsFaded.C)) : epcScores.connection,
        };
        setEpcScores(newScores);
        
        // Update background service status
        const status = getBackgroundDecayServiceStatus();
        setBackgroundServiceStatus(`Running (Last: ${status.lastCheckTime ? status.lastCheckTime.toLocaleTimeString() : 'Never'})`);
        
        console.log(`⚡ Real-time EPC update: ${update.previousEnergy} → ${update.newEnergy} (lost ${update.energyLost})`);
        
        if (update.tailsApplied && update.tailsApplied > 0) {
          console.log(`🌊 Real-time tail effects: ${update.tailsApplied} tails applied, P -${update.pointsFaded?.P || 0}, C -${update.pointsFaded?.C || 0}`);
        }
      }
    };

    // Import the service dynamically to avoid circular dependencies
    import('../../utils/backgroundDecayService').then(({ backgroundDecayService }) => {
      backgroundDecayService.addListener(handleDecayUpdate);
      
      // Cleanup function
      return () => {
        backgroundDecayService.removeListener(handleDecayUpdate);
      };
    });
  }, [epcScores]);

  const loadDailyTasks = async (scores: EPCScores | null, state: 'Maximized' | 'Reserved' | 'Indulgent' | 'Fatigued' | null) => {
    try {
      // Load existing tasks from storage (tasks should be generated in tasks page)
        const storedTasks = await getDailyTasks();
      if (storedTasks && storedTasks.tasks) {
          setDailyTasks(storedTasks.tasks);
        setCompletedTasks(storedTasks.completed);
          setVisibleTaskIndices([0, 1, 2].filter(i => i < storedTasks.tasks.length));
        } else {
        // Use fallback tasks if no stored tasks available
          setDailyTasks(fallbackTasks);
          setCompletedTasks(new Array(fallbackTasks.length).fill(false));
          setVisibleTaskIndices([0, 1, 2]);
      }
    } catch (error) {
      console.error('Error loading daily tasks:', error);
      // Use fallback tasks on error
      setDailyTasks(fallbackTasks);
      setCompletedTasks(new Array(fallbackTasks.length).fill(false));
      setVisibleTaskIndices([0, 1, 2]);
    }
  };

  // --- Debug Functions ---
  const decreaseEnergyDebug = async () => {
    if (!epcScores) {
      console.log('No EPC scores to decrease energy from.');
      return;
    }
    
    const decreaseAmount = 10; // Decrease energy by 10 points
    const newEnergy = Math.max(0, epcScores.energy - decreaseAmount);
    
    const updatedScores: EPCScores = {
      ...epcScores,
      energy: newEnergy
    };
    
    try {
      await storeEPCScores(updatedScores);
      setEpcScores(updatedScores); // Update state to trigger re-render
      console.log(`⚡ Debug: Decreased Energy from ${epcScores.energy} to ${newEnergy}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error decreasing energy (debug):', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const decreasePurposeDebug = async () => {
    if (!epcScores) {
      console.log('No EPC scores to decrease purpose from.');
      return;
    }
    
    const decreaseAmount = 10; // Decrease purpose by 10 points
    const newPurpose = Math.max(0, epcScores.purpose - decreaseAmount);
    
    const updatedScores: EPCScores = {
      ...epcScores,
      purpose: newPurpose
    };
    
    try {
      await storeEPCScores(updatedScores);
      setEpcScores(updatedScores); // Update state to trigger re-render
      console.log(`💡 Debug: Decreased Purpose from ${epcScores.purpose} to ${newPurpose}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error decreasing purpose (debug):', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const decreaseConnectionDebug = async () => {
    if (!epcScores) {
      console.log('No EPC scores to decrease connection from.');
      return;
    }
    
    const decreaseAmount = 10; // Decrease connection by 10 points
    const newConnection = Math.max(0, epcScores.connection - decreaseAmount);
    
    const updatedScores: EPCScores = {
      ...epcScores,
      connection: newConnection
    };
    
    try {
      await storeEPCScores(updatedScores);
      setEpcScores(updatedScores); // Update state to trigger re-render
      console.log(`🤝 Debug: Decreased Connection from ${epcScores.connection} to ${newConnection}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error decreasing connection (debug):', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const increaseEnergyDebug = async () => {
    if (!epcScores) {
      console.log('No EPC scores to increase energy.');
      return;
    }
    
    const increaseAmount = 10; // Increase energy by 10 points
    const newEnergy = Math.min(100, epcScores.energy + increaseAmount);
    
    const updatedScores: EPCScores = {
      ...epcScores,
      energy: newEnergy
    };
    
    try {
      await storeEPCScores(updatedScores);
      setEpcScores(updatedScores); // Update state to trigger re-render
      console.log(`⚡ Debug: Increased Energy from ${epcScores.energy} to ${newEnergy}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error increasing energy (debug):', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const increasePurposeDebug = async () => {
    if (!epcScores) {
      console.log('No EPC scores to increase purpose.');
      return;
    }
    
    const increaseAmount = 10; // Increase purpose by 10 points
    const newPurpose = Math.min(100, epcScores.purpose + increaseAmount);
    
    const updatedScores: EPCScores = {
      ...epcScores,
      purpose: newPurpose
    };
    
    try {
      await storeEPCScores(updatedScores);
      setEpcScores(updatedScores); // Update state to trigger re-render
      console.log(`💡 Debug: Increased Purpose from ${epcScores.purpose} to ${newPurpose}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error increasing purpose (debug):', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const increaseConnectionDebug = async () => {
    if (!epcScores) {
      console.log('No EPC scores to increase connection.');
      return;
    }
    
    const increaseAmount = 10; // Increase connection by 10 points
    const newConnection = Math.min(100, epcScores.connection + increaseAmount);
    
    const updatedScores: EPCScores = {
      ...epcScores,
      connection: newConnection
    };
    
    try {
      await storeEPCScores(updatedScores);
      setEpcScores(updatedScores); // Update state to trigger re-render
      console.log(`🤝 Debug: Increased Connection from ${epcScores.connection} to ${newConnection}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error increasing connection (debug):', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // --- Todo List Logic ---
  const getNextAvailableTaskIndex = () => {
    for (let i = 0; i < dailyTasks.length; i++) {
      if (!completedTasks[i] && !visibleTaskIndices.includes(i)) {
        return i;
      }
    }
    return -1;
  };
  
  const toggleTask = async (index: number) => {
    const newCompletedTasks = [...completedTasks];
    newCompletedTasks[index] = !newCompletedTasks[index];
    setCompletedTasks(newCompletedTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Persist completion state to storage
    try {
      await updateTaskCompletion(newCompletedTasks);
    } catch (error) {
      console.error('Error saving task completion:', error);
    }

    // If task was just completed, schedule replacement after fade animation
    if (newCompletedTasks[index]) {
      setTimeout(() => {
        const nextTaskIndex = getNextAvailableTaskIndex();
        if (nextTaskIndex !== -1) {
          const newVisibleIndices = [...visibleTaskIndices];
          const completedTaskPosition = visibleTaskIndices.indexOf(index);
          if (completedTaskPosition !== -1) {
            newVisibleIndices[completedTaskPosition] = nextTaskIndex;
            setVisibleTaskIndices(newVisibleIndices);
          }
        }
      }, 2000);
    }
  };
  
  const handleTasksWidgetPress = () => {
    if (isNavigating) return; // Prevent multiple rapid taps
    
    setIsNavigating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/tasks');
    
    // Reset navigation state after a delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };
  
  const handleTaskItemPress = (widgetIndex: number, event: GestureResponderEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const actualTaskIndex = visibleTaskIndices[widgetIndex];
    toggleTask(actualTaskIndex);
  };

  const handleRetakeAssessment = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Retaking assessment...');

    try {
      // Navigate to the first question to start the full 10-question flow
      router.push('/question-1');

    } catch (error) {
      console.error('Error during retake assessment:', error);
    }
  };

  const handleGoToTool = () => {
    if (!recommendedTool) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to the recommended tool page
    const toolRoutes: { [key: string]: string } = {
      'HydrationHero': '/hydration-hero',
      'PostItPriority': '/post-it-priority',
      'OxygenMask': '/oxygen-mask-get-started',
      'NourishmentCheck': '/nourishment-check',
      'PhoneFreePause': '/phone-free-pause',
      'PleasurePlaylist': '/pleasure-playlist',
      'MentalUnload': '/mental-unload',
      'ConnectionSpark': '/connection-spark',
      'SweetSpotScan': '/sweet-spot-scan',
      'BoundaryBuilder': '/boundary-builder',
      'ScheduleScrub': '/schedule-scrub',
      'EnergyBudgetCheck': '/energy-budget-check',
      'GratitudeGuardrail': '/gratitude-guardrail',
      'CapacityAudit': '/capacity-audit',
      'RecoveryRitual': '/recovery-ritual',
      'TeachItForward': '/teach-it-forward',
      'AimReview': '/aim-review',
    };
    
    const route = toolRoutes[recommendedTool.id];
    if (route) {
      (router as any).push(route);
    }
  };

  const getVisibleTasks = () => {
    return visibleTaskIndices.map(index => ({
      task: dailyTasks[index],
      isCompleted: completedTasks[index],
      index: index
    }));
  };
  const visibleTasks = getVisibleTasks();

  // --- Render ---
  if (isLoading) {
    return (
      <Animated.View 
        style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
        entering={FadeIn.duration(200)}
      >
        <Text>Loading...</Text>
      </Animated.View>
    );
  }
  // If EPC scores are missing (e.g., new user), render with safe defaults
  const safeScores: EPCScores = epcScores ?? { energy: 50, purpose: 50, connection: 50 };
  const burnout = calculateBurnoutFromScores(safeScores);
  const stateText = userState ? userState.toLowerCase() : 'balanced';
  // --- Main Layout ---
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(200)}
    >
      <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Greeting and User State */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingContent}>
            <Text style={styles.greeting}>Hi {userName || 'there'},</Text>
            <Text style={styles.userState}>You're {stateText} today with a {Math.round(burnout)}% burnout risk - {burnout <= 30 ? 'looking great!' : burnout <= 60 ? 'stay mindful' : 'time to recharge'}</Text>
          </View>
          
          {/* Absolutely positioned profile icon that doesn't interfere with text */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (safeScores) {
                router.push({
                  pathname: '/epc-explanation-profile',
                  params: { scores: JSON.stringify(safeScores) }
                });
              }
            }}
            activeOpacity={0.8}
            style={styles.profileIconAbsolute}
          >
            <LinearGradient
              colors={['#D1D1D6', '#8E8E93']} // Subtle gradient from lighter to darker grey
              style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={styles.profileInitials}>{profileInitials || 'U'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Enhanced EPC Display */}
        <EnhancedEPCDisplay scores={safeScores} />

        {/* Retake Assessment Card */}
        <TouchableOpacity style={styles.retakeCardContainer} onPress={handleRetakeAssessment} activeOpacity={0.8}>
          <View style={styles.retakeCardContent}>
            <Text style={styles.retakeCardText}>Retake Assessment</Text>
          </View>
        </TouchableOpacity>

        {/* Effects Monitor */}
        <></>

        {/* Energy Decay Test Section */}
        <></>

        {/* Energy Decay Status */}
        <></>

        {/* Tool Recommendation with Avatar */}
        <View style={styles.toolRecommendationCard}>
          <View style={styles.toolRecommendationContent}>
            <View style={styles.toolTextContent}>
              <Text style={styles.recommendationTitle}>Reset with the</Text>
              <Text style={styles.recommendationTool}>
                "{recommendedTool ? recommendedTool.name : 'CHIEFF'}" tool
              </Text>
              <Text style={styles.recommendationSubtitle}>today</Text>
              <TouchableOpacity style={styles.goToToolButton} onPress={handleGoToTool}>
                <Text style={styles.goToToolText}>Go to Tool</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../assets/images/avatar.png')} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* For You Slider */}
        <View style={styles.forYouSection}>
          <View style={styles.forYouHeader}>
            <Text style={styles.forYouTitle}>For You</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/quotes')}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forYouSlider}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/quotes');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']} // Red gradient
                style={styles.forYouCard}
              >
                <View style={styles.quoteContainer}>
                  <Text style={styles.quoteText}>
                    <Text style={styles.quoteNormal}>You were never meant to run on </Text>
                    <Text style={styles.quoteKeyword}>empty</Text>
                    <Text style={styles.quoteNormal}>.</Text>
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/quotes');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4ECDC4', '#6ED4D2']} // Teal gradient
                style={styles.forYouCard}
              >
                <View style={styles.quoteContainer}>
                  <Text style={styles.quoteText}>
                    <Text style={styles.quoteNormal}>Every </Text>
                    <Text style={styles.quoteKeyword}>yes</Text>
                    <Text style={styles.quoteNormal}> costs something.</Text>
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/quotes');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#45B7D1', '#6BC5E0']} // Blue gradient
                style={styles.forYouCard}
              >
                <View style={styles.quoteContainer}>
                  <Text style={styles.quoteText}>
                    <Text style={styles.quoteNormal}>Your capacity is </Text>
                    <Text style={styles.quoteKeyword}>elastic</Text>
                    <Text style={styles.quoteNormal}>, not </Text>
                    <Text style={styles.quoteKeyword}>infinite</Text>
                    <Text style={styles.quoteNormal}>.</Text>
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/quotes');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#9B59B6', '#B06AC1']} // Purple gradient
                style={styles.forYouCard}
              >
                <View style={styles.quoteContainer}>
                  <Text style={styles.quoteText}>
                    <Text style={styles.quoteNormal}>You need </Text>
                    <Text style={styles.quoteKeyword}>permission</Text>
                    <Text style={styles.quoteNormal}> to </Text>
                    <Text style={styles.quoteKeyword}>pause</Text>
                    <Text style={styles.quoteNormal}>.</Text>
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/quotes');
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F39C12', '#F7B32B']} // Orange gradient
                style={styles.forYouCard}
              >
                <View style={styles.quoteContainer}>
                  <Text style={styles.quoteText}>
                    <Text style={styles.quoteKeyword}>Burnout</Text>
                    <Text style={styles.quoteNormal}> starts with a </Text>
                    <Text style={styles.quoteKeyword}>flicker</Text>
                    <Text style={styles.quoteNormal}>.</Text>
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Todo List Widget */}
        <View style={styles.tasksSection}>
          <TouchableOpacity 
            style={styles.tasksWidget}
            onPress={handleTasksWidgetPress}
            activeOpacity={0.8}
            disabled={isNavigating}
            delayPressIn={0}
            delayPressOut={0}
          >
            <View style={styles.tasksHeader}>
              <Text style={styles.tasksTitle}>Wellness Tasks</Text>
              <Text style={styles.tasksCount}>{completedTasks.filter(completed => !completed).length} remaining</Text>
            </View>
            
            <View style={styles.tasksList}>
              {visibleTasks.map((taskData, widgetIndex) => (
                <TouchableOpacity
                  key={widgetIndex}
                  style={styles.taskItem}
                  onPress={(event: GestureResponderEvent) => handleTaskItemPress(widgetIndex, event)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={[
                    styles.taskCircle,
                    taskData.isCompleted && styles.taskCircleCompleted
                  ]}>
                    {taskData.isCompleted && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.taskText,
                    taskData.isCompleted && styles.taskTextCompleted
                  ]}>
                    {taskData.task}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            

          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
    
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 16,
  },
  simpleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  simpleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
  },
  greetingContent: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    fontSize: 24, // Smaller text for "Hi Ebad,"
    fontWeight: '500',
    color: '#1C1C1E',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  userState: {
    fontSize: 32, // Much bigger for user state
    fontWeight: '700', // A bit more bold
    color: '#1C1C1E',
    marginTop: 18, // More gap between Hi Ebad and this text - moved down a few pixels
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    maxWidth: screenWidth - 60, // Screen width minus padding (24px on each side + some buffer)
  },
  profileIconAbsolute: {
    position: 'absolute',
    top: 52,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Higher z-index to float above everything
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text for better contrast on darker background
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  capacityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFCF0', // Subtle warm yellow
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 32, // Even more padding for better centering
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    justifyContent: 'center', // Center everything
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  capacityCol: {
    width: 80, // Fixed width instead of flex for better control
    alignItems: 'center',
    marginHorizontal: 12, // Equal spacing between items
  },
  capacityLabel: {
    fontSize: 14, // Reduced from 16 to 14 so "Connection" isn't squished
    fontWeight: '500',
    color: '#222B45',
    marginBottom: 2,
  },
  capacityBarBg: {
    width: 60,
    height: 10,
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 2,
  },
  capacityBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  capacityValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222B45',
    marginTop: 2,
  },

  toolRecommendationCard: {
    backgroundColor: '#FFFCF0', // Subtle warm yellow
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16, // Decreased top margin to reduce gap
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increased shadow offset
    shadowOpacity: 0.12, // Increased shadow opacity
    shadowRadius: 12, // Increased shadow radius
    elevation: 6,
  },
  toolRecommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolTextContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  recommendationTool: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  goToToolButton: {
    backgroundColor: '#D4D4D4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25, // Rounded but smaller
  },
  goToToolText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  avatarContainer: {
    marginLeft: 20,
    backgroundColor: '#FFFCF0', // Match card background
    padding: 5,
  },
  avatarImage: {
    width: 130,
    height: 130,
  },
  forYouSection: {
    marginBottom: 16,
  },
  forYouHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  forYouTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  seeAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#000000',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  forYouSlider: {
    paddingLeft: 16,
  },
  forYouCard: {
    borderRadius: 32, // More rounded corners
    padding: 20,
    marginRight: 16,
    marginLeft: 8,
    width: 200, // Square dimensions
    height: 200, // Square dimensions
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  forYouCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text for good contrast on gradients
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  forYouCardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#F0F8FF', // Very light blue-white for subtle contrast
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  tasksSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tasksWidget: {
    backgroundColor: '#FFFCF0', // Subtle warm yellow
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  tasksCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 30,
  },
  taskCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#8E8E93',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  taskCircleCompleted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkMark: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  taskText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  taskTextCompleted: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  widgetArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingBottom: 2,
    paddingLeft: 2,
    paddingRight: 12,
  },
  quoteText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 32,
    fontFamily: 'System',
  },
  quoteKeyword: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quoteNormal: {
    fontSize: 26,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  testSection: {
    backgroundColor: '#FFFCF0', // Subtle warm yellow
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  testSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  retakeCardContainer: {
    backgroundColor: '#FF6B6B', // Solid energy bar color
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden', // Keep for consistent shadow behavior
  },
  retakeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    paddingVertical: 15, // Apply padding here for card size
    paddingHorizontal: 20,
  },
  retakeCardText: {
    color: '#FFFFFF', // White text
    fontSize: 20,
    fontWeight: '700',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    textAlign: 'center',
    lineHeight: 28,
  },
  testButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  testButton: {
    flex: 1,
    backgroundColor: '#D4D4D4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  serviceStatusContainer: {
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  serviceStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  serviceStatusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
});
