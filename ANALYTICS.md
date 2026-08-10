# Google Analytics

Status: implemented in code; production verification requires deployment
Last reviewed: 2026-08-10
Google Analytics 4 Measurement ID: `G-GVWS39DSNX`

## Implementation

Every public HTML source loads the shared `analytics.js` controller after `i18n.js`. The controller is the only place that stores the Measurement ID or loads Google's `gtag.js` script.

The Google tag is restricted to `studio17.world` and `www.studio17.world`. Local files, localhost and Vercel preview domains do not send production Analytics traffic.

## Consent behavior

- Analytics storage, advertising storage, advertising user data and advertising personalization are denied by default.
- The Google tag is not downloaded until the visitor explicitly accepts Analytics.
- Advertising storage, Google signals and advertising personalization remain disabled even after Analytics consent is granted.
- The choice is stored as the device-local preference `studio17-analytics-consent-v1`.
- A translated Analytics settings control is added to the legal copy in every footer so the visitor can accept or withdraw consent later.
- Withdrawal sends an updated denied state and attempts to remove first-party `_ga` cookies for the Studio 17 domain.
- Page views are collected after consent. A language change records the translated URL as a new page view without requiring a reload.

The consent interface is available in English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew. Hebrew follows the shared RTL document direction.

## Production verification

After an approved deployment:

1. Open `https://www.studio17.world/` in a fresh private window.
2. Before making a choice, confirm that no request is made to `googletagmanager.com` and no `_ga` cookie exists.
3. Accept Analytics. Confirm that `gtag/js?id=G-GVWS39DSNX` loads and Analytics collection requests begin.
4. Open Google Analytics Realtime and confirm the visit appears. Google notes that initial collection can take up to 30 minutes.
5. Change the website language and confirm one new `page_view` uses the translated `?lang=` URL.
6. Open Analytics settings in the footer, continue without Analytics and confirm the consent state changes to denied and `_ga` cookies are removed.
7. Repeat the consent interface check in all six languages, including Hebrew RTL and the 320px minimum viewport.
8. In the Google installation test, accept Analytics on the website before starting the test because the tag deliberately does not load before consent.

## Maintenance

- If the GA4 web stream changes, update the single `measurementId` constant in `analytics.js` and this document, then rerun the Analytics regression test.
- Never paste a second Google tag directly into an HTML page.
- Keep consent copy synchronized in the five translated locale JSON files and regenerate `locales/locales.js`.
- Treat changes to collected events, user properties, Google signals, advertising features or consent storage as privacy-impacting changes that require documented review.
- The consent control is not a substitute for an approved Privacy Policy and Cookie Policy. Those legal pages remain required before the website is treated as fully production-ready.
