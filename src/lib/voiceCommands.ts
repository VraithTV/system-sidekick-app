/**
 * Built-in voice command handlers for utility functions.
 * These run locally without hitting the AI.
 */

export interface VoiceCommandResult {
  handled: boolean;
  response?: string;
}

const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

// Active timers
const activeTimers: Map<string, { timeout: ReturnType<typeof setTimeout>; label: string }> = new Map();

function playTimerSound() {
  try {
    const ctx = new AudioContext();
    // Play a pleasant chime
    for (const freq of [523.25, 659.25, 783.99]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    }
  } catch {}
}

function parseTimeDuration(text: string): { seconds: number; label: string } | null {
  // Match "5 minutes", "30 seconds", "1 hour", "2 and a half minutes", "90 seconds"
  const match = text.match(
    /(\d+(?:\.\d+)?)\s*(?:and\s*(?:a\s*)?half\s*)?(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs)/i
  );
  if (!match) return null;

  let amount = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  const hasHalf = /and\s*(?:a\s*)?half/i.test(text);
  if (hasHalf) amount += 0.5;

  let seconds: number;
  let label: string;

  if (unit.startsWith('sec')) {
    seconds = amount;
    label = `${amount} second${amount !== 1 ? 's' : ''}`;
  } else if (unit.startsWith('min')) {
    seconds = amount * 60;
    label = `${amount} minute${amount !== 1 ? 's' : ''}`;
  } else {
    seconds = amount * 3600;
    label = `${amount} hour${amount !== 1 ? 's' : ''}`;
  }

  return { seconds, label };
}

/** Handle timer commands */
function handleTimerCommand(text: string): VoiceCommandResult {
  const lower = text.toLowerCase();

  // "set a timer for 5 minutes", "timer 30 seconds"
  if (/\b(set|start|create)?\s*(a\s*)?(timer|alarm|countdown)\s*(for\s*)?/i.test(lower)) {
    const duration = parseTimeDuration(lower);
    if (!duration) return { handled: false };

    const id = Date.now().toString();
    const timeout = setTimeout(() => {
      playTimerSound();
      activeTimers.delete(id);
      // Show notification if in Electron
      if (isElectron) {
        new Notification('Jarvis Timer', { body: `Your ${duration.label} timer is done.` });
      }
    }, duration.seconds * 1000);

    activeTimers.set(id, { timeout, label: duration.label });
    return { handled: true, response: `Timer set for ${duration.label}. I'll let you know when it's done.` };
  }

  // "cancel timer", "stop the timer"
  if (/\b(cancel|stop|clear|remove)\b.*\b(timer|alarm|countdown)\b/i.test(lower)) {
    if (activeTimers.size === 0) {
      return { handled: true, response: "There are no active timers." };
    }
    for (const [id, { timeout }] of activeTimers) {
      clearTimeout(timeout);
      activeTimers.delete(id);
    }
    return { handled: true, response: "All timers cancelled." };
  }

  return { handled: false };
}

/** Handle time/date queries */
function handleTimeCommand(text: string): VoiceCommandResult {
  const lower = text.toLowerCase();

  if (/\bwhat\s*(time|is\s*the\s*time)\b/i.test(lower) || /\b(tell\s*me\s*the\s*time|current\s*time)\b/i.test(lower)) {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return { handled: true, response: `It's ${time}.` };
  }

  if (/\bwhat\s*(date|day|is\s*the\s*date|is\s*today)\b/i.test(lower) || /\b(today's\s*date|current\s*date)\b/i.test(lower)) {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return { handled: true, response: `Today is ${date}.` };
  }

  return { handled: false };
}

/** Handle volume commands - uses Spotify API instead of system shell commands */
function handleVolumeCommand(text: string): VoiceCommandResult {
  // Volume control is now handled by Spotify API commands in appCommands.ts
  // System volume manipulation via PowerShell has been removed to avoid AV flags
  return { handled: false };
}

/** Handle math/calculation commands */
function handleMathCommand(text: string): VoiceCommandResult {
  const lower = text.toLowerCase();

  // "what is 5 + 3", "calculate 100 / 4"
  const mathMatch = lower.match(/(?:what\s*is|calculate|compute|solve|what's)\s+([\d\s+\-*/().%^]+)/i);
  if (mathMatch) {
    try {
      const expr = mathMatch[1]
        .replace(/\^/g, '**')
        .replace(/x/gi, '*')
        .replace(/÷/g, '/')
        .trim();
      // Simple safety check: only allow math characters
      if (/^[\d\s+\-*/().%]+$/.test(expr)) {
        const result = Function(`"use strict"; return (${expr})`)();
        if (typeof result === 'number' && isFinite(result)) {
          return { handled: true, response: `That equals ${result}.` };
        }
      }
    } catch {}
  }

  return { handled: false };
}

/** Handle coin flip / dice roll */
function handleRandomCommand(text: string): VoiceCommandResult {
  const lower = text.toLowerCase();

  if (/\b(flip|toss)\s*(a\s*)?(coin)\b/i.test(lower)) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    return { handled: true, response: `${result}.` };
  }

  if (/\b(roll|throw)\s*(a\s*)?(die|dice|d6)\b/i.test(lower)) {
    const result = Math.floor(Math.random() * 6) + 1;
    return { handled: true, response: `You rolled a ${result}.` };
  }

  return { handled: false };
}

/**
 * Process built-in voice commands.
 * Returns { handled: true, response } if matched, or { handled: false } to pass to AI.
 */
export function processVoiceCommand(text: string): VoiceCommandResult {
  const handlers = [
    handleTimerCommand,
    handleTimeCommand,
    handleVolumeCommand,
    handleMathCommand,
    handleRandomCommand,
  ];

  for (const handler of handlers) {
    const result = handler(text);
    if (result.handled) return result;
  }

  return { handled: false };
}
