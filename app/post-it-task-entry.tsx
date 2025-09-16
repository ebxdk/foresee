import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function PostItTaskEntryScreen() {
  const router = useRouter();
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');
  const [task3, setTask3] = useState('');
  
  const task2Ref = useRef<TextInput>(null);
  const task3Ref = useRef<TextInput>(null);

  const handleNext = () => {
    if (task1.trim() && task2.trim() && task3.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/post-it-task-select',
        params: { t1: task1.trim(), t2: task2.trim(), t3: task3.trim() },
      });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const allTasksFilled = task1.trim() && task2.trim() && task3.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                fill="#000000"
                d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"
              />
            </Svg>
          </TouchableOpacity>

          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            {/* Content */}
            <View style={styles.content}>
              {/* Title */}
              <Text style={styles.title}>What's stressing you out?</Text>
              
              {/* Subtitle */}
              <Text style={styles.subtitle}>
                List the top 3 tasks that are weighing on your mind. Let's get them out of your head! 🧠✨
              </Text>

              {/* Task Input Fields */}
              <View style={styles.tasksContainer}>
                <View style={styles.taskInputContainer}>
                  <View style={styles.taskNumber}>
                    <Text style={styles.taskNumberText}>1</Text>
                  </View>
                  <TextInput
                    style={styles.taskInput}
                    placeholder="First stressful task..."
                    value={task1}
                    onChangeText={setTask1}
                    placeholderTextColor="#aaa"
                    returnKeyType="next"
                    onSubmitEditing={() => task2Ref.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.taskInputContainer}>
                  <View style={styles.taskNumber}>
                    <Text style={styles.taskNumberText}>2</Text>
                  </View>
                  <TextInput
                    ref={task2Ref}
                    style={styles.taskInput}
                    placeholder="Second stressful task..."
                    value={task2}
                    onChangeText={setTask2}
                    placeholderTextColor="#aaa"
                    returnKeyType="next"
                    onSubmitEditing={() => task3Ref.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.taskInputContainer}>
                  <View style={styles.taskNumber}>
                    <Text style={styles.taskNumberText}>3</Text>
                  </View>
                  <TextInput
                    ref={task3Ref}
                    style={styles.taskInput}
                    placeholder="Third stressful task..."
                    value={task3}
                    onChangeText={setTask3}
                    placeholderTextColor="#aaa"
                    returnKeyType="done"
                    onSubmitEditing={dismissKeyboard}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>

          {/* Fixed Next Button */}
          <TouchableOpacity 
            style={[styles.nextButton, !allTasksFilled && styles.nextButtonDisabled]} 
            onPress={handleNext}
            disabled={!allTasksFilled}
          >
            <Text style={[styles.nextButtonText, !allTasksFilled && styles.nextButtonTextDisabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    textAlign: 'left',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 32,
    marginBottom: 34,
    textAlign: 'left',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  tasksContainer: {
    width: '100%',
    gap: 20,
  },
  taskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  taskNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  taskInput: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    left: 32,
    right: 32,
    backgroundColor: '#000000',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  nextButtonTextDisabled: {
    color: '#aaa',
  },
}); 