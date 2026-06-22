# secure-web — Website Audit

**Date:** 2026-06-22
**Scope:** Front-end React/TypeScript app (login → dashboard → scan report). The "scanner" backend is fully mocked in [services/scannerService.ts](services/scannerService.ts).
**Severity legend:** 🔴 High · 🟠 Medium · 🟡 Low / Polish

---

## ✅ Resolution status (updated 2026-06-22)

**Fixed in this pass:**
- **B1** — created [index.css](index.css) (base styles + theme variables); 404 gone.
- **B2** — created [public/vite.svg](public/vite.svg) (themed shield favicon); 404 gone.
- **B3** — report→dashboard redirect moved into a `useEffect` in [App.tsx](App.tsx#L40-L44).
- **B4 / S6** — removed the dead `GEMINI_API_KEY` `define` from [vite.config.ts](vite.config.ts) and corrected the README.
- **B5** — renamed `ScanForm.tsx` → [Login.tsx](components/Login.tsx) and `ResultsDashboard.tsx` → [Dashboard.tsx](components/Dashboard.tsx) (files now match exports).
- **B6** — removed the dead `RiskLevel.None` chart color.
- **A1** — primary buttons now `bg-sky-700 hover:bg-sky-500` (contrast ≥ AA).
- **A2** — CAPTCHA canvas now has an `aria-label` text alternative for screen readers.
- **A3** — user-menu button has `aria-label` + `aria-haspopup`/`aria-expanded`.
- **A4** — built a real **History page** ([HistoryPage.tsx](components/HistoryPage.tsx)) with localStorage persistence; "Home" and "History" menu items are now functional buttons.
- **A5** — search input now has an associated (visually-hidden) `<label>`.
- **S7** — export filenames are sanitized in [ReportGenerator.tsx](components/ReportGenerator.tsx).

**Intentionally not changed (need a backend or a larger refactor — out of scope for this mock app):**
- **S1 / S2** — real authentication & server-side CAPTCHA require a backend.
- **S3 / S4 / S5 / P1** — SRI hashes, CSP, and moving Tailwind off the runtime CDN are production-hardening tasks (would change the CDN-based setup; left for a prod build step).
- **P2** — lazy-loading jspdf; **P3** — automated test runner (test cases documented in [TEST_CASES.md](TEST_CASES.md)).

Verified: `npx tsc --noEmit` ✅, `npm run build` ✅, dev server HMR ✅.

---

## 1. Bugs & Correctness

| # | Sev | Finding | Location | Fix |
|---|-----|---------|----------|-----|
| B1 | 🟠 | `<link rel="stylesheet" href="/index.css">` references a file that **does not exist** → 404 on every page load. | [index.html:42](index.html#L42) | Remove the line, or create an `index.css`. |
| B2 | 🟡 | Favicon `href="/vite.svg"` **does not exist** → 404. | [index.html:5](index.html#L5) | Add `public/vite.svg` or remove the link. |
| B3 | 🟠 | `setState` is called **during render** in the `'report'` fallback (`handleBackToDashboard()` runs inside `renderContent`). This is a React anti-pattern and triggers warnings / possible double-render. | [App.tsx:62](App.tsx#L62) | Redirect inside a `useEffect`, not during render. |
| B4 | 🟡 | README instructs setting `GEMINI_API_KEY` in `.env.local`, and [vite.config.ts:14-15](vite.config.ts#L14-L15) injects it — but the key is **never used** anywhere (scan is mocked). Dead config + misleading docs. | README / vite.config | Remove, or wire up real AI scanning. |
| B5 | 🟡 | Component/file name mismatch: `LoginPage` lives in `ScanForm.tsx`, `DashboardPage` lives in `ResultsDashboard.tsx`. Confusing for maintenance. | components/ | Rename files to match exports. |
| B6 | 🟡 | `RiskLevel.None` has a chart color defined but is always filtered out (never assigned). Dead code. | [VulnerabilityChart.tsx:15](components/VulnerabilityChart.tsx#L15) | Remove or handle the None case. |

## 2. Security

| # | Sev | Finding | Detail |
|---|-----|---------|--------|
| S1 | 🔴 | **No real authentication.** Login accepts *any* name/email/password. There is no backend, session, or token. | [App.tsx:18](App.tsx#L18), [ScanForm.tsx:66](components/ScanForm.tsx#L66) |
| S2 | 🔴 | **CAPTCHA is client-side only** and the answer is held in plain React state (`captchaText`). Trivially bypassed by reading state / DOM. Provides no bot protection. | [ScanForm.tsx:22](components/ScanForm.tsx#L22) |
| S3 | 🟠 | **External scripts loaded without SRI (Subresource Integrity).** `cdn.tailwindcss.com`, `jspdf`, `jspdf-autotable`, and the `aistudiocdn.com` import map have no integrity hashes → supply-chain risk if a CDN is compromised. | [index.html:8-41](index.html#L8-L41) |
| S4 | 🟠 | **No Content-Security-Policy.** Combined with multiple third-party CDNs, increases XSS blast radius. | index.html |
| S5 | 🟠 | **Tailwind via runtime CDN** (`cdn.tailwindcss.com`) is explicitly *not for production* (perf + can't be locked down by CSP). | [index.html:8](index.html#L8) |
| S6 | 🟡 | `GEMINI_API_KEY` is `define`d into the client bundle. If ever used, the key would be **exposed in shipped JS**. Secrets must live server-side. | [vite.config.ts:14](vite.config.ts#L14) |
| S7 | 🟡 | `result.target` (scan hostname) is interpolated into the download filename unsanitized. Low risk (hostname only) but worth normalizing. | [ReportGenerator.tsx:25](components/ReportGenerator.tsx#L25) |

## 3. Accessibility (a11y)

| # | Sev | Finding | Fix |
|---|-----|---------|-----|
| A1 | 🟠 | **Contrast:** white text on the new primary blue-grey `#96C2DB` is ~1.7:1 — fails WCAG AA (needs ≥4.5:1). Affects the Login / Scan buttons at rest. | Use the darker `sky-700` `#4f7e99` as the button base, or dark text on the light button. See note below. |
| A2 | 🟠 | **CAPTCHA has no accessible alternative** (no audio option, canvas has no text equivalent). Blocks screen-reader and low-vision users from logging in. | Add an audio CAPTCHA or `aria` alternative. |
| A3 | 🟡 | Icon-only user-menu button has no `aria-label`. | Add `aria-label="User menu"`. | 
| A4 | 🟡 | Dropdown "Home" / "History" are `<a href="#">` placeholders that do nothing. | Wire up or remove. |
| A5 | 🟡 | Search input relies on a placeholder with no associated `<label>`. | Add a visually-hidden label. |

## 4. Performance / Production-readiness

- **P1** — Tailwind CDN compiles CSS in the browser on every load (slow first paint). Install Tailwind as a build dependency for production.
- **P2** — `jspdf` + `jspdf-autotable` load globally on every page even when no report is exported. Consider lazy-loading on click.
- **P3** — No tests, no linter/formatter config, no CI.

---

## Note on the new color theme
The Blue Lagoon palette (`#96C2DB` primary, `#E5EDF1` light, white) has been applied via the Tailwind config in [index.html](index.html#L13-L23), so all `sky-*` classes inherit it app-wide. The one caveat is **A1**: `#96C2DB` is a *light* tone, so white text on it is low-contrast. The hover state (`sky-700` `#4f7e99`) is acceptable. Recommended one-line fix: make primary buttons use `bg-sky-700 hover:bg-sky-500` (swap), or `text-slate-800` on the light button.

## Top 5 fixes (priority order)
1. **B1/B2** — remove the two dead `index.css` / `vite.svg` references (2 × 404). *(quick win)*
2. **B3** — move the report→dashboard redirect into a `useEffect`.
3. **A1** — fix button contrast for the new theme.
4. **S1/S2** — if this ships beyond a demo, add real auth + server-side CAPTCHA.
5. **S3/S5/P1** — pin SRI hashes and move Tailwind to a build step before production.
