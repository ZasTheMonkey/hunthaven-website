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


## 2026-11-09 22:29 ET — Cross-bot handoff and conversion risk review

### Coordination/evidence reviewed
- Read `docs/launch-sprint/README.md`, `hunter-qa.md`, `landowner-qa.md`, and `launch-readiness.md` before editing. Designer already owns visible homepage and next public listings-page P0. Hunter QA owns the messaging bridge; Landowner QA owns owner portal. **No edits to their files or flows in this growth run.**
- Latest staging commits observed: `e27cee1e8e27fe1da47297325a84176aa104394a` (landowner QA report), `9795f1aaf562b63294b13174d1694332c7fba464` (owner inbox polling), and `cdade7705a6025b1ba56b87d24acf437aea73d39` (hunter QA report). Designer's earlier `b21c515fb9601abb455550d8cdf1d5180bf1938b` removed homepage fabricated cards and stale opening copy; its report records public homepage/listings smoke tests, but not mobile or authenticated E2E.
- Re-read current staging `index.html`, `listings.html`, `sitemap.xml`. Static source findings below are **PASS (source inspection)**, not browser pass.

### P0 — actionable findings for Designer/Legal (do not duplicate edits)
1. **Listings page still says not launched:** `listings.html` contains desktop and mobile “Get early access,” “Be first when we go live,” “Join the waitlist ... day LeaseWild opens for guest bookings,” and a modal explicitly saying “Bookings open July 1, 2026.” Replace prominent guest CTA with actual inventory browse/booking, retain optional updates signup with truthful copy, and preserve dynamic Supabase listing rendering. **Owner: Designer.** Acceptance: zero expired date/prelaunch-booking claims in listings source and rendered page; public search→listing→booking CTA still works without fake inventory.
2. **Homepage unsubstantiated trust/coverage promises:** `index.html` still contains “Verified landowners,” “1,200+ Acres in early access,” “without the risk,” and “Digital waivers. $1M coverage.” Treat each as unverified until documented controls, inventory tally and insurance policy evidence exist. **Owner: Designer + Legal**; replace with qualified factual wording after evidence review, not an invented guarantee. Acceptance: no unsupported guarantee or numeric proof claim in public HTML.
3. **SearchAction structured data potentially misroutes:** homepage JSON-LD advertises `https://leasewild.com/?q={search_term_string}`; static inspection alone does not prove that `?q=` triggers a real search. **Owner: Growth/Designer after functional validation.** Acceptance: a browser request with query parameter returns relevant search results; otherwise remove unsupported SearchAction while preserving valid WebSite schema.
4. **Listings navigation creates conflicting intents:** “Get early access” and “Demo” compete with real listing search and booking. Prioritize clear browse/filter/book action, secondary landowner listing action, tertiary optional updates. **Owner: Designer.** Measure guest browse CTA click-through and listing-view→booking-start rate, segment mobile vs desktop.

### P1 — premium marketplace and growth design brief
- **Real-inventory-first:** hero and listing card should use real approved listing photography and verified attributes only; don't use generic filler or placeholder inventory. Add first-listing discoverability via real listing results, not hard-coded property IDs. Test empty, loading, fetch error, no-results, and sold-out dates.
- **Listing decision clarity:** visible actual acreage, access type, allowed hunting/fishing methods, check-in/out window, species only when substantiated, map location precision consistent with landowner privacy, price and fee breakdown **after** payments owner verifies 80/20 math. Surface rules and refund terms before checkout. No invented reviews.
- **Mobile-first friction audit:** 375/390px viewport screenshots for filters, cards, map/list switch, sticky booking CTA, modal close/focus and keyboard navigation. Measure taps from browse→detail→date selection→Stripe TEST start. No mobile QA claimed in this run.
- **SEO strategy:** prioritize useful, indexable, factual statewide/category pages and the first approved St. Johns River listing. Add county pages only with matching live inventory and unique factual copy. Avoid thin location pages, unverifiable wildlife promises and fabricated booking testimonials.
- **Metrics:** baseline `homepage_browse_click`, `search_submit`, `listing_view`, `booking_start`, `booking_complete`, `landowner_onboarding_start`, `listing_publish` with consent-aware, non-PII event properties. Hypothesis: clear available-inventory CTA improves qualified listing views; magnitude **unknown until instrumentation**.
- **Competitor patterns to validate in future research:** LandTrust experience/package merchandising; HLRBO searchable land leases; Base Camp Leasing longer-term inventory. These are design references, not verified current pricing/inventory counts.

### Sprint status
- **Committed this run:** this checklist update only; no application code changes and no conflicts with Designer/QA.
- **Deployment this run:** not independently verified; prior designer/QA deployment evidence is reported in their respective handoffs, not reclassified as our test.
- **Browser/mobile/Stripe TEST/authenticated E2E this run:** NOT TESTED / authenticated E2E BLOCKED pending secure dedicated QA sessions.
- **Release:** NO-GO for production under shared release gate. Production/main/real users/payments untouched.
