import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function NourishmentMealAssessmentPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(option);
  };

  const handleContinue = () => {
    if (selectedOption) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/nourishment-snack-carousel' as any);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path fill="#000000" d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z" />
        </Svg>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>How was your last meal?</Text>
        <Text style={styles.subtitle}>Choose what feels true for you right now</Text>
        
        {/* Three option buttons */}
        <View style={styles.optionsContainer}>
          {/* Fuel for body */}
          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={() => handleOptionSelect('fuel')}
          >
            {selectedOption === 'fuel' && (
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
            <Text style={styles.optionEmoji}>🔋</Text>
            <Text style={styles.optionText}>Fuel for my body</Text>
          </TouchableOpacity>

          {/* Comfort for mind */}
          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={() => handleOptionSelect('comfort')}
          >
            {selectedOption === 'comfort' && (
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
            <Text style={styles.optionEmoji}>🧠</Text>
            <Text style={styles.optionText}>Comfort for my mind</Text>
          </TouchableOpacity>

          {/* A bit of both */}
          <TouchableOpacity 
            style={styles.optionButton} 
            onPress={() => handleOptionSelect('both')}
          >
            {selectedOption === 'both' && (
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
            <Text style={styles.optionEmoji}>⚖️</Text>
            <Text style={styles.optionText}>A bit of both</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Continue button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            !selectedOption && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={!selectedOption}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
    paddingTop: 140,
    paddingBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 24,
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
    gap: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 20,
  },
  optionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  continueButton: {
    width: '85%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000000',
    borderRadius: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
