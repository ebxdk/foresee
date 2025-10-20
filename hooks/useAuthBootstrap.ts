import { useEffect, useState } from 'react';
import { ApiService } from '../services/ApiService';

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthBootstrapResult {
  authState: AuthState;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook that handles authentication state on app startup
 * Checks for stored token and validates it with the server
 */
export function useAuthBootstrap(): AuthBootstrapResult {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated (this includes token validation)
        const isAuthenticated = await ApiService.isAuthenticated();
        
        if (isAuthenticated) {
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      } catch (error) {
        console.error('Auth bootstrap error:', error);
        setError(error instanceof Error ? error.message : 'Authentication check failed');
        setAuthState('unauthenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return {
    authState,
    isLoading,
    error
  };
}

