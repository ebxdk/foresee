import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeOut,
    Layout,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

// Import utilities for AI-generated tasks
import { generateWellnessTasks } from '../utils/aiTaskGenerator';
import { getDailyTasks, getEPCScores, getUserState, shouldRegenerateTasks, storeDailyTasks, updateTaskCompletion } from '../utils/storage';

// Fallback tasks if AI generation fails
const fallbackTasks = [
  "Take 5 deep breaths",
  "Drink a glass of water", 
  "Do 10 jumping jacks",
  "Text someone you care about",
  "Write down one thing you're grateful for",
  "Step outside for 2 minutes",
  "Stretch your shoulders",
  "Check your posture",
  "Eat a healthy snack",
  "Tidy your workspace",
  "Take a mindful moment",
  "Connect with a colleague"
];

// Animated task item component
const AnimatedTaskItem = ({ task, index, isCompleted, onToggle, onRemove }: {
  task: string;
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCompleted) {
      // Start fade out animation after a delay
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 });
        scale.value = withTiming(0.8, { duration: 500 }, () => {
          // Remove the task from the list after animation completes
          runOnJS(onRemove)();
        });
      }, 1500); // 1.5 second delay before fading

      return () => clearTimeout(timeout);
    } else {
      // Reset animation values when task becomes uncompleted
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [isCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View 
      layout={Layout.springify().damping(15).stiffness(150)}
      exiting={FadeOut.duration(300).springify()}
    >
      <Animated.View style={animatedStyle}>
        <TouchableOpacity 
          style={styles.taskItem} 
          onPress={onToggle}
          activeOpacity={0.6}
        >
          <View style={[styles.taskCircle, isCompleted && styles.taskCircleCompleted]}>
            {isCompleted && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={[styles.taskText, isCompleted && styles.taskTextCompleted]}>
            {task}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default function TasksScreen() {
  const router = useRouter();
  const [dailyTasks, setDailyTasks] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<boolean[]>([]);
  const [visibleTasks, setVisibleTasks] = useState<{task: string; index: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load AI-generated tasks when component mounts
  const loadDailyTasks = async () => {
    try {
      setIsLoading(true);
      
      // Check if we need new tasks for today
      const needsNewTasks = await shouldRegenerateTasks();
      
      if (needsNewTasks) {
        // Get user data for task generation
        const [scores, userState] = await Promise.all([
          getEPCScores(),
          getUserState()
        ]);
        
        if (scores && userState) {
          console.log('Generating new tasks in tasks page...');
          const newTasks = await generateWellnessTasks(scores, userState);
          await storeDailyTasks(newTasks);
          setDailyTasks(newTasks);
          setCompletedTasks(new Array(newTasks.length).fill(false));
          setVisibleTasks(newTasks.map((task, index) => ({ task, index })));
        } else {
          // Use fallback if no user data
          setDailyTasks(fallbackTasks);
          setCompletedTasks(new Array(fallbackTasks.length).fill(false));
          setVisibleTasks(fallbackTasks.map((task, index) => ({ task, index })));
        }
      } else {
        // Load existing tasks
        const storedTasks = await getDailyTasks();
        if (storedTasks && storedTasks.tasks) {
          setDailyTasks(storedTasks.tasks);
          setCompletedTasks(storedTasks.completed);
          setVisibleTasks(storedTasks.tasks.map((task, index) => ({ task, index })));
        } else {
          // Use fallback tasks
          setDailyTasks(fallbackTasks);
          setCompletedTasks(new Array(fallbackTasks.length).fill(false));
          setVisibleTasks(fallbackTasks.map((task, index) => ({ task, index })));
        }
      }
    } catch (error) {
      console.error('Error loading daily tasks:', error);
      // Use fallback tasks on error
      setDailyTasks(fallbackTasks);
      setCompletedTasks(new Array(fallbackTasks.length).fill(false));
      setVisibleTasks(fallbackTasks.map((task, index) => ({ task, index })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDailyTasks();
  }, []);

  // Reload tasks when screen comes into focus (in case they were updated elsewhere)
  useFocusEffect(
    useCallback(() => {
      loadDailyTasks();
    }, [])
  );

  const toggleTask = async (taskIndex: number) => {
    const newCompletedTasks = [...completedTasks];
    newCompletedTasks[taskIndex] = !newCompletedTasks[taskIndex];
    setCompletedTasks(newCompletedTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Persist completion state to storage
    try {
      await updateTaskCompletion(newCompletedTasks);
    } catch (error) {
      console.error('Error saving task completion:', error);
    }
  };

  const removeTask = (taskIndex: number) => {
    setVisibleTasks(prev => prev.filter(item => item.index !== taskIndex));
  };

  const completedCount = completedTasks.filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Modal handle */}
      <View style={styles.modalHandle} />

      {/* Minimal header with just back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Large title in content area */}
        <View style={styles.titleSection}>
          <Text style={styles.largeTitle}>Today</Text>
          <Text style={styles.subtitle}>
            {dailyTasks.length} tasks • {completedCount} completed
          </Text>
        </View>

        {/* Clean task list with smooth animations */}
        <Animated.View style={styles.tasksList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your wellness tasks...</Text>
            </View>
          ) : (
            visibleTasks.map((item) => (
            <AnimatedTaskItem
              key={item.index}
              task={item.task}
              index={item.index}
              isCompleted={completedTasks[item.index]}
              onToggle={() => toggleTask(item.index)}
              onRemove={() => removeTask(item.index)}
            />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for modal
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#007AFF',
    marginLeft: -2, // Optical alignment
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
  },
  tasksList: {
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C6C6C8',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskCircleCompleted: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  taskText: {
    fontSize: 17,
    color: '#000000',
    fontWeight: '400',
    flex: 1,
    lineHeight: 22,
  },
  taskTextCompleted: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  checkMark: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
}); 