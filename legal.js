(() => {
  'use strict';

  const page = document.body.dataset.legalPage;
  if (!page) return;

  const records = [...document.querySelectorAll('[data-legal-key]')].map(element => ({
    element,
    key: element.dataset.legalKey,
    original: element.innerHTML
  }));
  const englishMetadata = {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || ''
  };

  const localHref = (href, language) => {
    if (!href?.startsWith('/') || language === 'en') return href;
    const url = new URL(href, location.origin);
    url.searchParams.set('lang', language);
    return `${url.pathname}${url.search}${url.hash}`;
  };

  const updateLocalLinks = language => {
    document.querySelectorAll('.legal-document a[href^="/"]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.origin);
      url.searchParams.delete('lang');
      link.setAttribute('href', localHref(`${url.pathname}${url.search}${url.hash}`, language));
    });
  };

  const updateMetadata = metadata => {
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description);
  };

  const render = language => {
    const locale = window.Studio17LegalLocaleData?.[language]?.[page];
    records.forEach(record => {
      record.element.innerHTML = language === 'en' ? record.original : (locale?.[record.key] || record.original);
    });
    updateMetadata(language === 'en' ? englishMetadata : (locale?.meta || englishMetadata));
    updateLocalLinks(language);
    document.querySelectorAll('[data-open-analytics-settings]').forEach(button => {
      button.onclick = () => window.Studio17Analytics?.openSettings();
    });
    window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  };

  document.addEventListener('click', event => {
    if (!event.target.closest('[data-open-analytics-settings]')) return;
    window.Studio17Analytics?.openSettings();
  });
  window.addEventListener('studio17:languagechange', event => render(event.detail.language));
  window.Studio17I18n?.ready.then(() => render(window.Studio17I18n.getLanguage())).catch(() => render('en'));
})();
