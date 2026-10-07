# Studio 17 SEO guide

This document is the maintenance contract for search visibility. It covers technical discoverability and page quality; it does not promise rankings, which also depend on competition, authority, useful content and time.

## Google Search Console

- The Domain property `studio17.world` was verified on 2026-09-05 using the `contact@studio17.world` account.
- `https://www.studio17.world/sitemap.xml` was submitted and processed successfully; Google discovered 23 URLs on the initial read.
- The property is associated with the Google Analytics 4 property `H&P Domus Creative Ltd.` and its `Studio 17` web data stream for combined organic-search and on-site reporting.
- Search Console processing is asynchronous. Newly discovered URLs, query data, indexing reports and Core Web Vitals can take several days to appear.
- Keep ownership and reporting administration on `contact@studio17.world`; do not add the retired Studio 17 Gmail account or personal accounts as maintainers.

## Canonical public URLs

- Homepage: `https://www.studio17.world/`
- Contact: `https://www.studio17.world/contact`
- FAQ: `https://www.studio17.world/faq`
- About: `https://www.studio17.world/about`
- Services catalogue: `https://www.studio17.world/services`
- Website Development: `https://www.studio17.world/services/website-development`
- Website pricing comparison: `https://www.studio17.world/services/website-pricing`
- Social Media services: `https://www.studio17.world/services/social-media`
- SEO services: `https://www.studio17.world/services/seo`
- SEO agency Cyprus: `https://www.studio17.world/seo/cyprus`
- SEO company Limassol: `https://www.studio17.world/seo/limassol`
- Careers: `https://www.studio17.world/careers`
- Vacancy: `https://www.studio17.world/careers/<role-name>`
- Human-readable sitemap: `https://www.studio17.world/sitemap`
- Search-engine sitemap: `https://www.studio17.world/sitemap.xml`
- Crawler rules: `https://www.studio17.world/robots.txt`

Do not publish Google Drive document IDs, tracking parameters or language parameters in vacancy URLs. The old `career-role.html?id=...&role=...` format is accepted only to issue a permanent redirect.

## Careers indexing lifecycle

1. A valid Google Doc inside the approved open-role folder creates one server-rendered card and one normal crawlable link on `/careers`, plus one clean role URL.
2. The role page is generated server-side with a unique title, description, canonical URL, social metadata and breadcrumb data. Valid `JobPosting` JSON-LD is added when location requirements satisfy Google's rules.
3. The XML sitemap includes the role slug and its Google Drive `modifiedTime`.
4. Moving the Doc out of the folder removes it from the list and sitemap. Its direct URL returns HTTP 404 with `noindex,follow`.
5. Renaming a published Doc changes its slug. Treat that as a URL migration; avoid renaming after sharing unless a redirect is deliberately added.

The Google Doc filename is the public role title and URL source. Use a concise human-readable name such as `Sales Partner - Europe Market`; the URL becomes `/careers/sales-partner-europe-market`.

For a fully remote vacancy, add the exact heading `Applicant countries (SEO)` and list at least one eligible country. Google requires country-level eligibility for remote job markup; broad values such as `Europe` or `Worldwide` are not emitted as countries. The normal vacancy page remains indexable when this optional field is absent, but it will not claim Google Jobs eligibility.

## Metadata rules

- Every indexable page needs one descriptive title, one meta description and one canonical link.
- Use `https://www.studio17.world` consistently; do not mix apex and `www` URLs.
- Public page URLs never expose `.html`; Vercel redirects legacy filenames to their extensionless canonical routes.
- Static company and service pages currently use client-enhanced language states rather than independently rendered translated documents. Their English URL is the only canonical indexable version, and their head advertises only `x-default` and `en`. Do not add `?lang=` variants to the XML sitemap or advertise them through `hreflang` until each language has translated server HTML, the correct `<html lang>`, a self-referencing canonical and reciprocal alternates.
- Published article translations and translated News archive pages are server-rendered. These may use indexable `?lang=` URLs because the initial response contains the translated content, correct language declaration, self-referencing canonical and reciprocal `hreflang` set.
- Careers and role pages are English-only and must not advertise translated alternatives.
- WIP pages stay `noindex,follow` until real, approved content replaces them.
- Contextual WIP destinations use `/wip#for=<destination>` rather than query-string variants. The fragment preserves the visitor-facing label while search engines see one canonical `/wip` URL; localized WIP links must not add `?lang=` and are marked `nofollow` after rendering.
- A Search Console exclusion for the canonical WIP page is expected. Do not run “Validate fix” unless a published page was accidentally assigned `noindex`; use `node scripts/audit-indexability.cjs` to verify every sitemap URL first.
- Never add unsupported review ratings, awards, locations or business claims to structured data.
- Keep the Website Development `Service`/`OfferCatalog` structured data synchronized with visible package names and prices. The catalogue page remains price-free.
- Keep the SEO page's `Service`/`OfferCatalog` data synchronized with its ten visible capabilities. Its interface supports approved translations, but English remains the sole search canonical until translated variants are rendered on the server.
- Keep both geographic SEO landing pages truthful and location-specific. Their approved language interfaces must not be exposed as search alternates until the translated responses meet the server-rendering, language, canonical and reciprocal-`hreflang` requirements above.
- `/seo/cyprus` serves Cyprus-wide commercial agency intent across organic, local, multilingual and AI search. `/seo/limassol` serves local agency intent with an explicit Search, Maps, Google Business Profile and enquiry journey. Do not reuse one page by swapping place names.
- Do not add SEO guarantees, invented performance results, unsupported ratings or `FAQPage` markup. Use Search Console and consent-aware analytics as measurement tools, not as claims of results.
- Preserve descriptive project alternative text, explicit image dimensions and crawlable project links; do not replace useful visible copy with image-only case studies.

## Internal discovery architecture

- Important indexable pages must be reachable through normal `<a href>` links; do not depend only on JavaScript-rendered menus, XML sitemap discovery or manual URL submission.
- The human sitemap at `/sitemap` is a curated directory for visitors. Keep only the main published company, service, work, news and legal destinations; do not list individual articles, open roles, location landing pages, WIP destinations or the Sitemap page itself.
- `sitemap.xml` remains the complete machine-readable discovery source for canonical indexable pages, including published articles, available article translations, open roles, location landing pages and crawlable archive pagination.
- Keep the human sitemap template at `api/sitemap-template.html`; placing a root `sitemap.html` file back in the project makes Vercel serve that static file before the `/sitemap` function rewrite.
- Include `<lastmod>` only when the application has an authoritative date. Articles and roles use their source modification dates; the homepage, News archive and Careers index use the newest relevant source date. Static pages omit `<lastmod>` instead of sharing an artificial deployment-wide date.
- Keep published article routes aligned with their category: Insights use `/insights/<slug>`, Case Studies use `/case-studies/<slug>` and News uses `/news/<slug>`. Feed links, related links, language alternates, canonicals, `llms.txt` and the XML sitemap must continue using the shared category-aware routing helper; mismatched legacy routes permanently redirect to the canonical category route.
- Keep permanent article slug corrections in `server/_article-paths.js` so article cards, sitemap entries, related content, `llms.txt` and canonicals all emit the corrected URL while the old source slug redirects once to it. Do not duplicate aliases in individual templates.
- Each rendered article includes a small set of topic-relevant, server-rendered Studio 17 links after its body. Keep these links useful and selective; they support visitors and discovery rather than keyword repetition.
- The homepage footer links to `/services/seo`. The main SEO page then links contextually and reciprocally to `/seo/cyprus` and `/seo/limassol` through its visible market directory.
- Both market pages link back to `/services/seo`. Keep this small service cluster intact when changing navigation or page layouts.
- The XML sitemap supports discovery but does not guarantee crawling, indexing or ranking. Search Console inspection and indexing requests are follow-up signals, not substitutes for internal links and useful original content.

## Content priorities

Technical SEO enables crawling; useful pages create ranking opportunities. As final pages replace WIP, each service and industry page should answer a specific search intent with original copy, clear evidence, relevant internal links, meaningful headings and a distinct title/description. Avoid creating many near-duplicate location or keyword pages.

FAQ answers must be written for people making real business decisions, then refined using recurring enquiries and Search Console query evidence. Do not keyword-stuff or turn near-identical queries into separate questions.

Studio 17 is not currently an eligible government or health authority for Google's restricted FAQ rich results. Keep the visible semantic FAQ content, but do not add `FAQPage` JSON-LD unless Google's eligibility rules change and Studio 17 qualifies.

## Release checklist

1. Run parser, API, SEO-routing and responsive browser tests.
2. Confirm `/robots.txt` and `/sitemap.xml` return HTTP 200 in production.
3. Confirm one current role URL returns HTTP 200, a unique canonical and valid `JobPosting` JSON-LD.
4. Confirm an invented/removed role returns HTTP 404 and `noindex,follow`.
5. Check that the XML sitemap contains current roles only and never contains `career-role.html` or `?id=`. Individual roles must not appear in the human sitemap.
6. Confirm the verified `studio17.world` Search Console property still reports `https://www.studio17.world/sitemap.xml` as successfully processed. Google revisits the submitted sitemap automatically.
7. Monitor Search Console indexing, enhancements and Core Web Vitals; fix errors before adding more page families.
8. Confirm `/faq` returns HTTP 200, has one English canonical, advertises only `x-default` and `en`, and appears in both the human and XML sitemaps.
9. Confirm no FAQ link still points to WIP and the complete mobile menu remains limited to Services, Work, About, News and Careers.
10. Confirm `/about` returns HTTP 200, uses the English canonical with `x-default` and `en` only, appears in both sitemaps and has replaced every About WIP link.
11. Confirm `/services` and `/services/website-development` return HTTP 200, use the English canonical with `x-default` and `en` only, appear in both sitemaps and contain no internal service codes.
12. Confirm `/services/seo` returns HTTP 200, advertises only its English search canonical until translated SSR exists, appears in both sitemaps, and preselects SEO at `/contact?service=seo`.
13. Confirm `/seo/cyprus` and `/seo/limassol` return HTTP 200, use unique metadata and location `Service` data, advertise only their English search canonicals until translated SSR exists, contain eight relevant FAQs, link to `/services/seo`, preserve both lead CTAs and appear in the XML sitemap without being listed in the curated human sitemap.
14. Confirm `/services/social-media` returns HTTP 200, is English-only with `x-default` and `en` alternates, exposes four service descriptions in initial HTML, appears in both sitemaps and is linked from the shared Services menu and catalogue.

## Files to update together

- Route or canonical change: `vercel.json`, affected HTML/JS, `api/sitemap.js`, tests, this guide and `CHANGELOG.md`.
- New indexable page: page metadata, XML sitemap generator, internal links and tests. Add it to the human sitemap only when it is a main visitor destination.
- Removed page: permanent redirect when there is a true replacement; otherwise HTTP 404/410 and sitemap removal.
- New language: locale data, selector, canonical/hreflang logic, sitemap alternates and cross-language QA.
