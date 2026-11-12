# LeaseWild sandbox launch sprint — November 9, 2026, 11:00 PM ET target

## Rules
- This is a $100,000-quality aspiration, NOT an authorized spend, valuation, or guarantee.
- SANDBOX ONLY: https://leasewild-sandbox.pages.dev ; GitHub staging/leasewild-full-clone; sandbox Supabase kbkdfpmlyggfijkyjxoi; Stripe TEST ONLY.
- DO NOT modify leasewild.com, GitHub main, production Supabase, live Stripe, or real customers.
- No automatic production launch. Require owner approval and attorney review of substantive legal policies.
- Before changing code, inspect latest branch and other QA handoffs; don't overwrite concurrent work.
- Report evidence, exact commit and deployment. Use PASS / FAIL / BLOCKED / NOT TESTED, never claim E2E without authorized sessions.

## Assignments
- Hunter QA -> docs/launch-sprint/hunter-qa.md: hunter login, search, booking, Stripe test, messages, cancellation, mobile, auth/RLS.
- Landowner QA -> docs/launch-sprint/landowner-qa.md: listing, availability, approval/decline, messages, owner verification, mobile, auth/RLS.
- Designer & Developer -> docs/launch-sprint/launch-readiness.md: integration lead, premium responsive design, fixes, accessibility, deploy verification, go/no-go.
- Legal Risk Review -> docs/launch-sprint/legal-blockers.md: consent, waivers, privacy, insurance, claims, Florida laws; lawyer approval blockers.
- Growth Research -> docs/launch-sprint/growth-checklist.md: truthful booking messaging, SEO, listing discovery, conversion.

Payment checkout and reconciliation are tracked in the [payment browser QA handoff](payment-browser-qa.md).

## Known launch blockers / verification needed
1. Dedicated hunter-qa@leasewild.test and landowner-qa@leasewild.test Auth users confirmed with passwords; secure automation credential/session provisioning NOT verified. Full authenticated E2E remains BLOCKED.
2. Stripe TEST authorization/capture/refund/expiry and Connect payout need complete evidence-based reconciliation.
3. Legal waivers/terms/privacy and insurance require Florida lawyer review; no blanket liability guarantees.
4. Mobile screenshot review and cross-role messaging E2E unverified.
5. Existing production is separate and MUST remain untouched.

## Release gate
Do not declare GO until P0 checkout/payment, authentication/authorization, booking state, messaging, and critical privacy/security tests pass with evidence and legal counsel clears required binding agreements. If blocked at 11 PM, report NO-GO with remaining issues.
