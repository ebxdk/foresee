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
    // Get API URL from environment or use current Replit domain
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
    if (apiUrl) return `${apiUrl}/api`;
    
    // Fallback to current Replit domain (development)
    const replitDomain = process.env.REPLIT_DEV_DOMAIN || 'localhost:3001';
    return `https://${replitDomain}/api`;
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
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

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
   * Clear authentication data
   */
  static async clearAuth(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
  }
}