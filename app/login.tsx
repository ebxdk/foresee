import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StatusBar } from 'react-native';

import LoginScreen from '../components/LoginScreen';
import { ApiService } from '../services/ApiService';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginContinue = async (email: string, password: string) => {
    console.log('Login attempt with:', email);
    setIsLoading(true);

    try {
      // Call login API
      const result = await ApiService.login(email, password);
      
      if (result.success) {
        // Token is automatically stored by ApiService
        if (result.user) {
          await AsyncStorage.setItem('current_user', JSON.stringify(result.user));
        }
        
        Alert.alert(
          'Welcome back!', 
          'You have successfully logged in.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to home/dashboard - replace with your main app screen
                router.replace('/(tabs)/home');
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromLogin = () => {
    console.log('Back from login');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LoginScreen 
        onContinue={handleLoginContinue} 
        onBack={handleBackFromLogin}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}