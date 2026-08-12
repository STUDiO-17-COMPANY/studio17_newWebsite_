(() => {
  'use strict';

  const progress = document.querySelector('[data-article-progress]');
  const articleBody = document.querySelector('.article-body');
  const shareButton = document.querySelector('[data-article-share]');
  const shareStatus = document.querySelector('[data-article-share-status]');
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

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
