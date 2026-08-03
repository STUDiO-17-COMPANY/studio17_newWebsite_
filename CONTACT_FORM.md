# Studio 17 contact form

The public page is `/contact`. It is available in English, Portuguese (Portugal), Spanish, Greek, Russian and Hebrew. The selected language is included in each enquiry email.

## Delivery flow

1. The browser validates required fields and sends JSON to `POST /api/contact`.
2. The Vercel Function validates and limits every value, checks the request origin, applies a lightweight per-IP limit and silently absorbs honeypot submissions.
3. The function sends one HTML and plain-text email through the Resend HTTPS API.
4. The recipient is `contact@studio17.world`; the visitor's address is set as `reply_to`, so replying from the Studio 17 inbox addresses the visitor directly.
5. Resend receives an idempotency key so a retried request cannot create duplicate messages within its deduplication window.

The API key never reaches the browser. Form submissions are not written to the repository, browser storage or Google Drive.

## One-time Vercel setup

The code is complete, but real delivery requires the Resend integration and a verified sender domain.

1. Install Resend for the Vercel project `studio17-new-website` through Vercel Marketplace.
2. Verify `studio17.world` in Resend using the DNS records supplied by Resend.
3. Confirm the Vercel project has `RESEND_API_KEY` for Production and Preview.
4. Set `CONTACT_FROM_EMAIL` to `Studio 17 Website <contact@studio17.world>` or another address on the verified domain.
5. Keep `CONTACT_TO_EMAIL=contact@studio17.world`.
6. Redeploy after changing environment variables.

Until `RESEND_API_KEY` is present, the form displays its translated unavailable message and the page retains the direct `mailto:contact@studio17.world` fallback.

## Accepted fields

- Required: name, email, service, project details and contact consent.
- Optional: company, phone and indicative budget.
- Technical: page language, one-time submission ID, start time and an invisible honeypot.

No attachments or arbitrary recipients are accepted. The destination, sender contract, allowed services and allowed budgets are controlled server-side.

## Verification

Run these dependency-free checks from the project root:

```powershell
node tests/contact-api.test.cjs
node tests/contact-locales.test.cjs
node tests/clean-urls.test.cjs
```

After deployment:

1. Submit one test message from `/contact?lang=en` and confirm it arrives at `contact@studio17.world`.
2. Reply to it and confirm the response is addressed to the visitor's email.
3. Repeat from one non-English language and Hebrew to verify translated states and RTL layout.
4. Confirm an invalid form does not send and that the direct email fallback opens correctly.
5. Check Vercel Function logs for `Contact email failed` without recording visitor content.

## Maintenance rules

- Never place `RESEND_API_KEY` in HTML, JavaScript sent to the browser, documentation values or Git.
- Keep `contact@studio17.world` as the recipient unless Studio 17 explicitly changes the operational inbox.
- Update all six locale JSON files and regenerate `locales/locales.js` whenever contact copy changes.
- Keep a working direct-email fallback.
- Publish an approved privacy policy before treating the form as fully launched for public data collection.
