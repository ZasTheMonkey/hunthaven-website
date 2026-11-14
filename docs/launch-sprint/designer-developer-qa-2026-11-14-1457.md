# Designer/Developer QA handoff — November 14, 2026 at 2:57 PM ET

## Decision

**NO-GO.** The expanded sandbox matrix is green again after correcting a false cleanup assertion, but material payment, access-disclosure, review-moderation, accessibility and legal gates remain open. No production release was authorized or performed.

## Change completed

- Commit `c4c667e0f374d76a1397b96ef95443775e5d4b2d` updates `qa/playwright/tests/payments.spec.mjs` to distinguish two valid cleanup outcomes:
  - captured-and-fully-refunded `success` and `hunter_journey` PaymentIntents remain `succeeded`, retain the captured amount and must match the recorded TEST refund;
  - uncaptured authorization scenarios must end `canceled` with zero received amount.
- This is a QA-harness correction. It does not change checkout, booking, Stripe, refund or production behavior.

## Independent evidence

### GitHub Actions

[Workflow run `43634277042`](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43634277042) executed exact commit `c4c667e0f374d76a1397b96ef95443775e5d4b2d`; all five jobs completed successfully.

| Job | Job ID | Result |
| --- | ---: | --- |
| Host — Chromium | `132567532455` | PASS — 48 passed / 2 skipped |
| Host — mobile WebKit | `132567532661` | PASS — 48 passed / 2 skipped |
| Hunter — Chromium | `132567532703` | PASS — 29 passed / 1 skipped |
| Hunter — mobile WebKit | `132567532892` | PASS — 29 passed / 1 skipped |
| Payments — Chromium | `132567532712` | PASS — 7 passed / 3 skipped |

The Host jobs include the message-composer expired-session recovery regression. The Hunter and Host counts do not close every authenticated journey: their explicit skips remain skips.

### Stripe TEST browser scenarios

The payment job passed real hosted Checkout entry for success, generic decline, insufficient funds, completed keyboard 3DS, decline-then-success retry, the expanded hunter journey, and the synthetic 20% connected-account transfer/refund case. Delivered receipt email, connected-account bank payout and partial refund remain explicitly skipped.

Artifact `14129044672` (`leasewild-payments-chromium-43634277042`) is 231,165 bytes, not expired, and has SHA-256 `b54f49ffcc40eb9d84953f32e47ab1f473df3cd478b8148f4997d72e9cd9ca29`.

Test-only object evidence extracted from the artifact:

| Scenario | Booking | PaymentIntent | Webhook event | Refund | Pre-cleanup state |
| --- | --- | --- | --- | --- | --- |
| Success | `338ecadb-e427-433c-ae19-aa33b7dcc313` | `pi_3UbmzKAO40Rp32aF0JHFCth5` | `evt_1UbmzLAO40Rp32aFvoUBGPIu` | `re_3UbmzKAO40Rp32aF031ko9rr` | `cancelled` |
| 3DS | `0a824fb9-9153-4a7c-bdc7-0621f3d27851` | `pi_3Ubn0CAO40Rp32aF1O8aJZPY` | `evt_1Ubn0FAO40Rp32aFYPJhNYYX` | — | `pending_approval`; PI `requires_capture` |
| Retry | `8001aa6e-a467-4e34-b44a-42d452279fbc` | `pi_3Ubn0RAO40Rp32aF0rkQxs5O` | `evt_1Ubn0YAO40Rp32aFVhQymi6v` | — | `pending_approval` |
| Hunter journey | `93c87e3f-bf51-494b-9dd1-c8ee6b0db027` | `pi_3Ubn0sAO40Rp32aF21pKcaZB` | `evt_1Ubn0uAO40Rp32aFpAg0SbgM` | `re_3Ubn0sAO40Rp32aF25WMfRDH` | `cancelled` |

Both captured scenarios recorded concurrent refund results `[200, 409]`, demonstrating one accepted refund and one rejected duplicate. The success scenario also recorded duplicate checkout responses `[200, 200]` for the same key and a `409` for a different key on the occupied dates.

### Cloudflare sandbox deployment

- Deployment `08988a76-a9e1-4d3d-bbe3-9ac9c25185ad` independently reports `success` for exact commit `c4c667e0f374d76a1397b96ef95443775e5d4b2d`.
- Subsequent sandbox deployments `4abd0da1-f8fe-4f76-b78e-d73e9b554c1b` and `e944477d-e8e6-4805-aef4-7a153e807182` independently report `success` for Growth commits `ee85d9a502f71eb74fd32fe62e95aa6a711fecf3` and `7bd2cb97697d3958e8d1fa0c0ca657076f94f089`.
- Cloudflare labels this sandbox project's branch environment `production`; it is the isolated `leasewild-sandbox` Pages project, not `leasewild.com`.

## Five-role coordination snapshot

- **Designer/Developer:** fixed and proved the payment-harness state classification; prior messaging recovery remains green in both Host engines.
- **Hunter QA:** current Chromium and mobile-WebKit matrices are green at 29/1 each. The skipped authenticated portal case remains unproven.
- **Landowner QA:** latest fixture-coordinate validation rejects duplicate/malformed points before zone writes. Current Host runs still skip two credential/coordinate-dependent cases; earlier owner save/reload and non-owner denial evidence remains valid but was not re-proven with the new coordinate guard.
- **Growth Research:** the latest directory update rejects invalid maximum-price input instead of silently showing all results. Its source and Cloudflare deployment are verified; browser interaction across the full viewport matrix is not yet recorded for that specific change.
- **Legal Risk Review:** no new legal approval was recorded. The technical evidence does not approve tax, refund/cancellation language, access-coordinate disclosure, hunter-review moderation or release.

## Open gates

- **Hunter reviews — NOT TESTED positive path:** no eligible completed synthetic booking is currently recorded for the browser fixture. Eligible submission, one-review-per-booking browser proof, publication, moderation, reporting and appeal remain open.
- **Access zones — PARTIAL:** owner write/reload/delete and non-owner denial have prior evidence. Booked-hunter disclosure timing, cancelled/refunded/expired revocation and the two coordinate-dependent Host cases remain open.
- **Messaging — PARTIAL:** expired-session draft recovery is proven. Real participant-isolated send/receive, unread, retry, refresh and cancellation behavior remain open.
- **Payments — PARTIAL:** seven implemented TEST scenarios pass. Receipt inbox, external-bank payout, partial refund, Stripe Tax registration/classification, promo/add-on/cleaning-deposit totals and broader replay reconciliation remain open.
- **Responsive/accessibility — PARTIAL:** automated browser widths and mobile WebKit are covered elsewhere in the matrix. Physical devices, native 200% zoom, touch drawing, screen readers and full visual review remain open.
- **Legal — BLOCKED:** Florida attorney approval and approved access/review/payment policy remain absent. `docs/legal/website-compliance-handoff.md` is not present on staging.

Only the isolated sandbox, synthetic identities and Stripe TEST were used. `leasewild.com`, GitHub `main`, live Stripe, production Supabase, real users and personal sessions were not accessed or changed.
