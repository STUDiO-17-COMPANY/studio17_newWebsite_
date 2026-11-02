(() => {
  'use strict';
  const root = document.querySelector('[data-faq-experience]');
  if (!root) return;
  const input = root.querySelector('input');
  const results = root.querySelector('[data-faq-results]');
  const count = root.querySelector('[data-faq-count]');
  const more = root.querySelector('[data-faq-more]');
  let data, categoryId = document.body.dataset.faqCategory || '', limit = 10, timer;
  const track = (event, detail = {}) => {
    if (window.Studio17Analytics?.getConsent?.() === 'granted') window.gtag?.('event', event, { faq_category: categoryId || 'all', ...detail });
  };
  const el = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
  const card = record => {
    const details = el('details', '', 'faq-item'); details.id = record.id;
    details.setAttribute('name', 'studio17-faq');
    const summary = el('summary'); summary.id = `${record.id}-question`; summary.setAttribute('aria-controls', `${record.id}-answer`);
    const question = el('span');
    window.Studio17FaqSearch.highlightQuestion(record.question, input.value).forEach(segment => {
      question.append(segment.matched ? el('strong', segment.text) : document.createTextNode(segment.text));
    });
    summary.append(question);
    const icon = el('i'); icon.dataset.lucide = 'plus'; icon.setAttribute('aria-hidden', 'true'); summary.append(icon);
    const panel = el('div', '', 'faq-answer'); panel.id = `${record.id}-answer`; panel.setAttribute('aria-labelledby', summary.id); panel.append(el('p', record.answer));
    if (record.ctas.length) {
      const links = el('nav', '', 'faq-context-links'); links.setAttribute('aria-label', 'Related services');
      record.ctas.forEach(cta => { const link = el('a', cta.label); link.href = cta.url; link.dataset.faqCta = record.id; links.append(link); });
      panel.append(links);
    }
    details.append(summary, panel); return details;
  };
  const metadata = () => {
    const category = data.categories.find(item => item.id === categoryId);
    const path = category?.path || '/faq';
    const title = category?.title || data.hub.title;
    const description = category?.description || data.hub.metaDescription;
    document.title = title;
    document.querySelector('#faq-title').textContent = category?.heading || data.hub.heading;
    document.querySelector('.faq-experience-description').textContent = category?.description || data.hub.description;
    document.querySelector('link[rel="canonical"]').href = `https://www.studio17.world${path}`;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[name="robots"]').content = input.value.trim() ? 'noindex,follow' : 'index,follow';
    for (const [selector, content] of [['meta[property="og:title"]', title], ['meta[property="og:description"]', description], ['meta[property="og:url"]', `https://www.studio17.world${path}`], ['meta[name="twitter:title"]', title], ['meta[name="twitter:description"]', description]]) document.querySelector(selector)?.setAttribute('content', content);
    const schema = document.querySelector('script[type="application/ld+json"]');
    if (schema) { const value = JSON.parse(schema.textContent); value.itemListElement = value.itemListElement.slice(0, 2); if (category) value.itemListElement.push({ '@type': 'ListItem', position: 3, name: category.label, item: `https://www.studio17.world${path}` }); schema.textContent = JSON.stringify(value); }
  };
  const render = () => {
    const matches = window.Studio17FaqSearch.search(data.records, data.categories, input.value, categoryId);
    results.replaceChildren(...matches.slice(0, limit).map(card));
    count.textContent = `${matches.length} ${matches.length === 1 ? 'question' : 'questions'} found · showing ${Math.min(limit, matches.length)}`;
    more.hidden = limit >= matches.length;
    root.querySelector('[data-faq-empty]').hidden = Boolean(matches.length);
    const noQuery = !input.value.trim();
    root.querySelector('[data-faq-clear]').hidden = noQuery;
    root.querySelector('[data-faq-empty-clear]').hidden = noQuery;
    root.querySelector('[data-faq-empty] [data-faq-category]').hidden = !categoryId;
    root.querySelectorAll('[data-faq-category]').forEach(link => { if (link.dataset.faqCategory === categoryId) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
    document.body.dataset.faqCategory = categoryId;
    metadata(); window.lucide?.createIcons();
    return matches.length;
  };
  const save = push => {
    const path = data.categories.find(category => category.id === categoryId)?.path || '/faq';
    const query = input.value.trim();
    history[push ? 'pushState' : 'replaceState']({ faq: true, categoryId, query, limit }, '', `${path}${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };
  const restore = () => {
    const url = new URL(location.href);
    categoryId = data.categories.find(category => category.path === url.pathname.replace(/\/$/, ''))?.id || '';
    input.value = url.searchParams.get('q')?.slice(0, 200) || '';
    limit = Math.max(10, Number(history.state?.limit) || 10);
    render();
  };
  root.addEventListener('click', event => {
    const link = event.target.closest('a[data-faq-category]');
    if (!data || !link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); categoryId = link.dataset.faqCategory; limit = 10; render(); save(true); track('faq_category_select');
  });
  root.addEventListener('toggle', event => {
    if (!event.target.matches('.faq-item') || !event.target.open) return;
    results.querySelectorAll('.faq-item[open]').forEach(item => { if (item !== event.target) item.open = false; });
    track('faq_open', { faq_id: event.target.id });
  }, true);
  root.addEventListener('click', event => { const link = event.target.closest('[data-faq-cta]'); if (link) track('faq_cta_click', { faq_id: link.dataset.faqCta, faq_destination: new URL(link.href).pathname }); });
  const runSearch = (immediate = false) => {
    limit = 10; const found = render(); save(false); clearTimeout(timer);
    const announceSearch = () => { track('faq_search', { query_length: input.value.trim().length, result_count: found }); if (!found) track('faq_zero_results'); };
    if (immediate) announceSearch(); else timer = setTimeout(announceSearch, 450);
  };
  input.addEventListener('input', () => runSearch());
  root.querySelector('form').addEventListener('submit', event => { event.preventDefault(); runSearch(true); });
  const clear = () => { input.value = ''; limit = 10; render(); save(false); input.focus(); };
  root.querySelector('[data-faq-clear]').addEventListener('click', clear);
  root.querySelector('[data-faq-empty-clear]').addEventListener('click', clear);
  more.addEventListener('click', () => {
    const previousCount = results.querySelectorAll('details').length;
    limit += 10; render(); save(false);
    results.querySelectorAll('summary')[previousCount]?.focus();
    track('faq_load_more', { visible_limit: limit });
  });
  window.addEventListener('popstate', () => { if (data) restore(); });
  fetch('/faq-search.json').then(response => { if (!response.ok) throw new Error('FAQ search unavailable'); return response.json(); }).then(value => {
    if (!Array.isArray(value.records) || !value.records.length || !Array.isArray(value.categories)) throw new Error('Invalid FAQ payload');
    data = value; root.querySelector('form').hidden = false; restore(); save(false);
  }).catch(() => { root.querySelector('[data-faq-error]').hidden = false; });
})();
