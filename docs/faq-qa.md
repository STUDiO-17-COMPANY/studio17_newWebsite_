# FAQ QA evidence — 2026-11-02

Implementation source: approved 2026-11-01 handoff snapshot. Import result: **229 records, 12 populated categories**. The import read only FAQ Content, Routes and CTA Directory. No Owner Decisions rows were read or persisted. Exact comparison against the connector snapshot found **zero differences in IDs, questions, answers or ordered CTA pairs**. No staged subset was used.

## Checklist

| QA | Result and evidence actually obtained |
|---|---|
| Q01 | Repository audited: static HTML/vanilla JS, root-relative assets, existing locale registry, global CSS tokens and 32px/20px rhythm, consent controller and dynamic sitemap. No extra Function. |
| Q02 | Automated exact-copy/metadata assertions; browser displayed approved H1 and supporting copy. |
| Q03 | Automated search found records beyond the initial 10. Browser searched across the library. |
| Q04 | Automated Instagram, one page (FAQ-0002/0015), website price, case and diacritics passed; synonym map documented. Browser one-page search then Websites returned nine matching questions. |
| Q05 | Browser category change retained query, updated path/canonical and reset results; DOM tests passed. |
| Q06 | Browser nonsense query displayed the useful empty state; clear preserved Websites. DOM checks passed. |
| Q07 | Browser Back/Forward and refresh restored category/query; automated history-state checks passed. |
| Q08 | Browser Enter opened and Space closed a native accordion; focus remained on the summary. Stable panel associations asserted. A full screen-reader audit has not been run. |
| Q09 | All 13 unique CTA URLs fetched successfully (HTTP 200, no destination changes); final titles matched the supplied directory purposes. Zero/multiple CTA renderer fixtures checked. No forms were submitted. |
| Q10 | Browser Load More displayed 20; automated batch counts, stable unique IDs and exhausted-state logic tested. |
| Q11 | Raw HTTP preview responses for the hub and all 12 categories contained the expected answer HTML and links, without executing JavaScript. |
| Q12 | Every one of the 229 IDs appears exactly once across category HTML documents; every category linked from the hub. No pagination needed (largest category: 44). |
| Q13 | Unique titles, H1s, descriptions and self-canonicals asserted in generated HTML and checked via preview HTTP. Browser refresh retained category metadata. |
| Q14 | Empty source rejected without snapshot replacement. Events/AI Solutions absent; preview routes returned 404. |
| Q15 | Search has noindex meta and configured query-aware X-Robots-Tag. Preview header checked; real Vercel header remains a release check. |
| Q16 | Existing sitemap handler tested with stubbed unrelated feeds: hub + 12 English categories present; no withheld or translated FAQ entries. Production sitemap verification remains pending deployment. |
| Q17 | Breadcrumb JSON parsed and compared with route metadata. No FAQ rich-result claim or private schema fields. Google's external validation tool has not been run. |
| Q18 | Disposable invalid fixtures rejected: duplicate, blank answer, unknown status/category, invalid locale, blocked readiness/verification, bad CTA pair/scheme/WIP and route mismatch. |
| Q19 | Public field whitelist asserted; HTML escaped; public JSON checked for private editorial headers/fields. |
| Q20 | Missing token, simulated Sheet timeout, 503 and malformed response tests preserved last-known-good snapshot. Credentials are local/server-side only. |
| Q21 | Temporary fixture successfully refreshed, rejected a bad update, then rolled back byte-for-byte. Test required unsandboxed execution because Windows sandbox blocked rename; it passed outside the sandbox. |
| Q22 | English-only registry and output tested. No translated FAQs/hreflang generated. Preview legacy Portuguese URL redirected 301 to /faq; Vercel redirects still require deployed verification. |
| Q23 | Automated consent-denied/accepted fixtures cover all six FAQ events; raw search text absent. Existing contact/analytics regression checks run; no real lead submitted. |
| Q24 | Real browser viewport checks at 320, 375, 768 and 1440px: no document overflow or FAQ controls outside viewport. Native keyboard interaction checked. |
| Q25 | Old hub: 25,484 HTML bytes/20 details; new hub: 22,695 HTML bytes/10 details at measurement. Complete search JSON: 136,318 bytes, loaded separately. 50 searches over 687 fixture records took approximately 0.5–0.6 seconds total locally. Not a Lighthouse/Core Web Vitals or production score. |
| Q26 | No individual question routes generated; IDs preserved; only 12 approved populated categories. |
| Q27 | Routes, source mapping, rebuilding, credential/failure policy and rollback are documented in faq-maintenance.md. Preview is local only; no commit, push or deployment performed. |

## Tests and release limits

- `tests/faq-system.test.cjs`: schema/render/search/history/interaction/import/failure/rollback/sitemap checks.
- Existing FAQ-locales, multilingual routing, default OG, consent, clean URL, page hierarchy, indexing/crawlability, contact API and homepage-audit checks were run alongside it; obsolete 20-question/translated FAQ assertions were updated to the approved English-first design.
- `scripts/check-faq-ctas.cjs`: all 13 destinations returned 200 at the exact supplied URLs.
- `scripts/check-faq-preview.cjs`: hub and all categories returned 200 with correct no-JS content/canonicals; empty routes 404, search noindex header and legacy locale 301 passed.
- Real-browser interaction and viewport checks were performed through the in-app browser against localhost.

**Not completed:** actual Vercel preview/production build and edge headers/redirects, external structured-data validation, full assistive-technology audit, production performance, and Google Search Console indexing checks. None is marked passed. Manual refresh is supported; no recurring importer credentials or schedule have been provisioned. Indexing, ranking and AI citations are not guaranteed.
