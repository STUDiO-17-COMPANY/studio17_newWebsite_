'use strict';

const fs = require('fs');
const path = require('path');
const { articleCacheControl, articleCdnCacheControl, listPublishedArticles } = require('../server/_google-articles');
const { renderArticleCard } = require('../server/_article-listing');
const { localePrefix, normaliseLocale } = require('../server/_language-routing');

const marker = '<!-- ARTICLE_HOME_FEED -->';
const readTemplate = locale => {
  const prefix = localePrefix(locale);
  const filename = prefix ? path.join(process.cwd(), '_localized', prefix, 'home.template.html') : path.join(process.cwd(), 'home.template.html');
  return fs.readFileSync(filename, 'utf8');
};
const readAuditTemplate = () => fs.readFileSync(path.join(process.cwd(), 'audit-contact.html'), 'utf8');
const seoLocale = locale => ['pt-PT', 'es', 'el', 'ru'].includes(locale) ? locale : 'en';
const readSeoTemplate = (locale = 'en') => fs.readFileSync(path.join(process.cwd(), seoLocale(locale) === 'en' ? 'seo-overview.html' : `_localized/${localePrefix(locale)}/services/seo.html`), 'utf8');

const renderHomePage = (articles, locale = 'en') => readTemplate(locale).replace(marker, articles.slice(0, 6).map(article => renderArticleCard(article, locale)).join(''));
const renderAuditPage = articles => readAuditTemplate().replace(marker, articles.slice(0, 6).map(article => renderArticleCard(article, 'en')).join(''));
const renderSeoPage = (articles, locale = 'en') => readSeoTemplate(locale).replace(marker, articles.slice(0, 6).map(article => renderArticleCard(article, seoLocale(locale))).join(''));
const readFaqTemplate = category => {
  const approved = require('../faq-data/approved.json').categories;
  if (category && !approved.some(item => item.id === category)) return null;
  return fs.readFileSync(path.join(process.cwd(), category ? `faq/${category}.html` : 'faq.html'), 'utf8');
};
const renderFaqPage = (articles, category = '') => readFaqTemplate(category)?.replace(marker, articles.slice(0, 6).map(article => renderArticleCard(article, 'en')).join(''));

module.exports = async function homePageHandler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  const isFaq = request.query?.view === 'faq';
  const isSeo = request.query?.view === 'seo';
  const faqCategory = typeof request.query?.category === 'string' ? request.query.category : '';
  if (isFaq && readFaqTemplate(faqCategory) === null) {
    response.statusCode = 404;
    response.setHeader('X-Robots-Tag', 'noindex');
    response.end('Page not found');
    return;
  }
  if (isFaq && typeof request.query?.q === 'string' && request.query.q.trim()) response.setHeader('X-Robots-Tag', 'noindex, follow');
  try {
    const isAudit = request.query?.view === 'audit';
    const locale = isAudit || isFaq ? 'en' : isSeo ? seoLocale(normaliseLocale(request.query?.lang)) : normaliseLocale(request.query?.lang);
    const payload = await listPublishedArticles(request, locale);
    const body = isSeo ? renderSeoPage(payload.articles, locale) : isFaq ? renderFaqPage(payload.articles, faqCategory) : isAudit ? renderAuditPage(payload.articles) : renderHomePage(payload.articles, locale);
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', articleCacheControl(payload));
    response.setHeader('Vercel-CDN-Cache-Control', articleCdnCacheControl(payload));
    response.setHeader('Vercel-Cache-Tag', 'published-articles');
    response.end(request.method === 'HEAD' ? '' : body);
  } catch (error) {
    console.error('Homepage article rendering failed', error?.code || error?.message);
    const isAudit = request.query?.view === 'audit';
    const locale = isAudit || isFaq ? 'en' : isSeo ? seoLocale(normaliseLocale(request.query?.lang)) : normaliseLocale(request.query?.lang);
    const template = isSeo ? readSeoTemplate(locale) : isFaq ? readFaqTemplate(faqCategory) : isAudit ? readAuditTemplate() : readTemplate(locale);
    const body = template.replace(marker, '<div class="article-feed-state article-feed-error"><p>Articles are temporarily unavailable.</p></div>');
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : body);
  }
};

module.exports.renderHomePage = renderHomePage;
module.exports.renderAuditPage = renderAuditPage;
module.exports.renderFaqPage = renderFaqPage;
module.exports.renderSeoPage = renderSeoPage;
