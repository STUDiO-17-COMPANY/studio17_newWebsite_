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

  const enhanceSeoCapabilities = () => {
    if (page !== 'seo') return;

    const grid = document.querySelector('.seo-capability-grid');
    if (!grid) return;

    grid.classList.add('is-interactive');
    [...grid.querySelectorAll(':scope > article')].forEach((card, index) => {
      const heading = card.querySelector('h3');
      const description = card.querySelector(':scope > p');
      const list = card.querySelector(':scope > ul');
      if (!heading || !description || !list) return;

      const titleId = `seo-capability-title-${index + 1}`;
      const detailId = `seo-capability-detail-${index + 1}`;
      card.tabIndex = capabilityDesktopQuery.matches ? 0 : -1;
      heading.id = titleId;

      const detail = document.createElement('div');
      detail.className = 'seo-capability-detail';
      detail.id = detailId;
      detail.append(description, list);

      const toggle = document.createElement('button');
      toggle.className = 'seo-capability-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', detailId);
      toggle.setAttribute('aria-labelledby', titleId);
      toggle.innerHTML = '<i data-lucide="chevron-down" aria-hidden="true"></i>';

      card.append(toggle, detail);
    });
  };

  const capabilityGrid = page === 'seo' ? document.querySelector('.seo-capability-grid') : null;
  const capabilityDesktopQuery = window.matchMedia('(min-width: 901px)');
  capabilityDesktopQuery.addEventListener?.('change', event => {
    capabilityGrid?.querySelectorAll(':scope > article').forEach(card => {
      card.tabIndex = event.matches ? 0 : -1;
      if (event.matches) {
        card.classList.remove('is-expanded');
        card.querySelector('.seo-capability-toggle')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  capabilityGrid?.addEventListener('click', event => {
    if (capabilityDesktopQuery.matches) return;

    const card = event.target.closest('article');
    if (!card || !capabilityGrid.contains(card)) return;

    const shouldExpand = !card.classList.contains('is-expanded');
    capabilityGrid.querySelectorAll(':scope > article').forEach(item => {
      const isExpanded = item === card && shouldExpand;
      item.classList.toggle('is-expanded', isExpanded);
      item.querySelector('.seo-capability-toggle')?.setAttribute('aria-expanded', String(isExpanded));
    });
  });

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
        const localPages = { '/': 'index.html', '/services': 'services.html', '/services/website-development': 'website-development.html', '/services/seo': 'seo.html', '/contact': 'contact.html', '/news': 'news.html' };
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
      if (language === 'en') {
        record.element.innerHTML = record.original;
        return;
      }
      const supplemental = page === 'seo' && record.key === 'faq' ? (locale?.faqIncluded || '') : '';
      record.element.innerHTML = `${supplemental}${locale?.[record.key] || record.original}`;
    });
    updateMetadata(language === 'en' ? englishMetadata : (locale?.meta || englishMetadata));
    updateInsertedLinks(language);
    enhanceSeoCapabilities();
    window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  };

  window.addEventListener('studio17:languagechange', event => render(event.detail.language));
  window.Studio17I18n?.ready.then(() => render(window.Studio17I18n.getLanguage())).catch(() => render('en'));
})();
