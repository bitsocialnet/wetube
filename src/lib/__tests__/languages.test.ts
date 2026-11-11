import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { normalizeLanguageCode, SUPPORTED_LANGUAGES } from '../languages';

const translationsRoot = new URL('../../../public/translations/', import.meta.url);
const readLocale = (language: string): Record<string, string> => JSON.parse(readFileSync(new URL(`${language}/default.json`, translationsRoot), 'utf8'));
// {{placeholders}} and <tags>, which every translation must keep.
const tokens = (value: string) => (value.match(/\{\{[^}]+\}\}|<\/?[a-zA-Z]+>/g) ?? []).sort();

describe('interface languages', () => {
  const english = readLocale('en');

  it('has a locale file for every supported language and no others', () => {
    const directories = readdirSync(translationsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
    expect(directories.map((entry) => entry.name).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
  });

  it.each(SUPPORTED_LANGUAGES.filter((language) => language !== 'en'))('%s translates every key and keeps its placeholders', (language) => {
    const locale = readLocale(language);
    expect(Object.keys(locale).sort()).toEqual(Object.keys(english).sort());
    for (const [key, value] of Object.entries(english)) {
      expect(locale[key], `${language}.${key}`).toBeTruthy();
      expect(tokens(locale[key] ?? ''), `${language}.${key}`).toEqual(tokens(value));
    }
  });
});

describe('normalizeLanguageCode', () => {
  it('maps the codes browsers use for Norwegian, Filipino and Hebrew to ours', () => {
    expect(normalizeLanguageCode('nb-NO')).toBe('no');
    expect(normalizeLanguageCode('nn')).toBe('no');
    expect(normalizeLanguageCode('tl')).toBe('fil');
    expect(normalizeLanguageCode('iw')).toBe('he');
  });
  it('leaves other codes for i18next to match', () => {
    expect(normalizeLanguageCode('pt-BR')).toBe('pt-BR');
    expect(normalizeLanguageCode('de')).toBe('de');
  });
});
