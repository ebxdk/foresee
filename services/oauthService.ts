import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { getOAuthConfig, OAuthConfig } from '../config/oauth';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType: string;
  expiresIn?: number;
  scope?: string;
}

interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

class OAuthService {
  private static instance: OAuthService;
  
  private constructor() {}
  
  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  /**
   * Initiates OAuth flow for a given app
   */
  async authenticate(appId: string): Promise<{ success: boolean; userInfo?: UserInfo; error?: string }> {
    try {
      const config = getOAuthConfig(appId);
      if (!config) {
        return { success: false, error: `OAuth configuration not found for ${appId}` };
      }

      // DEBUG: Log the redirect URI being used
      console.log(`🔍 DEBUG: OAuth config for ${appId}:`);
      console.log(`📍 Redirect URI: ${config.redirectUri}`);
      console.log(`🔑 Client ID: ${config.clientId}`);

      // Handle special cases
      if (appId === 'apple-health') {
        return this.authenticateAppleHealth();
      }

      // For web environment, use WebBrowser for Google services
      if ((appId === 'gcal' || appId === 'meet' || appId === 'google-fit') && Platform.OS === 'web') {
        return this.authenticateWithWebBrowser(appId, config);
      }

      // For mobile, use AuthSession for all services (including Google)
      // Generate PKCE parameters for security
      const { codeChallenge, codeVerifier } = await this.generatePKCE();

      // Create auth request
      const authRequest = new AuthSession.AuthRequest({
        clientId: config.clientId,
        scopes: config.scopes,
        redirectUri: config.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        extraParams: {
          ...config.additionalParams,
        },
      });

      // Start auth session
      const result = await authRequest.promptAsync({
        authorizationEndpoint: config.authorizationEndpoint,
      });

      if (result.type === 'success' && result.params.code) {
        // Exchange code for tokens
        const tokenResponse = await this.exchangeCodeForTokens(
          result.params.code,
          config,
          codeVerifier
        );

        if (tokenResponse) {
          // Store tokens securely
          await this.storeTokens(appId, tokenResponse);

          // Get user info if available
          const userInfo = await this.getUserInfo(appId, tokenResponse.accessToken);

          // Store connection status
          await this.setConnectionStatus(appId, true, userInfo);

          return { success: true, userInfo };
        }
      }

      return { success: false, error: 'Authentication was cancelled or failed' };
    } catch (error) {
      console.error(`OAuth error for ${appId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Authenticate Google services using WebBrowser for proper redirect handling
   */
  private async authenticateWithWebBrowser(appId: string, config: OAuthConfig): Promise<{ success: boolean; userInfo?: UserInfo; error?: string }> {
    try {
      // Generate PKCE parameters for security
      const { codeChallenge, codeVerifier } = await this.generatePKCE();

      // Build the authorization URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scopes.join(' '),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        ...config.additionalParams,
      });

      const authUrl = `${config.authorizationEndpoint}?${params.toString()}`;
      console.log('🌐 Opening auth URL:', authUrl);

      // Open the auth session with WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        config.redirectUri,
        {
          showInRecents: false,
        }
      );

      console.log('🔄 WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        // Extract the authorization code from the redirect URL
        const urlParams = new URL(result.url).searchParams;
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          return { success: false, error: `OAuth error: ${error}` };
        }

        if (code) {
          // Exchange code for tokens
          const tokenResponse = await this.exchangeCodeForTokens(
            code,
            config,
            codeVerifier
          );

          if (tokenResponse) {
            // Store tokens securely
            await this.storeTokens(appId, tokenResponse);

            // Get user info if available
            const userInfo = await this.getUserInfo(appId, tokenResponse.accessToken);

            // Store connection status
            await this.setConnectionStatus(appId, true, userInfo);

            return { success: true, userInfo };
          }
        }
      }

      return { success: false, error: 'Authentication was cancelled or failed' };
    } catch (error) {
      console.error(`WebBrowser OAuth error for ${appId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(
    code: string,
    config: OAuthConfig,
    codeVerifier: string
  ): Promise<TokenResponse | null> {
    try {
      const tokenRequestParams = {
        grant_type: 'authorization_code',
        client_id: config.clientId,
        code,
        redirect_uri: config.redirectUri,
        code_verifier: codeVerifier,
      };

      // Add client secret if provided (some APIs require it)
      if (config.clientSecret) {
        (tokenRequestParams as any).client_secret = config.clientSecret;
      }

      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: Object.entries(tokenRequestParams)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&'),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed:', errorText);
        return null;
      }

      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
        tokenType: data.token_type || 'Bearer',
        expiresIn: data.expires_in,
        scope: data.scope,
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return null;
    }
  }

  /**
   * Get user information from the API
   */
  private async getUserInfo(appId: string, accessToken: string): Promise<UserInfo | undefined> {
    try {
      const config = getOAuthConfig(appId);
      if (!config?.userInfoEndpoint) {
        return undefined;
      }

      const response = await fetch(config.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return undefined;
      }

      const data = await response.json();
      
      // Normalize user info based on the service
      return this.normalizeUserInfo(appId, data);
    } catch (error) {
      console.error(`Error getting user info for ${appId}:`, error);
      return undefined;
    }
  }

  /**
   * Normalize user info from different services
   */
  private normalizeUserInfo(appId: string, data: any): UserInfo {
    switch (appId) {
      case 'gcal':
      case 'meet':
      case 'google-fit':
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        };
      
      case 'outlook':
      case 'teams':
        return {
          id: data.id,
          email: data.mail || data.userPrincipalName,
          name: data.displayName,
          picture: data.photo,
        };
      
      case 'slack':
        return {
          id: data.user?.id || data.id,
          email: data.user?.email || data.email,
          name: data.user?.name || data.name,
          picture: data.user?.image_24 || data.image_24,
        };
      
      case 'asana':
        return {
          id: data.data?.gid || data.gid,
          email: data.data?.email || data.email,
          name: data.data?.name || data.name,
          picture: data.data?.photo?.image_128x128 || data.photo?.image_128x128,
        };
      
      default:
        return {
          id: data.id || data.user_id || data.userId,
          email: data.email,
          name: data.name || data.display_name || data.displayName,
          picture: data.picture || data.avatar || data.image,
        };
    }
  }

  /**
   * Handle Apple Health authentication (uses HealthKit)
   */
  private async authenticateAppleHealth(): Promise<{ success: boolean; error?: string }> {
    // Apple Health requires native HealthKit integration
    // This is a placeholder - you'll need to implement HealthKit integration
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Health is only available on iOS' };
    }
    
    // For now, simulate success
    await this.setConnectionStatus('apple-health', true, {
      id: 'apple-health',
      name: 'Apple Health',
    });
    
    return { success: true };
  }

  /**
   * Generate PKCE challenge and verifier for security
   */
  private async generatePKCE(): Promise<{ codeChallenge: string; codeVerifier: string }> {
    // Generate a random code verifier
    const codeVerifier = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
    
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    ).then(hash => hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''));
    
    return { codeChallenge, codeVerifier };
  }

  /**
   * Store tokens securely
   */
  private async storeTokens(appId: string, tokens: TokenResponse): Promise<void> {
    try {
      const tokenData = {
        ...tokens,
        expiresAt: tokens.expiresIn ? Date.now() + (tokens.expiresIn * 1000) : undefined,
      };
      
      await SecureStore.setItemAsync(`oauth_tokens_${appId}`, JSON.stringify(tokenData));
    } catch (error) {
      console.error(`Error storing tokens for ${appId}:`, error);
    }
  }

  /**
   * Get stored tokens
   */
  async getTokens(appId: string): Promise<TokenResponse | null> {
    try {
      const tokenString = await SecureStore.getItemAsync(`oauth_tokens_${appId}`);
      if (!tokenString) {
        return null;
      }
      
      const tokens = JSON.parse(tokenString);
      
      // Check if token is expired
      if (tokens.expiresAt && Date.now() > tokens.expiresAt) {
        // Try to refresh token if available
        if (tokens.refreshToken) {
          return this.refreshTokens(appId, tokens.refreshToken);
        }
        // Token expired and no refresh token
        return null;
      }
      
      return tokens;
    } catch (error) {
      console.error(`Error getting tokens for ${appId}:`, error);
      return null;
    }
  }

  /**
   * Refresh expired tokens
   */
  private async refreshTokens(appId: string, refreshToken: string): Promise<TokenResponse | null> {
    try {
      const config = getOAuthConfig(appId);
      if (!config) {
        return null;
      }

      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${config.clientId}`,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const newTokens: TokenResponse = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        tokenType: data.token_type || 'Bearer',
        expiresIn: data.expires_in,
      };

      await this.storeTokens(appId, newTokens);
      return newTokens;
    } catch (error) {
      console.error(`Error refreshing tokens for ${appId}:`, error);
      return null;
    }
  }

  /**
   * Set connection status
   */
  async setConnectionStatus(appId: string, connected: boolean, userInfo?: UserInfo): Promise<void> {
    try {
      const statusData = {
        connected,
        userInfo,
        connectedAt: connected ? new Date().toISOString() : null,
      };
      
      await SecureStore.setItemAsync(`connection_status_${appId}`, JSON.stringify(statusData));
    } catch (error) {
      console.error(`Error setting connection status for ${appId}:`, error);
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(appId: string): Promise<{ connected: boolean; userInfo?: UserInfo }> {
    try {
      const statusString = await SecureStore.getItemAsync(`connection_status_${appId}`);
      if (!statusString) {
        return { connected: false };
      }
      
      const status = JSON.parse(statusString);
      return {
        connected: status.connected || false,
        userInfo: status.userInfo,
      };
    } catch (error) {
      console.error(`Error getting connection status for ${appId}:`, error);
      return { connected: false };
    }
  }

  /**
   * Disconnect an app
   */
  async disconnect(appId: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(`oauth_tokens_${appId}`);
      await SecureStore.deleteItemAsync(`connection_status_${appId}`);
    } catch (error) {
      console.error(`Error disconnecting ${appId}:`, error);
    }
  }

  /**
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(appId: string, url: string, options: RequestInit = {}): Promise<Response | null> {
    try {
      const tokens = await this.getTokens(appId);
      if (!tokens) {
        throw new Error(`No valid tokens found for ${appId}`);
      }

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `${tokens.tokenType} ${tokens.accessToken}`,
        },
      });
    } catch (error) {
      console.error(`Error making authenticated request for ${appId}:`, error);
      return null;
    }
  }
}

export default OAuthService.getInstance(); 