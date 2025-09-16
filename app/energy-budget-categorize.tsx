import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Category = 'Gain' | 'Drain' | 'Neutral';

interface DrainItem {
  text: string;
  category: Category | null;
}

export default function EnergyBudgetCategorize() {
  const [drains, setDrains] = useState<DrainItem[]>([
    { text: 'Difficult conversation with boss', category: null },
    { text: 'Overwhelming task list', category: null },
    { text: 'Negative social media scrolling', category: null },
  ]);

  const handleCategorySelect = (index: number, category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDrains = [...drains];
    newDrains[index].category = category;
    setDrains(newDrains);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/energy-budget-plan' as any);
  };

  const canContinue = drains.every(drain => drain.category !== null);

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'Gain': return '#22C55E';
      case 'Drain': return '#EF4444';
      case 'Neutral': return '#6B7280';
      default: return '#E5E7EB';
    }
  };

  const getCategoryEmoji = (category: Category) => {
    switch (category) {
      case 'Gain': return '🟢';
      case 'Drain': return '🔴';
      case 'Neutral': return '⚪';
      default: return '';
    }
  };

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
          Categorize each item
        </Text>
        
        <Text style={styles.subtitle}>
          Was this a gain, drain, or neutral for your energy?
        </Text>

        {drains.map((drain, index) => (
          <View key={index} style={styles.drainContainer}>
            <Text style={styles.drainText}>{drain.text}</Text>
            
            <View style={styles.categoryButtons}>
              {(['Gain', 'Drain', 'Neutral'] as Category[]).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    drain.category === category && { 
                      backgroundColor: getCategoryColor(category),
                      borderColor: getCategoryColor(category)
                    }
                  ]}
                  onPress={() => handleCategorySelect(index, category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    drain.category === category && styles.categoryButtonTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {drain.category && (
              <View style={styles.selectedCategory}>
                <Text style={styles.selectedCategoryText}>
                  {getCategoryEmoji(drain.category)} {drain.category}
                </Text>
              </View>
            )}
          </View>
        ))}

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
  drainContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  drainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    lineHeight: 22,
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  selectedCategory: {
    alignItems: 'center',
    paddingTop: 8,
  },
  selectedCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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




