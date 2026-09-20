'use strict';

const SITE_URL = 'https://www.studio17.world';
const CATEGORY_PATHS = { Insight: 'insights', 'Case Study': 'case-studies', News: 'news' };
const LANGUAGE_LABELS = { en: 'English', 'pt-PT': 'Português', es: 'Español', el: 'Ελληνικά', ru: 'Русский', he: 'עברית' };
const CATEGORY_LABELS = {
  en: { Insight: 'Insight', 'Case Study': 'Case Study', News: 'News' },
  'pt-PT': { Insight: 'Perspetiva', 'Case Study': 'Caso de Estudo', News: 'Notícia' },
  es: { Insight: 'Perspectiva', 'Case Study': 'Caso de estudio', News: 'Noticia' },
  el: { Insight: 'Άποψη', 'Case Study': 'Μελέτη περίπτωσης', News: 'Νέα' },
  ru: { Insight: 'Идея', 'Case Study': 'Кейс', News: 'Новость' },
  he: { Insight: 'תובנה', 'Case Study': 'מקרה בוחן', News: 'חדשות' }
};
const UI = {
  en: { back: 'All articles', published: 'Published', reading: 'Reading time', written: 'Written by', role: 'Role', minutes: n => `${n} minutes`, contents: 'In this article', share: 'Share article', continue: 'Continue reading', relatedTitle: 'Valuable related information', relatedHighlight: 'related information', previous: 'Previous articles', next: 'Next articles', table: 'Article data table' },
  'pt-PT': { back: 'Todos os artigos', published: 'Publicado', reading: 'Tempo de leitura', written: 'Escrito por', role: 'Função', minutes: n => `${n} minutos`, contents: 'Neste artigo', share: 'Partilhar artigo', continue: 'Continue a ler', relatedTitle: 'Informação relacionada valiosa', relatedHighlight: 'Informação relacionada', previous: 'Artigos anteriores', next: 'Artigos seguintes', table: 'Tabela de dados do artigo' },
  es: { back: 'Todos los artículos', published: 'Publicado', reading: 'Tiempo de lectura', written: 'Escrito por', role: 'Cargo', minutes: n => `${n} minutos`, contents: 'En este artículo', share: 'Compartir artículo', continue: 'Seguir leyendo', relatedTitle: 'Información relacionada valiosa', relatedHighlight: 'Información relacionada', previous: 'Artículos anteriores', next: 'Artículos siguientes', table: 'Tabla de datos del artículo' },
  el: { back: 'Όλα τα άρθρα', published: 'Δημοσιεύτηκε', reading: 'Χρόνος ανάγνωσης', written: 'Συντάκτης', role: 'Ρόλος', minutes: n => `${n} λεπτά`, contents: 'Σε αυτό το άρθρο', share: 'Κοινοποίηση άρθρου', continue: 'Συνεχίστε την ανάγνωση', relatedTitle: 'Πολύτιμες σχετικές πληροφορίες', relatedHighlight: 'σχετικές πληροφορίες', previous: 'Προηγούμενα άρθρα', next: 'Επόμενα άρθρα', table: 'Πίνακας δεδομένων άρθρου' },
  ru: { back: 'Все статьи', published: 'Опубликовано', reading: 'Время чтения', written: 'Автор', role: 'Роль', minutes: n => `${n} мин.`, contents: 'В этой статье', share: 'Поделиться статьёй', continue: 'Продолжить чтение', relatedTitle: 'Полезная информация по теме', relatedHighlight: 'информация по теме', previous: 'Предыдущие статьи', next: 'Следующие статьи', table: 'Таблица данных статьи' },
  he: { back: 'כל המאמרים', published: 'פורסם', reading: 'זמן קריאה', written: 'נכתב על ידי', role: 'תפקיד', minutes: n => `${n} דקות`, contents: 'במאמר זה', share: 'שיתוף המאמר', continue: 'המשך קריאה', relatedTitle: 'מידע קשור בעל ערך', relatedHighlight: 'מידע קשור', previous: 'מאמרים קודמים', next: 'מאמרים הבאים', table: 'טבלת נתוני המאמר' }
};

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const escapeAttribute = escapeHtml;
const absoluteUrl = value => new URL(String(value || '/'), SITE_URL).href;
const getArticleSection = category => CATEGORY_PATHS[category] || CATEGORY_PATHS.Insight;
const getArticlePath = (article, locale = article.locale || 'en') => `/${getArticleSection(article.category)}/${encodeURIComponent(article.slug)}${locale === 'en' ? '' : `?lang=${encodeURIComponent(locale)}`}`;

const highlight = (value, highlighted) => {
  const text = String(value || '');
  const needle = String(highlighted || '').trim();
  if (!needle) return escapeHtml(text);
  const index = text.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase());
  if (index < 0) return escapeHtml(text);
  return `${escapeHtml(text.slice(0, index))}<span>${escapeHtml(text.slice(index, index + needle.length))}</span>${escapeHtml(text.slice(index + needle.length))}`;
};

const formatDate = (value, locale) => {
  try { return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)); }
  catch { return value; }
};

const renderBlocks = (blocks, tableLabel = UI.en.table, coverMarkup = '') => {
  let sectionOpen = false;
  let number = 0;
  let coverRendered = false;
  const html = [];
  const closeSection = () => { if (sectionOpen) { html.push('</section>'); sectionOpen = false; } };
  const renderCover = () => {
    if (!coverRendered && coverMarkup) {
      html.push(coverMarkup);
      coverRendered = true;
    }
  };
  for (const block of blocks || []) {
    if (block.type === 'heading' && block.level === 2) {
      closeSection(); renderCover(); number += 1; sectionOpen = true;
      html.push(`<section id="${escapeAttribute(block.id)}"><h2><span>${String(number).padStart(2, '0')}</span>${escapeHtml(block.text)}</h2>`);
    } else if (block.type === 'heading') html.push(`<h3>${escapeHtml(block.text)}</h3>`);
    else if (block.type === 'paragraph') {
      const isLead = !number && html.length === 0;
      html.push(`<p${isLead ? ' class="article-lead"' : ''}>${escapeHtml(block.text)}</p>`);
    }
    else if (block.type === 'list') html.push(`<${block.ordered ? 'ol' : 'ul'}>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</${block.ordered ? 'ol' : 'ul'}>`);
    else if (block.type === 'table') html.push(`<div class="article-table-wrap" role="region" aria-label="${escapeAttribute(tableLabel)}" tabindex="0"><table class="article-table"><thead><tr>${block.headers.map(header => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    else if (block.type === 'image') html.push(`<figure class="article-inline-image"><img src="/api/article-image?id=${encodeURIComponent(block.imageId)}" alt="${escapeAttribute(block.alt)}" loading="lazy">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`);
    else if (block.type === 'quote') html.push(`<blockquote><p>${escapeHtml(block.text)}</p>${block.citation ? `<cite>${escapeHtml(block.citation)}</cite>` : ''}</blockquote>`);
    else if (block.type === 'callout') html.push(`<div class="article-callout"><i data-lucide="workflow" aria-hidden="true"></i><div>${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ''}<p>${escapeHtml(block.copy)}</p></div></div>`);
    else if (block.type === 'statistics') html.push(`<div class="article-stat-grid">${block.items.map(item => `<div><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join('')}</div>`);
  }
  renderCover();
  closeSection();
  return html.join('');
};

const renderCard = (item, locale) => `<article class="news-card"><a href="${escapeAttribute(getArticlePath(item, locale))}"><div class="news-image"><img src="${escapeAttribute(item.coverImage)}" alt="${escapeAttribute(item.coverAlt)}" loading="lazy"><span>${escapeHtml((CATEGORY_LABELS[locale] || CATEGORY_LABELS.en)[item.category] || item.category)}</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><small>${escapeHtml(formatDate(item.publishedDate, locale))}&nbsp;&nbsp;•&nbsp;&nbsp;${escapeHtml(item.authorName)} | ${escapeHtml(item.authorRole)}</small></a></article>`;
const renderRailCard = (item, locale) => `<a class="article-rail-card" href="${escapeAttribute(getArticlePath(item, locale))}"><img src="${escapeAttribute(item.coverImage)}" alt="${escapeAttribute(item.coverAlt)}" loading="lazy"><span>${escapeHtml((CATEGORY_LABELS[locale] || CATEGORY_LABELS.en)[item.category] || item.category)}</span><h3>${escapeHtml(item.title)}</h3><small>${escapeHtml(formatDate(item.publishedDate, locale))}</small></a>`;
const getInitials = name => String(name || 'Studio 17').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
const hasCompleteSidebarCta = content => Boolean(content.sidebarCtaTitle && content.sidebarCtaDescription && content.sidebarCtaLabel && content.sidebarCtaUrl);
const renderSidebarCta = content => `<section class="article-rail-cta" aria-labelledby="article-rail-cta-title"><h2 id="article-rail-cta-title">${escapeHtml(content.sidebarCtaTitle)}</h2><p>${escapeHtml(content.sidebarCtaDescription)}</p><a class="solid-button" href="${escapeAttribute(content.sidebarCtaUrl)}">${escapeHtml(content.sidebarCtaLabel)}<span aria-hidden="true"><i data-lucide="arrow-up-right"></i></span></a></section>`;

const renderArticleMain = article => {
  const locale = article.locale;
  const ui = UI[locale] || UI.en;
  const content = article.content;
  const headings = (content.blocks || []).filter(block => block.type === 'heading' && block.level === 2);
  const hasRelated = article.related.length > 0;
  const hasSidebarCta = hasCompleteSidebarCta(content);
  const hasRail = hasRelated || hasSidebarCta;
  const authorVisual = article.authorImage
    ? `<img class="article-author-image" src="${escapeAttribute(article.authorImage)}" alt="" loading="eager">`
    : `<span class="article-author-fallback" aria-hidden="true">${escapeHtml(getInitials(article.authorName))}</span>`;
  const languageLinks = article.availableLanguages.map(code => `<a href="${escapeAttribute(getArticlePath(article, code))}" hreflang="${escapeAttribute(code)}"${code === locale ? ' aria-current="page"' : ''}>${escapeHtml(LANGUAGE_LABELS[code])}</a>`).join('');
  const coverMarkup = `<figure class="article-cover reveal"><img src="${escapeAttribute(article.coverImage)}" alt="${escapeAttribute(content.coverAlt)}" loading="lazy">${content.coverCaption ? `<figcaption>${escapeHtml(content.coverCaption)}</figcaption>` : ''}</figure>`;
  return `<main id="article-content"><article data-i18n-skip>
    <header class="article-hero"><div class="hero-media" aria-hidden="true"><img src="${escapeAttribute(article.coverImage)}" alt=""></div><div class="shell article-hero-grid">
      <div class="article-heading reveal"><a class="article-back-link" href="/news${locale === 'en' ? '' : `?lang=${encodeURIComponent(locale)}`}"><i data-lucide="arrow-left" aria-hidden="true"></i>${escapeHtml(ui.back)}</a><p class="article-category">${escapeHtml((CATEGORY_LABELS[locale] || CATEGORY_LABELS.en)[article.category] || article.category)}</p><h1>${highlight(content.title, content.highlightedTitle)}</h1><p class="article-deck">${escapeHtml(content.summary)}</p></div>
      <div class="article-meta-panel reveal" data-delay="1"><dl class="article-meta"><div><dt>${escapeHtml(ui.published)}</dt><dd><time datetime="${escapeAttribute(article.publishedDate)}">${escapeHtml(formatDate(article.publishedDate, locale))}</time></dd></div><div><dt>${escapeHtml(ui.reading)}</dt><dd>${escapeHtml(ui.minutes(article.readTime))}</dd></div><div class="article-meta-author"><dt>${escapeHtml(ui.written)}</dt><dd>${authorVisual}<span class="article-author-copy"><strong>${escapeHtml(article.authorName)}</strong><span><span class="sr-only">${escapeHtml(ui.role)}: </span>${escapeHtml(article.authorRole)}</span></span></dd></div></dl><nav class="article-language-status" aria-label="Available article languages"><i data-lucide="languages" aria-hidden="true"></i>${languageLinks}</nav></div>
    </div></header>
    <div class="shell article-layout${hasRail ? ' has-related' : ''}"><aside class="article-sidebar" aria-label="${escapeAttribute(ui.contents)}"><div class="article-sidebar-inner"><details class="article-toc" data-article-toc open><summary><span>${escapeHtml(ui.contents)}</span><i data-lucide="chevron-down" aria-hidden="true"></i></summary><nav>${headings.map(item => `<a href="#${escapeAttribute(item.id)}">${escapeHtml(item.text)}</a>`).join('')}</nav></details><button class="article-share" type="button" data-article-share><i data-lucide="share-2" aria-hidden="true"></i><span>${escapeHtml(ui.share)}</span></button><p class="article-share-status" data-article-share-status role="status" aria-live="polite"></p></div></aside><div class="article-body">${renderBlocks(content.blocks, ui.table, coverMarkup)}</div>${hasRail ? `<aside class="article-related-rail"${hasRelated ? ' aria-labelledby="article-related-rail-title"' : ''}><div class="article-related-rail-inner">${hasSidebarCta ? renderSidebarCta(content) : ''}${hasRelated ? `<p id="article-related-rail-title">${escapeHtml(ui.continue)}</p>${article.related.slice(0, 3).map(item => renderRailCard(item, locale)).join('')}` : ''}</div></aside>` : ''}</div>
    <section class="article-cta" aria-labelledby="article-cta-title"><div class="shell article-cta-grid"><div><h2 id="article-cta-title">${highlight(content.ctaHeading, content.ctaHighlighted)}</h2><p>${escapeHtml(content.ctaCopy)}</p></div><a class="solid-button" href="${escapeAttribute(content.ctaUrl)}">${escapeHtml(content.ctaLabel)}<span aria-hidden="true"><i data-lucide="arrow-up-right"></i></span></a></div></section>
    ${hasRelated ? `<section class="article-related" aria-labelledby="related-title" data-related-carousel><div class="shell section-title-line article-related-heading"><h2 class="design-heading" id="related-title">${highlight(ui.relatedTitle, ui.relatedHighlight)}</h2>${article.related.length > 3 ? `<div class="triangle-controls article-related-controls" aria-label="${escapeAttribute(ui.relatedTitle)}"><button type="button" class="triangle-prev" data-related-prev aria-label="${escapeAttribute(ui.previous)}"><i data-lucide="chevron-left" aria-hidden="true"></i></button><button type="button" class="triangle-next" data-related-next aria-label="${escapeAttribute(ui.next)}"><i data-lucide="chevron-right" aria-hidden="true"></i></button></div>` : ''}</div><div class="edge-track article-related-viewport"><div class="article-related-track" data-related-track>${article.related.map(item => renderCard(item, locale)).join('')}</div></div></section>` : ''}
  </article></main>`;
};

const buildSeo = article => {
  const content = article.content;
  const canonical = `${SITE_URL}${getArticlePath(article, article.locale)}`;
  const shareImage = absoluteUrl(article.shareImage);
  const author = { '@type': 'Person', name: article.authorName };
  if (article.authorImage) author.image = absoluteUrl(article.authorImage);
  const alternates = article.availableLanguages.map(locale => `<link rel="alternate" hreflang="${escapeAttribute(locale)}" href="${SITE_URL}${getArticlePath(article, locale)}">`).join('\n');
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: content.title,
    description: content.metaDescription, image: [absoluteUrl(article.coverImage)],
    datePublished: article.publishedDate, dateModified: article.modifiedDate || article.publishedDate,
    author,
    publisher: { '@type': 'Organization', name: 'Studio 17', url: `${SITE_URL}/` }, mainEntityOfPage: canonical,
    inLanguage: article.locale
  };
  return `<title>${escapeHtml(content.seoTitle)} | Studio 17</title>
  <meta name="description" content="${escapeAttribute(content.metaDescription)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeAttribute(canonical)}" data-seo-canonical>
  ${alternates}
  <meta property="og:type" content="article"><meta property="og:site_name" content="Studio 17"><meta property="og:title" content="${escapeAttribute(content.socialTitle || content.seoTitle)}"><meta property="og:description" content="${escapeAttribute(content.socialDescription || content.metaDescription)}"><meta property="og:url" content="${escapeAttribute(canonical)}"><meta property="og:image" content="${escapeAttribute(shareImage)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="article:published_time" content="${escapeAttribute(article.publishedDate)}"><meta property="article:modified_time" content="${escapeAttribute(article.modifiedDate || article.publishedDate)}"><meta property="article:author" content="${escapeAttribute(article.authorName)}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeAttribute(content.socialTitle || content.seoTitle)}"><meta name="twitter:description" content="${escapeAttribute(content.socialDescription || content.metaDescription)}"><meta name="twitter:image" content="${escapeAttribute(shareImage)}">
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
};

module.exports = { buildSeo, escapeHtml, getArticlePath, getArticleSection, renderArticleMain };
