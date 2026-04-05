import type { VoiceOption } from '@/types/jarvis';

export const voiceOptions: VoiceOption[] = [
  {
    id: 'jarvis',
    label: 'Jarvis',
    elevenLabsId: 'lbbhDW6HxyTHZ2QFbpu8',
    description: 'The official Jarvis AI voice — custom-built',
  },
  {
    id: 'daniel',
    label: 'Daniel',
    elevenLabsId: 'onwK4e9ZLuTAKqWW03F9',
    description: 'Deep, authoritative British male — closest to Jarvis',
  },
  {
    id: 'george',
    label: 'George',
    elevenLabsId: 'JBFqnCBsd6RMkjVDRZzb',
    description: 'Warm British male with a refined tone',
  },
  {
    id: 'brian',
    label: 'Brian',
    elevenLabsId: 'nPczCjzI2devNBz1zQrb',
    description: 'Deep American narrator voice',
  },
  {
    id: 'chris',
    label: 'Chris',
    elevenLabsId: 'iP95p4xoKVk53GoZ742B',
    description: 'Casual, friendly male voice',
  },
  {
    id: 'liam',
    label: 'Liam',
    elevenLabsId: 'TX3LPaxmHKxFdv7VOQHJ',
    description: 'Young, articulate male voice',
  },
  {
    id: 'eric',
    label: 'Eric',
    elevenLabsId: 'cjVigY5qzO86Huf0OWal',
    description: 'Calm, professional male voice',
  },
  {
    id: 'alice',
    label: 'Alice',
    elevenLabsId: 'Xb7hH8MSUJpSbSDYk0k2',
    description: 'Confident British female voice',
  },
  {
    id: 'sarah',
    label: 'Sarah',
    elevenLabsId: 'EXAVITQu4vr4xnSDxMaL',
    description: 'Soft, warm female voice',
  },
];

export function getVoiceById(id: string): VoiceOption {
  return voiceOptions.find(v => v.id === id) || voiceOptions[0];
}
