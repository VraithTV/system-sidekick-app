export interface LanguageOption {
  code: string;        // BCP-47 code for STT/TTS
  label: string;       // Display name
  nativeLabel: string; // Name in its own language
  flag: string;        // Emoji flag (fallback)
  countryCode: string; // ISO 3166-1 alpha-2 for flag images
  sttCode: string;     // Speech recognition lang code
  aiPrompt: string;    // Instruction for the AI
}

export const languages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', countryCode: 'gb', sttCode: 'en-US', aiPrompt: 'Respond in English.' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷', countryCode: 'fr', sttCode: 'fr-FR', aiPrompt: 'Respond entirely in French (Français). All text must be in French.' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪', countryCode: 'de', sttCode: 'de-DE', aiPrompt: 'Respond entirely in German (Deutsch). All text must be in German.' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', countryCode: 'es', sttCode: 'es-ES', aiPrompt: 'Respond entirely in Spanish (Español). All text must be in Spanish.' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷', countryCode: 'br', sttCode: 'pt-BR', aiPrompt: 'Respond entirely in Portuguese (Português). All text must be in Portuguese.' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺', countryCode: 'ru', sttCode: 'ru-RU', aiPrompt: 'Respond entirely in Russian (Русский). All text must be in Russian.' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵', countryCode: 'jp', sttCode: 'ja-JP', aiPrompt: 'Respond entirely in Japanese (日本語). All text must be in Japanese.' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', flag: '🇰🇷', countryCode: 'kr', sttCode: 'ko-KR', aiPrompt: 'Respond entirely in Korean (한국어). All text must be in Korean.' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳', countryCode: 'cn', sttCode: 'zh-CN', aiPrompt: 'Respond entirely in Mandarin Chinese (中文). All text must be in Chinese.' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', countryCode: 'sa', sttCode: 'ar-SA', aiPrompt: 'Respond entirely in Arabic (العربية). All text must be in Arabic.' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', countryCode: 'in', sttCode: 'hi-IN', aiPrompt: 'Respond entirely in Hindi (हिन्दी). All text must be in Hindi.' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹', countryCode: 'it', sttCode: 'it-IT', aiPrompt: 'Respond entirely in Italian (Italiano). All text must be in Italian.' },
];

export function getLanguage(code: string): LanguageOption {
  return languages.find((l) => l.code === code) || languages[0];
}

/** Get flag image URL from flagcdn.com */
export function getFlagUrl(countryCode: string, size: number = 40): string {
  return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${countryCode}.png`;
}
