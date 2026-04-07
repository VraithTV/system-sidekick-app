import type { ModeInfo, JarvisMode } from '@/types/jarvis';

export const modes: ModeInfo[] = [
  {
    id: 'assistant',
    label: 'Assistant',
    description: 'General-purpose voice assistant. Ask questions, open apps, control your PC.',
    icon: '🤖',
  },
  {
    id: 'task',
    label: 'Task / Goal',
    description: 'Focused mode. Give Jarvis a goal and it tracks steps to completion.',
    icon: '🎯',
  },
  {
    id: 'private',
    label: 'Private',
    description: 'No conversation history is saved. Responses are not logged.',
    icon: '🔒',
  },
  {
    id: 'action',
    label: 'Action',
    description: 'Execute-only mode. Jarvis skips chit-chat and runs commands immediately.',
    icon: '⚡',
  },
  {
    id: 'animation',
    label: 'Animation',
    description: 'Personality mode. Jarvis uses expressive language and dramatic flair.',
    icon: '🎭',
  },
];

export function getModeById(id: JarvisMode): ModeInfo {
  return modes.find(m => m.id === id) || modes[0];
}

export function getModeSystemPromptAddition(mode: JarvisMode): string {
  switch (mode) {
    case 'task':
      return '\n\nYou are in TASK MODE. The user has given you a goal. Break it into steps, track progress, and confirm each step. Be structured and action-oriented. Use numbered lists.';
    case 'private':
      return '\n\nYou are in PRIVATE MODE. Do not reference any stored memories. Respond helpfully but treat every message as a fresh conversation.';
    case 'action':
      return '\n\nYou are in ACTION MODE. Be extremely brief. No small talk. Just confirm what you did in under 10 words. Execute commands instantly.';
    case 'animation':
      return '\n\nYou are in ANIMATION MODE. Be dramatic, expressive, and theatrical like a movie AI. Use vivid language, dramatic pauses (with "..."), and add personality. Channel your inner Jarvis from Iron Man.';
    default:
      return '';
  }
}
