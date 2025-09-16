import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CapacityPriorities() {
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const sampleTasks = [
    'Prepare presentation for team meeting',
    'Review quarterly budget reports',
    'Call client about project timeline',
    'Update project documentation',
    'Schedule follow-up with stakeholders',
    'Prepare agenda for weekly sync',
    'Review and approve team requests',
    'Plan next sprint priorities'
  ];

  const handleTaskSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (selectedTasks.includes(index)) {
      setSelectedTasks(selectedTasks.filter(i => i !== index));
    } else if (selectedTasks.length < 3) {
      setSelectedTasks([...selectedTasks, index]);
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/capacity-complete' as any);
  };

  const canContinue = selectedTasks.length === 3;

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
          Choose your 3 priorities
        </Text>
        
        <Text style={styles.subtitle}>
          If you could only complete 3 things tomorrow that would move your week forward, which would they be?
        </Text>

        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedTasks.length}/3 selected
          </Text>
        </View>

        <View style={styles.tasksContainer}>
          {sampleTasks.map((task, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.taskCard,
                selectedTasks.includes(index) && styles.taskCardSelected
              ]}
              onPress={() => handleTaskSelect(index)}
            >
              <Text style={[
                styles.taskText,
                selectedTasks.includes(index) && styles.taskTextSelected
              ]}>
                {task}
              </Text>
              
              {selectedTasks.includes(index) && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓ Priority</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Why only 3?</Text>
          <Text style={styles.explanationText}>
            These become your "capacity protectors" - your north star for tomorrow. Everything else moves to a "Bonus" section, helping you avoid overloading and stay intentional.
          </Text>
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
  selectionInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  tasksContainer: {
    marginBottom: 32,
  },
  taskCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  taskCardSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 22,
  },
  taskTextSelected: {
    color: '#FFFFFF',
  },
  selectedIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  explanationContainer: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 32,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
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



