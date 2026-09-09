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
    const serviceSelect = selector.querySelector('[data-website-service-select]');
    const serviceNav = selector.querySelector('.website-service-nav');
    const serviceStage = selector.querySelector('.website-service-stage');
    const available = new Set(panels.map(panel => panel.dataset.websiteServicePanel));
    const groups = [
      { key: 'build', services: ['development', 'revamp', 'design'] },
      { key: 'visibility', services: ['seo', 'geo'] },
      { key: 'content', services: ['copywriting', 'localisation'] },
      { key: 'care', services: ['maintenance'] }
    ];
    const labels = {
      en: { build: 'Website build', visibility: 'Search visibility', content: 'Content & markets', care: 'Care & improvement', area: 'Website area', service: 'Website service' },
      el: { build: 'Κατασκευή ιστοσελίδας', visibility: 'Ορατότητα αναζήτησης', content: 'Περιεχόμενο & αγορές', care: 'Φροντίδα & βελτίωση', area: 'Τομέας ιστοσελίδας', service: 'Υπηρεσία ιστοσελίδας' },
      ru: { build: 'Создание сайта', visibility: 'Видимость в поиске', content: 'Контент и рынки', care: 'Поддержка и развитие', area: 'Направление', service: 'Услуга для сайта' }
    };
    const language = document.documentElement.lang || 'en';
    const copy = labels[language] || labels.en;
    const groupForService = service => groups.find(group => group.services.includes(service)) || groups[0];

    if (!serviceNav || !serviceStage || !serviceSelect) return;

    const tabs = document.createElement('div');
    tabs.className = 'website-service-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', copy.area);
    groups.forEach((group, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(index === 0));
      button.setAttribute('aria-controls', 'website-service-main');
      button.dataset.websiteServiceGroup = group.key;
      button.textContent = copy[group.key];
      tabs.append(button);
    });

    const categoryField = document.createElement('label');
    categoryField.className = 'website-service-mobile website-service-mobile-category';
    categoryField.innerHTML = `<span>${copy.area}</span><span><select data-website-service-group-select>${groups.map(group => `<option value="${group.key}">${copy[group.key]}</option>`).join('')}</select><i data-lucide="chevron-down" aria-hidden="true"></i></span>`;
    const serviceField = selector.querySelector('.website-service-mobile');
    serviceField?.classList.add('website-service-mobile-item');
    const serviceFieldLabel = serviceField?.querySelector(':scope > span:first-child');
    if (serviceFieldLabel) serviceFieldLabel.textContent = copy.service;
    const mobileFields = document.createElement('div');
    mobileFields.className = 'website-service-mobile-fields';
    mobileFields.append(categoryField);
    if (serviceField) mobileFields.append(serviceField);

    const main = document.createElement('div');
    main.className = 'website-service-main';
    main.id = 'website-service-main';
    main.append(serviceNav, serviceStage);
    selector.prepend(tabs, mobileFields);
    selector.append(main);

    const groupButtons = [...tabs.querySelectorAll('[data-website-service-group]')];
    const groupSelect = categoryField.querySelector('[data-website-service-group-select]');
    const navLabel = serviceNav.querySelector('p');

    const activateGroup = (groupKey, preferredService) => {
      const group = groups.find(item => item.key === groupKey) || groups[0];
      groupButtons.forEach(button => {
        const active = button.dataset.websiteServiceGroup === group.key;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      buttons.forEach(button => { button.hidden = !group.services.includes(button.dataset.websiteService); });
      [...serviceSelect.options].forEach(option => { option.hidden = !group.services.includes(option.value); });
      if (groupSelect) groupSelect.value = group.key;
      if (navLabel) navLabel.textContent = copy[group.key];
      const nextService = group.services.includes(preferredService) ? preferredService : group.services[0];
      activate(nextService, false);
    };

    const activate = (service, syncGroup = true) => {
      const next = available.has(service) ? service : panels[0]?.dataset.websiteServicePanel;
      if (!next) return;
      if (syncGroup) activateGroup(groupForService(next).key, next);
      buttons.forEach(button => {
        const active = button.dataset.websiteService === next;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.dataset.websiteServicePanel !== next; });
      serviceSelect.value = next;
    };

    panels.forEach((panel, index) => {
      panel.id = `website-service-panel-${panel.dataset.websiteServicePanel}`;
      panel.setAttribute('role', 'tabpanel');
      const button = buttons[index];
      if (!button) return;
      button.id = `website-service-tab-${button.dataset.websiteService}`;
      button.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', button.id);
    });

    buttons.forEach(button => {
      button.addEventListener('click', () => activate(button.dataset.websiteService));
      button.addEventListener('keydown', event => {
        if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const visibleButtons = buttons.filter(item => !item.hidden);
        const index = visibleButtons.indexOf(button);
        const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? visibleButtons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + visibleButtons.length) % visibleButtons.length;
        visibleButtons[targetIndex]?.focus();
        activate(visibleButtons[targetIndex]?.dataset.websiteService);
      });
    });
    groupButtons.forEach((button, index) => {
      button.addEventListener('click', () => activateGroup(button.dataset.websiteServiceGroup));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? groupButtons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + groupButtons.length) % groupButtons.length;
        groupButtons[targetIndex]?.focus();
        activateGroup(groupButtons[targetIndex]?.dataset.websiteServiceGroup);
      });
    });
    groupSelect?.addEventListener('change', event => activateGroup(event.target.value));
    serviceSelect.addEventListener('change', event => activate(event.target.value));
    const initialService = buttons.find(button => button.getAttribute('aria-selected') === 'true')?.dataset.websiteService || serviceSelect.value;
    activateGroup(groupForService(initialService).key, initialService);
  };

  const enhanceTwoColumnFaq = () => {
    document.querySelectorAll('.free-faq-columns, .website-services-faq .website-faq-list').forEach(list => {
      const details = [...list.querySelectorAll(':scope > details')];
      if (details.length < 2) return;
      const split = Math.ceil(details.length / 2);
      details.forEach((detail, index) => {
        detail.dataset.faqColumn = index < split ? 'left' : 'right';
        detail.addEventListener('toggle', () => {
          if (!detail.open) return;
          const column = detail.dataset.faqColumn;
          details.forEach(sibling => {
            if (sibling !== detail && sibling.dataset.faqColumn === column) sibling.open = false;
          });
        });
      });
    });
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
    enhanceTwoColumnFaq();
    window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  };

  window.addEventListener('studio17:languagechange', event => render(event.detail.language));
  window.Studio17I18n?.ready.then(() => render(window.Studio17I18n.getLanguage())).catch(() => render('en'));
})();
