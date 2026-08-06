# Automation Framework

Local execution:

1. Install dependencies

```bash
cd automation
npm ci
```

2. Run tests

```bash
npm run ci:e2e
```

Environment:

- Set `BASE_URL` environment variable to the live GitHub Pages URL.

CI notes:

- The repository workflow `.github/workflows/deploy-and-test.yml` builds the site, deploys to the `gh-pages` branch, verifies availability, then runs the automation in `automation/`.
- The automation produces artifacts under `automation/reports/` including Excel and HTML reports, screenshots, logs, JSON results, and `summary.md`.

Troubleshooting:

- If Chrome cannot start in CI, ensure the `chromedriver` version matches the Chromium in the runner or switch to using `selenium/standalone-chrome` in the workflow.
- If tests fail consistently due to timing, increase `mocha` timeouts or add more explicit waits in page objects.
