import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function BoundaryBuilderScriptsPage() {
  const router = useRouter();
  const { situation } = useLocalSearchParams<{ situation: string }>();
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [customScript, setCustomScript] = useState('');

  // Pre-written boundary scripts
  const boundaryScripts = [
    "Let me get back to you on that.",
    "I don't have capacity right now.",
    "I need to think about this first.",
    "That doesn't work for me.",
    "I'm not comfortable with that.",
    "I need to prioritize my current commitments.",
    "Let me check my schedule and get back to you.",
    "I appreciate you thinking of me, but I can't take this on.",
    "I need to say no to this one.",
    "This isn't a good fit for me right now."
  ];

  const handleScriptSelect = (script: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedScript(script);
    setCustomScript(script); // Pre-fill the custom input
  };

  const handleNext = () => {
    if (customScript.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/boundary-builder-rehearse',
        params: { 
          situation: situation,
          finalScript: customScript.trim() 
        }
      });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                fill="#000"
                d="M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z"
              />
            </Svg>
          </TouchableOpacity>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Choose Your Boundary Script</Text>
              <Text style={styles.subtitle}>Select a boundary script that feels right for this situation, or edit it to make it your own.</Text>
            </View>

            {/* Situation Display */}
            <View style={styles.situationSection}>
              <Text style={styles.sectionTitle}>Your situation:</Text>
              <View style={styles.situationContainer}>
                <Text style={styles.situationText}>
                  {situation || "No situation described. Please go back and try again."}
                </Text>
              </View>
            </View>

            {/* Script Selection Section */}
            <View style={styles.scriptsSection}>
              <Text style={styles.sectionTitle}>Choose a script:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scriptsContainer}
              >
                {boundaryScripts.map((script, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.scriptCard,
                      selectedScript === script && styles.selectedScriptCard
                    ]}
                    onPress={() => handleScriptSelect(script)}
                  >
                    <Text style={styles.scriptText} numberOfLines={2}>
                      {script}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Custom Script Section */}
            <View style={styles.customSection}>
              <Text style={styles.sectionTitle}>Your final script:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.customInput}
                  value={customScript}
                  onChangeText={setCustomScript}
                  multiline
                  placeholder="Edit the script above or write your own boundary statement..."
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.characterCount}>{customScript.length} characters</Text>
                </View>
              </View>
            </View>

            {/* Next Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !customScript.trim() && styles.nextButtonDisabled
                ]}
                onPress={handleNext}
                disabled={!customScript.trim()}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 60,
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
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 44,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  situationSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  situationContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    padding: 20,
  },
  situationText: {
    fontSize: 16,
    color: '#065F46',
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scriptsSection: {
    marginBottom: 30,
  },
  scriptsContainer: {
    paddingRight: 32,
  },
  scriptCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    marginRight: 16,
    width: 200,
    minHeight: 80,
    justifyContent: 'center',
  },
  selectedScriptCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  scriptText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  customSection: {
    flex: 1,
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 20,
    flex: 1,
    minHeight: 150,
  },
  customInput: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  characterCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  nextButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
