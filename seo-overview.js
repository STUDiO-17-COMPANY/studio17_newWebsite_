(() => {
  const engine = document.querySelector('[data-seo-engine]');
  if (engine && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const names = ['Google', 'Bing', 'Yahoo', 'DuckDuckGo', 'Ecosia'];
    const variants = names.map((name, index) => {
      const word = document.createElement('span');
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
  const action = document.querySelector('[data-seo-benefit-action]');
  if (benefits && action) benefits.addEventListener('toggle', () => {
    action.textContent = benefits.querySelector('details[open]')?.dataset.action || 'Talk about your SEO goals';
  }, true);
})();
