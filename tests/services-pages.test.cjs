'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const jsonLd = html => html.split('<script type="application/ld+json">').slice(1).map(block => JSON.parse(block.split('</script>')[0]));

test('services catalogue exposes every service without internal codes', () => {
  const html = read('services.html');
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.studio17\.world\/services"/);
  assert.equal((html.match(/class="service-row"/g) || []).length, 43);
  assert.equal((html.match(/class="service-category"/g) || []).length, 5);
  assert.doesNotMatch(html, /WEB-\d+/);
  assert.equal(jsonLd(html)[0]['@type'], 'CollectionPage');
  for (const count of ['8 services', '13 services', '11 services', '7 services', '4 services']) assert.match(html, new RegExp(count));
  assert.match(html, /class="services-cta-media"><img src="\/Images\/CTA_Question_Image\.webp"/);
  assert.doesNotMatch(html, /class="cta-mark"[\s\S]*?messages-square/);
  assert.match(html, /class="cta-actions"[\s\S]*?href="\/contact"[\s\S]*?href="\/wip\?for=portfolio"[\s\S]*?See our work/);
});

test('website development page preserves commercial and portfolio requirements', () => {
  const html = read('website-development.html');
  assert.match(html, /canonical" href="https:\/\/www\.studio17\.world\/services\/website-development"/);
  assert.equal((html.match(/class="website-package-card(?: [^"]*)?"/g) || []).length, 5);
  for (const price of ['450,00 €', '950,00 €', '1&nbsp;500,00 €', '2&nbsp;250,00 €', '3&nbsp;500,00 €']) assert.ok(html.includes(price), price);
  assert.match(html, /website-package-card is-popular[\s\S]*Most bought[\s\S]*Website – Starter/);
  for (const term of ['SEO foundation', 'GEO foundation', 'Technical SEO']) assert.ok(html.includes(term), term);
  for (const asset of ['/Images/100pratos_website.png', '/Images/phosoptics_website.png', '/Images/terrassivilla.jpg']) assert.ok(html.includes(asset), asset);
  assert.ok(html.includes('https://www.100pratos.pt/'));
  assert.ok(html.includes('https://www.phosoptics.com/en'));
  assert.ok(html.includes('/insights/terrassivilla-accessible-tourism-in-the-azores'));
  assert.match(html, /<span>Some of the websites<\/span> we developed\.<\/h2><p>Selected websites across our clients\.<\/p>/);
  const sectionOrder = ['website-work', 'website-packages', 'website-foundation'].map(className => html.indexOf(`class="${className}"`));
  assert.ok(sectionOrder.every((position, index) => position >= 0 && (index === 0 || position > sectionOrder[index - 1])), 'portfolio, packages and foundations must appear in the approved order');
  const structured = jsonLd(html)[0];
  assert.equal(structured['@type'], 'Service');
  assert.equal(structured.hasOfferCatalog.itemListElement.length, 5);
});

test('SEO page is an international, evidence-safe commercial service page', () => {
  const html = read('seo.html');
  assert.match(html, /<html lang="en" data-supported-languages="en,el,ru">/);
  assert.match(html, /canonical" href="https:\/\/www\.studio17\.world\/services\/seo"/);
  assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 4);
  for (const language of ['x-default', 'en', 'el', 'ru']) assert.match(html, new RegExp(`hreflang="${language}"`));
  for (const language of ['pt-PT', 'es', 'he']) assert.doesNotMatch(html, new RegExp(`hreflang="${language}"`));
  assert.match(html, /<h1[^>]*><span>SEO services<\/span> that connect search demand to growth\.<\/h1>/);
  assert.match(html, /<div class="hero-media"[^>]*><img src="\/Images\/SEO_heroimage\.webp" alt="" width="1744" height="296">/);
  assert.equal((html.match(/class="seo-capability-grid"[\s\S]*?<\/div><\/div><\/section>/)?.[0].match(/<article>/g) || []).length, 9);
  assert.match(html, /<span>We connect the query,<\/span> the page and the business action\./);
  assert.doesNotMatch(html, /SEO is a growth system/);
  assert.equal((html.match(/class="seo-growth-decisions"[\s\S]*?<\/div><\/div><ol class="seo-growth-route"/)?.[0].match(/<article>/g) || []).length, 3);
  assert.equal((html.match(/class="seo-growth-route"[\s\S]*?<\/ol>/)?.[0].match(/<li>/g) || []).length, 4);
  assert.equal((html.match(/class="seo-process"[\s\S]*?<\/section>/)?.[0].match(/<li>/g) || []).length, 5);
  assert.equal((html.match(/class="website-faq-list"[\s\S]*?<\/div><\/div><\/section>/)?.[0].match(/<details>/g) || []).length, 7);
  for (const destination of ['/contact?service=seo', '/services/website-development', '/news', 'https://www.trustpilot.com/review/studio17.world']) assert.ok(html.includes(destination), destination);
  assert.match(html, /We do not present broader client work as invented SEO results/);
  assert.match(html, /class="seo-cta-media"[^>]*>[\s\S]*?src="\/Images\/CTA_SEO_MainIMAGE\.webp"[^>]*width="462" height="260"/);
  assert.doesNotMatch(html, /aggregateRating|"review"\s*:/);

  const structured = jsonLd(html)[0];
  assert.equal(structured['@type'], 'Service');
  assert.equal(structured.areaServed, 'Worldwide');
  assert.equal(structured.hasOfferCatalog.itemListElement.length, 10);
  assert.equal(structured.aggregateRating, undefined);
  assert.equal(jsonLd(html).some(entry => entry['@type'] === 'FAQPage'), false);
});

test('service cards and catalogue rows use seamless matching surfaces', () => {
  const css = read('styles.css');
  assert.doesNotMatch(css, /\.service-family-card-featured\s*\{[^}]*background:\s*var\(--blue\)/);
  assert.match(css, /\.service-category-body\s*\{[^}]*padding:\s*0;/);
  assert.match(css, /\.service-row:last-child:nth-child\(odd\)\s*\{\s*grid-column:\s*1\s*\/\s*-1;/);
  assert.match(css, /\.services-cta-media\s*\{[^}]*width:\s*min\(520px,100%\);[^}]*aspect-ratio:\s*2\s*\/\s*1;/);
  assert.match(css, /\.services-cta-media img\s*\{[^}]*object-fit:\s*cover;[^}]*transform:\s*scale\(1\.55\);/);
});

test('all service locales preserve the page schema and content counts', () => {
  const locales = ['pt-PT', 'es', 'el', 'ru', 'he'];
  const reference = require(path.join(root, 'service-locales', 'pt-PT.json'));
  for (const locale of locales) {
    const data = require(path.join(root, 'service-locales', `${locale}.json`));
    assert.deepEqual(Object.keys(data.pages.services), Object.keys(reference.pages.services), locale);
    assert.deepEqual(Object.keys(data.pages.websiteDevelopment), Object.keys(reference.pages.websiteDevelopment), locale);
    assert.equal((data.pages.services.catalogue.match(/service-row/g) || []).length, 43, locale);
    assert.equal((data.pages.websiteDevelopment.packages.match(/website-package-card/g) || []).length, 5, locale);
    assert.doesNotMatch(data.pages.services.catalogue, /WEB-\d+/, locale);
    assert.match(data.pages.services.closing, /class="cta-actions"[\s\S]*?href="\/contact"[\s\S]*?href="\/wip\?for=portfolio"/, locale);
  }
});

test('SEO page translations are complete only for the approved Greek and Russian scope', () => {
  const englishKeys = ['meta', 'heroTitle', 'heroHeading', 'heroCopy', 'heroAction', 'opportunity', 'growthSystem', 'capabilitiesHeading', 'capabilities', 'method', 'aiSearch', 'proof', 'why', 'process', 'faqHeading', 'faq', 'closing'];
  for (const locale of ['el', 'ru']) {
    const page = require(path.join(root, 'service-locales', `${locale}.json`)).pages.seo;
    assert.deepEqual(Object.keys(page), englishKeys, locale);
    assert.equal((page.capabilities.match(/<article>/g) || []).length, 9, locale);
    assert.equal((page.growthSystem.match(/seo-growth-decisions/g) || []).length, 1, locale);
    assert.equal((page.growthSystem.match(/<article\b/g) || []).length, 4, locale);
    assert.equal((page.growthSystem.match(/<li>/g) || []).length, 4, locale);
    assert.equal((page.method.match(/<li>/g) || []).length, 4, locale);
    assert.equal((page.process.match(/<li>/g) || []).length, 5, locale);
    assert.equal((page.faq.match(/<details>/g) || []).length, 7, locale);
  }
  for (const locale of ['pt-PT', 'es', 'he']) {
    const pages = require(path.join(root, 'service-locales', `${locale}.json`)).pages;
    assert.equal(pages.seo, undefined, `${locale} should not advertise an unapproved SEO translation`);
  }
});

test('clean routes and sitemaps include every published service page', () => {
  const server = read('dev-server.cjs');
  const vercel = read('vercel.json');
  const sitemap = read('api/sitemap.js');
  assert.ok(server.includes("['/services', 'services.html']"));
  assert.ok(server.includes("['/services/website-development', 'website-development.html']"));
  assert.ok(server.includes("['/services/seo', 'seo.html']"));
  assert.ok(vercel.includes('"source": "/services/website-development"'));
  assert.ok(vercel.includes('"source": "/services/seo"'));
  assert.ok(sitemap.includes('`${SITE_URL}/services`'));
  assert.ok(sitemap.includes('`${SITE_URL}/services/website-development`'));
  assert.ok(sitemap.includes('`${SITE_URL}/services/seo`'));
  assert.match(read('sitemap.html'), /href="\/services\/seo">SEO services\s*<i/);
});

test('mobile menu remains limited to the approved five destinations', () => {
  for (const file of ['services.html', 'website-development.html', 'seo.html']) {
    const html = read(file);
    const menu = html.match(/<div class="mobile-menu"[\s\S]*?<\/div>\s*<\/header>/)?.[0] || '';
    assert.equal((menu.match(/<a /g) || []).length, 5, file);
    for (const label of ['Services', 'Work', 'About', 'News', 'Careers']) assert.ok(menu.includes(`>${label}</a>`), `${file}: ${label}`);
    assert.ok(menu.includes('href="/services"'));
    assert.doesNotMatch(menu, /Sitemap|FAQ/);
  }
});

test('SEO entry is accepted and preselected by the contact workflow', () => {
  assert.match(read('contact.html'), /<option value="seo">SEO<\/option>/);
  assert.match(read('contact.js'), /new URLSearchParams\(location\.search\)\.get\('service'\)/);
  assert.match(read('api/contact.js'), /'seo'/);
  assert.match(read('api/contact.js'), /seo:\s*'SEO'/);
});
