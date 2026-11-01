const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const { renderArticleMain, getArticlePath } = require('../server/_article-render');
const demo = require('../article-demo.cjs');
const { localizedPath } = require('../server/_language-routing');
const script = fs.readFileSync(require.resolve('../i18n.js'), 'utf8');
const updateLinks = script.slice(script.indexOf('  const updateInternalLinks ='), script.indexOf('  const applyTranslations ='));
const locales = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const article = { ...demo, availableLanguages: locales };
for (const current of locales) {
  const { document } = parseHTML(renderArticleMain({ ...article, locale: current }));
  vm.runInNewContext(`${updateLinks}\nupdateInternalLinks(current); updateInternalLinks(current);`, {
    document, current, URLSearchParams, location: { protocol: 'https:' },
    normaliseLanguage: value => locales.includes(value) ? value : null,
    stripLanguagePrefix: value => value.replace(/^\/(pt|es|el|ru|he)(?=\/)/, ''),
    supportedLocalesByPath: () => locales,
    languagePrefixes: { en: '', 'pt-PT': 'pt', es: 'es', el: 'el', ru: 'ru', he: 'he' }
  });
  const links = document.querySelectorAll('.article-language-status a');
  assert.equal(links.length, 6);
  for (const link of links) {
    assert.equal(link.getAttribute('href'), getArticlePath(article, link.hreflang || link.getAttribute('hreflang')));
  }
}
assert.doesNotMatch(fs.readFileSync(require.resolve('../article.js'), 'utf8'), /searchParams\.set\('lang'/);
console.log('All six article language destinations survive repeated link localisation.');
