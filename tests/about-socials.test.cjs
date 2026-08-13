'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const languages = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const htmlFiles = ['index.html', 'sitemap.html', 'wip.html', 'contact.html', 'faq.html', 'about.html', 'careers.html', 'career-role.html'];
const about = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
const presentationUrl = 'https://drive.google.com/file/d/1k4c9pzEhKLeXVNI-v90OiolOpS2H_235/view?usp=sharing';
const approvedSocialUrls = [
  'https://www.instagram.com/studio17.world/',
  'https://www.facebook.com/profile.php?id=61582939535174',
  'https://www.linkedin.com/company/studio17world'
];
const aboutStrings = [
  'About Studio 17',
  'Growth works better',
  'when the business works as one system.',
  'From constraint',
  'to connected system.',
  'Selected by purpose,',
  'not sold as a package.',
  'A European foundation',
  'with an international outlook.',
  'See Studio 17',
  'in more detail.',
  'What is currently',
  'limiting your business?',
  'We build the systems behind business growth.',
  'We start with the business, not the deliverable.',
  'Studio 17 identifies commercial, operational and customer-experience constraints, then connects the capabilities required to solve them.',
  'See how we work',
  'Growth works better when the business works as one system.',
  'A website, campaign, CRM, content programme or AI workflow can each be useful. Their value increases when they support the same customer journey and business objective.',
  'That is why Studio 17 begins by understanding the constraint. We then select and connect the right capabilities instead of forcing every business into a predetermined package.',
  'Every component must justify its role in the wider system.',
  'From constraint to connected system.',
  'Strategy and execution stay connected from the first question to the working solution.',
  'Understand the business',
  'We begin with the goals, audience, customer journey, team and current way of working.',
  'Identify the constraint',
  'We focus on the friction that is limiting growth, conversion, service or operational efficiency.',
  'Design the system',
  'We connect only the capabilities that have a clear role in solving the identified problem.',
  'Build, measure and improve',
  'We implement the system, observe how it performs and improve it using useful evidence.',
  'Selected by purpose, not sold as a package.',
  'The combination changes with the business problem. Each capability has a defined role and must support the same outcome.',
  'A European foundation with an international outlook.',
  'Studio 17 works across languages, markets and disciplines. The objective remains the same: understand the business clearly and build a system that people can use.',
  'See Studio 17 in more detail.',
  'Our company presentation introduces Studio 17 and the thinking behind our work. The presentation opens in Greek on Google Drive.',
  'View the presentation',
  'Follow Studio 17.',
  'What is currently limiting your business?',
  'Tell us where growth, conversion or operations are breaking down. We will help identify the clearest next step.',
  'Talk to Studio 17',
  'Studio 17 social media profiles',
  'Studio 17 on Instagram',
  'Studio 17 on Facebook',
  'Studio 17 on LinkedIn',
  'Studio 17 on Google'
];

assert.match(about, /<body class="about-page">/);
assert.equal((about.match(/<h1\b/g) || []).length, 1, 'About must have one h1');
assert.equal((about.match(/class="design-heading about-display-heading"/g) || []).length, 6, 'About must reuse the homepage highlighted heading component for every main content section');
assert.match(about, /<h2 id="about-cta-title">What is currently <span>limiting your business\?<\/span><\/h2>/, 'About closing CTA must reuse the homepage highlighted heading treatment');
assert.match(about, /rel="canonical" href="https:\/\/www\.studio17\.world\/about"/);
assert.equal((about.match(/hreflang=/g) || []).length, 7, 'About must expose x-default and six language alternates');
assert.match(about, new RegExp(`href="${presentationUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" target="_blank" rel="noopener noreferrer"`));

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(source, /\/wip\?for=about/, `${file} still sends About to WIP`);
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
  assert.ok(data.meta.about?.title, `${language} is missing About metadata title`);
  assert.ok(data.meta.about?.description, `${language} is missing About metadata description`);
  if (language === 'en') continue;
  for (const key of aboutStrings) assert.ok(data.strings[key], `${language} is missing About translation: ${key}`);
}

const i18n = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
assert.match(i18n, /classList\.contains\('about-page'\)/);
assert.match(i18n, /'\/about': 'about\.html'/);

const sharedScript = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
assert.match(sharedScript, /https:\/\/share\.google\/B3qQDpUvLnv5UAZ4G/);
assert.match(sharedScript, /footer-social-link social-google/);
assert.match(sharedScript, /target = '_blank'/);
assert.match(sharedScript, /rel = 'noopener noreferrer'/);

console.log('About page, presentation and social-link tests passed.');
