import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingComplete');
        setOnboardingComplete(value === 'true');
      } catch (e) {
        setOnboardingComplete(false);
      }
    };
    checkOnboarding();
  }, []);

  if (onboardingComplete === null) {
    return null; // or a loading spinner
  }

  return onboardingComplete ? <Redirect href="/(tabs)" /> : <Redirect href="/login-signup" />;
} 