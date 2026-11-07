'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseHTML } = require('linkedom');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const { escape } = require('../server/_faq-render.cjs');
const pending = slug => '/wip#for=' + slug;
const services = [
  ['SEO', 'SEO strategy & management', 'Get found by the people searching for what you offer. We combine keyword research, on-page optimisation, technical improvements and ongoing performance analysis to grow organic visibility and generate qualified leads.', 'Boost your search visibility', '/services/seo-strategy', 'SEO.webp'],
  ['Local SEO', 'Get discovered by customers near you', 'Make your business easier to find on Google Search and Google Maps. We improve your local presence, business information and location-specific content.', 'Get found locally', pending('local-seo'), 'NeuropposBarberShop.webp'],
  ['Technical SEO', 'Build a stronger foundation for search', 'Improve crawling, indexing, website architecture, structured data and performance to remove technical barriers to organic growth.', 'Unlock your website’s potential', pending('technical-seo'), 'SEO_heroimage.webp'],
  ['SEO Content', 'Content that answers questions and drives growth', 'From keyword-led landing pages to helpful articles, we plan and optimise content around real search intent and business opportunities.', 'Turn content into clients', pending('seo-content-strategy'), 'Every_priority_query_needs_a_purpose_image.webp'],
  ['International SEO', 'Reach customers across borders', 'Expand into new countries and languages with multilingual website structures, geographic targeting and localised content.', 'Reach new markets', pending('international-seo'), 'Terrassivilla_Image_Showcase_General-compressed.avif'],
  ['Ecommerce SEO', 'Turn product searches into sales', 'Help customers find your products when they are ready to buy. We optimise product pages, category structures, technical ecommerce SEO and shopping-focused content.', 'Get more product sales', pending('ecommerce-seo'), 'SEO.webp'],
  ['SEO Audit', 'Find what’s holding your website back', 'Assess technical health, content, search visibility and competitive gaps. Get recommendations prioritised by business impact.', 'Discover SEO opportunities', '/contact/free-website-audit?intent=seo', 'Every_priority_query_needs_a_purpose_image.webp'],
  ['SEO Consulting', 'Expert SEO guidance for better decisions', 'Get strategic expertise without committing to fully managed services. We help your team prioritise opportunities and build an actionable plan.', 'Plan your SEO growth', pending('seo-consulting'), 'CTA_SEO_MainIMAGE.webp']
];
const template = read('seo.html');
const home = parseHTML(read('home.template.html')).document;
const clients = home.querySelector('section.trusted').cloneNode(true);
const marquees = clients.querySelectorAll('.partner-marquee');
Array.from(marquees).slice(1).forEach(row => row.remove());
const articles = home.querySelector('section.news-section').cloneNode(true);
const serviceMarkup = '<nav class="seo-service-tabs" aria-label="SEO services">' + services.map(([name], index) => '<a href="#seo-option-' + index + '">' + escape(name) + '</a>').join('') + '</nav>' + services.map(([, title, description, action, href, image], index) =>
  '<article class="seo-overview-split seo-service-option" id="seo-option-' + index + '"><div><h3>' + escape(title) + '</h3><p>' + escape(description) + '</p><div class="seo-overview-actions"><a class="solid-button" href="' + href + '">' + escape(action) + '</a><a class="design-link" href="/contact?service=seo">Talk to Sales →</a></div></div><img src="/Images/' + image + '" alt="" loading="lazy"></article>'
).join('');

const save = (document, filename, title, route, description, languages) => {
  const url = 'https://www.studio17.world' + route;
  document.title = title;
  document.documentElement.setAttribute('data-supported-languages', languages);
  document.documentElement.setAttribute('data-preserve-page-metadata', '');
  document.querySelector('link[rel="canonical"]').href = url;
  document.querySelectorAll('link[hreflang], script[type="application/ld+json"]').forEach(node => node.remove());
  if (route === '/services/seo') {
    for (const [language, href] of [['en', url], ['he', 'https://www.studio17.world/he/services/seo'], ['x-default', url]]) {
      const alternate = document.createElement('link');
      alternate.rel = 'alternate'; alternate.hreflang = language; alternate.href = href;
      document.head.append(alternate);
    }
  }
  for (const [selector, value] of Object.entries({ 'meta[name="description"]': description, 'meta[property="og:title"]': title, 'meta[property="og:description"]': description, 'meta[property="og:url"]': url, 'meta[name="twitter:title"]': title, 'meta[name="twitter:description"]': description })) {
    document.querySelector(selector)?.setAttribute('content', value);
  }
  document.querySelectorAll('img[src^="Images/"]').forEach(img => img.setAttribute('src', '/' + img.getAttribute('src')));
  fs.writeFileSync(path.join(root, filename), '<!doctype html>\n' + document.documentElement.outerHTML + '\n');
};
const overview = parseHTML(template).document;
overview.querySelector('main').className = 'seo-overview';
overview.querySelector('main').innerHTML = read('seo-overview-content.inc')
  .replace('<!-- SEO_CLIENTS -->', clients.outerHTML)
  .replace('<!-- SEO_SERVICES -->', serviceMarkup)
  .replace('<!-- SEO_ARTICLES -->', articles.outerHTML);
overview.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="/seo-overview.css"><script defer src="/seo-overview.js"></script><script defer src="/article-feed.js"></script>');
const setupLanguageMenu = (document, slug) => {
  document.querySelectorAll('.language-menu [data-lang]').forEach(button => {
    const locale = { 'pt-PT': 'pt', es: 'es', el: 'el', ru: 'ru' }[button.dataset.lang];
    if (locale) button.dataset.pendingLanguageUrl = '/' + locale + '/wip?for=' + slug;
    if (button.dataset.lang === 'he') button.remove();
  });
};
setupLanguageMenu(overview, 'seo');
save(overview, 'seo-overview.html', 'SEO Services & AI Visibility | Studio 17', '/services/seo', 'Get found in organic search with Studio 17. Explore local, technical, international and ecommerce SEO, content strategy and AI visibility. Request a free SEO audit.', 'en');
const strategy = parseHTML(template).document;
setupLanguageMenu(strategy, 'seo-strategy');
strategy.querySelector('h1').textContent = 'SEO strategy & management';
strategy.querySelector('footer a[href="/services/seo"]')?.removeAttribute('aria-current');
save(strategy, 'seo-strategy.html', 'SEO Strategy & Management | Studio 17', '/services/seo-strategy', 'Studio 17 SEO strategy and management: keyword research, technical foundations, content, reporting and ongoing optimisation.', 'en');
