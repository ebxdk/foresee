import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CapacityTasks() {
  const [tasks, setTasks] = useState<string[]>(['', '', '', '', '', '', '', '', '', '']);

  const handleTaskChange = (text: string, index: number) => {
    const newTasks = [...tasks];
    newTasks[index] = text;
    setTasks(newTasks);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/capacity-priorities' as any);
  };

  const filledTasks = tasks.filter(task => task.trim().length > 0);
  const canContinue = filledTasks.length >= 8;

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
          List your upcoming tasks
        </Text>
        
        <Text style={styles.subtitle}>
          Enter 8-10 tasks or obligations for tomorrow. Be specific about what needs to get done.
        </Text>

        <View style={styles.tasksContainer}>
          {tasks.map((task, index) => (
            <View key={index} style={styles.taskInputContainer}>
              <Text style={styles.taskLabel}>Task #{index + 1}</Text>
              <TextInput
                style={styles.taskInput}
                value={task}
                onChangeText={(text) => handleTaskChange(text, index)}
                placeholder={`e.g., ${getPlaceholder(index)}`}
                placeholderTextColor="#999"
                multiline
              />
            </View>
          ))}
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {filledTasks.length} of 8+ tasks filled
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((filledTasks.length / 8) * 100, 100)}%` }
              ]} 
            />
          </View>
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

function getPlaceholder(index: number): string {
  const placeholders = [
    "prepare presentation for team meeting",
    "review quarterly budget reports",
    "call client about project timeline",
    "update project documentation",
    "schedule follow-up with stakeholders",
    "prepare agenda for weekly sync",
    "review and approve team requests",
    "plan next sprint priorities",
    "conduct performance review",
    "attend industry conference call"
  ];
  return placeholders[index] || "important task";
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
  tasksContainer: {
    marginBottom: 32,
  },
  taskInputContainer: {
    marginBottom: 20,
  },
  taskLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  taskInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
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



