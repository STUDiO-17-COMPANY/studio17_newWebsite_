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
  let seoVisibilityObserver = null;
  let seoProofCarouselCleanup = null;

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
      en: { build: 'Website build', visibility: 'Search visibility', content: 'Content & markets', care: 'Care & improvement', area: 'Website area', service: 'Website service', sales: 'Talk to sales', explore: 'Explore service', previous: 'Previous website service', next: 'Next website service' },
      'pt-PT': { build: 'Construção de website', visibility: 'Visibilidade na pesquisa', content: 'Conteúdo e mercados', care: 'Manutenção e melhoria', area: 'Área do website', service: 'Serviço de website', sales: 'Falar com vendas', explore: 'Explorar serviço', previous: 'Serviço anterior', next: 'Serviço seguinte' },
      es: { build: 'Creación web', visibility: 'Visibilidad en buscadores', content: 'Contenido y mercados', care: 'Mantenimiento y mejora', area: 'Área del sitio web', service: 'Servicio web', sales: 'Hablar con ventas', explore: 'Explorar servicio', previous: 'Servicio anterior', next: 'Servicio siguiente' },
      el: { build: 'Κατασκευή ιστοσελίδας', visibility: 'Ορατότητα αναζήτησης', content: 'Περιεχόμενο & αγορές', care: 'Φροντίδα & βελτίωση', area: 'Τομέας ιστοσελίδας', service: 'Υπηρεσία ιστοσελίδας', sales: 'Μιλήστε με τις πωλήσεις', explore: 'Δείτε την υπηρεσία', previous: 'Προηγούμενη υπηρεσία ιστοσελίδας', next: 'Επόμενη υπηρεσία ιστοσελίδας' },
      ru: { build: 'Создание сайта', visibility: 'Видимость в поиске', content: 'Контент и рынки', care: 'Поддержка и развитие', area: 'Направление', service: 'Услуга для сайта', sales: 'Связаться с отделом продаж', explore: 'Смотреть услугу', previous: 'Предыдущая услуга для сайта', next: 'Следующая услуга для сайта' }
    };
    const language = document.documentElement.lang || 'en';
    const copy = labels[language] || labels.en;
    const groupForService = service => groups.find(group => group.services.includes(service)) || groups[0];

    if (!serviceNav || !serviceStage || !serviceSelect) return;

    selector.classList.add('service-panel', 'website-service-panel');
    const tabs = document.createElement('div');
    tabs.className = 'service-tabs website-service-tabs';
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
    categoryField.className = 'service-mobile-field website-service-mobile website-service-mobile-category';
    categoryField.innerHTML = `<span>${copy.area}</span><span><select data-website-service-group-select>${groups.map(group => `<option value="${group.key}">${copy[group.key]}</option>`).join('')}</select><i data-lucide="chevron-down" aria-hidden="true"></i></span>`;
    categoryField.querySelector(':scope > span:last-child')?.classList.add('service-mobile-select-control');
    const serviceField = selector.querySelector('.website-service-mobile');
    serviceField?.classList.add('service-mobile-field', 'website-service-mobile-item');
    serviceField?.querySelector(':scope > span:last-child')?.classList.add('service-mobile-select-control');
    const serviceFieldLabel = serviceField?.querySelector(':scope > span:first-child');
    if (serviceFieldLabel) serviceFieldLabel.textContent = copy.service;
    const mobileFields = document.createElement('div');
    mobileFields.className = 'service-mobile-selector website-service-mobile-fields';
    mobileFields.append(categoryField);
    if (serviceField) mobileFields.append(serviceField);

    const main = document.createElement('div');
    main.className = 'service-main website-service-main';
    main.id = 'website-service-main';
    serviceNav.classList.add('industry-list');
    serviceNav.querySelector('p')?.setAttribute('hidden', '');

    const feature = document.createElement('article');
    feature.className = 'service-feature website-service-feature';
    feature.innerHTML = '<div class="service-photo" aria-hidden="true"><img src="/Images/Showcase1.webp" alt="" data-website-feature-image></div><div class="service-gradient" aria-hidden="true"></div><div class="service-copy"><p class="website-service-kicker" data-website-feature-kicker></p><h3 data-website-feature-title></h3><p data-website-feature-body></p><p class="service-result" data-website-feature-result></p></div><button class="image-control image-control-left" type="button" data-website-service-prev><i data-lucide="chevron-left" aria-hidden="true"></i></button><button class="image-control image-control-right" type="button" data-website-service-next><i data-lucide="chevron-right" aria-hidden="true"></i></button><div class="service-bottom-links"><a class="design-link design-link-dark" data-website-feature-primary href="#"></a><a class="design-link design-link-dark" data-website-feature-sales href="/contact?service=website">Talk to sales <span aria-hidden="true"><i data-lucide="arrow-up-right"></i></span></a></div><a class="case-link" data-website-feature-overlay href="#"><span class="website-feature-overlay-text" data-website-feature-overlay-label></span><span aria-hidden="true"><i data-lucide="arrow-up-right"></i></span></a>';
    serviceStage.hidden = true;
    serviceStage.classList.add('website-service-templates');
    main.append(serviceNav, feature);
    selector.prepend(tabs, mobileFields);
    selector.append(main, serviceStage);

    const groupButtons = [...tabs.querySelectorAll('[data-website-service-group]')];
    const groupSelect = categoryField.querySelector('[data-website-service-group-select]');
    const navLabel = serviceNav.querySelector('p');
    const featureImage = feature.querySelector('[data-website-feature-image]');
    const featureKicker = feature.querySelector('[data-website-feature-kicker]');
    const featureTitle = feature.querySelector('[data-website-feature-title]');
    const featureBody = feature.querySelector('[data-website-feature-body]');
    const featureResult = feature.querySelector('[data-website-feature-result]');
    const featurePrimary = feature.querySelector('[data-website-feature-primary]');
    const featureOverlay = feature.querySelector('[data-website-feature-overlay]');
    const featureSales = feature.querySelector('[data-website-feature-sales]');
    const featureOverlayLabel = feature.querySelector('[data-website-feature-overlay-label]');
    if (featureSales?.firstChild) featureSales.firstChild.nodeValue = `${copy.sales} `;
    if (featureOverlayLabel) featureOverlayLabel.textContent = copy.explore;
    feature.querySelector('[data-website-service-prev]')?.setAttribute('aria-label', copy.previous);
    feature.querySelector('[data-website-service-next]')?.setAttribute('aria-label', copy.next);
    const featureImages = {
      development: '/Images/Showcase1.webp', revamp: '/Images/Showcase2.webp', design: '/Images/Showcase3.webp',
      seo: '/Images/SEO_heroimage.webp', geo: '/Images/SEO_heroimage.webp', copywriting: '/Images/CTA_Question_Image.webp',
      localisation: '/Images/CTA_Question_Image.webp', maintenance: '/Images/terrassivilla.jpg'
    };

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
      const panel = panels.find(item => item.dataset.websiteServicePanel === next);
      if (panel) {
        const link = panel.querySelector('a');
        feature.classList.add('is-changing');
        if (featureKicker) featureKicker.textContent = panel.querySelector('.website-service-kicker')?.textContent || '';
        if (featureTitle) featureTitle.textContent = panel.querySelector('h3')?.textContent || '';
        if (featureBody) featureBody.textContent = panel.querySelector(':scope > p:not(.website-service-kicker)')?.textContent || '';
        if (featureResult) featureResult.textContent = [...panel.querySelectorAll('li')].map(item => item.textContent.trim()).join(' · ');
        if (featureImage) featureImage.src = featureImages[next] || featureImages.development;
        if (featurePrimary && link) {
          featurePrimary.href = link.getAttribute('href');
          featurePrimary.innerHTML = link.innerHTML;
        }
        if (featureOverlay && link) featureOverlay.href = link.getAttribute('href');
        window.setTimeout(() => feature.classList.remove('is-changing'), 140);
      }
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
    const stepService = direction => {
      const visibleButtons = buttons.filter(item => !item.hidden);
      const currentIndex = visibleButtons.findIndex(item => item.getAttribute('aria-selected') === 'true');
      const nextIndex = (currentIndex + direction + visibleButtons.length) % visibleButtons.length;
      visibleButtons[nextIndex]?.click();
    };
    feature.querySelector('[data-website-service-prev]')?.addEventListener('click', () => stepService(-1));
    feature.querySelector('[data-website-service-next]')?.addEventListener('click', () => stepService(1));
    const initialService = buttons.find(button => button.getAttribute('aria-selected') === 'true')?.dataset.websiteService || serviceSelect.value;
    activateGroup(groupForService(initialService).key, initialService);
  };

  const enhanceTwoColumnFaq = () => {
    document.querySelectorAll('.website-faq-list').forEach(list => {
      const details = [...list.querySelectorAll(':scope > details')];
      if (details.length < 2) return;
      const split = Math.ceil(details.length / 2);
      const leftColumn = document.createElement('div');
      const rightColumn = document.createElement('div');
      leftColumn.className = 'website-faq-column';
      rightColumn.className = 'website-faq-column';
      details.forEach((detail, index) => {
        detail.dataset.faqColumn = index < split ? 'left' : 'right';
        (index < split ? leftColumn : rightColumn).append(detail);
        detail.addEventListener('toggle', () => {
          if (!detail.open) return;
          const column = detail.dataset.faqColumn;
          details.forEach(sibling => {
            if (sibling !== detail && sibling.dataset.faqColumn === column) sibling.open = false;
          });
        });
      });
      list.append(leftColumn, rightColumn);
    });
  };

  const enhanceWebsiteProjects = () => {
    if (page !== 'websiteServices') return;
    const projects = document.querySelector('.website-client-projects');
    if (!projects) return;
    [...projects.querySelectorAll(':scope > .website-case-study')].forEach((project, index) => {
      const section = document.createElement('section');
      section.className = `website-client-project website-client-project-${index + 1}`;
      const shell = document.createElement('div');
      shell.className = 'shell';
      const heading = project.querySelector('h3');
      if (heading) {
        heading.id = `website-client-project-title-${index + 1}`;
        section.setAttribute('aria-labelledby', heading.id);
      }
      projects.insertBefore(section, project);
      section.append(shell);
      shell.append(project);
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

  const updateRelatedSeoNavigation = language => {
    const navigation = document.querySelector('[data-related-seo-nav]');
    if (!navigation) return;
    const copy = {
      en: { label: 'Explore related SEO', services: 'SEO services', cyprus: 'SEO Cyprus', limassol: 'SEO Limassol' },
      el: { label: 'Σχετικές σελίδες SEO', services: 'Υπηρεσίες SEO', cyprus: 'SEO Κύπρος', limassol: 'SEO Λεμεσός' },
      ru: { label: 'Связанные SEO-страницы', services: 'SEO-услуги', cyprus: 'SEO Кипр', limassol: 'SEO Лимасол' }
    }[language] || null;
    if (!copy) return;
    const label = navigation.querySelector('[data-related-seo-label]');
    if (label) label.textContent = copy.label;
    navigation.querySelectorAll('[data-related-seo-link]').forEach(link => {
      const key = link.dataset.relatedSeoLink;
      if (link.firstChild) link.firstChild.nodeValue = copy[key];
      const url = new URL(link.getAttribute('href'), location.origin);
      url.searchParams.delete('lang');
      if (language !== 'en') url.searchParams.set('lang', language);
      link.setAttribute('href', `${url.pathname}${url.search}`);
    });
  };

  const enhanceSeoVisibilityCounter = () => {
    seoVisibilityObserver?.disconnect();
    seoVisibilityObserver = null;
    const counter = document.querySelector('[data-seo-visibility-counter]');
    if (!counter) return;
    const target = Number(counter.dataset.target) || 0;
    const showFinalValue = () => { counter.textContent = `${target}K`; };
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showFinalValue();
      return;
    }
    counter.textContent = '0K';
    const animate = () => {
      const duration = 1400;
      const startedAt = performance.now();
      const frame = now => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(target * eased)}K`;
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    seoVisibilityObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      seoVisibilityObserver?.disconnect();
      seoVisibilityObserver = null;
      animate();
    }, { threshold: .45 });
    seoVisibilityObserver.observe(counter);
  };

  const enhanceSeoProofCarousel = () => {
    seoProofCarouselCleanup?.();
    seoProofCarouselCleanup = null;
    const track = document.querySelector('[data-infinite-carousel]');
    if (!track) return;
    const originals = [...track.children];
    if (originals.length < 2) return;

    const cloneSet = () => originals.map(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.carouselClone = '';
      clone.querySelectorAll('a, button, [tabindex]').forEach(element => element.setAttribute('tabindex', '-1'));
      return clone;
    });
    track.prepend(...cloneSet());
    track.append(...cloneSet());

    const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let autoplayId = null;
    let resetting = false;
    const measurements = () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = (card?.getBoundingClientRect().width || 0) + gap;
      return { step, setWidth: step * originals.length };
    };
    const jumpTo = left => {
      resetting = true;
      const previous = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = left;
      track.style.scrollBehavior = previous;
      requestAnimationFrame(() => { resetting = false; });
    };
    const keepLoopContinuous = () => {
      if (resetting) return;
      const { step, setWidth } = measurements();
      if (!step || !setWidth) return;
      if (track.scrollLeft <= step * .25) jumpTo(track.scrollLeft + setWidth);
      else if (track.scrollLeft >= setWidth * 2 - step * .25) jumpTo(track.scrollLeft - setWidth);
    };
    const stopAutoplay = () => {
      if (autoplayId !== null) window.clearInterval(autoplayId);
      autoplayId = null;
    };
    const startAutoplay = () => {
      stopAutoplay();
      if (!motionAllowed || document.hidden) return;
      autoplayId = window.setInterval(() => {
        const { step } = measurements();
        if (step) track.scrollBy({ left: step, behavior: 'smooth' });
      }, 4800);
    };
    const resumeAfterFocus = () => window.setTimeout(() => {
      if (!track.contains(document.activeElement)) startAutoplay();
    }, 0);
    const handleVisibility = () => document.hidden ? stopAutoplay() : startAutoplay();
    const initialise = () => {
      const { setWidth } = measurements();
      if (setWidth) jumpTo(setWidth);
      startAutoplay();
    };

    track.addEventListener('scroll', keepLoopContinuous, { passive: true });
    track.addEventListener('pointerenter', stopAutoplay);
    track.addEventListener('pointerleave', startAutoplay);
    track.addEventListener('focusin', stopAutoplay);
    track.addEventListener('focusout', resumeAfterFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    requestAnimationFrame(initialise);

    seoProofCarouselCleanup = () => {
      stopAutoplay();
      track.removeEventListener('scroll', keepLoopContinuous);
      track.removeEventListener('pointerenter', stopAutoplay);
      track.removeEventListener('pointerleave', startAutoplay);
      track.removeEventListener('focusin', stopAutoplay);
      track.removeEventListener('focusout', resumeAfterFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  };

  const normaliseWebsiteFamilyCard = () => {
    if (page !== 'services') return;
    const card = document.querySelector('.service-family-grid .service-family-card');
    if (!card) return;
    card.setAttribute('href', '/services/website');
    const action = card.querySelector(':scope > span');
    if (action?.firstChild) action.firstChild.nodeValue = `${window.Studio17I18n?.translate?.('Explore website services') || 'Explore website services'} `;
  };

  const removeSeoLocationHeadingPeriods = () => {
    if (!document.body.classList.contains('seo-location-page')) return;
    document.querySelectorAll('.seo-location-main h1, .seo-location-main h2').forEach(heading => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      let lastTextNode = null;
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) lastTextNode = walker.currentNode;
      }
      if (lastTextNode) lastTextNode.nodeValue = lastTextNode.nodeValue.replace(/\.\s*$/, '');
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
    normaliseWebsiteFamilyCard();
    removeSeoLocationHeadingPeriods();
    updateInsertedLinks(language);
    updateRelatedSeoNavigation(language);
    enhanceSeoVisibilityCounter();
    enhanceSeoProofCarousel();
    enhanceSeoCapabilities();
    enhanceWebsiteServices();
    enhanceWebsiteProjects();
    enhanceTwoColumnFaq();
    window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  };

  window.addEventListener('studio17:languagechange', event => render(event.detail.language));
  window.Studio17I18n?.ready.then(() => render(window.Studio17I18n.getLanguage())).catch(() => render('en'));
})();
