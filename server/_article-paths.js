'use strict';

const CATEGORY_PATHS = { Insight: 'insights', 'Case Study': 'case-studies', News: 'news' };

const getArticleSection = category => CATEGORY_PATHS[category] || CATEGORY_PATHS.Insight;
const getArticlePath = (article, locale = article.locale || 'en') =>
  `/${getArticleSection(article.category)}/${encodeURIComponent(article.slug)}${locale === 'en' ? '' : `?lang=${encodeURIComponent(locale)}`}`;

module.exports = { CATEGORY_PATHS, getArticlePath, getArticleSection };
