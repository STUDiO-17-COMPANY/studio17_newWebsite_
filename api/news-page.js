'use strict';

const fs = require('fs');
const path = require('path');
const { listPublishedArticles, SUPPORTED_LOCALES } = require('./_google-articles');
const { escapeHtml, renderArticleCard } = require('./_article-listing');

const SITE_URL = 'https://www.studio17.world';
const PAGE_SIZE = 9;
const template = fs.readFileSync(path.join(process.cwd(), 'news.html'), 'utf8');
const categoryMap = { insights: 'Insight', 'case-studies': 'Case Study', news: 'News' };
const ARCHIVE_UI = {
  en: { searchLabel: 'Search published articles', searchPlaceholder: 'Search articles', search: 'Search', filters: 'Filter articles', all: 'All', insights: 'Insights', caseStudies: 'Case Studies', news: 'News', pages: 'Article archive pages', previous: 'Previous', next: 'Next', empty: 'No published articles are available in this category.', noMatches: query => `No articles match “${query}”.` },
  'pt-PT': { searchLabel: 'Pesquisar artigos publicados', searchPlaceholder: 'Pesquisar artigos', search: 'Pesquisar', filters: 'Filtrar artigos', all: 'Todos', insights: 'Perspetivas', caseStudies: 'Casos de estudo', news: 'Notícias', pages: 'Páginas do arquivo de artigos', previous: 'Anterior', next: 'Seguinte', empty: 'Não existem artigos publicados nesta categoria.', noMatches: query => `Nenhum artigo corresponde a “${query}”.` },
  es: { searchLabel: 'Buscar artículos publicados', searchPlaceholder: 'Buscar artículos', search: 'Buscar', filters: 'Filtrar artículos', all: 'Todos', insights: 'Perspectivas', caseStudies: 'Casos de estudio', news: 'Noticias', pages: 'Páginas del archivo de artículos', previous: 'Anterior', next: 'Siguiente', empty: 'No hay artículos publicados en esta categoría.', noMatches: query => `Ningún artículo coincide con “${query}”.` },
  el: { searchLabel: 'Αναζήτηση δημοσιευμένων άρθρων', searchPlaceholder: 'Αναζήτηση άρθρων', search: 'Αναζήτηση', filters: 'Φιλτράρισμα άρθρων', all: 'Όλα', insights: 'Απόψεις', caseStudies: 'Μελέτες περίπτωσης', news: 'Νέα', pages: 'Σελίδες αρχείου άρθρων', previous: 'Προηγούμενη', next: 'Επόμενη', empty: 'Δεν υπάρχουν δημοσιευμένα άρθρα σε αυτή την κατηγορία.', noMatches: query => `Δεν βρέθηκαν άρθρα για «${query}».` },
  ru: { searchLabel: 'Поиск опубликованных статей', searchPlaceholder: 'Поиск статей', search: 'Найти', filters: 'Фильтр статей', all: 'Все', insights: 'Идеи', caseStudies: 'Кейсы', news: 'Новости', pages: 'Страницы архива статей', previous: 'Назад', next: 'Далее', empty: 'В этой категории пока нет опубликованных статей.', noMatches: query => `По запросу «${query}» ничего не найдено.` },
  he: { searchLabel: 'חיפוש מאמרים שפורסמו', searchPlaceholder: 'חיפוש מאמרים', search: 'חיפוש', filters: 'סינון מאמרים', all: 'הכול', insights: 'תובנות', caseStudies: 'מקרי בוחן', news: 'חדשות', pages: 'עמודי ארכיון המאמרים', previous: 'הקודם', next: 'הבא', empty: 'אין מאמרים שפורסמו בקטגוריה זו.', noMatches: query => `לא נמצאו מאמרים עבור „${query}”.` }
};

const queryValue = value => Array.isArray(value) ? value[0] : String(value || '');
const normaliseSearch = value => queryValue(value).replace(/\s+/g, ' ').trim().slice(0, 100);
const pageNumber = value => {
  const parsed = Number.parseInt(queryValue(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};
const matchesSearch = (article, query) => {
  if (!query) return true;
  const searchable = [article.title, article.summary, article.authorName, article.authorRole, article.category].join(' ').toLocaleLowerCase();
  return searchable.includes(query.toLocaleLowerCase());
};
const makeUrl = ({ page = 1, query = '', category = '', locale = 'en' }) => {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  if (locale !== 'en') params.set('lang', locale);
  const pathname = page > 1 && !query && !category ? `/news/page/${page}` : '/news';
  if (page > 1 && (query || category)) params.set('page', String(page));
  const search = params.toString();
  return `${pathname}${search ? `?${search}` : ''}`;
};
const filterLink = (slug, label, active, locale) => `<a href="${escapeHtml(makeUrl({ category: slug, locale }))}#all-articles"${active ? ' aria-current="page"' : ''}>${escapeHtml(label)}</a>`;

const renderControls = ({ query, category, locale }) => {
  const ui = ARCHIVE_UI[locale] || ARCHIVE_UI.en;
  return `<div class="news-archive-tools"><form class="news-search" action="/news" method="get" role="search"><label class="sr-only" for="article-search">${escapeHtml(ui.searchLabel)}</label><input id="article-search" name="q" type="search" value="${escapeHtml(query)}" placeholder="${escapeHtml(ui.searchPlaceholder)}" maxlength="100">${locale !== 'en' ? `<input type="hidden" name="lang" value="${escapeHtml(locale)}">` : ''}<button type="submit">${escapeHtml(ui.search)} <i data-lucide="search" aria-hidden="true"></i></button></form><nav class="news-filters" aria-label="${escapeHtml(ui.filters)}">${filterLink('', ui.all, !category, locale)}${filterLink('insights', ui.insights, category === 'insights', locale)}${filterLink('case-studies', ui.caseStudies, category === 'case-studies', locale)}${filterLink('news', ui.news, category === 'news', locale)}</nav></div>`;
};

const renderPagination = ({ current, total, query, category, locale }) => {
  if (total <= 1) return '';
  const ui = ARCHIVE_UI[locale] || ARCHIVE_UI.en;
  const link = (page, label, rel = '') => `<a href="${escapeHtml(makeUrl({ page, query, category, locale }))}#all-articles"${rel ? ` rel="${rel}"` : ''}${page === current ? ' aria-current="page"' : ''}>${escapeHtml(label)}</a>`;
  const pages = Array.from({ length: total }, (_, index) => index + 1);
  return `<nav class="news-pagination" aria-label="${escapeHtml(ui.pages)}">${current > 1 ? link(current - 1, ui.previous, 'prev') : `<span aria-hidden="true">${escapeHtml(ui.previous)}</span>`}<div>${pages.map(page => link(page, String(page))).join('')}</div>${current < total ? link(current + 1, ui.next, 'next') : `<span aria-hidden="true">${escapeHtml(ui.next)}</span>`}</nav>`;
};

const renderNewsPage = ({ articles, page, query, category, locale }) => {
  const selectedCategory = categoryMap[category] || '';
  const filtered = articles.filter(article => (!selectedCategory || article.category === selectedCategory) && matchesSearch(article, query));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const invalidPage = page > totalPages;
  const shown = invalidPage ? [] : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const ui = ARCHIVE_UI[locale] || ARCHIVE_UI.en;
  const cards = shown.length
    ? shown.map(article => renderArticleCard(article, locale)).join('')
    : `<div class="article-feed-state article-feed-empty"><p>${escapeHtml(query ? ui.noMatches(query) : ui.empty)}</p></div>`;
  const canonicalPath = query || category ? '/news' : makeUrl({ page, locale });
  const canonical = `${SITE_URL}${canonicalPath}`;
  const shouldNoIndex = Boolean(query || category || invalidPage);
  const title = page > 1 && !query && !category ? `Insights, Case Studies & News — Page ${page} | Studio 17` : 'Insights, Case Studies & News | Studio 17';
  const adjacent = [
    !query && !category && page > 1 ? `<link rel="prev" href="${SITE_URL}${makeUrl({ page: page - 1, locale })}">` : '',
    !query && !category && page < totalPages ? `<link rel="next" href="${SITE_URL}${makeUrl({ page: page + 1, locale })}">` : ''
  ].filter(Boolean).join('\n');
  const body = template
    .replace('<html lang="en">', `<html lang="${escapeHtml(locale)}"${locale === 'he' ? ' dir="rtl"' : ''}>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${shouldNoIndex ? 'noindex,follow' : 'index,follow'}">`)
    .replace(/<link rel="canonical" href="[^"]*" data-seo-canonical>/, `<link rel="canonical" href="${escapeHtml(canonical)}" data-seo-canonical>`)
    .replace(/<meta property="og:url" content="[^"]*" data-seo-og-url>/, `<meta property="og:url" content="${escapeHtml(canonical)}" data-seo-og-url>`)
    .replace('<!-- ARTICLE_ARCHIVE_HEAD -->', adjacent)
    .replace('data-article-feed="archive" data-ssr-language="en"', `data-article-feed="archive" data-ssr-language="${escapeHtml(locale)}" data-archive-page="${page}"`)
    .replace('<!-- ARTICLE_ARCHIVE_CONTROLS -->', renderControls({ query, category, locale }))
    .replace('<!-- ARTICLE_ARCHIVE_FEED -->', cards)
    .replace('<!-- ARTICLE_ARCHIVE_PAGINATION -->', renderPagination({ current: page, total: totalPages, query, category, locale }));
  return { body, status: invalidPage ? 404 : 200, totalPages, totalResults: filtered.length };
};

module.exports = async function newsPageHandler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.statusCode = 405;
    response.setHeader('Allow', 'GET, HEAD');
    response.end();
    return;
  }
  try {
    const localeValue = queryValue(request.query?.lang);
    const locale = SUPPORTED_LOCALES.includes(localeValue) ? localeValue : 'en';
    const page = pageNumber(request.query?.page);
    const query = normaliseSearch(request.query?.q);
    const categoryValue = queryValue(request.query?.category);
    const category = categoryMap[categoryValue] ? categoryValue : '';
    const { articles } = await listPublishedArticles(request, locale);
    const rendered = renderNewsPage({ articles, page, query, category, locale });
    response.statusCode = rendered.status;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', query ? 'private, no-store' : 'public, max-age=0, must-revalidate, s-maxage=120, stale-while-revalidate=600');
    if (!query) {
      response.setHeader('Vercel-CDN-Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
      response.setHeader('Vercel-Cache-Tag', 'published-articles');
    }
    response.end(request.method === 'HEAD' ? '' : rendered.body);
  } catch (error) {
    console.error('News archive rendering failed', error?.code || error?.message);
    const body = template
      .replace('<!-- ARTICLE_ARCHIVE_HEAD -->', '')
      .replace('<!-- ARTICLE_ARCHIVE_CONTROLS -->', renderControls({ query: '', category: '', locale: 'en' }))
      .replace('<!-- ARTICLE_ARCHIVE_FEED -->', '<div class="article-feed-state article-feed-error"><p>Articles are temporarily unavailable.</p></div>')
      .replace('<!-- ARTICLE_ARCHIVE_PAGINATION -->', '');
    response.statusCode = 503;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(request.method === 'HEAD' ? '' : body);
  }
};

module.exports.PAGE_SIZE = PAGE_SIZE;
module.exports.renderNewsPage = renderNewsPage;
