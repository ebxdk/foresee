import { router } from 'expo-router';
import React, { useState } from 'react';
import { Linking, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getToolCooldownStatus, storeToolUsage, updateEPCScoresFromTool } from '../utils/storage';

export default function PleasurePlaylistPage() {
  const [completed, setCompleted] = useState(false);

  const handleOpenMusic = async () => {
    // Try to open music app
    try {
      await Linking.openURL('music://');
    } catch (error) {
      // Fallback to Spotify or Apple Music
      try {
        await Linking.openURL('spotify://');
      } catch (error) {
        // Last fallback
        await Linking.openURL('https://music.apple.com/');
      }
    }
    setCompleted(true);
  };

  const handleBack = async () => {
    try {
      // Get cooldown status and effective points for Pleasure Playlist
      const cooldownStatus = await getToolCooldownStatus('pleasurePlaylist');
      
      // Store the tool usage with effective points
      await storeToolUsage('pleasurePlaylist', cooldownStatus.effectivePoints);
      
      // Update EPC scores with the points earned
      await updateEPCScoresFromTool('pleasurePlaylist', cooldownStatus.effectivePoints);
      
      console.log('Pleasure Playlist completed!', {
        pointsEarned: cooldownStatus.effectivePoints,
        effectiveness: cooldownStatus.effectivenessPercentage + '%',
        cooldownRemaining: cooldownStatus.cooldownRemaining > 0 ? `${cooldownStatus.cooldownRemaining}h remaining` : 'Full effect available'
      });
      
    } catch (error) {
      console.error('Error completing Pleasure Playlist:', error);
    }
    
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8FA" />

      {/* Main Content */}
      <Animated.View style={styles.content} entering={FadeIn.duration(400)}>
        <Text style={styles.title}>Pleasure Playlist</Text>
        <Text style={styles.subtitle}>Play music that brings you joy and activates positive energy.</Text>
        
        <Animated.View style={styles.iconContainer} entering={FadeIn.duration(600).delay(200)}>
          <Text style={styles.icon}>🎵</Text>
        </Animated.View>

        {!completed && (
          <Animated.View style={styles.actionContainer} entering={FadeIn.duration(400).delay(400)}>
            <Text style={styles.instruction}>Choose a song or playlist that makes you feel good.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleOpenMusic}>
              <Text style={styles.primaryButtonText}>Open Music App</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {completed && (
          <Animated.View style={styles.completionContainer} entering={FadeIn.duration(500)}>
            <Text style={styles.completionEmoji}>🎶</Text>
            <Text style={styles.completionText}>Music is medicine! You've activated joy and positive energy.</Text>
            <TouchableOpacity style={styles.doneButton} onPress={handleBack}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 26,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  icon: {
    fontSize: 120,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '85%',
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
  completionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  completionEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  completionText: {
    fontSize: 22,
    color: '#1D4ED8',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
  },
  doneButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 50,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
}); 