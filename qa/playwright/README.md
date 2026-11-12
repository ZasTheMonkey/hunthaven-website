# LeaseWild real-browser QA — sandbox only

Two independent Playwright testers run every hour on GitHub Actions on branch `staging/leasewild-full-clone`: Hunter and Host/Admin. Each uses real Chromium and mobile WebKit browser engines. They navigate actual pages, click controls, fill login forms when test credentials are supplied, take screenshots, and capture full videos/traces. The suite cannot access production; its base URL is validated to the Cloudflare sandbox.

## Important: scope and evidence
- **REAL BROWSER PASS:** only a completed assertion against an actual browser UI.
- **BLOCKED/SKIPPED:** missing dedicated synthetic account credentials or test checkout fixture. Never treat skipped tests as passing.
- **NOT YET IMPLEMENTED:** full Stripe test-card completion, email inbox verification, account creation, listing submission, guest ID upload, refunds/payouts, and reservation approval/cancellation are *not* implemented by this first version. Do not claim they passed.
- Browser runs are read-only by default except login attempts, UI filtering, and negative invalid-token checks. No real IDs, real users, production API keys, or live Stripe.

## Setup
1. GitHub repository Settings → Actions → General: enable Actions and permit standard actions.
2. **Critical GitHub scheduling caveat:** GitHub scheduled workflows run from the repository's **default branch**, not from a nondefault staging branch. This workflow is deliberately staging-only and will not automatically trigger from GitHub's schedule until an authorized scheduling mechanism dispatches it on staging. **Do not merge to main** to enable it. Use Actions → LeaseWild real-browser QA → Run workflow → choose staging/leasewild-full-clone for manual runs. To enable hourly execution without merging, use a separate authorized external scheduler with GitHub workflow_dispatch API, scoped to this staging branch. Do not assume hourly runs are active until a real run appears.
3. Optional repository Actions secrets for disposable SANDBOX-ONLY accounts: `QA_HUNTER_EMAIL`, `QA_HUNTER_PASSWORD`, `QA_LANDOWNER_EMAIL`, `QA_LANDOWNER_PASSWORD`, `QA_OUTFITTER_EMAIL`, `QA_OUTFITTER_PASSWORD`, `QA_ADMIN_EMAIL`, `QA_ADMIN_PASSWORD`. Use dedicated disposable accounts, never a real owner's login. Keep secrets in GitHub, not code or chat.
4. Each run has 4 jobs: two roles × desktop Chromium/mobile WebKit. Download the artifacts for screenshots, videos, traces, HTML and JUnit/JSON reports.
5. Local run: `cd qa/playwright && npm install && npx playwright install --with-deps chromium webkit && npx playwright test`.

**Security:** screenshots and video may include account data. Only use synthetic fixtures. Restrict access to GitHub Actions artifacts and delete when no longer needed. No production modifications are permitted.

**Next milestone:** add a sandbox-only synthetic fixture service, isolated test inboxes, real Stripe TEST checkout and webhook reconciliation, admin review, and automated cleanup; then promote these from BLOCKED/NOT IMPLEMENTED to real E2E assertions.
