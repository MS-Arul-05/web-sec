# secure-web — Test Cases

**App under test:** secure-web (login → dashboard → scan report)
**Environment:** `npm install` then `npm run dev` → http://localhost:3000
**Legend:** P = Priority (P1 critical … P3 minor)

---

## 1. Login / Authentication

| ID | Title | Pre-conditions | Steps | Expected Result | P |
|----|-------|----------------|-------|-----------------|----|
| TC-AUTH-01 | Login with valid fields + correct CAPTCHA | On Login page | 1. Enter Name, Email, Password. 2. Type the CAPTCHA text exactly. 3. Click **Login**. | User is logged in; Dashboard ("welcome to secure-web") is shown. | P1 |
| TC-AUTH-02 | CAPTCHA is case-insensitive | Login page | Enter valid fields; type CAPTCHA in the opposite case. | Login succeeds (comparison is case-insensitive). | P2 |
| TC-AUTH-03 | Wrong CAPTCHA blocks login | Login page | Enter valid fields; type an incorrect CAPTCHA; submit. | Error "Captcha does not match…"; a **new** CAPTCHA is drawn; CAPTCHA input is cleared; user stays on Login. | P1 |
| TC-AUTH-04 | Empty required fields blocked | Login page | Leave Name/Email/Password blank but correct CAPTCHA; submit. | Error "Please fill in all fields."; no login. | P1 |
| TC-AUTH-05 | Email format validation | Login page | Enter an invalid email (e.g. `abc`); fill rest; submit. | Browser `type="email"` validation prevents submit. | P2 |
| TC-AUTH-06 | Refresh CAPTCHA button | Login page | Click the refresh icon (and click the canvas). | A new CAPTCHA string is generated and rendered each time. | P3 |
| TC-AUTH-07 | (Known gap) Auth accepts any credentials | Login page | Enter arbitrary name/email/password + correct CAPTCHA. | Currently logs in (no real backend). Documents finding **S1** in AUDIT.md. | P1 |

## 2. Header / User Menu

| ID | Title | Steps | Expected Result | P |
|----|-------|-------|-----------------|----|
| TC-HDR-01 | Open user menu | Click the user icon (top-right). | Dropdown opens showing logged-in user's name + email. | P2 |
| TC-HDR-02 | Click-outside closes menu | Open menu, then click anywhere outside it. | Menu closes. | P2 |
| TC-HDR-03 | Logout | Open menu → **Logout**. | Returns to Login page; user/scan state cleared. | P1 |
| TC-HDR-04 | Placeholder links | Click "Home" / "History". | (Known gap **A4**) currently no-op `href="#"`. | P3 |

## 3. Dashboard / Scan Input

| ID | Title | Steps | Expected Result | P |
|----|-------|-------|-----------------|----|
| TC-DASH-01 | Stats render | Log in. | "User Count 1,287" and "Successfully User Count 1,250" cards display. | P3 |
| TC-DASH-02 | Empty URL scan blocked | Leave URL empty; click **Scan**. | Error "Please enter a URL to scan." shown; no navigation. | P1 |
| TC-DASH-03 | Invalid URL handled | Enter `not a url`; click Scan. | After the simulated delay, error "Invalid URL format…" is shown; stays on Dashboard. | P1 |
| TC-DASH-04 | Loading state | Enter a valid URL; click Scan. | Button shows "Scanning…", input + button disabled during the 2–4s scan. | P2 |
| TC-DASH-05 | Valid scan navigates to report | Enter `https://google.com`; Scan. | Report page opens with results for `google.com`. | P1 |

## 4. Scan Logic (mock service — see scannerService.ts)

| ID | Title | Input | Expected Result | P |
|----|-------|-------|-----------------|----|
| TC-SCAN-01 | Low-risk profile | URL containing `google` / `facebook` / `github`. | Score 80–99, Risk **Low**, confidence 90–100%, OS "Google Cloud Platform". | P2 |
| TC-SCAN-02 | Medium-risk profile | URL containing `demo` / `test`. | Score 40–69, Risk **Medium**, OS "Linux 5.4 (Ubuntu)". | P2 |
| TC-SCAN-03 | High/Critical profile | Any other valid URL. | Score 0–39, Risk **Critical**, OS "Windows Server 2012 R2". | P2 |
| TC-SCAN-04 | Risk level escalates to highest vuln | Any scan. | `riskLevel` equals the most severe vulnerability severity present. | P2 |
| TC-SCAN-05 | Ports unique & sorted | Any scan. | 2–5 open ports, no duplicate port numbers, ascending order. | P3 |

## 5. Report Page

| ID | Title | Steps | Expected Result | P |
|----|-------|-------|-----------------|----|
| TC-RPT-01 | Summary cards | Open a report. | Overall Score, Risk Level, AI Confidence (%), Detected OS shown; risk colored by severity. | P1 |
| TC-RPT-02 | Vulnerability chart | Report with vulns. | Bar chart "Vulnerabilities by Severity" renders; hover shows tooltip. | P2 |
| TC-RPT-03 | Empty chart state | Report with 0 vulns (rare). | "No vulnerability data to display." message instead of chart. | P3 |
| TC-RPT-04 | Vulnerability details list | Report with vulns. | Each vuln shows name, severity badge, CVE (if any), description. | P2 |
| TC-RPT-05 | Port table | Open report. | Table lists Port/Protocol/State/Service/Version; rows highlight on hover. | P2 |
| TC-RPT-06 | Back to dashboard | Click "← Back to Dashboard". | Returns to Dashboard; scan result cleared. | P1 |

## 6. Report Export

| ID | Title | Steps | Expected Result | P |
|----|-------|-------|-----------------|----|
| TC-EXP-01 | Download JSON | On report, click **JSON**. | A file `secure-web-Report-<target>.json` downloads with the full result object. | P2 |
| TC-EXP-02 | Download PDF | Click **PDF**. | A PDF with header, summary table, open-ports table, and vulnerabilities table downloads. | P2 |
| TC-EXP-03 | PDF pagination | Scan a target with many ports/vulns. | Tables that overflow push content to a new page (no clipping). | P3 |

## 7. Theme / Visual (Blue Lagoon palette)

| ID | Title | Steps | Expected Result | P |
|----|-------|-------|-----------------|----|
| TC-UI-01 | Primary palette applied | Load any page. | Backgrounds use light blue-grey `#E5EDF1`; accents/buttons use `#96C2DB`; surfaces white. | P2 |
| TC-UI-02 | Hover states | Hover buttons / table rows. | Hover uses deeper blue-grey `#4f7e99` / `sky-50` wash. | P3 |
| TC-UI-03 | PDF/CAPTCHA color consistency | Export PDF; view CAPTCHA. | PDF headers and CAPTCHA text use the blue-grey palette, not the old sky blue. | P3 |
| TC-UI-04 | Button contrast (regression) | Inspect Login/Scan buttons. | **Known issue A1:** white-on-`#96C2DB` is low contrast — verify the chosen contrast fix once applied. | P2 |

## 8. Responsive / Cross-browser

| ID | Title | Steps | Expected Result | P |
|----|-------|-------|-----------------|----|
| TC-RES-01 | Mobile layout | Open at 375px width. | Stat cards / summary grid stack to single column; header stays usable. | P2 |
| TC-RES-02 | Desktop layout | Open at ≥1024px. | Summary cards in 4-col grid; chart + details side-by-side. | P3 |
| TC-RES-03 | Browser matrix | Chrome, Firefox, Edge. | No layout breakage; PDF/JSON export works. | P3 |

## 9. Negative / Edge

| ID | Title | Steps | Expected Result | P |
|----|-------|-------|-----------------|----|
| TC-EDGE-01 | URL without scheme | Enter `google.com` (no `https://`). | `new URL()` throws → "Invalid URL format…" error. | P2 |
| TC-EDGE-02 | Rapid double Scan | Click Scan twice quickly. | Input disabled during scan prevents a second concurrent run. | P3 |
| TC-EDGE-03 | Direct report with no result | Force `view='report'` with null result. | Falls back to Dashboard (see bug **B3** — should be effect-based). | P3 |

---

### Suggested automated coverage
The pure logic in [services/scannerService.ts](services/scannerService.ts) (`runScan`, port uniqueness/sort, risk-profile mapping) is the highest-value target for **unit tests** (e.g. Vitest). The login/scan/report flows suit **component/E2E tests** (React Testing Library or Playwright). No test runner is currently configured — I can scaffold Vitest + a first passing suite on request.
