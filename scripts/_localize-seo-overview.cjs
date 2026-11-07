'use strict';

const copy = require('../locales/seo-overview.cjs');
module.exports = (document, locale) => {
  const t = copy[locale];
  const get = selector => document.querySelector(selector);
  const text = (node, value) => {
    const existing = [...node.childNodes].find(child => child.nodeType === 3 && child.textContent.trim());
    if (existing) existing.nodeValue = value + (node.children.length ? ' ' : '');
    else node.prepend(document.createTextNode(value));
  };
  const set = (selector, value) => text(get(selector), value);
  const attr = (selector, name, value) => get(selector).setAttribute(name, value);
  const rows = (selector, values, apply) => {
    const nodes = [...document.querySelectorAll(selector)];
    if (nodes.length !== values.length) throw new Error('SEO locale layout mismatch: ' + selector);
    nodes.forEach((node, index) => apply(node, values[index], index));
  };
  const heading = (selector, value) => {
    const element = get(selector);
    const [highlight, rest = ''] = value.split('|');
    const span = document.createElement('span');
    span.textContent = highlight;
    element.replaceChildren(span, document.createTextNode(rest));
  };
  set('#seo-overview-title', t.hero[0]);
  attr('#seo-overview-title', 'aria-label', t.hero[0] + ' Google');
  set('.home-hero-content > p', t.hero[1]);
  set('[data-audit-label]', t.hero[2]);
  attr('#seo-audit-target', 'placeholder', t.hero[3]);
  set('[data-hero-audit-submit]', t.hero[4]);
  attr('.seo-overview .website-services-main', 'aria-label', t.headings[0]);
  ['#seo-services-title','#seo-benefits-title','#seo-roadmap-title','#seo-results-title','#seo-overview-faq-title','#seo-final-title'].forEach((selector, i) => heading(selector, t.headings[i+1]));
  attr('.seo-service-tabs', 'aria-label', t.title);
  rows('.seo-service-tabs a', t.services, (node, row) => text(node, row[0]));
  rows('.website-method-grid > a', t.approach, (node, row) => {
    text(node.querySelector('h3'), row[0]); text(node.querySelector('p'), row[1]);
  });
  rows('.seo-service-option', t.services, (node, row) => {
    text(node.querySelector('h3'), row[1]); text(node.querySelector('p'), row[2]);
    if (row[3]) {
      text(node.querySelector('.solid-button'), row[3]);
      text(node.querySelector('.design-link'), t.misc[0]);
    }
  });
  rows('[data-seo-benefits] details', t.benefits, (node, row) => {
    text(node.querySelector('summary'), row[0]); text(node.querySelector('p'), row[1]);
    node.dataset.action = row[0];
  });
  set('[data-seo-benefit-label]', t.misc[1]);
  rows('.seo-roadmap li', t.process, (node, row) => {
    text(node.querySelector('h3'), row[0]); text(node.querySelector('p'), row[1]);
  });
  set('[aria-labelledby="seo-results-title"] > p', t.results[0]);
  set('[aria-labelledby="seo-results-title"] > p strong', t.results[1]);
  set('[aria-labelledby="seo-results-title"] > p:has(strong)', ' — ' + t.results[2]);
  rows('.seo-metrics dt', t.results.slice(3, 7), text);
  set('.seo-metrics div:last-child small', t.results[7]);
  rows('.seo-case-grid .news-card', t.results.slice(9), (node, description, i) => {
    text(node.querySelector('.news-image span'), t.results[8]);
    text(node.querySelector('.seo-case-caption p'), description);
    node.querySelector('img').alt = t.misc[8+i];
  });
  rows('.website-faq-column details', t.faq, (node, row) => {
    text(node.querySelector('summary'), row[0]); text(node.querySelector('p'), row[1]);
  });
  set('[aria-labelledby="seo-overview-faq-title"] .solid-button', t.misc[0]);
  set('[aria-labelledby="seo-overview-faq-title"] .design-link', t.misc[2]);
  set('.seo-overview-final .cta-copy > p', t.misc[3]);
  set('.seo-overview-final .solid-button', t.misc[0]);
  set('.seo-overview-final .design-link', t.hero[4]);
  attr('.seo-overview-hero img', 'alt', t.misc[4]);
  attr('.seo-benefit-image img', 'alt', t.misc[5]);
  attr('[data-seo-final-image]', 'alt', t.misc[6]);
  attr('[data-seo-final-image]', 'data-mobile-alt', t.misc[7]);
  set('[data-local-seo-form] label', t.city[0]);
  attr('#local-seo-city', 'placeholder', t.city[1]);
  set('[data-local-seo-form] button', t.city[2]);
  set('.local-seo-privacy', t.city[3]);
  set('.local-seo-privacy a', t.city[4]);
  ['invalid', 'sending', 'error', 'fallback'].forEach((key, index) => {
    get('[data-local-seo-form]').setAttribute('data-' + key, t.city[5+index]);
  });
  attr('.article-feed', 'data-ssr-language', locale);
  document.querySelectorAll('.language-menu [data-pending-language-url]').forEach(button => button.removeAttribute('data-pending-language-url'));
  const title = t.title + ' | Studio 17';
  for (const name of ['og:title', 'twitter:title']) get('meta[property="' + name + '"],meta[name="' + name + '"]').setAttribute('content', title);
  for (const name of ['og:description', 'twitter:description']) get('meta[property="' + name + '"],meta[name="' + name + '"]').setAttribute('content', t.hero[1]);
  return { title, description: t.hero[1] };
};
