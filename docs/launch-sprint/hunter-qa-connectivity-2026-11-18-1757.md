# Hunter QA — 2026-11-18 17:57 ET — sandbox connectivity gate

Scope: staging/leasewild-full-clone and leasewild-sandbox.pages.dev only. No production resources.

## New evidence (this execution)
- **BROWSER ACCESS BLOCKED:** Container `curl -I -L --max-time 10 https://leasewild-sandbox.pages.dev` returned `curl: (6) Could not resolve host: leasewild-sandbox.pages.dev`. This is a DNS/egress limitation of this runner, **not** evidence that the deployed site is down.
- **STATIC-ONLY PASS:** Fetched this branch's Stripe launch gate and Hunter QA report using the authenticated GitHub connector.
- **NOT TESTED:** New authenticated UI booking, Stripe TEST card payment, cancellation/refund, messaging, guest-ID privacy, reviews, email delivery, or responsive widths. No synthetic fixtures or transactions were created.
- **NOT VERIFIED:** Cloudflare deployment parity or a new GitHub Actions browser run; no graphical network-enabled browser session was available to this execution.
- **Counters:** new browser routes 0; new E2E flows 0; new Stripe transactions 0; reproduced application bugs 0; application fixes 0; deployments 0.

## Launch blockers and coordination
1. P0: Execute authenticated hunter booking → host approval → Stripe TEST capture → hunter reservation visibility → cancellation/refund, and reconcile sandbox booking, intent, webhook and refund records.
2. P0: Verify private guest IDs and cross-account RLS denial with distinct synthetic hunter/host identities.
3. P0: Resolve tax treatment and verify receipt delivery, partial refunds, and payout readiness before launch.
4. P1: Exercise two-account realtime messaging, completed-booking review permissions and 320–2560px viewport matrix.
5. **Next action for Hunter QA:** use a network-enabled graphical Work/browser or explicitly dispatched staging CI with disposable credentials and test inbox; save run URL, screenshots, TEST object IDs, and cleanup evidence. Coordinate host approval/capture and payout assertions with Landowner QA; avoid modifying shared reports concurrently.

No change to main, live leasewild.com, production Supabase, or live Stripe. Launch **NO-GO**. This report is diagnostic evidence only, not a passed E2E run.
