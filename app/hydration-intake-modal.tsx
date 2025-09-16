import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ClipPath, Defs, Path, Svg } from 'react-native-svg';

export default function HydrationIntakeModal() {
  const router = useRouter();
  const [glasses, setGlasses] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleNext = () => {
    const glassCount = parseInt(glasses) || 0;
    if (glasses.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Glasses submitted:', glassCount);
      // Navigate to habit stacking screen
      router.push('/hydration-habit-stacking');
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
                  {/* Water Glass Icon */}
                  <View style={styles.iconContainer}>
                    <View style={styles.glassContainer}>
                      <Svg width={120} height={140} viewBox="0 0 120 140" style={styles.glassSvg}>
                        {/* Glass outline */}
                        <Path
                          fill="none"
                          stroke="#000"
                          strokeWidth="3"
                          d="M30,20 L90,20 L85,120 Q80,130 60,130 Q40,130 35,120 L30,20 Z"
                        />
                        {/* Glass bottom */}
                        <Path
                          fill="none"
                          stroke="#000"
                          strokeWidth="3"
                          d="M35,120 Q60,125 85,120"
                        />
                      </Svg>
                      
                      {/* Static water fill positioned like the animation */}
                      <View style={styles.staticWaterContainer}>
                        <Svg width={120} height={140} viewBox="0 0 120 140" style={styles.waterSvg}>
                          <Defs>
                            <ClipPath id="glassClip">
                              <Path d="M36,26 L84,26 L81,118 Q78,126 60,126 Q42,126 39,118 L36,26 Z" />
                            </ClipPath>
                          </Defs>
                          {/* Water fill clipped to glass shape - static at bottom with curved bottom */}
                          <Path
                            fill="#4ECDC4"
                            opacity="0.6"
                            d="M39,115 L81,115 Q78,120 60,120 Q42,120 39,115 Z"
                            clipPath="url(#glassClip)"
                          />
                          {/* Water surface with slight curve at bottom */}
                          <Path
                            fill="#4ECDC4"
                            opacity="0.8"
                            d="M39,115 Q48,113 60,115 Q72,117 81,115 L81,117 Q72,119 60,117 Q48,115 39,117 Z"
                            clipPath="url(#glassClip)"
                          />
                        </Svg>
                      </View>
                    </View>
                  </View>
                  
                  {/* Title */}
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>How many glasses of water have you had in the last 4 hours?</Text>
                  </View>
                </View>

                {/* Number input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    value={glasses}
                    onChangeText={setGlasses}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                    maxLength={2}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>

          {/* Bottom Section with Next Button - Fixed position outside KeyboardAvoidingView */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.nextButton, !glasses.trim() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!glasses.trim()}
            >
              <Text style={styles.nextButtonText}>Next</Text>
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
  glassContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassSvg: {
    width: '100%',
    height: '100%',
  },
  staticWaterContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterSvg: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 44,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    textAlign: 'center',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 50,
    left: 32,
    right: 32,
    alignItems: 'center',
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
    backgroundColor: '#E5E5EA',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 