# Designer & Developer QA update — November 14, 2026, 10:35 AM ET

**Decision: NO-GO.** This run changed and tested only the LeaseWild sandbox staging branch.

## P1 messaging defect fixed

The shared hunter/outfitter trip-message dialog previously assumed `auth.getUser()` always returned a user. If a sandbox session expired while the dialog was open, the handler threw while reading `user.id`, left **Send** disabled and provided no recovery path.

The handler now:

- fails closed with “Sign in again to send this message” when no authenticated user is returned;
- keeps the unsent draft for retry;
- clears the draft only after the database insert succeeds;
- catches auth and insert errors without an unhandled page exception;
- re-enables Send in `finally`.

Commits:

- `c805599b8bccf2d407756aeb75bfb16668239baf` — recover from expired message sessions
- `2070740888f555e6df82e2bbf9db70af7e1e9137` — isolated expired-session/retry browser regression
- `252b29e82c4b91605a4fe82c8c7cc3c6b0bc2bec` — activate regression in Host Chromium
- `42f34516771ec4441e4478cd1b58486d81c6d15c` — activate regression in mobile WebKit

Files:

- `outfitter-booking-actions.js`
- `qa/playwright/tests/outfitter-messaging-recovery.spec.mjs`
- `qa/playwright/playwright.config.mjs`

## Browser evidence

Run [43609562993](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43609562993), exact commit `42f34516771ec4441e4478cd1b58486d81c6d15c`:

| Job | Result |
| --- | --- |
| Host Chromium | **PASS — 50 passed**; messaging recovery passed in 284 ms |
| Host mobile WebKit | **PASS — 50 passed**; messaging recovery passed in 551 ms |
| Hunter Chromium | **PASS — 29 passed / 1 skipped** |
| Hunter mobile WebKit | **PASS — 29 passed / 1 skipped** |
| Payments Chromium | **FAIL — 1 passed / 6 failed / 3 skipped** |

The payment failures were in concurrently expanded hunter-journey fixtures/authentication, not the messaging code. Errors included 401 approval/hunter-list, 409 occupied fixture and a 403 outfitter fixture. Later corrective payment commits and runs remain in progress; do not treat the overall workflow as green.

A prior fully green workflow, [43607949316](https://github.com/ZasTheMonkey/hunthaven-website/actions/runs/43607949316), passed Payments 6/3 and all Host/Hunter jobs, but at that point the messaging recovery regression had run only in Chromium. The current scoped evidence proves both messaging engines while the new payment expansion remains unstable.

## Deployment

Cloudflare Pages deployment `0211d0ad-539b-4198-b7f5-05921f467f70` independently reports **success** for exact commit `42f34516771ec4441e4478cd1b58486d81c6d15c`. This is the `leasewild-sandbox.pages.dev` project, not `leasewild.com`.

## Five-role coordination snapshot

- **Designer/Developer:** delivered and verified the expired-session messaging recovery above.
- **Hunter QA:** enabled the authenticated hunter portal using verified sandbox credentials and added reload/sign-out coverage; the latest Chromium run is red while the bot continues correcting shared-session/payment-journey interactions.
- **Landowner/Host QA:** both Host engines passed 50/50 at the messaging commit, including authenticated host/admin/map coverage and the new recovery test.
- **Growth Research:** latest recorded work addresses outfitter narrow-grid overflow and discovery/SEO safety; no Growth-owned file was edited here.
- **Legal Risk Review:** no newer attorney approval or legal handoff was present. Existing NO-GO remains.

## Evidence limits and next gates

- The new test proves client recovery with a deterministic stub. It does **not** prove real hunter↔outfitter send/receive, participant RLS, live refresh/unread behavior, cancellation retention or notification email delivery.
- Positive eligible completed-booking hunter review still lacks a safe synthetic completed-booking fixture. RLS and the unique booking constraint exist, but moderation, publication, reporting and appeal are not implemented or verified.
- The payment expansion must return to a full green matrix before launch readiness can improve.
- Receipt inbox, bank payout, partial refund, Stripe Tax, promo/add-on/deposit totals, physical-device/native-zoom/screen-reader testing and Florida attorney approval remain open.

Production, `main`, live Stripe, production Supabase, real users and personal sessions were untouched.
