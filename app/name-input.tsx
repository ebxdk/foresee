import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

import NameInputScreen from '../components/NameInputScreen';

export default function NameInputPage() {
  const router = useRouter();

  const handleNameContinue = async (name: string) => {
    console.log('Name continue with:', name);
    
    try {
      // Store name for the signup flow
      const signupData = { name };
      await AsyncStorage.setItem('auth_signup_data', JSON.stringify(signupData));
      
      router.push('/email-input');
    } catch (error) {
      console.error('Error storing name:', error);
      // Continue anyway, name will be asked again if needed
      router.push('/email-input');
    }
  };

  const handleBackFromName = () => {
    console.log('Back from name input');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NameInputScreen onContinue={handleNameContinue} onBack={handleBackFromName} />
    </SafeAreaView>
  );
} 