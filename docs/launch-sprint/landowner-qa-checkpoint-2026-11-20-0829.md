# Bot B Landowner QA — 2026-11-20 08:29 ET (staging only)

**Evidence classification: STATIC-ONLY. No real browser, Stripe test card, authenticated fixture, or sandbox database action executed in this checkpoint.**

## Newly confirmed CI configuration

Read current staging `.github/workflows/leasewild-real-browser-qa.yml` and `qa/playwright/tests/host.spec.mjs` directly. The current workflow has **six** matrix configurations (hunter Chromium/mobile WebKit, host Chromium/mobile WebKit, payments Chromium/mobile WebKit on macOS), not five. Its triggers are `workflow_dispatch` and staging-branch `push` restricted to workflow/Playwright file paths; there is **no schedule trigger** in the current YAML. Consequently hourly browser execution must not be inferred. Each matrix job uses `max-parallel: 1`, checks out `github.sha`, and uploads artifacts. The current test suite has authenticated hunting, entry and parking save/reload/delete cases and second-owner denial, all opt-in on verified synthetic fixtures; presence of test code is not execution evidence.

## Execution gates and coordination

1. Provision and independently verify sandbox-only landowner A and B identities, A-owned disposable listing, in-bounds coordinates, and reliable cleanup. Set `QA_LANDOWNER_FIXTURE_VERIFIED` and `QA_LANDOWNER_ZONE_CLEANUP_VERIFIED` only after checking ownership and cleanup. Never point these at real listings.
2. Trigger the workflow against staging using an authorized GitHub Actions dispatcher, or verify a fresh staging push run; collect exact run SHA, job outcome, screenshots and traces. Confirm Cloudflare deployment SHA matches tested source before release assertions.
3. Test real touch/pointer drawing separately: current authenticated persistence tests enter coordinates, so they do **not** prove user-drawn touch geometry persistence.
4. Cross-check completed-booking hunter reviews, property verification, two-account messaging and reservation approval/release using disposable accounts. Hunter QA owns checkout card submission; Bot B owns owner-side booking, capture and transfer reconciliation. Avoid duplicate test charges.
5. Keep Stripe Tax classification/registrations, delivered receipts, partial refunds and connected-bank payout as open gates until cross-system evidence exists. Historic test transfers do not establish bank payout.

## Accounting

Fresh browser routes: **0**; real browser flows: **0**; Stripe TEST card submissions: **0**; reproduced runtime defects: **0**; verified runtime fixes: **0**; app deployments: **0**. One staging-only documentation handoff. **NO-GO**. No GitHub main, live domain, production Supabase, live Stripe, real identities or cards accessed.
