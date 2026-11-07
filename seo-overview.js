(() => {
  const engine = document.querySelector('[data-seo-engine]');
  if (engine && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const names = ['Google', 'Bing', 'Yahoo', 'DuckDuckGo', 'Ecosia'];
    const variants = names.map((name, index) => {
      const word = document.createElement('span');
      word.className = 'hero-word-variant';
      word.textContent = name;
      word.style.visibility = index ? 'hidden' : 'visible';
      return word;
    });
    engine.replaceChildren(...variants);
    let index = 0;
    setInterval(() => {
      index = (index + 1) % variants.length;
      variants.forEach((word, i) => { word.style.visibility = i === index ? 'visible' : 'hidden'; });
    }, 2500);
  }
  const services = document.querySelector('[data-seo-services]');
  if (services) {
    const nav = services.querySelector('nav');
    const links = [...nav.querySelectorAll('a')];
    const panels = links.map(link => document.getElementById(link.hash.slice(1)));
    nav.setAttribute('role', 'tablist');
    const select = (index, focus = false) => {
      links.forEach((link, i) => {
        link.setAttribute('aria-selected', String(i === index));
        link.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) links[index].focus();
    };
    links.forEach((link, index) => {
      link.id = 'seo-tab-' + index;
      link.setAttribute('role', 'tab');
      link.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', link.id);
      link.addEventListener('click', event => { event.preventDefault(); select(index); });
      link.addEventListener('keydown', event => {
        const next = { ArrowLeft: (index + links.length - 1) % links.length, ArrowRight: (index + 1) % links.length, Home: 0, End: links.length - 1, ' ': index }[event.key];
        if (next === undefined) return;
        event.preventDefault(); select(next, true);
      });
    });
    const followHash = () => select(Math.max(0, links.findIndex(link => link.hash === location.hash)));
    window.addEventListener('hashchange', followHash);
    followHash();
  }
  const benefits = document.querySelector('[data-seo-benefits]');
  const action = document.querySelector('[data-seo-benefit-label]');
  if (benefits && action) benefits.addEventListener('toggle', () => {
    action.textContent = benefits.querySelector('details[open]')?.dataset.action || 'Talk about your SEO goals';
  }, true);
  const finalImage = document.querySelector('[data-seo-final-image]');
  if (finalImage) {
    const desktopAlt = finalImage.alt;
    const mobile = matchMedia('(max-width: 600px)');
    const updateAlt = () => { finalImage.alt = mobile.matches ? finalImage.dataset.mobileAlt : desktopAlt; };
    updateAlt();
    mobile.addEventListener('change', updateAlt);
  }

  const cityForm = document.querySelector('[data-local-seo-form]');
  if (cityForm) {
    const input = cityForm.elements.namedItem('city');
    const status = cityForm.querySelector('[data-local-seo-status]');
    const submit = cityForm.querySelector('button[type="submit"]');
    let lastCity = '', submissionId;
    cityForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (submit.disabled) return;
      const city = input.value.trim();
      status.hidden = false;
      if (!/\p{L}/u.test(city) || !/^[\p{L}\p{M}\p{N} .,'’()\-]+$/u.test(city) || city.length > 100) {
        status.textContent = 'Please enter a valid city name.';
        input.focus();
        return;
      }
      if (lastCity !== city) {
        lastCity = city;
        submissionId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      }
      submit.disabled = true;
      status.textContent = 'Sending your city…';
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ mode: 'quick-audit', auditType: 'local-seo', auditTarget: city, language: 'en', submissionId })
        });
        if (!response.ok || !(await response.json()).ok) throw new Error('City enquiry unavailable');
        location.assign('/contact/local-seo?' + new URLSearchParams({ city }));
      } catch {
        status.textContent = 'We couldn’t send your city. Try again or continue to the contact form.';
        const fallback = document.createElement('a');
        fallback.href = '/contact/local-seo?' + new URLSearchParams({ city });
        fallback.textContent = ' Open Local SEO contact form';
        status.append(fallback);
        submit.disabled = false;
      }
    });
  }
})();
