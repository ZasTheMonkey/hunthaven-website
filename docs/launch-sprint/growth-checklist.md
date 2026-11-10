# LeaseWild growth launch checklist — 2026-11-09 21:22 ET

## Scope and coordination
Sandbox staging branch only. Do not merge or deploy to production. Hunter QA owns hunter messaging, Landowner QA owns landowner messaging, Designer owns visible homepage/UX changes. This growth pass deliberately changed **only** index.html metadata/structured-data copy; Designer should own the stale visible homepage hero and sample-card CTAs to avoid edit collisions.

## P0: confirmed issues from code inspection
- [x] **Correct stale homepage search/social descriptions** (metadata + structured-data descriptions): previous code said bookings would open July 1, 2026 and invited visitors to a waitlist. User confirms one live, bookable St. Johns River property; replaced stale metadata with accurate, restrained availability language. Commit `92740b01c5f9bc38bbb7743e88f5825045f6b2e0` on staging only. Source validation: all six exact strings replaced; no July 1 mention remains in first 8,000 chars. **Not deployed or browser-tested.**
- [ ] **Designer: fix visible homepage hero and CTA**: currently says 'Coming to Florida · Bookings open July 1, 2026' and 'Join waitlist'; featured cards use onclick=openWaitlist and appear to be placeholder/demo listings. Make primary CTA 'Browse available properties' linking to listings.html; do not imply placeholder properties are bookable. Ensure St. Johns River property is discoverable through dynamic real listing search. Preserve legitimate signup/waitlist functions where appropriate. Confirm via browser and mobile screenshots before claiming completion.
- [ ] **Owner/QA: confirm true bookability** of St. Johns River listing in sandbox without personal credentials. Authenticated E2E BLOCKED until securely provisioned QA session. Never charge live cards or touch production.
- [ ] **Pricing audit:** user confirms **80% landowner / 20% LeaseWild split**. Homepage JSON-LD FAQ says guests pay a 20% service fee; this is not necessarily the same as a 20% platform share deducted from landowner proceeds. Do not edit pricing, checkout, legal or promise a guest fee until actual checkout math is verified by payments owner.
- [ ] **Verification claims audit:** do not claim all landowners are verified or GPS maps are guaranteed accurate until proof and verification controls exist. Removed such claims from homepage metadata/schema descriptions, not all visible copy.

## P1: search and conversion
- [ ] Verify search actually returns the first live St. Johns River listing; record number of taps from home > listings > listing > booking initiation.
- [ ] Validate mobile listing card and booking CTA at 375px and 390px; check contrast, accessible labels, loading/empty states.
- [ ] Publish factual unique listing details (photos, actual location area, access rules, allowed activities, check-in/out, availability, price), only with landowner approval.
- [ ] Add events: home_view, search_submit, listing_view, booking_start, booking_complete, landowner_signup_start, listing_publish; avoid storing PII in analytics.
- [ ] Review sitemap.xml: all lastmod entries dated 2026-04-20; change only to verified content update dates, never fabricate.
- [ ] Inspect WebSite SearchAction schema target `/?q={search_term_string}`: validate query parameter actually performs search; remove markup if unsupported.
- [ ] Verify OG image actual dimensions versus declared 1200x630.

## Priority, impact estimates, effort, KPIs
| Work | Impact hypothesis (not forecast) | Effort | Evidence/KPI |
|---|---|---|---|
| Remove misleading waitlist/prelaunch visible copy | High: avoids bounce/confusion for bookable inventory | S | CTA click-through; 0 stale booking-open claims |
| Real first-listing discoverability | High: directs qualified traffic to actual inventory | M | First-listing views; booking starts |
| Transparent 80/20 pricing explanation once fee mechanics validated | High: landowner trust | S-M | Listing completion; support questions |
| Mobile listing/booking funnel | High: reduces friction | M | Mobile search-to-booking-start conversion |
| St. Johns River factual landing copy | Medium: high-intent organic discovery | M | Search impressions, organic listing views |
| Landowner referral/partner outreach | Medium, uncertain | M | Qualified leads, verified listings published |

## Research and source follow-up
Competitor categories to benchmark in next run: LandTrust (experience/package discovery), HLRBO (hunting lease search), Base Camp Leasing (annual lease model). Collect direct current pricing, Florida inventory, mobile search evidence before numerical claims. Suggested high-intent search clusters: 'private hunting land for rent Florida', 'day hunting lease Florida', 'private fishing access St Johns River', 'hog hunting private land Florida', 'list hunting property Florida'. Avoid location-specific landing pages without relevant bookable inventory. No paid acquisition recommendation until booking funnel validated.

## Run evidence
- Read staging index.html, listings.html, robots.txt, sitemap.xml. No existing launch-sprint reports found at guessed filenames; other bots' reports not confirmed read. Avoid editing their areas.
- Staging commit: `92740b01c5f9bc38bbb7743e88f5825045f6b2e0` (index.html metadata only).
- Deployment: **unverified**. Browser E2E: **not run**. Authenticated E2E: **blocked** (no secure session). Production: **untouched**.
