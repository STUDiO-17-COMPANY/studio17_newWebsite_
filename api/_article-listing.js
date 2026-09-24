'use strict';

const CATEGORY_LABELS = {
  en: { Insight: 'Insight', 'Case Study': 'Case Study', News: 'News' },
  'pt-PT': { Insight: 'Perspetiva', 'Case Study': 'Caso de Estudo', News: 'Notícia' },
  es: { Insight: 'Perspectiva', 'Case Study': 'Caso de estudio', News: 'Noticia' },
  el: { Insight: 'Άποψη', 'Case Study': 'Μελέτη περίπτωσης', News: 'Νέα' },
  ru: { Insight: 'Идея', 'Case Study': 'Кейс', News: 'Новость' },
  he: { Insight: 'תובנה', 'Case Study': 'מקרה בוחן', News: 'חדשות' }
};

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const formatDate = (date, locale) => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
    }).format(new Date(`${date}T00:00:00Z`));
  } catch { return date; }
};

const renderArticleCard = (article, locale = 'en') => {
  const labels = CATEGORY_LABELS[locale] || CATEGORY_LABELS.en;
  return `<article class="news-card" data-article-category="${escapeHtml(article.category)}"><a href="${escapeHtml(article.url)}"><div class="news-image"><img src="${escapeHtml(article.coverImage)}" alt="${escapeHtml(article.coverAlt)}" loading="lazy"><span>${escapeHtml(labels[article.category] || article.category)}</span></div><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.summary)}</p><small>${escapeHtml(formatDate(article.publishedDate, locale))}&nbsp;&nbsp;•&nbsp;&nbsp;${escapeHtml(article.authorName)} | ${escapeHtml(article.authorRole)}</small></a></article>`;
};

module.exports = { CATEGORY_LABELS, escapeHtml, formatDate, renderArticleCard };
