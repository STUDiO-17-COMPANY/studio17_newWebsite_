'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publicHtmlFiles = [
  'index.html',
  'sitemap.html',
  'wip.html',
  'contact.html',
  'faq.html',
  'about.html',
  'careers.html',
  'career-role.html'
];
const retiredDecorativeClasses = [
  'sitemap-eyebrow',
  'wip-eyebrow',
  'contact-eyebrow',
  'contact-section-label',
  'faq-eyebrow',
  'about-eyebrow',
  'about-section-label',
  'careers-eyebrow'
];

for (const file of publicHtmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const className of retiredDecorativeClasses) {
    assert.doesNotMatch(source, new RegExp(`class="[^"]*\\b${className}\\b`), `${file} still contains the retired ${className} mini-title`);
  }
}

const about = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
assert.match(about, /class="about-intro-heading reveal"[\s\S]*?<h2 class="design-heading about-display-heading" id="about-intro-title">/);
assert.match(about, /class="about-intro-copy reveal"[\s\S]*?class="about-intro-text"[\s\S]*?<blockquote>Every component must justify its role in the wider system\.<\/blockquote>/);
assert.doesNotMatch(about, />Our point of view<|>The principle</, 'About still contains decorative mini-title copy');

const faq = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');
assert.doesNotMatch(faq, /class="faq-group-heading[^>]*>[\s\S]*?<p>0[1-4]<\/p>/, 'FAQ group headings still contain decorative ordinal labels');

const role = fs.readFileSync(path.join(root, 'career-role.html'), 'utf8');
assert.match(role, /class="career-role-department" data-role-department/, 'Role department metadata must remain available after the decorative-label cleanup');

const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
assert.match(css, /\.about-intro-copy\s*\{[^}]*grid-template-columns:/, 'About point-of-view copy needs a balanced desktop grid');
assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.about-intro-copy\s*\{[^}]*grid-template-columns:\s*1fr/, 'About point-of-view copy must stack on narrow screens');

console.log('Page hierarchy and decorative mini-title tests passed.');
