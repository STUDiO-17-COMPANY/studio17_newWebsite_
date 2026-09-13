# Service-page translations

The English source remains visible in each page template. Portuguese (Portugal), Spanish, Greek, Russian and Hebrew page-level translations live in this folder.

`requested-translations.js` contains the explicitly approved language additions for `/services/website`, `/services/seo`, `/seo/cyprus` and `/seo/limassol`. It is generated from the complete English page regions by `scripts/build-requested-service-translations.cjs`, then terminology and real-browser layout are reviewed before release. Preserve the target-language matrix in the generator rather than adding unapproved languages to a page.

After editing a JSON source, regenerate the browser bundle:

```powershell
node service-locales/build-bundle.cjs
```

Do not edit `locales.js` directly. Every locale must retain the same page keys and complete HTML structure, links, icons and accessibility attributes as the English fallback.
