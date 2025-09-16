import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function SweetSpotScanPlanPage() {
  const router = useRouter();
  const { identifiedMoment } = useLocalSearchParams<{ identifiedMoment: string }>();
  const [plannedMoment, setPlannedMoment] = useState('');

  const handleComplete = () => {
    if (plannedMoment.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/sweet-spot-scan-complete');
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
              <Text style={styles.title}>Amplify Your Sweet Spot</Text>
              <Text style={styles.subtitle}>How can you create a similar "sweet spot" moment for yourself later today?</Text>
            </View>

            {/* Identified Moment Display */}
            <View style={styles.momentDisplaySection}>
              <Text style={styles.sectionTitle}>Your identified moment:</Text>
              <View style={styles.momentDisplayContainer}>
                <Text style={styles.momentDisplayText}>
                  {identifiedMoment || "No moment identified. Please go back and try again."}
                </Text>
              </View>
            </View>

            {/* Plan Next Moment Section */}
            <View style={styles.planSection}>
              <Text style={styles.sectionTitle}>Plan your next moment:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.planInput}
                  value={plannedMoment}
                  onChangeText={setPlannedMoment}
                  multiline
                  placeholder="e.g., 'Take 15 mins to read without distractions,' 'Call a friend who always makes me laugh,' 'Focus on one task completely.'"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.characterCount}>{plannedMoment.length} characters</Text>
                </View>
              </View>
            </View>

            {/* Complete Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  !plannedMoment.trim() && styles.completeButtonDisabled
                ]}
                onPress={handleComplete}
                disabled={!plannedMoment.trim()}
              >
                <Text style={styles.completeButtonText}>Complete Scan</Text>
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  momentDisplaySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  momentDisplayContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    padding: 20,
  },
  momentDisplayText: {
    fontSize: 16,
    color: '#065F46',
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  planSection: {
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
  },
  planInput: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    minHeight: 150,
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
  completeButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
