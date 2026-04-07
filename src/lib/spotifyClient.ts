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

/** Proxy Spotify Web API calls through the backend for better Electron reliability */
type SpotifyProxyResult<T = any> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: unknown;
};

async function invokeSpotifyApi<T = any>(
  token: string,
  action: string,
  body: Record<string, unknown> = {}
): Promise<SpotifyProxyResult<T>> {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('spotify-auth', {
      body: { action, access_token: token, ...body },
    });

    if (error) {
      const response = (error as any)?.context;
      let status = 500;
      let details: unknown = error;

      if (response) {
        status = response.status ?? status;
        try {
          details = await response.json();
        } catch {
          try {
            details = await response.text();
          } catch {
            details = error;
          }
        }
      }

      console.warn(`[Spotify] ${action} failed:`, status, details);
      return { ok: false, status, error: details };
    }

    return {
      ok: true,
      status: data?.status ?? 200,
      data: (data?.data ?? data) as T,
    };
  } catch (e) {
    console.warn(`[Spotify] ${action} invoke error:`, e);
    return { ok: false, status: 500, error: e };
  }
}

/** Get available devices and pick the best one to play on */
async function getActiveDeviceId(token: string): Promise<string | null> {
  const result = await invokeSpotifyApi<{ devices?: any[] }>(token, 'get-devices');
  if (!result.ok) return null;

  const devices = result.data?.devices || [];
  const active = devices.find((d: any) => d.is_active);
  if (active) return active.id;

  const computer = devices.find((d: any) => d.type === 'Computer');
  if (computer) return computer.id;

  return devices[0]?.id || null;
}

/** Transfer playback to a device so it becomes active */
async function transferPlayback(token: string, deviceId: string): Promise<boolean> {
  const result = await invokeSpotifyApi(token, 'transfer-playback', { device_id: deviceId });
  return result.ok;
}

/** Search for a track and start playback */
export async function spotifyPlayTrack(query: string): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) {
    return { success: false, message: 'Spotify is not connected. Connect it in Settings first.' };
  }

  try {
    const searchResult = await invokeSpotifyApi<{ tracks?: { items?: any[] } }>(token, 'search-track', {
      query,
    });

    if (!searchResult.ok) {
      if (searchResult.status === 401) {
        clearSpotifyTokens();
        return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
      }
      if (searchResult.status === 403) {
        return { success: false, message: 'Spotify denied the search request. Reconnect Spotify in Settings and try again.' };
      }
      if (searchResult.status === 429) {
        return { success: false, message: 'Spotify is rate limiting requests right now. Try again in a moment.' };
      }
      return { success: false, message: 'Could not search Spotify right now.' };
    }

    const track = searchResult.data?.tracks?.items?.[0];
    if (!track) {
      return { success: false, message: `I couldn't find "${query}" on Spotify.` };
    }

    let deviceId = await getActiveDeviceId(token);
    if (!deviceId) {
      return {
        success: false,
        message: 'No active Spotify device found. Open Spotify on your PC first, then try again.',
      };
    }

    await transferPlayback(token, deviceId);

    const playResult = await invokeSpotifyApi(token, 'play-track', {
      device_id: deviceId,
      uris: [track.uri],
    });

    if (!playResult.ok) {
      if (playResult.status === 401) {
        clearSpotifyTokens();
        return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
      }
      if (playResult.status === 404 || playResult.status === 403) {
        return {
          success: false,
          message: 'No active Spotify device found. Open Spotify on your PC first, then try again.',
        };
      }
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

  const result = await invokeSpotifyApi(token, 'pause');
  if (result.ok) return { success: true, message: 'Pausing playback.' };
  if (result.status === 401) {
    clearSpotifyTokens();
    return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
  }
  return { success: false, message: 'Could not pause. Make sure Spotify is open.' };
}

/** Resume playback */
export async function spotifyResume(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  const result = await invokeSpotifyApi(token, 'resume');
  if (result.ok) return { success: true, message: 'Resuming playback.' };
  if (result.status === 401) {
    clearSpotifyTokens();
    return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
  }
  return { success: false, message: 'No active device found. Open Spotify first.' };
}

/** Skip to next track */
export async function spotifyNext(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  const result = await invokeSpotifyApi(token, 'next');
  if (result.ok) return { success: true, message: 'Skipping to next track.' };
  if (result.status === 401) {
    clearSpotifyTokens();
    return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
  }
  return { success: false, message: 'Could not skip track.' };
}

/** Go to previous track */
export async function spotifyPrevious(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  const result = await invokeSpotifyApi(token, 'previous');
  if (result.ok) return { success: true, message: 'Going to previous track.' };
  if (result.status === 401) {
    clearSpotifyTokens();
    return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
  }
  return { success: false, message: 'Could not go back.' };
}

/** Set playback volume (0-100) */
export async function spotifySetVolume(percent: number): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  const vol = Math.max(0, Math.min(100, Math.round(percent)));
  const result = await invokeSpotifyApi(token, 'set-volume', { volume_percent: vol });

  if (result.ok) return { success: true, message: `Volume set to ${vol}%.` };
  if (result.status === 401) {
    clearSpotifyTokens();
    return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
  }
  if (result.status === 403 || result.status === 404) {
    return { success: false, message: 'No active Spotify device found. Open Spotify first.' };
  }
  return { success: false, message: 'Could not change volume.' };
}

/** Get currently playing track info */
export async function spotifyNowPlaying(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  const result = await invokeSpotifyApi<any>(token, 'now-playing');
  if (!result.ok) {
    if (result.status === 401) {
      clearSpotifyTokens();
      return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
    }
    if (result.status === 204 || result.status === 202) {
      return { success: true, message: 'Nothing is playing on Spotify right now.' };
    }
    return { success: false, message: 'Could not check what is playing.' };
  }

  if (result.status === 204 || result.status === 202 || !result.data?.item) {
    return { success: true, message: 'Nothing is playing on Spotify right now.' };
  }

  const track = result.data.item;
  const artists = track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist';
  const album = track.album?.name || '';
  const isPlaying = result.data.is_playing ? 'Currently playing' : 'Paused on';
  return {
    success: true,
    message: `${isPlaying}: "${track.name}" by ${artists}${album ? ` from the album "${album}"` : ''}.`,
  };
}

/** Toggle shuffle on/off */
export async function spotifyShuffle(state?: boolean): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();
  if (!token) return { success: false, message: 'Spotify is not connected.' };

  try {
    let newState = state;
    if (newState === undefined) {
      const playerState = await invokeSpotifyApi<any>(token, 'player-state');
      if (playerState.ok) {
        newState = !playerState.data?.shuffle_state;
      } else {
        newState = true;
      }
    }

    const result = await invokeSpotifyApi(token, 'shuffle', { state: newState });
    if (result.ok) {
      return { success: true, message: newState ? 'Shuffle is now on.' : 'Shuffle is now off.' };
    }
    if (result.status === 401) {
      clearSpotifyTokens();
      return { success: false, message: 'Spotify session expired. Please reconnect in Settings.' };
    }
    if (result.status === 403 || result.status === 404) {
      return { success: false, message: 'No active Spotify device found. Open Spotify first.' };
    }
    return { success: false, message: 'Could not change shuffle mode.' };
  } catch {
    return { success: false, message: 'Could not reach Spotify.' };
  }
}
