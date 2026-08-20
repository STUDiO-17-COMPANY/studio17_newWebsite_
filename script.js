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
    industry: {
      items: ['automotive', 'restaurants', 'health', 'ecommerce', 'influencers', 'fashion', 'education', 'local', 'physicalAdvertising'],
      images: {
        automotive: 'Images/case-automotive.webp', restaurants: 'Images/news-social.webp', health: 'Images/news-partnership.webp',
        ecommerce: 'Images/news-billboard.webp', influencers: 'Images/news-social.webp', fashion: 'Images/ai-team.webp',
        education: 'Images/news-ai.webp', local: 'Images/news-partnership.webp', physicalAdvertising: 'Images/news-billboard.webp'
      }
    },
    website: {
      items: ['websiteDevelopment', 'websiteRevamp', 'freeWebsite', 'seo', 'geo', 'localization', 'maintenance'],
      image: 'Images/hero-team.webp'
    },
    content: {
      items: ['filmingPhotography', 'videoGraphicDesign', 'scripting', 'aiGeneratedContent'],
      image: 'Images/ai-hands.webp'
    },
    social: {
      items: ['socialManagement', 'socialAutomation', 'growthStrategy', 'communityManagement'],
      image: 'Images/news-social.webp'
    },
    ads: {
      items: ['metaGoogleAds', 'socialAds', 'influencerAdvertising', 'ugcCreators', 'emailAdvertising'],
      image: 'Images/news-billboard.webp'
    },
    systems: {
      items: ['softwareDevelopment', 'crm', 'internalTools', 'dashboards'],
      image: 'Images/news-ai.webp'
    }
  };

  const englishServices = {
    categoryLabels: {
      industry: 'By industry', website: 'Website', content: 'Content creation', social: 'Social Media', ads: 'Advertisement', systems: 'Digital systems'
    },
    controls: {
      category: 'Service area',
      item: 'Service'
    },
    itemLabels: {
      automotive: 'Automotive', restaurants: 'Restaurants', health: 'Health', ecommerce: 'E-Commerce', influencers: 'Individual Influencers',
      fashion: 'Clothing Stores', education: 'Education', local: 'Local Businesses', physicalAdvertising: 'Physical Advertising',
      websiteDevelopment: 'Website Development', websiteRevamp: 'Website Revamp', freeWebsite: 'Free Website', seo: 'SEO', geo: 'GEO',
      localization: 'Localization and Translation', maintenance: 'Maintenance', filmingPhotography: 'Filming / Photography',
      videoGraphicDesign: 'Video editing and graphic design', scripting: 'Scripting', aiGeneratedContent: 'AI-generated Content',
      socialManagement: 'Social Media Management', socialAutomation: 'Social Media Automation', growthStrategy: 'Growth strategy',
      communityManagement: 'Community management', metaGoogleAds: 'Meta and Google Ads', socialAds: 'Social Media Ads',
      influencerAdvertising: 'Influencer Advertising', ugcCreators: 'UGC Creators', emailAdvertising: 'Email Advertising',
      softwareDevelopment: 'Software Development', crm: 'CRM', internalTools: 'Internal Tools', dashboards: 'Dashboards'
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
      freeWebsite: 'Eligible small businesses can receive a focused starter website under our Free Website offer, with scope, requirements and ongoing costs confirmed before work begins.',
      seo: 'We improve site structure, on-page content, internal linking and technical signals so search engines understand the business and relevant customers can find it.',
      geo: 'We structure entities, expertise and answer-ready content so AI-powered search and answer engines can understand, trust and cite the business more easily.',
      localization: 'We adapt language, tone, search intent, metadata and customer journeys for each market instead of simply translating words.',
      maintenance: 'We keep websites secure, updated, monitored and improving through backups, content support, performance checks and agreed technical care.',
      filmingPhotography: 'We plan and capture brand, product, team, venue and campaign photography or video in formats prepared for websites, social media and advertising.',
      videoGraphicDesign: 'We turn raw material into platform-ready videos and graphics with clear pacing, branding, captions, formats and calls to action.',
      scripting: 'We write hooks, narratives, interview guides and conversion scripts that give every video, advertisement or presentation a clear purpose.',
      aiGeneratedContent: 'We use AI as a directed production tool for scalable concepts and assets, with human review for accuracy, brand fit and quality.',
      socialManagement: 'We manage strategy, calendars, publishing, creative coordination, reporting and continuous improvement across the channels that matter to the business.',
      socialAutomation: 'We automate approved scheduling, routing, responses and reporting tasks so social media runs consistently without removing human oversight.',
      growthStrategy: 'We build a testable growth plan around audience, positioning, content pillars, distribution, collaborations and metrics tied to business value.',
      communityManagement: 'We monitor and respond to comments, messages and community signals with clear guidelines that protect the brand and strengthen customer relationships.',
      metaGoogleAds: 'We plan, launch and optimize Meta and Google campaigns around search intent, audiences, creative, landing pages, tracking and a defined commercial goal.',
      socialAds: 'We create platform-specific paid social campaigns with attention-earning creative, relevant targeting and a clear path from impression to action.',
      influencerAdvertising: 'We identify suitable creators, define deliverables, coordinate campaigns and connect creator reach to an offer, landing journey and measurement plan.',
      ugcCreators: 'We source and direct UGC creators to produce authentic assets for organic publishing and paid testing, with deliverables and usage terms defined.',
      emailAdvertising: 'We plan newsletters, promotional sequences and automated follow-ups with useful segmentation, persuasive copy, clear design and measurable actions.',
      softwareDevelopment: 'We design and develop purpose-built software around a validated workflow, user need and maintainable technical scope.',
      crm: 'We configure CRM structure, pipelines, forms, automation and reporting so leads and customer follow-up stop getting lost between tools.',
      internalTools: 'We build focused internal tools that replace repetitive spreadsheets, manual handoffs and fragmented processes with one clearer workflow.',
      dashboards: 'We connect approved data sources into decision-ready dashboards that show the metrics, trends and actions each team actually needs.'
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
      freeWebsite: 'Give an eligible business a credible starting point online with the agreed essentials clearly defined.',
      seo: 'Build stronger relevance and crawlability around the searches that matter to the business.',
      geo: 'Make expertise easier for AI answer engines to interpret, verify and reference.',
      localization: 'Give each market language and customer journey that feel native rather than copied.',
      maintenance: 'Protect continuity with planned updates, monitoring, backups and responsive technical support.',
      filmingPhotography: 'Create a reusable visual library sized and framed for campaigns, websites and daily publishing.',
      videoGraphicDesign: 'Deliver finished assets that are recognisable, accessible and ready for each platform.',
      scripting: 'Give presenters, creators and campaigns a stronger opening, logical flow and decisive call to action.',
      aiGeneratedContent: 'Increase production capacity while retaining human approval over facts, tone and brand quality.',
      socialManagement: 'Replace irregular posting with an accountable calendar, coordinated creative and useful performance reporting.',
      socialAutomation: 'Save time on repeatable social tasks while keeping sensitive conversations and approvals with people.',
      growthStrategy: 'Create a prioritised testing roadmap that shows what to publish, distribute, measure and improve next.',
      communityManagement: 'Turn timely, on-brand replies into stronger relationships and clearer customer insight.',
      metaGoogleAds: 'Direct search demand and audience attention to dedicated landing journeys with conversion tracking in place.',
      socialAds: 'Test messages, creatives and audiences systematically so paid social learning compounds instead of resetting.',
      influencerAdvertising: 'Build creator campaigns around audience fit, agreed usage, accountable delivery and a measurable destination.',
      ugcCreators: 'Produce a varied bank of authentic creative that can be tested organically and in paid campaigns.',
      emailAdvertising: 'Move subscribers and leads toward the next relevant action through segmented campaigns and follow-up sequences.',
      softwareDevelopment: 'Deliver a maintainable application designed around the people, permissions and workflow that will use it.',
      crm: 'Give every lead a visible owner, stage, history and next action inside one organised pipeline.',
      internalTools: 'Reduce manual handoffs and give the team one reliable place to complete recurring operational work.',
      dashboards: 'Replace scattered reports with a shared view of the signals that require attention and decisions.'
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
      systems: {
        title: '{item} that removes repetitive work and makes decisions clearer.',
        body: 'We connect data, tools and workflows to reduce friction and create a more consistent operating system.',
        result: 'Your team gets a practical system with defined data, ownership and workflows.'
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

  const serviceFeature = document.querySelector('.service-feature');
  const serviceImage = document.querySelector('[data-service-image]');
  const serviceTitle = document.querySelector('[data-service-title]');
  const serviceBody = document.querySelector('[data-service-body]');
  const serviceResult = document.querySelector('[data-service-result]');
  const serviceList = document.querySelector('.industry-list');
  const serviceTabs = [...document.querySelectorAll('[data-service-tab]')];
  const serviceCategorySelect = document.querySelector('[data-service-category-select]');
  const serviceItemSelect = document.querySelector('[data-service-item-select]');
  const serviceCategoryLabel = document.querySelector('[data-service-category-label]');
  const serviceItemLabel = document.querySelector('[data-service-item-label]');
  const selectedItems = Object.fromEntries(Object.entries(serviceSchema).map(([category, config]) => [category, config.items[0]]));
  let activeCategory = 'industry';

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
      title: featured?.title || formatServiceText(templates.title, label),
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

  const stepService = direction => {
    const buttons = [...(serviceList?.querySelectorAll('[data-service-item]') || [])];
    if (!buttons.length) return;
    const currentIndex = buttons.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
    buttons[nextIndex].click();
    buttons[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  document.querySelector('[data-service-prev]')?.addEventListener('click', () => stepService(-1));
  document.querySelector('[data-service-next]')?.addEventListener('click', () => stepService(1));

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
    renderServiceTabs();
    renderServiceList(activeCategory, selectedItems[activeCategory]);
    renderService(getServiceContent(activeCategory, selectedItems[activeCategory]), { instant: true });
    if (menuButton) menuButton.setAttribute('aria-label', translateText(menuButton.getAttribute('aria-expanded') === 'true' ? 'Close menu' : 'Open menu'));
    updateGoogleProfileLabels();
    updateLegalFooterLinks();
  });

  document.querySelectorAll('[data-carousel-prev], [data-carousel-next]').forEach(button => {
    button.addEventListener('click', () => {
      const trackId = button.dataset.carouselPrev || button.dataset.carouselNext;
      const track = document.getElementById(trackId);
      if (!track) return;
      const direction = button.hasAttribute('data-carousel-prev') ? -1 : 1;
      const readingDirection = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
      const firstCard = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 48;
      track.scrollBy({ left: readingDirection * direction * ((firstCard?.getBoundingClientRect().width || 380) + gap), behavior: 'smooth' });
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
