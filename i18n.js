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
  const languageAliases = {
    en: 'en',
    pt: 'pt-PT',
    es: 'es',
    el: 'el',
    ru: 'ru',
    he: 'he',
    iw: 'he'
  };
  const languagePrefixes = { en: '', 'pt-PT': 'pt', es: 'es', el: 'el', ru: 'ru', he: 'he' };
  const prefixLanguages = { pt: 'pt-PT', es: 'es', el: 'el', ru: 'ru', he: 'he' };

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
    const candidate = String(value).trim().replace(/_/g, '-');
    if (!candidate) return null;
    const lower = candidate.toLowerCase();
    const exact = Object.keys(languages).find(language => language.toLowerCase() === lower);
    if (exact) return exact;
    return languageAliases[lower.split('-')[0]] || null;
  };

  const articleLanguages = Array.isArray(window.__STUDIO17_ARTICLE_LANGUAGES__) ? window.__STUDIO17_ARTICLE_LANGUAGES__ : [];
  const pageSupportedLanguages = (articleLanguages.length ? articleLanguages : (document.documentElement.dataset?.supportedLanguages || '').split(','))
    .map(language => normaliseLanguage(language))
    .filter(Boolean);
  const normalisePageLanguage = value => {
    const language = normaliseLanguage(value);
    if (!language) return null;
    return !pageSupportedLanguages.length || pageSupportedLanguages.includes(language) ? language : null;
  };
  if (articleLanguages.length) {
    document.querySelectorAll('.language-menu [data-lang]').forEach(control => {
      if (!pageSupportedLanguages.includes(normaliseLanguage(control.dataset.lang))) control.remove();
    });
  }

  const getBrowserLanguage = () => {
    if (typeof navigator === 'undefined') return null;
    const preferences = Array.from(navigator.languages || []);
    if (navigator.language && !preferences.includes(navigator.language)) preferences.push(navigator.language);
    for (const preference of preferences) {
      const supported = normalisePageLanguage(preference);
      if (supported) return supported;
    }
    return null;
  };

  const pathParts = location.pathname.split('/').filter(Boolean);
  const pathLanguage = prefixLanguages[pathParts[0]?.toLowerCase()] || null;
  const stripLanguagePrefix = pathname => {
    const parts = pathname.split('/').filter(Boolean);
    if (prefixLanguages[parts[0]?.toLowerCase()]) parts.shift();
    return parts.length ? `/${parts.join('/')}` : '/';
  };
  const supportedLocalesByPath = pathname => {
    const clean = stripLanguagePrefix(pathname).replace(/\/$/, '') || '/';
    if (['/work', '/careers', '/services/localization-and-translation', '/services/social-media', '/services/social-media-pricing'].includes(clean) || clean.startsWith('/careers/')) return ['en'];
    if (clean === '/services/website-pricing') return ['en', 'el', 'ru'];
    if (clean === '/seo/cyprus' || clean === '/seo/limassol') return ['en', 'el', 'ru', 'he'];
    return Object.keys(languages);
  };
  const languageAddress = (language, source = location.href) => {
    const selected = normaliseLanguage(language) || 'en';
    const url = new URL(source, location.origin);
    const clean = stripLanguagePrefix(url.pathname);
    const supported = supportedLocalesByPath(clean).includes(selected) ? selected : 'en';
    const prefix = languagePrefixes[supported];
    url.pathname = prefix ? `/${prefix}${clean === '/' ? '/' : clean}` : clean;
    url.searchParams.delete('lang');
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const forcedLanguage = normalisePageLanguage(document.documentElement.dataset?.forceLanguage);
  const queryLanguage = normaliseLanguage(new URLSearchParams(location.search).get('lang'));
  const renderedLanguage = normalisePageLanguage(document.documentElement.dataset?.renderedLanguage);
  const rawAddressLanguage = pathLanguage || queryLanguage || renderedLanguage;
  const addressLanguage = normalisePageLanguage(rawAddressLanguage);
  const unsupportedAddressLanguage = Boolean(rawAddressLanguage && !addressLanguage);
  const requestedLanguage = forcedLanguage
    || addressLanguage
    || normalisePageLanguage(getStoredLanguage())
    || getBrowserLanguage()
    || 'en';

  const captureTranslatableContent = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, noscript, .language-menu, [data-i18n-skip], [data-legal-key], [data-service-key]')) return NodeFilter.FILTER_REJECT;
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
        const localPages = { '/': 'home.template.html', '/sitemap': 'sitemap.html', '/wip': 'wip.html', '/contact': 'contact.html', '/faq': 'faq.html', '/about': 'about.html', '/our-story': 'our-story.html', '/team': 'team.html', '/work': 'work.html', '/news': 'news.template.html', '/careers': 'careers.html', '/services': 'services.html', '/services/website': 'website-services.html', '/services/website-development': 'website-development.html', '/services/free-website': 'free-website.html', '/services/seo': 'seo.html', '/services/localization-and-translation': 'localization-and-translation.html', '/privacy-policy': 'privacy-policy.html', '/cookie-policy': 'cookie-policy.html', '/terms': 'terms.html' };
        page = localPages[page] || page;
      }

      const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';
      const parameters = new URLSearchParams(query);
      const linkLanguage = normaliseLanguage(anchor.dataset.forceLanguage) || language;
      const cleanPage = stripLanguagePrefix(page);
      const isWipLink = cleanPage === '/wip' || cleanPage === 'wip.html';
      if (isWipLink) {
        parameters.delete('lang');
        anchor.relList.add('nofollow');
      }
      parameters.delete('lang');
      const supportedLanguage = supportedLocalesByPath(cleanPage).includes(linkLanguage) ? linkLanguage : 'en';
      const prefix = languagePrefixes[supportedLanguage];
      page = prefix ? `/${prefix}${cleanPage === '/' ? '/' : cleanPage}` : cleanPage;
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

    const page = document.body?.dataset?.legalPage || document.body?.dataset?.servicePage || (document.body.classList.contains('careers-page')
        ? 'careers'
      : document.body.classList.contains('career-role-page')
        ? 'careerRole'
        : document.body.classList.contains('contact-page')
          ? 'contact'
          : document.body.classList.contains('faq-page')
            ? 'faq'
            : document.body.classList.contains('about-page')
            ? 'about'
            : document.body.classList.contains('our-story-page')
              ? 'ourStory'
              : document.body.classList.contains('team-page')
              ? 'team'
            : document.body.classList.contains('work-page')
              ? 'work'
            : document.body.classList.contains('news-page')
              ? 'news'
            : document.body.classList.contains('article-page')
              ? 'article'
            : document.body.classList.contains('sitemap-page')
              ? 'sitemap'
              : document.body.classList.contains('wip-page') ? 'wip' : 'home');
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
    if (location.protocol === 'file:') return;
    const destination = languageAddress(forcedLanguage || language);
    if (`${location.pathname}${location.search}${location.hash}` !== destination) history.replaceState({}, '', destination);
  };

  const updateSeoMetadata = language => {
    if (document.body.classList.contains('article-page')) return;
    const canonical = document.querySelector('[data-seo-canonical]');
    const openGraphUrl = document.querySelector('[data-seo-og-url]');
    if (canonical && openGraphUrl) {
      openGraphUrl.content = canonical.href;
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

    const response = await fetch(`/locales/${languages[language].file}`);
    if (!response.ok) throw new Error(`Unable to load locale: ${language}`);
    return response.json();
  };

  const setLanguage = async (language, { updateAddress = true, persist = true } = {}) => {
    const normalised = forcedLanguage || normalisePageLanguage(language) || 'en';
    currentData = await loadLocale(normalised);
    currentLanguage = normalised;
    document.documentElement.lang = normalised;
    document.documentElement.dir = languages[normalised].dir;
    if (!forcedLanguage && persist) storeLanguage(normalised);
    applyTranslations();
    updateLanguageControl(normalised);
    updateInternalLinks(normalised);
    if (updateAddress) updateUrl(normalised);
    updateSeoMetadata(normalised);
    closeLanguageMenu();
    window.dispatchEvent(new CustomEvent('studio17:languagechange', { detail: { language: normalised, data: currentData } }));
    (window.queueMicrotask || (callback => Promise.resolve().then(callback)))(() => updateInternalLinks(normalised));
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
    const language = normalisePageLanguage(button.dataset.lang);
    if (!language) return;
    storeLanguage(language);
    if (location.protocol !== 'file:') {
      location.assign(button.dataset.languageUrl || languageAddress(language));
      return;
    }
    setLanguage(language).catch(() => closeLanguageMenu({ restoreFocus: true }));
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-language-switcher]')) return;
    closeLanguageMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && trigger?.getAttribute('aria-expanded') === 'true') closeLanguageMenu({ restoreFocus: true });
  });

  const shouldNormaliseAddress = Boolean(forcedLanguage || queryLanguage || unsupportedAddressLanguage);
  const preserveUnsupportedPreference = Boolean(pageSupportedLanguages.length && (unsupportedAddressLanguage || (getStoredLanguage() && !normalisePageLanguage(getStoredLanguage()))));
  const shouldNavigateToPreference = location.protocol !== 'file:' && !forcedLanguage && !pathLanguage && !queryLanguage && !document.documentElement.hasAttribute?.('data-server-localized') && requestedLanguage !== 'en';
  if (shouldNavigateToPreference && typeof location.replace === 'function') location.replace(languageAddress(requestedLanguage));
  const ready = setLanguage(requestedLanguage, { updateAddress: shouldNormaliseAddress, persist: !preserveUnsupportedPreference })
    .catch(() => setLanguage('en', { updateAddress: shouldNormaliseAddress, persist: !preserveUnsupportedPreference }));

  window.Studio17I18n = {
    languages: Object.keys(languages),
    ready,
    getData: () => currentData,
    getLanguage: () => currentLanguage,
    setLanguage,
    translate
  };
})();
