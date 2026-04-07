/**
 * Spotify Web API client for direct playback control.
 * Handles OAuth PKCE flow and stores tokens in localStorage.
 */

const SPOTIFY_STORAGE_KEY = 'jarvis_spotify_tokens';
const SPOTIFY_SCOPES = [
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing',
  'streaming',
].join(' ');

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function getSupabaseClient() {
  const { supabase } = await import('@/integrations/supabase/client');
  return supabase;
}

function getStoredTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(SPOTIFY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeTokens(tokens: SpotifyTokens) {
  localStorage.setItem(SPOTIFY_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearSpotifyTokens() {
  localStorage.removeItem(SPOTIFY_STORAGE_KEY);
}

export function isSpotifyConnected(): boolean {
  const tokens = getStoredTokens();
  return tokens !== null && !!tokens.refresh_token;
}

/** Get a valid access token, refreshing if needed */
async function getAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  // If token is still valid (with 60s buffer), use it
  if (Date.now() < tokens.expires_at - 60_000) {
    return tokens.access_token;
  }

  // Refresh the token
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('spotify-auth', {
      body: { action: 'refresh', refresh_token: tokens.refresh_token },
    });

    if (error || !data?.access_token) {
      console.warn('[Spotify] Token refresh failed:', error);
      clearSpotifyTokens();
      return null;
    }

    const newTokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokens.refresh_token,
      expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    };
    storeTokens(newTokens);
    return newTokens.access_token;
  } catch (e) {
    console.warn('[Spotify] Refresh error:', e);
    clearSpotifyTokens();
    return null;
  }
}

/** Exchange an authorization code for tokens */
export async function exchangeSpotifyCode(code: string, redirectUri: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('spotify-auth', {
      body: { action: 'exchange', code, redirect_uri: redirectUri },
    });

    if (error || !data?.access_token) {
      console.error('[Spotify] Code exchange failed:', error);
      return false;
    }

    const tokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    };
    storeTokens(tokens);
    return true;
  } catch (e) {
    console.error('[Spotify] Exchange error:', e);
    return false;
  }
}

/** Build the Spotify authorization URL */
export function getSpotifyAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    show_dialog: 'true',
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

/** Search for a track and start playback */
export async function spotifyPlayTrack(query: string): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, message: 'Spotify is not connected. Connect it in Settings first.' };
  }

  try {
    // Search for the track
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (searchRes.status === 401) {
      clearSpotifyTokens();
      return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
    }

    if (!searchRes.ok) {
      return { success: false, message: 'Could not search Spotify right now.' };
    }

    const searchData = await searchRes.json();
    const track = searchData.tracks?.items?.[0];
    if (!track) {
      return { success: false, message: `I couldn't find "${query}" on Spotify.` };
    }

    // Start playback
    const playRes = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [track.uri] }),
    });

    if (playRes.status === 404 || playRes.status === 403) {
      return {
        success: false,
        message: 'No active Spotify device found. Open Spotify on your PC first, then try again.',
      };
    }

    if (!playRes.ok && playRes.status !== 204) {
      return { success: false, message: 'Could not start playback. Make sure Spotify is open.' };
    }

    const artistName = track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist';
    return { success: true, message: `Now playing "${track.name}" by ${artistName}.` };
  } catch (e) {
    console.error('[Spotify] Play error:', e);
    return { success: false, message: 'Something went wrong with Spotify playback.' };
  }
}

/** Pause playback */
export async function spotifyPause(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) return { success: true, message: 'Pausing playback.' };
    return { success: false, message: 'Could not pause. Make sure Spotify is open.' };
  } catch {
    return { success: false, message: 'Could not reach Spotify.' };
  }
}

/** Resume playback */
export async function spotifyResume(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) return { success: true, message: 'Resuming playback.' };
    return { success: false, message: 'No active device found. Open Spotify first.' };
  } catch {
    return { success: false, message: 'Could not reach Spotify.' };
  }
}

/** Skip to next track */
export async function spotifyNext(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) return { success: true, message: 'Skipping to next track.' };
    return { success: false, message: 'Could not skip track.' };
  } catch {
    return { success: false, message: 'Could not reach Spotify.' };
  }
}

/** Go to previous track */
export async function spotifyPrevious(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) return { success: true, message: 'Going to previous track.' };
    return { success: false, message: 'Could not go back.' };
  } catch {
    return { success: false, message: 'Could not reach Spotify.' };
  }
}

/** Set playback volume (0-100) */
export async function spotifySetVolume(percent: number): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  const vol = Math.max(0, Math.min(100, Math.round(percent)));
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/me/player/volume?volume_percent=${vol}`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok || res.status === 204) return { success: true, message: `Volume set to ${vol}%.` };
    if (res.status === 403 || res.status === 404) {
      return { success: false, message: 'No active Spotify device found. Open Spotify first.' };
    }
    return { success: false, message: 'Could not change volume.' };
  } catch {
    return { success: false, message: 'Could not reach Spotify.' };
  }
}
