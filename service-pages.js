(() => {
  'use strict';

  const page = document.body.dataset.servicePage;
  if (!page) return;

  const records = [...document.querySelectorAll('[data-service-key]')].map(element => ({
    element,
    key: element.dataset.serviceKey,
    original: element.innerHTML
  }));
  const englishMetadata = {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || ''
  };

  const updateMetadata = metadata => {
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description);
  };

  const updateInsertedLinks = language => {
    document.querySelectorAll('[data-service-key] a[href^="/"]').forEach(link => {
      const raw = link.getAttribute('href');
      const url = new URL(raw, location.origin);
      url.searchParams.delete('lang');
      if (language !== 'en') url.searchParams.set('lang', language);
      if (location.protocol === 'file:') {
        const localPages = { '/': 'index.html', '/services': 'services.html', '/services/website-development': 'website-development.html', '/contact': 'contact.html', '/news': 'news.html' };
        const localPath = localPages[url.pathname] || url.pathname.replace(/^\//, '');
        link.setAttribute('href', `${localPath}${url.search}${url.hash}`);
      } else {
        link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
      }
    });
  };

  const render = language => {
    const locale = window.Studio17ServiceLocaleData?.[language]?.[page];
    records.forEach(record => {
      record.element.innerHTML = language === 'en' ? record.original : (locale?.[record.key] || record.original);
    });
    updateMetadata(language === 'en' ? englishMetadata : (locale?.meta || englishMetadata));
    updateInsertedLinks(language);
    window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  };

  window.addEventListener('studio17:languagechange', event => render(event.detail.language));
  window.Studio17I18n?.ready.then(() => render(window.Studio17I18n.getLanguage())).catch(() => render('en'));
})();
