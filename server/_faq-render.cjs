'use strict';
const escape = value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const questionHtml = record => `<details class="faq-item" id="${record.id}"><summary id="${record.id}-question" aria-controls="${record.id}-answer"><span>${escape(record.question)}</span><i data-lucide="plus" aria-hidden="true"></i></summary><div class="faq-answer" id="${record.id}-answer" aria-labelledby="${record.id}-question"><p>${escape(record.answer)}</p>${record.ctas.length ? `<nav class="faq-context-links" aria-label="Related services">${record.ctas.map(cta => `<a href="${escape(cta.url)}" data-faq-cta="${record.id}">${escape(cta.label)} <i data-lucide="arrow-up-right" aria-hidden="true"></i></a>`).join('')}</nav>` : ''}</div></details>`;
const pageContent = (data, category) => {
  const records = category ? data.records.filter(record => record.categoryId === category.id) : data.records.slice(0, 10);
  const count = category ? records.length : data.records.length;
  return `<section class="page-hero faq-hero" aria-labelledby="faq-title"><div class="hero-media"><img src="/Images/FAQ%20Hero%20Section-compressed.avif" alt="Studio 17 frequently asked questions" fetchpriority="high"></div><div class="shell page-hero-grid"><div class="page-hero-title"><h1 id="faq-title">${escape(category?.heading || data.hub.heading)}</h1></div><div class="page-hero-copy"><p class="faq-experience-description">${escape(category?.description || data.hub.description)}</p><a class="design-link design-link-dark" href="#faq-browser">Explore FAQs <span aria-hidden="true"><i data-lucide="arrow-down"></i></span></a></div></div></section>
  <section class="faq-experience shell" id="faq-browser" data-faq-experience data-i18n-skip aria-label="Search and browse FAQs"><div class="faq-workspace">

    <nav class="faq-topic-filters" aria-label="FAQ topics"><a href="/faq" data-faq-category=""${!category ? ' aria-current="page"' : ''}>All</a>${data.categories.map(item => `<a href="${item.path}" data-faq-category="${item.id}"${category?.id === item.id ? ' aria-current="page"' : ''}>${escape(item.label)}</a>`).join('')}</nav>
    <div class="faq-questions-column">
    <form class="faq-search" role="search" data-faq-search hidden><label for="faq-search-input">Search FAQs</label><div class="faq-search-entry"><input type="search" id="faq-search-input" placeholder="${escape(data.hub.placeholder)}" autocomplete="off" maxlength="200"><button type="submit" class="solid-button faq-search-submit"><i data-lucide="search" aria-hidden="true"></i>Search</button><button type="button" class="faq-search-clear" data-faq-clear>Clear search</button></div></form>
    <p class="faq-result-count" data-faq-count role="status" aria-live="polite">${count} questions${category ? ` in ${escape(category.label)}` : ' across all topics'}</p>
    <div data-faq-results>${records.map(questionHtml).join('')}</div>
    <div class="faq-empty" data-faq-empty hidden><h2>No matching questions</h2><p>Try a different phrase or explore another topic.</p><div><button type="button" data-faq-empty-clear>Clear search</button><a href="/faq" data-faq-category="">All topics</a><a href="/contact">Contact Studio 17</a></div></div>
    <button type="button" class="solid-button faq-load-more" data-faq-more hidden>Load more questions <span aria-hidden="true"><i data-lucide="arrow-down"></i></span></button>
    <p class="faq-search-error" data-faq-error hidden>Search is temporarily unavailable. You can still browse every topic using the category links above.</p>
    <noscript><p>Browse the topic links to read all questions and answers. Search and Load More are available with JavaScript enabled.</p></noscript>
  </div><aside class="faq-help" aria-labelledby="faq-help-title"><h2 class="design-heading" id="faq-help-title">Still have a question?</h2><p>Tell us what you are trying to improve.</p><a class="solid-button" href="/contact">Contact Studio 17 <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></aside></div></section>`;
};
module.exports = { escape, questionHtml, pageContent };
