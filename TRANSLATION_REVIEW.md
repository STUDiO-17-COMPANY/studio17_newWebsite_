# Studio 17 native-language review register

This document records human editorial review of published website translations. Automated checks can verify locale coverage, routes, layout, RTL behavior and missing keys; they cannot certify that wording is natural, culturally appropriate or legally precise.

## Approval rule

A locale is marked approved only after a fluent native speaker has reviewed the live page in context. Record the reviewer, review date, pages checked and any corrections made. Do not store private contact details or payment information here.

Reviewers should check:

- natural phrasing, grammar, spelling and punctuation;
- local terminology, tone and calls to action;
- service names, prices, currencies, timelines and factual claims against the English source;
- navigation, buttons, forms, validation messages, metadata and structured-data copy;
- text wrapping at desktop and mobile widths;
- right-to-left order, punctuation and mixed Latin/Hebrew content for Hebrew;
- legal copy separately with qualified Cyprus/EU counsel.

## Locale status

| Locale | Native-speaker status | Required reviewer | Notes |
| --- | --- | --- | --- |
| English (`en`) | Source language | Studio 17 editorial owner | Approved English remains the meaning and factual source. |
| Portuguese, Portugal (`pt-PT`) | Pending | Native European Portuguese speaker | Do not substitute Brazilian Portuguese terminology. |
| Spanish (`es`) | Pending | Native Spanish speaker for the intended European audience | Check agency and web-service terminology in context. |
| Greek (`el`) | Pending | Native Greek speaker in Cyprus | Check Cyprus-market terminology and local-search wording. |
| Russian (`ru`) | Pending | Native Russian speaker | Check commercial tone and avoid literal English syntax. |
| Hebrew (`he`) | Pending | Native Hebrew speaker | Review language and the complete RTL experience together. |

## Page review record

Use one row per locale and page family. A reviewer should write `Approved` only after checking the live URL.

| Locale | Page or family | Status | Reviewer | Date | Corrections or reference |
| --- | --- | --- | --- | --- | --- |
| pt-PT | Homepage and shared navigation/footer | Pending | — | — | — |
| pt-PT | Contact, FAQ and legal pages | Pending | — | — | — |
| pt-PT | About, Our Story and Team | Pending | — | — | — |
| pt-PT | Published service and SEO pages | Pending | — | — | — |
| es | Homepage and shared navigation/footer | Pending | — | — | — |
| es | Contact, FAQ and legal pages | Pending | — | — | — |
| es | About, Our Story and Team | Pending | — | — | — |
| es | Published service and SEO pages | Pending | — | — | — |
| el | Homepage and shared navigation/footer | Pending | — | — | — |
| el | Contact, FAQ and legal pages | Pending | — | — | — |
| el | About, Our Story and Team | Pending | — | — | — |
| el | Published service and SEO pages | Pending | — | — | — |
| ru | Homepage and shared navigation/footer | Pending | — | — | — |
| ru | Contact, FAQ and legal pages | Pending | — | — | — |
| ru | About, Our Story and Team | Pending | — | — | — |
| ru | Published service and SEO pages | Pending | — | — | — |
| he | Homepage and shared navigation/footer | Pending | — | — | — |
| he | Contact, FAQ and legal pages | Pending | — | — | — |
| he | About, Our Story and Team | Pending | — | — | — |
| he | Published service and SEO pages | Pending | — | — | — |

## Handoff procedure

1. Give the reviewer the live URL with the target language selected and the matching English source.
2. Ask the reviewer to return exact replacement wording, not only general comments.
3. Apply corrections in the canonical locale JSON or the relevant `service-locales` source.
4. Regenerate locale bundles when their sources change.
5. Run the locale, routing, mobile-layout and Hebrew RTL tests.
6. Recheck the deployed page, then record the reviewer and date above.
