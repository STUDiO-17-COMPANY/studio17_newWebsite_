# Services pages

## Public routes

- `/services` is the price-free catalogue of Studio 17 capabilities.
- `/services/website-development` is the commercial Website Development page.

Both routes use clean URLs, canonical metadata, six-language `hreflang` links, the shared header/footer, and the approved five-link mobile menu.

## Website packages

The published starting packages are Conversion Landing Page (€450), Website – Starter (€950), Website – Growth (€1,500), Website – Business (€2,250), and Custom Website / Enterprise (€3,500). Website – Starter is the only package marked “Most bought”.

Every package includes an SEO foundation, GEO foundation, Technical SEO, responsive development, accessibility foundations, and launch QA. Published prices cover the standard scope described on the page; additions, third-party services, and out-of-scope requirements must be confirmed separately.

## Catalogue rules

The catalogue contains 43 services across Website Builds; Domain & Website Add-ons; SEO, Performance & Accessibility; AI & Automation; and Website Care. Internal service codes must never appear on the public site. Use native `details`/`summary` controls so the catalogue stays accessible without JavaScript.

The Legal Pages Setup entry means technical publication of approved text. It is not legal advice.

## Proof projects

- 100 Pratos links to `https://www.100pratos.pt/`.
- PHÓS Optics links to `https://www.phosoptics.com/en`.
- Terrassi Villa is marked in development and links to `/insights/terrassivilla-accessible-tourism-in-the-azores`.

Project images must keep descriptive alternative text, explicit dimensions, lazy loading, and the approved destination.

## Translation workflow

English source content lives in the two HTML pages. Dedicated translations live in `service-locales/<locale>.json` for `pt-PT`, `es`, `el`, `ru`, and `he`. After editing a locale, run `node service-locales/build-bundle.cjs` and commit the regenerated `service-locales/locales.js`. Do not change or remove `data-service-key` values; they are the stable translation contract.

## Update checklist

When a package, price, service, or project changes:

1. Update the English source page.
2. Update all five locale JSON files.
3. Regenerate the service locale bundle.
4. Update structured data when an offer or price changes.
5. Update this document and `CHANGELOG.md`.
6. Run `node --test tests/services-pages.test.cjs` and perform desktop, mobile, and Hebrew RTL checks.
