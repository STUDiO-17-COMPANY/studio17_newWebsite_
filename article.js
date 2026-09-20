(() => {
  'use strict';

  const progress = document.querySelector('[data-article-progress]');
  const articleBody = document.querySelector('.article-body');
  const shareButton = document.querySelector('[data-article-share]');
  const shareStatus = document.querySelector('[data-article-share-status]');
  const articleToc = document.querySelector('[data-article-toc]');
  const shareMessages = {
    en: ['Article shared.', 'Article link copied.', 'Copy the address from your browser to share this article.'],
    'pt-PT': ['Artigo partilhado.', 'Ligação do artigo copiada.', 'Copie o endereço do navegador para partilhar este artigo.'],
    es: ['Artículo compartido.', 'Enlace del artículo copiado.', 'Copia la dirección del navegador para compartir este artículo.'],
    el: ['Το άρθρο κοινοποιήθηκε.', 'Ο σύνδεσμος του άρθρου αντιγράφηκε.', 'Αντιγράψτε τη διεύθυνση του προγράμματος περιήγησης για να κοινοποιήσετε το άρθρο.'],
    ru: ['Статья отправлена.', 'Ссылка на статью скопирована.', 'Скопируйте адрес из браузера, чтобы поделиться статьёй.'],
    he: ['המאמר שותף.', 'הקישור למאמר הועתק.', 'העתיקו את הכתובת מהדפדפן כדי לשתף את המאמר.']
  };
  const currentShareMessages = shareMessages[document.documentElement.lang] || shareMessages.en;
  const availableLanguages = Array.isArray(window.__STUDIO17_ARTICLE_LANGUAGES__)
    ? window.__STUDIO17_ARTICLE_LANGUAGES__
    : ['en'];

  if (articleToc) {
    const compactToc = window.matchMedia('(max-width: 800px)');
    let tocMode = '';
    const syncToc = () => {
      const nextMode = compactToc.matches ? 'compact' : 'wide';
      if (nextMode === tocMode) return;
      articleToc.open = nextMode === 'wide';
      tocMode = nextMode;
    };
    compactToc.addEventListener?.('change', syncToc);
    articleToc.addEventListener('click', event => {
      if (compactToc.matches && event.target.closest('nav a')) articleToc.open = false;
    });
    syncToc();
  }

  document.querySelectorAll('[data-language-switcher] [data-lang]').forEach(button => {
    if (!availableLanguages.includes(button.dataset.lang)) button.hidden = true;
  });

  document.querySelector('.article-page .language-menu')?.addEventListener('click', event => {
    const button = event.target.closest('[data-lang]');
    if (!button || !availableLanguages.includes(button.dataset.lang)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const url = new URL(location.href);
    if (button.dataset.lang === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', button.dataset.lang);
    location.assign(url.href);
  }, true);

  const updateProgress = () => {
    if (!progress || !articleBody) return;
    const start = articleBody.getBoundingClientRect().top + window.scrollY;
    const available = Math.max(articleBody.offsetHeight - window.innerHeight, 1);
    const value = Math.min(Math.max((window.scrollY - start) / available, 0), 1);
    progress.style.transform = `scaleX(${value})`;
  };

  const announce = message => {
    if (!shareStatus) return;
    shareStatus.textContent = message;
    window.setTimeout(() => { shareStatus.textContent = ''; }, 3500);
  };

  shareButton?.addEventListener('click', async () => {
    const shareData = { title: document.title, text: document.querySelector('meta[name="description"]')?.content || '', url: location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        announce(currentShareMessages[0]);
        return;
      }
      await navigator.clipboard.writeText(location.href);
      announce(currentShareMessages[1]);
    } catch (error) {
      if (error?.name !== 'AbortError') announce(currentShareMessages[2]);
    }
  });

  const relatedCarousel = document.querySelector('[data-related-carousel]');
  const relatedTrack = relatedCarousel?.querySelector('[data-related-track]');
  const previousRelated = relatedCarousel?.querySelector('[data-related-prev]');
  const nextRelated = relatedCarousel?.querySelector('[data-related-next]');

  if (relatedTrack && previousRelated && nextRelated) {
    const originals = Array.from(relatedTrack.children).map(card => card.cloneNode(true));
    let cloneCount = 0;
    let currentIndex = 0;
    let moving = false;
    let resizeTimer = 0;

    const visibleCards = () => window.matchMedia('(max-width: 800px)').matches ? 1 : window.matchMedia('(max-width: 1100px)').matches ? 2 : 3;
    const markClone = card => {
      card.dataset.carouselClone = 'true';
      card.setAttribute('aria-hidden', 'true');
      card.querySelectorAll('a, button').forEach(element => element.setAttribute('tabindex', '-1'));
      return card;
    };
    const cardStep = () => {
      const first = relatedTrack.firstElementChild;
      const gap = Number.parseFloat(getComputedStyle(relatedTrack).columnGap || getComputedStyle(relatedTrack).gap) || 0;
      return (first?.getBoundingClientRect().width || 0) + gap;
    };
    const moveTo = (index, animate = true) => {
      relatedTrack.classList.toggle('is-resetting', !animate);
      currentIndex = index;
      relatedTrack.style.transform = `translate3d(${-cardStep() * currentIndex}px,0,0)`;
      if (!animate) requestAnimationFrame(() => relatedTrack.classList.remove('is-resetting'));
    };
    const rebuild = () => {
      cloneCount = Math.min(visibleCards(), originals.length);
      relatedTrack.replaceChildren(
        ...originals.slice(-cloneCount).map(card => markClone(card.cloneNode(true))),
        ...originals.map(card => card.cloneNode(true)),
        ...originals.slice(0, cloneCount).map(card => markClone(card.cloneNode(true)))
      );
      moveTo(cloneCount, false);
      moving = false;
    };
    const finishMove = () => {
      if (currentIndex >= originals.length + cloneCount) moveTo(cloneCount, false);
      else if (currentIndex < cloneCount) moveTo(originals.length + cloneCount - 1, false);
      moving = false;
    };
    const move = direction => {
      if (moving) return;
      moving = true;
      moveTo(currentIndex + direction);
      window.setTimeout(finishMove, 560);
    };

    previousRelated.addEventListener('click', () => move(-1));
    nextRelated.addEventListener('click', () => move(1));
    relatedTrack.addEventListener('transitionend', event => {
      if (event.propertyName === 'transform' && moving) finishMove();
    });
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 140);
    });
    rebuild();
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
