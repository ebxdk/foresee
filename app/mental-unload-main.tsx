import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export default function MentalUnloadMainPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/mental-unload-record');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
          {/* Message Section */}
          <View style={styles.messageSection}>
            {/* Icon and text container */}
            <View style={styles.iconAndTextContainer}>
              {/* Brain Icon with Thought Bubbles */}
              <View style={styles.iconContainer}>
                <Svg width={140} height={140} viewBox="0 0 140 140">
                  {/* Main brain shape */}
                  <Path
                    fill="#F3F4F6"
                    stroke="#000"
                    strokeWidth="2"
                    d="M70,20 C50,20 35,35 35,55 C35,65 40,75 50,80 C45,85 40,95 40,105 C40,115 50,125 70,125 C90,125 100,115 100,105 C100,95 95,85 90,80 C100,75 105,65 105,55 C105,35 90,20 70,20 Z"
                  />
                  
                  {/* Brain folds */}
                  <Path
                    fill="none"
                    stroke="#000"
                    strokeWidth="1.5"
                    d="M45,30 Q70,25 95,30 M45,40 Q70,35 95,40 M45,50 Q70,45 95,50 M45,60 Q70,55 95,60 M45,70 Q70,65 95,70 M45,80 Q70,75 95,80 M45,90 Q70,85 95,90 M45,100 Q70,95 95,100"
                  />
                  
                  {/* Thought bubbles */}
                  <Circle cx="25" cy="35" r="8" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
                  <Circle cx="20" cy="25" r="5" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
                  <Circle cx="15" cy="18" r="3" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
                  
                  <Circle cx="115" cy="45" r="8" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
                  <Circle cx="120" cy="35" r="5" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
                  <Circle cx="125" cy="28" r="3" fill="#E5E7EB" stroke="#000" strokeWidth="1"/>
                  
                  {/* Microphone icon */}
                  <Rect x="65" y="90" width="10" height="20" rx="5" fill="#000"/>
                  <Circle cx="70" cy="85" r="8" fill="#000"/>
                  <Path
                    fill="#000"
                    d="M70,75 L70,70 M65,70 L75,70"
                  />
                </Svg>
              </View>
              
              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>Mental Unload</Text>
                <Text style={styles.subtitle}>Voice-to-text emotional dump. Clear your mental RAM in 60 seconds.</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section with Get Started Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
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
    justifyContent: 'space-between',
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
  messageSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 80,
  },
  iconAndTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 30,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
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
  subtitle: {
    fontSize: 18,
    color: '#666666',
    lineHeight: 26,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  getStartedButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});
