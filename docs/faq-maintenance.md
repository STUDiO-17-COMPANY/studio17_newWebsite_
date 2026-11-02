# FAQ publishing and maintenance

## Architecture and source

The English FAQ hub is `/faq`; its 12 populated category routes come from the approved Routes tab. The source is the **2026-11-01 handoff snapshot**, spreadsheet `1h6KHaRDvlmw5Hy2MaHvNYnVms4f3dcCy1IEjXFRk-5E`, not the older editorial master. Current import: 229 eligible English records, no staged allowlist. Owner Decisions is never read by the importer. Events and archived records are not publishable. AI Solutions has no category page or filter.

The repository uses static HTML, vanilla JavaScript, existing CSS tokens, Vercel clean URLs and existing server sitemap generation. This feature adds no Serverless Functions. Static files in `faq/` are directly accessible with clean URLs. Category definitions feed the existing `STATIC_PAGES` registry and therefore the existing XML sitemap. The existing llms.txt already links to `/faq`.

`faq-data/approved.json` is a validated public-only fallback, **not a raw export**. Each record contains only id, locale, categoryId, question, answer, searchTerms, service and ctas. Priority is used during import and then discarded. IDs are never renumbered. Answers and CTA pairs are preserved. Display ordering is high/medium/low priority, then numeric FAQ ID. No keyword-volume claim is made.

## Editing versus publishing

A Sheet edit does not alter the live website automatically. Publishing requires an explicit import, review, successful build and deployment. No scheduler or cron was added.

1. Re-review the handoff and commercial facts when content changes. Update the approved snapshot and Routes counts together. The verification gate currently requires the exact snapshot review declaration; a changed review must be explicitly reviewed and the importer updated, not silently accepted.
2. Import the three bounded ranges: `FAQ Content!A1:AC250`, `Routes!A1:I40`, and `CTA Directory!A1:F34`. Metadata/header checks must precede reads. Increase bounds explicitly if a future approved snapshot exceeds them.
3. Supply a JSON envelope `{values, routes, ctaDirectory}` via stdin or a file **outside the deployable repository**, then run `node scripts/import-faq.cjs /absolute/private/input.json`. The envelope's `routes` and `ctaDirectory` objects contain their `values` arrays.
4. Alternatively, use `node scripts/import-faq.cjs --sheet` with an ephemeral `FAQ_GOOGLE_ACCESS_TOKEN` in the local environment. The authorised account must have read access to that Sheet and an appropriate Google Sheets read scope. Do not put a token in a command argument or tracked file. No permanent importer account or credential owner has been configured; this requires an actual owner decision if scheduled publishing is introduced later.
5. Run `npm run build:locales`, `npm run test:faq`, and `node scripts/check-faq-ctas.cjs`. Review each CTA's final page and label fit. The current 13 unique destinations returned 200 at their exact supplied URLs on 2026-11-02.
6. Review a preview before deployment. The current workbook does not authorise production deployment.

Import errors report the sheet row and FAQ ID. Empty sources, duplicate IDs/locales, unknown statuses/categories, missing answers, unapproved locales/readiness, unresolved verification, and invalid CTA pairs fail before replacing the approved snapshot. Valid imports write a temporary sibling then rename it. Missing authentication, timeouts and invalid responses do not overwrite the last-known-good snapshot.

To roll back, restore a known-good `faq-data/approved.json` from version control, run `npm run build:locales` and repeat the checks. Restore the matching code revision too if schema or route contracts changed. A successful build removes obsolete generated category HTML only; it does not remove unrelated website content.

## Rendering and discovery

- Hub HTML initially contains 10 questions and all populated category links.
- Each category document contains every approved question and answer belonging to it, including collapsed answers in the delivered HTML. No crawler interaction is required.
- JavaScript fetches `/faq-search.json`, searches all 229 records and mounts the first 10 matching results; Load More adds 10. Without JavaScript, category pages retain their complete content.
- Search matches question, service/category/synonyms and answer, in that relevance order. Case, whitespace and accents are normalised. The small documented synonym map is in `faq-search-engine.js`; this is not universal typo correction.
- Category links are real `/faq/...` destinations. JavaScript enhances them with History API navigation. Query text is kept when categories change; visible count resets to 10. Clear retains the category. History state retains visible count for Back/Forward.
- Search `?q=` states have a category canonical and a configured `X-Robots-Tag: noindex, follow`; the client also updates the robots meta. Arbitrary search links are not emitted.
- English hub/category documents are self-canonical. Old `/pt/faq`, `/es/faq`, `/el/faq`, `/ru/faq`, `/he/faq` paths permanently redirect to English; no unapproved translated answers/hreflang alternatives are generated.
- BreadcrumbList is emitted. FAQ rich results or AI citations are not promised.

## Analytics and accessibility

The existing consent controller gates `faq_search`, `faq_zero_results`, `faq_category_select`, `faq_open`, `faq_load_more`, and `faq_cta_click`. No raw search text is sent: search telemetry contains length and result count only. Category ID, FAQ ID, visible count and approved destination pathname are the other parameters. Existing contact conversions are unchanged; no new automatic form submissions were added.

Native details/summary supplies keyboard/expanded semantics; stable summary/panel IDs are associated. Load More moves focus to the first newly revealed question. Existing visible focus styles and 44px controls are retained.

## Local preview and verification

`node scripts/preview-faq.cjs` serves `http://127.0.0.1:4173/faq`. It emulates the FAQ clean paths, legacy locale redirects and search noindex header for local QA; it is not proof of Vercel production routing. Run `node scripts/check-faq-preview.cjs` against it. Full deployed Vercel responses and Search Console still require a deployed preview/release.

See `docs/faq-qa.md` for results and remaining release checks. Do not commit raw source exports, tokens or internal editorial sheets.
