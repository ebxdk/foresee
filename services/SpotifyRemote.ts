import { getValidAccessToken } from './spotifyAuth';

type PlayerState = any;
type PlaybackOptions = any;

let RNSpotifyRemote: any | null = null;

function getRNSpotifyRemote(): any | null {
  if (RNSpotifyRemote) return RNSpotifyRemote;
  try {
    // Optional require so Metro in Expo Go doesn't fail at bundle-time
    // This will only succeed in a Dev Client / native build where the module exists
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RNSpotifyRemote = require('react-native-spotify-remote');
    return RNSpotifyRemote;
  } catch {
    return null;
  }
}

class SpotifyRemoteService {
  private isConnected: boolean = false;

  async ensureConnected(): Promise<boolean> {
    if (this.isConnected) return true;
    const SpotifyRemote = getRNSpotifyRemote();
    if (!SpotifyRemote) return false;
    const accessToken = await getValidAccessToken();
    if (!accessToken) return false;
    try {
      await SpotifyRemote.connect(accessToken);
      this.isConnected = true;
      return true;
    } catch (e) {
      console.warn('SpotifyRemote connect failed', e);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    const SpotifyRemote = getRNSpotifyRemote();
    if (!SpotifyRemote) return;
    try {
      await SpotifyRemote.disconnect();
    } finally {
      this.isConnected = false;
    }
  }

  async playUriAt(spotifyUri: string, positionMs: number = 0, options?: PlaybackOptions): Promise<boolean> {
    const ok = await this.ensureConnected();
    if (!ok) return false;
    const SpotifyRemote = getRNSpotifyRemote();
    if (!SpotifyRemote) return false;
    await SpotifyRemote.playUri(spotifyUri, positionMs, 0, options);
    return true;
  }

  async pause(): Promise<void> {
    if (!this.isConnected) return;
    const SpotifyRemote = getRNSpotifyRemote();
    if (!SpotifyRemote) return;
    await SpotifyRemote.pause();
  }

  async resume(): Promise<void> {
    if (!this.isConnected) return;
    const SpotifyRemote = getRNSpotifyRemote();
    if (!SpotifyRemote) return;
    await SpotifyRemote.resume();
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.isConnected) return;
    const SpotifyRemote = getRNSpotifyRemote();
    if (!SpotifyRemote) return;
    await SpotifyRemote.seek(positionMs);
  }

  async getPlayerState(): Promise<PlayerState | null> {
    if (!this.isConnected) return null;
    try {
      const SpotifyRemote = getRNSpotifyRemote();
      if (!SpotifyRemote) return null;
      const state = await SpotifyRemote.getPlayerState();
      return state;
    } catch (e) {
      return null;
    }
  }
}

export const spotifyRemote = new SpotifyRemoteService();


