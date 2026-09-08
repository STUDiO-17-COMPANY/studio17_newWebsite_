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
      const isInitiallyExpanded = index === 0;
      card.tabIndex = capabilityDesktopQuery.matches ? 0 : -1;
      card.classList.toggle('is-expanded', isInitiallyExpanded);
      heading.id = titleId;

      const detail = document.createElement('div');
      detail.className = 'seo-capability-detail';
      detail.id = detailId;
      detail.append(description, list);

      const toggle = document.createElement('button');
      toggle.className = 'seo-capability-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', String(isInitiallyExpanded));
      toggle.setAttribute('aria-controls', detailId);
      toggle.setAttribute('aria-labelledby', titleId);
      toggle.innerHTML = '<i data-lucide="chevron-down" aria-hidden="true"></i>';

      card.append(toggle, detail);
    });
  };

  const enhanceWebsiteServices = () => {
    if (page !== 'websiteServices') return;
    const selector = document.querySelector('.website-service-selector');
    if (!selector) return;
    const buttons = [...selector.querySelectorAll('[data-website-service]')];
    const panels = [...selector.querySelectorAll('[data-website-service-panel]')];
    const select = selector.querySelector('[data-website-service-select]');
    const available = new Set(panels.map(panel => panel.dataset.websiteServicePanel));

    const activate = service => {
      const next = available.has(service) ? service : panels[0]?.dataset.websiteServicePanel;
      if (!next) return;
      buttons.forEach(button => {
        const active = button.dataset.websiteService === next;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.dataset.websiteServicePanel !== next; });
      if (select) select.value = next;
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button.dataset.websiteService));
      button.addEventListener('keydown', event => {
        if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[targetIndex]?.focus();
        activate(buttons[targetIndex]?.dataset.websiteService);
      });
    });
    select?.addEventListener('change', event => activate(event.target.value));
    activate(buttons.find(button => button.getAttribute('aria-selected') === 'true')?.dataset.websiteService || select?.value);
  };

  const capabilityGrid = page === 'seo' ? document.querySelector('.seo-capability-grid') : null;
  const capabilityDesktopQuery = window.matchMedia('(min-width: 901px)');
  capabilityDesktopQuery.addEventListener?.('change', event => {
    capabilityGrid?.querySelectorAll(':scope > article').forEach((card, index) => {
      card.tabIndex = event.matches ? 0 : -1;
      const isInitiallyExpanded = index === 0;
      card.classList.toggle('is-expanded', isInitiallyExpanded);
      card.querySelector('.seo-capability-toggle')?.setAttribute('aria-expanded', String(isInitiallyExpanded));
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
        const localPages = { '/': 'index.html', '/services': 'services.html', '/services/website': 'website-services.html', '/services/website-development': 'website-development.html', '/services/free-website': 'free-website.html', '/services/seo': 'seo.html', '/seo/cyprus': 'seo-cyprus.html', '/seo/limassol': 'seo-limassol.html', '/contact': 'contact.html', '/news': 'news.html', '/wip': 'wip.html' };
        const localPath = localPages[url.pathname] || url.pathname.replace(/^\//, '');
        link.setAttribute('href', `${localPath}${url.search}${url.hash}`);
      } else {
        link.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
      }
    });
  };

  const normaliseWebsiteFamilyCard = () => {
    if (page !== 'services') return;
    const card = document.querySelector('.service-family-grid .service-family-card');
    if (!card) return;
    card.setAttribute('href', '/services/website');
    const action = card.querySelector(':scope > span');
    if (action?.firstChild) action.firstChild.nodeValue = `${window.Studio17I18n?.translate?.('Explore website services') || 'Explore website services'} `;
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
    normaliseWebsiteFamilyCard();
    updateInsertedLinks(language);
    enhanceSeoCapabilities();
    enhanceWebsiteServices();
    window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  };

  window.addEventListener('studio17:languagechange', event => render(event.detail.language));
  window.Studio17I18n?.ready.then(() => render(window.Studio17I18n.getLanguage())).catch(() => render('en'));
})();
