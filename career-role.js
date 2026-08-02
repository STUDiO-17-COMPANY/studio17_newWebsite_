(() => {
  'use strict';

  const loading = document.querySelector('[data-role-loading]');
  const content = document.querySelector('[data-role-content]');
  const error = document.querySelector('[data-role-error]');
  const live = document.querySelector('[data-role-live]');

  if (!loading || !content || !error) return;

  const refreshIcons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
  const parameters = new URLSearchParams(location.search);
  const roleId = parameters.get('id') || '';
  const pathMatch = location.pathname.match(/^\/careers\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/i);
  const roleSlug = (pathMatch?.[1] || parameters.get('slug') || '').toLowerCase();

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || '';
  };

  const renderParagraphs = (selector, paragraphs) => {
    const container = document.querySelector(selector);
    if (!container) return;
    container.replaceChildren(...(paragraphs || []).map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
  };

  const renderList = (selector, items) => {
    const container = document.querySelector(selector);
    if (!container) return;
    container.replaceChildren(...(items || []).map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
  };

  const toggleSection = (name, items) => {
    const section = document.querySelector(`[data-role-section="${name}"]`);
    if (section) section.hidden = !Array.isArray(items) || items.length === 0;
  };

  const renderRole = role => {
    setText('[data-role-title]', role.title);
    setText('[data-role-department]', role.department);
    setText('[data-role-summary]', role.summary);
    document.title = `${role.title} — Careers — Studio 17`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = role.summary;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', role.summary);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', role.summary);

    renderParagraphs('[data-role-about]', role.about);
    renderList('[data-role-responsibilities]', role.responsibilities);
    renderList('[data-role-requirements]', role.requirements);
    renderList('[data-role-nice-to-have]', role.niceToHave);
    renderList('[data-role-offer]', role.offer);
    renderParagraphs('[data-role-hiring-process]', role.hiringProcess);
    renderParagraphs('[data-role-equal-opportunity]', role.equalOpportunity);

    ['about', 'responsibilities', 'requirements', 'niceToHave', 'offer', 'hiringProcess', 'equalOpportunity']
      .forEach(name => toggleSection(name, role[name]));

    ['department', 'location', 'workModel', 'employmentType', 'experienceLevel', 'applicationDeadline']
      .forEach(key => {
        setText(`[data-role-fact="${key}"]`, role[key]);
        const row = document.querySelector(`[data-role-fact-row="${key}"]`);
        if (row) row.hidden = !role[key];
      });

    const apply = document.querySelector('[data-role-apply]');
    if (apply) {
      apply.href = role.applicationUrl;
      apply.setAttribute('aria-label', `Apply for ${role.title}`);
    }

    loading.hidden = true;
    error.hidden = true;
    content.hidden = false;
    if (live) live.textContent = `${role.title} loaded.`;
    refreshIcons();
  };

  const showError = (status, code) => {
    const unavailable = status >= 500;
    setText('[data-role-title]', unavailable ? 'Role details unavailable' : 'Role closed');
    setText('[data-role-department]', 'Studio 17 careers');
    setText('[data-role-summary]', unavailable
      ? 'We could not reach the latest role information. Please try again shortly.'
      : 'This position is no longer in the current Studio 17 open-role list.');
    setText('[data-role-error-title]', unavailable ? 'Role details are temporarily unavailable.' : 'This role is no longer open.');
    setText('[data-role-error-copy]', unavailable
      ? 'The Careers connection could not be reached. Return to Careers and try again in a moment.'
      : code === 'INVALID_ROLE_ID'
        ? 'This role link is invalid. Return to Careers to choose a current position.'
        : 'The position may have been filled or removed. Return to Careers to see the current list.');
    document.title = `${unavailable ? 'Role unavailable' : 'Role closed'} — Studio 17`;
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,follow');
    loading.hidden = true;
    content.hidden = true;
    error.hidden = false;
    if (live) live.textContent = unavailable ? 'Role details are temporarily unavailable.' : 'This role is no longer open.';
    refreshIcons();
  };

  const loadRole = async () => {
    if (window.__STUDIO17_ROLE__) {
      renderRole(window.__STUDIO17_ROLE__);
      return;
    }
    if (window.__STUDIO17_ROLE_ERROR__) {
      showError(window.__STUDIO17_ROLE_ERROR__.status || 404, window.__STUDIO17_ROLE_ERROR__.code);
      return;
    }

    const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(roleSlug);
    const validId = /^[A-Za-z0-9_-]{10,200}$/.test(roleId);
    if (!validSlug && !validId) {
      showError(400, 'INVALID_ROLE_ID');
      return;
    }

    try {
      const query = validSlug ? `slug=${encodeURIComponent(roleSlug)}` : `id=${encodeURIComponent(roleId)}`;
      const response = await fetch(`/api/career-role?${query}`, { headers: { accept: 'application/json' } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.role) {
        showError(response.status, payload.error?.code);
        return;
      }
      renderRole(payload.role);
    } catch {
      showError(503, 'CAREERS_UNAVAILABLE');
    }
  };

  loadRole();
})();
