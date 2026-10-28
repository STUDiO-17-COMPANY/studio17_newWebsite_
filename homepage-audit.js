(() => {
  'use strict';

  const locale = document.documentElement.lang || 'en';
  const copy = {
    en: { title: ['brand', 'company', 'business'], body: ['brands', 'companies', 'businesses'], website: 'Enter your Website', social: 'Enter your social media', websiteLabel: 'Enter your website', socialLabel: 'Enter your social media profile', websiteAudit: 'Website audit', socialAudit: 'Social Media audit', invalid: 'Please enter a valid website or social media profile.', sending: 'Sending your request…', unavailable: 'We could not send this request right now. Please try again or contact us directly.' },
    'pt-PT': { title: ['marca', 'empresa', 'negócio'], body: ['marcas', 'empresas', 'negócios'], website: 'Introduza o seu website', social: 'Introduza a sua rede social', websiteLabel: 'Introduza o seu website', socialLabel: 'Introduza o seu perfil nas redes sociais', websiteAudit: 'Auditoria ao website', socialAudit: 'Auditoria às redes sociais', invalid: 'Introduza um website ou perfil de rede social válido.', sending: 'A enviar o seu pedido…', unavailable: 'Não foi possível enviar este pedido. Tente novamente ou contacte-nos diretamente.' },
    es: { title: ['marca', 'empresa', 'negocio'], body: ['marcas', 'empresas', 'negocios'], website: 'Introduce tu sitio web', social: 'Introduce tu red social', websiteLabel: 'Introduce tu sitio web', socialLabel: 'Introduce tu perfil en redes sociales', websiteAudit: 'Auditoría web', socialAudit: 'Auditoría de redes sociales', invalid: 'Introduce un sitio web o perfil de redes sociales válido.', sending: 'Enviando tu solicitud…', unavailable: 'No pudimos enviar esta solicitud. Inténtalo de nuevo o contáctanos directamente.' },
    el: { title: ['επωνυμία', 'εταιρεία', 'επιχείρηση'], body: ['επωνυμίες', 'εταιρείες', 'επιχειρήσεις'], website: 'Εισαγάγετε την ιστοσελίδα σας', social: 'Εισαγάγετε το προφίλ σας', websiteLabel: 'Εισαγάγετε την ιστοσελίδα σας', socialLabel: 'Εισαγάγετε το προφίλ σας στα κοινωνικά δίκτυα', websiteAudit: 'Έλεγχος ιστοσελίδας', socialAudit: 'Έλεγχος social media', invalid: 'Εισαγάγετε μια έγκυρη ιστοσελίδα ή προφίλ κοινωνικών δικτύων.', sending: 'Αποστολή αιτήματος…', unavailable: 'Δεν μπορέσαμε να στείλουμε το αίτημα. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας.' },
    ru: { title: ['бренда', 'компании', 'бизнеса'], body: ['брендам', 'компаниям', 'бизнесу'], website: 'Введите адрес сайта', social: 'Введите профиль в соцсети', websiteLabel: 'Введите адрес вашего сайта', socialLabel: 'Введите профиль в социальной сети', websiteAudit: 'Аудит сайта', socialAudit: 'Аудит соцсетей', invalid: 'Введите корректный сайт или профиль в социальной сети.', sending: 'Отправляем запрос…', unavailable: 'Не удалось отправить запрос. Повторите попытку или свяжитесь с нами напрямую.' },
    he: { title: ['המותג', 'החברה', 'העסק'], body: ['למותגים', 'לחברות', 'לעסקים'], website: 'הזינו את כתובת האתר', social: 'הזינו את פרופיל הרשת החברתית', websiteLabel: 'הזינו את כתובת האתר שלכם', socialLabel: 'הזינו את פרופיל הרשת החברתית שלכם', websiteAudit: 'בדיקת אתר', socialAudit: 'בדיקת רשתות חברתיות', invalid: 'יש להזין אתר או פרופיל רשת חברתית תקין.', sending: 'שולחים את הבקשה…', unavailable: 'לא הצלחנו לשלוח את הבקשה. נסו שוב או צרו איתנו קשר ישירות.' }
  }[locale] || null;
  const words = copy || {
    title: ['brand', 'company', 'business'], body: ['brands', 'companies', 'businesses'],
    website: 'Enter your Website', social: 'Enter your social media', websiteLabel: 'Enter your website', socialLabel: 'Enter your social media profile',
    websiteAudit: 'Website audit', socialAudit: 'Social Media audit', invalid: 'Please enter a valid website or social media profile.', sending: 'Sending your request…', unavailable: 'We could not send this request right now. Please try again or contact us directly.'
  };

  const rotateElements = [...document.querySelectorAll('[data-hero-word]')];
  if (rotateElements.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % words.title.length;
      rotateElements.forEach(element => element.classList.add('is-changing'));
      window.setTimeout(() => {
        rotateElements.forEach(element => {
          element.textContent = words[element.dataset.heroWord][index];
          element.classList.remove('is-changing');
        });
      }, 180);
    }, 3000);
  }

  const form = document.querySelector('[data-hero-audit-form]');
  if (!form) return;
  const input = form.elements.namedItem('auditTarget');
  const label = form.querySelector('[data-audit-label]');
  const submit = form.querySelector('[data-hero-audit-submit]');
  const status = form.querySelector('[data-hero-audit-status]');
  const toggles = [...form.querySelectorAll('[data-audit-type]')];
  let auditType = 'website';

  const setStatus = (message, state = '') => {
    status.hidden = !message;
    status.textContent = message;
    status.dataset.state = state;
  };

  const setAuditType = type => {
    auditType = type;
    const website = type === 'website';
    toggles.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.auditType === type));
      button.textContent = button.dataset.auditType === 'website' ? words.websiteAudit : words.socialAudit;
    });
    input.inputMode = website ? 'url' : 'text';
    input.placeholder = website ? words.website : words.social;
    label.textContent = website ? words.websiteLabel : words.socialLabel;
    setStatus('');
  };

  toggles.forEach(button => button.addEventListener('click', () => setAuditType(button.dataset.auditType)));
  setAuditType('website');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const target = input.value.trim();
    const websiteValid = /^(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[/?#]\S*)?$/i.test(target);
    const socialValid = /^(?:https?:\/\/\S+|@?[a-z0-9._-]{2,})$/i.test(target);
    if (target.length < 3 || /[<>\r\n]/.test(target) || (auditType === 'website' ? !websiteValid : !socialValid)) {
      input.setAttribute('aria-invalid', 'true');
      setStatus(words.invalid, 'error');
      input.focus();
      return;
    }

    input.removeAttribute('aria-invalid');
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    setStatus(words.sending, 'sending');
    const submissionId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ mode: 'quick-audit', auditType, auditTarget: target, language: locale, submissionId })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error('AUDIT_SEND_FAILED');
      const destination = auditType === 'website' ? '/contact/free-website-audit' : '/contact/free-social-media-audit';
      location.assign(`${destination}?target=${encodeURIComponent(target)}`);
    } catch {
      setStatus(words.unavailable, 'error');
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });
})();
