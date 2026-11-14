# Landowner QA — 2026-11-14 17:18 ET

**Scope:** staging branch only; no live/main/production resources accessed. **Launch: NO-GO.**

## Verified static change

Commit `df7fe67a449fbd651706c94997b4ea01a2f7f1b7` updates both authenticated entry-area and parking-area Playwright cases in `qa/playwright/tests/host.spec.mjs` to require the same explicit fixture and cleanup verification flags already used by the hunting-boundary test. UUID shape is now checked strictly. The flags are only guardrails; they are not independent verification. No browser execution or deployment was performed for this change. **Status: STATIC-ONLY; browser result NOT TESTED.**

## Preflight before enabling writes

1. Independently verify sandbox Supabase project identity and disposable listing ownership by the configured synthetic landowner; check every polygon vertex against actual property bounds, not just global latitude/longitude ranges.
2. Establish uniquely labeled zone reconciliation and reliable server-side cleanup for partial save, reload, and deletion failures. The current browser `finally` block deletes only a visible row and is insufficient by itself.
3. Only then set `QA_LANDOWNER_FIXTURE_VERIFIED=true` and `QA_LANDOWNER_ZONE_CLEANUP_VERIFIED=true` for the verified staging runner, and execute authenticated hunting, entry and parking save/reload/delete plus second-owner denial. Preserve screenshots, exact workflow URL and database reconciliation.
4. Hunter/Payments owns fresh card submissions. Reuse their existing synthetic payment evidence for host-side correlation where possible; do not duplicate payment fixtures or modify shared payment specs.

## Open gates

Authenticated map writes, second-owner database-level isolation, property verification, completed-booking hunter reviews, host booking/message/notification lifecycle and role-specific payout reconciliation remain NOT TESTED in this invocation. Prior [hunter payment run 43634277042](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43634277042) reported 7 passed / 3 skipped; it is not new Bot B execution. Delivered receipt, external-bank payout, partial refund, Stripe Tax, promo/add-on/cleaning-deposit accounting, and legal review remain open. No claim of deploy or fresh PASS without runner evidence.
