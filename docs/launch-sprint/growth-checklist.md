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


## 2026-11-10 02:12 ET — Reconciliation: listings P1 resolved fail-closed, conversion follow-up

- Reviewed latest staging commits through `1d83886a69ba6f9d68edb3858dfaca350c621836`, Hunter QA, Landowner QA, and Designer launch-readiness handoffs before this documentation update. Designer's `53cc99375e7b1fa7f040987bd50ec2e5f7a662ed` replaced the previously reported listings form's PII-bearing GET/no-cors submission and false success with an explicit unavailable/error state; neutralized unsupported species and booking-mode metadata. **Reclassify both prior findings as source-fixed, not outstanding unchanged defects.** Current listings source blob `33fa8dcb0a643c5a73d86f23ecd0b5a7d739255a` confirms neutral meta description and the no-send error text. This pass did not modify application code.
- **NEW P1 conversion tradeoff (not a security regression):** Listings updates signup is intentionally disabled while no response-verifiable, consent-reviewed endpoint exists. That is safer than misleading success, but visitors cannot subscribe through this form. Designer/Developer should either (a) provide a vetted HTTPS POST endpoint with explicit server acknowledgment, spam protection, minimal data collection, privacy/retention review and success/error/timeout states, or (b) remove/replace the prominent signup CTA with a functional browse-listings action until subscriptions are operational. Never reinstate opaque no-cors transport or query-string PII. Acceptance: failed/offline submission preserves input and never reports success; acknowledged test submission succeeds once; keyboard focus and screen reader status work at mobile widths. **Tests proposed, not run.** KPI: updates CTA clicks → verified subscriptions; avoid treating attempts as leads. Expected effect: fewer dead-end conversion paths, magnitude unknown.
- **Cross-page premium UX:** Make real listing browsing the primary conversion path on mobile; show actual availability and rules only from verified listing data, maintain restrained premium imagery and clear no-results states. Recent listing-card hardening commit `1d83886a69ba6f9d68edb3858dfaca350c621836` belongs to Designer; do not edit its markup concurrently. Before declaring premium-ready, require 320/375/390/430px browser screenshots, keyboard/touch, 200% zoom, and real-listing checkout journey with dedicated secure QA sessions.
- **Evidence / release:** Static GitHub inspection PASS. Previous Designer report cites Cloudflare deployment of `53cc9937` and 1363px browser smoke, but this run did **not** independently confirm current deployed SHA; public sandbox URL fetch was inaccessible from the web tool. Current latest commit `1d83886a` deployment **UNVERIFIED**. Authenticated E2E **BLOCKED**. Stripe TEST, mobile, and browser form submission **NOT TESTED**. Production **NO-GO**; no production/main/live systems touched.


## 2026-11-10 03:40 ET — Growth reconciliation: dead listings signup removed

### Coordination reviewed
- Read latest `hunter-qa.md`, `landowner-qa.md`, `launch-readiness.md`, and recent staging commits before this update. Hunter draft isolation code `31e1f340da59575cfa03a0bb89eeb646163a9d3b` and report `2145643a43f6913bf7fbb77c7bcb22fd14e51af4`; landowner error announcements `d184658ada76cc9aec352d128e39ba1a4863f704`. These belong to other owners; no changes to messaging or auth.
- Designer implemented the previously recommended **working CTA instead of disabled signup** on `listings.html` at `cd7c4393fa22231c7bfcb07e12a43d5abb054a14`. Designer's readiness report documents exact-SHA script compilation, a 1363px public browser smoke (three database-backed cards, no horizontal overflow), and Cloudflare deployment `dcf8b405-2a63-45da-aa67-eb9accd819d5` success for that code commit. **These are Designer-reported checks, not independently reproduced in this growth run.**
- Re-read current staging `listings.html` head: restrained, factual title/description and canonical remain present. Do not reopen the removed signup issue without new evidence.

### Revised priorities and acceptance criteria
1. **P1 / inventory-to-booking funnel (Designer + Hunter QA):** verify every live public listing has a truthful primary action and can navigate to details with availability, rules, total price and booking initiation; distinguish browseable from actually bookable inventory. At 320/375/390px, test filter, list-card tap target, sticky controls, loading/empty/error and 200% zoom. Measure `listing_view / listings_view` and `booking_start / listing_view` without PII. Current public smoke only at 1363px; no conversion baseline established.
2. **P1 / first-listing search discovery (Growth + Designer):** test whether St. Johns River can be found from homepage and listings search using its approved location/activity fields. Do not hard-code property IDs, claim specific species, or create thin county pages without approved inventory. Record click path and count; user-confirmed production booking availability is **not** proof of sandbox authenticated checkout.
3. **P1 / landowner acquisition:** now that dead signup is gone, use functioning `List your property` route as conversion path. Confirm mobile CTA destination, sign-up error handling, and publish-state guidance. Track `landowner_onboarding_start` and `listing_publish` only after privacy/consent review.
4. **P1 / trust clarity:** before claims of verification, insurance, wildlife, acreage or refund guarantees, obtain evidence from relevant owner/legal reviewer. Price transparency must match Stripe TEST calculation, not inferred from 80/20 proceeds split.
5. **P2 / premium differentiation:** prioritize original approved property photography, consistent typography/spacing across browse/detail/owner portal, explicit empty and loading states, and accessible keyboard/touch navigation. Benchmark competitors by actual UX patterns, not invented price or Florida inventory numbers. Hypothesized conversion benefit; magnitude unknown until analytics.

### This run's verification and release status
- **Changed:** checklist documentation only. **Application code:** unchanged.
- **Static inspection:** current staging listings metadata verified; other findings from cross-bot reports are attributed, not re-tested.
- **Deployment:** no independent Cloudflare or public sandbox deployment check in this run; do not infer latest HEAD is deployed from Designer's earlier exact-commit evidence.
- **Browser/mobile/Stripe TEST/authenticated E2E:** not executed here. Authenticated E2E blocked without securely provisioned QA sessions. **NO-GO** production pending payment, security, legal, responsive and end-to-end evidence. No production, main, live Stripe, production Supabase, personal sessions or real-user access.


## 2026-11-10 04:22 ET — Growth handoff: messaging trust and conversion instrumentation

### Cross-bot evidence checked
- Hunter QA: code commit `04c1604f115788062a60ce5f43d5b8edc4cd6901` adds accessible message-load errors; report commit `c16ed37636243fb06389dc24ad110b37d6e8d37d`. Source-only, no independent browser test or confirmed deployment for this exact commit.
- Landowner QA: code commit `92b7cc2fb381d178aa93cc81f5e1a2c314b38aa8` isolates drafts per conversation; reported Cloudflare active deployment for that SHA, but no authenticated browser validation. Report commit `4fe3be3c0a0cc7c3235fa2bbac7b0903d3ee7378`.
- Designer launch-readiness report still records NO-GO and 1363px listings smoke for earlier code commit `cd7c4393`; this is not evidence for the latest branch head or mobile widths.

### New prioritized growth recommendations (no code changes)
1. **P1 — messaging confidence before booking (Designer + both QA):** distinguish empty conversation from network/load failure in the same restrained, accessible visual system; show an explicit Retry control, preserve unsent drafts across thread switches, and never imply delivery until server acknowledgement. Acceptance: keyboard and 320/375/390px states, offline/error/retry behavior, and synthetic cross-thread switching test with *two distinct* conversations. Rationale: misleading chat status can interrupt high-intent inquiries; conversion uplift is a hypothesis, not measured.
2. **P1 — privacy-safe funnel measurement (Growth + Developer):** define event names `listings_view`, `listing_view`, `booking_start`, `booking_confirmed_test`, `landowner_onboarding_start` with anonymous aggregate counts and environment tag; never log chat contents, personal data, access coordinates, or payment tokens. Count confirmed bookings only from authoritative server-side Stripe TEST/booking state, not a client-side success screen. Acceptance: documented event definitions, deduplication, opt-out/consent review and TEST-only validation before implementation. No analytics installation authorized by this note.
3. **P2 — premium listing detail trust hierarchy (Designer):** place authentic approved property imagery, location granularity, activity/rules, date availability, cancellation policy and clearly itemized TEST total in a consistent mobile-first order. Avoid badges for unverified land ownership, insurance or wildlife. Acceptance: one real synthetic listing at 320/375/390px and 200% zoom; no fake inventory; compare details-to-booking tap path against current baseline before making conversion claims.

### Verification boundaries
GitHub report/source evidence only; sandbox public URL could not be fetched independently in this run. No deployment assertion for current HEAD, no browser/mobile/authenticated E2E or Stripe TEST execution. Production remains **NO-GO**. Do not touch production, `main`, real-user data or live payments.


## 2026-11-10 05:11 ET — Growth handoff: accessible discovery feedback and catalog privacy

### Coordination and evidence
- Read latest staging commits through `e443e4fe268d8c381934cd6c1562f966d8df8807`, Hunter QA, Landowner QA, and Designer launch-readiness reports before editing. Hunter's latest draft-isolation code is `beec180fc5651e8f4c070821dfa0e7756e2e888e`; authenticated messaging remains untested.
- Re-fetched staging `listings.html`: public Supabase catalog now explicitly selects presentation fields instead of `*`, matching Designer's documented privacy-minimization fix `20be480945856fd3a8b9a85e80d61f27f024f2ec`. This is **request-field minimization**, not proof that direct API reads cannot expose sensitive columns; server-side RLS/view grants need separate testing.
- Static search of current `listings.html` found a dynamic `#listings-loading` region but **no literal `aria-live` attribute**. This does not establish a screen-reader failure; rendered announcements and focus behavior require browser/assistive-technology testing.

### Prioritized implementable actions
1. **P1 / accessible results feedback (Designer + QA):** provide a stable, visually restrained results-status element using `role=status` / `aria-live=polite` for loading-complete, result-count, no-match, and retry outcomes. Keep status concise; do not announce every card. On network failure show a distinguishable error and keyboard-operable Retry, not an empty-results message. Acceptance: source assertions for status transitions, keyboard and screen-reader smoke at 320/375/390px and 200% zoom; record actual screenshots/announcements before marking PASS. Impact: accessibility and search confidence hypothesized; no conversion uplift measured. Effort: S–M.
2. **P1 / catalog security contract (Designer + Legal + QA):** before expanding fields, define a public read-only catalog view with approved presentation columns, explicit authorization for sensitive owner/location/zone data, and negative anonymous API tests. Do not rely on frontend field selection for confidentiality. Acceptance: synthetic sandbox-only tests prove denied reads of owner contact, exact parcel address, and access-zone geometry. Effort: M–L; potential impact high (privacy/security), not measured.
3. **P2 / discoverability measurement (Growth):** with synthetic test listings only, record successful filter/search-to-card discovery and `listing_view/listings_view` by device width; segment zero-result searches without storing raw personally identifying queries. Only publish location landing pages for verified, authorized inventory. Effort: S–M; no SEO or conversion lift assumed.

### Independent deployment and release boundary
- Public sandbox `https://leasewild-sandbox.pages.dev/listings.html` fetch was attempted in this run and returned an inaccessible-tool error. **No independent public deployment verification** and no browser or mobile runtime test. Earlier Designer report verifies Cloudflare deployment metadata/browser at an earlier exact SHA, not current HEAD.
- This update is documentation-only; no application, payments, database, production, or `main` changes. Authenticated E2E blocked without secure synthetic QA sessions. **Production NO-GO**.


## 2026-11-10 07:48 ET — Growth discovery handoff: feature entry points and evidence reconciliation

### Coordination and source inspected
- Re-read current Hunter QA, Landowner QA, Designer launch-readiness, and sprint README. Landowner QA now documents **sandbox-applied** access-zone and hunter-review schema and a private eligibility function with simulated-role negative checks. The Designer's 06:25 report predates these changes and says migration unapplied; **do not repeat that stale status**. Actual positive authenticated flows and moderation remain unverified.
- Re-fetched staging `listings.html` (blob `670a30f40c0fcb3a5d9c33fc1e39029185996973`), `sandbox-zone-editor.html` (blob `1b72ff58502018266e33c1964b7383d585777298`), and `sandbox-hunter-review.html` (blob `7c3358f517661bc036e2e022aec13a3a315b3e16`). Listings contains `#listings-status` with `role="status" aria-live="polite"`; the prior missing-live-region source issue is **resolved in source**, but screen-reader runtime remains untested. The two feature pages exist in source, not evidence of end-to-end use.
- Hunter QA reports independent Cloudflare Pages deployment metadata for `b45bf43b9457c2493ee901404ed1f0621a2ec895` at 2026-11-10 12:18:17Z, deployment `d91faaaf-9ee9-4f43-9943-14c8d51275f9`. This is **other bot's evidence**, not independent verification of current branch head or of the feature pages.

### Prioritized growth / product actions
1. **P1 — make owner map feature discoverable only after safe authorization (Designer + Landowner QA; effort M):** `sandbox-zone-editor.html` is a standalone editor and is not linked from public `listings.html`; verify a legitimate owner-only entry point in the listing-management UI, with correct listing UUID, an explicit 'Manage hunting boundaries / entry / parking' affordance, save/reload confirmation, and an owner-only permission error. Do not expose private exact entry/parking geometry on public catalog cards or SEO pages. **Acceptance:** two distinct synthetic owners; correct owner can open, draw, save, reload, edit and delete zones; wrong owner/anonymous denied by server RLS; 320/375/390/430px touch map and 200% zoom. KPI: share of eligible owners who save a valid zone; failure rate. No uplift estimated.
2. **P1 — completed-booking review conversion integrity (Landowner QA + Designer; effort M):** review form exists and owner reservation link is reported, but only server-verified completed and paid bookings should show enabled review action. Distinguish ineligible, already reviewed, pending moderation, and published states; avoid displaying unpublished reviews as social proof. **Acceptance:** synthetic completed vs canceled/refunded/other-owner bookings, one review per eligible booking, pending-only submission, explicit rejection feedback, keyboard/touch and 200% zoom. KPI: eligible booking-to-review completion and rejection rate. Do not invent testimonials.
3. **P1 — retain real inventory-first discovery (Growth + Designer; effort S):** listing filter source now uses real listing fields and a polite live status. Confirm the public St. Johns River listing in actual sandbox response before any location landing page or species claim. Ensure empty search and failed fetch are distinct, with keyboard-operable retry. Record 320–2560px screenshots and search→detail→booking-start funnel with synthetic TEST checkout only. KPI: listing impressions→detail views→booking starts; segment by viewport without PII.
4. **P2 — SEO/privacy (Growth + Legal; effort S-M):** keep private hunting boundaries, access coordinates, owner identity and parking locations out of indexable HTML, JSON-LD, sitemaps and analytics. Public snippets must describe verified available activities only; map zones are private operational instructions, not SEO keywords.

### Verification / status
- **PASS (source inspection):** current listings live-region markup, feature-page presence, and reconciliation of Landowner QA schema claims.
- **NOT TESTED:** live inventory API response, rendered page, screen reader, 320–2560px responsive matrix, owner zone save/reload, review submission, messaging and Stripe TEST.
- **BLOCKED:** authenticated positive and cross-owner browser E2E until dedicated secure synthetic sessions are provisioned. Existing simulated-role negative SQL checks do not substitute for browser tests.
- **DEPLOYMENT:** independent public sandbox fetch attempted and unavailable via web tool; current branch-head deployment **not independently verified** this run. No app code or migrations changed by Growth. **NO-GO** for production. No production, main, live Stripe, production Supabase, real users or personal sessions touched.


## 2026-11-10 08:48 ET — Mobile landowner map conversion review (Growth)

**Coordination:** Read current Hunter QA, Landowner QA, launch-readiness, and the actual `sandbox-zone-editor.html` source. Landowner QA reports three persisted synthetic access-zone fixtures and a rolled-back simulated cross-owner UPDATE denial; these are database-only evidence, not iPhone browser verification. No overlapping application edit by Growth.

**P1 — map → edit listing continuity:** User-supplied iPhone screenshots show Edit Listing → Open access map, then a return path previously reaching the portal login rather than restoring the same Edit Listing modal. Staging commits `9a522b0f`, `31f0b891`, `d956b81a` now propagate `editListing` and invoke `openEditModal` after `showDashboard`. **Acceptance:** signed-in synthetic owner opens listing A, draws/saves zone, taps in-page Back, sees listing A's edit modal (not auth); repeat after Safari reload and session expiry, where login must not be bypassed. Preserve unsaved form changes or explicitly warn before navigating (current edit form values are not preserved across full navigation). **Status:** PASS source wiring; NOT TESTED on actual device/browser.

**P1 — prevent silent loss of drawn zones:** User observed a prior zone disappearing when drawing another. Staging `efa1c7ce` added in-memory pending zone layers; these are **not persisted** and are cleared on page navigation/reload. Add an explicit unsaved-drafts warning, clear distinction between "Keep draft" and "Save zone", and a safe save-all/individual save path with server validation. Do not imply unsaved areas survive return navigation. **Acceptance:** two drawn areas remain visible, saving one preserves the other, reload shows only persisted zones, canceled gesture does not destroy previous draft. **Status:** source inspected; mobile E2E NOT TESTED.

**P1 — map affordance and classification:** Amber hunting polygon, blue parking marker, green entry marker and purple trail preview are in staging source (`e3a935bc`). Trail persistence is intentionally disabled because current schema permits only hunting_area/entry/parking; avoid marketing trail functionality as saved. Prefer color **plus** visible text/icon, contrast and distinct shapes for color-blind accessibility; provide an on-map legend near drawing controls. **Acceptance:** 320/375/390/430px and 200% zoom; VoiceOver names marker type; touch targets >=44 CSS px; saved geometry has correct category and color after reload. **Status:** PASS source classification; NOT TESTED rendering/assistive tech.

**P1 — fix observed static defects before broad launch:** Hunter QA flagged pointercancel treated as successful pointerup and save button re-enabled with empty draft; current editor source still contains `mapEl.addEventListener('pointercancel',endTrace)` and `save.disabled=false` at the end of save. Recommend Developer change cancellation to preserve existing draft and call `renderDraft()` in finally, with synthetic browser regression. Also confirm the current editor's map layer initialization and Leaflet load order. **Status:** FAIL static; runtime not tested.

**SEO/privacy:** Keep this owner-only map `noindex`; never expose exact private entry, parking, trails or hunting polygons in public listing structured data, sitemaps, analytics payloads or anonymous responses. No fake listings, user reviews or conversion statistics.

**Deployment:** This Growth pass did not independently verify current Cloudflare commit/HTML (other bots' older metadata does not prove current HEAD). **NOT TESTED:** 320–2560px browser matrix, keyboard/VoiceOver, booking/payment/messaging. **BLOCKED:** positive authenticated E2E requires securely provisioned synthetic owner/hunter sessions. Production/main/live Stripe/production Supabase untouched. **NO-GO** remains.


## 2026-11-10 09:24 ET — Growth mobile map reliability fixes

- **PASS (GitHub source):** Corrected map editor's post-save `save.disabled=false` override so `renderDraft()` determines button state after successful save clears the draft. Commit `a6ac5da0b41295222a07abcbb54b16aa736bf755`.
- **PASS (GitHub source):** Separated `pointercancel` from `pointerup`: canceled touch strokes are discarded rather than incorrectly finalized; previously retained other draft zones remain. Commit `6afbd6c26d499f6d3426339136a196004ef8a316`.
- **PASS (Cloudflare API metadata):** Deployment for `6afbd6c` exists (`0997c6cf-90a1-4a43-851e-255c981f908a`, created 2026-11-10 14:23:47 UTC), but stage was **initialize/active** when checked; previous `a6ac5da` deployment was **deploy/active**. **NOT YET PASS:** final deployment success or deployed HTML/browser behavior.
- **NOT TESTED:** iPhone pointercancel/pointerup runtime, save/reload, 320–2560px, keyboard, zoom, booking/messaging/Stripe TEST. **BLOCKED:** authenticated positive cross-role E2E without securely provisioned synthetic browser sessions.
- **Follow-up:** Designer/Hunter QA should confirm deployment success and run touch cancel/save-button regression. Do not treat these source-level fixes as mobile E2E evidence. Live site, main, production Supabase and live Stripe untouched.

## 2026-11-10 09:57 ET — Mobile listing-discovery conversion

- **FAIL (source before fix):** Homepage mobile bottom tab labeled `Updates` invoked `openWaitlist()`, diverting users away from the live listing catalog despite booking availability. This was a mobile conversion dead-end rather than a discovery CTA.
- **PASS (source change):** Replaced only that mobile tab with `Browse`, scrolling to the existing `#listings-section` instead of opening the waitlist. Commit `58d745d429b5b2a4e63dadd865e61bd8bf5d84a4` on staging. No booking, payment, messaging, or database logic changed.
- **PASS (inventory integrity):** No fabricated properties, availability, reviews, or metrics introduced. Existing catalog remains the source of listing truth.
- **NOT TESTED:** Actual mobile browser navigation, 320–2560 px viewport matrix, accessibility/VoiceOver, Cloudflare deployed HTML, authenticated listing/booking conversion, Stripe TEST regression. Source-level fix alone is not E2E evidence.
- **Next for Designer/Hunter QA:** Check bottom nav label/tap target, verify listings section appears with actual sandbox inventory and empty-state behavior, confirm scroll offset under sticky headers, and verify current Cloudflare deployment independently. Do not alter production/main.


## 2026-11-10 — Priority 1: multiple hunting-boundary save workflow
- Implemented **Save all hunting drafts** in `sandbox-zone-editor.html` on staging (`5e30b979`, follow-up correction `cfed30de`). Kept individual Save zone and existing owner authorization. Drafts now retain their labels/instructions when kept; sequential saves stop on the first error and retain remaining unsaved drawings; browser warns on navigation with unsaved work. No database migration or payment change.
- **PASS:** GitHub accepted both source commits; source logic inspected.
- **NOT TESTED:** authenticated browser save/reload, partial-failure handling, touch drawing, viewport matrix, actual deployed HTML, Stripe TEST and messaging. Do not claim database persistence from source inspection.
- **Known limitations:** Unsaved drafts remain in-memory only; browser unload warnings vary on iOS Safari; no automatic restore after reload. Trail saving remains preview-only. Save All applies to hunting polygons, not parking/entry points.
- **QA next:** Synthetic owner draws two named polygons, Save All, reload and verify two persisted zones; induce second insert failure and verify only unsaved drafts remain; test navigation warning, owner B access denial, Safari touch and 320–2560px layouts.
- **Release:** NO-GO pending verified E2E. Production/main/live payments untouched.


## 2026-11-10 — Trail/entry/parking user-reported defect follow-up
- **PASS (sandbox DB):** Confirmed Supabase project `kbkdfpmlyggfijkyjxoi` is `leasewild-payment-testing`; applied migration `allow_owner_trail_linestring_zones` to permit `trail` and valid 2–100 point GeoJSON LineString, retaining owner RLS and existing Polygon/Point constraints. Re-read constraints after migration.
- **PASS (staging source):** Commit `38576dda02b35a10b730318004aacb1f4749628b` enables trail save geometry and minimum-two-point validation; clarifies Entry/Parking tap-to-place point workflow and zone-type guidance. No payment or booking code touched.
- **NOT TESTED:** Cloudflare deployment success, authenticated save/reload for trail, entry, parking, mobile touch/keyboard, cross-owner denial, and viewport matrix. Source/database constraint checks alone do not establish successful browser save.
- **QA handoff:** Landowner QA should save and reload a trail, one entry point and one parking point with synthetic owner; Hunter QA should verify no unauthorized access; Designer should verify touch gestures and Cloudflare deployment. No production/main/live resources touched.


## 2026-11-10 — Mobile map editor visual redesign
- **PASS (GitHub source):** `f31d66dafdaa7a629f37e5bdcd088a15fe5e3d80` updates the owner map editor with satellite-first mobile layout (map above form at <=740px), compact property-map header, premium forest-green styling, accessible-sized controls, grouped action/save buttons, better visual hierarchy and legend. Existing map drawing, saved-zone, authorization and payment code preserved.
- **NOT TESTED:** deployed Cloudflare HTML, actual iPhone Safari screenshots/touch, 320–2560px viewport matrix, VoiceOver, 200% zoom, authenticated zone save/reload. Source-level CSS presence is not responsive E2E evidence.
- **Next:** Designer/Hunter/Landowner QA visually inspect map at 320/375/390/430/768/1024/1280/1440/1920/2560 widths; verify controls are usable with keyboard and touch and no overflow; check satellite imagery attribution and tile loading.


## 2026-11-10 — $100K-quality transformation audit and first increment

Scope: staging branch and sandbox only. This is a quality target, not a spending authorization. Review of actual GitHub tree and shared QA notes, not a claim of comprehensive browser testing.

### Top 10 prioritized release improvements
| Rank | Severity | Workstream | Evidence / acceptance |
|---|---|---|---|
| 1 | P0 | Authenticated synthetic hunter/owner E2E | Positive/negative RLS, login, bookings, messaging, map save/reload, review eligibility |
| 2 | P0 | Stripe TEST booking lifecycle | Checkout, duplicate prevention, webhook, cancellation/refund, 80/20 accounting |
| 3 | P0 | Owner access-zone privacy and integrity | RLS cross-owner denial, trails, entry/parking, valid geometries, multi-zone save/reload |
| 4 | P0 | Messaging delivery and lifecycle | Cross-role send/receive, unread indicators, expiration and failure recovery |
| 5 | P0 | Legal/trust gate | Florida counsel review, waivers, property authority verification, privacy and insurance disclosures |
| 6 | P1 | Mobile-first design consistency | Unified components across homepage, listing, booking, dashboards and map |
| 7 | P1 | Discovery-to-booking conversion | Real inventory, search filters, truthful availability and clear fee disclosures |
| 8 | P1 | Owner reviews of hunters | Completed-paid-booking eligibility, moderation, duplicate prevention and reporting |
| 9 | P1 | Accessibility and responsiveness | 320/375/390/430/768/1024/1280/1440/1920/2560px, keyboard, touch, 200% zoom, VoiceOver |
| 10 | P1 | SEO, media and performance | Real metadata, image alt/loading, Core Web Vitals and no private geodata leakage |

### First incremental fix — booking photo rendering
- **PASS source commit:** `57c9b77069062a7d9eb06d216a46daf4bbde23e9` in `booking.js`: reject unsafe/non-HTTPS image URLs before embedding in HTML, escape ampersands, add descriptive ordinal alt text and lazy/async image loading, explicitly set booking action button type. This reduces malformed photo injection risk and improves accessibility; no payment calculations or endpoints changed.
- **PASS source re-fetch:** Verified updated image and button markup on staging.
- **NOT TESTED:** Browser rendering, photo URLs from actual listings, checkout behavior, Lighthouse/Core Web Vitals, Cloudflare deployment and cross-role E2E.
- **Coordination:** Designer to consolidate visual tokens and booking-card layout; Hunter QA to test gallery and checkout; Landowner QA to verify uploaded image formats/URLs; Legal to review photo privacy. Keep this separate from their concurrently edited map editor.
- **Release:** NO-GO. No live/main/production Supabase/live Stripe changes.


## 2026-11-10 — Continue: booking video hardening
- **PASS (source):** commit `473f359dbe3fa7da118c8319d0924b3a0a890a9e` validates listing video URLs as HTTPS before insertion into generated markup, escapes ampersands, sets `preload=metadata` and `playsinline` for mobile. Existing booking/payment actions untouched.
- **PASS (source re-fetch):** confirmed video guard, preload, and inline playback attributes in staging.
- **NOT TESTED:** real browser playback, owner-uploaded video formats, checkout, Cloudflare deployment, mobile E2E. Treat as incremental security/mobile enhancement, not release-ready.
- **Follow-up:** Audit all other unescaped listing fields and URLs in `booking.js`, including textual descriptions and dynamically generated HTML; prefer DOM textContent/validated attributes over concatenation.
