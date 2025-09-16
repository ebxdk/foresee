import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HydrationHeroPageProps {
  visible: boolean;
  onClose: () => void;
}

export default function HydrationHeroPage({ visible, onClose }: HydrationHeroPageProps) {
  const [completed, setCompleted] = useState(false);
  const [showBreath, setShowBreath] = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  if (!visible) return null;

  const handleMarkDrank = () => {
    setCompleted(true);
  };

  const handleBreath = () => {
    if (breathCount < 2) {
      setBreathCount(breathCount + 1);
    } else {
      setShowBreath(false);
      setBreathCount(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8FA" />
      
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hydration Hero</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Hydration Hero</Text>
        <Text style={styles.subtitle}>Drink one full glass of water + take 3 deep breaths.</Text>
        
        <View style={styles.iconPlaceholder}>
          <Text style={{ fontSize: 120 }}>🥤</Text>
        </View>

        {!completed && !showBreath && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleMarkDrank}>
              <Text style={styles.primaryButtonText}>Mark as Drank</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowBreath(true)}>
              <Text style={styles.secondaryButtonText}>Start Breathing Timer</Text>
            </TouchableOpacity>
          </View>
        )}

        {showBreath && !completed && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleBreath}>
              <Text style={styles.primaryButtonText}>Take Breath {breathCount + 1}/3</Text>
            </TouchableOpacity>
          </View>
        )}

        {completed && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>🎉 Great job! Your Energy ring just got a boost.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8F8FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  iconPlaceholder: {
    marginBottom: 50,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '80%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0284C7',
    fontWeight: '600',
    fontSize: 16,
  },
  completionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  completionText: {
    fontSize: 20,
    color: '#16A34A',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
}); 