import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type SpotifyTokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  expires_in: number; // seconds
  refresh_token?: string;
};

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const SPOTIFY_CLIENT_ID = (Constants?.expoConfig?.extra as any)?.spotify?.clientId as string;
const REDIRECT_PATH = ((Constants?.expoConfig?.extra as any)?.spotify?.redirectPath as string) || 'spotify-auth';

const SECURE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expiresAt: 'spotify_expires_at', // epoch ms
};

export function getRedirectUri(): string {
  const scheme = (Constants.expoConfig as any)?.scheme ?? 'myapp';
  const useProxy = Constants.appOwnership === 'expo' || Platform.OS === 'web';
  return AuthSession.makeRedirectUri({
    scheme,
    path: REDIRECT_PATH,
    useProxy,
  });
}

export async function signInWithSpotify(scopes: string[]): Promise<SpotifyTokenResponse | null> {
  if (!SPOTIFY_CLIENT_ID) throw new Error('Missing Spotify client ID in app.json extra.spotify.clientId');

  const redirectUri = getRedirectUri();
  const isProxy = Constants.appOwnership === 'expo' || Platform.OS === 'web';

  const request = new AuthSession.AuthRequest({
    clientId: SPOTIFY_CLIENT_ID,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
    redirectUri,
    scopes,
  });

  await request.makeAuthUrlAsync(discovery);

  // Let AuthSession manage the proxy flow (adds returnUrl when needed)
  const result = await request.promptAsync(discovery, {
    useProxy: isProxy,
    // iOS: avoid cached cookies/popups getting stuck
    preferEphemeralSession: Platform.OS === 'ios',
  });
  if (result.type !== 'success' || !result.params.code) {
    return null;
  }

  const tokenRes = await AuthSession.exchangeCodeAsync(
    {
      code: result.params.code,
      clientId: SPOTIFY_CLIENT_ID,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier! },
    },
    discovery
  );

  // Normalize token field names (expo-auth-session returns camelCase)
  const raw: any = tokenRes as any;
  const accessToken = raw.access_token ?? raw.accessToken ?? null;
  const refreshToken = raw.refresh_token ?? raw.refreshToken ?? null;
  const expiresInSec: number = (raw.expires_in ?? raw.expiresIn ?? 3600) as number;

  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Spotify auth failed: missing access token');
  }

  const expiresAt = Date.now() + expiresInSec * 1000 - 30_000; // 30s early

  await SecureStore.setItemAsync(SECURE_KEYS.accessToken, accessToken);
  if (typeof refreshToken === 'string' && refreshToken.length > 0) {
    await SecureStore.setItemAsync(SECURE_KEYS.refreshToken, refreshToken);
  }
  await SecureStore.setItemAsync(SECURE_KEYS.expiresAt, String(expiresAt));

  return {
    access_token: accessToken,
    token_type: (raw.token_type ?? raw.tokenType ?? 'Bearer') as 'Bearer',
    scope: (raw.scope ?? '') as string,
    expires_in: expiresInSec,
    refresh_token: refreshToken ?? undefined,
  } as SpotifyTokenResponse;
}

export async function getValidAccessToken(): Promise<string | null> {
  const access = await SecureStore.getItemAsync(SECURE_KEYS.accessToken);
  const expiresAtStr = await SecureStore.getItemAsync(SECURE_KEYS.expiresAt);
  const refresh = await SecureStore.getItemAsync(SECURE_KEYS.refreshToken);

  const expiresAt = expiresAtStr ? Number(expiresAtStr) : 0;
  if (access && Date.now() < expiresAt) return access;
  if (!refresh) return null;

  // Refresh token via backend is recommended. For prototype, do direct token exchange.
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: SPOTIFY_CLIENT_ID,
  });

  const res = await fetch(discovery.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) return null;

  const json = (await res.json()) as any;
  const newAccess = (json.access_token ?? json.accessToken) as string;
  const newRefresh = (json.refresh_token ?? json.refreshToken) as string | undefined;
  const newExpiresAt = Date.now() + ((json.expires_in ?? json.expiresIn ?? 3600) as number) * 1000 - 30_000;
  if (typeof newAccess === 'string') {
    await SecureStore.setItemAsync(SECURE_KEYS.accessToken, newAccess);
  }
  await SecureStore.setItemAsync(SECURE_KEYS.expiresAt, String(newExpiresAt));
  if (typeof newRefresh === 'string' && newRefresh.length > 0) {
    await SecureStore.setItemAsync(SECURE_KEYS.refreshToken, newRefresh);
  }
  return newAccess;
}

export async function signOutSpotify(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_KEYS.accessToken);
  await SecureStore.deleteItemAsync(SECURE_KEYS.refreshToken);
  await SecureStore.deleteItemAsync(SECURE_KEYS.expiresAt);
}






