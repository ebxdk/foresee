import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { useAuthBootstrap } from '../hooks/useAuthBootstrap';

export default function Index() {
  const { authState, isLoading } = useAuthBootstrap();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (authState === 'authenticated') {
        // User is logged in, go to home
        router.replace('/(tabs)/home');
      } else {
        // User is not logged in, go to login
        router.replace('/get-started');
      }
    }
  }, [authState, isLoading, router]);

  // Show loading screen while checking auth
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000000" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});