import type { VoiceOption } from '@/types/jarvis';

export const voiceOptions: VoiceOption[] = [
  // --- Classic human voices (browser/system speech) ---
  {
    id: 'kokoro_bella',
    label: 'Bella',
    elevenLabsId: '',
    description: 'Warm American female voice',
    category: 'standard',
  },
  {
    id: 'kokoro_adam',
    label: 'Adam',
    elevenLabsId: '',
    description: 'Clear American male voice',
    category: 'standard',
  },
  {
    id: 'kokoro_emma',
    label: 'Emma',
    elevenLabsId: '',
    description: 'Refined British female voice',
    category: 'standard',
  },
  {
    id: 'kokoro_george',
    label: 'George',
    elevenLabsId: '',
    description: 'Warm British male voice',
    category: 'standard',
  },
  {
    id: 'kokoro_nicole',
    label: 'Nicole',
    elevenLabsId: '',
    description: 'Confident American female voice',
    category: 'standard',
  },
  {
    id: 'kokoro_michael',
    label: 'Michael',
    elevenLabsId: '',
    description: 'Deep American male voice',
    category: 'standard',
  },
];

export const standardVoices = voiceOptions;

export function getVoiceById(id: string): VoiceOption {
  return voiceOptions.find(v => v.id === id) || voiceOptions[0];
}
