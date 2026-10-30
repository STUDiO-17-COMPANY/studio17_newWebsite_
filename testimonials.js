(() => {
  'use strict';
  const greek = 'Η συνεργασία με το Studio 17 ήταν μια καταπληκτική εμπειρία. Η ομάδα τους είναι εξαιρετικά επαγγελματική, δημιουργική και πρωτοποριακή. Κατανοούν απόλυτα τη σύγχρονη ψηφιακή στρατηγική και το branding, προσφέροντας υψηλής ποιότητας αποτέλεσμα με εξαιρετική αποτελεσματικότητα και επικοινωνία. Αν ψάχνετε για μια αξιόπιστη και καινοτόμα ομάδα για να αναβαθμίσει την επιχείρησή σας, το Studio 17 είναι η καλύτερη επιλογή!';
  const labels = {
    en: ['Review font', 'View original', 'View translation'],
    'pt-PT': ['Fonte da avaliação', 'Ver original', 'Ver tradução'],
    es: ['Fuente de la reseña', 'Ver original', 'Ver traducción'],
    el: ['Πηγή αξιολόγησης', 'Προβολή πρωτοτύπου', 'Προβολή μετάφρασης'],
    ru: ['Источник отзыва', 'Посмотреть оригинал', 'Посмотреть перевод'],
    he: ['מקור הביקורת', 'הצגת המקור', 'הצגת התרגום']
  }[document.documentElement.lang] || ['Review font', 'View original', 'View translation'];
  const appendArrow = control => {
    const arrow = document.createElement('span');
    arrow.className = 'testimonial-action-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '<i data-lucide="arrow-up-right"></i>';
    control.append(arrow);
  };
  document.querySelectorAll('.testimonial-card').forEach(card => {
    card.querySelector('.quote-icon')?.remove();
    const quote = card.querySelector(':scope > p');
    if (!quote) return;
    const translated = quote.textContent;
    const original = card.dataset.review === 'yiannos' ? greek : quote.dataset.reviewOriginal || translated;
    const language = card.dataset.review === 'yiannos' ? 'el' : quote.dataset.reviewLanguage || 'en';
    const actions = document.createElement('div');
    actions.className = 'testimonial-actions';
    const source = card.querySelector(':scope > a');
    if (source) {
      source.replaceChildren(document.createTextNode(labels[0]));
      appendArrow(source);
      actions.append(source);
    }
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = labels[1];
    appendArrow(toggle);
    toggle.setAttribute('aria-pressed', 'false');
    toggle.addEventListener('click', () => {
      const showOriginal = toggle.getAttribute('aria-pressed') !== 'true';
      quote.setAttribute('data-i18n-skip', '');
      quote.textContent = showOriginal ? original : translated;
      quote.lang = showOriginal ? language : document.documentElement.lang;
      quote.dir = 'auto';
      toggle.setAttribute('aria-pressed', String(showOriginal));
      toggle.textContent = labels[showOriginal ? 2 : 1];
      appendArrow(toggle);
      window.lucide?.createIcons();
    });
    actions.append(toggle);
    card.append(actions);
  });
  window.lucide?.createIcons();
})();
