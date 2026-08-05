# Studio 17 website

Studio 17 website built with semantic HTML, CSS and vanilla JavaScript. The implementation follows the supplied Figma/PDF homepage frame, with the later approved footer-spacing correction bringing the current desktop page to 1920 × 4294px. Careers adds small server-side Vercel Functions solely for its secure Google Drive connection; the frontend remains framework-free.

## Project structure

- `/` (`index.html`) — Figma-matched homepage.
- `/sitemap` (`sitemap.html`) — public website map and planned page structure.
- `/wip?for=<destination>` (`wip.html`) — shared multilingual destination for pages that are not built yet.
- `/contact` (`contact.html`) — multilingual project enquiry page with server-side email delivery.
- `/careers` (`careers.html`) — English-only Careers index with automatic Google Drive role listing.
- `/careers/<role-name>` (`career-role.html` template) — clean, server-rendered role route populated from the selected Google Doc.
- `careers.js` / `career-role.js` — Careers loading, rendering and failure-state behavior.
- `contact.js` / `api/contact.js` — contact-form interaction, validation and Resend delivery.
- `api/` — Vercel Functions for authenticated, read-only Drive/Docs access and role validation.
- `.env.example` — non-secret environment-variable contract for the Careers connection.
- `vercel.json` — Vercel Function, redirect and clean-route configuration.
- `dev-server.cjs` — dependency-free local server that mirrors the production clean routes.
- `robots.txt` / `/sitemap.xml` — crawler policy and live search-engine sitemap.
- `styles.css` — design tokens, layout, responsive rules and motion.
- `script.js` — navigation, service selector, carousels and reveal interactions.
- `wip.js` — identifies and localizes the requested unfinished destination.
- `i18n.js` — locale detection, language switching, persistence and RTL handling.
- `locales/` — English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew content files.
- `locales/locales.js` — generated browser bundle that makes language switching work when the HTML files are opened directly.
- `locales/build-bundle.cjs` — regenerates that bundle from the six canonical JSON files.
- `Vendor/lucide.min.js` — pinned local Lucide 1.24.0 browser package; its licence is stored beside it.
- `Images/` — supplied brand assets and locally optimised page imagery.
- `Fonts/` — locally hosted Inter and Plus Jakarta Sans font files with their licences.
- `DESIGN_GUIDELINES.md` — canonical page, component, icon and QA rules.
- `DESIGN_SYSTEM.md` — compact token and geometry reference.
- `CONTENT_NOTES.md` — content verification and launch notes.
- `CHANGELOG.md` — dated implementation history.
- `CAREERS_AUTOMATION.md` — automatic publishing architecture, setup, security and QA guide.
- `CONTACT_FORM.md` — contact delivery setup, security, testing and maintenance guide.
- `TASKS.md` — living development backlog, including postponed and blocked production work.
- `SEO.md` — search metadata, indexing, structured-data and URL maintenance rules.
- `tests/` — parser, API and browser coverage for the Careers automation and responsive states.

## Local preview

The site has no build step and no package dependencies. From this folder, run:

```powershell
node dev-server.cjs 8080
```

Then open `http://localhost:8080`.

Opening `index.html` directly also works, including language switching. A local server is still recommended for normal development previews.

The Careers and contact APIs require the Vercel environment variables documented in `CAREERS_AUTOMATION.md` and `CONTACT_FORM.md`. Static local preview shows the designed unavailable states unless the APIs are run through Vercel or mocked for QA.

After editing any locale JSON file, regenerate the direct-file bundle:

```powershell
node locales/build-bundle.cjs
```

## Maintenance rules

1. Keep the site framework-free unless the scope changes.
2. Add local images to `Images/`; do not rely on temporary Figma asset URLs.
3. Follow `DESIGN_GUIDELINES.md`; preserve the documented homepage geometry and build future pages on the same 1440px shell.
4. Use Lucide for interface pictograms. Keep supplied official artwork for company and social brand marks.
5. Respect `prefers-reduced-motion` for every new animation.
6. Do not publish metrics, testimonials, partner names or case-study claims without confirmation.
7. Update the sitemap and documentation in the same change as any new page or design rule.
8. Add every meaningful code, content or design change to `CHANGELOG.md`.
9. Keep multilingual public copy in sync across `locales/en.json`, `pt-PT.json`, `es.json`, `el.json`, `ru.json` and `he.json`; Hebrew must retain RTL support. Careers and individual role pages are the documented English-only exception.
10. Point unfinished destinations to `/wip?for=<destination>` and replace that link with the final clean route when the page is published.
11. Header items, promotional CTAs, cards and footer navigation must use WIP until their real HTML page exists. Keep only actual pages, structural anchors and real email addresses as direct destinations.
12. Treat the 1920px fixed geometry as the English reference only. Translated and responsive text containers must grow naturally; never hide buttons or copy to preserve an English-only height.
13. Test all six languages at 1920px, 1440px, 1280px, 1024px, 900px, 768px, 390px and the supported 320px minimum width after changing layout or copy.
14. Keep Careers credentials server-side, rotate keys safely and follow `CAREERS_AUTOMATION.md` whenever the Google/Vercel connection changes.
15. Keep one canonical URL per page, exclude WIP pages from indexing, and follow `SEO.md` whenever routes, languages or public pages change.
16. Keep contact credentials server-side and follow `CONTACT_FORM.md` whenever the form, recipient or email provider changes.
17. Keep `TASKS.md` current whenever work is planned, postponed, completed or blocked.

## Pre-launch checklist

- Replace the clearly labelled testimonial placeholders with approved client quotations.
- Confirm case-study outcomes and partner-logo publication rights.
- Replace article email links with live article URLs when those pages exist.
- Add separate social links when the official profile URLs are supplied.
- Replace the WIP destinations for privacy, cookies, terms, articles and case studies as their approved pages are published.
- Test current Chrome, Safari, Firefox and Edge on desktop and mobile.
- Run an accessibility audit and verify keyboard-only navigation.
- Have a native speaker review every non-English locale before publication.
- Review `/sitemap` whenever a page is added, renamed or removed.
- Complete the one-time service-account and Vercel environment setup before treating Careers as production-ready.
- Install Resend, verify the sender domain and publish an approved privacy policy before treating the contact form as production-ready.

## Design source

- Figma project: `STUDiO 17`, homepage frame `1725:3411`.
- Reference export: `Homepage.pdf` supplied on 2026-08-02.
