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
    articles: { label: 'Article pages' },
    automotive: { service: 'automotive' },
    'by-industry': { label: 'By industry' },
    careers: { label: 'Careers' },
    'case-studies': { label: 'Case-study pages' },
    'clothing-stores': { service: 'fashion' },
    commerce: { label: 'Commerce' },
    contact: { label: 'Contact' },
    'content-creation': { label: 'Content creation' },
    cookies: { label: 'Cookie policy' },
    'custom-website': { label: 'Custom website' },
    'digital-solutions': { label: 'Digital solutions' },
    'digital-systems': { label: 'Digital systems' },
    ecommerce: { service: 'ecommerce' },
    education: { service: 'education' },
    faqs: { label: 'FAQs' },
    'free-social-media-audit': { label: 'Free social media audit' },
    'free-website': { label: 'Free website' },
    health: { service: 'health' },
    'local-businesses': { service: 'local' },
    'marketing-strategy': { label: 'Marketing strategy' },
    news: { label: 'Insights and news' },
    'physical-solutions': { label: 'Physical solutions' },
    portfolio: { label: 'Portfolio' },
    privacy: { label: 'Privacy policy' },
    restaurants: { service: 'restaurants' },
    services: { label: 'Services overview' },
    'social-media': { label: 'Social media' },
    'start-growing': { label: 'Start growing' },
    'talk-to-sales': { label: 'Talk to sales' },
    terms: { label: 'Terms and conditions' },
    testimonials: { label: 'Testimonials' },
    trustpilot: { label: 'Trustpilot' },
    website: { label: 'Website' },
    websites: { label: 'Websites' },
    work: { label: 'Featured work' },
    generic: { label: 'Requested page' }
  };

  const requested = new URLSearchParams(location.search).get('for') || 'generic';
  const destination = destinations[requested] || destinations.generic;

  const renderTarget = () => {
    const locale = window.Studio17I18n?.getData();
    const serviceLabel = destination.service ? locale?.services?.itemLabels?.[destination.service] : null;
    target.textContent = serviceLabel || window.Studio17I18n?.translate(destination.label) || destination.label;
  };

  window.addEventListener('studio17:languagechange', renderTarget);
  window.Studio17I18n?.ready.then(renderTarget).catch(renderTarget);
  renderTarget();
})();
