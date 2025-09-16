import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AimProject() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [customProject, setCustomProject] = useState<string>('');

  const commonProjects = [
    'Work project',
    'Health goal',
    'Learning new skill',
    'Financial planning',
    'Relationship building',
    'Personal development',
    'Creative project',
    'Career advancement'
  ];

  const handleProjectSelect = (project: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProject(project);
    setCustomProject('');
  };

  const handleCustomProject = (text: string) => {
    setCustomProject(text);
    setSelectedProject('');
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/aim-purpose' as any);
  };

  const canContinue = selectedProject !== '' || customProject.trim() !== '';

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
          What are you working on?
        </Text>
        
        <Text style={styles.subtitle}>
          Select a current project or goal that you'd like to reconnect with your deeper purpose
        </Text>

        <View style={styles.projectsGrid}>
          {commonProjects.map((project) => (
            <TouchableOpacity
              key={project}
              style={[
                styles.projectCard,
                selectedProject === project && styles.projectCardSelected
              ]}
              onPress={() => handleProjectSelect(project)}
            >
              <Text style={[
                styles.projectText,
                selectedProject === project && styles.projectTextSelected
              ]}>
                {project}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customSection}>
          <Text style={styles.customLabel}>Or add your own:</Text>
          <TextInput
            style={styles.customInput}
            value={customProject}
            onChangeText={handleCustomProject}
            placeholder="e.g., Writing my book, Starting a business, Learning guitar..."
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Why reconnect with purpose?</Text>
          <Text style={styles.explanationText}>
            When we're deep in the work, it's easy to lose sight of why it matters. Reconnecting with your deeper "why" can renew motivation, provide clarity during challenges, and help you make better decisions about where to invest your energy.
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
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  projectCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignItems: 'center',
  },
  projectCardSelected: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  projectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  projectTextSelected: {
    color: '#FFFFFF',
  },
  customSection: {
    marginBottom: 32,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  customInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  explanationContainer: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 32,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#92400E',
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



