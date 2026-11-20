# Green Touch Engineering Private Limited — Corporate Website

Single-page corporate website: React (CRA + craco, Tailwind, framer-motion, Lenis) with a FastAPI + MongoDB backend for the enquiry form.

## Run locally

```bash
# backend
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001

# frontend
cd frontend
yarn install
yarn start          # development
yarn build          # production build in frontend/build
```

## Environment

`backend/.env`

| Key | Purpose |
| --- | --- |
| `MONGO_URL`, `DB_NAME` | MongoDB connection |
| `CORS_ORIGINS` | Allowed origins |
| `EMERGENT_EMAIL_KEY` | Managed email key (platform-provisioned) |
| `EMAIL_FROM_NAME` | Sender display name |
| `OWNER_EMAIL` | Inbox that receives website enquiries |

`frontend/.env`: `REACT_APP_BACKEND_URL` (also used for the canonical and Open Graph URLs).

## Editing content

All copy, services, solutions, process stages, ratings, contact details and social links live in
`frontend/src/data/site.js`.

- **Social links**: set `url` in `SOCIALS`. Entries with `url: null` render as inactive icons.
- **Photos**: replace files in `frontend/public/images/` (keep the file names) or change the paths in `site.js`.
- **Logo**: `frontend/src/components/Logo.jsx` and `frontend/public/favicon.svg`.
- **Legal text**: `LEGAL` in `site.js` (currently drafts pending company approval).

## Enquiry form

`POST /api/enquiries` validates the submission, stores it in the `enquiries` collection and emails it to
`OWNER_EMAIL`. If the email cannot be sent the enquiry is still stored (`email_status: "failed"`).
Limits: 5 enquiries per IP address per 10 minutes.

## SEO

Meta, Open Graph and LocalBusiness JSON-LD are in `frontend/public/index.html`.
`robots.txt` and `sitemap.xml` in `frontend/public/` contain the site URL: update both when a custom domain is attached.