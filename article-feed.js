(() => {
  'use strict';

  const feeds = [...document.querySelectorAll('[data-article-feed]')];
  if (!feeds.length) return;

  const messages = {
    en: { loading: 'Loading articles…', empty: 'No articles are available at the moment.', error: 'We could not load the articles. Please try again.', retry: 'Try again', categories: { Insight: 'Insight', 'Case Study': 'Case Study', News: 'News' } },
    'pt-PT': { loading: 'A carregar artigos…', empty: 'Não existem artigos disponíveis neste momento.', error: 'Não foi possível carregar os artigos. Tente novamente.', retry: 'Tentar novamente', categories: { Insight: 'Perspetiva', 'Case Study': 'Caso de Estudo', News: 'Notícia' } },
    es: { loading: 'Cargando artículos…', empty: 'No hay artículos disponibles en este momento.', error: 'No pudimos cargar los artículos. Inténtalo de nuevo.', retry: 'Intentar de nuevo', categories: { Insight: 'Perspectiva', 'Case Study': 'Caso de estudio', News: 'Noticia' } },
    el: { loading: 'Φόρτωση άρθρων…', empty: 'Δεν υπάρχουν διαθέσιμα άρθρα αυτή τη στιγμή.', error: 'Δεν ήταν δυνατή η φόρτωση των άρθρων. Δοκιμάστε ξανά.', retry: 'Δοκιμή ξανά', categories: { Insight: 'Άποψη', 'Case Study': 'Μελέτη περίπτωσης', News: 'Νέα' } },
    ru: { loading: 'Загрузка статей…', empty: 'Сейчас нет доступных статей.', error: 'Не удалось загрузить статьи. Попробуйте ещё раз.', retry: 'Повторить', categories: { Insight: 'Идея', 'Case Study': 'Кейс', News: 'Новость' } },
    he: { loading: 'טוען מאמרים…', empty: 'אין מאמרים זמינים כרגע.', error: 'לא הצלחנו לטעון את המאמרים. נסו שוב.', retry: 'ניסיון נוסף', categories: { Insight: 'תובנה', 'Case Study': 'מקרה בוחן', News: 'חדשות' } }
  };
  let requestNumber = 0;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const locale = () => window.Studio17I18n?.getLanguage?.() || document.documentElement.lang || 'en';
  const articleUrl = (slug, language) => `/insights/${encodeURIComponent(slug)}${language === 'en' ? '' : `?lang=${encodeURIComponent(language)}`}`;
  const formatDate = (date, language) => {
    try { return new Intl.DateTimeFormat(language, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }
    catch { return date; }
  };

  const stateMarkup = (kind, language) => {
    const copy = messages[language] || messages.en;
    if (kind === 'loading') return `<div class="article-feed-state"><span class="article-feed-spinner" aria-hidden="true"></span><p>${escapeHtml(copy.loading)}</p></div>`;
    if (kind === 'empty') return `<div class="article-feed-state article-feed-empty"><i data-lucide="newspaper" aria-hidden="true"></i><p>${escapeHtml(copy.empty)}</p></div>`;
    return `<div class="article-feed-state article-feed-error"><i data-lucide="circle-alert" aria-hidden="true"></i><p>${escapeHtml(copy.error)}</p><button type="button" data-article-retry>${escapeHtml(copy.retry)}</button></div>`;
  };

  const cardMarkup = (article, language) => `<article class="news-card" data-article-category="${escapeHtml(article.category)}"><a href="${articleUrl(article.slug, language)}"><div class="news-image"><img src="${escapeHtml(article.coverImage)}" alt="${escapeHtml(article.coverAlt)}" loading="lazy"><span>${escapeHtml((messages[language] || messages.en).categories[article.category] || article.category)}</span></div><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.summary)}</p><small>${escapeHtml(formatDate(article.publishedDate, language))}&nbsp;&nbsp;•&nbsp;&nbsp;${escapeHtml(article.authorName)} | ${escapeHtml(article.authorRole)}</small></a></article>`;

  const applyFilter = feed => {
    if (feed.dataset.articleFeed !== 'archive') return;
    const selected = document.querySelector('[data-news-filter][aria-pressed="true"]')?.dataset.newsFilter || 'All';
    feed.querySelectorAll('[data-article-category]').forEach(card => { card.hidden = selected !== 'All' && card.dataset.articleCategory !== selected; });
    const visible = [...feed.querySelectorAll('[data-article-category]')].some(card => !card.hidden);
    feed.classList.toggle('is-filter-empty', !visible);
  };

  const load = async () => {
    const language = locale();
    const current = ++requestNumber;
    feeds.forEach(feed => { feed.innerHTML = stateMarkup('loading', language); feed.setAttribute('aria-busy', 'true'); });
    try {
      const response = await fetch(`/api/articles?lang=${encodeURIComponent(language)}`, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error('Articles request failed');
      const payload = await response.json();
      if (current !== requestNumber) return;
      feeds.forEach(feed => {
        const articles = feed.dataset.articleFeed === 'home' ? payload.articles.slice(0, 6) : payload.articles;
        feed.innerHTML = articles.length ? articles.map(article => cardMarkup(article, language)).join('') : stateMarkup('empty', language);
        feed.removeAttribute('aria-busy');
        applyFilter(feed);
      });
      window.lucide?.createIcons();
    } catch {
      if (current !== requestNumber) return;
      feeds.forEach(feed => { feed.innerHTML = stateMarkup('error', language); feed.removeAttribute('aria-busy'); });
      window.lucide?.createIcons();
    }
  };

  document.addEventListener('click', event => {
    if (event.target.closest('[data-article-retry]')) load();
    const filter = event.target.closest('[data-news-filter]');
    if (filter) {
      document.querySelectorAll('[data-news-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
      feeds.forEach(applyFilter);
    }
  });
  window.addEventListener('studio17:languagechange', load);
  (window.Studio17I18n?.ready || Promise.resolve()).then(load);
})();
