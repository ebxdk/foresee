import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function ConnectionSparkMainPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/connection-spark-contacts');
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
              {/* Heart with Spark Icon */}
              <View style={styles.iconContainer}>
                <Svg width={140} height={140} viewBox="0 0 140 140">
                  {/* Main heart shape */}
                  <Path
                    fill="#FF6B6B"
                    stroke="#000"
                    strokeWidth="2"
                    d="M70,120 C70,120 20,80 20,50 C20,30 35,15 70,15 C105,15 120,30 120,50 C120,80 70,120 70,120 Z"
                  />
                  
                  {/* Heart highlight */}
                  <Path
                    fill="#FF8E8E"
                    d="M70,120 C70,120 35,85 35,55 C35,40 45,30 70,30 C95,30 105,40 105,55 C105,85 70,120 70,120 Z"
                  />
                  
                  {/* Spark lines radiating from heart */}
                  <Path
                    fill="none"
                    stroke="#FFD93D"
                    strokeWidth="3"
                    strokeLinecap="round"
                    d="M70,10 L70,5 M60,15 L55,10 M80,15 L85,10 M50,25 L45,20 M90,25 L95,20 M40,40 L35,35 M100,40 L105,35"
                  />
                  
                  {/* Small sparkles */}
                  <Circle cx="45" cy="45" r="3" fill="#FFD93D"/>
                  <Circle cx="95" cy="45" r="3" fill="#FFD93D"/>
                  <Circle cx="60" cy="25" r="2" fill="#FFD93D"/>
                  <Circle cx="80" cy="25" r="2" fill="#FFD93D"/>
                  
                  {/* Connection lines */}
                  <Path
                    fill="none"
                    stroke="#4ECDC4"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    d="M30,80 Q50,70 70,80 Q90,70 110,80"
                  />
                </Svg>
              </View>
              
              {/* Title */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>Connection Spark</Text>
                <Text style={styles.subtitle}>Combat loneliness by reaching out to someone who gives you energy.</Text>
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

