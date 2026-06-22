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
| Backend   | Node.js, Express, TypeScript, Prisma, JWT, bcryptjs, Zod, Helmet, express-rate-limit |
| Database  | SQLite (default) → PostgreSQL (one-line switch) |
| Security  | Real DNS / WHOIS / TLS / port / HTTP-header analysis + weighted risk scoring |
| Reports   | pdfkit (PDF), JSON export |
| AI (next) | Python (FastAPI) microservice — ResNet/EfficientNet/CLIP (image), Xception/LSTM (video) |

---

## 🏃 Run locally

**Prerequisites:** Node.js 20+ (22 recommended).

### 1. Backend
```bash
cd backend
cp .env.example .env          # then edit JWT_SECRET
npm install
npx prisma generate
npx prisma db push            # creates the SQLite DB
npm run db:seed               # optional: creates admin@secure-web.app / Admin@12345
npm run dev                   # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000  (proxies /api → :4000)
```

Open **http://localhost:3000**, create an account, and scan a site (e.g. `https://github.com`).

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET    | `/api/health` | — | Health check |
| GET    | `/api/stats` | — | Public platform counters |
| POST   | `/api/auth/register` | — | Register (returns JWT) |
| POST   | `/api/auth/login` | — | Login (returns JWT) |
| GET    | `/api/auth/me` | ✅ | Current user |
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

## 🗄️ Database

Default is **SQLite** (zero config). To switch to **PostgreSQL**:

1. In `backend/prisma/schema.prisma`, set `datasource db { provider = "postgresql" }`.
2. Set `DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"` in `.env`.
3. `npx prisma db push`.

Tables: `User`, `Scan`, `ImageScan`, `VideoScan`, `Report`, `Subscription`, `AuditLog`.

---

## 🐳 Deployment

### Docker (full stack)
```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
# frontend → http://localhost:8080   backend → http://localhost:4000
```
Enable the bundled Postgres with `docker compose --profile postgres up` (and point the backend `DATABASE_URL` at `db`, switching the Prisma provider to `postgresql`).

### Render (API + managed Postgres)
Push to GitHub and create a **Blueprint** from `render.yaml`. It provisions the API and a free Postgres DB and wires `DATABASE_URL` automatically. Switch the Prisma provider to `postgresql` first. Set `CORS_ORIGIN` to your frontend URL.

### Vercel (frontend)
Import the `frontend/` directory. `vercel.json` handles the SPA fallback and proxies `/api/*` to your backend — update the destination URL to your deployed API.

---

## 🔐 Security features

JWT auth · bcrypt password hashing · Zod input validation · Helmet headers · CORS allow-list · global + per-route rate limiting · SSRF guard (blocks private/local scan targets) · Prisma parameterized queries (SQL-injection safe) · audit logging.

## 🗺️ Roadmap (next milestones)
- **AI microservice** (FastAPI + PyTorch): image AI/deepfake detection (ResNet/EfficientNet/CLIP), video deepfake detection (Xception/LSTM) with heatmap & timeline UI.
- OAuth (Google/GitHub) callbacks · email verification & password reset · admin dashboard · subscription billing · API keys.
