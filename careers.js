(() => {
  'use strict';

  const loading = document.querySelector('[data-roles-loading]');
  const grid = document.querySelector('[data-roles-grid]');
  const empty = document.querySelector('[data-roles-empty]');
  const error = document.querySelector('[data-roles-error]');
  const live = document.querySelector('[data-careers-live]');
  const retry = document.querySelector('[data-careers-retry]');

  if (!loading || !grid || !empty || !error) return;

  const refreshIcons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });

  const setState = state => {
    loading.hidden = state !== 'loading';
    grid.hidden = state !== 'ready';
    empty.hidden = state !== 'empty';
    error.hidden = state !== 'error';
    retry?.toggleAttribute('disabled', state === 'loading');
  };

  const icon = name => {
    const element = document.createElement('i');
    element.dataset.lucide = name;
    element.setAttribute('aria-hidden', 'true');
    return element;
  };

  const createMetaItem = (iconName, label) => {
    const item = document.createElement('li');
    item.append(icon(iconName), document.createTextNode(label));
    return item;
  };

  const createRoleCard = role => {
    const card = document.createElement('article');
    card.className = 'role-card reveal is-visible';

    const top = document.createElement('div');
    top.className = 'role-card-top';
    const department = document.createElement('p');
    department.className = 'role-department';
    department.textContent = role.department;
    const mark = document.createElement('span');
    mark.className = 'role-card-mark';
    mark.append(icon('briefcase-business'));
    top.append(department, mark);

    const title = document.createElement('h3');
    title.textContent = role.title;
    const summary = document.createElement('p');
    summary.className = 'role-card-summary';
    summary.textContent = role.summary;

    const meta = document.createElement('ul');
    meta.className = 'role-card-meta';
    meta.append(
      createMetaItem('map-pin', role.location),
      createMetaItem('laptop', role.workModel),
      createMetaItem('clock-3', role.employmentType)
    );

    const link = document.createElement('a');
    link.className = 'role-card-link';
    link.href = `/careers/${encodeURIComponent(role.slug)}`;
    link.dataset.forceLanguage = 'en';
    link.append(document.createTextNode('View role'), document.createElement('span'));
    link.querySelector('span').append(icon('arrow-up-right'));
    link.setAttribute('aria-label', `View ${role.title}`);

    card.append(top, title, summary, meta, link);
    return card;
  };

  const loadRoles = async () => {
    setState('loading');
    if (live) live.textContent = 'Loading open roles.';

    try {
      const response = await fetch('/api/careers', { headers: { accept: 'application/json' } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.code || `HTTP_${response.status}`);

      const roles = Array.isArray(payload.roles) ? payload.roles : [];
      grid.replaceChildren(...roles.map(createRoleCard));
      if (roles.length) {
        setState('ready');
        if (live) live.textContent = `${roles.length} open ${roles.length === 1 ? 'role' : 'roles'} loaded.`;
      } else {
        setState('empty');
        if (live) live.textContent = "We don't have any roles open at the moment.";
      }
    } catch {
      setState('error');
      if (live) live.textContent = 'Open roles are temporarily unavailable.';
    }

    refreshIcons();
  };

  retry?.addEventListener('click', loadRoles);
  loadRoles();
})();
