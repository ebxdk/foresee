import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { useAuthBootstrap } from '../hooks/useAuthBootstrap';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Component that protects routes by checking authentication status
 * Redirects to login if user is not authenticated
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { authState, isLoading } = useAuthBootstrap();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && authState === 'unauthenticated') {
      // Redirect to get-started (login) screen
      router.replace('/get-started');
    }
  }, [authState, isLoading, router]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (authState === 'unauthenticated') {
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
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

