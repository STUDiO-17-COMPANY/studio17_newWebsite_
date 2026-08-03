(() => {
  'use strict';

  const form = document.querySelector('[data-contact-form]');
  const submit = document.querySelector('[data-contact-submit]');
  const status = document.querySelector('[data-contact-status]');
  const startedAt = document.querySelector('[data-contact-started-at]');
  if (!form || !submit || !status || !startedAt) return;

  const translate = text => window.Studio17I18n?.translate(text) || text;
  const messages = {
    invalid: 'Please complete the required fields before sending.',
    sending: 'Sending your enquiry…',
    success: 'Thank you. Your enquiry has been sent to Studio 17.',
    rateLimited: 'Too many messages were sent from this connection. Please wait and try again.',
    unavailable: 'The contact form is temporarily unavailable. You can email us directly at contact@studio17.world.'
  };
  let currentStatus = '';

  const resetTimer = () => { startedAt.value = String(Date.now()); };
  const showStatus = (key, state) => {
    currentStatus = key;
    status.hidden = false;
    status.dataset.state = state;
    status.textContent = translate(messages[key]);
  };

  window.addEventListener('studio17:languagechange', () => {
    if (currentStatus) status.textContent = translate(messages[currentStatus]);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      showStatus('invalid', 'error');
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.language = window.Studio17I18n?.getLanguage() || document.documentElement.lang || 'en';
    payload.submissionId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    showStatus('sending', 'sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        showStatus(response.status === 429 ? 'rateLimited' : 'unavailable', 'error');
        return;
      }

      form.reset();
      resetTimer();
      showStatus('success', 'success');
    } catch {
      showStatus('unavailable', 'error');
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });

  resetTimer();
})();
