# Independent staging browser runner (no main-branch changes)

Use a GitHub Codespace or another network-enabled Linux runner to execute the existing Playwright suite. This runner does **not** use GitHub Actions and does not require a workflow registered on the default branch.

## Start a Codespace (owner action)
1. Open the repository **Code** tab on github.com, choose branch `staging/leasewild-full-clone`.
2. Select **Code → Codespaces → Create codespace on staging/leasewild-full-clone**.
3. In the Codespaces terminal run:

```bash
bash qa/playwright/run-staging-qa.sh
```

This runs all five Playwright projects. To focus on host/admin:

```bash
bash qa/playwright/run-staging-qa.sh --project=host-chromium --project=host-mobile-webkit
```

The runner checks sandbox DNS/HTTP reachability before installing browsers. It writes artifacts to `qa/playwright/artifacts/`. Report the actual console exit status and attach artifacts before marking any browser PASS. Do not commit artifacts, passwords, checkout URLs, test IDs containing secrets, or customer data.

## Fixture gates
Dedicated **sandbox-only synthetic** login credentials are supplied as `QA_HUNTER_EMAIL/PASSWORD`, `QA_LANDOWNER_EMAIL/PASSWORD`, `QA_OUTFITTER_EMAIL/PASSWORD`, and `QA_ADMIN_EMAIL/PASSWORD` in the runner environment; do not paste credentials into chat or commit them. Stripe TEST checkout cases additionally require fresh, unique synthetic sessions through `QA_STRIPE_TEST_CHECKOUTS_JSON` as described in the Playwright README. Without fixtures, authenticated and payment scenarios may skip. Browser navigation is not proof of booking persistence, webhook, email delivery, refunds or payouts. Reconcile TEST Stripe and sandbox database records independently.

## Safety / release gates
The script hard-codes `QA_BASE_URL=https://leasewild-sandbox.pages.dev`; the Playwright config rejects non-sandbox URLs. Never access production Supabase, live Stripe, personal sessions or real identities. The script does not push/deploy anything. It is a manual runner, **not** an hourly scheduler. Any hourly execution requires a separate authorized Codespaces or external runner schedule and real run evidence. No production launch without explicit owner authorization.

## Report checklist
For each run record: UTC timestamp, Codespace/runner identity (nonsecret), staging commit SHA, projects executed, test totals PASS/FAIL/SKIP, artifact links, browser screenshots, blocked credentials/fixtures, and payment TEST IDs where actually generated. Record REAL BROWSER PASS only for completed browser assertions, API-ONLY for API checks, STATIC-ONLY for code checks, and BLOCKED for inaccessible browser or missing fixtures.
