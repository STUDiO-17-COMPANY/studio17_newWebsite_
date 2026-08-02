# Careers automation

The Careers page is a static HTML/CSS/JavaScript page backed by two Vercel Functions. Those functions read approved Google Docs from the private `3. HR > 3. Website Open Role` folder. Google credentials never reach the browser.

## Current Google Drive resources

- HR folder: `1I0xOt-k606DMmY_yKQnykwXvNcckmmjh`
- Open-role folder: `1jbuO2nBYoGwnFP7HLZFTERt_IUmclxGc`
- Master template: `HR - Open Role Template`
- HR operating guide: `guidance for role position automatic`
- Vercel project: `studio17-new-website` (`prj_sF3bvKJJvFaMoPohTwPtcf56IsAJ`)

The master template and the operating guide live in `3. HR`. Completed copies—and only completed copies—belong directly inside `3. Website Open Role`.

## Runtime architecture

```text
Google Drive folder
  -> Vercel Function with read-only service account
    -> validates and parses Google Docs
      -> /api/careers for listing cards
      -> /api/career-role?id=<document-id> for one detail page
        -> careers.html and career-role.html
```

The list and detail responses use a 30-second CDN cache plus a 30-second stale-while-revalidate window. A valid role normally appears or disappears within approximately one minute.

## One-time Google Cloud setup

1. Create or select a Google Cloud project owned by Studio 17.
2. Enable the Google Drive API and Google Docs API.
3. Create a dedicated service account for this integration. It needs no project IAM role because access is granted at the Drive folder level.
4. Create a JSON key for the service account and store it in the approved password/secret manager.
5. Share only `3. Website Open Role` with the service-account email as Viewer.
6. Do not share the entire HR folder and do not make either folder public.

The source folder was not shared with a service account when this implementation was created, so these steps are required before the live API can return roles.

## One-time Vercel setup

Add the following values in the connected Vercel project's Environment Variables. Apply them to Production and Preview.

```text
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_DRIVE_OPEN_ROLES_FOLDER_ID=1jbuO2nBYoGwnFP7HLZFTERt_IUmclxGc
```

For `GOOGLE_PRIVATE_KEY`, paste the complete PEM key. Vercel may store it with real line breaks or escaped `\n` characters; the function supports both.

Alternatively, set one base64-encoded full credential object:

```text
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
```

If that value is present, it takes priority over the separate email and private-key values. The folder ID can still be supplied separately. Never add the JSON key, private key or a real `.env` file to Git.

After saving the variables, redeploy the project once. The source code itself does not need a build command.

## Publishing contract

The Google Doc filename is the public role title. A document is published only when all of the following are true:

- it is a native Google Doc;
- it is a direct child of `3. Website Open Role`;
- it is not in Drive trash;
- all required template fields are complete;
- the application URL is a valid `https://` URL.

Required headings:

- Department
- Location
- Work model
- Employment type
- Application URL
- Short summary
- About the role
- What you will do
- What we are looking for

Optional headings:

- Experience level
- Application deadline
- Nice to have
- What we offer
- Hiring process
- Equal opportunity

Do not rename or duplicate headings. Square-bracket placeholder paragraphs are ignored and therefore do not satisfy required validation. An incomplete role is withheld and logged by the server instead of producing a broken public page.

## English-only behavior

`careers.html` and `career-role.html` set `data-force-language="en"`. Careers links from every locale carry `lang=en`, and the i18n layer prevents a Careers page from switching away from English without overwriting the visitor's saved preference for the rest of the website.

## Security decisions

- Service-account secrets are read only from server-side Vercel environment variables.
- The browser receives normalized public role content, never Google credentials or private Drive URLs.
- A detail request verifies that the document still belongs directly to the approved folder before returning content.
- Only native Google Docs are read.
- Only `https://` application links are accepted.
- Dynamic copy is inserted with DOM text nodes, not `innerHTML`.
- Error responses do not expose Google API details, service-account identity or keys.

## Verification after configuration

1. Deploy with the three environment variables configured.
2. Open `/api/careers`; with an empty folder it must return `{"roles":[]}` with HTTP 200.
3. Copy the master template, complete every required field, rename the file to a test role title and move it into the open-role folder.
4. Wait up to one minute and confirm the card appears on `/careers.html?lang=en`.
5. Open the card, confirm every section and role fact, and test the application URL.
6. Move the test document out of the folder.
7. Wait up to one minute and confirm both the card and direct role URL are no longer public.
8. Remove the test document if it is no longer needed.

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| API returns `CAREERS_NOT_CONFIGURED` | Missing or invalid Vercel environment variables | Recheck the service-account email/key and redeploy |
| API returns `GOOGLE_AUTH_FAILED` | Bad key, disabled account or clock/auth issue | Rotate the key, update Vercel and redeploy |
| API returns `GOOGLE_API_FAILED` | APIs disabled, folder not shared or Google unavailable | Enable Drive/Docs APIs and verify Viewer access |
| Role is missing but API works | Incomplete template, wrong file type or wrong folder | Validate all required fields and direct folder parent |
| Role detail returns 404 | Role was removed, incomplete or the URL is invalid | Return to Careers and inspect the source document |

## Key rotation

Create a new service-account key, update Vercel, deploy, confirm `/api/careers`, and only then revoke the old key. Never leave unused keys active.
