import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function SweetSpotScanIdentifyPage() {
  const router = useRouter();
  const [momentText, setMomentText] = useState('');

  const handleNext = () => {
    if (momentText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/sweet-spot-scan-plan',
        params: { identifiedMoment: momentText.trim() }
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
              <Text style={styles.title}>Your Sweet Spot Moment</Text>
              <Text style={styles.subtitle}>Think of one recent micro-moment today where you felt "in the zone," deeply purposeful, or genuinely content.</Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.momentInput}
                  value={momentText}
                  onChangeText={setMomentText}
                  multiline
                  placeholder="e.g., 'Lost track of time while coding,' 'Felt calm during my morning coffee,' 'Connected deeply in a conversation.'"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.characterCount}>{momentText.length} characters</Text>
                </View>
              </View>
            </View>

            {/* Next Button */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !momentText.trim() && styles.nextButtonDisabled
                ]}
                onPress={handleNext}
                disabled={!momentText.trim()}
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
  inputSection: {
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
  momentInput: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    minHeight: 200,
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
