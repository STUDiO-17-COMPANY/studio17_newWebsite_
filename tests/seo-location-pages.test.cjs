'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = [
  { file: 'seo-cyprus.html', route: '/seo/cyprus', market: 'cyprus', areaType: 'Country', areaName: 'Cyprus' },
  { file: 'seo-limassol.html', route: '/seo/limassol', market: 'limassol', areaType: 'City', areaName: 'Limassol' }
];

const titles = new Set();
const descriptions = new Set();
const headings = new Set();

for (const page of pages) {
  const source = read(page.file);
  const title = source.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = source.match(/<meta name="description" content="([^"]+)">/)?.[1];
  const h1Matches = [...source.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  const canonical = `https://www.studio17.world${page.route}`;
  const structuredDataSource = source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const structuredData = JSON.parse(structuredDataSource);

  assert.ok(title && description, `${page.file} requires a title and description`);
  assert.equal(h1Matches.length, 1, `${page.file} must have one H1`);
  assert.match(source, new RegExp(`<link rel="canonical" href="${canonical.replaceAll('/', '\\/')}"`));
  assert.equal((source.match(/hreflang=/g) || []).length, 4, `${page.file} must expose x-default, EN, EL and RU alternates`);
  assert.match(source, new RegExp(`href="\\/contact\\?service=seo&amp;market=${page.market}"`));
  assert.match(source, /Get Your Free SEO Analysis/);
  assert.match(source, /Talk to Sales/);
  assert.match(source, /href="\/services\/seo"/);
  assert.equal((source.match(/<details>/g) || []).length, 8, `${page.file} must contain eight decision FAQs`);
  assert.doesNotMatch(source, /<h[12][^>]*>[\s\S]*?\.<\/h[12]>/, `${page.file} headings must not end with a period`);
  assert.match(source, /<section class="closing-cta seo-location-closing"[\s\S]*?src="\/Images\/SEO\.webp"/, `${page.file} must use the shared SEO CTA artwork`);
  assert.match(source, /class="seo-related-pages"[\s\S]*?href="\/services\/seo"[\s\S]*?href="\/seo\/cyprus"[\s\S]*?href="\/seo\/limassol"/, `${page.file} must expose the related SEO navigation`);
  assert.doesNotMatch(source, /aggregateRating|"review"\s*:/i, `${page.file} must not invent rating or review structured data`);
  assert.equal(structuredData['@type'], 'Service');
  assert.equal(structuredData.areaServed['@type'], page.areaType);
  assert.equal(structuredData.areaServed.name, page.areaName);

  titles.add(title);
  descriptions.add(description);
  headings.add(h1Matches[0][1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
}

assert.equal(titles.size, pages.length, 'Location pages must have unique titles');
assert.equal(descriptions.size, pages.length, 'Location pages must have unique descriptions');
assert.equal(headings.size, pages.length, 'Location pages must have unique H1 copy');

const localeContext = { window: { Studio17ServiceLocaleData: {} } };
vm.createContext(localeContext);
vm.runInContext(read(path.join('service-locales', 'seo-locations.js')), localeContext);
for (const page of pages) {
  const pageKey = page.market === 'cyprus' ? 'seoCyprus' : 'seoLimassol';
  const serviceKeys = [...read(page.file).matchAll(/data-service-key="([^"]+)"/g)].map(match => match[1]);
  for (const locale of ['el', 'ru']) {
    const localizedPage = localeContext.window.Studio17ServiceLocaleData[locale]?.[pageKey];
    assert.ok(localizedPage, `${pageKey} must exist in ${locale}`);
    assert.deepEqual(serviceKeys.filter(key => !(key in localizedPage)), [], `${pageKey} has missing ${locale} regions`);
    assert.equal((localizedPage.faq.match(/<details>/g) || []).length, 8, `${pageKey} ${locale} must contain eight FAQs`);
  }
}

const sitemap = read(path.join('api', 'sitemap.js'));
assert.match(sitemap, /SITE_URL}\/seo\/cyprus/);
assert.match(sitemap, /SITE_URL}\/seo\/limassol/);

const seoServicePage = read('seo.html');
assert.match(seoServicePage, /class="seo-market-directory"[\s\S]*?href="\/seo\/cyprus"[\s\S]*?href="\/seo\/limassol"/);
const limassolPage = read('seo-limassol.html');
assert.match(limassolPage, /<title>SEO Company Limassol \| Local SEO Services \| SEO Services<\/title>/);
assert.match(limassolPage, /<h1[^>]*>[\s\S]*?SEO agency in Limassol[\s\S]*?<\/h1>/);
for (const capability of ['Technical SEO', 'On-page SEO', 'Local SEO', 'Google Business Profile', 'Search-led content', 'Search Console', 'AI search &amp; GEO']) {
  assert.match(limassolPage, new RegExp(capability), `Limassol page must describe ${capability}`);
}
for (const industry of ['Real estate', 'Hospitality', 'Restaurants', 'Professional services', 'Automotive', 'Retail']) {
  assert.match(limassolPage, new RegExp(`<h3>${industry}<\\/h3>`), `Limassol page must address ${industry}`);
}
assert.match(limassolPage, /href="https:\/\/www\.phosoptics\.com\/en"/);
assert.match(limassolPage, /Find the gaps between Maps, your website and your next client/);
assert.doesNotMatch(limassolPage, /Find the gaps between Maps, your website and the next enquiry/);
assert.match(limassolPage, /id="seo-limassol-proof-track"[\s\S]*?PhosOpticsWebsiteMainPage\.webp[\s\S]*?GoogleReviewTag\.webp[\s\S]*?Nerouppos Barber Shop/);
assert.match(limassolPage, /data-carousel-prev="seo-limassol-proof-track"[\s\S]*?data-carousel-next="seo-limassol-proof-track"/);
assert.ok(limassolPage.indexOf('seo-limassol-proof') > limassolPage.indexOf('seo-limassol-discovery'));
assert.ok(limassolPage.indexOf('seo-limassol-proof') < limassolPage.indexOf('seo-limassol-services'));
assert.match(limassolPage, /data-infinite-carousel/);
assert.match(limassolPage, /class="review-stars" aria-label="5 out of 5 stars"[\s\S]*?(?:data-lucide="star"[\s\S]*?){5}/);
assert.match(limassolPage, /href="https:\/\/share\.google\/XQClN89HrSWhHBMHR"/);
assert.match(limassolPage, /href="\/wip\?for=nerouppos-barber-shop-local-seo-case-study"/);
assert.match(limassolPage, /href="https:\/\/www\.trustpilot\.com\/reviews\/69bd096cfa469b4a641ef444"/);
assert.match(limassolPage, /href="\/seo\/cyprus"/);
assert.match(limassolPage, /How much does SEO cost in Limassol\?/);
assert.match(limassolPage, /Can SEO help my business appear on Google Maps\?/);
assert.match(limassolPage, /class="seo-local-system"[\s\S]*?Search demand[\s\S]*?Maps visibility[\s\S]*?Trust and relevance[\s\S]*?Website views for clients/);
assert.match(limassolPage, /class="seo-local-system-lead"[\s\S]*?src="\/Images\/LimassolBusinessBulding\.jpg"/);
assert.doesNotMatch(limassolPage.match(/class="seo-local-system"[\s\S]*?<\/ol><\/div>/)?.[0] || '', /<b>0[1-4]<\/b>/);
assert.doesNotMatch(limassolPage, /Illustrative visibility example/);
assert.match(limassolPage, /data-seo-visibility-counter data-target="172">172K<[\s\S]*?views \/ 3 months[\s\S]*?Website views for clients/);
const localPlan = limassolPage.match(/class="seo-location-section seo-local-plan"[\s\S]*?<\/ol>/)?.[0] || '';
assert.doesNotMatch(localPlan, /<span>0[1-5]<\/span>/);
assert.match(localPlan, /Track data/);
assert.match(read('styles.css'), /@keyframes seo-plan-arrow-flow/);
assert.match(read('styles.css'), /@keyframes seo-plan-arrow-down/);
assert.match(read('styles.css'), /\.seo-location-section \{[^}]*margin-top: var\(--section-gap\)[^}]*background: var\(--paper\)/);
assert.match(read('styles.css'), /\.seo-location-text-link \{[^}]*color: var\(--white\); background: var\(--blue\)/);
assert.match(read('styles.css'), /\.website-faq-list details p a \{[^}]*color: var\(--blue\)/);
assert.match(read('service-pages.js'), /removeSeoLocationHeadingPeriods/);
assert.match(read('service-pages.js'), /updateRelatedSeoNavigation/);
assert.match(read('service-pages.js'), /enhanceSeoVisibilityCounter/);
assert.match(read('service-pages.js'), /enhanceSeoProofCarousel/);
assert.match(read('service-pages.js'), /cloneNode\(true\)/);
assert.match(read('service-pages.js'), /setInterval/);
assert.match(read('service-pages.js'), /requestAnimationFrame/);
assert.match(read('service-pages.js'), /prefers-reduced-motion/);
assert.match(read('seo-cyprus.html'), /href="\/seo\/limassol"/);
assert.match(read('index.html'), /aria-label="Services"[\s\S]*?href="\/services\/seo"/);

console.log('SEO location landing page tests passed.');
