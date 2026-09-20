(() => {
  'use strict';

  if (window.lucide?.createIcons) {
    window.lucide.createIcons({ attrs: { 'stroke-width': 2 } });
  }

  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownTrigger = document.querySelector('.nav-trigger');
  const dropdownPanel = document.querySelector('.dropdown-panel');
  const translateText = text => window.Studio17I18n?.translate(text) || text;
  const googleProfileUrl = 'https://share.google/B3qQDpUvLnv5UAZ4G';
  const legalFooterItems = [
    { page: 'privacy', href: '/privacy-policy', label: 'Privacy policy' },
    { page: 'cookies', href: '/cookie-policy', label: 'Cookie policy' },
    { page: 'terms', href: '/terms', label: 'Terms and conditions' }
  ];
  const servicesMegaMenu = [
    {
      categoryKey: 'social',
      label: 'Social Media',
      href: '/wip#for=social-media',
      items: [
        ['socialManagement', 'Social Media management', '/wip#for=social-media-management'],
        ['socialAutomation', 'Social Media automation', '/wip#for=social-media-automation'],
        ['growthStrategy', 'Growth strategy', '/wip#for=growth-strategy'],
        ['communityManagement', 'Community management', '/wip#for=community-management'],
        ['freeAudit', 'Free Audit', '/wip#for=free-social-media-audit']
      ]
    },
    {
      categoryKey: 'website',
      label: 'Website',
      href: '/services/website',
      items: [
        ['websiteDevelopment', 'Website development', '/services/website-development'],
        ['websiteRevamp', 'Website revamp', '/wip#for=website-revamp'],
        [null, 'Website design', '/wip#for=website-design'],
        ['seo', 'SEO', '/services/seo'],
        ['geo', 'GEO', '/wip#for=geo'],
        [null, 'Copywriting', '/wip#for=copywriting'],
        ['localization', 'Localization and Translation', '/services/localization-and-translation'],
        ['maintenance', 'Maintenance', '/wip#for=maintenance'],
        ['freeWebsite', 'Free Website', '/services/free-website']
      ]
    },
    {
      categoryKey: 'content',
      label: 'Content creation',
      href: '/wip#for=content-creation',
      items: [
        [null, 'Filming', '/wip#for=filming'],
        [null, 'Photography', '/wip#for=photography'],
        [null, 'Video editing', '/wip#for=video-editing'],
        [null, 'Graphic design', '/wip#for=graphic-design'],
        [null, 'Digital design', '/wip#for=digital-design'],
        ['scripting', 'Scripting', '/wip#for=scripting'],
        [null, 'AI generation', '/wip#for=ai-generation']
      ]
    },
    {
      categoryKey: 'ads',
      label: 'Advertisement',
      href: '/wip#for=advertisement',
      items: [
        [null, 'Meta ads', '/wip#for=meta-ads'],
        [null, 'Google ads', '/wip#for=google-ads'],
        ['socialAds', 'Social Media ads', '/wip#for=social-media-ads'],
        [null, 'Influencer ads', '/wip#for=influencer-ads'],
        ['ugcCreators', 'UGC creators', '/wip#for=ugc-creators'],
        ['emailAdvertising', 'Email ads', '/wip#for=email-ads']
      ]
    },
    {
      categoryKey: 'industry',
      label: 'By Industry',
      href: '/wip#for=by-industry',
      items: [
        ['automotive', 'Automotive', '/wip#for=automotive'],
        ['restaurants', 'Restaurants', '/wip#for=restaurants'],
        [null, 'Health care', '/wip#for=health-care'],
        ['ecommerce', 'E-Commerce', '/wip#for=ecommerce'],
        ['influencers', 'Individual Influencers', '/wip#for=individual-influencers'],
        ['education', 'Education', '/wip#for=education'],
        [null, 'Local Business', '/wip#for=local-business'],
        [null, 'SMEs', '/wip#for=smes']
      ]
    },
    {
      label: 'Events',
      href: '/wip#for=events',
      items: [
        [null, 'Presential Events', '/wip#for=presential-events'],
        [null, 'Online Events', '/wip#for=online-events']
      ]
    }
  ];

  const localiseServicesMenuHref = href => {
    const language = window.Studio17I18n?.getLanguage?.() || 'en';
    const hashIndex = href.indexOf('#');
    const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
    const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
    const [pathname, query = ''] = withoutHash.split('?');
    const localPages = { '/wip': 'wip.html', '/services/website': 'website-services.html', '/services/website-development': 'website-development.html', '/services/free-website': 'free-website.html', '/services/seo': 'seo.html', '/services/localization-and-translation': 'localization-and-translation.html' };
    const target = location.protocol === 'file:' ? `${localPages[pathname] || pathname.replace(/^\//, '')}${query ? `?${query}` : ''}${hash}` : href;
    const url = new URL(target, location.href);
    const isWip = /(?:^|\/)wip(?:\.html)?$/.test(url.pathname);
    if (isWip || language === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', language);
    return location.protocol === 'file:' ? `${url.pathname.split('/').pop()}${url.search}${url.hash}` : `${url.pathname}${url.search}${url.hash}`;
  };

  const markWipLink = (element, href) => {
    if (href.startsWith('/wip#')) element.relList.add('nofollow');
  };

  const updateServicesMegaMenu = () => {
    if (!dropdownPanel) return;
    const locale = window.Studio17I18n?.getData?.();
    const categories = locale?.services?.categoryLabels || {};
    const items = locale?.services?.itemLabels || {};
    dropdownPanel.id = 'services-mega-menu';
    dropdownTrigger?.setAttribute('aria-controls', 'services-mega-menu');
    dropdownPanel.classList.add('services-mega-menu');
    dropdownPanel.replaceChildren(...servicesMegaMenu.map(group => {
      const section = document.createElement('section');
      section.className = 'services-mega-group';
      const title = document.createElement(group.href ? 'a' : 'p');
      title.className = 'services-mega-title';
      title.textContent = (group.categoryKey && categories[group.categoryKey]) || translateText(group.label);
      if (group.href) {
        title.href = localiseServicesMenuHref(group.href);
        markWipLink(title, group.href);
        const currentPath = location.protocol === 'file:' ? location.pathname.split('/').pop() : location.pathname.replace(/\/$/, '');
        const isWebsiteFamily = group.categoryKey === 'website' && (
          currentPath === '/services/website' ||
          currentPath === '/services/website-development' ||
          currentPath === '/services/free-website' ||
          currentPath === '/services/seo' ||
          ['website-services.html', 'website-development.html', 'free-website.html', 'seo.html'].includes(currentPath)
        );
        if (isWebsiteFamily) title.setAttribute('aria-current', 'page');
      }
      const list = document.createElement('ul');
      group.items.forEach(([itemKey, label, href]) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = localiseServicesMenuHref(href);
        markWipLink(link, href);
        link.textContent = (itemKey && items[itemKey]) || translateText(label);
        if (itemKey === 'freeAudit' || itemKey === 'freeWebsite') link.classList.add('services-mega-offer');
        listItem.appendChild(link);
        list.appendChild(listItem);
      });
      section.append(title, list);
      return section;
    }));
  };

  const closeMobileServicesDirectory = () => {
    const toggle = mobileMenu?.querySelector('.mobile-services-toggle');
    const panel = mobileMenu?.querySelector('.mobile-services-panel');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', translateText('Show services'));
    }
    if (panel) panel.hidden = true;
    mobileMenu?.querySelectorAll('.mobile-services-category').forEach(button => button.setAttribute('aria-expanded', 'false'));
    mobileMenu?.querySelectorAll('.mobile-services-list').forEach(list => { list.hidden = true; });
  };

  const updateMobileServicesMenu = () => {
    const nav = mobileMenu?.querySelector('nav');
    if (!nav) return;

    let menu = nav.querySelector('.mobile-services-menu');
    if (!menu) {
      const servicesLink = [...nav.children].find(element => {
        if (!element.matches('a')) return false;
        return /(^|\/)services(?:\.html)?(?:[?#]|$)/.test(element.getAttribute('href') || '');
      });
      if (!servicesLink) return;

      menu = document.createElement('div');
      menu.className = 'mobile-services-menu';
      const primaryRow = document.createElement('div');
      primaryRow.className = 'mobile-services-primary-row';
      nav.insertBefore(menu, servicesLink);
      menu.appendChild(primaryRow);
      servicesLink.classList.add('mobile-services-overview-link');
      primaryRow.appendChild(servicesLink);

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mobile-services-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'mobile-services-panel');
      toggle.setAttribute('aria-label', translateText('Show services'));
      toggle.innerHTML = '<i data-lucide="chevron-down" aria-hidden="true"></i>';
      primaryRow.appendChild(toggle);

      const panel = document.createElement('div');
      panel.id = 'mobile-services-panel';
      panel.className = 'mobile-services-panel';
      panel.hidden = true;
      menu.appendChild(panel);

      toggle.addEventListener('click', () => {
        const opening = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(opening));
        toggle.setAttribute('aria-label', translateText(opening ? 'Hide services' : 'Show services'));
        panel.hidden = !opening;
        if (opening) panel.querySelector('.mobile-services-category')?.focus();
      });
    }

    const locale = window.Studio17I18n?.getData?.();
    const categories = locale?.services?.categoryLabels || {};
    const items = locale?.services?.itemLabels || {};
    const overviewLink = menu.querySelector('.mobile-services-overview-link');
    if (overviewLink) overviewLink.textContent = translateText('Services');
    const toggle = menu.querySelector('.mobile-services-toggle');
    if (toggle) toggle.setAttribute('aria-label', translateText(toggle.getAttribute('aria-expanded') === 'true' ? 'Hide services' : 'Show services'));

    const panel = menu.querySelector('.mobile-services-panel');
    if (!panel) return;
    panel.replaceChildren(...servicesMegaMenu.map((group, groupIndex) => {
      const section = document.createElement('section');
      section.className = 'mobile-services-group';

      const button = document.createElement('button');
      const listId = `mobile-services-list-${groupIndex + 1}`;
      button.type = 'button';
      button.className = 'mobile-services-category';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', listId);
      const title = document.createElement('span');
      const categoryTitle = (group.categoryKey && categories[group.categoryKey]) || translateText(group.label);
      title.textContent = categoryTitle;
      const icon = document.createElement('i');
      icon.dataset.lucide = 'chevron-down';
      icon.setAttribute('aria-hidden', 'true');
      button.append(title, icon);

      const list = document.createElement('ul');
      list.id = listId;
      list.className = 'mobile-services-list';
      list.hidden = true;
      if (group.href) {
        const overviewItem = document.createElement('li');
        const overviewLink = document.createElement('a');
        overviewLink.href = localiseServicesMenuHref(group.href);
        markWipLink(overviewLink, group.href);
        overviewLink.className = 'mobile-services-category-overview';
        overviewLink.textContent = group.categoryKey === 'website' ? translateText('Explore website services') : `${categoryTitle} →`;
        overviewItem.appendChild(overviewLink);
        list.appendChild(overviewItem);
      }
      group.items.forEach(([itemKey, label, href]) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = localiseServicesMenuHref(href);
        markWipLink(link, href);
        link.textContent = (itemKey && items[itemKey]) || translateText(label);
        if (itemKey === 'freeAudit' || itemKey === 'freeWebsite') link.classList.add('services-mega-offer');
        listItem.appendChild(link);
        list.appendChild(listItem);
      });

      button.addEventListener('click', () => {
        const opening = button.getAttribute('aria-expanded') !== 'true';
        panel.querySelectorAll('.mobile-services-category').forEach(otherButton => otherButton.setAttribute('aria-expanded', 'false'));
        panel.querySelectorAll('.mobile-services-list').forEach(otherList => { otherList.hidden = true; });
        button.setAttribute('aria-expanded', String(opening));
        list.hidden = !opening;
      });

      section.append(button, list);
      return section;
    }));
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 2 } });
  };

  const updateServiceFooterLinks = () => {
    const serviceItems = window.Studio17I18n?.getData?.()?.services?.itemLabels || {};
    document.querySelectorAll('.footer-grid').forEach(grid => {
      const servicesColumn = [...grid.children].find(element => element.matches('nav.footer-column'));
      if (!servicesColumn) return;
      const websiteLink = servicesColumn.querySelector('a[href^="/services/website-development"]');
      let freeWebsiteLink = servicesColumn.querySelector('.footer-services-free-website, a[href^="/services/free-website"]');
      if (!freeWebsiteLink) {
        freeWebsiteLink = document.createElement('a');
        freeWebsiteLink.className = 'footer-services-free-website';
        freeWebsiteLink.textContent = serviceItems.freeWebsite || translateText('Free Website');
        if (websiteLink) websiteLink.insertAdjacentElement('afterend', freeWebsiteLink);
        else servicesColumn.appendChild(freeWebsiteLink);
      }
      freeWebsiteLink.classList.add('footer-services-free-website');
      freeWebsiteLink.textContent = serviceItems.freeWebsite || translateText('Free Website');
      freeWebsiteLink.href = localiseServicesMenuHref('/services/free-website');
      if (document.body.classList.contains('free-website-page')) freeWebsiteLink.setAttribute('aria-current', 'page');
      else freeWebsiteLink.removeAttribute('aria-current');

      let seoLink = servicesColumn.querySelector('.footer-services-seo, a[href^="/services/seo"]');
      if (!seoLink) {
        seoLink = document.createElement('a');
        seoLink.className = 'footer-services-seo';
        seoLink.textContent = 'SEO';
        freeWebsiteLink.insertAdjacentElement('afterend', seoLink);
      }
      seoLink.classList.add('footer-services-seo');
      seoLink.href = localiseServicesMenuHref('/services/seo');
      if (document.body.classList.contains('seo-service-page')) seoLink.setAttribute('aria-current', 'page');
      else seoLink.removeAttribute('aria-current');
    });
  };

  updateServicesMegaMenu();
  updateMobileServicesMenu();
  updateServiceFooterLinks();
  window.Studio17I18n?.ready?.then(() => {
    updateServicesMegaMenu();
    updateMobileServicesMenu();
    updateServiceFooterLinks();
  }).catch(() => {});

  const updateLegalFooterLinks = () => {
    const language = window.Studio17I18n?.getLanguage?.() || 'en';
    document.querySelectorAll('[data-footer-legal]').forEach(link => {
      const item = legalFooterItems.find(candidate => candidate.page === link.dataset.footerLegal);
      if (!item) return;
      const localPage = location.protocol === 'file:' ? `${item.href.slice(1)}.html` : item.href;
      const url = new URL(localPage, location.href);
      if (language === 'en') url.searchParams.delete('lang');
      else url.searchParams.set('lang', language);
      link.setAttribute('href', location.protocol === 'file:' ? `${url.pathname.split('/').pop()}${url.search}` : `${url.pathname}${url.search}`);
      link.textContent = translateText(item.label);
    });
  };

  document.querySelectorAll('.footer-grid > .footer-column:last-child').forEach(column => {
    legalFooterItems.forEach(item => {
      if (column.querySelector(`[data-footer-legal="${item.page}"]`)) return;
      const link = document.createElement('a');
      link.className = 'footer-legal-link';
      link.dataset.footerLegal = item.page;
      if (document.body.dataset.legalPage === item.page) link.setAttribute('aria-current', 'page');
      column.appendChild(link);
    });
  });
  updateLegalFooterLinks();

  const updateGoogleProfileLabels = () => {
    document.querySelectorAll('.footer-social-link.social-google').forEach(link => {
      link.setAttribute('aria-label', translateText('Studio 17 on Google'));
    });
  };

  document.querySelectorAll('.footer-social-links').forEach(links => {
    if (links.querySelector('.social-google')) return;
    const googleLink = document.createElement('a');
    googleLink.className = 'footer-social-link social-google';
    googleLink.href = googleProfileUrl;
    googleLink.target = '_blank';
    googleLink.rel = 'noopener noreferrer';
    googleLink.innerHTML = '<span aria-hidden="true"></span>';
    links.appendChild(googleLink);
  });
  updateGoogleProfileLabels();

  const closeMobileMenu = ({ restoreFocus = false } = {}) => {
    if (!menuButton || !mobileMenu) return;
    closeMobileServicesDirectory();
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', translateText('Open menu'));
    mobileMenu.hidden = true;
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuButton.focus();
  };

  menuButton?.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', translateText(opening ? 'Close menu' : 'Open menu'));
    mobileMenu.hidden = !opening;
    document.body.classList.toggle('menu-open', opening);
    if (opening) mobileMenu.querySelector('a')?.focus();
  });

  mobileMenu?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMobileMenu();
  });

  const closeDesktopDropdown = ({ restoreFocus = false } = {}) => {
    dropdownTrigger?.setAttribute('aria-expanded', 'false');
    dropdown?.classList.remove('is-open');
    dropdownPanel?.classList.remove('is-open');
    if (dropdownPanel) dropdownPanel.hidden = true;
    if (restoreFocus) dropdownTrigger?.focus();
  };

  dropdownTrigger?.addEventListener('click', () => {
    const open = dropdownTrigger.getAttribute('aria-expanded') !== 'true';
    dropdownTrigger.setAttribute('aria-expanded', String(open));
    dropdown?.classList.toggle('is-open', open);
    dropdownPanel?.classList.toggle('is-open', open);
    if (dropdownPanel) dropdownPanel.hidden = !open;
  });

  document.addEventListener('click', event => {
    if (event.target.closest('.nav-dropdown')) return;
    closeDesktopDropdown();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (menuButton?.getAttribute('aria-expanded') === 'true') closeMobileMenu({ restoreFocus: true });
    if (dropdownTrigger?.getAttribute('aria-expanded') === 'true') closeDesktopDropdown({ restoreFocus: true });
  });

  const serviceSchema = {
    social: {
      items: ['socialManagement', 'socialAutomation', 'growthStrategy', 'communityManagement', 'freeAudit'],
      image: 'Images/news-social.webp'
    },
    website: {
      items: ['websiteDevelopment', 'websiteRevamp', 'websiteDesign', 'seo', 'geo', 'copywriting', 'localization', 'maintenance', 'freeWebsite'],
      image: 'Images/hero-team.webp'
    },
    content: {
      items: ['filming', 'photography', 'videoEditing', 'graphicDesign', 'digitalDesign', 'scripting', 'aiGeneration'],
      image: 'Images/ai-hands.webp'
    },
    ads: {
      items: ['metaAds', 'googleAds', 'socialAds', 'influencerAds', 'ugcCreators', 'emailAds'],
      image: 'Images/news-billboard.webp'
    },
    industry: {
      items: ['automotive', 'restaurants', 'health', 'ecommerce', 'influencers', 'education', 'local', 'smes'],
      images: {
        automotive: 'Images/case-automotive.webp', restaurants: 'Images/news-social.webp', health: 'Images/news-partnership.webp',
        ecommerce: 'Images/news-billboard.webp', influencers: 'Images/news-social.webp', education: 'Images/news-ai.webp',
        local: 'Images/news-partnership.webp', smes: 'Images/hero-team.webp'
      }
    },
    events: {
      items: ['presentialEvents', 'onlineEvents'],
      image: 'Images/news-partnership.webp'
    }
  };

  const englishServices = {
    categoryLabels: {
      social: 'Social Media', website: 'Website', content: 'Content creation', ads: 'Advertisement', industry: 'By industry', events: 'Events'
    },
    controls: {
      category: 'Service area',
      item: 'Service'
    },
    itemLabels: {
      automotive: 'Automotive', restaurants: 'Restaurants', health: 'Health', ecommerce: 'E-Commerce', influencers: 'Individual Influencers',
      education: 'Education', local: 'Local Business', smes: 'SMEs',
      websiteDevelopment: 'Website Development', websiteRevamp: 'Website Revamp', websiteDesign: 'Website Design', seo: 'SEO', geo: 'GEO',
      copywriting: 'Copywriting', localization: 'Localization and Translation', maintenance: 'Maintenance', freeWebsite: 'Free Website',
      filming: 'Filming', photography: 'Photography', videoEditing: 'Video editing', graphicDesign: 'Graphic design', digitalDesign: 'Digital design', scripting: 'Scripting', aiGeneration: 'AI Generation',
      socialManagement: 'Social Media Management', socialAutomation: 'Social Media Automation', growthStrategy: 'Growth strategy',
      communityManagement: 'Community management', freeAudit: 'Free Audit', metaAds: 'Meta ads', googleAds: 'Google ads', socialAds: 'Social Media ads',
      influencerAds: 'Influencer ads', ugcCreators: 'UGC creators', emailAds: 'Email ads', presentialEvents: 'Presential Events', onlineEvents: 'Online Events'
    },
    descriptions: {
      automotive: 'We combine vehicle presentation, photography, video, social media, advertising and lead journeys to help dealerships earn trust before the first visit.',
      restaurants: 'We combine reservation-ready websites, menu design, food photography, short-form video, local SEO and campaigns to turn nearby discovery into bookings and orders.',
      health: 'We build clear, privacy-conscious patient journeys with trustworthy websites, educational content, local search visibility and practical enquiry or booking flows.',
      ecommerce: 'We connect store design, product pages, content, SEO, paid acquisition, email and reporting to help more shoppers discover products and complete purchases.',
      influencers: 'We develop personal-brand positioning, content systems, media kits, partnership pages and campaign support that help creators grow audiences and win stronger commercial opportunities.',
      fashion: 'We create visually consistent stores, product launches, campaign content, social media and advertising that turn collections into desire and make purchasing simple.',
      education: 'We clarify programmes, courses and outcomes through accessible websites, useful content, search visibility and effective enquiry or enrolment journeys.',
      local: 'We strengthen local discovery with a credible website, Google presence, reviews, social content and campaigns designed to generate calls, visits and enquiries.',
      physicalAdvertising: 'We plan and design billboards, print, signage and offline campaigns with clear messages, production-ready files and digital follow-up journeys.',
      websiteDevelopment: 'We design and build responsive, conversion-focused websites with SEO, GEO and technical SEO foundations, clear customer journeys and measurable contact actions.',
      websiteRevamp: 'We improve an existing website’s structure, messaging, design, speed, accessibility and conversion path while protecting useful content and search value.',
      websiteDesign: 'We shape page hierarchy, interface systems and responsive user journeys before development so every screen feels clear, distinctive and easy to use.',
      freeWebsite: 'Eligible small businesses can receive a focused starter website under our Free Website offer, with scope, requirements and ongoing costs confirmed before work begins.',
      seo: 'We improve site structure, on-page content, internal linking and technical signals so search engines understand the business and relevant customers can find it.',
      geo: 'We structure entities, expertise and answer-ready content so AI-powered search and answer engines can understand, trust and cite the business more easily.',
      copywriting: 'We write clear website copy around customer questions, commercial priorities and search intent so visitors understand the offer and know what to do next.',
      localization: 'We adapt language, tone, search intent, metadata and customer journeys for each market instead of simply translating words.',
      maintenance: 'We keep websites secure, updated, monitored and improving through backups, content support, performance checks and agreed technical care.',
      filming: 'We plan and film brand, product, team, venue and campaign footage with the shots, formats and narrative coverage required for each publishing channel.',
      photography: 'We create a consistent photography library for products, people, spaces and campaigns, framed for websites, social media, press and advertising.',
      videoEditing: 'We turn raw footage into platform-ready videos with purposeful pacing, brand treatment, captions, sound and clear calls to action.',
      graphicDesign: 'We design recognisable campaign graphics, social assets, presentations and print-ready material around one consistent visual system.',
      digitalDesign: 'We create digital interfaces and campaign assets that remain usable, responsive and visually consistent across screens and platforms.',
      scripting: 'We write hooks, narratives, interview guides and conversion scripts that give every video, advertisement or presentation a clear purpose.',
      aiGeneration: 'We direct AI-assisted production for scalable concepts and assets while retaining human review over facts, creative quality and brand consistency.',
      socialManagement: 'We manage strategy, calendars, publishing, creative coordination, reporting and continuous improvement across the channels that matter to the business.',
      socialAutomation: 'We automate approved scheduling, routing, responses and reporting tasks so social media runs consistently without removing human oversight.',
      growthStrategy: 'We build a testable growth plan around audience, positioning, content pillars, distribution, collaborations and metrics tied to business value.',
      communityManagement: 'We monitor and respond to comments, messages and community signals with clear guidelines that protect the brand and strengthen customer relationships.',
      freeAudit: 'We review the current social presence, publishing consistency, content mix and customer journey to identify practical opportunities before any engagement begins.',
      metaAds: 'We plan and optimise Meta campaigns around audience signals, creative testing, landing journeys and measurable commercial actions across Facebook and Instagram.',
      googleAds: 'We build Google Ads campaigns around real search intent, relevant landing pages, conversion tracking and controlled optimisation of queries and budget.',
      socialAds: 'We create platform-specific paid social campaigns with attention-earning creative, relevant targeting and a clear path from impression to action.',
      influencerAds: 'We identify suitable creators, define deliverables, coordinate campaigns and connect creator reach to an offer, landing journey and measurement plan.',
      ugcCreators: 'We source and direct UGC creators to produce authentic assets for organic publishing and paid testing, with deliverables and usage terms defined.',
      emailAds: 'We plan newsletters, promotional sequences and automated follow-ups with useful segmentation, persuasive copy, clear design and measurable actions.',
      smes: 'We combine the website, content, campaigns and practical systems an SME needs most, prioritising work around limited time, budget and internal capacity.',
      presentialEvents: 'We support in-person events with positioning, promotion, visual assets, registration journeys and content capture designed around attendance and follow-up.',
      onlineEvents: 'We build online event journeys across promotion, registration, reminders, branded broadcast assets and post-event content or lead follow-up.'
    },
    outcomes: {
      automotive: 'Give buyers the information and confidence to enquire about the right vehicle before visiting the dealership.',
      restaurants: 'Give diners a clear path from local search or social discovery to a confident reservation or order.',
      health: 'Make it easier for patients to understand services, trust the provider and take the correct next step.',
      ecommerce: 'Reduce friction between product discovery and checkout while giving the team clearer acquisition and sales signals.',
      influencers: 'Present audience value professionally and give brands a clearer reason to start a partnership.',
      fashion: 'Carry the same visual story from campaign discovery through product selection and purchase.',
      education: 'Help prospective learners compare options, understand outcomes and complete an enquiry or enrolment.',
      local: 'Turn nearby searches and recommendations into measurable calls, directions, visits and enquiries.',
      physicalAdvertising: 'Make every physical placement instantly understandable and connect offline attention to a trackable next action.',
      websiteDevelopment: 'Launch a responsive website that supports search visibility and guides visitors toward enquiry, booking or purchase.',
      websiteRevamp: 'Keep what already works while removing the design, performance and messaging friction holding conversion back.',
      websiteDesign: 'Give development a tested visual and interaction direction that reduces ambiguity and improves the customer journey.',
      freeWebsite: 'Give an eligible business a credible starting point online with the agreed essentials clearly defined.',
      seo: 'Build stronger relevance and crawlability around the searches that matter to the business.',
      geo: 'Make expertise easier for AI answer engines to interpret, verify and reference.',
      copywriting: 'Turn complex offers into clear, persuasive pages that support search visibility and confident customer action.',
      localization: 'Give each market language and customer journey that feel native rather than copied.',
      maintenance: 'Protect continuity with planned updates, monitoring, backups and responsive technical support.',
      filming: 'Capture reusable footage with enough variety to support campaigns, websites and regular publishing.',
      photography: 'Build a coherent image library that makes the business easier to recognise and trust across channels.',
      videoEditing: 'Deliver finished videos that hold attention, communicate clearly and are ready for each platform.',
      graphicDesign: 'Give every campaign and communication a consistent visual language across digital and physical formats.',
      digitalDesign: 'Create responsive digital assets and interfaces that remain clear and consistent wherever customers see them.',
      scripting: 'Give presenters, creators and campaigns a stronger opening, logical flow and decisive call to action.',
      aiGeneration: 'Increase production capacity while retaining human approval over facts, tone and brand quality.',
      socialManagement: 'Replace irregular posting with an accountable calendar, coordinated creative and useful performance reporting.',
      socialAutomation: 'Save time on repeatable social tasks while keeping sensitive conversations and approvals with people.',
      growthStrategy: 'Create a prioritised testing roadmap that shows what to publish, distribute, measure and improve next.',
      communityManagement: 'Turn timely, on-brand replies into stronger relationships and clearer customer insight.',
      freeAudit: 'Leave with a prioritised view of what is working, what is missing and what should be improved first.',
      metaAds: 'Test audiences and creative systematically while connecting paid attention to a measurable next step.',
      googleAds: 'Capture relevant search demand and learn which queries, offers and landing journeys produce meaningful action.',
      socialAds: 'Test messages, creatives and audiences systematically so paid social learning compounds instead of resetting.',
      influencerAds: 'Build creator campaigns around audience fit, agreed usage, accountable delivery and a measurable destination.',
      ugcCreators: 'Produce a varied bank of authentic creative that can be tested organically and in paid campaigns.',
      emailAds: 'Move subscribers and leads toward the next relevant action through segmented campaigns and follow-up sequences.',
      smes: 'Focus limited resources on the connected marketing work most likely to improve visibility, trust and enquiries.',
      presentialEvents: 'Create a consistent journey from event discovery and registration through attendance, content and follow-up.',
      onlineEvents: 'Turn an online session into a complete acquisition and follow-up journey instead of a one-off broadcast.'
    },
    templates: {
      industry: {
        title: '{item} marketing designed to turn discovery into customers.',
        body: 'We connect positioning, content, digital presence and practical systems around the decisions that matter in this industry.',
        result: 'Choose the right mix of website, content, social media, advertising and systems for one connected customer journey.'
      },
      website: {
        title: '{item} that helps customers find, trust and contact you.',
        body: 'Strategy, user experience, content and development work together so the website supports real customer decisions.',
        result: 'You receive a clear, responsive and search-ready foundation built around the next customer action.'
      },
      content: {
        title: '{item} created to earn attention and move people to act.',
        body: 'We plan every asset around the audience, message, channel and action it needs to support.',
        result: 'You receive channel-ready assets with a repeatable production workflow, not disconnected posts.'
      },
      social: {
        title: '{item} that gives your brand a reason to be followed.',
        body: 'Channel strategy, publishing, community and automation are organised as one practical social media system.',
        result: 'Strategy, publishing, community and reporting work together to build useful attention over time.'
      },
      ads: {
        title: '{item} that connects budget to a clear customer action.',
        body: 'We connect the message, creative, targeting and rollout so every campaign has one clear job.',
        result: 'Creative, targeting, landing journey and measurement are planned as one campaign.'
      },
      events: {
        title: '{item} designed to turn attendance into lasting business value.',
        body: 'Promotion, registration, event experience, content and follow-up are planned as one connected journey.',
        result: 'The event has a clear audience, conversion path and follow-up plan before promotion begins.'
      }
    },
    featured: {
      automotive: {
        title: 'Car dealership marketing that sells the car before the first visit.',
        body: 'Before a buyer contacts a dealership, they have already judged the car online. We help automotive businesses make every vehicle easier to understand and trust through useful content, clearer presentation and a more consistent brand presence.',
        result: 'One dealership client grew from selling up to 4 cars per month to more than 10 cars per month, with some vehicles selling in less than 24 hours after being listed.'
      }
    }
  };

  const serviceFeature = document.querySelector('.home-page .service-feature');
  const serviceImage = document.querySelector('.home-page [data-service-image]');
  const serviceTitle = document.querySelector('.home-page [data-service-title]');
  const serviceBody = document.querySelector('.home-page [data-service-body]');
  const serviceResult = document.querySelector('.home-page [data-service-result]');
  const serviceList = document.querySelector('.home-page .industry-list');
  const serviceTabs = [...document.querySelectorAll('.home-page [data-service-tab]')];
  const serviceCategorySelect = document.querySelector('.home-page [data-service-category-select]');
  const serviceItemSelect = document.querySelector('.home-page [data-service-item-select]');
  const serviceCategoryLabel = document.querySelector('.home-page [data-service-category-label]');
  const serviceItemLabel = document.querySelector('.home-page [data-service-item-label]');
  const selectedItems = Object.fromEntries(Object.entries(serviceSchema).map(([category, config]) => [category, config.items[0]]));
  let activeCategory = 'social';

  const getServiceLocale = () => window.Studio17I18n?.getLanguage?.() === 'en'
    ? englishServices
    : (window.Studio17I18n?.getData()?.services || englishServices);
  const formatServiceText = (template, item) => (template || '').replaceAll('{item}', item);

  const getServiceContent = (category, item) => {
    const locale = getServiceLocale();
    const featured = locale.featured?.[item];
    const templates = locale.templates?.[category] || englishServices.templates[category];
    const label = locale.itemLabels?.[item] || englishServices.itemLabels[item] || item;
    const description = locale.descriptions?.[item] || englishServices.descriptions[item] || templates.body;
    const outcome = locale.outcomes?.[item] || englishServices.outcomes[item] || templates.result;
    const schema = serviceSchema[category];
    return {
      title: (featured?.title || formatServiceText(templates.title, label)).replace(/[.]$/u, ''),
      body: featured?.body || description,
      result: featured?.result || outcome,
      image: schema.images?.[item] || schema.image
    };
  };

  let serviceRenderTimer;
  const renderService = (content, { instant = false } = {}) => {
    if (!content || !serviceFeature) return;
    window.clearTimeout(serviceRenderTimer);
    const commit = () => {
      if (serviceTitle) serviceTitle.textContent = content.title;
      if (serviceBody) serviceBody.textContent = content.body;
      if (serviceResult) serviceResult.textContent = content.result;
      if (serviceImage) serviceImage.src = content.image;
      serviceFeature.classList.remove('is-changing');
    };
    if (instant) {
      commit();
      return;
    }
    serviceFeature.classList.add('is-changing');
    serviceRenderTimer = window.setTimeout(commit, 140);
  };

  const selectButton = (buttons, selected) => {
    buttons.forEach(button => {
      const active = button === selected;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  };

  const renderServiceList = (category, selectedItem = selectedItems[category]) => {
    const locale = getServiceLocale();
    const items = serviceSchema[category].items;
    if (serviceList) {
      serviceList.setAttribute('aria-label', locale.categoryLabels?.[category] || englishServices.categoryLabels[category]);
      serviceList.replaceChildren(...items.map(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('role', 'tab');
        button.dataset.serviceItem = item;
        button.textContent = locale.itemLabels?.[item] || englishServices.itemLabels[item] || item;
        const active = item === selectedItem;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        return button;
      }));
    }
    if (serviceItemSelect) {
      serviceItemSelect.replaceChildren(...items.map(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = locale.itemLabels?.[item] || englishServices.itemLabels[item] || item;
        return option;
      }));
      serviceItemSelect.value = selectedItem;
    }
  };

  const renderServiceTabs = () => {
    const locale = getServiceLocale();
    serviceTabs.forEach(button => {
      button.textContent = locale.categoryLabels?.[button.dataset.serviceTab] || englishServices.categoryLabels[button.dataset.serviceTab];
    });
    if (serviceCategorySelect) {
      [...serviceCategorySelect.options].forEach(option => {
        option.textContent = locale.categoryLabels?.[option.value] || englishServices.categoryLabels[option.value];
      });
      serviceCategorySelect.value = activeCategory;
    }
    if (serviceCategoryLabel) serviceCategoryLabel.textContent = locale.controls?.category || englishServices.controls.category;
    if (serviceItemLabel) serviceItemLabel.textContent = locale.controls?.item || englishServices.controls.item;
  };

  const selectService = (category, item = selectedItems[category]) => {
    activeCategory = category;
    selectedItems[category] = item;
    selectButton(serviceTabs, serviceTabs.find(tab => tab.dataset.serviceTab === category));
    if (serviceCategorySelect) serviceCategorySelect.value = category;
    renderServiceList(category, item);
    renderService(getServiceContent(category, item));
  };

  serviceTabs.forEach(button => {
    button.addEventListener('click', () => {
      selectService(button.dataset.serviceTab);
    });
  });

  serviceCategorySelect?.addEventListener('change', event => {
    selectService(event.target.value);
  });

  serviceItemSelect?.addEventListener('change', event => {
    selectService(activeCategory, event.target.value);
  });

  serviceList?.addEventListener('click', event => {
    const button = event.target.closest('[data-service-item]');
    if (!button) return;
    selectService(activeCategory, button.dataset.serviceItem);
  });

  serviceList?.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const buttons = [...serviceList.querySelectorAll('[data-service-item]')];
    const currentIndex = buttons.indexOf(event.target.closest('[data-service-item]'));
    if (currentIndex < 0) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) nextIndex = (currentIndex + 1) % buttons.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = buttons.length - 1;
    buttons[nextIndex].focus();
    buttons[nextIndex].click();
  });

  const addTabKeyboardNavigation = tabs => {
    tabs.forEach((tab, index) => {
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      });
    });
  };
  addTabKeyboardNavigation(serviceTabs);
  renderServiceTabs();
  renderServiceList(activeCategory, selectedItems[activeCategory]);
  renderService(getServiceContent(activeCategory, selectedItems[activeCategory]), { instant: true });

  window.addEventListener('studio17:languagechange', () => {
    updateServicesMegaMenu();
    updateMobileServicesMenu();
    updateServiceFooterLinks();
    renderServiceTabs();
    renderServiceList(activeCategory, selectedItems[activeCategory]);
    renderService(getServiceContent(activeCategory, selectedItems[activeCategory]), { instant: true });
    if (menuButton) menuButton.setAttribute('aria-label', translateText(menuButton.getAttribute('aria-expanded') === 'true' ? 'Close menu' : 'Open menu'));
    updateGoogleProfileLabels();
    updateLegalFooterLinks();
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-carousel-prev], [data-carousel-next]');
    if (!button) return;
    const trackId = button.dataset.carouselPrev || button.dataset.carouselNext;
    const track = document.getElementById(trackId);
    if (!track) return;
    const direction = button.hasAttribute('data-carousel-prev') ? -1 : 1;
    const readingDirection = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    const firstCard = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 48;
    track.scrollBy({ left: readingDirection * direction * ((firstCard?.getBoundingClientRect().width || 380) + gap), behavior: 'smooth' });
  });

  document.querySelectorAll('.website-faq-column').forEach(column => {
    column.querySelectorAll(':scope > details').forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        column.querySelectorAll(':scope > details[open]').forEach(sibling => {
          if (sibling !== item) sibling.open = false;
        });
      });
    });
  });

  const createSiteAssistance = () => {
    const currentPath = location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
    const currentFile = currentPath.split('/').pop()?.replace(/\.html$/, '') || '';
    const excludedRoutes = ['/contact', '/careers', '/career-role', '/wip', '/privacy-policy', '/cookie-policy', '/terms'];
    const excludedFiles = new Set(['contact', 'careers', 'career-role', 'wip', 'privacy-policy', 'cookie-policy', 'terms']);
    if (excludedRoutes.some(route => currentPath === route || currentPath.startsWith(`${route}/`)) || excludedFiles.has(currentFile)) return;

    const isFreeWebsite = currentPath.includes('/free-website') || currentFile === 'free-website';
    const isSeo = currentPath.includes('/services/seo') || currentPath.startsWith('/seo/') || ['seo', 'seo-cyprus', 'seo-limassol'].includes(currentFile);
    const isWebsite = currentPath.includes('/services/website') || ['website-services', 'website-development'].includes(currentFile);
    const variants = {
      general: {
        title: 'Not sure where to start?',
        copy: 'Tell us what you want to improve. We will help identify the clearest next step.',
        label: 'Talk to Studio 17', href: '/contact?source=assistance-badge'
      },
      seo: {
        title: 'Want to improve your search visibility?',
        copy: 'Get a practical review of your website, search presence and next opportunities.',
        label: 'Get your free SEO analysis', href: '/contact?service=seo&source=assistance-badge'
      },
      website: {
        title: 'Planning a new website?',
        copy: 'Tell us about the business and we will help define the right website scope.',
        label: 'Discuss your website', href: '/contact?service=website&source=assistance-badge'
      },
      freeWebsite: {
        title: 'Could your next website cost €0?',
        copy: 'Selected businesses can receive a complete one-page website with design and development included.',
        label: 'Apply for a free website', href: '/contact?service=free-website&source=assistance-badge'
      }
    };
    const content = variants[isFreeWebsite ? 'freeWebsite' : isSeo ? 'seo' : isWebsite ? 'website' : 'general'];
    const assistance = document.createElement('div');
    assistance.className = 'site-assist';
    assistance.dataset.siteAssist = '';
    assistance.hidden = true;
    assistance.innerHTML = `<button class="site-assist-launcher" type="button" aria-expanded="false" aria-controls="site-assist-panel"><i data-lucide="badge-question-mark" aria-hidden="true"></i><span></span></button><section class="site-assist-panel" id="site-assist-panel" aria-labelledby="site-assist-title" hidden><button class="site-assist-close" type="button"><i data-lucide="x" aria-hidden="true"></i></button><p class="site-assist-kicker"></p><h2 id="site-assist-title"></h2><p class="site-assist-copy"></p><a class="solid-button site-assist-cta"></a></section>`;
    document.body.appendChild(assistance);

    const launcher = assistance.querySelector('.site-assist-launcher');
    const panel = assistance.querySelector('.site-assist-panel');
    const closeButton = assistance.querySelector('.site-assist-close');
    const updateCopy = () => {
      launcher.querySelector('span').textContent = translateText('Not sure where to start?');
      launcher.setAttribute('aria-label', translateText('Open Studio 17 guidance'));
      closeButton.setAttribute('aria-label', translateText('Close guidance'));
      assistance.querySelector('.site-assist-kicker').textContent = translateText('A useful next step');
      assistance.querySelector('#site-assist-title').textContent = translateText(content.title);
      assistance.querySelector('.site-assist-copy').textContent = translateText(content.copy);
      const cta = assistance.querySelector('.site-assist-cta');
      cta.textContent = translateText(content.label);
      cta.href = localiseServicesMenuHref(content.href);
    };
    const setOpen = (open, { restoreFocus = false } = {}) => {
      assistance.classList.toggle('is-open', open);
      launcher.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (open) {
        window.dispatchEvent(new CustomEvent('studio17:siteassistopen'));
        closeButton.focus();
      }
      else if (restoreFocus) launcher.focus();
    };
    const analyticsNoticeVisible = () => {
      const notice = document.querySelector('.analytics-consent');
      return notice && !notice.hidden;
    };
    let engaged = false;
    const revealLauncher = () => {
      engaged = true;
      if (!analyticsNoticeVisible()) assistance.hidden = false;
    };
    const revealFromScroll = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      if (scrollY / scrollable < .18) return;
      revealLauncher();
      window.removeEventListener('scroll', revealFromScroll);
    };

    launcher.addEventListener('click', () => setOpen(launcher.getAttribute('aria-expanded') !== 'true'));
    closeButton.addEventListener('click', () => setOpen(false, { restoreFocus: true }));
    window.addEventListener('studio17:animaopen', () => setOpen(false));
    document.addEventListener('click', event => {
      if (!assistance.classList.contains('is-open') || assistance.contains(event.target)) return;
      setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && assistance.classList.contains('is-open')) setOpen(false, { restoreFocus: true });
    });
    window.addEventListener('studio17:languagechange', updateCopy);
    window.addEventListener('studio17:analyticsconsent', () => { if (engaged) assistance.hidden = false; });
    window.addEventListener('scroll', revealFromScroll, { passive: true });
    window.setTimeout(revealLauncher, 12000);
    updateCopy();
    window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  };
  createSiteAssistance();

  const createAnima = () => {
    const currentPath = location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
    const currentFile = currentPath.split('/').pop()?.replace(/\.html$/, '') || '';
    const excludedRoutes = ['/contact', '/career-role', '/wip', '/privacy-policy', '/cookie-policy', '/terms'];
    const excludedFiles = new Set(['contact', 'career-role', 'wip', 'privacy-policy', 'cookie-policy', 'terms']);
    if (excludedRoutes.some(route => currentPath === route || currentPath.startsWith(`${route}/`)) || excludedFiles.has(currentFile)) return;

    const copy = {
      launcher: 'Ask Anima',
      openLabel: 'Open Anima quick-answer assistant',
      closeLabel: 'Close Anima',
      resetLabel: 'Start again',
      assistantLabel: 'Quick-answer assistant',
      name: 'Anima',
      prompt: 'Choose a question',
      typing: 'Anima is preparing an answer',
      disclosure: 'Prepared answers · Not live chat',
      human: 'Talk with a human',
      opening: 'Hi, I’m Anima, your quick-answer assistant. I can help you understand our services, pricing and process, or connect you directly with our team. Let me know how I can help you.',
      questions: [
        {
          id: 'services',
          question: 'What services does Studio 17 offer?',
          answer: 'Studio 17 connects website development, SEO and GEO, content creation, social media, advertising, localization and digital systems around the business problem you need to solve.',
          action: 'Explore our services',
          href: '/services?source=anima'
        },
        {
          id: 'pricing',
          question: 'How much does a website cost?',
          answer: 'Our published website packages start at €450 for a focused one-page website, €950 for Starter, €1,500 for Growth and €2,250 for Business. Custom websites start at €3,500. We confirm the scope before work begins.',
          action: 'Compare website packages',
          href: '/services/website-pricing?source=anima'
        },
        {
          id: 'seo',
          question: 'Can Studio 17 help me get found online?',
          answer: 'Yes. Our SEO work can connect technical improvements, page optimization, content, local visibility, Google Business Profile, Search Console and AI-search foundations around qualified demand.',
          action: 'Explore SEO services',
          href: '/services/seo?source=anima'
        },
        {
          id: 'process',
          question: 'What happens when we start a project?',
          answer: 'We begin by understanding the business, audience and current problem. Then we recommend the smallest useful scope, agree the work, design and build it, test it and support the launch.',
          action: 'See our website process',
          href: '/services/website-development?source=anima'
        },
        {
          id: 'free-website',
          question: 'How does the free website offer work?',
          answer: 'Selected businesses can apply for a complete one-page website with design and development included. The offer has a defined scope, one revision round and clear information the business needs to provide.',
          action: 'View the free website offer',
          href: '/services/free-website?source=anima'
        },
        {
          id: 'international',
          question: 'Can you work with my business remotely?',
          answer: 'Yes. Studio 17 operates from Cyprus and Portugal and collaborates with businesses across Europe and other markets through a clear remote workflow.',
          action: 'Learn about Studio 17',
          href: '/about?source=anima'
        }
      ]
    };

    const anima = document.createElement('div');
    anima.className = 'anima';
    anima.dataset.anima = '';
    anima.hidden = true;
    anima.innerHTML = `<button class="anima-launcher" type="button" aria-expanded="false" aria-controls="anima-panel"><i data-lucide="message-circle" aria-hidden="true"></i><span>${copy.launcher}</span></button><section class="anima-panel" id="anima-panel" role="dialog" aria-modal="false" aria-labelledby="anima-title" hidden data-i18n-skip><header class="anima-header"><span class="anima-mark" aria-hidden="true">A</span><div><p>${copy.assistantLabel}</p><h2 id="anima-title">${copy.name}</h2></div><div class="anima-header-actions"><button class="anima-reset" type="button" aria-label="${copy.resetLabel}" title="${copy.resetLabel}"><i data-lucide="rotate-ccw" aria-hidden="true"></i></button><button class="anima-close" type="button" aria-label="${copy.closeLabel}"><i data-lucide="x" aria-hidden="true"></i></button></div></header><div class="anima-conversation" data-anima-conversation aria-live="polite" aria-relevant="additions"></div><div class="anima-questions"><p>${copy.prompt}</p><div data-anima-questions></div></div><footer class="anima-footer"><a href="/contact?source=anima" data-anima-human>${copy.human}<i data-lucide="arrow-up-right" aria-hidden="true"></i></a><small>${copy.disclosure}</small></footer></section>`;
    document.body.appendChild(anima);

    const launcher = anima.querySelector('.anima-launcher');
    const panel = anima.querySelector('.anima-panel');
    const closeButton = anima.querySelector('.anima-close');
    const resetButton = anima.querySelector('.anima-reset');
    const conversation = anima.querySelector('[data-anima-conversation]');
    const questionList = anima.querySelector('[data-anima-questions]');
    const humanLink = anima.querySelector('[data-anima-human]');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let answerTimer = 0;
    let engaged = false;

    launcher.setAttribute('aria-label', copy.openLabel);
    humanLink.href = localiseServicesMenuHref(humanLink.getAttribute('href'));

    const refreshIcons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
    const scrollConversation = () => requestAnimationFrame(() => { conversation.scrollTop = conversation.scrollHeight; });
    const createMessage = (type, text, action) => {
      const message = document.createElement('div');
      message.className = `anima-message anima-message-${type}`;
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      message.appendChild(paragraph);
      if (action) {
        const link = document.createElement('a');
        link.href = localiseServicesMenuHref(action.href);
        link.textContent = action.label;
        link.innerHTML += '<i data-lucide="arrow-up-right" aria-hidden="true"></i>';
        message.appendChild(link);
      }
      conversation.appendChild(message);
      refreshIcons();
      scrollConversation();
      return message;
    };
    const createTyping = () => {
      const typing = document.createElement('div');
      typing.className = 'anima-message anima-message-assistant anima-typing';
      typing.dataset.animaTyping = '';
      typing.setAttribute('role', 'status');
      typing.setAttribute('aria-label', copy.typing);
      typing.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
      conversation.appendChild(typing);
      scrollConversation();
      return typing;
    };
    const setQuestionsDisabled = disabled => questionList.querySelectorAll('button').forEach(button => { button.disabled = disabled; });
    const answerQuestion = item => {
      window.clearTimeout(answerTimer);
      createMessage('user', item.question);
      setQuestionsDisabled(true);
      const typing = createTyping();
      answerTimer = window.setTimeout(() => {
        typing.remove();
        createMessage('assistant', item.answer, { label: item.action, href: item.href });
        setQuestionsDisabled(false);
      }, reduceMotion.matches ? 80 : 2200);
    };
    const renderQuestions = () => {
      const priority = currentPath.includes('/seo/') || currentPath.includes('/services/seo')
        ? ['seo', 'services', 'pricing', 'process', 'international', 'free-website']
        : currentPath.includes('/services/website')
          ? ['pricing', 'process', 'services', 'free-website', 'seo', 'international']
          : copy.questions.map(item => item.id);
      questionList.replaceChildren(...priority.map(id => {
        const item = copy.questions.find(question => question.id === id);
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.animaQuestion = item.id;
        button.innerHTML = `<span>${item.question}</span><i data-lucide="chevron-right" aria-hidden="true"></i>`;
        button.addEventListener('click', () => answerQuestion(item));
        return button;
      }));
      refreshIcons();
    };
    const resetConversation = () => {
      window.clearTimeout(answerTimer);
      conversation.replaceChildren();
      createMessage('assistant', copy.opening);
      setQuestionsDisabled(false);
    };
    const setOpen = (open, { restoreFocus = false } = {}) => {
      anima.classList.toggle('is-open', open);
      launcher.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (open) {
        window.dispatchEvent(new CustomEvent('studio17:animaopen'));
        closeButton.focus();
      } else if (restoreFocus) launcher.focus();
    };
    const analyticsNoticeVisible = () => {
      const notice = document.querySelector('.analytics-consent');
      return notice && !notice.hidden;
    };
    const syncVisibility = () => {
      const unavailable = analyticsNoticeVisible() || document.body.classList.contains('menu-open');
      anima.hidden = !engaged || unavailable;
      if (unavailable && anima.classList.contains('is-open')) setOpen(false);
    };
    const revealLauncher = () => {
      engaged = true;
      syncVisibility();
    };
    const revealFromScroll = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      if (scrollY / scrollable < .12) return;
      revealLauncher();
      window.removeEventListener('scroll', revealFromScroll);
    };

    launcher.addEventListener('click', () => setOpen(launcher.getAttribute('aria-expanded') !== 'true'));
    closeButton.addEventListener('click', () => setOpen(false, { restoreFocus: true }));
    resetButton.addEventListener('click', resetConversation);
    window.addEventListener('studio17:siteassistopen', () => setOpen(false));
    window.addEventListener('studio17:analyticsconsent', syncVisibility);
    window.addEventListener('scroll', revealFromScroll, { passive: true });
    document.addEventListener('click', event => {
      if (!anima.classList.contains('is-open') || anima.contains(event.target)) return;
      setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && anima.classList.contains('is-open')) setOpen(false, { restoreFocus: true });
    });
    const consentNotice = document.querySelector('.analytics-consent');
    if (consentNotice) new MutationObserver(syncVisibility).observe(consentNotice, { attributes: true, attributeFilter: ['hidden'] });
    new MutationObserver(syncVisibility).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.setTimeout(revealLauncher, 18000);
    renderQuestions();
    resetConversation();
    refreshIcons();
  };
  createAnima();

  document.querySelectorAll('[data-presentation-preview]').forEach(preview => {
    const loadButton = preview.querySelector('[data-presentation-load]');
    const placeholder = preview.querySelector('[data-presentation-placeholder]');
    const frame = preview.querySelector('iframe[data-src]');
    if (!loadButton || !placeholder || !frame) return;
    loadButton.addEventListener('click', () => {
      if (frame.dataset.src) {
        frame.src = frame.dataset.src;
        delete frame.dataset.src;
      }
      frame.hidden = false;
      placeholder.hidden = true;
      frame.focus();
    });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && menuButton?.getAttribute('aria-expanded') === 'true') closeMobileMenu();
    if (window.innerWidth <= 900 && dropdownTrigger?.getAttribute('aria-expanded') === 'true') closeDesktopDropdown();
  });
})();
