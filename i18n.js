(() => {
  'use strict';

  const languages = {
    en: { file: 'en.json', code: 'EN', dir: 'ltr' },
    'pt-PT': { file: 'pt-PT.json', code: 'PT', dir: 'ltr' },
    es: { file: 'es.json', code: 'ES', dir: 'ltr' },
    el: { file: 'el.json', code: 'EL', dir: 'ltr' },
    ru: { file: 'ru.json', code: 'RU', dir: 'ltr' },
    he: { file: 'he.json', code: 'HE', dir: 'rtl' }
  };

  const textRecords = [];
  const attributeRecords = [];
  let currentLanguage = 'en';
  let currentData = { strings: {}, services: null };

  const getStoredLanguage = () => {
    try { return localStorage.getItem('studio17-language'); } catch { return null; }
  };

  const storeLanguage = language => {
    try { localStorage.setItem('studio17-language', language); } catch { /* Storage can be unavailable in private contexts. */ }
  };

  const normaliseLanguage = value => {
    if (!value) return null;
    if (languages[value]) return value;
    const lower = value.toLowerCase();
    if (lower === 'pt' || lower === 'pt-pt') return 'pt-PT';
    if (lower === 'es' || lower.startsWith('es-')) return 'es';
    return Object.keys(languages).find(language => language.toLowerCase() === lower) || null;
  };

  const forcedLanguage = normaliseLanguage(document.documentElement.dataset.forceLanguage);
  const requestedLanguage = forcedLanguage
    || normaliseLanguage(new URLSearchParams(location.search).get('lang'))
    || normaliseLanguage(getStoredLanguage())
    || normaliseLanguage(navigator.language)
    || 'en';

  const captureTranslatableContent = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, noscript, .language-menu, [data-i18n-skip]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let node;
    while ((node = walker.nextNode())) {
      const match = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
      textRecords.push({ node, before: match[1], original: match[2], after: match[3] });
    }

    document.querySelectorAll('[aria-label], [title], img[alt]').forEach(element => {
      if (element.closest('.language-menu, [data-i18n-skip]')) return;
      ['aria-label', 'title', 'alt'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        attributeRecords.push({ element, attribute, original: element.getAttribute(attribute) });
      });
    });
  };

  const translate = original => currentData.strings?.[original] || original;

  const updateInternalLinks = language => {
    document.querySelectorAll('a[href]').forEach(anchor => {
      const raw = anchor.getAttribute('href');
      if (!raw || /^(?:#|mailto:|tel:|https?:|javascript:)/i.test(raw)) return;

      const hashIndex = raw.indexOf('#');
      const hash = hashIndex >= 0 ? raw.slice(hashIndex) : '';
      const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
      const queryIndex = withoutHash.indexOf('?');
      let page = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
      if (!page || /\.[a-z0-9]+$/i.test(page)) return;

      if (location.protocol === 'file:') {
        const localPages = { '/': 'index.html', '/sitemap': 'sitemap.html', '/wip': 'wip.html', '/careers': 'careers.html' };
        page = localPages[page] || page;
      }

      const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';
      const parameters = new URLSearchParams(query);
      const linkLanguage = normaliseLanguage(anchor.dataset.forceLanguage) || language;
      if (linkLanguage === 'en') parameters.delete('lang');
      else parameters.set('lang', linkLanguage);
      const serialized = parameters.toString();
      anchor.setAttribute('href', `${page}${serialized ? `?${serialized}` : ''}${hash}`);
    });
  };

  const applyTranslations = () => {
    textRecords.forEach(record => {
      if (!record.node.isConnected) return;
      record.node.nodeValue = `${record.before}${translate(record.original)}${record.after}`;
    });

    attributeRecords.forEach(record => {
      if (!record.element.isConnected) return;
      record.element.setAttribute(record.attribute, translate(record.original));
    });

    const page = document.body.classList.contains('careers-page')
      ? 'careers'
      : document.body.classList.contains('career-role-page')
        ? 'careerRole'
        : document.body.classList.contains('contact-page')
          ? 'contact'
          : document.body.classList.contains('sitemap-page')
            ? 'sitemap'
            : document.body.classList.contains('wip-page') ? 'wip' : 'home';
    const metadata = currentData.meta?.[page];
    if (metadata?.title) document.title = metadata.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && metadata?.description) description.setAttribute('content', metadata.description);
  };

  const closeLanguageMenu = ({ restoreFocus = false } = {}) => {
    const trigger = document.querySelector('.language-control');
    const menu = document.querySelector('.language-menu');
    if (!trigger || !menu) return;
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    if (restoreFocus) trigger.focus();
  };

  const updateLanguageControl = language => {
    const config = languages[language];
    document.querySelectorAll('[data-language-code]').forEach(element => { element.textContent = config.code; });
    document.querySelectorAll('[data-lang]').forEach(button => {
      if (button.dataset.lang === language) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  };

  const updateUrl = language => {
    const url = new URL(location.href);
    if (forcedLanguage === 'en') url.searchParams.delete('lang');
    else if (forcedLanguage) url.searchParams.set('lang', forcedLanguage);
    else if (language === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', language);
    history.replaceState({}, '', url);
  };

  const updateSeoMetadata = language => {
    const canonical = document.querySelector('[data-seo-canonical]');
    const openGraphUrl = document.querySelector('[data-seo-og-url]');
    if (canonical) {
      const url = new URL(location.href);
      url.hash = '';
      [...url.searchParams.keys()].forEach(key => {
        if (key !== 'lang') url.searchParams.delete(key);
      });
      if (language === 'en') url.searchParams.delete('lang');
      else url.searchParams.set('lang', language);
      canonical.href = url.href;
      if (openGraphUrl) openGraphUrl.content = url.href;
    }

    const description = document.querySelector('meta[name="description"]')?.content || '';
    const title = document.title;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
  };

  const loadLocale = async language => {
    const bundled = window.Studio17LocaleData?.[language];
    if (bundled) return bundled;

    const response = await fetch(`locales/${languages[language].file}`);
    if (!response.ok) throw new Error(`Unable to load locale: ${language}`);
    return response.json();
  };

  const setLanguage = async (language, { updateAddress = true } = {}) => {
    const normalised = forcedLanguage || normaliseLanguage(language) || 'en';
    currentData = await loadLocale(normalised);
    currentLanguage = normalised;
    document.documentElement.lang = normalised;
    document.documentElement.dir = languages[normalised].dir;
    if (!forcedLanguage) storeLanguage(normalised);
    applyTranslations();
    updateLanguageControl(normalised);
    updateInternalLinks(normalised);
    if (updateAddress) updateUrl(normalised);
    updateSeoMetadata(normalised);
    closeLanguageMenu();
    window.dispatchEvent(new CustomEvent('studio17:languagechange', { detail: { language: normalised, data: currentData } }));
    return currentData;
  };

  captureTranslatableContent();

  const trigger = document.querySelector('.language-control');
  const menu = document.querySelector('.language-menu');

  trigger?.addEventListener('click', () => {
    const opening = trigger.getAttribute('aria-expanded') !== 'true';
    trigger.setAttribute('aria-expanded', String(opening));
    menu.hidden = !opening;
    if (opening) menu.querySelector(`[data-lang="${currentLanguage}"]`)?.focus();
  });

  menu?.addEventListener('click', event => {
    const button = event.target.closest('[data-lang]');
    if (!button) return;
    setLanguage(button.dataset.lang).catch(() => closeLanguageMenu({ restoreFocus: true }));
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-language-switcher]')) return;
    closeLanguageMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && trigger?.getAttribute('aria-expanded') === 'true') closeLanguageMenu({ restoreFocus: true });
  });

  const ready = setLanguage(requestedLanguage, { updateAddress: Boolean(forcedLanguage) })
    .catch(() => setLanguage('en', { updateAddress: Boolean(forcedLanguage) }));

  window.Studio17I18n = {
    languages: Object.keys(languages),
    ready,
    getData: () => currentData,
    getLanguage: () => currentLanguage,
    setLanguage,
    translate
  };
})();
