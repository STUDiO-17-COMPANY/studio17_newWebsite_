# Studio 17 locales

The website uses one JSON file per locale:

- `en.json` — English, default.
- `pt-PT.json` — Portuguese from Portugal.
- `es.json` — Spanish.
- `el.json` — Greek.
- `ru.json` — Russian.
- `he.json` — Hebrew, right-to-left.

`i18n.js` loads the selected file, persists the choice in `localStorage`, updates the `?lang=` URL parameter and applies the correct document direction. English keeps the clean URL without a parameter.

`locales.js` is a generated copy of all six JSON sources. It loads before `i18n.js` so language switching also works when the website is opened directly through `file://`, where browsers block JSON `fetch` requests. Never edit `locales.js` manually.

After editing a JSON source, regenerate the bundle from the website root:

```powershell
node locales/build-bundle.cjs
```

Each file has three contracts:

1. `meta` for homepage, sitemap and WIP page titles and descriptions.
2. `strings` for static interface and page copy. Keys are the approved English source strings.
3. `services` for category labels, item labels, reusable descriptions and featured service copy.

When adding or changing public copy, update all six files in the same change. Native-language editorial review is required before publication.
