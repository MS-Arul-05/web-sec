# 🛡️ AI Security Intelligence Platform

A professional, SaaS-style cybersecurity platform that analyzes **websites** (and, on the roadmap, **images & videos**) using a real security engine and AI-powered risk scoring.

> **Status:** Full-stack **vertical slice** complete — real JWT auth + a real Website Security Scanner (DNS, WHOIS, SSL, ports, headers, risk scoring) + database + PDF/JSON reports, wired end-to-end with a dark cybersecurity UI. AI image/video detection is scaffolded (dedicated Python microservice planned next).

---

## 🧱 Architecture (monorepo)

```
secure-web-1-/
├── backend/                 # Node.js + Express + TypeScript API & security engine
│   ├── prisma/              # Prisma schema, seed, SQLite/Postgres
│   └── src/
│       ├── config/          # env loading
│       ├── db/              # Prisma client
│       ├── middleware/      # auth (JWT), validation (zod), rate-limit, errors
│       ├── engine/          # 🔬 security engine: dns, whois, ssl, ports, http, risk
│       ├── modules/         # feature modules: auth/, scans/
│       ├── reports/         # PDF generation (pdfkit)
│       └── utils/           # jwt, password, AppError, asyncHandler
├── frontend/                # React + Vite + TS + Tailwind + Framer Motion + Chart.js
│   └── src/
│       ├── components/      # AppLayout, AnimatedBackground, scanner/*, ui/*
│       ├── context/         # AuthContext (JWT)
│       ├── lib/             # axios api client, chart.js setup
│       └── pages/           # Landing, Login, Signup, Scanner, Dashboard, AI pages
├── docker-compose.yml       # backend + frontend (+ optional Postgres)
├── render.yaml              # Render blueprint (API + managed Postgres)
└── frontend/vercel.json     # Vercel config (static SPA + API proxy)
```

## 🚀 Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Chart.js, Axios, React Router |
| Backend   | Node.js, Express, TypeScript, Prisma, Zod, Helmet, express-rate-limit |
| Auth      | Supabase Auth (email/password + Google/GitHub OAuth); backend verifies JWTs via Supabase JWKS (`jose`) |
| Database  | Supabase PostgreSQL (via Prisma) |
| Security  | Real DNS / WHOIS / TLS / port / HTTP-header analysis + weighted risk scoring |
| Reports   | pdfkit (PDF), JSON export |
| AI (next) | Python (FastAPI) microservice — ResNet/EfficientNet/CLIP (image), Xception/LSTM (video) |

---

## 🏃 Run locally

**Prerequisites:** Node.js 20+ (22 recommended).

### 0. Supabase setup (one time)
1. In your Supabase project → **Project Settings → API**, copy the **Project URL** and **publishable key**.
2. **Project Settings → Database → Connection string (URI)** — copy the pooled connection string (port `6543`) and your DB password.
3. (Optional) **Authentication → Providers** — enable Google / GitHub for social login.

### 1. Backend
```bash
cd backend
cp .env.example .env          # fill SUPABASE_URL, SUPABASE_JWKS_URL, SUPABASE_SECRET_KEY, DATABASE_URL
npm install                   # runs prisma generate
npx prisma db push            # creates the app tables in Supabase Postgres
npm run dev                   # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env          # fill VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev                   # http://localhost:3000  (proxies /api → :4000)
```

Open **http://localhost:3000**, sign up (Supabase Auth), and scan a site (e.g. `https://github.com`).

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/health` | — | Health check |
| GET    | `/api/stats` | — | Public platform counters |
| GET/POST | `/api/auth/me` | ✅ | Sync + return the local profile for the Supabase user |
| POST   | `/api/scans` | ✅ | Run a website scan |
| GET    | `/api/scans` | ✅ | Scan history (summaries) |
| GET    | `/api/scans/:id` | ✅ | Full scan result |
| DELETE | `/api/scans/:id` | ✅ | Delete a scan |
| GET    | `/api/scans/:id/export/json` | ✅ | Download JSON report |
| GET    | `/api/scans/:id/export/pdf` | ✅ | Download PDF report |

## 📊 Risk Scoring (0–100, higher = safer)

Starts at a neutral **50** baseline, then:

| Component | Points |
|-----------|--------|
| Valid SSL certificate | **+20** |
| HTTPS supported | **+10** |
| Security headers (scaled) | up to **+20** |
| Established domain (> 1 yr) | **+20** |
| Exposed risky ports | **−20** |
| Newly registered domain | **−10** |
| Blacklisted (Safe Browsing) | **−30** |

Clamped to 0–100 → **Safe (80–100)** · **Moderate (50–79)** · **High Risk (0–49)**.

---

## 🔑 Auth (Supabase)

Registration and login happen **client-side** via `@supabase/supabase-js` (email/password + Google/GitHub OAuth). The frontend sends the Supabase access token as `Authorization: Bearer <token>`; the Express backend verifies it against the project **JWKS** (`jose`, asymmetric) — no shared secret needed. On the first authenticated request a local `User` row is created (`id` = Supabase `sub`) so scans/reports have a valid foreign key.

## 🗄️ Database (Supabase Postgres)

Prisma points at your Supabase Postgres via `DATABASE_URL`. Create the app tables with:
```bash
cd backend && npx prisma db push
```
Tables: `User`, `Scan`, `ImageScan`, `VideoScan`, `Report`, `Subscription`, `AuditLog`. (Supabase Auth manages its own `auth.users`; our `public.User` mirrors it by id.)

---

## 🐳 Deployment

All deploys need the Supabase env vars. **Never expose `SUPABASE_SECRET_KEY` to the frontend** — backend only.

### Docker (full stack)
```bash
export SUPABASE_URL=https://YOUR-PROJECT.supabase.co
export SUPABASE_JWKS_URL=$SUPABASE_URL/auth/v1/.well-known/jwks.json
export SUPABASE_SECRET_KEY=sb_secret_xxx
export SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
export DATABASE_URL="postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
docker compose up --build
# frontend → http://localhost:8080   backend → http://localhost:4000
```

### Render (API)
Create a **Blueprint** from `render.yaml`, then set `SUPABASE_URL`, `SUPABASE_JWKS_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, and `CORS_ORIGIN` in the dashboard.

### Vercel (frontend + backend via `experimentalServices`)
`vercel.json` deploys both services. Set env vars in the Vercel dashboard:
- **Backend:** `SUPABASE_URL`, `SUPABASE_JWKS_URL`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`
- **Frontend:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 🔐 Security features

Supabase Auth (managed sessions, hashed passwords, OAuth) · backend JWT verification via JWKS (`jose`) · Zod input validation · Helmet headers · CORS allow-list · global + per-route rate limiting · SSRF guard (blocks private/local scan targets) · Prisma parameterized queries (SQL-injection safe) · audit logging. Secret key stays server-side only.

## 🗺️ Roadmap (next milestones)
- **AI microservice** (FastAPI + PyTorch): image AI/deepfake detection (ResNet/EfficientNet/CLIP), video deepfake detection (Xception/LSTM) with heatmap & timeline UI.
- Supabase Row-Level Security policies · admin dashboard · subscription billing · API keys.
