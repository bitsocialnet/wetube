import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from '../../public/translations/en/default.json';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, normalizeLanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS_LOAD_PATH, TRANSLATIONS_NAMESPACE } from './languages';

// <html lang dir> follow the language the strings are in, for screen readers, hyphenation, CJK fonts and
// right-to-left layout. That is English when the chosen language's file failed to load.
i18next.on('languageChanged', () => {
  const language = i18next.resolvedLanguage ?? DEFAULT_LANGUAGE;
  document.documentElement.lang = language;
  document.documentElement.dir = i18next.dir(language);
});

/**
 * Resolves once the interface strings are ready; main.tsx renders after it. English ships with the app;
 * any other language loads from public/translations, and falls back to English if that request fails.
 */
export const translationsReady = i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    // The saved choice, else the browser's language. Only an explicit choice is saved (saveLanguage), so a
    // viewer who never picks one keeps following their browser.
    detection: { order: ['localStorage', 'navigator'], lookupLocalStorage: LANGUAGE_STORAGE_KEY, caches: [], convertDetectedLanguage: normalizeLanguageCode },
    ns: [TRANSLATIONS_NAMESPACE],
    defaultNS: TRANSLATIONS_NAMESPACE,
    resources: { [DEFAULT_LANGUAGE]: { [TRANSLATIONS_NAMESPACE]: en } },
    partialBundledLanguages: true,
    backend: { loadPath: TRANSLATIONS_LOAD_PATH },
    // React escapes text that t() returns; i18next escaping would show "&amp;" in names and error messages.
    // <Trans> parses tags after interpolating, so a Trans with user text in its values escapes them itself.
    interpolation: { escapeValue: false },
  });
