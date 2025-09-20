import { useRouter } from 'expo-router';
import { SafeAreaView, StatusBar } from 'react-native';

import PasswordSetupScreen from '../components/PasswordSetupScreen';

export default function PasswordSetupPage() {
  const router = useRouter();

  const handlePasswordContinue = (password: string) => {
    console.log('Password setup complete');
    router.push('/question-1');
  };

  const handleBackFromPassword = () => {
    console.log('Back from password setup');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <PasswordSetupScreen onContinue={handlePasswordContinue} onBack={handleBackFromPassword} />
    </SafeAreaView>
  );
}
