'use strict';
const escape = value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const questionHtml = record => `<details class="faq-item" id="${record.id}"><summary id="${record.id}-question" aria-controls="${record.id}-answer"><span>${escape(record.question)}</span><i data-lucide="chevron-down" aria-hidden="true"></i></summary><div class="faq-answer" id="${record.id}-answer" aria-labelledby="${record.id}-question"><p>${escape(record.answer)}</p>${record.ctas.length ? `<nav class="faq-context-links" aria-label="Related services">${record.ctas.map(cta => `<a href="${escape(cta.url)}" data-faq-cta="${record.id}">${escape(cta.label)} <i data-lucide="arrow-up-right" aria-hidden="true"></i></a>`).join('')}</nav>` : ''}</div></details>`;
const pageContent = (data, category) => {
  const records = category ? data.records.filter(record => record.categoryId === category.id) : data.records.slice(0, 10);
  const count = category ? records.length : data.records.length;
  return `<section class="faq-experience-intro shell" aria-labelledby="faq-title"><p class="faq-experience-eyebrow">${escape(data.hub.eyebrow)}</p><h1 id="faq-title">${escape(category?.heading || data.hub.heading)}</h1><p class="faq-experience-description">${escape(category?.description || data.hub.description)}</p></section>
  <section class="faq-experience shell" data-faq-experience data-i18n-skip aria-label="Search and browse FAQs">
    <form class="faq-search" role="search" data-faq-search hidden><label for="faq-search-input">Search FAQs</label><div class="faq-search-entry"><input type="search" id="faq-search-input" placeholder="${escape(data.hub.placeholder)}" autocomplete="off" maxlength="200"><button type="button" data-faq-clear>Clear search</button></div></form>
    <nav class="faq-topic-filters" aria-label="FAQ topics"><a href="/faq" data-faq-category=""${!category ? ' aria-current="page"' : ''}>All</a>${data.categories.map(item => `<a href="${item.path}" data-faq-category="${item.id}"${category?.id === item.id ? ' aria-current="page"' : ''}>${escape(item.label)}</a>`).join('')}</nav>
    <p class="faq-result-count" data-faq-count role="status" aria-live="polite">${count} questions${category ? ` in ${escape(category.label)}` : ' across all topics'}</p>
    <div data-faq-results>${records.map(questionHtml).join('')}</div>
    <div class="faq-empty" data-faq-empty hidden><h2>No matching questions</h2><p>Try a different phrase or explore another topic.</p><div><button type="button" data-faq-empty-clear>Clear search</button><a href="/faq" data-faq-category="">All topics</a><a href="/contact">Contact Studio 17</a></div></div>
    <button type="button" class="solid-button faq-load-more" data-faq-more hidden>Load more questions</button>
    <p class="faq-search-error" data-faq-error hidden>Search is temporarily unavailable. You can still browse every topic using the category links above.</p>
    <noscript><p>Browse the topic links to read all questions and answers. Search and Load More are available with JavaScript enabled.</p></noscript>
  </section><section class="faq-help shell" aria-labelledby="faq-help-title"><h2 class="design-heading" id="faq-help-title">Still have a question?</h2><p>Tell us what you are trying to improve.</p><a class="solid-button" href="/contact">Contact Studio 17 <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></section>`;
};
module.exports = { escape, questionHtml, pageContent };
