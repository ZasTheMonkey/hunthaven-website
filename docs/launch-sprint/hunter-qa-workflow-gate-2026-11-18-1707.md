# Hunter QA workflow gate — 2026-11-18 17:07 ET

Scope: **staging/leasewild-full-clone** and **leasewild-sandbox.pages.dev** only. This is an API/static audit, not a new E2E browser execution.

## Independently checked

- GitHub staging branch exists.
- Fetched the current staging `.github/workflows/leasewild-real-browser-qa.yml`. It declares **workflow_dispatch** and a **push** trigger limited to workflow/test/config/package paths. **No cron schedule is declared in this current file.** Therefore an hourly Hunter QA automation run does not itself establish that the browser workflow ran, and documentation-only commits do not trigger it.
- The current workflow has six serial matrix jobs: hunter Chromium/mobile WebKit, host Chromium/mobile WebKit, and payments Chromium/mobile WebKit. It uses `QA_BASE_URL=https://leasewild-sandbox.pages.dev` and separates payment tests from hunter navigation tests.
- Independently fetched the jobs for [run 44340521035](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/44340521035): all six jobs concluded success. This is **historic CI evidence**, not a new payment or browser test this run. Per-job success is not proof of an authenticated full hunter reservation lifecycle.
- Read the staging Stripe launch gate and Hunter QA report. The launch gate has chronological updates; the initial zero-linked-outfitter count is superseded by later sandbox evidence. Do not present that initial count as current.

## Status this run

| Scope | Classification | Evidence/limitation |
| --- | --- | --- |
| Staging branch, workflow, launch gate | API-ONLY PASS | GitHub branch-specific reads |
| Prior six-job regression | API-ONLY PASS (historical) | Run 44340521035 jobs |
| New deployed real-browser navigation | NOT TESTED | No browser-driven session executed this run |
| New Stripe TEST card checkout, 3DS, decline, refund | NOT TESTED | No test payment initiated this run |
| Booking, messaging, cancellation, review, privacy | NOT TESTED | No authenticated synthetic lifecycle executed this run |
| Cloudflare deployment SHA parity | NOT VERIFIED | No deployment read performed |
| Fixes, commits, migrations, deployments | 0 | This report is documentation only; no application changes |

## Concrete execution gap and next steps

1. On staging, explicitly trigger the existing workflow using an authorized runner/dispatch mechanism; do not change main. Capture the exact new run URL, run SHA, job IDs, screenshots/traces and test IDs. A push touching only `docs/launch-sprint/` does **not** trigger the workflow.
2. Hunter QA owns the authenticated end-to-end booking path: synthetic login → real listing/date/guest selection → hosted Stripe TEST checkout → visible booking and sandbox DB/webhook reconciliation → two-account messaging → cancellation/refund → guest ID privacy denial. Do not count isolated payment tests as the entire path.
3. Host QA owns approval/capture, landowner zones, eligible completed-booking reviews, and Connect payout. Coordinate fixture IDs and avoid simultaneous mutations of the same booking.
4. Preserve the existing passing payment tests and only make staging changes. Launch remains **NO-GO** until tax, receipt, payout, refund, privacy and complete lifecycle evidence is verified.

Counters: new browser routes **0**, new E2E flows **0**, new Stripe TEST payments **0**, newly reproduced browser failures **0**, application fixes **0**. No main, live LeaseWild, production Supabase or live Stripe access.
