'use strict';

const { listPublishedRoles } = require('../server/_google-careers');
const { articleCacheControl, listPublishedArticles } = require('../server/_google-articles');
const { getArticlePath } = require('../server/_article-render');

const SITE_URL = 'https://www.studio17.world';
const STATIC_LASTMOD = '2026-09-19';
const ARTICLE_ARCHIVE_PAGE_SIZE = 9;
const escapeXml = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const entry = ({ loc, lastmod, changefreq, priority }) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : '',
  changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
  priority ? `    <priority>${priority}</priority>` : '',
  '  </url>'
].filter(Boolean).join('\n');

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
    if (rolesResult.status === 'rejected') console.warn('Sitemap: Careers entries unavailable', rolesResult.reason?.code || rolesResult.reason?.message);
    if (articlesResult.status === 'rejected') console.warn('Sitemap: article entries unavailable', articlesResult.reason?.code || articlesResult.reason?.message);
    const archivePages = Array.from(
      { length: Math.max(0, Math.ceil(articles.length / ARTICLE_ARCHIVE_PAGE_SIZE) - 1) },
      (_, index) => ({
        loc: `${SITE_URL}/news/page/${index + 2}`,
        lastmod: articles[0]?.modifiedDate || articles[0]?.publishedDate || STATIC_LASTMOD,
        changefreq: 'daily',
        priority: '0.7'
      })
    );
    const urls = [
      { loc: `${SITE_URL}/`, lastmod: STATIC_LASTMOD, changefreq: 'weekly', priority: '1.0' },
      { loc: `${SITE_URL}/contact`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.8' },
      { loc: `${SITE_URL}/faq`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.8' },
      { loc: `${SITE_URL}/about`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.8' },
      { loc: `${SITE_URL}/work`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/our-story`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.7' },
      { loc: `${SITE_URL}/team`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.7' },
      { loc: `${SITE_URL}/services`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/services/website`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/services/website-development`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/services/website-pricing`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.8' },
      { loc: `${SITE_URL}/services/free-website`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/services/seo`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/services/localization-and-translation`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.8' },
      { loc: `${SITE_URL}/seo/cyprus`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/seo/limassol`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.9' },
      { loc: `${SITE_URL}/news`, lastmod: STATIC_LASTMOD, changefreq: 'daily', priority: '0.9' },
      ...archivePages,
      { loc: `${SITE_URL}/careers`, lastmod: STATIC_LASTMOD, changefreq: 'daily', priority: '0.8' },
      { loc: `${SITE_URL}/sitemap`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.3' },
      { loc: `${SITE_URL}/privacy-policy`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.4' },
      { loc: `${SITE_URL}/cookie-policy`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.4' },
      { loc: `${SITE_URL}/terms`, lastmod: STATIC_LASTMOD, changefreq: 'monthly', priority: '0.4' },
      ...roles.map(role => ({
        loc: `${SITE_URL}/careers/${encodeURIComponent(role.slug)}`,
        lastmod: role.modifiedTime || undefined,
        changefreq: 'weekly',
        priority: '0.7'
      })),
      ...articles.flatMap(article => article.availableLanguages.map(locale => ({
        loc: `${SITE_URL}${getArticlePath(article, locale)}`,
        lastmod: article.modifiedDate || article.publishedDate || undefined,
        changefreq: 'monthly',
        priority: locale === 'en' ? '0.8' : '0.7'
      })))
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(entry).join('\n')}\n</urlset>\n`;
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
