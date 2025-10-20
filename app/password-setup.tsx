import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PasswordSetupScreen from '../components/PasswordSetupScreen';
import { ApiService, type SignupData } from '../services/ApiService';

export default function PasswordSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordContinue = async (password: string) => {
    console.log('Password setup complete');
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
      
      // Validate required data
      if (!userData.name || !userData.email || !userData.emailVerified) {
        Alert.alert('Error', 'Missing required information. Please start over.');
        router.push('/get-started');
        return;
      }

      // Create user account
      const newUserData: SignupData = {
        name: userData.name,
        email: userData.email,
        password: password,
      };

      const result = await ApiService.signup(newUserData);
      
      if (result.success) {
        // Token is automatically stored by ApiService
        if (result.user) {
          await AsyncStorage.setItem('current_user', JSON.stringify(result.user));
        }
        
        // Clear temporary signup data
        await AsyncStorage.removeItem('auth_signup_data');
        
        Alert.alert(
          'Welcome to Foresee!', 
          'Your account has been created successfully. Let\'s get you set up!',
          [
            {
              text: 'Continue',
              onPress: () => router.push('/question-1')
            }
          ]
        );
      } else {
        // Check if user already has an account
        if (result.message === 'ALREADY_REGISTERED') {
          // Clear signup data since they should login instead
          await AsyncStorage.removeItem('auth_signup_data');
          
          Alert.alert(
            'Account Already Exists',
            result.userMessage || 'Looks like you already have an account! Please log in instead.',
            [
              {
                text: 'Go to Login',
                onPress: () => router.push('/login'),
                style: 'default'
              }
            ]
          );
        } else {
          Alert.alert('Account Creation Failed', result.message);
        }
      }
    } catch (error) {
      console.error('Account creation error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromPassword = () => {
    console.log('Back from password setup');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <PasswordSetupScreen 
        onContinue={handlePasswordContinue} 
        onBack={handleBackFromPassword}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}
