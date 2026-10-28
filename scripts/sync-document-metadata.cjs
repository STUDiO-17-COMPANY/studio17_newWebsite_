'use strict';

// One shared head rule for static pages and the HTML templates bundled into server routes.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { DYNAMIC_TEMPLATES, STATIC_PAGES, localizedPath } = require('../server/_language-routing');
const link = '<link rel="describedby" href="https://www.studio17.world/llms.txt">';
const DEFAULT_SOCIAL_IMAGE = 'https://www.studio17.world/Images/general-OG-cover-image-compressed-2.jpg';
const DEFAULT_SOCIAL_IMAGE_ALT = 'Studio 17 marketing, technology and creative work';
const defaultSocialMetadata = [
  `<meta property="og:image" content="${DEFAULT_SOCIAL_IMAGE}">`,
  `<meta property="og:image:secure_url" content="${DEFAULT_SOCIAL_IMAGE}">`,
  '<meta property="og:image:type" content="image/jpeg">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  `<meta property="og:image:alt" content="${DEFAULT_SOCIAL_IMAGE_ALT}">`,
  '<meta name="twitter:card" content="summary_large_image">',
  `<meta name="twitter:image" content="${DEFAULT_SOCIAL_IMAGE}">`,
  `<meta name="twitter:image:alt" content="${DEFAULT_SOCIAL_IMAGE_ALT}">`
].join('\n  ');

const addDefaultSocialMetadata = (source, name) => {
  // Published articles supply their own Google Doc social-share image in _article-render.js.
  if (name === 'article.html') return source;
  const clean = source
    .replace(/\s*<meta\b[^>]*property=["']og:image(?::[^"']+)?["'][^>]*>/gi, '')
    .replace(/\s*<meta\b[^>]*name=["']twitter:image(?::[^"']+)?["'][^>]*>/gi, '')
    .replace(/\s*<meta\b[^>]*name=["']twitter:card["'][^>]*>/gi, '');
  return clean.replace('</head>', `\n  ${defaultSocialMetadata}\n</head>`);
};

for (const directory of [root, path.join(root, 'api')]) {
  for (const name of fs.readdirSync(directory).filter(name => name.endsWith('.html'))) {
    const file = path.join(directory, name);
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes('</head>')) continue;
    const clean = source.replace(/\s*<link\b[^>]*rel="describedby"[^>]*>/g, '');
    const result = addDefaultSocialMetadata(clean, name).replace('</head>', `\n  ${link}\n</head>`);
    if (result !== source) fs.writeFileSync(file, result);
  }
}

const SITE_URL = 'https://www.studio17.world';
const LANGUAGE_NAMES = {
  en: ['English', 'EN'],
  'pt-PT': ['Português', 'PT'],
  es: ['Español', 'ES'],
  el: ['Ελληνικά', 'EL'],
  ru: ['Русский', 'RU'],
  he: ['עברית', 'HE']
};
const definitions = [...STATIC_PAGES, ...DYNAMIC_TEMPLATES.filter(item => item.route === '/')];
for (const definition of definitions) {
  const file = path.join(root, definition.source);
  if (!fs.existsSync(file)) continue;
  let source = fs.readFileSync(file, 'utf8');
  source = source.replace(/<html\b([^>]*)>/i, (match, attributes) => {
    const clean = attributes
      .replace(/\sdata-rendered-language=(?:"[^"]*"|'[^']*')/gi, '')
      .replace(/\sdata-supported-languages=(?:"[^"]*"|'[^']*')/gi, '');
    return `<html${clean} data-rendered-language="en" data-supported-languages="${definition.locales.join(',')}">`;
  });
  source = source.replace(/(<div\b[^>]*class=["'][^"']*\blanguage-menu\b[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/i, (match, opening, controls, closing) => {
    const missing = definition.locales.filter(locale => !new RegExp(`data-lang=["']${locale.replace('-', '\\-')}["']`, 'i').test(controls));
    const additions = missing.map(locale => {
      const [name, code] = LANGUAGE_NAMES[locale];
      const direction = locale === 'he' ? ' dir="rtl"' : '';
      return `<button type="button" data-lang="${locale}" lang="${locale}"${direction}><span>${name}</span><small>${code}</small></button>`;
    }).join('');
    return `${opening}${controls}${additions}${closing}`;
  });
  source = source.replace(/\s*<link\b[^>]*rel=["']alternate["'][^>]*hreflang=["'][^"']*["'][^>]*>/gi, '');
  const alternates = [
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${localizedPath(definition.route, 'en')}">`,
    ...definition.locales.map(locale => `<link rel="alternate" hreflang="${locale}" href="${SITE_URL}${localizedPath(definition.route, locale)}">`)
  ].join('\n  ');
  const canonical = /<link\b[^>]*rel=["']canonical["'][^>]*>/i;
  source = canonical.test(source)
    ? source.replace(canonical, match => `${match}\n  ${alternates}`)
    : source.replace('</head>', `  ${alternates}\n</head>`);
  fs.writeFileSync(file, source);
}
