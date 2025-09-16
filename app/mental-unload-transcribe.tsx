import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function MentalUnloadTranscribePage() {
  const router = useRouter();
  const { transcription } = useLocalSearchParams<{ transcription: string }>();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleKeep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement save to private notes
    router.push('/mental-unload-complete');
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsDeleting(true);
    
    // Simulate deletion process
    setTimeout(() => {
      router.push('/mental-unload-complete');
    }, 1000);
  };

  const handleRecordAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/mental-unload-record');
  };

  return (
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
            <Text style={styles.title}>Your Mental Unload</Text>
            <Text style={styles.subtitle}>Here's what you just shared:</Text>
          </View>

          {/* Transcription Section */}
          <View style={styles.transcriptionSection}>
            <ScrollView 
              style={styles.transcriptionContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.transcriptionContent}
            >
              <Text style={styles.transcriptionText}>
                {transcription || "No transcription available. Please try recording again."}
              </Text>
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.keepButton}
              onPress={handleKeep}
              disabled={isDeleting}
            >
              <View style={styles.buttonIconContainer}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    fill="#FFFFFF"
                    d="M9,16.17L4.83,12l-1.42,1.41L9,19L21,7l-1.41-1.41L9,16.17z"
                  />
                </Svg>
              </View>
              <Text style={styles.keepButtonText}>Keep It</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <View style={styles.buttonIconContainer}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Path
                    fill="#FFFFFF"
                    d="M6,19c0,1.1 0.9,2 2,2h8c1.1,0 2-0.9 2-2V7H6V19zM19,4h-3.5l-1-1h-5l-1,1H5v2h14V4z"
                  />
                </Svg>
              </View>
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Deleting...' : 'Delete It'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.recordAgainButton}
              onPress={handleRecordAgain}
              disabled={isDeleting}
            >
              <View style={styles.buttonIconContainer}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="10" fill="none" stroke="#000" strokeWidth="2"/>
                  <Path
                    fill="#000"
                    d="M12,6v6l4,2"
                  />
                </Svg>
              </View>
              <Text style={styles.recordAgainButtonText}>Record Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
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
  transcriptionSection: {
    flex: 1,
    marginBottom: 40,
  },
  transcriptionContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  transcriptionContent: {
    padding: 24,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  actionSection: {
    alignItems: 'center',
    gap: 16,
  },
  keepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    backgroundColor: '#10B981',
    borderRadius: 28,
    paddingHorizontal: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    backgroundColor: '#EF4444',
    borderRadius: 28,
    paddingHorizontal: 24,
  },
  recordAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 28,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  buttonIconContainer: {
    marginRight: 12,
  },
  keepButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  recordAgainButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

