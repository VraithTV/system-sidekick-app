/**
 * Voice command handlers for app control (Spotify, URLs, desktop apps, etc.)
 * These run in Electron via IPC or fall back to shell commands.
 */

import { commonApps } from '@/lib/commonApps';

import {
  isSpotifyConnected,
  spotifyPlayTrack,
  spotifyPause,
  spotifyResume,
  spotifyNext,
  spotifyPrevious,
  spotifySetVolume,
  spotifyNowPlaying,
  spotifyShuffle,
} from '@/lib/spotifyClient';

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

/** Launch the Spotify desktop app via Electron */
function launchSpotifyApp() {
  if (isElectron && (window as any).electronAPI?.openApp) {
    (window as any).electronAPI.openApp('spotify');
  }
}

/** Wait ms milliseconds */
function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export interface AppCommandResult {
  handled: boolean;
  response?: string;
  /** If true, the response is a Promise that should be awaited */
  async?: boolean;
  asyncResponse?: Promise<string>;
}

/** Open a URL in the user's default browser */
function openUrl(url: string) {
  if (isElectron && (window as any).electronAPI?.openUrl) {
    (window as any).electronAPI.openUrl(url);
  } else {
    window.open(url, '_blank');
  }
}

/** Send a media key via Electron */
function sendMediaKey(key: 'play-pause' | 'next' | 'previous' | 'stop') {
  if (isElectron && (window as any).electronAPI?.mediaKey) {
    (window as any).electronAPI.mediaKey(key);
    return true;
  }
  return false;
}

/** Parse and handle Spotify-specific voice commands */
function handleSpotifyCommand(text: string): AppCommandResult {
  const lower = text.toLowerCase();
  const hasSpotifyAPI = isSpotifyConnected();

  // "what's playing" / "what song is this" / "currently playing"
  if (/\b(what('?s| is)\s+(playing|this song|the song)|currently playing|what song|which song)\b/i.test(lower)) {
    if (hasSpotifyAPI) {
      return {
        handled: true,
        async: true,
        asyncResponse: spotifyNowPlaying().then((r) => r.message),
      };
    }
    return { handled: true, response: 'Connect Spotify in Settings to see what is playing.' };
  }

  // "play [song/artist] on spotify" or just "play [song]"
  // Broad regex: handles "play X", "can you play X", "I want to hear X", "put on X", etc.
  const playMatch = lower.match(/(?:play|put on|queue|listen to|hear)\s+(.+?)(?:\s+on\s+spotify)?[\s.!?]*$/i);
  if (playMatch && (lower.includes('spotify') || lower.includes('music') || lower.includes('play') || lower.includes('listen') || lower.includes('hear') || lower.includes('put on') || lower.includes('queue'))) {
    const query = playMatch[1]
      .replace(/\s*on\s*spotify\s*/i, '')
      .replace(/\s*for\s*me\s*/i, '')
      .replace(/\s*please\s*/i, '')
      .replace(/[.!?]+$/, '')
      .trim();

    if (query && query !== 'music' && query !== 'some music' && query !== 'something') {
      if (hasSpotifyAPI) {
        // Launch Spotify desktop app first, then play via API
        return {
          handled: true,
          async: true,
          response: `Searching for "${query}" on Spotify...`,
          asyncResponse: (async () => {
            // Open Spotify app in background
            launchSpotifyApp();
            // Wait a moment for Spotify to start before searching
            await wait(2000);
            // Try to play
            console.log('[Spotify] Attempting to play:', query);
            let result = await spotifyPlayTrack(query);
            console.log('[Spotify] First attempt result:', result);
            if (result.success) return result.message;
            // If no device found, wait longer for Spotify to fully start
            if (result.message.includes('No active') || result.message.includes('device') || result.message.includes('Could not search')) {
              console.log('[Spotify] No device found, retrying...');
              await wait(4000);
              result = await spotifyPlayTrack(query);
              console.log('[Spotify] Second attempt result:', result);
              if (result.success) return result.message;
              // Final retry
              await wait(5000);
              result = await spotifyPlayTrack(query);
              console.log('[Spotify] Third attempt result:', result);
            }
            return result.message;
          })(),
        };
      }
      // Fallback: open Spotify URI/web and tell user to connect for full control
      if (isElectron) {
        openUrl(`spotify:search:${encodeURIComponent(query)}`);
      } else {
        openUrl(`https://open.spotify.com/search/${encodeURIComponent(query)}`);
      }
      return { handled: true, response: `Opening "${query}" in Spotify. Connect Spotify in Settings for hands-free playback.` };
    }

    // Just "play music" -> launch app and resume playback
    if (hasSpotifyAPI) {
      return {
        handled: true,
        async: true,
        asyncResponse: (async () => {
          launchSpotifyApp();
          let result = await spotifyResume();
          if (!result.success && (result.message.includes('No active') || result.message.includes('device'))) {
            await wait(3000);
            result = await spotifyResume();
          }
          return result.message;
        })(),
      };
    }
    if (sendMediaKey('play-pause')) {
      return { handled: true, response: 'Resuming playback.' };
    }
    if (isElectron) {
      launchSpotifyApp();
    } else {
      openUrl('https://open.spotify.com');
    }
    return { handled: true, response: 'Opening Spotify.' };
  }

  // Pause / stop music
  if (/\b(pause|stop)\b.*\b(music|spotify|song|playback)\b/i.test(lower) ||
      /\b(music|spotify|song|playback)\b.*\b(pause|stop)\b/i.test(lower)) {
    if (hasSpotifyAPI) {
      return {
        handled: true,
        async: true,
        asyncResponse: spotifyPause().then((r) => r.message),
      };
    }
    if (sendMediaKey('play-pause')) {
      return { handled: true, response: 'Pausing playback.' };
    }
    return { handled: true, response: 'I sent the pause command.' };
  }

  // Skip / next track
  if (/\b(skip|next)\b.*\b(track|song|music)\b/i.test(lower) ||
      (/\b(next|skip)\b/i.test(lower) && lower.includes('spotify'))) {
    if (hasSpotifyAPI) {
      return {
        handled: true,
        async: true,
        asyncResponse: spotifyNext().then((r) => r.message),
      };
    }
    if (sendMediaKey('next')) {
      return { handled: true, response: 'Skipping to next track.' };
    }
    return { handled: true, response: 'Skipping track.' };
  }

  // Previous track
  if (/\b(previous|last|go back)\b.*\b(track|song)\b/i.test(lower)) {
    if (hasSpotifyAPI) {
      return {
        handled: true,
        async: true,
        asyncResponse: spotifyPrevious().then((r) => r.message),
      };
    }
    if (sendMediaKey('previous')) {
      return { handled: true, response: 'Going to previous track.' };
    }
    return { handled: true, response: 'Going back.' };
  }

  // Shuffle: "shuffle my playlist", "turn on shuffle", "shuffle mode"
  if (/\b(shuffle|shuffl)\b/i.test(lower)) {
    if (hasSpotifyAPI) {
      const wantOn = /\b(on|enable|start|activate)\b/i.test(lower);
      const wantOff = /\b(off|disable|stop|deactivate)\b/i.test(lower);
      const explicit = wantOn ? true : wantOff ? false : undefined;
      return {
        handled: true,
        async: true,
        asyncResponse: spotifyShuffle(explicit).then((r) => r.message),
      };
    }
    return { handled: true, response: 'Connect Spotify in Settings to use shuffle.' };
  }

  // Volume control: "set volume to 50%", "volume 80", "turn it up/down"
  const volMatch = lower.match(/(?:set\s+)?(?:spotify\s+)?volume\s+(?:to\s+)?(\d+)\s*%?/i);
  if (volMatch) {
    const vol = parseInt(volMatch[1], 10);
    if (hasSpotifyAPI) {
      return {
        handled: true,
        async: true,
        asyncResponse: spotifySetVolume(vol).then((r) => r.message),
      };
    }
    return { handled: true, response: `I need Spotify connected to change volume. Connect it in Settings.` };
  }

  // "turn it up" / "turn it down" / "louder" / "quieter"
  if (/\b(turn\s*(it\s*)?(up|down)|louder|quieter|lower\s*the\s*volume|raise\s*the\s*volume)\b/i.test(lower)) {
    if (hasSpotifyAPI) {
      const isUp = /\b(up|louder|raise)\b/i.test(lower);
      return {
        handled: true,
        async: true,
        asyncResponse: (async () => {
          // Get current volume, adjust by 20%
          const token = localStorage.getItem('jarvis_spotify_tokens');
          let currentVol = 50;
          try {
            const tokens = token ? JSON.parse(token) : null;
            if (tokens?.access_token) {
              const res = await fetch('https://api.spotify.com/v1/me/player', {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
              });
              if (res.ok) {
                const data = await res.json();
                currentVol = data?.device?.volume_percent ?? 50;
              }
            }
          } catch {}
          const newVol = isUp ? Math.min(100, currentVol + 20) : Math.max(0, currentVol - 20);
          return (await spotifySetVolume(newVol)).message;
        })(),
      };
    }
    return { handled: true, response: `I need Spotify connected to change volume.` };
  }

  return { handled: false };
}

/** Parse and handle URL-opening commands like "open YouTube" */
function handleUrlCommand(text: string): AppCommandResult {
  const lower = text.toLowerCase();

  const urlMap: Record<string, { url: string; name: string }> = {
    youtube: { url: 'https://youtube.com', name: 'YouTube' },
    netflix: { url: 'https://netflix.com', name: 'Netflix' },
    twitch: { url: 'https://twitch.tv', name: 'Twitch' },
    twitter: { url: 'https://x.com', name: 'X' },
    github: { url: 'https://github.com', name: 'GitHub' },
    reddit: { url: 'https://reddit.com', name: 'Reddit' },
    gmail: { url: 'https://mail.google.com', name: 'Gmail' },
    google: { url: 'https://google.com', name: 'Google' },
    chatgpt: { url: 'https://chat.openai.com', name: 'ChatGPT' },
    amazon: { url: 'https://amazon.com', name: 'Amazon' },
    linkedin: { url: 'https://linkedin.com', name: 'LinkedIn' },
  };

  // Match "open youtube", "go to netflix", "take me to github"
  const openMatch = lower.match(/(?:open|go to|take me to|launch|navigate to|show me|pull up|bring up)\s+(.+)/i);
  if (openMatch) {
    const target = openMatch[1].replace(/^(the|my|up)\s+/i, '').trim().toLowerCase();
    for (const [key, { url, name }] of Object.entries(urlMap)) {
      if (target.includes(key)) {
        openUrl(url);
        return { handled: true, response: `Opening ${name} for you.` };
      }
    }

    // Try desktop apps via Electron IPC
    if (isElectron && (window as any).electronAPI?.openApp) {
      const cleanTarget = target.replace(/\s+and\s+.*/i, '').trim();
      const matched = commonApps.find((app) =>
        app.aliases.some((alias) => cleanTarget === alias || cleanTarget.includes(alias))
      );
      if (matched) {
        (window as any).electronAPI.openApp(matched.id);
        return { handled: true, response: `Opening ${matched.name} for you.` };
      }
    }

    // "open youtube and search for X"
    const ytSearchMatch = lower.match(/youtube.*(?:search|look up|find)\s+(.+)/i);
    if (ytSearchMatch) {
      const query = ytSearchMatch[1].trim();
      openUrl(`https://youtube.com/results?search_query=${encodeURIComponent(query)}`);
      return { handled: true, response: `Searching YouTube for "${query}".` };
    }

    // "search youtube for X"
    const searchYtMatch = lower.match(/search\s+youtube\s+(?:for\s+)?(.+)/i);
    if (searchYtMatch) {
      const query = searchYtMatch[1].trim();
      openUrl(`https://youtube.com/results?search_query=${encodeURIComponent(query)}`);
      return { handled: true, response: `Searching YouTube for "${query}".` };
    }
  }

  // "search for X on youtube"
  const searchOnYt = lower.match(/search\s+(?:for\s+)?(.+?)\s+on\s+youtube/i);
  if (searchOnYt) {
    const query = searchOnYt[1].trim();
    openUrl(`https://youtube.com/results?search_query=${encodeURIComponent(query)}`);
    return { handled: true, response: `Searching YouTube for "${query}".` };
  }

  // "google X" or "search for X"
  const googleMatch = lower.match(/(?:google|search for|look up|search)\s+(.+)/i);
  if (googleMatch) {
    const query = googleMatch[1].replace(/\s*on google\s*/i, '').trim();
    if (query) {
      openUrl(`https://google.com/search?q=${encodeURIComponent(query)}`);
      return { handled: true, response: `Searching Google for "${query}".` };
    }
  }

  return { handled: false };
}

/**
 * Process a voice command for app control.
 * Returns { handled: true, response } if the command was handled,
 * or { handled: false } if it should pass through to the AI.
 */
export function processAppCommand(text: string): AppCommandResult {
  // Try Spotify commands first
  const spotifyResult = handleSpotifyCommand(text);
  if (spotifyResult.handled) return spotifyResult;

  // Try URL commands
  const urlResult = handleUrlCommand(text);
  if (urlResult.handled) return urlResult;

  return { handled: false };
}
