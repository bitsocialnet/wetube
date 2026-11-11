import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import { ReplySummary } from '../reply-summary';

// The app's interpolation setting (src/lib/init-translations.ts), with the English string.
const i18n = createInstance();
await i18n.use(initReactI18next).init({
  lng: 'en',
  ns: ['default'],
  defaultNS: 'default',
  resources: { en: { default: { user_replied: '<bold>{{author}}</bold> replied: {{text}}' } } },
  interpolation: { escapeValue: false },
});

const render = (author: string, text: string) => renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(ReplySummary, { author, text })));

describe('ReplySummary', () => {
  it('bolds the author before the reply', () => {
    expect(render('Bob', 'great video')).toBe('<strong>Bob</strong> replied: great video');
  });

  it('keeps tags and entities in user text as text', () => {
    expect(render('<bold>x</bold>', '<0>hi</0> & <b>bye</b>')).toBe(
      '<strong>&lt;bold&gt;x&lt;/bold&gt;</strong> replied: &lt;0&gt;hi&lt;/0&gt; &amp; &lt;b&gt;bye&lt;/b&gt;',
    );
  });
});
