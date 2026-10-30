'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const {
  DYNAMIC_TEMPLATES,
  STATIC_PAGES,
  localePrefix,
  localesForPath,
  localizedPath,
  supportsLocale
} = require('../server/_language-routing');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_ROOT = path.join(ROOT, '_localized');
const SITE_URL = 'https://www.studio17.world';
const LANGUAGE_LABELS = { en: 'EN', 'pt-PT': 'PT', es: 'ES', el: 'EL', ru: 'RU', he: 'HE' };
const DATA_SCRIPT = /^(?:locales\/locales|service-locales\/(?:locales|requested-translations|free-website|seo-locations|website-pricing|website-services|website-services-v2)|legal-locales\/locales)\.js$/;

const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const ensureDirectory = file => fs.mkdirSync(path.dirname(file), { recursive: true });

const loadDataForTemplate = source => {
  const sandbox = { window: {} };
  sandbox.window.window = sandbox.window;
  const context = vm.createContext(sandbox);
  const scripts = [...source.matchAll(/<script\b[^>]*\bsrc=["']\/?([^"']+)["'][^>]*><\/script>/gi)]
    .map(match => match[1].replace(/\\/g, '/'))
    .filter(file => DATA_SCRIPT.test(file));
  for (const file of [...new Set(scripts)]) vm.runInContext(read(file), context, { filename: file });
  return sandbox.window;
};

const walkText = (element, callback) => {
  for (const child of [...element.childNodes]) {
    if (child.nodeType === 3) callback(child);
    else if (child.nodeType === 1) walkText(child, callback);
  }
};

const applyGeneralTranslations = (document, data) => {
  const strings = data?.strings || {};
  const skipped = 'script, style, noscript, .language-menu, [data-i18n-skip], [data-legal-key], [data-service-key]';
  walkText(document.body, node => {
    const parent = node.parentElement;
    if (!parent || !node.nodeValue.trim() || parent.closest(skipped)) return;
    const match = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const translated = strings[match[2]];
    if (translated) node.nodeValue = `${match[1]}${translated}${match[3]}`;
  });
  document.querySelectorAll('[aria-label], [title], img[alt]').forEach(element => {
    if (element.closest('.language-menu, [data-i18n-skip]')) return;
    for (const attribute of ['aria-label', 'title', 'alt']) {
      const original = element.getAttribute(attribute);
      if (original && strings[original]) element.setAttribute(attribute, strings[original]);
    }
  });
};

const applyKeyedTranslations = (document, store, page, attribute) => {
  const data = store?.[page];
  if (!data) return null;
  document.querySelectorAll(`[${attribute}]`).forEach(element => {
    const key = element.getAttribute(attribute);
    if (data[key]) element.innerHTML = data[key];
  });
  if (page === 'websiteServices') {
    const process = document.querySelector('.website-services-process > .shell');
    const entryPaths = document.querySelector('.website-entry-paths > .shell');
    if (process && data.process) process.innerHTML = data.process;
    if (entryPaths && data.entryPaths) entryPaths.innerHTML = data.entryPaths;
  }
  return data.meta || null;
};

const makeRootRelative = value => {
  const text = String(value || '');
  if (!text || /^(?:\/|https?:|mailto:|tel:|#|data:|javascript:)/i.test(text)) return text;
  return `/${text.replace(/^\.\//, '')}`;
};

const localizeHref = (href, locale, forcedLocale) => {
  if (!href || !href.startsWith('/') || href.startsWith('//')) return href;
  const url = new URL(href, SITE_URL);
  const selected = forcedLocale || locale;
  const destination = supportsLocale(url.pathname, selected) ? localizedPath(url.pathname, selected) : url.pathname;
  return `${destination}${url.search}${url.hash}`;
};

const updateResourcesAndLinks = (document, locale) => {
  document.querySelectorAll('link[href], script[src], img[src], source[src], video[src]').forEach(element => {
    const attribute = element.hasAttribute('href') ? 'href' : 'src';
    if (element.matches('link[rel="canonical"], link[rel="alternate"]')) return;
    element.setAttribute(attribute, makeRootRelative(element.getAttribute(attribute)));
  });
  document.querySelectorAll('a[href]').forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (!href?.startsWith('/') || href.startsWith('//')) return;
    const forced = anchor.dataset.forceLanguage === 'en' ? 'en' : null;
    anchor.setAttribute('href', localizeHref(href, locale, forced));
    if (href.startsWith('/wip')) {
      const rel = new Set(String(anchor.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('nofollow');
      anchor.setAttribute('rel', [...rel].join(' '));
    }
  });
  document.querySelectorAll('form[action^="/"]').forEach(form => {
    form.setAttribute('action', localizeHref(form.getAttribute('action'), locale));
  });
};

const setHeadMetadata = (document, { route, locale, pageLocales, metadata, dynamic }) => {
  const html = document.documentElement;
  html.lang = locale;
  html.dir = locale === 'he' ? 'rtl' : 'ltr';
  html.setAttribute('data-server-localized', '');
  html.setAttribute('data-rendered-language', locale);
  html.setAttribute('data-supported-languages', pageLocales.join(','));

  if (metadata?.title) document.title = metadata.title;
  if (metadata?.description) document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);

  if (!dynamic || route === '/') {
    const canonicalPath = localizedPath(route, locale);
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
    canonical.setAttribute('data-seo-canonical', '');
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    [...document.querySelectorAll('link[rel="alternate"][hreflang]')].forEach(element => element.remove());
    const alternates = [
      ['x-default', `${SITE_URL}${localizedPath(route, 'en')}`],
      ...pageLocales.map(language => [language, `${SITE_URL}${localizedPath(route, language)}`])
    ];
    for (const [hreflang, href] of alternates) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = href;
      canonical.after(link);
    }
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        data.url = canonicalUrl;
        data.inLanguage = locale;
        script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
      } catch { /* Existing invalid/placeholder structured data is left untouched. */ }
    });
  }

  [...document.querySelectorAll('.language-menu [data-lang]')].forEach(control => {
    const language = control.dataset.lang;
    if (!pageLocales.includes(language)) {
      control.remove();
      return;
    }
    if (route === '/article') control.removeAttribute('data-language-url');
    else control.setAttribute('data-language-url', localizedPath(route, language));
    if (language === locale) control.setAttribute('aria-current', 'true');
    else control.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-language-code]').forEach(element => { element.textContent = LANGUAGE_LABELS[locale]; });
};

const render = (definition, locale, dynamic = false) => {
  const source = read(definition.source);
  const stores = loadDataForTemplate(source);
  const { document } = parseHTML(source);
  document.querySelectorAll('.testimonial-card > p').forEach(quote => {
    quote.setAttribute('data-review-original', quote.textContent);
    quote.setAttribute('data-review-language', 'en');
  });
  const general = stores.Studio17LocaleData?.[locale] || {};
  applyGeneralTranslations(document, general);
  const yiannos = document.querySelector('[data-review="yiannos"] > p');
  if (yiannos) {
    const translations = require('../locales/yiannos-review.json');
    yiannos.setAttribute('data-review-original', translations.el);
    yiannos.setAttribute('data-review-language', 'el');
    if (translations[locale]) yiannos.textContent = translations[locale];
  }
  const serviceMeta = applyKeyedTranslations(document, stores.Studio17ServiceLocaleData?.[locale], definition.page, 'data-service-key');
  const legalMeta = applyKeyedTranslations(document, stores.Studio17LegalLocaleData?.[locale], definition.page, 'data-legal-key');
  const metadata = serviceMeta || legalMeta || general.meta?.[definition.page] || null;
  updateResourcesAndLinks(document, locale);
  setHeadMetadata(document, { route: definition.route, locale, pageLocales: definition.locales, metadata, dynamic });
  return `<!doctype html>\n${document.toString()}`;
};

fs.rmSync(OUTPUT_ROOT, { recursive: true, force: true });
for (const definition of STATIC_PAGES) {
  for (const locale of definition.locales.filter(language => language !== 'en')) {
    const prefix = localePrefix(locale);
    const output = path.join(OUTPUT_ROOT, prefix, `${definition.route.replace(/^\//, '')}.html`);
    ensureDirectory(output);
    fs.writeFileSync(output, render(definition, locale));
  }
}
for (const definition of DYNAMIC_TEMPLATES) {
  for (const locale of definition.locales.filter(language => language !== 'en')) {
    const output = path.join(OUTPUT_ROOT, localePrefix(locale), definition.output);
    ensureDirectory(output);
    fs.writeFileSync(output, render(definition, locale, true));
  }
}

console.log(`Generated localized HTML in ${path.relative(ROOT, OUTPUT_ROOT)}.`);
