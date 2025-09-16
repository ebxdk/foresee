import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

import EmailInputScreen from '../components/EmailInputScreen';

export default function EmailInputPage() {
  const router = useRouter();

  const handleEmailContinue = (email: string) => {
    console.log('Email continue with:', email);
    router.push('/verification-code');
  };

  const handleBackFromEmail = () => {
    console.log('Back from email input');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <EmailInputScreen onContinue={handleEmailContinue} onBack={handleBackFromEmail} />
    </SafeAreaView>
  );
} 