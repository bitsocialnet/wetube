// The interface languages. Each has a locale file at public/translations/<code>/default.json; English
// ships with the app and is every language's fallback.
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'wetube:language';
export const TRANSLATIONS_NAMESPACE = 'default';
export const TRANSLATIONS_LOAD_PATH = './translations/{{lng}}/{{ns}}.json';

/** Each interface language and its name in that language, as YouTube's language menu lists it. */
const LANGUAGE_NAMES = {
  ar: 'العربية',
  bn: 'বাংলা',
  cs: 'Čeština',
  da: 'Dansk',
  de: 'Deutsch',
  el: 'Ελληνικά',
  en: 'English',
  es: 'Español',
  fa: 'فارسی',
  fi: 'Suomi',
  fil: 'Filipino',
  fr: 'Français',
  he: 'עברית',
  hi: 'हिन्दी',
  hu: 'Magyar',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  mr: 'मराठी',
  nl: 'Nederlands',
  no: 'Norsk',
  pl: 'Polski',
  pt: 'Português (Brasil)',
  ro: 'Română',
  ru: 'Русский',
  sq: 'Shqip',
  sv: 'Svenska',
  te: 'తెలుగు',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  ur: 'اردو',
  vi: 'Tiếng Việt',
  zh: '中文（简体）',
} as const;

type Language = keyof typeof LANGUAGE_NAMES;

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_NAMES) as Language[];

export const getLanguageName = (language: string) => (Object.hasOwn(LANGUAGE_NAMES, language) ? LANGUAGE_NAMES[language as Language] : language);

/** Remembers the viewer's choice; until they choose, the browser's language is used. */
export const saveLanguage = (language: string) => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Not persisted; the choice still applies to this page.
  }
};
