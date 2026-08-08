# AharSetu k6 Load Testing Suite ⚡🌾

This directory contains the production-grade **k6 Load Testing Suite** for the **AharSetu Smart Food Redistribution Platform**. All load tests are built strictly from the application's actual source code endpoints without relying on external websites or invented routes.

---

## 📂 Directory Structure

```
load-testing/
├── tests/
│   ├── homepage-load.js          # Public page & static asset load test (k6 script)
│   ├── authentication-load.js    # User registration, login, token lookup load test (k6 script)
│   ├── donation-load.js          # Food posting, feed querying, claim load test (k6 script)
│   ├── dashboard-load.js         # Role dashboard APIs (Donor, NGO, Volunteer) load test (k6 script)
│   └── complete-load-test.js     # Master multi-stage k6 load test (5 to 50 VUs)
├── reports/                     # Report output directory (HTML & JSON artifacts)
│   ├── load-test-summary.json
│   └── load-test-report.html
├── run-load-test.js             # Local & CI/CD runner enforcing thresholds & exit codes
└── README.md                    # Setup, execution, threshold & CI/CD documentation
```

---

## 🧪 What Each Test Does

| Test Script | Tested Endpoints & Operations | Load Ramping Profile |
|---|---|---|
| **`homepage-load.js`** | `GET /`, `GET /api/health`, `GET /api/donations/impact-stats`, `GET /api/donations/verified-ngos` | 5 ➔ 20 ➔ 50 VUs over 70s |
| **`authentication-load.js`** | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/set-role` | 5 ➔ 20 ➔ 40 VUs over 70s |
| **`donation-load.js`** | `POST /api/donations`, `GET /api/donations`, `PUT /api/donations/:id/accept`, `PUT /api/donations/:id/status` | 5 ➔ 20 ➔ 40 VUs over 70s |
| **`dashboard-load.js`** | `GET /api/donations/my` (Donor), `GET /api/donations/ngo-claims` (NGO), `GET /api/donations/volunteer-tasks` (Volunteer) | 5 ➔ 20 ➔ 40 VUs over 70s |
| **`complete-load-test.js`** | Master end-to-end load flow combining all public, auth, donation, and dashboard workflows | 5 ➔ 20 ➔ 50 VUs over 70s |

---

## 🎯 PASS / FAIL Threshold Benchmark Criteria

Each load test is evaluated against strict performance benchmarks:

1. **HTTP Error Rate (`http_req_failed`)**: Must be **`< 1.0%`**.
2. **95th Percentile Response Time (`p(95)`)**: Must be **`< 500ms`** for API requests, **`< 800ms`** for HTML static assets.
3. **Average Response Time**: Must be **`< 200ms`**.

If **ANY** threshold fails:
- The runner outputs a explicit failure log detailing which benchmark failed.
- The command exits with a **non-zero exit code (`exit 1`)**, causing GitHub Actions pipelines to register the step as **FAILED**.

---

## 🛡️ Non-Destructive Guarantee

- All test user registrations generate dynamic timestamps (`load_user_<timestamp>@aharsetu-test.org`) to prevent database duplicate conflicts.
- Workloads focus on read-heavy operations and controlled, lightweight food posts.
- No destructive data deletion or database wipe routines are executed.

---

## 🛠️ Required Installation & Prerequisites

1. Ensure the AharSetu server is running locally or in CI:
   ```bash
   npm run dev
   ```
2. (Optional) Install [k6 CLI](https://k6.io/docs/get-started/installation/) if native k6 CLI execution is desired:
   ```bash
   # Windows (winget or choco)
   winget install k6 --source winget
   # macOS
   brew install k6
   # Linux
   sudo apt-get install k6
   ```

---

## 🚀 How to Run the Load Tests

### 1. Run the Complete Load Test Suite (CLI / Node Runner)

```bash
npm run test:load
```
*This executes the complete load runner, audits performance thresholds, outputs HTML/JSON report files to `load-testing/reports/`, and sets the proper exit code (`0` for PASS, `1` for FAIL).*

### 2. Run with Native k6 CLI (Optional)

```bash
npm run test:k6
```
or run individual scripts directly:
```bash
k6 run load-testing/tests/homepage-load.js
k6 run load-testing/tests/authentication-load.js
k6 run load-testing/tests/donation-load.js
k6 run load-testing/tests/dashboard-load.js
k6 run load-testing/tests/complete-load-test.js
```

---

## 📊 Reports & GitHub Actions CI/CD Integration

Execution automatically generates two persistent report artifacts in `load-testing/reports/`:

1. **`load-test-summary.json`**: Structured JSON report with requests per second (RPS), error rates, p95 latencies, min/max response times, and threshold statuses.
2. **`load-test-report.html`**: Standalone HTML dashboard report with color-coded status badges and summary tables.

### GitHub Actions Workflow Example (`.github/workflows/main.yml`)

```yaml
- name: Run AharSetu k6 Load Testing Suite
  run: npm run test:load
  env:
    BASE_URL: http://localhost:3000

- name: Upload Load Test Reports Artifact
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: k6-load-test-reports
    path: load-testing/reports/
```
