(() => {
  'use strict';

  const feeds = [...document.querySelectorAll('[data-article-feed]')];
  if (!feeds.length) return;

  const messages = {
    en: { empty: 'No articles are available at the moment.', error: 'We could not load the articles. Please try again.', retry: 'Try again', categories: { Insight: 'Insight', 'Case Study': 'Case Study', News: 'News' } },
    'pt-PT': { empty: 'Não existem artigos disponíveis neste momento.', error: 'Não foi possível carregar os artigos. Tente novamente.', retry: 'Tentar novamente', categories: { Insight: 'Perspetiva', 'Case Study': 'Caso de Estudo', News: 'Notícia' } },
    es: { empty: 'No hay artículos disponibles en este momento.', error: 'No pudimos cargar los artículos. Inténtalo de nuevo.', retry: 'Intentar de nuevo', categories: { Insight: 'Perspectiva', 'Case Study': 'Caso de estudio', News: 'Noticia' } },
    el: { empty: 'Δεν υπάρχουν διαθέσιμα άρθρα αυτή τη στιγμή.', error: 'Δεν ήταν δυνατή η φόρτωση των άρθρων. Δοκιμάστε ξανά.', retry: 'Δοκιμή ξανά', categories: { Insight: 'Άποψη', 'Case Study': 'Μελέτη περίπτωσης', News: 'Νέα' } },
    ru: { empty: 'Сейчас нет доступных статей.', error: 'Не удалось загрузить статьи. Попробуйте ещё раз.', retry: 'Повторить', categories: { Insight: 'Идея', 'Case Study': 'Кейс', News: 'Новость' } },
    he: { empty: 'אין מאמרים זמינים כרגע.', error: 'לא הצלחנו לטעון את המאמרים. נסו שוב.', retry: 'ניסיון נוסף', categories: { Insight: 'תובנה', 'Case Study': 'מקרה בוחן', News: 'חדשות' } }
  };
  let requestNumber = 0;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const language = () => window.Studio17I18n?.getLanguage?.() || document.documentElement.lang || 'en';
  const formatDate = (date, locale) => {
    try { return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)); }
    catch { return date; }
  };
  const stateMarkup = (kind, locale) => {
    const copy = messages[locale] || messages.en;
    if (kind === 'empty') return `<div class="article-feed-state article-feed-empty"><i data-lucide="newspaper" aria-hidden="true"></i><p>${escapeHtml(copy.empty)}</p></div>`;
    return `<div class="article-feed-state article-feed-error"><i data-lucide="circle-alert" aria-hidden="true"></i><p>${escapeHtml(copy.error)}</p><button type="button" data-article-retry>${escapeHtml(copy.retry)}</button></div>`;
  };
  const cardMarkup = (article, locale) => `<article class="news-card" data-article-category="${escapeHtml(article.category)}"><a href="${escapeHtml(article.url)}"><div class="news-image"><img src="${escapeHtml(article.coverImage)}" alt="${escapeHtml(article.coverAlt)}" loading="lazy"><span>${escapeHtml((messages[locale] || messages.en).categories[article.category] || article.category)}</span></div><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.summary)}</p><small>${escapeHtml(formatDate(article.publishedDate, locale))}&nbsp;&nbsp;•&nbsp;&nbsp;${escapeHtml(article.authorName)} | ${escapeHtml(article.authorRole)}</small></a></article>`;

  const articlesForFeed = (feed, articles) => {
    if (feed.dataset.articleFeed === 'home') return articles.slice(0, 6);
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q')?.trim().toLocaleLowerCase() || '';
    const category = { insights: 'Insight', 'case-studies': 'Case Study', news: 'News' }[params.get('category')] || '';
    const filtered = articles.filter(article => {
      const searchable = [article.title, article.summary, article.authorName, article.authorRole, article.category].join(' ').toLocaleLowerCase();
      return (!category || article.category === category) && (!query || searchable.includes(query));
    });
    const page = Math.max(1, Number.parseInt(feed.dataset.archivePage || '1', 10) || 1);
    return filtered.slice((page - 1) * 9, page * 9);
  };

  const load = async ({ force = false } = {}) => {
    const locale = language();
    const targets = feeds.filter(feed => force || feed.dataset.ssrLanguage !== locale || !feed.querySelector('.news-card'));
    if (!targets.length) return;
    const current = ++requestNumber;
    targets.forEach(feed => feed.setAttribute('aria-busy', 'true'));
    try {
      const response = await fetch(`/api/articles?lang=${encodeURIComponent(locale)}`, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error('Articles request failed');
      const payload = await response.json();
      if (current !== requestNumber) return;
      targets.forEach(feed => {
        const articles = articlesForFeed(feed, payload.articles);
        feed.innerHTML = articles.length ? articles.map(article => cardMarkup(article, locale)).join('') : stateMarkup('empty', locale);
        feed.dataset.ssrLanguage = locale;
        feed.removeAttribute('aria-busy');
      });
      window.lucide?.createIcons();
    } catch {
      if (current !== requestNumber) return;
      targets.forEach(feed => {
        if (!feed.querySelector('.news-card')) feed.innerHTML = stateMarkup('error', locale);
        feed.removeAttribute('aria-busy');
      });
      window.lucide?.createIcons();
    }
  };

  document.addEventListener('click', event => {
    if (event.target.closest('[data-article-retry]')) load({ force: true });
  });
  window.addEventListener('studio17:languagechange', () => load({ force: true }));
  (window.Studio17I18n?.ready || Promise.resolve()).then(() => load());
})();
