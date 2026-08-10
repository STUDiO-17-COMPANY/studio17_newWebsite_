'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'sitemap.html', 'wip.html', 'contact.html', 'faq.html', 'about.html', 'careers.html', 'career-role.html'];
const languages = ['pt-PT', 'es', 'el', 'ru', 'he'];
const consentStrings = [
  'Your privacy choices',
  'We use Google Analytics to understand how our website is used and improve it. Analytics remains off unless you accept.',
  'Accept analytics',
  'Reject analytics',
  'Cookie settings',
  'Review cookie settings'
];

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal((source.match(/<script src="analytics\.js" defer><\/script>/g) || []).length, 1, `${file} must load the shared Analytics controller exactly once`);
  assert.ok(source.indexOf('src="i18n.js"') < source.indexOf('src="analytics.js"'), `${file} must initialise language support before Analytics consent copy`);
  assert.ok(source.indexOf('src="analytics.js"') < source.indexOf('src="script.js"'), `${file} must initialise Analytics consent before page interactions`);
  assert.doesNotMatch(source, /googletagmanager\.com|gtag\(/, `${file} must not bypass the shared consent-first Analytics controller`);
}

const analytics = fs.readFileSync(path.join(root, 'analytics.js'), 'utf8');
assert.match(analytics, /const measurementId = 'G-6VWS39DSNX'/);
assert.match(analytics, /studio17-analytics-consent-v1/);
assert.match(analytics, /'consent', 'default'/);
assert.match(analytics, /analytics_storage:\s*analyticsStorage/);
assert.match(analytics, /ad_storage:\s*denied/);
assert.match(analytics, /ad_user_data:\s*denied/);
assert.match(analytics, /ad_personalization:\s*denied/);
assert.match(analytics, /allow_google_signals:\s*false/);
assert.match(analytics, /allow_ad_personalization_signals:\s*false/);
assert.match(analytics, /googleTagLoaded \|\| !isProduction/);
assert.match(analytics, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=\$\{measurementId\}/);
assert.match(analytics, /data-analytics-consent-accept/);
assert.match(analytics, /data-analytics-consent-reject/);
assert.match(analytics, /clearAnalyticsCookies/);
assert.match(analytics, /studio17:languagechange/);
assert.match(analytics, /studio17:analyticsconsent/);

for (const language of languages) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${language}.json`), 'utf8'));
  for (const key of consentStrings) assert.ok(data.strings[key], `${language} is missing Analytics consent translation: ${key}`);
}

const bundle = fs.readFileSync(path.join(root, 'locales', 'locales.js'), 'utf8');
for (const key of consentStrings) assert.ok(bundle.includes(JSON.stringify(key)), `generated locale bundle is missing: ${key}`);

const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
assert.match(css, /\.analytics-consent\s*\{/);
assert.match(css, /\.analytics-consent\[hidden\]\s*\{\s*display:\s*none/);
assert.match(css, /\.footer-cookie-settings\s*\{/);
assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.analytics-consent-actions\s*\{[^}]*grid-template-columns:\s*1fr/);

console.log('Google Analytics and multilingual consent tests passed.');
