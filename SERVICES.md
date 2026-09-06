# Services pages

## Public routes

- `/services` is the price-free catalogue of Studio 17 capabilities.
- `/services/website-development` is the commercial Website Development page.
- `/services/seo` is the international commercial SEO page.

All routes use clean URLs, canonical metadata, the shared header/footer, and the approved five-link mobile menu. The catalogue and Website Development page retain their existing six-language coverage. The SEO page follows the current new-page scope: English, Greek and Russian only, with reciprocal `hreflang` links for those versions plus `x-default`.

## Website packages

The published starting packages are Conversion Landing Page (€450), Website – Starter (€950), Website – Growth (€1,500), Website – Business (€2,250), and Custom Website / Enterprise (€3,500). Website – Starter is the only package marked “Most bought”.

Every package includes an SEO foundation, GEO foundation, Technical SEO, responsive development, accessibility foundations, and launch QA. Published prices cover the standard scope described on the page; additions, third-party services, and out-of-scope requirements must be confirmed separately.

## Catalogue rules

The catalogue contains 43 services across Website Builds; Domain & Website Add-ons; SEO, Performance & Accessibility; AI & Automation; and Website Care. Internal service codes must never appear on the public site. Use native `details`/`summary` controls so the catalogue stays accessible without JavaScript.

The Legal Pages Setup entry means technical publication of approved text. It is not legal advice.

## SEO service page

The SEO page is an international, high-intent landing page. It presents SEO as a connected path from search demand and visibility to qualified traffic, website experience, conversion and business growth. Its scope covers strategy and keyword research, Technical SEO, On-page SEO, Local SEO, Content SEO, International SEO, Google Business Profile and Maps, Analytics and Search Console, AI Search/GEO, and continuous SEO.

Keep the page commercially useful without unsupported promises. Never guarantee rankings, invent client SEO results, ratings or review data, or imply location-specific expertise that has not been approved. Proof may link only to real published work, the official Trustpilot profile and approved Studio 17 insights. Visible FAQs remain semantic HTML; do not add `FAQPage` structured data while the site is not eligible for that Google rich result.

Every SEO enquiry CTA uses `/contact?service=seo`. The contact page must keep `seo` in the server-side service allowlist and preselect it only when the query value matches a valid option.

## Proof projects

- 100 Pratos links to `https://www.100pratos.pt/`.
- PHÓS Optics links to `https://www.phosoptics.com/en`.
- Terrassi Villa is marked in development and links to `/insights/terrassivilla-accessible-tourism-in-the-azores`.

Project images must keep descriptive alternative text, explicit dimensions, lazy loading, and the approved destination.

The general Services page closing CTA uses `CTA_Question_Image.webp` instead of an icon. Display it in a responsive media window up to 520 × 260px, aligned with the CTA copy and using the approved close crop, intrinsic dimensions and localised alternative text. It must remain compact enough to preserve the shared CTA height.

The CTA keeps **Talk to sales** as the primary contact action and includes **See our work** as the secondary action. Until the portfolio page is published, the secondary action must use `/wip?for=portfolio` and preserve the active locale.

## Translation workflow

English source content lives in the HTML pages. The catalogue and Website Development translations live in all five `service-locales/<locale>.json` files. SEO translations live only in `el.json` and `ru.json` until another language is explicitly approved. After editing a locale, run `node service-locales/build-bundle.cjs` and commit the regenerated `service-locales/locales.js`. Do not change or remove `data-service-key` values; they are the stable translation contract.

## Update checklist

When a package, price, service, or project changes:

1. Update the English source page.
2. Update every locale currently approved for that page.
3. Regenerate the service locale bundle.
4. Update structured data when an offer or price changes.
5. Update this document and `CHANGELOG.md`.
6. Run `node --test tests/services-pages.test.cjs` and check every supported language and responsive layout. Include Hebrew RTL checks only on pages where Hebrew is published.
