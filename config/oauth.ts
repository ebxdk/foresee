import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

// OAuth configuration for connected apps
export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint?: string;
  additionalParams?: Record<string, string>;
}

// Get the proper redirect URI for the current environment
const getRedirectUri = (scheme?: string) => {
  return makeRedirectUri({
    scheme: scheme || 'myapp',
    path: 'oauth',
  });
};

// Get redirect URI for Google services (handles both web and mobile)
const getGoogleRedirectUri = () => {
  // For web/tunnel environment, use the tunnel URL
  if (Platform.OS === 'web') {
    return 'https://vfbixjq-anonymous-8081.exp.direct';
  }
  
  // For mobile (Expo Go), use makeRedirectUri to get the correct format
  return makeRedirectUri();
};

// App-specific OAuth configurations
export const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  'gcal': {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    redirectUri: getGoogleRedirectUri(),
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
    additionalParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  },
  
  'outlook': {
    clientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID',
    redirectUri: getRedirectUri(),
    scopes: ['https://graph.microsoft.com/calendars.read', 'offline_access'],
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoEndpoint: 'https://graph.microsoft.com/v1.0/me'
  },
  
  'slack': {
    clientId: process.env.EXPO_PUBLIC_SLACK_CLIENT_ID || 'YOUR_SLACK_CLIENT_ID',
    clientSecret: process.env.EXPO_PUBLIC_SLACK_CLIENT_SECRET || 'YOUR_SLACK_CLIENT_SECRET',
    redirectUri: getRedirectUri(),
    scopes: ['channels:read', 'users:read', 'chat:write'],
    authorizationEndpoint: 'https://slack.com/oauth/v2/authorize',
    tokenEndpoint: 'https://slack.com/api/oauth.v2.access'
  },
  
  'asana': {
    clientId: process.env.EXPO_PUBLIC_ASANA_CLIENT_ID || 'YOUR_ASANA_CLIENT_ID',
    redirectUri: getRedirectUri(),
    scopes: ['default'],
    authorizationEndpoint: 'https://app.asana.com/-/oauth_authorize',
    tokenEndpoint: 'https://app.asana.com/-/oauth_token',
    userInfoEndpoint: 'https://app.asana.com/api/1.0/users/me'
  },
  
  'clickup': {
    clientId: process.env.EXPO_PUBLIC_CLICKUP_CLIENT_ID || 'YOUR_CLICKUP_CLIENT_ID',
    clientSecret: process.env.EXPO_PUBLIC_CLICKUP_CLIENT_SECRET || 'YOUR_CLICKUP_CLIENT_SECRET',
    redirectUri: getRedirectUri(),
    scopes: ['task:read', 'team:read'],
    authorizationEndpoint: 'https://app.clickup.com/api/v2/oauth/authorize',
    tokenEndpoint: 'https://app.clickup.com/api/v2/oauth/token'
  },
  
  'zoom': {
    clientId: process.env.EXPO_PUBLIC_ZOOM_CLIENT_ID || 'YOUR_ZOOM_CLIENT_ID',
    clientSecret: process.env.EXPO_PUBLIC_ZOOM_CLIENT_SECRET || 'YOUR_ZOOM_CLIENT_SECRET',
    redirectUri: getRedirectUri(),
    scopes: ['meeting:read', 'user:read'],
    authorizationEndpoint: 'https://zoom.us/oauth/authorize',
    tokenEndpoint: 'https://zoom.us/oauth/token'
  },
  
  'teams': {
    clientId: process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID', // Same as Outlook
    redirectUri: getRedirectUri(),
    scopes: ['https://graph.microsoft.com/Team.ReadBasic.All', 'offline_access'],
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  }
};

// Health apps use different authorization methods
export const HEALTH_APP_CONFIGS = {
  'apple-health': {
    // Apple Health uses HealthKit - requires native implementation
    // Will be handled differently in the OAuth service
  },
  'google-fit': {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    redirectUri: getGoogleRedirectUri(),
    scopes: ['https://www.googleapis.com/auth/fitness.activity.read'],
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token'
  }
};

// Google Meet uses same config as Google Calendar with different scopes
export const getOAuthConfig = (appId: string): OAuthConfig | null => {
  if (appId === 'meet') {
    return {
      ...OAUTH_CONFIGS['gcal'],
      scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/meetings.space.readonly']
    };
  }
  
  if (appId === 'google-fit') {
    return HEALTH_APP_CONFIGS['google-fit'] as OAuthConfig;
  }
  
  return OAUTH_CONFIGS[appId] || null;
}; 