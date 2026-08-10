(() => {
  'use strict';

  const measurementId = 'G-6VWS39DSNX';
  const consentKey = 'studio17-analytics-consent-v1';
  const granted = 'granted';
  const denied = 'denied';
  const productionHosts = new Set(['studio17.world', 'www.studio17.world']);
  const isProduction = productionHosts.has(location.hostname);
  let googleTagLoaded = false;
  let consentBanner;
  let settingsButton;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

  const consentState = analyticsStorage => ({
    analytics_storage: analyticsStorage,
    ad_storage: denied,
    ad_user_data: denied,
    ad_personalization: denied
  });

  window.gtag('consent', 'default', {
    ...consentState(denied),
    functionality_storage: granted,
    security_storage: granted,
    wait_for_update: 500
  });
  window.gtag('set', 'ads_data_redaction', true);

  const readConsent = () => {
    try {
      const value = localStorage.getItem(consentKey);
      return value === granted || value === denied ? value : null;
    } catch {
      return null;
    }
  };

  const storeConsent = value => {
    try { localStorage.setItem(consentKey, value); } catch { /* A private browsing context may block storage. */ }
  };

  const translate = text => window.Studio17I18n?.translate(text) || text;

  const clearAnalyticsCookies = () => {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      if (location.hostname.endsWith('studio17.world')) {
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.studio17.world; SameSite=Lax`;
      }
    });
  };

  const loadGoogleTag = () => {
    if (googleTagLoaded || !isProduction) return;
    googleTagLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.dataset.studio17Analytics = 'true';
    document.head.append(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: true
    });
  };

  const renderCopy = () => {
    if (!consentBanner) return;
    consentBanner.querySelector('[data-analytics-consent-title]').textContent = translate('Help us improve the website');
    consentBanner.querySelector('[data-analytics-consent-copy]').textContent = translate('With your permission, we use an analytics tool to understand where our website traffic comes from and how visitors use the site. This helps us improve the experience. The tool remains off unless you accept.');
    consentBanner.querySelector('[data-analytics-consent-accept]').textContent = translate('Allow analytics');
    consentBanner.querySelector('[data-analytics-consent-reject]').textContent = translate('Continue without analytics');
    settingsButton.textContent = translate('Analytics settings');
    settingsButton.setAttribute('aria-label', translate('Review analytics settings'));
  };

  const showConsent = ({ focus = false } = {}) => {
    consentBanner.hidden = false;
    if (focus) consentBanner.querySelector('[data-analytics-consent-accept]').focus();
  };

  const hideConsent = () => { consentBanner.hidden = true; };

  const updateConsent = value => {
    storeConsent(value);
    window.gtag('consent', 'update', consentState(value));

    if (value === granted) loadGoogleTag();
    else clearAnalyticsCookies();

    hideConsent();
    settingsButton.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent('studio17:analyticsconsent', { detail: { analytics: value } }));
  };

  const createConsentControls = () => {
    consentBanner = document.createElement('section');
    consentBanner.className = 'analytics-consent';
    consentBanner.hidden = true;
    consentBanner.setAttribute('role', 'dialog');
    consentBanner.setAttribute('aria-labelledby', 'analytics-consent-title');
    consentBanner.setAttribute('aria-describedby', 'analytics-consent-copy');
    consentBanner.setAttribute('data-i18n-skip', '');
    consentBanner.innerHTML = `
      <div class="analytics-consent-copy">
        <h2 id="analytics-consent-title" data-analytics-consent-title>Help us improve the website</h2>
        <p id="analytics-consent-copy" data-analytics-consent-copy>With your permission, we use an analytics tool to understand where our website traffic comes from and how visitors use the site. This helps us improve the experience. The tool remains off unless you accept.</p>
      </div>
      <div class="analytics-consent-actions">
        <button class="analytics-consent-button analytics-consent-accept" type="button" data-analytics-consent-accept>Allow analytics</button>
        <button class="analytics-consent-button analytics-consent-reject" type="button" data-analytics-consent-reject>Continue without analytics</button>
      </div>`;
    document.body.append(consentBanner);

    settingsButton = document.createElement('button');
    settingsButton.className = 'footer-cookie-settings';
    settingsButton.type = 'button';
    settingsButton.setAttribute('data-i18n-skip', '');
    settingsButton.textContent = 'Analytics settings';

    const legalCopy = document.querySelector('.footer-bottom > p');
    if (legalCopy) {
      const container = document.createElement('span');
      container.className = 'footer-cookie-preferences';
      container.append(settingsButton);
      legalCopy.append(container);
    } else {
      document.body.append(settingsButton);
    }

    consentBanner.querySelector('[data-analytics-consent-accept]').addEventListener('click', () => updateConsent(granted));
    consentBanner.querySelector('[data-analytics-consent-reject]').addEventListener('click', () => updateConsent(denied));
    settingsButton.addEventListener('click', () => showConsent({ focus: true }));
  };

  const initialise = async () => {
    createConsentControls();
    try { await window.Studio17I18n?.ready; } catch { /* English fallback remains available. */ }
    renderCopy();

    const savedConsent = readConsent();
    if (savedConsent === granted) {
      window.gtag('consent', 'update', consentState(granted));
      loadGoogleTag();
    } else if (savedConsent === denied) {
      window.gtag('consent', 'update', consentState(denied));
    } else {
      showConsent();
    }
  };

  window.addEventListener('studio17:languagechange', () => {
    renderCopy();
    if (!googleTagLoaded) return;
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: location.href,
      page_path: `${location.pathname}${location.search}`
    });
  });

  window.Studio17Analytics = {
    measurementId,
    consentKey,
    isProduction,
    getConsent: readConsent,
    openSettings: () => showConsent({ focus: true })
  };

  initialise();
})();
