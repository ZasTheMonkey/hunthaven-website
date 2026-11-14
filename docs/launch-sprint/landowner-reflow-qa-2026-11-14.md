# Landowner QA — narrow reflow regression (2026-11-14 04:07 EST)

Scope: staging branch and Cloudflare sandbox ONLY. No production resources.

## Change and coordination
- Added isolated Playwright spec `qa/playwright/tests/landowner-reflow.spec.mjs`, commit `70ba1b264e8e2ee52b3e20fc910f7d8890e862c3`.
- It visits the deployed sandbox zone editor anonymously at half-width layouts derived from the requested 320–2560px matrix, checks controls, map visibility, raw-source leakage, horizontal overflow, and anonymous save denial; records screenshots when executed.
- **Important:** Half-width layout reflow is NOT browser zoom or WCAG 200% zoom verification. A real browser zoom test remains necessary. The 160px case is intentionally stricter than ordinary mobile widths and could reveal failures.
- This is a separate test file to avoid conflicting with the other bots' edits to `host.spec.mjs`. Bot A retains hunter checkout ownership; Bot B retains landowner zone QA.

## Evidence classification
- STATIC-ONLY: GitHub accepted test commit.
- BROWSER ACCESS BLOCKED: no real graphical browser/computer available in this invocation. No Playwright run, screenshot, authenticated fixture, or fresh Stripe TEST checkout performed. Test is NOT TESTED, not PASS.
- NOT TESTED: Cloudflare deployment of this commit; real browser 200% zoom; map save/reload; cross-owner RLS; verification; completed-booking review; booking and messaging; payment and receipt reconciliation.
- Source launch-gate read: historical 0 linked outfitters is superseded by later evidence of one linked synthetic outfitter. Never present the initial count as current.

## Next actions
Run this spec on staging Chromium and mobile WebKit with screenshots; independently verify actual browser zoom. Provision isolated first- and second-owner QA credentials and disposable listing, then run existing authenticated boundary/entry/parking persistence and cross-owner denial tests. Verify sandbox Stripe TEST payment, receipt, capture, refund, and payout separately with fresh evidence. Preserve NO-GO until critical gates clear.

This invocation: 1 test file committed, 0 browser routes executed, 0 confirmed fixes, 0 payments, 0 verified deployments. No main/live/production access.
