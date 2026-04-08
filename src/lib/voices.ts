import type { VoiceOption } from '@/types/jarvis';

export const voiceOptions: VoiceOption[] = [
  {
    id: 'jarvis',
    label: 'Jarvis',
    elevenLabsId: 'FGXKiDmEauRJOoFEe3id',
    description: 'The official Jarvis AI assistant voice',
    category: 'jarvis',
  },
  {
    id: 'daniel',
    label: 'Daniel',
    elevenLabsId: 'onwK4e9ZLuTAKqWW03F9',
    description: 'Deep, authoritative British male',
    category: 'standard',
  },
  {
    id: 'george',
    label: 'George',
    elevenLabsId: 'JBFqnCBsd6RMkjVDRZzb',
    description: 'Warm British male with a refined tone',
    category: 'standard',
  },
  {
    id: 'brian',
    label: 'Brian',
    elevenLabsId: 'nPczCjzI2devNBz1zQrb',
    description: 'Deep American narrator voice',
    category: 'standard',
  },
  {
    id: 'chris',
    label: 'Chris',
    elevenLabsId: 'iP95p4xoKVk53GoZ742B',
    description: 'Casual, friendly male voice',
    category: 'standard',
  },
  {
    id: 'liam',
    label: 'Liam',
    elevenLabsId: 'TX3LPaxmHKxFdv7VOQHJ',
    description: 'Young, articulate male voice',
    category: 'standard',
  },
  {
    id: 'eric',
    label: 'Eric',
    elevenLabsId: 'cjVigY5qzO86Huf0OWal',
    description: 'Calm, professional male voice',
    category: 'standard',
  },
  {
    id: 'alice',
    label: 'Alice',
    elevenLabsId: 'Xb7hH8MSUJpSbSDYk0k2',
    description: 'Confident British female voice',
    category: 'standard',
  },
  {
    id: 'sarah',
    label: 'Sarah',
    elevenLabsId: 'EXAVITQu4vr4xnSDxMaL',
    description: 'Soft, warm female voice',
    category: 'standard',
  },
];

export const jarvisVoices = voiceOptions.filter(v => v.category === 'jarvis');
export const standardVoices = voiceOptions.filter(v => v.category === 'standard');

export function getVoiceById(id: string): VoiceOption {
  return voiceOptions.find(v => v.id === id) || voiceOptions[0];
}
