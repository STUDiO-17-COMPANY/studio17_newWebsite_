# Service-page translations

The English source remains visible in `services.html` and `website-development.html`. Portuguese (Portugal), Spanish, Greek, Russian and Hebrew page-level translations live in this folder.

After editing a JSON source, regenerate the browser bundle:

```powershell
node service-locales/build-bundle.cjs
```

Do not edit `locales.js` directly. Every locale must retain the same page keys and complete HTML structure, links, icons and accessibility attributes as the English fallback.
