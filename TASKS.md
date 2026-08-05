# Studio 17 website tasks

This file is the shared development task list for `studio17_newWebsite_`. Keep it updated whenever work is added, completed, blocked or deliberately postponed. Do not store passwords, API keys or private account data here.

## Status key

- `[ ]` Planned
- `[-]` In progress or partially complete
- `[x]` Completed and verified
- `BLOCKED:` Waiting for access, approval or external configuration

## Current priorities

- [x] Standardize Sitemap, WIP, Careers, career-role and Contact heroes on the homepage media-hero model.
- [ ] Complete and publish the contact-form email workflow.
- [ ] Create the approved Privacy Policy page before treating the contact form as production-ready.

## Contact form — postponed

The multilingual `/contact` page and its server-side `/api/contact` endpoint exist, but production delivery is not complete. Resume this checklist when the contact workflow becomes the active task.

- [ ] Confirm that the Vercel project is accessed with `contact@studio17.world` only.
- [ ] Connect Resend to the correct Studio 17 Vercel project.
- [ ] Verify `studio17.world` as a sending domain and complete the required DNS records.
- [ ] Configure `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` for Production, Preview and Development as appropriate.
- [ ] Confirm that the sender and recipient are both approved Studio 17 addresses.
- [ ] Deploy the contact page and serverless endpoint.
- [ ] Submit one test enquiry in each language: English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew.
- [ ] Confirm that every message reaches `contact@studio17.world` and that Reply answers the visitor's email address.
- [ ] Test required-field errors, invalid email, consent, rate limiting, provider failure and duplicate-submit prevention.
- [ ] Test keyboard use, screen-reader labels, mobile layouts, translated text wrapping and Hebrew RTL behavior.
- [ ] Add the approved Privacy Policy link beside the consent language.
- [ ] Review provider logs without exposing visitor messages or personal data in application logs.
- [ ] Update `CONTACT_FORM.md`, `README.md`, `CHANGELOG.md` and this task list after production verification.

BLOCKED: The Vercel/Resend account connection requires explicit authorization before Studio 17 credentials or hosted settings are changed.

## Page-development rule

When a task creates or publishes a page:

- [ ] Use a clean URL without `.html`.
- [ ] Reuse the shared header, `page-hero`, closing CTA where relevant and footer.
- [ ] Add all six public languages unless the page is an approved English-only exception.
- [ ] Use Lucide for interface icons.
- [ ] Update the human sitemap, XML sitemap, metadata and documentation.
- [ ] Verify desktop, mobile, keyboard, RTL, reduced motion and zero horizontal overflow.
- [ ] Replace the related WIP link only after the final page works.

