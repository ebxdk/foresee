import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StatusBar } from 'react-native';

import VerificationCodeScreen from '../components/VerificationCodeScreen';
import { ApiService } from '../services/ApiService';

export default function VerificationCodePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeContinue = async (code: string) => {
    console.log('Code continue with:', code);
    setIsLoading(true);

    try {
      // Get stored signup data
      const signupData = await AsyncStorage.getItem('auth_signup_data');
      if (!signupData) {
        Alert.alert('Error', 'Session expired. Please start over.');
        router.push('/get-started');
        return;
      }

      const userData = JSON.parse(signupData);
      if (!userData.email) {
        Alert.alert('Error', 'Email not found. Please go back and enter your email.');
        router.back();
        return;
      }

      // Validate verification code
      const result = await ApiService.verifyCode(userData.email, code);
      
      if (result.success) {
        // Mark verification as complete
        const updatedData = { ...userData, emailVerified: true };
        await AsyncStorage.setItem('auth_signup_data', JSON.stringify(updatedData));
        
        // Navigate to password setup
        router.push('/password-setup');
      } else {
        Alert.alert('Invalid Code', result.message);
      }
    } catch (error) {
      console.error('Code verification error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromCode = () => {
    console.log('Back from verification code');
    router.back();
  };

  const handleResendCode = async () => {
    try {
      const signupData = await AsyncStorage.getItem('auth_signup_data');
      if (!signupData) {
        Alert.alert('Error', 'Session expired. Please start over.');
        return;
      }

      const userData = JSON.parse(signupData);
      if (!userData.email) {
        Alert.alert('Error', 'Email not found.');
        return;
      }

      const result = await ApiService.sendVerificationCode(userData.email, userData.name);
      if (result.success) {
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Resend code error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <VerificationCodeScreen 
        onContinue={handleCodeContinue} 
        onBack={handleBackFromCode}
        onResendCode={handleResendCode}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
} 