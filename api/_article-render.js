'use strict';

const SITE_URL = 'https://www.studio17.world';
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
  en: { back: 'All articles', published: 'Published', reading: 'Reading time', written: 'Written by', role: 'Role', minutes: n => `${n} minutes`, contents: 'In this article', share: 'Share article', continue: 'Continue reading' },
  'pt-PT': { back: 'Todos os artigos', published: 'Publicado', reading: 'Tempo de leitura', written: 'Escrito por', role: 'Função', minutes: n => `${n} minutos`, contents: 'Neste artigo', share: 'Partilhar artigo', continue: 'Continue a ler' },
  es: { back: 'Todos los artículos', published: 'Publicado', reading: 'Tiempo de lectura', written: 'Escrito por', role: 'Cargo', minutes: n => `${n} minutos`, contents: 'En este artículo', share: 'Compartir artículo', continue: 'Seguir leyendo' },
  el: { back: 'Όλα τα άρθρα', published: 'Δημοσιεύτηκε', reading: 'Χρόνος ανάγνωσης', written: 'Συντάκτης', role: 'Ρόλος', minutes: n => `${n} λεπτά`, contents: 'Σε αυτό το άρθρο', share: 'Κοινοποίηση άρθρου', continue: 'Συνεχίστε την ανάγνωση' },
  ru: { back: 'Все статьи', published: 'Опубликовано', reading: 'Время чтения', written: 'Автор', role: 'Роль', minutes: n => `${n} мин.`, contents: 'В этой статье', share: 'Поделиться статьёй', continue: 'Продолжить чтение' },
  he: { back: 'כל המאמרים', published: 'פורסם', reading: 'זמן קריאה', written: 'נכתב על ידי', role: 'תפקיד', minutes: n => `${n} דקות`, contents: 'במאמר זה', share: 'שיתוף המאמר', continue: 'המשך קריאה' }
};

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const escapeAttribute = escapeHtml;
const absoluteUrl = value => new URL(String(value || '/'), SITE_URL).href;

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

const renderBlocks = blocks => {
  let sectionOpen = false;
  let number = 0;
  const html = [];
  const closeSection = () => { if (sectionOpen) { html.push('</section>'); sectionOpen = false; } };
  for (const block of blocks || []) {
    if (block.type === 'heading' && block.level === 2) {
      closeSection(); number += 1; sectionOpen = true;
      html.push(`<section id="${escapeAttribute(block.id)}"><h2><span>${String(number).padStart(2, '0')}</span>${escapeHtml(block.text)}</h2>`);
    } else if (block.type === 'heading') html.push(`<h3>${escapeHtml(block.text)}</h3>`);
    else if (block.type === 'paragraph') html.push(`<p${!number && html.length === 0 ? ' class="article-lead"' : ''}>${escapeHtml(block.text)}</p>`);
    else if (block.type === 'list') html.push(`<${block.ordered ? 'ol' : 'ul'}>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</${block.ordered ? 'ol' : 'ul'}>`);
    else if (block.type === 'image') html.push(`<figure class="article-inline-image"><img src="/api/article-image?id=${encodeURIComponent(block.imageId)}" alt="${escapeAttribute(block.alt)}" loading="lazy">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`);
    else if (block.type === 'quote') html.push(`<blockquote><p>${escapeHtml(block.text)}</p>${block.citation ? `<cite>${escapeHtml(block.citation)}</cite>` : ''}</blockquote>`);
    else if (block.type === 'callout') html.push(`<div class="article-callout"><i data-lucide="workflow" aria-hidden="true"></i><div>${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ''}<p>${escapeHtml(block.copy)}</p></div></div>`);
    else if (block.type === 'statistics') html.push(`<div class="article-stat-grid">${block.items.map(item => `<div><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join('')}</div>`);
  }
  closeSection();
  return html.join('');
};

const renderCard = (item, locale) => `<article class="news-card"><a href="/insights/${encodeURIComponent(item.slug)}${locale === 'en' ? '' : `?lang=${encodeURIComponent(locale)}`}"><div class="news-image"><img src="${escapeAttribute(item.coverImage)}" alt="${escapeAttribute(item.coverAlt)}" loading="lazy"><span>${escapeHtml((CATEGORY_LABELS[locale] || CATEGORY_LABELS.en)[item.category] || item.category)}</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><small>${escapeHtml(formatDate(item.publishedDate, locale))}&nbsp;&nbsp;•&nbsp;&nbsp;${escapeHtml(item.authorName)} | ${escapeHtml(item.authorRole)}</small></a></article>`;

const renderArticleMain = article => {
  const locale = article.locale;
  const ui = UI[locale] || UI.en;
  const content = article.content;
  const headings = (content.blocks || []).filter(block => block.type === 'heading' && block.level === 2);
  const languageLinks = article.availableLanguages.map(code => `<a href="/insights/${encodeURIComponent(article.slug)}${code === 'en' ? '' : `?lang=${encodeURIComponent(code)}`}" hreflang="${escapeAttribute(code)}"${code === locale ? ' aria-current="page"' : ''}>${escapeHtml(LANGUAGE_LABELS[code])}</a>`).join('');
  return `<main id="article-content"><article data-i18n-skip>
    <header class="article-hero"><div class="hero-media" aria-hidden="true"><img src="${escapeAttribute(article.coverImage)}" alt=""></div><div class="shell article-hero-grid">
      <div class="article-heading reveal"><a class="article-back-link" href="/news${locale === 'en' ? '' : `?lang=${encodeURIComponent(locale)}`}"><i data-lucide="arrow-left" aria-hidden="true"></i>${escapeHtml(ui.back)}</a><p class="article-category">${escapeHtml((CATEGORY_LABELS[locale] || CATEGORY_LABELS.en)[article.category] || article.category)}</p><h1>${highlight(content.title, content.highlightedTitle)}</h1><p class="article-deck">${escapeHtml(content.summary)}</p></div>
      <div class="article-meta-panel reveal" data-delay="1"><dl class="article-meta"><div><dt>${escapeHtml(ui.published)}</dt><dd><time datetime="${escapeAttribute(article.publishedDate)}">${escapeHtml(formatDate(article.publishedDate, locale))}</time></dd></div><div><dt>${escapeHtml(ui.reading)}</dt><dd>${escapeHtml(ui.minutes(article.readTime))}</dd></div><div><dt>${escapeHtml(ui.written)}</dt><dd>${escapeHtml(article.authorName)}</dd></div><div><dt>${escapeHtml(ui.role)}</dt><dd>${escapeHtml(article.authorRole)}</dd></div></dl><nav class="article-language-status" aria-label="Available article languages"><i data-lucide="languages" aria-hidden="true"></i>${languageLinks}</nav></div>
    </div></header>
    <figure class="shell article-cover reveal"><img src="${escapeAttribute(article.coverImage)}" alt="${escapeAttribute(content.coverAlt)}">${content.coverCaption ? `<figcaption>${escapeHtml(content.coverCaption)}</figcaption>` : ''}</figure>
    <div class="shell article-layout"><aside class="article-sidebar" aria-label="${escapeAttribute(ui.contents)}"><div class="article-sidebar-inner"><p>${escapeHtml(ui.contents)}</p><nav>${headings.map(item => `<a href="#${escapeAttribute(item.id)}">${escapeHtml(item.text)}</a>`).join('')}</nav><button class="article-share" type="button" data-article-share><i data-lucide="share-2" aria-hidden="true"></i><span>${escapeHtml(ui.share)}</span></button><p class="article-share-status" data-article-share-status role="status" aria-live="polite"></p></div></aside><div class="article-body">${renderBlocks(content.blocks)}</div></div>
    <section class="article-cta" aria-labelledby="article-cta-title"><div class="shell article-cta-grid"><div><h2 id="article-cta-title">${highlight(content.ctaHeading, content.ctaHighlighted)}</h2><p>${escapeHtml(content.ctaCopy)}</p></div><a class="solid-button" href="${escapeAttribute(content.ctaUrl)}">${escapeHtml(content.ctaLabel)}<span aria-hidden="true"><i data-lucide="arrow-up-right"></i></span></a></div></section>
    ${article.related.length ? `<section class="article-related" aria-labelledby="related-title"><div class="shell section-title-line"><h2 class="design-heading" id="related-title"><span>${escapeHtml(ui.continue)}</span></h2></div><div class="shell article-related-grid">${article.related.map(item => renderCard(item, locale)).join('')}</div></section>` : ''}
  </article></main>`;
};

const buildSeo = article => {
  const content = article.content;
  const canonical = `${SITE_URL}/insights/${encodeURIComponent(article.slug)}${article.locale === 'en' ? '' : `?lang=${encodeURIComponent(article.locale)}`}`;
  const shareImage = absoluteUrl(article.shareImage);
  const alternates = article.availableLanguages.map(locale => `<link rel="alternate" hreflang="${escapeAttribute(locale)}" href="${SITE_URL}/insights/${encodeURIComponent(article.slug)}${locale === 'en' ? '' : `?lang=${encodeURIComponent(locale)}`}">`).join('\n');
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: content.title,
    description: content.metaDescription, image: [absoluteUrl(article.coverImage)],
    datePublished: article.publishedDate, dateModified: article.modifiedDate || article.publishedDate,
    author: { '@type': 'Person', name: article.authorName },
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

module.exports = { buildSeo, escapeHtml, renderArticleMain };
