'use strict';

const SUPPORTED_LOCALES = ['en', 'pt-PT', 'es', 'el', 'ru', 'he'];
const LOCALE_PREFIXES = { en: '', 'pt-PT': 'pt', es: 'es', el: 'el', ru: 'ru', he: 'he' };
const PREFIX_LOCALES = Object.fromEntries(
  Object.entries(LOCALE_PREFIXES).filter(([, prefix]) => prefix).map(([locale, prefix]) => [prefix, locale])
);

const ALL_LOCALES = [...SUPPORTED_LOCALES];
const ENGLISH_ONLY = ['en'];
const STATIC_PAGES = [
  { route: '/contact', source: 'contact.html', page: 'contact', locales: ALL_LOCALES },
  { route: '/faq', source: 'faq.html', page: 'faq', locales: ALL_LOCALES },
  { route: '/about', source: 'about.html', page: 'about', locales: ALL_LOCALES },
  { route: '/our-story', source: 'our-story.html', page: 'ourStory', locales: ALL_LOCALES },
  { route: '/team', source: 'team.html', page: 'team', locales: ALL_LOCALES },
  { route: '/services', source: 'services.html', page: 'services', locales: ALL_LOCALES },
  { route: '/services/website', source: 'website-services.html', page: 'websiteServices', locales: ALL_LOCALES },
  { route: '/services/website-development', source: 'website-development.html', page: 'websiteDevelopment', locales: ALL_LOCALES },
  { route: '/services/website-pricing', source: 'website-pricing.html', page: 'websitePricing', locales: ['en', 'el', 'ru'] },
  { route: '/services/free-website', source: 'free-website.html', page: 'freeWebsite', locales: ALL_LOCALES },
  { route: '/services/seo', source: 'seo.html', page: 'seo', locales: ALL_LOCALES },
  { route: '/seo/cyprus', source: 'seo-cyprus.html', page: 'seoCyprus', locales: ['en', 'el', 'ru', 'he'] },
  { route: '/seo/limassol', source: 'seo-limassol.html', page: 'seoLimassol', locales: ['en', 'el', 'ru', 'he'] },
  { route: '/sitemap', source: 'api/sitemap-template.html', page: 'sitemap', locales: ALL_LOCALES },
  { route: '/privacy-policy', source: 'privacy-policy.html', page: 'privacy', locales: ALL_LOCALES },
  { route: '/cookie-policy', source: 'cookie-policy.html', page: 'cookies', locales: ALL_LOCALES },
  { route: '/terms', source: 'terms.html', page: 'terms', locales: ALL_LOCALES },
  { route: '/wip', source: 'wip.html', page: 'wip', locales: ALL_LOCALES, indexable: false },
  { route: '/work', source: 'work.html', page: 'work', locales: ENGLISH_ONLY },
  { route: '/careers', source: 'careers.html', page: 'careers', locales: ENGLISH_ONLY },
  { route: '/services/localization-and-translation', source: 'localization-and-translation.html', page: 'localization', locales: ENGLISH_ONLY },
  { route: '/services/social-media', source: 'social-media.html', page: 'socialMediaServices', locales: ENGLISH_ONLY },
  { route: '/services/social-media-pricing', source: 'social-media-pricing.html', page: 'socialMediaPricing', locales: ENGLISH_ONLY }
];

const DYNAMIC_TEMPLATES = [
  { route: '/', source: 'home.template.html', output: 'home.template.html', page: 'home', locales: ALL_LOCALES },
  { route: '/news', source: 'news.template.html', output: 'news.template.html', page: 'news', locales: ALL_LOCALES },
  { route: '/article', source: 'article.html', output: 'article.html', page: 'article', locales: ALL_LOCALES }
];

const normaliseLocale = value => {
  const candidate = String(value || '').trim().replace(/_/g, '-').toLowerCase();
  if (!candidate) return 'en';
  if (candidate === 'pt' || candidate === 'pt-pt') return 'pt-PT';
  if (candidate === 'iw') return 'he';
  return SUPPORTED_LOCALES.find(locale => locale.toLowerCase() === candidate) || 'en';
};

const localePrefix = locale => LOCALE_PREFIXES[normaliseLocale(locale)] || '';
const localeFromPrefix = prefix => PREFIX_LOCALES[String(prefix || '').toLowerCase()] || null;

const stripLocalePrefix = pathname => {
  const clean = `/${String(pathname || '/').replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '/');
  const match = clean.match(/^\/(pt|es|el|ru|he)(?=\/|$)/);
  if (!match) return { locale: 'en', pathname: clean };
  const stripped = clean.slice(match[0].length) || '/';
  return { locale: localeFromPrefix(match[1]), pathname: stripped.startsWith('/') ? stripped : `/${stripped}` };
};

const localizedPath = (pathname, locale = 'en') => {
  const selected = normaliseLocale(locale);
  const clean = stripLocalePrefix(pathname).pathname;
  if (selected === 'en') return clean;
  const prefix = localePrefix(selected);
  return clean === '/' ? `/${prefix}/` : `/${prefix}${clean}`;
};

const staticPageForPath = pathname => {
  const clean = stripLocalePrefix(pathname).pathname.replace(/\/$/, '') || '/';
  return STATIC_PAGES.find(page => page.route === clean) || null;
};

const localesForPath = pathname => {
  const clean = stripLocalePrefix(pathname).pathname.replace(/\/$/, '') || '/';
  if (clean === '/' || clean === '/news' || /^\/news\/page\/\d+$/.test(clean)) return ALL_LOCALES;
  if (/^\/(?:insights|case-studies|news)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) return ALL_LOCALES;
  if (clean === '/career-role' || /^\/careers\//.test(clean)) return ENGLISH_ONLY;
  return staticPageForPath(clean)?.locales || ENGLISH_ONLY;
};

const supportsLocale = (pathname, locale) => localesForPath(pathname).includes(normaliseLocale(locale));
const legacyLanguageTarget = (pathname, locale) => supportsLocale(pathname, locale)
  ? localizedPath(pathname, locale)
  : stripLocalePrefix(pathname).pathname;

module.exports = {
  ALL_LOCALES,
  DYNAMIC_TEMPLATES,
  LOCALE_PREFIXES,
  PREFIX_LOCALES,
  STATIC_PAGES,
  SUPPORTED_LOCALES,
  legacyLanguageTarget,
  localeFromPrefix,
  localePrefix,
  localesForPath,
  localizedPath,
  normaliseLocale,
  staticPageForPath,
  stripLocalePrefix,
  supportsLocale
};
