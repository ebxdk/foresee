import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

import NameInputScreen from '../components/NameInputScreen';

export default function NameInputPage() {
  const router = useRouter();

  const handleNameContinue = (name: string) => {
    console.log('Name continue with:', name);
    router.push('/email-input');
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