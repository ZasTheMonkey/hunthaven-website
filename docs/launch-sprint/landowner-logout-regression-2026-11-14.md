# Landowner logout persistence QA — 2026-11-14 00:53 EST

Owner: Bot B / Landowner QA. Staging only. Launch: **NO-GO**.

## Change

Commit `dad2f528b8152f3f5611b72021d68298bacf43db` adds `synthetic landowner logout invalidates dashboard access after reload` to `qa/playwright/tests/host.spec.mjs`. The browser scenario signs in with a dedicated synthetic landowner, requires a visible authenticated dashboard, clicks the real Sign Out control, requires the login card and hidden dashboard, reloads, and reasserts both. It takes a screenshot on success. It uses the existing `QA_LANDOWNER` runner credentials and does not create or modify bookings, map zones, payment objects or production data.

## Evidence and limitations

**STATIC-ONLY:** GitHub source update committed. No fresh browser job, screenshot artifact, Cloudflare deployment or test pass verified in this invocation. Test must run in both host Chromium and mobile WebKit against `https://leasewild-sandbox.pages.dev`; inspect exact job logs and artifacts before marking REAL BROWSER PASS. Credential-dependent test skips are **not** passes.

Existing independently documented [run 43549078806](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43549078806) covered authenticated login and reload, not this logout scenario. Stripe launch gate records 6 passed / 3 skipped and remains NO-GO for delivered receipt, external-bank payout, partial refund, Stripe Tax registration/classification, promo/add-on/cleaning-deposit economics, webhook replay, authenticated zone/review authorization and legal approval. Hunter QA owns fresh payment card runs; Bot B owns host-side reconciliation and authenticated access checks. Avoid concurrent edits of payment fixtures and shared reports.

## Next verification

Confirm push-triggered host Chromium and WebKit jobs for commit `dad2f528...`, inspect visible sign-out and post-reload auth state. Then run authenticated boundary/entry/parking save-reload-delete with verified disposable listing, and cross-owner negative permissions, property verification, reviews and messaging. Do not treat source changes or Playwright test definitions as E2E proof.

**Run accounting:** 1 regression test added; 1 test commit plus this documentation commit; 0 newly executed browser flows; 0 verified application fixes; 0 new Stripe TEST payments; 0 deployments. No main/live/production access.
