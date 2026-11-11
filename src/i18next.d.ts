import type en from '../public/translations/en/default.json';

// Type-checks translation keys against the English locale, so a missing or misspelled key fails `tsc`.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'default';
    resources: { default: typeof en };
  }
}
