# Landowner 3DS reconciliation — 2026-11-13

**NO-GO.** Scope is staging, LeaseWild Cloudflare sandbox, sandbox Supabase `kbkdfpmlyggfijkyjxoi`, and Stripe TEST account `acct_1TOJ2rAO40Rp32aF`.

| Run / payments job | Commit | Result | Failed fixture |
| --- | --- | --- | --- |
| [43453897743 / 131982886090](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43453897743/job/131982886090) | `8de368a43eef100aede89a6f8dfafb9f87f8a9f2` | 5 passed, 1 failed, 3 skipped | Booking `87e8f470-1abf-40a2-b44e-f78dfbe9dc42`, TEST intent `pi_3UbMWCAO40Rp32aF3StSnMwx` |
| [43454247616 / 131985017073](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43454247616/job/131985017073) | `3cd6998098b8033906eec827ebfeaf25d8056313` | 5 passed, 1 failed, 3 skipped | Booking `ae8240cf-891b-4d67-bc59-1968823151a5`, TEST intent `pi_3UbMaWAO40Rp32aF1BZn0dyX` |

For both fixtures, the exact Supabase booking points to a Stripe TEST Session with matching booking metadata. Both Intents entered `requires_action` and were canceled when the runner expired the Session during cleanup. The Sessions finished expired/unpaid and Supabase stored neither an Intent ID nor an authorization timestamp. Stripe reports zero pending webhook deliveries for the matching expiration events `evt_1UbMXCAO40Rp32aFojLTf7mU` and `evt_1UbMbXAO40Rp32aFCUJS3JV4`. The sandbox Edge log recorded a webhook HTTP 200 at 15:41:31.667 UTC, consistent with the second expiration at 15:41:30 UTC. The edge log line does not include the Stripe event ID.

[Artifact 14052812608](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43454247616/artifacts/14052812608) matched the runner ZIP digest. Its Playwright error snapshot still shows the active nested Stripe 3DS challenge with the Complete button after the booking wait timed out. The runner's challenge helper returned after issuing a click. It did not establish that Stripe accepted the challenge. The evidence localizes the failure upstream of booking authorization and leaves the exact reason the challenge stayed open unresolved. Extending the booking wait alone does not verify challenge completion.

**Coordination.** Hunter/Payments and Developer own the browser helper. The staging payment spec has changed since the failed run. Its current blob `f894f8fd96ccbc9d999ddf10f8c4c847f567a601` hardcodes two sandbox identities whose synthetic status could not be confirmed. Before another browser run, restore or verify isolated synthetic fixture selection and confirm the associated QA-only listing. A fresh run should separately prove the challenge completed, the TEST Intent reached `requires_capture`, the exact Session completion event was delivered, and Supabase reached `pending_approval` before cleanup. Record those checkpoints on failure as well. No runner or payment code was changed in this review.

**Host QA.** In run 43454247616, Chromium and mobile WebKit each had 19 passes and 3 skips. The authenticated landowner, outfitter, and admin cases were skipped. The host/admin report's authenticated journey gap remains open.

**Other payment gates.** BLOCKED: delivered receipt requires a synthetic inbox and sandbox sender. BLOCKED: bank payout requires a paid payout on the linked TEST account and reconciliation to its funding. BLOCKED: partial refund requires an approved amount rule and a supported, reconciled flow. The successful TEST Connect transfer covers the 20% fee but does not prove bank payout. The 6.5% placeholder tax remains unchanged.
