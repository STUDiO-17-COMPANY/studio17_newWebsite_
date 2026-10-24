'use strict';

const { listPublishedRoles } = require('../server/_google-careers');
const { articleCacheControl, listPublishedArticles } = require('../server/_google-articles');
const { getArticlePath } = require('../server/_article-render');
const { ALL_LOCALES, STATIC_PAGES, localizedPath } = require('../server/_language-routing');

const SITE_URL = 'https://www.studio17.world';
const ARTICLE_ARCHIVE_PAGE_SIZE = 9;
const escapeXml = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const entry = ({ loc, lastmod, changefreq, priority, alternates = [] }) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  ...alternates.map(item => `    <xhtml:link rel="alternate" hreflang="${escapeXml(item.locale)}" href="${escapeXml(item.href)}" />`),
  lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : '',
  changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
  priority ? `    <priority>${priority}</priority>` : '',
  '  </url>'
].filter(Boolean).join('\n');

const alternatesFor = (route, locales) => [
  { locale: 'x-default', href: `${SITE_URL}${localizedPath(route, 'en')}` },
  ...locales.map(locale => ({ locale, href: `${SITE_URL}${localizedPath(route, locale)}` }))
];

const expandRoute = ({ route, locales, ...metadata }) => {
  const alternates = alternatesFor(route, locales);
  return locales.map(locale => ({
    ...metadata,
    loc: `${SITE_URL}${localizedPath(route, locale)}`,
    alternates
  }));
};

module.exports = async function sitemapHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }

  try {
    const [rolesResult, articlesResult] = await Promise.allSettled([
      listPublishedRoles(request),
      listPublishedArticles(request, 'en')
    ]);
    const roles = rolesResult.status === 'fulfilled' ? rolesResult.value.roles : [];
    const articlePayload = articlesResult.status === 'fulfilled' ? articlesResult.value : { articles: [], nextPublicationAt: null };
    const articles = articlePayload.articles;
    const newest = values => values.filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)))[0];
    const latestArticleDate = newest(articles.flatMap(article => [article.modifiedDate, article.publishedDate]));
    const latestRoleDate = newest(roles.map(role => role.modifiedTime));
    if (rolesResult.status === 'rejected') console.warn('Sitemap: Careers entries unavailable', rolesResult.reason?.code || rolesResult.reason?.message);
    if (articlesResult.status === 'rejected') console.warn('Sitemap: article entries unavailable', articlesResult.reason?.code || articlesResult.reason?.message);
    const archivePages = ALL_LOCALES.flatMap(locale => {
      const count = articles.filter(article => article.availableLanguages.includes(locale)).length;
      return Array.from({ length: Math.max(0, Math.ceil(count / ARTICLE_ARCHIVE_PAGE_SIZE) - 1) }, (_, index) => {
        const page = index + 2;
        const route = `/news/page/${page}`;
        return {
          loc: `${SITE_URL}${localizedPath(route, locale)}`,
          lastmod: latestArticleDate,
          changefreq: 'daily',
          priority: '0.7',
          alternates: alternatesFor(route, ALL_LOCALES.filter(language => {
            const translatedCount = articles.filter(article => article.availableLanguages.includes(language)).length;
            return Math.ceil(translatedCount / ARTICLE_ARCHIVE_PAGE_SIZE) >= page;
          }))
        };
      });
    });
    const staticUrls = [
      ...expandRoute({ route: '/', locales: ALL_LOCALES, lastmod: latestArticleDate, changefreq: 'weekly', priority: '1.0' }),
      ...STATIC_PAGES.filter(page => page.indexable !== false).flatMap(page => expandRoute({
        route: page.route,
        locales: page.locales,
        lastmod: page.route === '/careers' ? latestRoleDate : undefined,
        changefreq: page.route === '/careers' ? 'daily' : 'monthly',
        priority: page.route.startsWith('/services') || page.route === '/work' ? '0.9' : '0.7'
      })),
      ...expandRoute({ route: '/news', locales: ALL_LOCALES, lastmod: latestArticleDate, changefreq: 'daily', priority: '0.9' })
    ];
    const urls = [
      ...staticUrls,
      ...archivePages,
      ...roles.map(role => ({
        loc: `${SITE_URL}/careers/${encodeURIComponent(role.slug)}`,
        lastmod: role.modifiedTime || undefined,
        changefreq: 'weekly',
        priority: '0.7'
      })),
      ...articles.flatMap(article => {
        const alternates = [
          { locale: 'x-default', href: `${SITE_URL}${getArticlePath(article, 'en')}` },
          ...article.availableLanguages.map(locale => ({ locale, href: `${SITE_URL}${getArticlePath(article, locale)}` }))
        ];
        return article.availableLanguages.map(locale => ({
          loc: `${SITE_URL}${getArticlePath(article, locale)}`,
          lastmod: article.modifiedDate || article.publishedDate || undefined,
          changefreq: 'monthly',
          priority: locale === 'en' ? '0.8' : '0.7',
          alternates
        }));
      })
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map(entry).join('\n')}\n</urlset>\n`;
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', articleCacheControl(articlePayload, 300, 600));
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (error) {
    console.error('Sitemap generation failed', error?.code || error?.message);
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : 'Sitemap temporarily unavailable.');
  }
};
