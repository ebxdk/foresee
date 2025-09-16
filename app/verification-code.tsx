import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

import VerificationCodeScreen from '../components/VerificationCodeScreen';

export default function VerificationCodePage() {
  const router = useRouter();

  const handleCodeContinue = (code: string) => {
    console.log('Code continue with:', code);
    router.push('/question-1');
  };

  const handleBackFromCode = () => {
    console.log('Back from verification code');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <VerificationCodeScreen onContinue={handleCodeContinue} onBack={handleBackFromCode} />
    </SafeAreaView>
  );
} 