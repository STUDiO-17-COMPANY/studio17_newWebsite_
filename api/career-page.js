'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { CareersError, getPublishedRoleBySlug } = require('./_google-careers');

const SITE_URL = 'https://www.studio17.world';

const escapeHtml = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const safeJson = value => JSON.stringify(value)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');

const plainDescription = value => String(value || '')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 158);

const employmentType = value => {
  const normalised = String(value || '').toLowerCase();
  if (normalised.includes('full')) return 'FULL_TIME';
  if (normalised.includes('part')) return 'PART_TIME';
  if (normalised.includes('intern')) return 'INTERN';
  if (normalised.includes('temporary')) return 'TEMPORARY';
  if (normalised.includes('contract') || normalised.includes('freelance')) return 'CONTRACTOR';
  return undefined;
};

const paragraphsToHtml = paragraphs => (paragraphs || [])
  .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
  .join('');

const listToHtml = items => items?.length
  ? `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
  : '';

const createJobPosting = (role, canonical) => {
  const applicantCountries = (role.applicantCountries || []).filter(Boolean);
  const isRemote = String(role.workModel || '').toLowerCase().includes('remote');
  if (isRemote && !applicantCountries.length) return null;

  const posting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: role.title,
    description: [
      paragraphsToHtml(role.about),
      '<h2>What you will do</h2>',
      listToHtml(role.responsibilities),
      '<h2>What we are looking for</h2>',
      listToHtml(role.requirements)
    ].join(''),
    datePosted: role.createdTime,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Studio 17',
      sameAs: SITE_URL,
      logo: `${SITE_URL}/Images/Studio%2017_logo_black.png`
    },
    identifier: {
      '@type': 'PropertyValue',
      name: 'Studio 17',
      value: role.slug
    },
    url: canonical
  };

  const type = employmentType(role.employmentType);
  if (type) posting.employmentType = type;
  if (isRemote) {
    posting.jobLocationType = 'TELECOMMUTE';
    posting.applicantLocationRequirements = applicantCountries.map(name => ({ '@type': 'Country', name }));
  } else if (role.location) {
    posting.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: role.location,
        ...(applicantCountries[0] ? { addressCountry: applicantCountries[0] } : {})
      }
    };
  }
  return posting;
};

const readTemplate = () => {
  const candidates = [
    path.resolve(process.cwd(), 'career-role.html'),
    path.resolve(__dirname, '..', 'career-role.html')
  ];
  const templatePath = candidates.find(candidate => fs.existsSync(candidate));
  if (!templatePath) throw new Error('Career role template was not bundled.');
  return fs.readFileSync(templatePath, 'utf8');
};

const replaceMetadata = (template, { title, description, robots, seo, bootstrap }) => template
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`)
  .replace(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${escapeHtml(robots)}">`)
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
  .replace('<!-- ROLE_SEO -->', seo)
  .replace('<!-- ROLE_BOOTSTRAP -->', bootstrap);

const sendHtml = (response, status, html, cache = false) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', cache
    ? 'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=300'
    : 'no-store');
  response.end(html);
};

module.exports = async function careerPageHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendHtml(response, 405, 'Method not allowed');
    return;
  }

  const url = new URL(request.url || '/', `https://${request.headers.host || 'www.studio17.world'}`);
  const slug = (url.searchParams.get('slug') || '').toLowerCase();
  const template = readTemplate();

  try {
    const role = await getPublishedRoleBySlug(slug, request);
    const canonical = `${SITE_URL}/careers/${encodeURIComponent(role.slug)}`;
    const description = plainDescription(role.summary);
    const title = `${role.title} — Careers — Studio 17`;
    const structuredData = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: role.title,
        description,
        url: canonical,
        inLanguage: 'en'
      },
      createJobPosting(role, canonical),
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Careers', item: `${SITE_URL}/careers` },
          { '@type': 'ListItem', position: 3, name: role.title, item: canonical }
        ]
      }
    ].filter(Boolean);
    const seo = [
      `<link rel="canonical" href="${canonical}">`,
      '<meta property="og:type" content="website">',
      `<meta property="og:title" content="${escapeHtml(title)}">`,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
      `<meta property="og:url" content="${canonical}">`,
      '<meta property="og:site_name" content="Studio 17">',
      '<meta name="twitter:card" content="summary">',
      `<meta name="twitter:title" content="${escapeHtml(title)}">`,
      `<meta name="twitter:description" content="${escapeHtml(description)}">`,
      `<script type="application/ld+json">${safeJson(structuredData)}</script>`
    ].join('\n  ');
    const bootstrap = `<script>window.__STUDIO17_ROLE__=${safeJson(role)};</script>`;
    const html = replaceMetadata(template, { title, description, robots: 'index,follow', seo, bootstrap });
    sendHtml(response, 200, request.method === 'HEAD' ? '' : html, true);
  } catch (error) {
    const known = error instanceof CareersError;
    const status = known ? error.status : 503;
    const closed = status === 404 || status === 400;
    if (!known || status >= 500) console.error('Career page failed', slug, error?.code || error?.message);
    const title = closed ? 'Role closed — Studio 17' : 'Role unavailable — Studio 17';
    const description = closed
      ? 'This Studio 17 role is no longer open. View the current opportunities on our Careers page.'
      : 'Studio 17 role details are temporarily unavailable.';
    const bootstrap = `<script>window.__STUDIO17_ROLE_ERROR__=${safeJson({ status, code: error?.code || 'CAREERS_UNAVAILABLE' })};</script>`;
    const html = replaceMetadata(template, { title, description, robots: 'noindex,follow', seo: '', bootstrap });
    sendHtml(response, status, request.method === 'HEAD' ? '' : html);
  }
};
