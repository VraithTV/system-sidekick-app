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
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', flag: '🇹🇷', countryCode: 'tr', sttCode: 'tr-TR', aiPrompt: 'Respond entirely in Turkish (Türkçe). All text must be in Turkish.' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺', countryCode: 'ru', sttCode: 'ru-RU', aiPrompt: 'Respond entirely in Russian (Русский). All text must be in Russian.' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵', countryCode: 'jp', sttCode: 'ja-JP', aiPrompt: 'Respond entirely in Japanese (日本語). All text must be in Japanese.' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', flag: '🇰🇷', countryCode: 'kr', sttCode: 'ko-KR', aiPrompt: 'Respond entirely in Korean (한국어). All text must be in Korean.' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳', countryCode: 'cn', sttCode: 'zh-CN', aiPrompt: 'Respond entirely in Mandarin Chinese (中文). All text must be in Chinese.' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', countryCode: 'sa', sttCode: 'ar-SA', aiPrompt: 'Respond entirely in Arabic (العربية). All text must be in Arabic.' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', countryCode: 'in', sttCode: 'hi-IN', aiPrompt: 'Respond entirely in Hindi (हिन्दी). All text must be in Hindi.' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹', countryCode: 'it', sttCode: 'it-IT', aiPrompt: 'Respond entirely in Italian (Italiano). All text must be in Italian.' },
  { code: 'ro', label: 'Romanian', nativeLabel: 'Română', flag: '🇷🇴', countryCode: 'ro', sttCode: 'ro-RO', aiPrompt: 'Respond entirely in Romanian (Română). All text must be in Romanian.' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', flag: '🇳🇱', countryCode: 'nl', sttCode: 'nl-NL', aiPrompt: 'Respond entirely in Dutch (Nederlands). All text must be in Dutch.' },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski', flag: '🇵🇱', countryCode: 'pl', sttCode: 'pl-PL', aiPrompt: 'Respond entirely in Polish (Polski). All text must be in Polish.' },
  { code: 'sv', label: 'Swedish', nativeLabel: 'Svenska', flag: '🇸🇪', countryCode: 'se', sttCode: 'sv-SE', aiPrompt: 'Respond entirely in Swedish (Svenska). All text must be in Swedish.' },
  { code: 'da', label: 'Danish', nativeLabel: 'Dansk', flag: '🇩🇰', countryCode: 'dk', sttCode: 'da-DK', aiPrompt: 'Respond entirely in Danish (Dansk). All text must be in Danish.' },
  { code: 'no', label: 'Norwegian', nativeLabel: 'Norsk', flag: '🇳🇴', countryCode: 'no', sttCode: 'nb-NO', aiPrompt: 'Respond entirely in Norwegian (Norsk). All text must be in Norwegian.' },
  { code: 'fi', label: 'Finnish', nativeLabel: 'Suomi', flag: '🇫🇮', countryCode: 'fi', sttCode: 'fi-FI', aiPrompt: 'Respond entirely in Finnish (Suomi). All text must be in Finnish.' },
  { code: 'el', label: 'Greek', nativeLabel: 'Ελληνικά', flag: '🇬🇷', countryCode: 'gr', sttCode: 'el-GR', aiPrompt: 'Respond entirely in Greek (Ελληνικά). All text must be in Greek.' },
  { code: 'cs', label: 'Czech', nativeLabel: 'Čeština', flag: '🇨🇿', countryCode: 'cz', sttCode: 'cs-CZ', aiPrompt: 'Respond entirely in Czech (Čeština). All text must be in Czech.' },
  { code: 'uk', label: 'Ukrainian', nativeLabel: 'Українська', flag: '🇺🇦', countryCode: 'ua', sttCode: 'uk-UA', aiPrompt: 'Respond entirely in Ukrainian (Українська). All text must be in Ukrainian.' },
  { code: 'th', label: 'Thai', nativeLabel: 'ไทย', flag: '🇹🇭', countryCode: 'th', sttCode: 'th-TH', aiPrompt: 'Respond entirely in Thai (ไทย). All text must be in Thai.' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt', flag: '🇻🇳', countryCode: 'vn', sttCode: 'vi-VN', aiPrompt: 'Respond entirely in Vietnamese (Tiếng Việt). All text must be in Vietnamese.' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', flag: '🇮🇩', countryCode: 'id', sttCode: 'id-ID', aiPrompt: 'Respond entirely in Indonesian (Bahasa Indonesia). All text must be in Indonesian.' },
  { code: 'ms', label: 'Malay', nativeLabel: 'Bahasa Melayu', flag: '🇲🇾', countryCode: 'my', sttCode: 'ms-MY', aiPrompt: 'Respond entirely in Malay (Bahasa Melayu). All text must be in Malay.' },
  { code: 'hu', label: 'Hungarian', nativeLabel: 'Magyar', flag: '🇭🇺', countryCode: 'hu', sttCode: 'hu-HU', aiPrompt: 'Respond entirely in Hungarian (Magyar). All text must be in Hungarian.' },
  { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', flag: '🇮🇱', countryCode: 'il', sttCode: 'he-IL', aiPrompt: 'Respond entirely in Hebrew (עברית). All text must be in Hebrew.' },
  { code: 'bg', label: 'Bulgarian', nativeLabel: 'Български', flag: '🇧🇬', countryCode: 'bg', sttCode: 'bg-BG', aiPrompt: 'Respond entirely in Bulgarian (Български). All text must be in Bulgarian.' },
  { code: 'hr', label: 'Croatian', nativeLabel: 'Hrvatski', flag: '🇭🇷', countryCode: 'hr', sttCode: 'hr-HR', aiPrompt: 'Respond entirely in Croatian (Hrvatski). All text must be in Croatian.' },
  { code: 'sk', label: 'Slovak', nativeLabel: 'Slovenčina', flag: '🇸🇰', countryCode: 'sk', sttCode: 'sk-SK', aiPrompt: 'Respond entirely in Slovak (Slovenčina). All text must be in Slovak.' },
  { code: 'sr', label: 'Serbian', nativeLabel: 'Srpski', flag: '🇷🇸', countryCode: 'rs', sttCode: 'sr-RS', aiPrompt: 'Respond entirely in Serbian (Srpski). All text must be in Serbian.' },
  { code: 'fil', label: 'Filipino', nativeLabel: 'Filipino', flag: '🇵🇭', countryCode: 'ph', sttCode: 'fil-PH', aiPrompt: 'Respond entirely in Filipino (Tagalog). All text must be in Filipino.' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🇧🇩', countryCode: 'bd', sttCode: 'bn-BD', aiPrompt: 'Respond entirely in Bengali (বাংলা). All text must be in Bengali.' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', flag: '🇵🇰', countryCode: 'pk', sttCode: 'ur-PK', aiPrompt: 'Respond entirely in Urdu (اردو). All text must be in Urdu.' },
  { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili', flag: '🇰🇪', countryCode: 'ke', sttCode: 'sw-KE', aiPrompt: 'Respond entirely in Swahili (Kiswahili). All text must be in Swahili.' },
];

export function getLanguage(code: string): LanguageOption {
  return languages.find((l) => l.code === code) || languages[0];
}

/** Get flag image URL from flagcdn.com */
export function getFlagUrl(countryCode: string, size: number = 40): string {
  return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${countryCode}.png`;
}
