# LLM discovery directory

`/llms.txt` is rewritten to `api/llms.js`, which returns plain UTF-8 text for GET and an empty body for HEAD. It requires no visitor authentication or JavaScript.

The curated core links are maintained in that handler. Article links come from `listPublishedArticles(request, 'en')`, the same Google Docs pipeline used by the archive and sitemap. That pipeline validates Published status, required metadata and English content, excludes removed/trashed documents and deduplicates slugs. The article page uses the same dataset to serve HTTP 200/indexable HTML. Category paths use the existing `getArticlePath` helper, so category changes never require a second slug or URL list. Descriptions reuse existing summaries; newest articles appear first. No language query variants are included.

The CDN cache is fresh for 60 seconds and may serve stale content for another 300 seconds while refreshing. Source failures return uncached 503 with Retry-After instead of publishing an empty directory. Publication/removal appears after cache refresh; no deployment is needed for editorial changes. As with article pages, a future publication date does not schedule publishing.

`scripts/sync-document-metadata.cjs` applies the shared describedby link to root HTML pages and API HTML templates. Vercel runs it at build time. Run it locally after adding templates. Robots, sitemap, canonicals and structured data retain their own purposes; this directory does not guarantee inclusion in AI answers.

Verification: `node tests/llms.test.cjs`. After deployment verify `/llms.txt` with GET/HEAD, check the content type and no redirect, and compare its article links to `/api/articles?lang=en`. Follow listed article URLs to verify live 200 responses, indexability and self-referencing canonicals.
