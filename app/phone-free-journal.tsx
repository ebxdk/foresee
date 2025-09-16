import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export default function PhoneFreeJournalPage() {
  const router = useRouter();
  const [reflection, setReflection] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleNext = () => {
    if (reflection.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Reflection submitted:', reflection);
      // Navigate to summary screen with reflection parameter
      router.push({
        pathname: '/phone-free-summary',
        params: { reflection: reflection.trim() }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
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

          {/* Main Content with Keyboard Avoidance */}
          <KeyboardAvoidingView 
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <View style={styles.content}>
              {/* Message Section */}
              <View style={styles.messageSection}>
                {/* Icon and text container */}
                <View style={styles.iconAndTextContainer}>
                  {/* Window Icon */}
                  <View style={styles.iconContainer}>
                    <View style={styles.windowContainer}>
                      <Svg width={120} height={140} viewBox="0 0 120 140">
                        {/* Window frame */}
                        <Rect
                          x="20"
                          y="20"
                          width="80"
                          height="100"
                          fill="none"
                          stroke="#333"
                          strokeWidth="3"
                        />
                        {/* Window panes */}
                        <Rect
                          x="25"
                          y="25"
                          width="35"
                          height="45"
                          fill="#87CEEB"
                          opacity="0.3"
                        />
                        <Rect
                          x="65"
                          y="25"
                          width="30"
                          height="45"
                          fill="#87CEEB"
                          opacity="0.3"
                        />
                        <Rect
                          x="25"
                          y="75"
                          width="35"
                          height="40"
                          fill="#87CEEB"
                          opacity="0.3"
                        />
                        <Rect
                          x="65"
                          y="75"
                          width="30"
                          height="40"
                          fill="#87CEEB"
                          opacity="0.3"
                        />
                        {/* Window dividers */}
                        <Path
                          d="M60,25 L60,65 M25,70 L95,70"
                          stroke="#333"
                          strokeWidth="2"
                        />
                      </Svg>
                    </View>
                  </View>
                  
                  {/* Title */}
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>What did you notice during your pause?</Text>
                    <Text style={styles.subtitle}>Reflect on what you saw, heard, or felt while looking out the window.</Text>
                  </View>
                </View>

                {/* Text input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="I noticed..."
                    placeholderTextColor="#9CA3AF"
                    value={reflection}
                    onChangeText={setReflection}
                    multiline
                    textAlignVertical="top"
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                    maxLength={500}
                  />
                  <Text style={styles.characterCount}>{reflection.length}/500</Text>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>

          {/* Bottom Section with Next Button - Fixed position outside KeyboardAvoidingView */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.nextButton, !reflection.trim() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!reflection.trim()}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 20,
  },
  messageSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 20,
  },
  iconAndTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    height: 140,
  },
  windowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 36,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    lineHeight: 26,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 120,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: 24,
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 32,
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
