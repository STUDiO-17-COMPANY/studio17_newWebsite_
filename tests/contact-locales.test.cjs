'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const locales = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const requiredKeys = [
  'Contact Studio 17',
  'Let’s build what comes next.',
  'Tell us where you want to go.',
  'Tell us about the project.',
  'Name',
  'Company',
  'Phone',
  'What can we help with?',
  'Select a service',
  'Indicative budget',
  'Project details',
  'Send enquiry',
  'Sending your enquiry…',
  'Thank you. Your enquiry has been sent to Studio 17.',
  'The contact form is temporarily unavailable. You can email us directly at contact@studio17.world.'
];

for (const locale of locales) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${locale}.json`), 'utf8'));
  assert.ok(data.meta.contact?.title, `${locale} is missing the contact title`);
  assert.ok(data.meta.contact?.description, `${locale} is missing the contact description`);
  if (locale === 'en') continue;
  for (const key of requiredKeys) {
    assert.ok(data.strings[key], `${locale} is missing: ${key}`);
  }
}

const bundle = fs.readFileSync(path.join(root, 'locales', 'locales.js'), 'utf8');
assert.match(bundle, /"contact":\s*\{/);

console.log('Contact locale tests passed.');
