# Landowner QA geometry regression — 2026-11-13 13:24 EST

**Scope:** GitHub `staging/leasewild-full-clone`, Cloudflare sandbox only. Launch remains **NO-GO**.

## Change and evidence

Added two browser-executable negative tests in `qa/playwright/tests/landowner-geometry-negative.spec.mjs` at commit `53d7eb15975c8891891dc39e24a03ba08bc5fed9`:

1. Keyboard-accessible coordinate entry rejects latitude 91 and longitude -181 without creating a draft or enabling Save.
2. A four-corner self-crossing (bow-tie) hunting polygon cannot be queued with **Keep draft & draw another**, leaves zero queued zones and Save disabled.

Both tests are deliberately anonymous and read-only. They create no sandbox booking, identity, property, Stripe object or persistent zone. These target geometry and accessible coordinate entry, **not** authenticated persistence or role isolation.

**Execution classification:** STATIC-ONLY (test source committed); REAL BROWSER NOT TESTED in this invocation. Do not count these as passing until a GitHub Actions job executes and produces logs/artifacts. The staging push trigger should be checked against commit `53d7eb1` independently; the GitHub connector available here cannot list all workflow runs or dispatch one. Cloudflare deployment parity is NOT VERIFIED.

## Open owner/admin and launch gates

- Authenticated owner map save/reload and entry/parking persistence: NOT TESTED.
- Owner B and hunter role isolation, ID document privacy, ownership verification: NOT TESTED.
- Completed-booking hunter review, reservation management, live messages and email: NOT TESTED.
- Real Stripe TEST 3DS: prior browser retests FAILED with PaymentIntent `requires_action` and challenge left open; no new attempt here.
- Receipt delivery, paid bank payout, partial refund, Stripe Tax registration/classification: BLOCKED/NOT VERIFIED as recorded in shared launch gate.

**Coordination:** Host QA owns geometry and authenticated owner tests; Hunter/Payments owns 3DS checkout helper and payment reconciliation; Developer owns sandbox deployment. This note is separate to avoid conflicting edits to shared launch-sprint reports. No live domain, main branch, production Supabase, live Stripe, or real accounts were accessed.
