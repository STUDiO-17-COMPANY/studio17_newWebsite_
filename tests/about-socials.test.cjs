'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const languages = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const htmlFiles = ['index.html', 'api/sitemap-template.html', 'wip.html', 'contact.html', 'faq.html', 'about.html', 'team.html', 'our-story.html', 'careers.html', 'career-role.html'];
const about = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const presentationUrl = 'https://drive.google.com/file/d/1k4c9pzEhKLeXVNI-v90OiolOpS2H_235/view?usp=sharing';
const approvedSocialUrls = [
  'https://www.instagram.com/studio17.world/',
  'https://www.facebook.com/profile.php?id=61582939535174',
  'https://www.linkedin.com/company/studio17world'
];
const untranslatedBrandContent = /^(RG Automotive|Chome Rats|For Social Media Lovers|100 Pratos|Terrassi Villa|Selene Island|Phós Optics|Event Studio Cyprus|Nerouppos Barber Shop|Snapdrop|Teaching Economics|Rita Braz|Pantelis Petrou|Miguel Ângelo|Natalia Ioannou|Hugo Filipe|Pedro Leonardo|Gil Barreto|HF|PL|NI|GB|— Portugal)$/;
const aboutMain = about.match(/<main[\s\S]*?<\/main>/)?.[0] || '';
const aboutVisibleStrings = [...new Set([...aboutMain.matchAll(/>([^<>]+)</g)]
  .map(match => match[1].replace(/\s+/g, ' ').trim().replaceAll('&amp;', '&'))
  .filter(Boolean))].filter(value => !untranslatedBrandContent.test(value));
const localeBundleSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'locales', 'locales.js'), 'utf8'), localeBundleSandbox);
const bundledLocales = localeBundleSandbox.window.Studio17LocaleData;

assert.match(about, /<body class="about-page">/);
assert.equal((about.match(/<h1\b/g) || []).length, 1, 'About must have one h1');
assert.match(about, /<h1 id="about-title">The people and purpose <span>behind Studio 17<\/span><\/h1>/);
assert.doesNotMatch(about, /page-hero-icon/, 'About hero must not contain a decorative icon');
assert.match(about, /rel="canonical" href="https:\/\/www\.studio17\.world\/about"/);
assert.equal((about.match(/hreflang=/g) || []).length, 7, 'About must expose x-default and six language alternates');
assert.match(about, new RegExp(`href="${presentationUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" target="_blank" rel="noopener noreferrer"`));
assert.match(about, /Images\/About_heroimage\.webp/);
assert.match(about, /Images\/Team_heroimage\.webp/);

const expectedOrder = ['about-hero', 'about-trusted', 'about-team', 'about-company', 'about-european', 'about-origin', 'about-presentation', 'about-join'];
let previousIndex = -1;
for (const className of expectedOrder) {
  const currentIndex = about.search(new RegExp(`<section class="[^"]*\\b${className}\\b`));
  assert.ok(currentIndex > previousIndex, `${className} must appear in the approved About-page order`);
  previousIndex = currentIndex;
}

assert.equal((about.match(/class="partner-marquee"/g) || []).length, 1, 'About must use one visible partner-logo line');
assert.doesNotMatch(about, /partner-marquee-reverse/, 'About must not use a second reverse logo line');
assert.ok(about.indexOf('We collaborate with businesses and people across markets') > about.indexOf('class="partner-marquee"'), 'global collaboration copy must follow the partner logos');
assert.equal((about.match(/class="about-review-card/g) || []).length, 4, 'About must show four static reviews');
assert.doesNotMatch(about, /about-review[^\n]*data-carousel|data-carousel-(?:prev|next)="about-review/i, 'About reviews must not be a carousel');
assert.doesNotMatch(about, /about-method|about-capabilities|about-culture|about-social|about-cta/, 'About must not include the retired service-selling sections');

assert.match(about, /href="\/our-story"[^>]*>Read the full Studio 17 Story/);
assert.match(about, /id="about-team-track"[\s\S]*?Hugo Filipe[\s\S]*?Pedro Leonardo[\s\S]*?Natalia Ioannou[\s\S]*?Gil Barreto/);
assert.match(about, /href="https:\/\/www\.linkedin\.com\/in\/hugodm-filipe\/"[^>]*aria-label="Hugo Filipe on LinkedIn"/);
assert.match(about, /href="https:\/\/www\.instagram\.com\/hugodmfilipe02\/"[^>]*aria-label="Hugo Filipe on Instagram"/);
assert.match(about, /href="https:\/\/www\.linkedin\.com\/in\/pedro-leonardo-375478330\/"[^>]*aria-label="Pedro Leonardo on LinkedIn"/);
assert.match(about, /href="https:\/\/www\.linkedin\.com\/in\/natalia-ioannou-83527126b\/"[^>]*aria-label="Natalia Ioannou on LinkedIn"/);
assert.equal((about.match(/class="about-team-social-link/g) || []).length, 4, 'only approved team profile links should be published');
assert.doesNotMatch(about, /Pedro Leonardo[\s\S]{0,700}instagram\.com/i, 'Pedro Leonardo must not display an Instagram link without approval');
assert.match(about, /href="\/team"[^>]*>Meet the full team/);
assert.match(about, /href="\/careers" data-force-language="en">View open roles/);
assert.match(about, /Images\/ai-team\.webp/);
assert.match(about, /Images\/ai-hands\.webp/);
assert.match(about, /class="about-european"[\s\S]*?100% European Brand/);
assert.doesNotMatch(about, /The presentation opens in Greek on Google Drive/);
assert.match(about, /data-presentation-preview[\s\S]*?data-presentation-load[\s\S]*?\/preview/);
assert.doesNotMatch(about, /4\.8\/5|TrustScore|trustpilot[^<]*logo/i, 'About must not hard-code changing Trustpilot ratings or restricted assets');

assert.match(styles, /\.about-page, \.about-main \{ background: var\(--paper\); \}/);
assert.match(styles, /\.about-main > section:not\(\.page-hero\) \{ margin-top: 32px; padding-block: 24px;/);
assert.match(styles, /\.about-presentation-placeholder\[hidden\] \{ display: none; \}/, 'loaded presentation must replace the preview placeholder');

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /\/wip#for=about/, `${file} still sends About to WIP`);
  assert.doesNotMatch(source, /footer-social-image|WhatsApp, Instagram, Facebook, LinkedIn, Google, X and Threads/, `${file} still uses the retired seven-logo strip`);
  const footers = [...source.matchAll(/<nav class="footer-social-links(?: footer-social-links-small)?"[\s\S]*?<\/nav>/g)].map(match => match[0]);
  assert.equal(footers.length, 2, `${file} should expose the approved social links in both footer positions`);
  for (const footer of footers) {
    const links = [...footer.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(links, approvedSocialUrls, `${file} footer socials must contain only Instagram, Facebook and LinkedIn`);
    assert.equal((footer.match(/target="_blank" rel="noopener noreferrer"/g) || []).length, 3, `${file} social links must open safely`);
  }
}

for (const language of languages) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${language}.json`), 'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(bundledLocales[language])), data, `${language} runtime locale bundle is stale`);
  assert.ok(data.meta.about?.title, `${language} is missing About metadata title`);
  assert.ok(data.meta.about?.description, `${language} is missing About metadata description`);
  if (language === 'en') continue;
  for (const source of aboutVisibleStrings) assert.ok(data.strings[source], `${language} is missing About translation: ${source}`);
}

const i18n = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
assert.match(i18n, /classList\.contains\('about-page'\)/);
assert.match(i18n, /'\/about': 'about\.html'/);

const sharedScript = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
assert.match(sharedScript, /https:\/\/share\.google\/B3qQDpUvLnv5UAZ4G/);
assert.match(sharedScript, /footer-social-link social-google/);
assert.match(sharedScript, /querySelectorAll\('\[data-presentation-preview\]'\)/);

console.log('About page structure, presentation and social-link tests passed.');
