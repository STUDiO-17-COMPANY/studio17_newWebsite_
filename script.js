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
    templates: {
      industry: {
        title: '{item} marketing built around how customers decide.',
        body: 'We connect positioning, content, digital presence and practical systems around the decisions that matter in this industry.',
        result: 'Every touchpoint is designed to make the business easier to find, understand, trust and choose.'
      },
      website: {
        title: '{item} built for clarity, performance and growth.',
        body: 'Strategy, user experience, content and development work together so the website supports real customer decisions.',
        result: 'The result is a faster, clearer and easier-to-maintain digital foundation for the business.'
      },
      content: {
        title: '{item} with a clear purpose and production system.',
        body: 'We plan every asset around the audience, message, channel and action it needs to support.',
        result: 'A consistent workflow keeps content recognisable, useful and ready to perform across channels.'
      },
      social: {
        title: '{item} connected to measurable business goals.',
        body: 'Channel strategy, publishing, community and automation are organised as one practical social media system.',
        result: 'The system creates a sustainable rhythm for learning, improving and growing over time.'
      },
      ads: {
        title: '{item} built around a simple commercial idea.',
        body: 'We connect the message, creative, targeting and rollout so every campaign has one clear job.',
        result: 'Campaign thinking stays consistent from the first impression to the final customer action.'
      },
      systems: {
        title: '{item} designed around the way your team actually works.',
        body: 'We connect data, tools and workflows to reduce friction and create a more consistent operating system.',
        result: 'Useful digital systems give the business a stronger base for marketing, service and future growth.'
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
  const selectedItems = Object.fromEntries(Object.entries(serviceSchema).map(([category, config]) => [category, config.items[0]]));
  let activeCategory = 'industry';

  const getServiceLocale = () => window.Studio17I18n?.getData()?.services || englishServices;
  const formatServiceText = (template, item) => (template || '').replaceAll('{item}', item);

  const getServiceContent = (category, item) => {
    const locale = getServiceLocale();
    const featured = locale.featured?.[item];
    const templates = locale.templates?.[category] || englishServices.templates[category];
    const label = locale.itemLabels?.[item] || englishServices.itemLabels[item] || item;
    const schema = serviceSchema[category];
    return {
      title: featured?.title || formatServiceText(templates.title, label),
      body: featured?.body || templates.body,
      result: featured?.result || templates.result,
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
    if (!serviceList) return;
    const locale = getServiceLocale();
    serviceList.setAttribute('aria-label', locale.categoryLabels?.[category] || englishServices.categoryLabels[category]);
    serviceList.replaceChildren(...serviceSchema[category].items.map(item => {
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
  };

  const renderServiceTabs = () => {
    const locale = getServiceLocale();
    serviceTabs.forEach(button => {
      button.textContent = locale.categoryLabels?.[button.dataset.serviceTab] || englishServices.categoryLabels[button.dataset.serviceTab];
    });
  };

  const selectService = (category, item = selectedItems[category]) => {
    activeCategory = category;
    selectedItems[category] = item;
    selectButton(serviceTabs, serviceTabs.find(tab => tab.dataset.serviceTab === category));
    renderServiceList(category, item);
    renderService(getServiceContent(category, item));
  };

  serviceTabs.forEach(button => {
    button.addEventListener('click', () => {
      selectService(button.dataset.serviceTab);
    });
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
