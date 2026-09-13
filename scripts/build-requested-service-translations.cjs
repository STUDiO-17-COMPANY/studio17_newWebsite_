'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const baseUrl = process.env.STUDIO17_TRANSLATION_URL || 'http://127.0.0.1:8084';
const outputFile = path.join(root, 'service-locales', 'requested-translations.js');
const delimiter = '\n|||S17|||\n';
const targets = [
  { route: '/services/website', page: 'websiteServices', languages: ['he'] },
  { route: '/services/seo', page: 'seo', languages: ['pt-PT', 'es', 'he'] },
  { route: '/seo/cyprus', page: 'seoCyprus', languages: ['he'] },
  { route: '/seo/limassol', page: 'seoLimassol', languages: ['he'] }
];
const googleLanguages = { 'pt-PT': 'pt', es: 'es', he: 'he' };

const translatedText = data => (data?.[0] || []).map(part => part?.[0] || '').join('');

function polishTranslation(language, value) {
  let text = value
    .replace(/Estúdio 17|Estudio 17|סטודיו 17/g, 'Studio 17')
    .replace(/וילה טרסי|טרסי וילה/g, 'Terrassi Villa')
    .replace(/אופטיקה PHÓS/g, 'PHÓS Optics');
  if (language === 'pt-PT') {
    text = text
      .replace(/\bdemandas?\b/gi, 'procura')
      .replace(/\bsites\b/gi, 'websites')
      .replace(/\bsite\b/gi, 'website')
      .replace(/\busuários\b/gi, 'utilizadores')
      .replace(/\busuário\b/gi, 'utilizador');
  }
  if (language === 'he') text = text.replace(/0 אירו/g, '€0');
  return text;
}

async function requestTranslation(strings, language) {
  const query = encodeURIComponent(strings.join(delimiter));
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${googleLanguages[language]}&dt=t&q=${query}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Translation request failed (${response.status})`);
  const result = translatedText(await response.json());
  const parts = result.split(/\s*\|\|\|S17\|\|\|\s*/);
  if (parts.length === strings.length) return parts.map(part => part.trim());
  if (strings.length === 1) return [result.trim()];
  const fallback = [];
  for (const string of strings) fallback.push(...await requestTranslation([string], language));
  return fallback;
}

async function translateStrings(strings, language) {
  const unique = [...new Set(strings)].filter(Boolean);
  const batches = [];
  let batch = [];
  let size = 0;
  for (const string of unique) {
    if (batch.length >= 18 || size + string.length > 2600) {
      batches.push(batch);
      batch = [];
      size = 0;
    }
    batch.push(string);
    size += string.length + delimiter.length;
  }
  if (batch.length) batches.push(batch);

  const translations = new Map();
  for (const group of batches) {
    const translated = await requestTranslation(group, language);
    group.forEach((source, index) => translations.set(source, polishTranslation(language, translated[index])));
  }
  return Object.fromEntries(translations);
}

async function extractPage(page) {
  return page.evaluate(() => {
    const records = [...document.querySelectorAll('[data-service-key]')].map(element => {
      const strings = [];
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const value = walker.currentNode.nodeValue.trim();
        if (value && !walker.currentNode.parentElement.closest('blockquote')) strings.push(value);
      }
      element.querySelectorAll('[alt], [aria-label], [title]').forEach(node => {
        for (const attribute of ['alt', 'aria-label', 'title']) {
          const value = node.getAttribute(attribute)?.trim();
          if (value) strings.push(value);
        }
      });
      return { key: element.dataset.serviceKey, strings };
    });
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      records,
      strings: [document.title, document.querySelector('meta[name="description"]')?.content || '', ...records.flatMap(record => record.strings)]
    };
  });
}

async function renderTranslatedRecords(page, dictionary) {
  return page.evaluate(translations => {
    const translateNode = root => {
      const clone = root.cloneNode(true);
      const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const source = node.nodeValue.trim();
        if (!source || node.parentElement.closest('blockquote') || !translations[source]) continue;
        const start = node.nodeValue.indexOf(source);
        node.nodeValue = `${node.nodeValue.slice(0, start)}${translations[source]}${node.nodeValue.slice(start + source.length)}`;
      }
      clone.querySelectorAll('[alt], [aria-label], [title]').forEach(node => {
        for (const attribute of ['alt', 'aria-label', 'title']) {
          const source = node.getAttribute(attribute)?.trim();
          if (source && translations[source]) node.setAttribute(attribute, translations[source]);
        }
      });
      return clone.innerHTML;
    };
    return Object.fromEntries([...document.querySelectorAll('[data-service-key]')].map(element => [element.dataset.serviceKey, translateNode(element)]));
  }, dictionary);
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const store = {};
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.route(/\.js(?:\?|$)/, route => route.abort());
    await page.addInitScript(() => {
      localStorage.setItem('studio17-language', 'en');
      localStorage.setItem('studio17-analytics-consent-v1', 'denied');
    });
    for (const target of targets) {
      await page.goto(`${baseUrl}${target.route}`, { waitUntil: 'domcontentloaded' });
      const source = await extractPage(page);
      for (const language of target.languages) {
        const dictionary = await translateStrings(source.strings, language);
        store[language] ||= {};
        store[language][target.page] = {
          meta: { title: dictionary[source.title], description: dictionary[source.description] },
          ...await renderTranslatedRecords(page, dictionary)
        };
      }
    }
  } finally {
    await browser.close();
  }

  const output = `/* Generated from the public English service pages by scripts/build-requested-service-translations.cjs. */\n(() => {\n  'use strict';\n  const additions = ${JSON.stringify(store, null, 2)};\n  window.Studio17ServiceLocaleData ||= {};\n  Object.entries(additions).forEach(([language, pages]) => {\n    window.Studio17ServiceLocaleData[language] ||= {};\n    Object.assign(window.Studio17ServiceLocaleData[language], pages);\n  });\n})();\n`;
  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`Wrote ${outputFile}`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
