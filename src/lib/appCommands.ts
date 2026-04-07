/**
 * Voice command handlers for app control (Spotify, URLs, etc.)
 * These run in Electron via IPC or fall back to shell commands.
 */

import {
  isSpotifyConnected,
  spotifyPlayTrack,
  spotifyPause,
  spotifyResume,
  spotifyNext,
  spotifyPrevious,
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

  // "play [song/artist] on spotify" or just "play [song]"
  const playMatch = lower.match(/(?:play|put on|queue)\s+(.+?)(?:\s+on\s+spotify)?$/i);
  if (playMatch && (lower.includes('spotify') || lower.includes('music') || lower.includes('play'))) {
    const query = playMatch[1]
      .replace(/\s*on\s*spotify\s*/i, '')
      .replace(/\s*for\s*me\s*/i, '')
      .replace(/\s*please\s*/i, '')
      .trim();

    if (query && query !== 'music' && query !== 'some music' && query !== 'something') {
      if (hasSpotifyAPI) {
        // Use Spotify Web API for direct playback
        return {
          handled: true,
          async: true,
          response: `Searching for "${query}" on Spotify...`,
          asyncResponse: spotifyPlayTrack(query).then((r) => r.message),
        };
      }
      // Fallback: open Spotify URI/web
      if (isElectron) {
        openUrl(`spotify:search:${encodeURIComponent(query)}`);
      } else {
        openUrl(`https://open.spotify.com/search/${encodeURIComponent(query)}`);
      }
      return { handled: true, response: `Searching for "${query}" on Spotify now.` };
    }

    // Just "play music" -> resume playback
    if (hasSpotifyAPI) {
      return {
        handled: true,
        async: true,
        asyncResponse: spotifyResume().then((r) => r.message),
      };
    }
    if (sendMediaKey('play-pause')) {
      return { handled: true, response: 'Resuming playback.' };
    }
    if (isElectron) {
      openUrl('spotify:');
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
