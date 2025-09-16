import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

export default function ScheduleScrubIdentifyPage() {
  const router = useRouter();
  const [taskText, setTaskText] = useState('');

  const handleNext = () => {
    if (taskText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/schedule-scrub-action',
        params: { dreadedTask: taskText.trim() }
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
            {/* Creative Header with Scrub Visual */}
            <View style={styles.creativeHeader}>
              {/* Left side - Task bubble */}
              <View style={styles.taskBubble}>
                <Svg width={80} height={80} viewBox="0 0 80 80">
                  <Circle cx="40" cy="40" r="35" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
                  <SvgText x="40" y="45" fill="#92400E" fontSize="12" textAnchor="middle" fontWeight="bold">TASK</SvgText>
                  <SvgText x="40" y="60" fill="#92400E" fontSize="8" textAnchor="middle">TO SCRUB</SvgText>
                </Svg>
              </View>
              
              {/* Right side - Title and subtitle */}
              <View style={styles.headerText}>
                <Text style={styles.title}>What's Draining You?</Text>
                <Text style={styles.subtitle}>Identify one task from tomorrow that you're dreading</Text>
              </View>
            </View>

            {/* Visual Scrub Line */}
            <View style={styles.scrubLine}>
              <View style={styles.scrubDots}>
                <Circle cx="0" cy="0" r="4" fill="#E5E7EB"/>
                <Circle cx="0" cy="0" r="4" fill="#E5E7EB"/>
                <Circle cx="0" cy="0" r="4" fill="#E5E7EB"/>
              </View>
              <View style={styles.scrubBrush}>
                <Svg width={40} height={40} viewBox="0 0 40 40">
                  <Path d="M20,5 L30,15 Q35,20 30,25 L20,35 L10,25 Q5,20 10,15 Z" fill="#4ECDC4" stroke="#000" strokeWidth="1"/>
                  <Rect x="15" y="8" width="10" height="24" rx="2" fill="#666666"/>
                </Svg>
              </View>
            </View>

            {/* Input Section with Creative Layout */}
            <View style={styles.inputSection}>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Describe your dreaded task:</Text>
                <View style={styles.labelIcon}>
                  <Svg width={20} height={20} viewBox="0 0 20 20">
                    <Circle cx="10" cy="10" r="8" fill="#FF6B6B" opacity="0.2"/>
                    <Circle cx="10" cy="10" r="4" fill="#FF6B6B"/>
                  </Svg>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.taskInput}
                  value={taskText}
                  onChangeText={setTaskText}
                  multiline
                  placeholder="e.g., 'Prepare a detailed report for my manager,' 'Attend a long, unproductive meeting,' 'Clean the entire house.'"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <View style={styles.characterCountContainer}>
                    <Text style={styles.characterCount}>{taskText.length} characters</Text>
                  </View>
                  <View style={styles.inputDecoration}>
                    <Circle cx="0" cy="0" r="2" fill="#E5E7EB"/>
                    <Circle cx="0" cy="0" r="2" fill="#E5E7EB"/>
                    <Circle cx="0" cy="0" r="2" fill="#E5E7EB"/>
                  </View>
                </View>
              </View>
            </View>

            {/* Next Button with Creative Styling */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !taskText.trim() && styles.nextButtonDisabled
                ]}
                onPress={handleNext}
                disabled={!taskText.trim()}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.nextButtonText}>Scrub This Task</Text>
                  <View style={styles.buttonIcon}>
                    <Svg width={20} height={20} viewBox="0 0 20 20">
                      <Path d="M5,10 L15,10 M10,5 L10,15" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
                    </Svg>
                  </View>
                </View>
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
    paddingTop: 80,
    paddingBottom: 50,
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
  creativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  taskBubble: {
    marginRight: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 38,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  scrubLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  scrubDots: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 20,
  },
  scrubBrush: {
    alignItems: 'center',
  },
  inputSection: {
    flex: 1,
    marginBottom: 40,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  labelIcon: {
    marginLeft: 12,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 24,
    flex: 1,
    minHeight: 250,
  },
  taskInput: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    minHeight: 180,
    textAlignVertical: 'top',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  characterCountContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  characterCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  inputDecoration: {
    flexDirection: 'row',
    gap: 8,
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  buttonIcon: {
    alignItems: 'center',
  },
});
