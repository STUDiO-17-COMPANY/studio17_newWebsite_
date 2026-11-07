(() => {
  'use strict';

  const isSocial = location.pathname.includes('free-social-media-audit');
  const form = document.querySelector('[data-audit-contact-form]');
  if (!form) return;
  const status = form.querySelector('[data-audit-contact-status]');
  const submit = form.querySelector('[data-audit-contact-submit]');
  const target = form.elements.namedItem('auditTarget');
  const countrySelect = form.elements.namedItem('countryCode');
  const params = new URLSearchParams(location.search);
  const isLocalSeo = location.pathname.replace(/\/$/, '') === '/contact/local-seo';
  const isSeo = !isSocial && params.get('intent') === 'seo';
  const countries = [
    ['CY', '+357', 'Cyprus'], ['PT', '+351', 'Portugal'], ['GR', '+30', 'Greece'], ['GB', '+44', 'United Kingdom'], ['US', '+1', 'United States'],
    ['ES', '+34', 'Spain'], ['FR', '+33', 'France'], ['DE', '+49', 'Germany'], ['IT', '+39', 'Italy'], ['NL', '+31', 'Netherlands'],
    ['BE', '+32', 'Belgium'], ['AT', '+43', 'Austria'], ['IE', '+353', 'Ireland'], ['LU', '+352', 'Luxembourg'], ['MT', '+356', 'Malta'],
    ['FI', '+358', 'Finland'], ['SE', '+46', 'Sweden'], ['DK', '+45', 'Denmark'], ['NO', '+47', 'Norway'], ['IS', '+354', 'Iceland'],
    ['PL', '+48', 'Poland'], ['CZ', '+420', 'Czechia'], ['SK', '+421', 'Slovakia'], ['HU', '+36', 'Hungary'], ['RO', '+40', 'Romania'],
    ['BG', '+359', 'Bulgaria'], ['HR', '+385', 'Croatia'], ['SI', '+386', 'Slovenia'], ['EE', '+372', 'Estonia'], ['LV', '+371', 'Latvia'],
    ['LT', '+370', 'Lithuania'], ['CH', '+41', 'Switzerland'], ['LI', '+423', 'Liechtenstein'], ['AL', '+355', 'Albania'], ['RS', '+381', 'Serbia'],
    ['ME', '+382', 'Montenegro'], ['MK', '+389', 'North Macedonia'], ['BA', '+387', 'Bosnia and Herzegovina'], ['MD', '+373', 'Moldova'], ['UA', '+380', 'Ukraine'],
    ['IL', '+972', 'Israel'], ['AE', '+971', 'United Arab Emirates'], ['SA', '+966', 'Saudi Arabia'], ['QA', '+974', 'Qatar'], ['TR', '+90', 'Türkiye'],
    ['CA', '+1', 'Canada'], ['MX', '+52', 'Mexico'], ['BR', '+55', 'Brazil'], ['AR', '+54', 'Argentina'], ['CL', '+56', 'Chile'],
    ['CO', '+57', 'Colombia'], ['AU', '+61', 'Australia'], ['NZ', '+64', 'New Zealand'], ['ZA', '+27', 'South Africa'], ['EG', '+20', 'Egypt'],
    ['MA', '+212', 'Morocco'], ['NG', '+234', 'Nigeria'], ['KE', '+254', 'Kenya'], ['GH', '+233', 'Ghana'], ['JP', '+81', 'Japan'],
    ['KR', '+82', 'South Korea'], ['SG', '+65', 'Singapore'], ['MY', '+60', 'Malaysia'], ['PH', '+63', 'Philippines'], ['ID', '+62', 'Indonesia'],
    ['IN', '+91', 'India'], ['PK', '+92', 'Pakistan'], ['BD', '+880', 'Bangladesh'], ['HK', '+852', 'Hong Kong'], ['TW', '+886', 'Taiwan'],
    ['CN', '+86', 'China'], ['GE', '+995', 'Georgia'], ['AM', '+374', 'Armenia'], ['AZ', '+994', 'Azerbaijan'], ['KZ', '+7', 'Kazakhstan']
  ];

  countries.forEach(([country, code, name]) => {
    const option = document.createElement('option');
    option.value = code;
    option.dataset.country = country;
    option.textContent = `${name} (${code})`;
    countrySelect.append(option);
  });

  const content = isLocalSeo ? {
    title: 'Talk to us about Local SEO', subtitle: 'Reach customers in your city', description: 'Tell us where you want to be found and what you’d like to improve.',
    formTitle: 'Request a Local SEO consultation', formCopy: 'Share your contact details and tell us about your business so we can recommend the right next step.', nextReview: 'We review your local search presence and opportunities to reach nearby customers.', focus: 'Google Search, Google Maps and local visibility', label: 'City', service: 'seo'
  } : isSocial ? {
    title: 'Get your free Social Media audit', subtitle: 'Show us where to look', description: 'Your social media profile is already filled in. Add your contact details and context so our team can review the right goals.',
    formTitle: 'Request your free Social Media audit', formCopy: 'We will use these details to review your social media presence and contact you with practical next steps.', nextReview: 'We review the social media profile you shared, including content, positioning, reach and the path from attention to enquiry.', focus: 'Content, positioning, reach and conversion', label: 'Social media profile', service: 'social-media'
  } : isSeo ? {
    title: 'Get your free SEO audit', subtitle: 'Find what is holding your website back', description: 'Share your website and business goals so we can identify where to improve your search visibility.',
    formTitle: 'Request your free SEO audit', formCopy: 'We will review your website and contact you with practical SEO next steps.', nextReview: 'We look for technical, content and search visibility opportunities on the website you share.', focus: 'Technical SEO, content and organic visibility', label: 'Website', service: 'seo'
  } : {
    title: 'Get your free website audit', subtitle: 'Tell us where to look', description: 'Your website is already filled in. Add your contact details and context so our team can review the right business goals.',
    formTitle: 'Request your free website audit', formCopy: 'We will use these details to review your website and contact you with practical next steps.', nextReview: 'We review the website you shared, including visibility, mobile experience, messaging, speed and the path from visit to enquiry.', focus: 'Visibility, UX, messaging and conversion', label: 'Website', service: 'website'
  };
  document.querySelector('[data-audit-page-title]').textContent = content.title;
  document.querySelector('[data-audit-page-subtitle]').textContent = content.subtitle;
  document.querySelector('[data-audit-page-description]').textContent = content.description;
  document.querySelector('[data-audit-form-title]').textContent = content.formTitle;
  document.querySelector('[data-audit-form-copy]').textContent = content.formCopy;
  document.querySelector('[data-audit-next-review]').textContent = content.nextReview;
  document.querySelector('[data-audit-focus]').textContent = content.focus;
  document.querySelector('[data-audit-target-label]').firstChild.nodeValue = `${content.label} `;
  document.title = `${content.title} | Studio 17`;
  target.value = isLocalSeo ? (params.get('city') || '').slice(0, 100) : params.get('target') || '';
  if (isLocalSeo) {
    target.maxLength = 100;
    target.autocomplete = 'address-level2';
  }

  fetch('/api/contact?mode=location', { headers: { accept: 'application/json' } })
    .then(response => response.ok ? response.json() : null)
    .then(result => {
      const country = result?.country || 'CY';
      const option = [...countrySelect.options].find(item => item.dataset.country === country);
      if (option) countrySelect.value = option.value;
    })
    .catch(() => { countrySelect.value = '+357'; });

  const showStatus = (message, state) => {
    status.hidden = false;
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      showStatus('Please complete the required fields before sending.', 'error');
      return;
    }
    const values = Object.fromEntries(new FormData(form).entries());
    const details = values.comments.trim() || 'No additional comments were provided.';
    const payload = {
      name: `${values.firstName} ${values.lastName}`.trim(),
      email: values.email,
      company: values.company,
      phone: `${values.countryCode} ${values.phoneNumber}`.trim(),
      service: content.service,
      budget: 'not-sure',
      message: `${isLocalSeo ? 'Local SEO enquiry\n' : ''}${content.label}: ${values.auditTarget}\n\nComments or questions:\n${details}`,
      language: 'en',
      consent: values.consent,
      website: values.website,
      submissionId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    };
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    showStatus('Sending your audit request…', 'sending');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error('SEND_FAILED');
      showStatus(isLocalSeo ? 'Thank you. Your Local SEO enquiry has been sent to Studio 17.' : 'Thank you. Your free audit request has been sent to Studio 17.', 'success');
      [...form.elements].forEach(element => { element.disabled = true; });
    } catch {
      showStatus('The form is temporarily unavailable. Please try again or email contact@studio17.world.', 'error');
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });
})();
