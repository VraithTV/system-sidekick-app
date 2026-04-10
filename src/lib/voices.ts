import type { VoiceOption } from '@/types/jarvis';

export const voiceOptions: VoiceOption[] = [
  {
    id: 'kokoro_bella',
    label: 'Bella',
    elevenLabsId: '',
    kokoroId: 'af_bella',
    description: 'Warm American female voice',
    category: 'standard',
  },
  {
    id: 'kokoro_adam',
    label: 'Adam',
    elevenLabsId: '',
    kokoroId: 'am_adam',
    description: 'Clear American male voice',
    category: 'standard',
  },
  {
    id: 'kokoro_emma',
    label: 'Emma',
    elevenLabsId: '',
    kokoroId: 'bf_emma',
    description: 'Refined British female voice',
    category: 'standard',
  },
  {
    id: 'kokoro_george',
    label: 'George',
    elevenLabsId: '',
    kokoroId: 'bm_george',
    description: 'Warm British male voice',
    category: 'standard',
  },
  {
    id: 'kokoro_nicole',
    label: 'Nicole',
    elevenLabsId: '',
    kokoroId: 'af_nicole',
    description: 'Confident American female voice',
    category: 'standard',
  },
  {
    id: 'kokoro_michael',
    label: 'Michael',
    elevenLabsId: '',
    kokoroId: 'am_michael',
    description: 'Deep American male voice',
    category: 'standard',
  },
];

export const standardVoices = voiceOptions;

export function getVoiceById(id: string): VoiceOption {
  return voiceOptions.find(v => v.id === id) || voiceOptions[0];
}
