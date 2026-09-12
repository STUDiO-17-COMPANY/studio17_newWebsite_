'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const languages = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const htmlFiles = ['index.html', 'sitemap.html', 'wip.html', 'contact.html', 'faq.html', 'about.html', 'team.html', 'our-story.html', 'careers.html', 'career-role.html'];
const about = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
const presentationUrl = 'https://drive.google.com/file/d/1k4c9pzEhKLeXVNI-v90OiolOpS2H_235/view?usp=sharing';
const approvedSocialUrls = [
  'https://www.instagram.com/studio17.world/',
  'https://www.facebook.com/profile.php?id=61582939535174',
  'https://www.linkedin.com/company/studio17world'
];
const aboutStrings = [
  'About Studio 17',
  'Our origin:',
  'one growth strategy, connected.',
  'From constraint',
  'to connected system.',
  'Selected by purpose,',
  'not sold as a package.',
  'European roots,',
  'international outlook.',
  'See Studio 17',
  'in more detail.',
  'What is currently',
  'limiting your business?',
  'We build the systems behind business growth.',
  'We start with the business, not the deliverable.',
  'Studio 17 identifies commercial, operational and customer-experience constraints, then connects the capabilities required to solve them.',
  'See how we work',
  'Studio 17 was born from a simple idea: businesses shouldn’t need five different companies to make one growth strategy work.',
  'Read the full Studio 17 Story',
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
  'Studio 17 is headquartered in Limassol, Cyprus, with one of our operations hubs in Portugal. From these two European bases, we work across languages, markets and disciplines while keeping the same principle: understand the business first, then build what it actually needs.',
  'Trusted by businesses across Europe.',
  'The people behind',
  'Team carousel controls',
  'Previous team member',
  'Next team member',
  'Business Developer',
  'Natalia Ioannou social profiles',
  'Natalia Ioannou on LinkedIn',
  'Meet the full team',
  'Culture & values:',
  'Want to build with us? View open roles',
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
assert.equal((about.match(/class="design-heading about-display-heading"/g) || []).length, 7, 'About must reuse the homepage highlighted heading component for every main content section');
assert.match(about, /<h2 id="about-cta-title">What is currently <span>limiting your business\?<\/span><\/h2>/, 'About closing CTA must reuse the homepage highlighted heading treatment');
assert.match(about, /rel="canonical" href="https:\/\/www\.studio17\.world\/about"/);
assert.equal((about.match(/hreflang=/g) || []).length, 7, 'About must expose x-default and six language alternates');
assert.match(about, new RegExp(`href="${presentationUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" target="_blank" rel="noopener noreferrer"`));
assert.match(about, /Images\/About_heroimage\.webp/);
assert.match(about, /href="\/our-story"[^>]*>Read the full Studio 17 Story/);
assert.match(about, /id="about-team-track"[\s\S]*?Hugo Filipe[\s\S]*?Pedro Leonardo[\s\S]*?Natalia Ioannou/);
assert.match(about, /href="https:\/\/www\.linkedin\.com\/in\/hugodm-filipe\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Hugo Filipe on LinkedIn"/);
assert.match(about, /href="https:\/\/www\.instagram\.com\/hugodmfilipe02\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Hugo Filipe on Instagram"/);
assert.match(about, /href="https:\/\/www\.linkedin\.com\/in\/pedro-leonardo-375478330\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Pedro Leonardo on LinkedIn"/);
assert.match(about, /href="https:\/\/www\.linkedin\.com\/in\/natalia-ioannou-83527126b\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="Natalia Ioannou on LinkedIn"/);
assert.equal((about.match(/class="about-team-social-link/g) || []).length, 4, 'only approved team profile links should be published');
assert.doesNotMatch(about, /Pedro Leonardo[\s\S]{0,700}instagram\.com/i, 'Pedro Leonardo must not display an Instagram link without approval');
assert.match(about, /src="Images\/social-linkedin\.svg"/);
assert.match(about, /src="Images\/social-instagram\.svg"/);
assert.doesNotMatch(about, /about-team-social-link[^>]*>[\s\S]{0,180}footer-socials\.png/, 'team icons must not reuse the navy-backed footer sprite');
assert.match(about, /href="\/team"[^>]*>Meet the full team/);
assert.match(about, /href="\/careers" data-force-language="en">Want to build with us\? View open roles/);
assert.doesNotMatch(about, /4\.8\/5|TrustScore|trustpilot[^<]*logo/i, 'About must not hard-code restricted or changing Trustpilot rating assets');

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
