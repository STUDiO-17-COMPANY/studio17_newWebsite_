# Studio 17 SEO guide

This document is the maintenance contract for search visibility. It covers technical discoverability and page quality; it does not promise rankings, which also depend on competition, authority, useful content and time.

## Canonical public URLs

- Homepage: `https://www.studio17.world/`
- Contact: `https://www.studio17.world/contact`
- FAQ: `https://www.studio17.world/faq`
- Careers: `https://www.studio17.world/careers`
- Vacancy: `https://www.studio17.world/careers/<role-name>`
- Human-readable sitemap: `https://www.studio17.world/sitemap`
- Search-engine sitemap: `https://www.studio17.world/sitemap.xml`
- Crawler rules: `https://www.studio17.world/robots.txt`

Do not publish Google Drive document IDs, tracking parameters or language parameters in vacancy URLs. The old `career-role.html?id=...&role=...` format is accepted only to issue a permanent redirect.

## Careers indexing lifecycle

1. A valid Google Doc inside the approved open-role folder creates one card and one clean role URL.
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
- Homepage, Contact, FAQ and other multilingual pages use separate `?lang=` URLs plus reciprocal `hreflang` alternates. English is the default and `x-default` version.
- Careers and role pages are English-only and must not advertise translated alternatives.
- WIP pages stay `noindex,follow` until real, approved content replaces them.
- Never add unsupported review ratings, awards, locations or business claims to structured data.

## Content priorities

Technical SEO enables crawling; useful pages create ranking opportunities. As final pages replace WIP, each service and industry page should answer a specific search intent with original copy, clear evidence, relevant internal links, meaningful headings and a distinct title/description. Avoid creating many near-duplicate location or keyword pages.

FAQ answers must be written for people making real business decisions, then refined using recurring enquiries and Search Console query evidence. Do not keyword-stuff or turn near-identical queries into separate questions.

Studio 17 is not currently an eligible government or health authority for Google's restricted FAQ rich results. Keep the visible semantic FAQ content, but do not add `FAQPage` JSON-LD unless Google's eligibility rules change and Studio 17 qualifies.

## Release checklist

1. Run parser, API, SEO-routing and responsive browser tests.
2. Confirm `/robots.txt` and `/sitemap.xml` return HTTP 200 in production.
3. Confirm one current role URL returns HTTP 200, a unique canonical and valid `JobPosting` JSON-LD.
4. Confirm an invented/removed role returns HTTP 404 and `noindex,follow`.
5. Check that the sitemap contains current roles only and never contains `career-role.html` or `?id=`.
6. After the first release, add the domain property in Google Search Console and submit `https://www.studio17.world/sitemap.xml` once. Google will then revisit it automatically.
7. Monitor Search Console indexing, enhancements and Core Web Vitals; fix errors before adding more page families.
8. Confirm `/faq` returns HTTP 200, has one canonical, exposes all six reciprocal language alternatives and appears in both the human and XML sitemaps.
9. Confirm no FAQ link still points to WIP and the complete mobile menu remains limited to Services, Work, About, News and Careers.

## Files to update together

- Route or canonical change: `vercel.json`, affected HTML/JS, `api/sitemap.js`, tests, this guide and `CHANGELOG.md`.
- New indexable page: page metadata, human sitemap, XML sitemap generator, internal links and tests.
- Removed page: permanent redirect when there is a true replacement; otherwise HTTP 404/410 and sitemap removal.
- New language: locale data, selector, canonical/hreflang logic, sitemap alternates and cross-language QA.
