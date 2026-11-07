(() => {
  'use strict';

  const target = document.querySelector('[data-wip-target]');
  if (!target) return;

  const destinations = {
    about: { label: 'About Studio 17' },
    advertisement: { label: 'Advertisement' },
    advertising: { label: 'Advertising' },
    'ai-agents': { label: 'AI agents' },
    'ai-integrations': { label: 'AI integrations' },
    'ai-solutions': { label: 'AI solutions' },
    'ai-systems': { label: 'AI systems' },
    'ai-generation': { label: 'AI generation' },
    'ai-seo-geo': { label: 'AI SEO & GEO' },
    'ai-visibility': { label: 'AI Visibility' },
    'ai-visibility-audit': { label: 'AI Visibility Audit' },
    'ai-visibility-monitoring': { label: 'AI Visibility Monitoring' },
    'ai-competitor-analysis': { label: 'AI Competitor Analysis' },
    articles: { label: 'Article pages' },
    automotive: { service: 'automotive' },
    'by-industry': { label: 'By industry' },
    'business-visibility': { label: 'Business Visibility' },
    careers: { label: 'Careers' },
    'case-studies': { label: 'Case-study pages' },
    'clothing-stores': { service: 'fashion' },
    commerce: { label: 'Commerce' },
    'community-management': { service: 'communityManagement' },
    contact: { label: 'Contact' },
    'content-creation': { label: 'Content creation' },
    copywriting: { label: 'Copywriting' },
    cookies: { label: 'Cookie policy' },
    'custom-website': { label: 'Custom website' },
    'digital-solutions': { label: 'Digital solutions' },
    'digital-systems': { label: 'Digital systems' },
    'digital-pr-link-building': { label: 'Digital PR & Link Building' },
    ecommerce: { service: 'ecommerce' },
    'ecommerce-seo': { label: 'Ecommerce SEO' },
    education: { service: 'education' },
    'email-ads': { service: 'emailAdvertising' },
    'email-advertising': { label: 'Email Advertising' },
    events: { label: 'Events' },
    'filming': { label: 'Filming' },
    faqs: { label: 'FAQs' },
    'free-social-media-audit': { label: 'Free social media audit' },
    'free-website': { label: 'Free website' },
    health: { service: 'health' },
    'health-care': { label: 'Health care' },
    'google-ads': { label: 'Google ads' },
    'google-business-profile-management': { label: 'Google Business Profile Management' },
    'graphic-design': { label: 'Graphic design' },
    'growth-strategy': { service: 'growthStrategy' },
    'individual-influencers': { service: 'influencers' },
    'influencer-ads': { label: 'Influencer ads' },
    'in-person-events': { label: 'In-Person Events' },
    'international-seo': { label: 'International SEO' },
    'local-business': { label: 'Local Business' },
    'local-seo': { label: 'Local SEO' },
    'local-businesses': { service: 'local' },
    'localization-and-translation': { service: 'localization' },
    'marketing-strategy': { label: 'Marketing strategy' },
    maintenance: { service: 'maintenance' },
    'meta-ads': { label: 'Meta ads' },
    news: { label: 'Insights and news' },
    'physical-solutions': { label: 'Physical solutions' },
    'phos-optics-case-study': { label: 'PHÓS Optics case study' },
    portfolio: { label: 'Portfolio' },
    privacy: { label: 'Privacy policy' },
    restaurants: { service: 'restaurants' },
    services: { label: 'Services overview' },
    scripting: { service: 'scripting' },
    smes: { label: 'SMEs' },
    'social-media': { label: 'Social media' },
    'social-media-ads': { service: 'socialAds' },
    'social-media-automation': { service: 'socialAutomation' },
    'social-media-management': { service: 'socialManagement' },
    'start-growing': { label: 'Start growing' },
    'talk-to-sales': { label: 'Talk to sales' },
    terms: { label: 'Terms and conditions' },
    testimonials: { label: 'Testimonials' },
    trustpilot: { label: 'Trustpilot' },
    'ugc-creators': { service: 'ugcCreators' },
    'video-editing': { label: 'Video editing' },
    'website-revamp': { service: 'websiteRevamp' },
    'website-design': { label: 'Website design' },
    'digital-design': { label: 'Digital design' },
    'online-events': { label: 'Online Events' },
    'online-reputation-management': { label: 'Online Reputation Management' },
    'photography': { label: 'Photography' },
    'presential-events': { label: 'Presential Events' },
    geo: { service: 'geo' },
    seo: { service: 'seo' },
    'seo-strategy': { label: 'SEO Strategy & Management' },
    'seo-consulting': { label: 'SEO Consulting' },
    'seo-audit': { label: 'SEO Audit' },
    'seo-content-strategy': { label: 'SEO Content Strategy' },
    'technical-seo': { label: 'Technical SEO' },
    website: { label: 'Website' },
    'website-maintenance': { label: 'Website Maintenance' },
    websites: { label: 'Websites' },
    work: { label: 'Featured work' },
    generic: { label: 'Requested page' }
  };

  const legacyParameters = new URLSearchParams(location.search);
  const legacyRequested = legacyParameters.get('for');
  const initialHashParameters = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (legacyRequested && !initialHashParameters.has('for')) {
    const url = new URL(location.href);
    url.searchParams.delete('for');
    url.hash = `for=${encodeURIComponent(legacyRequested)}`;
    history.replaceState({}, '', url);
  }

  const englishPages = { seo: '/services/seo', 'seo-strategy': '/services/seo-strategy' };
  const pendingCopy = {
    'pt-PT': ['Ainda não disponível em português', 'A equipa portuguesa ainda não desenvolveu esta página.', 'Ver página em inglês'],
    es: ['Aún no disponible en español', 'El equipo español aún no ha desarrollado esta página.', 'Ver página en inglés'],
    el: ['Δεν είναι ακόμη διαθέσιμη στα ελληνικά', 'Η ελληνική ομάδα δεν έχει ακόμη αναπτύξει αυτή τη σελίδα.', 'Προβολή σελίδας στα αγγλικά'],
    ru: ['Пока недоступно на русском', 'Русскоязычная команда ещё не подготовила эту страницу.', 'Открыть страницу на английском']
  };
  const heading = document.querySelector('[data-wip-heading]');
  const description = document.querySelector('[data-wip-description]');
  const englishLink = document.querySelector('[data-wip-english]');
  const status = document.querySelector('.wip-status');
  const original = [heading.textContent, description.textContent];
  const renderTarget = () => {
    const requested = new URLSearchParams(location.hash.replace(/^#/, '')).get('for') || 'generic';
    const destination = Object.hasOwn(destinations, requested) ? destinations[requested] : destinations.generic;
    const locale = window.Studio17I18n?.getData();
    const serviceLabel = destination.service ? locale?.services?.itemLabels?.[destination.service] : null;
    target.textContent = serviceLabel || window.Studio17I18n?.translate(destination.label) || destination.label;
    const copy = pendingCopy[document.documentElement.lang];
    const english = Object.hasOwn(englishPages, requested) ? englishPages[requested] : null;
    heading.textContent = copy?.[0] || window.Studio17I18n?.translate(original[0]) || original[0];
    description.textContent = copy?.[1] || window.Studio17I18n?.translate(original[1]) || original[1];
    englishLink.hidden = !copy || !english;
    if (copy && english) {
      englishLink.href = english;
      englishLink.textContent = copy[2];
    } else englishLink.removeAttribute('href');
    if (status) status.hidden = Boolean(copy);
  };

  window.addEventListener('hashchange', renderTarget);
  window.addEventListener('studio17:languagechange', renderTarget);
  window.Studio17I18n?.ready.then(renderTarget).catch(renderTarget);
  renderTarget();
})();
