// ─── 30-Language Registry ───

export interface LanguageConfig {
  code: string
  name: string
  nativeName: string
  dir: 'ltr' | 'rtl'
  fontFamily?: string
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', dir: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', fontFamily: 'Noto Sans JP' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', dir: 'ltr', fontFamily: 'Noto Sans SC' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)', dir: 'ltr', fontFamily: 'Noto Sans TC' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', fontFamily: 'Noto Sans KR' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', fontFamily: 'Noto Sans Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', fontFamily: 'Noto Sans Bengali' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', fontFamily: 'Noto Sans Arabic' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl', fontFamily: 'Noto Sans Arabic' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', fontFamily: 'Noto Sans Arabic' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl', fontFamily: 'Noto Sans Hebrew' },
  { code: 'arz', name: 'Egyptian Arabic', nativeName: 'مصرى', dir: 'rtl', fontFamily: 'Noto Sans Arabic' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', dir: 'ltr', fontFamily: 'Noto Sans Thai' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', dir: 'ltr' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', dir: 'ltr' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', fontFamily: 'Noto Sans Gurmukhi' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', fontFamily: 'Noto Sans Tamil' }
]

const languageMap = new Map(LANGUAGES.map((l) => [l.code, l]))

export function getLanguage(code: string): LanguageConfig | undefined {
  return languageMap.get(code)
}

export function isRTL(code: string): boolean {
  return languageMap.get(code)?.dir === 'rtl'
}

export function getFontUrl(code: string): string | null {
  const lang = languageMap.get(code)
  if (!lang?.fontFamily) return null
  const family = lang.fontFamily.replace(/ /g, '+')
  return `https://fonts.googleapis.com/css2?family=${family}&display=swap`
}
