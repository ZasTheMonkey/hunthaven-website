# LeaseWild real-browser QA — sandbox only

The staging branch contains a Playwright suite for two independent tester roles (Hunter and Host/Admin) plus a payments matrix job. **Hourly execution is not verified or guaranteed**: GitHub schedules only run from the default branch, and this workflow is staging-only and uses workflow dispatch. Require a real GitHub Actions run URL and job artifacts before reporting that tests executed. Each uses real Chromium and mobile WebKit browser engines. They navigate actual pages, click controls, and fill forms when synthetic credentials are supplied. Hunter and Host/Admin jobs capture screenshots, videos and traces. The suite cannot access production; its base URL is validated to the Cloudflare sandbox.

## Important: scope and evidence
- **REAL BROWSER PASS:** only a completed assertion against an actual browser UI.
- **BLOCKED/SKIPPED:** missing dedicated synthetic account credentials or test checkout fixture. Never treat skipped tests as passing.
- See the payment handoff below for the implemented assertions and outstanding checks.
- Only the payments project creates bookings and performs Stripe TEST card authorizations, captures and refunds, after synthetic fixture and Stripe account checks. No real IDs, real users, production API keys, or live Stripe.

## Setup
1. GitHub repository Settings → Actions → General: enable Actions and permit standard actions.
2. **Critical GitHub scheduling caveat:** GitHub scheduled workflows run from the repository's **default branch**, not from a nondefault staging branch. This workflow is deliberately staging-only and will not automatically trigger from GitHub's schedule until an authorized scheduling mechanism dispatches it on staging. **Do not merge to main** to enable it. Where Actions exposes this workflow for dispatch, select staging/leasewild-full-clone. To enable hourly execution without merging, use a separate authorized external scheduler with GitHub workflow_dispatch API, scoped to this staging branch. Do not assume hourly runs are active until a real run appears.
3. Optional repository Actions secrets for disposable SANDBOX-ONLY accounts: `QA_HUNTER_EMAIL`, `QA_HUNTER_PASSWORD`, `QA_LANDOWNER_EMAIL`, `QA_LANDOWNER_PASSWORD`, `QA_OUTFITTER_EMAIL`, `QA_OUTFITTER_PASSWORD`, `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD`. Use dedicated disposable accounts, never a real owner's login. Keep secrets in GitHub, not code or chat.
4. Each run has 5 jobs: Hunter and Host/Admin × desktop Chromium/mobile WebKit, plus payments Chromium. Download artifacts for HTML and JUnit/JSON reports, and for screenshots, videos and traces from the Hunter and Host/Admin jobs.
5. Local run: `cd qa/playwright && npm install && npx playwright install --with-deps chromium webkit && npx playwright test`.

**Security:** screenshots and video may include account data. Only use synthetic fixtures. Restrict access to GitHub Actions artifacts and delete when no longer needed. No production modifications are permitted.

**Next milestone:** add a sandbox-only synthetic fixture service, isolated test inboxes, real Stripe TEST checkout and webhook reconciliation, admin review, and automated cleanup; then promote these from BLOCKED/NOT IMPLEMENTED to real E2E assertions.

## Stripe TEST card browser scenarios

Run the existing Codespaces entry point with `bash qa/playwright/run-staging-qa.sh --project=payments-chromium`. The runner requests a fresh sandbox booking per case and uses Chromium to enter the official Stripe TEST cards. The retry intentionally reuses its own open session after a decline. GitHub Actions and Codespaces use the same suite. See [the payment QA handoff](../../docs/launch-sprint/payment-browser-qa.md) for setup and evidence. Payment traces, videos and screenshots are disabled to avoid recording populated fields or checkout links.
