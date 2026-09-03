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
  'Please include at least 20 characters.',
  'I agree that Studio 17 may use these details to respond to my enquiry.',
  'Send enquiry',
  'Please complete the required fields before sending.',
  'Sending your enquiry…',
  'Thank you. Your enquiry has been sent to Studio 17.',
  'Too many messages were sent from this connection. Please wait and try again.',
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

const contact = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
assert.match(contact, /class="contact-privacy-note"[\s\S]*?href="\/privacy-policy"/);
assert.match(contact, /<form[^>]+aria-describedby="contact-form-status"/);
assert.match(contact, /name="message"[^>]+aria-describedby="contact-message-hint"/);
assert.equal((contact.match(/aria-required="true"/g) || []).length, 5);
assert.match(contact, /id="contact-form-status"[\s\S]*?role="status"[\s\S]*?aria-live="polite"[\s\S]*?aria-atomic="true"/);
assert.match(styles, /\.contact-honeypot[^{]*\{[^}]*clip-path:\s*inset\(50%\)/);
assert.doesNotMatch(styles, /\.contact-honeypot[^{]*\{[^}]*-10000px/);

console.log('Contact locale tests passed.');
