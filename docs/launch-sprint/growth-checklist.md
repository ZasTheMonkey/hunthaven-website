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


## 2026-11-09 23:17 ET — Current-source reconciliation and new P1 conversion integrity finding

### Coordination
- Reviewed latest staging history through `6fbfdc5e891d41eab6c212b53b8ffaf6c0a53c61`, plus current Hunter QA, Landowner QA, Designer launch-readiness and sprint README. Hunter/owner messaging scroll fixes `da3c7a4d` / `53b184a1` have source and deployment-metadata evidence, **not authenticated E2E**. Designer owns public homepage/listings implementation. No edits to their files.
- Re-fetched staging `index.html` (blob `5da7f5544e1fd4af93616f8acfa92c82b9e96164`), `listings.html` (blob `e2ade4b00a7b6c5f47ac68f702791d4132294849`) and `sitemap.xml`. Static source inspection only.

### Updated status: previously flagged P0s resolved in source
- **PASS (static):** Current `listings.html` contains zero instances of expired “July 1,” “Get early access,” or “when we go live” strings; Designer's `c7c85d75` fix is present. Do **not** keep treating this as an open P0 without new evidence.
- **PASS (static):** Homepage no longer contains exact strings “1,200+,” “$1M coverage,” “without the risk,” or “Verified landowners.” Current WebSite JSON-LD has **no SearchAction**; earlier unsupported `?q=` schema issue is resolved. Remove these from active defect lists, but separately review any new trust claims in rendered UI.

### New P1 — updates form may falsely claim success
- **FAIL (source logic):** Homepage updates form uses `fetch(WAITLIST_URL+'?'+params,{method:'GET',mode:'no-cors'})`; its `catch` only logs a warning, then unconditionally hides the form and shows `wl-success`. In `no-cors` mode the opaque response cannot confirm server acceptance. Users can see success when a request fails, risking lost qualified leads. **Owner: Designer/Developer**, not Growth (avoid concurrent homepage edits). Acceptance: use a response-verifiable same-origin or properly CORS-enabled endpoint with server-side validation; show success only after confirmed acknowledgement, preserve entered data and display an actionable error on failure; do not expose PII in URLs or analytics. If no verified endpoint exists, do not falsely claim subscription succeeded.
- **P1 fee copy pending checkout owner:** Visible FAQ says “daily rate + 20% service fee (on rate + cleaning fee) + Stripe payment processing fee (2.9% + $0.30).” Confirmed owner/platform 80/20 split alone does not prove those *guest-facing* fee terms. Verify Stripe TEST math, payer of processing fees, and actual refund behavior before rewriting public FAQ or structured FAQ. Avoid fixed processor-price claims absent current configuration evidence.
- **P1 metadata:** `sitemap.xml` lastmod dates remain April 2026; update only with verified substantive page update dates. FAQPage JSON-LD should match visible, validated FAQ and should not imply guaranteed rich results.

### Conversion measurement and release evidence
- Recommend synthetic sandbox test: deliberately fail updates endpoint, verify no success state and no loss of input; then verify successful server-acknowledged signup once a safe endpoint exists. Measure `updates_submit_attempt`, `updates_submit_confirmed`, `updates_submit_error` **without email/phone/PII in analytics**. No such test performed here.
- This run: documentation-only change; no application code, browser/mobile/Stripe TEST or authenticated E2E. Deployment status **not independently checked**; commit-to-branch is not evidence of Pages activation. Authenticated E2E remains **BLOCKED** without secure dedicated QA sessions. Production/main/real users/payments untouched. **NO-GO** remains appropriate.


## 2026-11-10 00:46 ET — Post-deadline inventory-claim precision and SEO follow-up

### Coordination and verified source
- Read latest staging history through `024905444f3536c11a1ab1037769d93252eaaf1b` (legal handoff), `cfd14221a60bb90f25d465328c79d6119c852063` (launch-readiness update), and `db3d160a70b61d7b4a24c679d2cb9574068c35a5` (landowner page correction). Read Hunter QA, Landowner QA, Designer readiness, and sprint README before this documentation change. Designer's reported exact deployment `ffeb7ae6-895a-4174-be87-23ab17180e7c` is **secondhand deployment metadata**, not independently checked in this run.
- Fetched current staging `listings.html` blob `e2ade4b00a7b6c5f47ac68f702791d4132294849`, `index.html` blob `f405fb4257ce568e8c5e884a98cbe295aa9a8c5c`, `sitemap.xml`, and `robots.txt`. Source inspection only, no real listing inventory query or browser execution.

### New P1 — listings search snippet advertises unverified species inventory
- **FAIL (copy/source precision):** `listings.html` meta description says **“Book deer, hog, duck, and bass fishing properties by the day or season.”** Current verified business context confirms only the first St. Johns River property is live/bookable, **not** available deer/hog/duck/bass inventory or seasonal booking modes. This copy could create misleading organic-search expectations. The `meta keywords` also lists deer/hog/bass; unlike a description, these keywords are not proof of current listings.
- **Owner: Designer/Developer (public listings page), coordinated with Growth.** Suggested low-risk replacement description: “Explore private hunting and fishing access in Florida. Browse available properties, review landowner rules, and check booking options where offered.” Preserve title/canonical and live listing query. Acceptance: rendered `<meta name="description">` contains no unsupported species or booking-mode inventory claims; compare source and sandbox served HTML; confirm the actual St. Johns River listing appears before writing property-specific SEO claims. Do not fabricate inventory or species.
- **P1 conversion follow-up:** Ensure empty search/filter states distinguish “no matching properties” from network failures, offer a clear “Clear filters” action, and do not inject sample inventory. Track filter→listing views and no-results frequency without PII. Browser/mobile checks remain outstanding.
- **Resolved-source note:** Designer's latest launch-readiness report documents corrected 80/20 landowner copy and calculator fixtures in `list-your-land.html` at `db3d160a`; do not continue reporting the old 85% calculator defect as active without new evidence.

### Verification and release gate
- This run changes only this shared growth document; no production/main, payment, auth, database or public HTML modifications.
- Source inspection: PASS for observing exact metadata; **NOT TESTED** actual live inventory, mobile layout, signup failure behavior, Stripe TEST, and deployed sandbox HTML. **BLOCKED** authenticated E2E without secure dedicated QA sessions.
- Independent deployment status for this documentation commit: **NOT VERIFIED**. Release gate remains **NO-GO**, including pending legal review and P0 payment/authorization evidence.


## 2026-11-10 01:39 ET — Listings-page lead capture failure and source reconciliation

### Coordination and scope
- Reviewed current staging commits through `3f5c6330989142bb06879cfea2fb03ba54fbb506`, sprint README, Hunter QA, Landowner QA, and Designer launch-readiness reports before editing. Latest hunter and owner active-chat request-order fixes are owned by QA; no overlap with those code paths.
- Inspected staging `listings.html` blob `e2ade4b00a7b6c5f47ac68f702791d4132294849` and `index.html` blob `f405fb4257ce568e8c5e884a98cbe295aa9a8c5c`. Source inspection only; no browser execution or real-user data.

### NEW P1 — listings modal silently loses lead-submission errors
- **FAIL (source):** In `listings.html`, the waitlist modal calls `fetch(WAITLIST_SCRIPT_URL + '?' + params.toString(), { method: 'GET', mode: 'no-cors' })`, catches errors with only `console.warn`, and **unconditionally** hides `waitlist-form-view` and shows `waitlist-success-view`. Thus even a network exception displays a success screen; opaque `no-cors` responses cannot verify application acceptance. Names, email and optional phone are also placed in URL query strings, creating unnecessary exposure through URL/request logging.
- **Owner: Designer/Developer** (public listings HTML); coordinate with previously flagged homepage updates-form issue. Recommend one response-verifiable, privacy-reviewed signup endpoint shared by both forms; send PII in a POST body over HTTPS, enforce validation/rate limiting, and show success only after explicit server acknowledgement. If endpoint not available, keep fields visible with accurate 'unable to confirm' status and retry path, not fabricated success. Do not log submitted PII or send it to analytics.
- **Acceptance checks:** Simulate rejected/timeout/offline endpoint and confirm no success view, no lost entered values, clear error and re-enabled button; simulate acknowledged success and confirm success only then; keyboard focus returns to modal error/status and screen-reader announcement is available; check no email/phone in URL. These are proposed tests, **NOT TESTED**.
- **Metrics:** consent-aware `updates_submit_attempt`, `updates_submit_confirmed`, `updates_submit_error` by page and device class only, never personal details. Estimate impact: reduces falsely counted leads and user confusion; conversion magnitude unknown without baseline.

### Reconciliation and release status
- Homepage `index.html` now visibly uses cautious 'Request sent, but signup could not be confirmed' language in two no-cors flows; previous homepage unconditional success finding should be **rechecked against the current DOM behavior**, not asserted unchanged. This does **not** make no-cors signup verifiable or remove the PII-in-URL concern.
- Listings SEO meta description still promises deer/hog/duck/bass inventory and daily/seasonal booking modes without verified inventory evidence; previously assigned to Designer, unchanged in source. Avoid a conflicting public-page edit.
- **This run:** documentation-only update, no app code or production change. **PASS** static source identification of listings failure path; **NOT TESTED** deployed HTML, browser/mobile, Stripe TEST, inventory or signup endpoint. **BLOCKED** authenticated E2E pending secure dedicated QA sessions. Independent Cloudflare deployment status **not verified**. Production release gate remains **NO-GO**.
