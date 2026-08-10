'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
const supportedLanguages = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const localeData = Object.fromEntries(supportedLanguages.map(language => [language, {
  strings: {},
  meta: {},
  services: null
}]));

const detectLanguage = async ({
  search = '',
  stored = null,
  browserLanguages = [],
  browserLanguage = '',
  forcedLanguage = ''
} = {}) => {
  let savedLanguage = stored;
  const location = new URL(`https://www.studio17.world/${search}`);
  const documentElement = {
    dataset: forcedLanguage ? { forceLanguage: forcedLanguage } : {},
    lang: 'en',
    dir: 'ltr'
  };
  const document = {
    documentElement,
    body: { classList: { contains: () => false } },
    createTreeWalker: () => ({ nextNode: () => null }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {}
  };
  const window = {
    Studio17LocaleData: localeData,
    dispatchEvent: () => {}
  };
  const context = {
    window,
    document,
    NodeFilter: { SHOW_TEXT: 4, FILTER_REJECT: 2, FILTER_ACCEPT: 1 },
    navigator: { languages: browserLanguages, language: browserLanguage },
    localStorage: {
      getItem: key => key === 'studio17-language' ? savedLanguage : null,
      setItem: (key, value) => { if (key === 'studio17-language') savedLanguage = value; }
    },
    location,
    history: { replaceState: () => {} },
    URL,
    URLSearchParams,
    CustomEvent: class CustomEvent {
      constructor(type, options) { this.type = type; this.detail = options?.detail; }
    },
    console
  };

  vm.runInNewContext(source, context, { filename: 'i18n.js' });
  await window.Studio17I18n.ready;
  return {
    language: window.Studio17I18n.getLanguage(),
    direction: documentElement.dir,
    savedLanguage
  };
};

(async () => {
  const regionalCases = [
    ['en-GB', 'en'],
    ['pt-BR', 'pt-PT'],
    ['pt_PT', 'pt-PT'],
    ['es-MX', 'es'],
    ['el-GR', 'el'],
    ['ru-RU', 'ru'],
    ['he-IL', 'he'],
    ['iw-IL', 'he']
  ];

  for (const [browserLanguage, expected] of regionalCases) {
    const result = await detectLanguage({ browserLanguage });
    assert.equal(result.language, expected, `${browserLanguage} should resolve to ${expected}`);
  }

  const preferenceList = await detectLanguage({
    browserLanguages: ['fr-FR', 'zh-CN', 'ru-RU'],
    browserLanguage: 'fr-FR'
  });
  assert.equal(preferenceList.language, 'ru', 'the first supported browser preference should be selected');

  const storedChoice = await detectLanguage({
    stored: 'el',
    browserLanguages: ['he-IL']
  });
  assert.equal(storedChoice.language, 'el', 'a saved choice should beat browser preferences');

  const addressChoice = await detectLanguage({
    search: '?lang=es-AR',
    stored: 'ru',
    browserLanguages: ['he-IL']
  });
  assert.equal(addressChoice.language, 'es', 'the URL language should beat saved and browser preferences');
  assert.equal(addressChoice.savedLanguage, 'es', 'an explicit URL language should become the saved choice');

  const forcedChoice = await detectLanguage({
    search: '?lang=he',
    stored: 'ru',
    browserLanguages: ['el-GR'],
    forcedLanguage: 'en'
  });
  assert.equal(forcedChoice.language, 'en', 'an English-only page should ignore other preferences');
  assert.equal(forcedChoice.savedLanguage, 'ru', 'an English-only page should not overwrite the saved website language');

  const hebrew = await detectLanguage({ browserLanguage: 'he-IL' });
  assert.equal(hebrew.direction, 'rtl', 'Hebrew should enable RTL layout');

  const unsupported = await detectLanguage({
    browserLanguages: ['fr-FR', 'de-DE'],
    browserLanguage: 'fr-FR'
  });
  assert.equal(unsupported.language, 'en', 'unsupported preferences should fall back to English');

  console.log('Language detection tests passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
