# Studio 17 legal information pages

Status: implemented as informative multilingual drafts
Last reviewed: 2026-08-14

These pages explain the website's current behavior. They are not a substitute for advice from a lawyer. Before Studio 17 relies on them as final legal documents, qualified Cyprus/EU counsel should review the texts, the business model and any client-facing contractual terms.

## Public routes

- `/privacy-policy` — Privacy Policy
- `/cookie-policy` — Cookie Policy and Analytics preferences
- `/terms` — Terms and Conditions for the public website

Each route has English HTML fallback plus Portuguese (Portugal), Spanish, Greek, Russian and Hebrew content in `legal-locales/`. The canonical English URL has translated `?lang=` variants and matching `hreflang` links. Legal links appear in the Company footer column and the human/XML sitemaps; the mobile menu remains limited to Services, Work, About, News and Careers.

## Controller details used in the drafts

- Legal entity: H&P DOMUS CREATIVE LTD
- Trading name: Studio 17
- Cyprus registration number: HE 493285
- Registered office: Kopaidos 9, 4152 Limassol, Cyprus
- Privacy and general contact: `contact@studio17.world`

Do not change these details from assumptions. Verify any change against official company records first.

## Current website data inventory

| Area | Data or storage | Purpose / provider |
| --- | --- | --- |
| Contact form | Name, email, optional company and phone, service, budget, message, language and consent | Enquiry handling; server-side delivery through Resend to `contact@studio17.world` |
| Hosting and security | Request data, IP address and operational/server records | Site delivery, reliability, abuse prevention and short-lived rate limiting through Vercel and the contact endpoint |
| Language | `studio17-language` in local storage | Remembers the selected website language |
| Consent | `studio17-analytics-consent-v1` in local storage | Remembers whether optional Analytics was accepted or refused |
| Optional Analytics | Page/session, approximate location, browser/device and interaction information; `_ga` and `_ga_GVWS39DSNX` | Google Analytics 4, Measurement ID `G-GVWS39DSNX`, loaded only after explicit consent |
| Published content | Public Careers and News/article content | Read from approved Google Workspace documents through server-side integrations |
| External destinations | Social, partner, presentation and review links | The destination provider applies its own privacy and cookie terms after the visitor leaves Studio 17 |

Advertising storage, advertising user data, advertising personalization and Google signals are disabled in the current Analytics controller. Changing this behavior is a privacy-impacting change.

## Retention commitments stated publicly

- Enquiries and correspondence: normally up to 24 months after the last meaningful interaction, subject to an active client relationship, a legal obligation or a legal claim.
- Analytics user-level data: intended maximum of 14 months; aggregate reports may remain longer.
- Google Analytics first-party cookies: up to two years unless consent is withdrawn or the visitor clears them earlier.
- Language and consent preferences: until changed or cleared on the visitor's device.
- Security, hosting, email delivery and backups: only according to a documented operational, security or provider need.

Do not silently change a retention setting or provider contract so it contradicts these statements.

## Maintenance workflow

When the website's forms, providers, analytics, storage, authentication, advertising, payments, embedded media, recruitment or article systems change:

1. Audit the exact data fields, recipients, purposes, legal bases, locations, safeguards and retention.
2. Update the English source in the relevant HTML page.
3. Update `pt-PT.json`, `es.json`, `el.json`, `ru.json` and `he.json` under `legal-locales/`.
4. Run `node legal-locales/build-bundle.cjs` and never hand-edit the generated bundle.
5. Update the visible last-updated/effective date in every language and the HTML `datetime` value.
6. Verify the consent panel, footer links, metadata, RTL, mobile table behavior and clean routes.
7. Run the full test suite and record the change in `CHANGELOG.md`.
8. Request legal review when the change affects purposes, legal bases, international transfers, user rights, commercial liability or consumer terms.

Translation quality also needs native-speaker review before the documents are treated as authoritative in a non-English language.
