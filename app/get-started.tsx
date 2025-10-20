import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import AuthCard from '../components/AuthCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ForeseeLoginScreen() {
  const router = useRouter();
  const [isAuthCardVisible, setAuthCardVisible] = useState(false);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Opening auth card');
    setAuthCardVisible(true);
  };

  const handleCloseAuthCard = () => {
    console.log('Closing auth card');
    setAuthCardVisible(false);
  };

  const handleSignupClick = () => {
    console.log('Signup clicked - closing auth card and navigating to name input');
    // First close the auth card
    setAuthCardVisible(false);
    // Then navigate to the name input page
    setTimeout(() => {
      console.log('Navigating to name input page');
      router.push('/name-input');
    }, 400); // Wait for auth card slide down animation
  };


  console.log('Render - Auth card:', isAuthCardVisible);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />


      {/* Main Content */}
      <View style={styles.content}>
        {/* Brand and Message */}
        <View style={styles.messageSection}>
          <Text style={styles.brandName}>Foresee.</Text>
          <Text style={styles.heroMessage}>
            Track your wellbeing{'\n'}
            in real-time and build{'\n'}
            healthy habits to{'\n'}
            prevent burnout.
          </Text>
        </View>

        {/* Bottom Section with Next Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Auth Card */}
      <AuthCard 
        visible={isAuthCardVisible} 
        onClose={handleCloseAuthCard} 
        onSignupClick={handleSignupClick}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: 60,
  },
  messageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 40,
  },
  brandName: {
    fontSize: 56,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  heroMessage: {
    fontSize: 36,
    fontWeight: '400',
    color: '#8E8E93',
    lineHeight: 44,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
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
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 