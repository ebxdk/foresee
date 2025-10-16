import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmailInputScreen from '../components/EmailInputScreen';
import { ApiService } from '../services/ApiService';

export default function EmailInputPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailContinue = async (email: string) => {
    console.log('Email continue with:', email);
    setIsLoading(true);

    try {
      // Get the stored name from previous screen
      const signupData = await AsyncStorage.getItem('auth_signup_data');
      const userData = signupData ? JSON.parse(signupData) : {};
      
      // Generate and send verification code
      const result = await ApiService.sendVerificationCode(email, userData.name);
      
      if (result.success) {
        // Store email with signup data
        const updatedData = { ...userData, email };
        await AsyncStorage.setItem('auth_signup_data', JSON.stringify(updatedData));
        
        // Navigate to verification screen
        router.push('/verification-code');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromEmail = () => {
    console.log('Back from email input');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <EmailInputScreen 
        onContinue={handleEmailContinue} 
        onBack={handleBackFromEmail}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
} 