// ApiService.ts - Client-side API service for secure authentication
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  user?: T;
  token?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export class ApiService {
  private static readonly API_BASE_URL = (() => {
    // Get API URL from environment variable
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (apiUrl) {
      console.log('Using environment API URL:', apiUrl);
      const trimmed = apiUrl.replace(/\/$/, '');
      return `${trimmed}/api`;
    }
    
    // Platform-specific URLs for development
    const Platform = require('react-native').Platform;
    let baseUrl: string;
    
    // Check if we're in Replit environment (for physical devices)
    const isReplit = process.env.REPLIT_DEV_DOMAIN || 
                    (typeof window !== 'undefined' && window.location?.hostname?.includes('replit'));
    
    if (isReplit && Platform.OS !== 'web') {
      // Physical device connecting to Replit workspace
      const replitDomain = process.env.REPLIT_DEV_DOMAIN || 'a987b2a1-17fd-4a79-9fb2-3bb3f204ffaf-00-1gm2gpt9m0dlh.spock.replit.dev';
      baseUrl = `https://${replitDomain}:8080`;
      console.log('🔗 Replit environment detected for physical device');
    } else if (Platform.OS === 'ios' && !Platform.isPad) {
      // Physical iPhone - connecting to Replit workspace (via Cursor SSH)
      const replitDomain = 'a987b2a1-17fd-4a79-9fb2-3bb3f204ffaf-00-1gm2gpt9m0dlh.spock.replit.dev';
      baseUrl = `https://${replitDomain}:8080`;
      console.log('📱 Physical iPhone - using Replit domain for API server on port 8080');
      console.log('🔗 Cursor is connected via SSH to Replit workspace');
    } else if (Platform.OS === 'ios') {
      // iOS Simulator uses 127.0.0.1 instead of localhost
      baseUrl = 'http://127.0.0.1:8080';
    } else if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      baseUrl = 'http://10.0.2.2:8080';
    } else {
      // Web or other platforms (fallback) - match server port
      baseUrl = 'http://localhost:8080';
    }
    
    const fullUrl = `${baseUrl.replace(/\/$/, '')}/api`;
    console.log(`Platform: ${Platform.OS}, Replit: ${isReplit}, Using API URL: ${fullUrl}`);
    return fullUrl;
  })();

  private static readonly TOKEN_KEY = 'auth_token';

  /**
   * Make authenticated API request
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      const base = this.API_BASE_URL.replace(/\/$/, '');
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const fullUrl = `${base}${path}`;
      
      console.log('Making API request to:', fullUrl);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      console.log('API response status:', response.status, response.statusText);

      // Check if response is JSON before parsing
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON (like HTML error page), get text for better error info
        const responseText = await response.text();
        console.error('Non-JSON response received:', responseText.substring(0, 200));
        return {
          success: false,
          message: `Server error (${response.status}): Received HTML instead of JSON. Check if server is running properly.`,
        };
      }

      if (!response.ok) {
        console.error('API error response:', data);
        
        // Handle authentication failures
        if (response.status === 401) {
          await this.clearAuth();
          return {
            success: false,
            message: 'Your session has expired. Please log in again.',
          };
        }
        
        return {
          success: false,
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      console.log('API success response:', data);
      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  /**
   * Send verification code to email
   */
  static async sendVerificationCode(email: string, name?: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  /**
   * Verify verification code
   */
  static async verifyCode(email: string, code: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  /**
   * Create user account
   */
  static async signup(signupData: SignupData): Promise<ApiResponse> {
    const response = await this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData),
    });

    // Store token if signup successful
    if (response.success && response.token) {
      await AsyncStorage.setItem(this.TOKEN_KEY, response.token);
    }

    return response;
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token if login successful
    if (response.success && response.token) {
      await AsyncStorage.setItem(this.TOKEN_KEY, response.token);
    }

    return response;
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<ApiResponse> {
    return this.makeRequest('/auth/me');
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse> {
    const response = await this.makeRequest('/auth/logout', {
      method: 'POST',
    });

    // Clear stored token
    await AsyncStorage.removeItem(this.TOKEN_KEY);

    return response;
  }

  /**
   * Get stored auth token
   */
  static async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    const response = await this.getCurrentUser();
    return response.success;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(name: string): Promise<ApiResponse> {
    return this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Clear authentication data
   */
  static async clearAuth(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Health check - verify API server is reachable
   */
  static async healthCheck(): Promise<ApiResponse> {
    try {
      const healthUrl = this.API_BASE_URL.replace('/api', '/health');
      console.log('Checking health endpoint:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Health check failed: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('Health check successful:', data);
      
      return {
        success: true,
        message: 'API server is healthy',
        ...data
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        message: 'Health check failed - server may be unreachable',
      };
    }
  }
}