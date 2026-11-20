# Green Touch Engineering Private Limited — Corporate Website

Single-page corporate website for Green Touch Engineering Private Limited (Rewa, Madhya Pradesh).

**Frontend**: React 19 + Create React App 5.0.1 + CRACO 7.1.0 + Tailwind CSS 3.4.17
**Backend**: FastAPI 0.115.0 + Uvicorn 0.30.6 (stateless — no database, no email service)
**Package Manager**: Yarn 1.22.22 (lockfile committed)

---

## Project Overview

| Service | Responsibility |
|---------|----------------|
| **Frontend** | Single-page React application with anchor-based navigation (no client-side router). Renders Hero, About, Services, Solutions, Process, Capabilities, IndiaMART Reviews, Location & Contact, and Get In Touch sections. |
| **Backend** | Stateless FastAPI server exposing only `GET /api/reviews` — scrapes IndiaMART testimonial page with 1-hour in-memory cache and 30 req/min rate limit. Also serves the frontend production build (`frontend/build/`) when present. |

**Key architectural decisions:**
- No MongoDB, no email delivery, no enquiry persistence.
- Contact form validates on the client and redirects to the company's IndiaMART page for enquiry continuation.
- IndiaMART reviews are scraped at runtime with a fallback dataset matching `site.js`.

---

## Technology Stack

### Frontend (`frontend/`)
| Category | Packages (verified versions) |
|----------|------------------------------|
| Core | `react@19.0.0`, `react-dom@19.0.0`, `react-scripts@5.0.1` |
| Build | `@craco/craco@7.1.0`, `tailwindcss@3.4.17`, `autoprefixer@10.4.20`, `postcss@8.5.28` |
| UI & Animation | `framer-motion@11.18.0`, `lenis@1.3.27`, `@radix-ui/*` (accordion, alert-dialog, avatar, checkbox, collapsible, dialog, dropdown-menu, hover-card, label, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, tooltip), `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.2.0`, `tailwindcss-animate@1.0.7` |
| Forms & Validation | `react-hook-form@7.56.2`, `@hookform/resolvers@5.0.1`, `zod@3.24.4` |
| Data & State | `@tanstack/react-query@5.56.2`, `swr@2.3.8` |
| Maps | `leaflet@1.9.4`, `react-leaflet@5.0.0`, `@types/leaflet@1.9.22` |
| Utilities | `lucide-react@0.516.0`, `date-fns@4.1.0`, `dayjs@1.11.13`, `lodash@4.18.1`, `recharts@3.6.0`, `embla-carousel-react@8.6.0`, `cmdk@1.1.1`, `vaul@1.1.2`, `input-otp@1.4.2`, `react-resizable-panels@3.0.1`, `next-themes@0.4.6` |
| Routing | `react-router-dom@7.18.4` (installed but not used for client-side routing; anchor navigation only) |

### Backend (`backend/`)
| Package | Version |
|---------|---------|
| `fastapi` | 0.115.0 |
| `uvicorn` | 0.30.6 |
| `pydantic` | >=2.11 |
| `python-dotenv` | 1.0.1 |
| `httpx` | 0.27.2 |
| `beautifulsoup4` | 4.12.3 |
| `slowapi` | 0.1.9 |

---

## Repository Structure

```
GreenTouch-Upload/
├── frontend/
│   ├── public/
│   │   ├── index.html          # HTML template + JSON-LD LocalBusiness schema
│   │   ├── favicon.svg
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── images/             # Static images (referenced from site.js)
│   ├── src/
│   │   ├── data/
│   │   │   └── site.js         # SINGLE SOURCE OF TRUTH — all content, contact info, services, legal text
│   │   ├── components/
│   │   │   ├── Contact.jsx     # Location details + Enquiry form (redirects to IndiaMART)
│   │   │   ├── Map.jsx         # OpenStreetMap/Leaflet location map
│   │   │   ├── Reviews.jsx     # IndiaMART reviews display (fetches from /api/reviews)
│   │   │   └── ...             # Other section components (Hero, Services, Solutions, etc.)
│   │   ├── lib/utils.js        # cn() className helper
│   │   ├── App.jsx             # Page composition, anchor navigation
│   │   └── index.js            # Entry point
│   ├── package.json
│   ├── yarn.lock
│   ├── craco.config.js
│   └── tailwind.config.js
├── backend/
│   ├── server.py               # FastAPI app — only /api/reviews endpoint + static file serving
│   ├── requirements.txt
│   └── .env                    # Not committed (see Environment below)
├── .gitignore
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and Yarn 1.x (`corepack enable && corepack prepare yarn@1.22.22 --activate`)
- Python 3.11+

### 1. Clone the repository
```bash
git clone <repository-url>
cd GreenTouch-Upload
```

### 2. Frontend dependencies (using committed lockfile)
```bash
cd frontend
yarn install --frozen-lockfile
```

### 3. Backend virtual environment & dependencies
```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Run backend (port 8001)
```bash
# From backend/ with venv activated
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```
The backend runs on **http://localhost:8001**.

### 5. Run frontend (port 3000)
```bash
# From frontend/ in a separate terminal
yarn start
```
The frontend dev server runs on **http://localhost:3000** and proxies API requests to `http://localhost:8000` (see **Proxy Mismatch** below).

### 6. Production build (frontend)
```bash
# From frontend/
yarn build
```
Output: `frontend/build/` — this is what the backend serves in production.

---

### ⚠️ Proxy Mismatch (Known Issue)
`frontend/package.json` declares:
```json
"proxy": "http://localhost:8000"
```
But the backend actually runs on **port 8001**.

**During development**, API calls from the frontend (`/api/reviews`) will fail unless you either:
- Change the proxy to `http://localhost:8001` in `package.json` (requires restart), or
- Run the backend on port 8000 instead.

**In production**, this is irrelevant — the backend serves the built frontend and handles `/api/reviews` directly.

---

## Backend API

### Base URL
- Development: `http://localhost:8001`
- Production: same origin as frontend (served by FastAPI)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/` | Health check — returns `{"status": "ok"}` |
| `GET` | `/api/reviews` | IndiaMART reviews with caching |

### `GET /api/reviews`

**Response** (`ReviewsResponse` model):
```json
{
  "overall_rating": 4.9,
  "total_ratings": 17,
  "distribution": [{"stars": 5, "pct": 94}, ...],
  "metrics": [{"label": "User Satisfaction", "pct": 100}, ...],
  "reviews": [
    {
      "author": "Suman Thakur",
      "location": "Greater Noida, Uttar Pradesh",
      "date": "15 September 2025",
      "text": "good",
      "service": "Swimming Pool Construction",
      "has_written_review": true,
      "seller_response": null,
      "seller_response_date": null,
      "category_ratings": null
    }
    // ... up to 17 reviewers (only 1 with written review in current data)
  ],
  "cached": true,
  "fetched_at": "2026-11-20T08:00:00.000000+00:00"
}
```

**Behavior:**
- **Cache**: 1-hour in-memory TTL (`_CACHE_TTL_SECONDS = 3600`). On cache hit, returns `cached: true`.
- **Rate limit**: 30 requests/minute per IP (via `slowapi`).
- **Fallback**: If scraping fails and no stale cache exists, returns hardcoded fallback data matching `site.js` (rating 4.9, 17 ratings, same distribution/metrics, empty reviews array).
- **Scraping**: Fetches `https://www.indiamart.com/greentouch-engineering/testimonial.html`, parses `window.__COMPANY_DATA__` for aggregate rating, and extracts known reviewers from page text.

### CORS Configuration
```python
cors_origins = os.environ.get('CORS_ORIGINS', '*')
```
- Default: `*` (all origins allowed with credentials)
- Set `CORS_ORIGINS` to a comma-separated list (e.g., `https://example.com,https://www.example.com`) to restrict.

### Security Headers (applied to all responses)
| Header | Value |
|--------|-------|
| `Content-Security-Policy` | Restricts scripts/styles to self + Google Fonts; images from self + OSM tiles + IndiaMART; frames only from `wa.me`; form-action self |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disables accelerometer, camera, geolocation, gyroscope, magnetometer, microphone, payment, usb |

---

## Contact Form

**Location**: `frontend/src/components/Contact.jsx` → `EnquiryForm` component

**Behavior:**
1. Client-side validation (HTML5 + `react-hook-form` + `zod`):
   - All fields required: Full Name, Email, Phone, Service, Project Location, Message
   - Phone pattern: 7–20 digits with `+`, `-`, spaces, brackets
   - Message: 10–3000 characters
2. On valid submit:
   - Sets state to `"redirecting"`
   - Shows loading spinner with "Redirecting to IndiaMART…"
   - `window.location.href = INDIAMART_URL` (from `site.js`)
3. **No backend request is made**. No enquiry is stored. No email is sent.

**IndiaMART URL**: `https://www.indiamart.com/greentouch-engineering/` (defined in `site.js`)

---

## Current Business Information

All values sourced from `frontend/src/data/site.js` (single source of truth):

| Field | Value |
|-------|-------|
| **Company Name** | Green Touch Engineering Private Limited |
| **Short Name** | Green Touch Engineering |
| **Location** | G7RX+MWW Samdariya Gold, Aurrhat, Narendra Nagar, Hari Bhushan Nagar, Rewa, Madhya Pradesh 486001, India |
| **Phones** | +91 9473448022, +91 9631657314 |
| **Email** | `Greentouchengineeringpvt.ltd15@gmail.com` |
| **Business Hours** | Monday–Saturday: 9:00 AM – 6:00 PM; Sunday: Closed |
| **IndiaMART Profile** | https://www.indiamart.com/greentouch-engineering/ |
| **Google Maps Link** | `https://www.google.com/maps/search/?api=1&query=G7RX%2BMWW%20Samdariya%20Gold%20Aurrhat%20Narendra%20Nagar%20Hari%20Bhushan%20Nagar%20Rewa%20Madhya%20Pradesh%20486001%20India` |
| **OpenStreetMap Embed** | `https://www.openstreetmap.org/export/embed.html?bbox=81.2997694%2C24.5423515%2C81.2998694%2C24.5424515&layer=mapnik` |

**JSON-LD LocalBusiness Schema** (in `frontend/public/index.html`):
- Uses the same email and hours above
- `openingHoursSpecification`: Mon–Sat 09:00–18:00; Sunday 00:00–00:00 (closed)

---

## Content and Asset Editing

### Single Source of Truth: `frontend/src/data/site.js`
Edit this file — no component changes needed.

| Section | Export | What to Update |
|---------|--------|----------------|
| Company info | `COMPANY` | name, short, location, phones, email, hours, mapEmbed, mapLink |
| Social links | `SOCIALS` | Set `url` to activate; `null` = inactive icon |
| Navigation | `NAV`, `NAV_MORE` | Section IDs and labels |
| Hero facts | `HERO_FACTS` | Key-value pairs shown in Hero |
| Marquee | `MARQUEE` | Scrolling service keywords |
| Profile facts | `PROFILE_FACTS` | IndiaMART profile metadata |
| Services | `SERVICES` | 6 service cards (code, tag, title, image, desc) |
| Solutions | `SOLUTIONS`, `SOLUTION_FILTERS` | 18 solution items with categories |
| Process | `PROCESS` | 6 stages (title, desc) |
| Capabilities | `CAPABILITIES` | 6 capability groups with items |
| Ratings | `RATING` | Aggregate score, count, distribution, metrics |
| Reviews | `REVIEWS`, `RATED_FOR` | Individual written reviews + star-only categories |
| Enquiry services | `ENQUIRY_SERVICES` | Auto-derived from `SERVICES` + "Other" |
| Legal | `LEGAL` | Privacy, Terms, Disclaimer (body arrays) |

### Images & Logos
- **Static images**: `frontend/public/images/` — replace files keeping same names, or update paths in `site.js`
- **Logo component**: `frontend/src/components/Logo.jsx`
- **Favicon**: `frontend/public/favicon.svg`

### SEO Metadata
- **Meta, Open Graph, Twitter, JSON-LD**: `frontend/public/index.html` (template — uses `%REACT_APP_BACKEND_URL%` placeholder replaced at build time)
- **robots.txt**: `frontend/public/robots.txt` — update domain when custom domain attached
- **sitemap.xml**: `frontend/public/sitemap.xml` — update URLs when custom domain attached

---

## Existing VPS Deployment Handover

> **For the developer deploying to the company's existing VPS.**
> This section documents only verified build/runtime behavior. **All VPS-specific details (SSH access, server paths, web server config, domain mapping, SSL, process manager, production env vars) depend on the existing server setup and must be confirmed by you.**

### Build & Runtime Separation

| Artifact | Produced By | Consumed By |
|----------|-------------|-------------|
| `frontend/build/` | `yarn build` (CRA + CRACO) | FastAPI `StaticFiles` mount at `/` |
| Backend process | `uvicorn server:app` | Systemd/supervisor/docker (your choice) |

### Verified Production Behavior
1. Run `yarn build` in `frontend/` → generates `frontend/build/` (static assets + `index.html`).
2. Backend `server.py` checks for `../frontend/build` at startup. If present, mounts it at `/` with `html=True` (serves `index.html` for non-API routes).
3. API endpoint `/api/reviews` remains available.
4. **No environment variables are required** for the backend to run (`.env` is optional; `CORS_ORIGINS` defaults to `*`).
5. Backend binds to `0.0.0.0:8001` by default (configure via `uvicorn` args or reverse proxy).

### Deployment Checklist (Verify on Target VPS)
- [ ] Python 3.11+ available
- [ ] Node.js 18+ and Yarn 1.x available for build step
- [ ] `frontend/build/` generated and accessible to backend process
- [ ] Backend process managed (systemd, supervisor, docker, PM2, etc.)
- [ ] Reverse proxy (nginx/Caddy/Apache) configured to forward to backend port
- [ ] Domain DNS pointing to VPS
- [ ] SSL certificates configured (Let's Encrypt or existing)
- [ ] `CORS_ORIGINS` set to production domain(s) if not using `*`
- [ ] Security headers verified in browser devtools (CSP, X-Frame-Options, etc.)
- [ ] `/api/reviews` returns data (check rate limit: 30/min per IP)
- [ ] Contact form redirects to IndiaMART (no backend error)
- [ ] Map loads (OpenStreetMap tiles allowed by CSP)

### What Is NOT Configured (You Must Provide)
- SSH credentials / VPS access
- Server directory layout (`/var/www/`, `/opt/`, `/home/`, etc.)
- Web server (nginx/Caddy) config snippets
- systemd unit file or supervisor config
- Domain name and SSL provisioning method
- Backup/monitoring/logging setup

---

## Verification Checklist (Pre-Handoff)

Run these locally to confirm the codebase matches this documentation:

```bash
# 1. Frontend builds without errors
cd frontend && yarn build

# 2. Backend starts and serves /api/reviews
cd ../backend && source venv/bin/activate && uvicorn server:app --port 8001 &
sleep 3
curl -s http://localhost:8001/api/reviews | jq '.overall_rating, .total_ratings, .cached'

# 3. Business email and hours are current in source
grep -n "Greentouchengineeringpvt.ltd15@gmail.com" frontend/src/data/site.js frontend/public/index.html
grep -n "Monday – Saturday" frontend/src/data/site.js

# 4. No MongoDB, email, or enquiry storage code in backend
grep -r "mongo\|Mongo\|email\|enquir" backend/ --include="*.py" | grep -v "^Binary" || echo "None found (expected)"

# 5. Contact form redirects to IndiaMART (no POST to /api)
grep -n "INDIAMART_URL" frontend/src/components/Contact.jsx
```

Expected results:
- Build succeeds (output in `frontend/build/`)
- `/api/reviews` returns JSON with `overall_rating: 4.9`, `total_ratings: 17`
- Email `Greentouchengineeringpvt.ltd15@gmail.com` appears in both `site.js` and `index.html`
- Hours show "Monday – Saturday" / "9:00 AM – 6:00 PM"
- No MongoDB/email/enquiry code in backend
- Contact.jsx uses `window.location.href = INDIAMART_URL`

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `/api/reviews` returns 500 / empty reviews | IndiaMART site structure changed | Check `fetch_indiamart_reviews()` parsing logic; fallback data will be used |
| CSP errors in console (fonts, map tiles) | CSP too strict for new resource | Update `SecurityHeadersMiddleware` in `server.py` |
| Frontend dev proxy fails | Backend on 8001, proxy points to 8000 | Change proxy in `package.json` or run backend on 8000 |
| `yarn install` fails | Node version mismatch | Use Node 18+ (check `.nvmrc` if present) |
| `pip install` fails | Python version / system packages | Use Python 3.11+; ensure `build-essential` / `python3-dev` installed |
| Rate limit hit on `/api/reviews` | 30/min per IP exceeded | Wait or adjust `slowapi` limit in `server.py` |
| Map not loading | OSM tile domain not in CSP | `img-src` and `connect-src` already include `*.tile.openstreetmap.org` |

---

## Maintenance Notes

- **IndiaMART scraping** is brittle — page structure changes will break live fetching. Fallback data in `server.py` lines 263–283 mirrors `site.js` ratings.
- **Reviews cache** is in-memory — restarts lose cache. For production, consider Redis (replace `_reviews_cache` dict).
- **Yarn lockfile** is committed — always use `yarn install --frozen-lockfile`.
- **No database migrations** — backend is stateless.
- **No secrets in repo** — `.env` files gitignored.
- **Node.js 18+ required** for React 19 / CRA 5.
- **Python 3.11+ required** for FastAPI 0.115 / Pydantic 2.11+.

---

## License & Ownership

Proprietary — Green Touch Engineering Private Limited.
Internal handover documentation. Do not distribute externally.