# Studio 17 company pages

This document is the content, design and maintenance contract for `/about`, `/our-story` and `/team`.

## Route responsibilities

- `/about` is the concise company overview. It establishes global trust, introduces the team, company, origin and presentation, then routes potential colleagues to Careers.
- `/our-story` publishes the approved seven-chapter Studio 17 narrative supplied by the company. It must not be shortened, expanded with invented claims or rewritten without content approval.
- `/team` introduces confirmed team members. It must not publish a surname, biography detail, portrait, LinkedIn profile or personal fact that Studio 17 has not approved.

All three routes use clean URLs, the shared header and footer, Lucide interface icons, consent-first analytics and the established media-hero geometry. The complete mobile menu remains limited to Services, Work, About, News and Careers.

## About page order

1. Media hero using `Images/About_heroimage.webp`.
2. `Trusted globally`: one animated partner-logo line, one short collaboration note and four approved static reviews.
3. Confirmed team members in the keyboard- and touch-usable carousel, with a link to `/team`.
4. `About Studio 17`: concise company identity, Limassol headquarters, Portugal operations hub and European brand proof.
5. `Our origin`: the approved three-paragraph summary and `Read the full Studio 17 Story` linking to `/our-story`.
6. `See Studio 17 in more detail`: the shared Greek presentation on Google Drive.
7. `Join Studio 17`: a focused careers CTA linking to the English `/careers` workflow.

The About page is company-focused. It must not include service directories, sales-package sections, generic lead-generation messaging or a closing sales CTA.

The Trustpilot proof is intentionally a plain-text link. While Studio 17 uses the free Trustpilot plan, do not hard-code a score, stars, TrustScore or Trustpilot artwork. A score can change and brand assets require the relevant Trustpilot entitlement.

## Team information contract

The approved public founder records currently are:

- Hugo Filipe — Founder & Director.
- Pedro Leonardo — Co-founder.

Approved Hugo Filipe profiles:

- LinkedIn: `https://www.linkedin.com/in/hugodm-filipe/`
- Instagram: `https://www.instagram.com/hugodmfilipe02/`

Approved Pedro Leonardo profile:

- LinkedIn: `https://www.linkedin.com/in/pedro-leonardo-375478330/`
- Instagram: intentionally not displayed at present.

The About founder cards display only these approved profiles as compact brand actions beside each person's name and role.

Initials are used as intentional temporary portraits because no approved individual photographs were available in the project. Replace them only with supplied, approved portraits. Longer biographies and personal facts remain pending source content; never infer them from search results or another person with a similar name.

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
