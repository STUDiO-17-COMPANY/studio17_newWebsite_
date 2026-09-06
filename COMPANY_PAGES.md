# Studio 17 company pages

This document is the content, design and maintenance contract for `/about`, `/our-story` and `/team`.

## Route responsibilities

- `/about` is the concise company overview. It introduces the origin, operating presence, founders, culture and values, then routes readers to the deeper pages.
- `/our-story` publishes the approved seven-chapter Studio 17 narrative supplied by the company. It must not be shortened, expanded with invented claims or rewritten without content approval.
- `/team` introduces confirmed team members. It must not publish a surname, biography detail, portrait, LinkedIn profile or personal fact that Studio 17 has not approved.

All three routes use clean URLs, the shared header and footer, Lucide interface icons, consent-first analytics and the established media-hero geometry. The complete mobile menu remains limited to Services, Work, About, News and Careers.

## About page order

1. Media hero using `Images/About_heroimage.webp`.
2. Origin summary with `Read the full Studio 17 Story` linking to `/our-story`.
3. Connected-system approach and operating method.
4. European presence: headquarters in Limassol, Cyprus, and an operations hub in Portugal.
5. Founders carousel with a `/team` action.
6. Culture and values with an English-only `/careers` action.
7. Presentation, social profiles, contact prompt and shared closing CTA.

The Trustpilot proof is intentionally a plain-text link. While Studio 17 uses the free Trustpilot plan, do not hard-code a score, stars, TrustScore or Trustpilot artwork. A score can change and brand assets require the relevant Trustpilot entitlement.

## Team information contract

The approved public founder records currently are:

- Hugo Filipe — Founder & Director.
- Pedro — Co-founder.

Initials are used as intentional temporary portraits because no approved individual photographs were available in the project. Replace them only with supplied, approved portraits. Longer biographies, LinkedIn links and personal facts remain pending source content; never infer them from search results or another person with a similar name.

## Translation contract

- About and Team interface copy is maintained in all six canonical locales.
- The approved long-form story is published verbatim in English. Portuguese (Portugal) is translated in the canonical locale file.
- Spanish, Greek, Russian and Hebrew long-form editorial translations require a content/native-language review before they replace the English source. Until then, the i18n fallback preserves the approved English narrative instead of publishing an unreviewed legal or biographical claim.
- Page metadata, navigation, controls and shared content continue to localize in all six languages. Hebrew retains the shared RTL behavior.
- After any locale edit, regenerate `locales/locales.js` and run the company-page and locale regression tests.

## Update checklist

- Confirm every factual change with Studio 17.
- Keep the About summary aligned with the full story without duplicating the entire narrative.
- Add or remove team members in About and Team together.
- Update `/sitemap`, `/sitemap.xml`, metadata and documentation when routes change.
- Check desktop, 900px, 390px and 320px layouts, keyboard navigation, carousel controls, translated wrapping, reduced motion and RTL.
- Keep the Careers link on these pages forced to English until the Careers workflow changes.

