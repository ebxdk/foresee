import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getRedirectUri, getValidAccessToken, signInWithSpotify } from '../services/spotifyAuth';

export default function SpotifyDiagnostics() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [canOpenSpotify, setCanOpenSpotify] = useState<boolean | null>(null);
  const [remoteAvailable, setRemoteAvailable] = useState<string>('unknown');

  const append = useCallback((line: string) => setLogs(prev => [line, ...prev].slice(0, 100)), []);

  const redirectUri = useMemo(() => getRedirectUri(), []);

  const handleCheckRedirect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    append(`Redirect URI: ${redirectUri}`);
    append(`Platform: ${Platform.OS}, Expo Go likely: ${Platform.select({ ios: true, android: true, default: false })}`);
  };

  const handleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    append('Starting Spotify OAuth…');
    try {
      const res = await signInWithSpotify([
        'app-remote-control',
        'user-modify-playback-state',
        'user-read-playback-state',
        'user-read-email',
        'user-read-private',
      ]);
      append(`OAuth result: ${res ? 'success' : 'cancelled/failure'}`);
      const token = await getValidAccessToken();
      setAccessToken(token);
      append(`Access token present: ${!!token}`);
    } catch (e: any) {
      append(`OAuth error: ${e?.message || String(e)}`);
    }
  };

  const handleCheckSpotifyInstalled = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const can = await Linking.canOpenURL('spotify:');
      setCanOpenSpotify(can);
      append(`Spotify URL scheme available: ${can}`);
    } catch (e: any) {
      append(`canOpenURL error: ${e?.message || String(e)}`);
    }
  };

  const handleDeepLinkTest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL('spotify:track:3ZCTVFBt2Brf31RLEnCkWJ');
      append('Deep link attempted to open Spotify track.');
    } catch (e: any) {
      append(`Deep link error: ${e?.message || String(e)}`);
    }
  };

  const handleCheckRemoteAvailability = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    append('Checking App Remote availability…');
    try {
      const mod = await import('../services/SpotifyRemote').catch(() => null);
      if (!mod) {
        setRemoteAvailable('module import failed');
        append('Remote module import failed (expected in Expo Go).');
        return;
      }
      // Try a no-op path that may fail gracefully in Expo Go
      const ok = await mod.spotifyRemote.ensureConnected();
      setRemoteAvailable(ok ? 'connected' : 'not connected');
      append(`ensureConnected returned: ${ok}`);
    } catch (e: any) {
      setRemoteAvailable('error');
      append(`Remote check error (likely Expo Go without native module): ${e?.message || String(e)}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>        
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backTxt}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Spotify Diagnostics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Redirect URI</Text>
        <Text style={styles.value}>{redirectUri}</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={handleCheckRedirect}><Text style={styles.buttonText}>Check Redirect</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleAuth}><Text style={styles.buttonText}>Auth</Text></TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={handleCheckSpotifyInstalled}><Text style={styles.buttonText}>Check Spotify App</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleDeepLinkTest}><Text style={styles.buttonText}>Open Track via URL</Text></TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={handleCheckRemoteAvailability}><Text style={styles.buttonText}>Check App Remote</Text></TouchableOpacity>
        </View>

        <Text style={styles.label}>Access Token</Text>
        <Text style={styles.value}>{accessToken ? `${accessToken.slice(0, 16)}…` : 'none'}</Text>

        <Text style={styles.label}>Spotify Installed</Text>
        <Text style={styles.value}>{canOpenSpotify === null ? 'unknown' : String(canOpenSpotify)}</Text>

        <Text style={styles.label}>Remote Availability</Text>
        <Text style={styles.value}>{remoteAvailable}</Text>

        <Text style={styles.label}>Logs</Text>
        {logs.map((l, i) => (
          <Text key={i} style={styles.log}>{l}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  backTxt: { color: '#fff', fontSize: 18 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { padding: 16, gap: 8 },
  label: { color: '#aaa', fontSize: 12, marginTop: 12 },
  value: { color: '#fff', fontSize: 14 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  button: { backgroundColor: '#1DB954', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  buttonText: { color: '#000', fontWeight: '700' },
  log: { color: '#ddd', fontSize: 12 }
});







