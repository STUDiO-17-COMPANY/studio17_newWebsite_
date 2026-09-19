'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { listPublishedRoles } = require('./_google-careers');
const { listPublishedArticles } = require('./_google-articles');
const { getArticlePath } = require('./_article-render');

const TEMPLATE_PATH = path.join(__dirname, 'sitemap-template.html');
const ARTICLE_MARKER = '<!-- STUDIO17_DYNAMIC_ARTICLE_LINKS -->';
const ROLE_MARKER = '<!-- STUDIO17_DYNAMIC_ROLE_LINKS -->';
const LANGUAGE_LABELS = { 'pt-PT': 'Portuguese', es: 'Spanish', el: 'Greek', ru: 'Russian', he: 'Hebrew' };

const escapeHtml = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const linkItem = (href, label) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)} <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></li>`;

const renderArticleLinks = articles => articles.flatMap(article => article.availableLanguages.map(locale => {
  const suffix = locale === 'en' ? '' : ` — ${LANGUAGE_LABELS[locale] || locale}`;
  return linkItem(getArticlePath(article, locale), `${article.title}${suffix}`);
})).join('\n              ');

const renderRoleLinks = roles => roles
  .map(role => linkItem(`/careers/${encodeURIComponent(role.slug)}`, role.title))
  .join('\n              ');

module.exports = async function sitemapPageHandler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }

  try {
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const [rolesResult, articlesResult] = await Promise.allSettled([
      listPublishedRoles(request),
      listPublishedArticles(request, 'en')
    ]);
    const roles = rolesResult.status === 'fulfilled' ? rolesResult.value.roles : [];
    const articles = articlesResult.status === 'fulfilled' ? articlesResult.value.articles : [];
    if (rolesResult.status === 'rejected') console.warn('Human sitemap: Careers entries unavailable', rolesResult.reason?.code || rolesResult.reason?.message);
    if (articlesResult.status === 'rejected') console.warn('Human sitemap: article entries unavailable', articlesResult.reason?.code || articlesResult.reason?.message);
    const body = template
      .replace(ARTICLE_MARKER, renderArticleLinks(articles))
      .replace(ROLE_MARKER, renderRoleLinks(roles));

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate, s-maxage=300, stale-while-revalidate=600');
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (error) {
    console.error('Human sitemap generation failed', error?.code || error?.message);
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : 'Sitemap temporarily unavailable.');
  }
};

module.exports.renderArticleLinks = renderArticleLinks;
module.exports.renderRoleLinks = renderRoleLinks;
