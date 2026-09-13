'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

assert.match(script, /const createSiteAssistance = \(\) =>/);
assert.match(script, /data-lucide="badge-question-mark"/);
assert.match(script, /aria-expanded="false"/);
assert.match(script, /aria-controls="site-assist-panel"/);
assert.match(script, /event\.key === 'Escape'/);
assert.match(script, /const scrollable = Math\.max\(document\.documentElement\.scrollHeight - innerHeight, 1\)/);
assert.match(script, /scrollY \/ scrollable < \.18/);
assert.match(script, /window\.setTimeout\(revealLauncher, 12000\)/);
assert.match(script, /document\.querySelector\('\.analytics-consent'\)/);
assert.match(script, /notice && !notice\.hidden/);
assert.match(script, /studio17:analyticsconsent/);

for (const route of ['/contact', '/careers', '/career-role', '/wip', '/privacy-policy', '/cookie-policy', '/terms']) {
  assert.ok(script.includes(`'${route}'`), `assistance badge must be excluded from ${route}`);
}

const copyKeys = [
  'Not sure where to start?',
  'Open Studio 17 guidance',
  'Close guidance',
  'A useful next step',
  'Tell us what you want to improve. We will help identify the clearest next step.',
  'Talk to Studio 17',
  'Want to improve your search visibility?',
  'Get your free SEO analysis',
  'Planning a new website?',
  'Discuss your website',
  'Could your next website cost €0?',
  'Apply for a free website'
];

for (const language of ['pt-PT', 'es', 'el', 'ru', 'he']) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${language}.json`), 'utf8'));
  for (const key of copyKeys) assert.ok(data.strings[key], `${language} is missing assistance translation: ${key}`);
}

const bundle = fs.readFileSync(path.join(root, 'locales', 'locales.js'), 'utf8');
for (const key of copyKeys) assert.ok(bundle.includes(JSON.stringify(key)), `generated locale bundle is missing: ${key}`);

assert.match(css, /\.site-assist-launcher\s*\{[^}]*width:\s*54px/);
assert.match(css, /\.site-assist\s*\{[^}]*right:\s*max\(20px,calc\(\(100vw - var\(--shell\)\) \/ 2\)\)[^}]*left:\s*auto/);
assert.match(css, /\.site-assist-launcher:hover[^}]*width:\s*238px/);
assert.match(css, /\.site-assist-panel\s*\{[^}]*right:\s*0[^}]*left:\s*auto[^}]*border:\s*3px solid var\(--blue\)[^}]*background:\s*var\(--white\)/);
assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.site-assist-panel\s*\{[^}]*position:\s*fixed/);
assert.match(css, /@media \(hover: none\)[\s\S]*?\.site-assist-launcher:hover\s*\{[^}]*width:\s*54px/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);

console.log('Contextual assistance badge tests passed.');
