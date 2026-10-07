'use strict';

const CATEGORY_PATHS = { Insight: 'insights', 'Case Study': 'case-studies', News: 'news' };
const ARTICLE_SLUG_ALIASES = {
  'how-much-doe-seo-cost-in-cyprus-2026-pricing-guide': 'how-much-does-seo-cost-in-cyprus-2026-pricing-guide'
};
const ARTICLE_SLUG_SOURCES = Object.fromEntries(
  Object.entries(ARTICLE_SLUG_ALIASES).map(([source, canonical]) => [canonical, source])
);

const getArticleSection = category => CATEGORY_PATHS[category] || CATEGORY_PATHS.Insight;
const getCanonicalArticleSlug = slug => ARTICLE_SLUG_ALIASES[slug] || slug;
const getSourceArticleSlug = slug => ARTICLE_SLUG_SOURCES[slug] || slug;
const getArticlePath = (article, locale = article.locale || 'en') =>
  `/${getArticleSection(article.category)}/${encodeURIComponent(getCanonicalArticleSlug(article.slug))}${locale === 'en' ? '' : `?lang=${encodeURIComponent(locale)}`}`;

module.exports = {
  ARTICLE_SLUG_ALIASES,
  CATEGORY_PATHS,
  getArticlePath,
  getArticleSection,
  getCanonicalArticleSlug,
  getSourceArticleSlug
};
