# Legal-page translations

The English legal copy is the accessible, indexable fallback in `privacy-policy.html`, `cookie-policy.html` and `terms.html`.

Portuguese (Portugal), Spanish, Greek, Russian and Hebrew content lives in the locale JSON files in this folder. After editing a translation, regenerate the browser bundle with:

```powershell
node legal-locales/build-bundle.cjs
```

Keep every `data-legal-key` aligned with the corresponding key in each page object. Legal meaning must be reviewed whenever a provider, analytics setting, form field, retention period or company detail changes.
