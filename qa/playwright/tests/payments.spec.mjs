import { test, expect } from '@playwright/test';

const origin = 'https://leasewild-sandbox.pages.dev';
const database = 'https://kbkdfpmlyggfijkyjxoi.supabase.co';
const stripeAccount = 'acct_1TOJ2rAO40Rp32aF';
// Verified in this sandbox through an independent, account-scoped Stripe connection.
const stripeAccountFixture = 'cs_test_a0NdkczfEBO5eOYzv49nVQP6UB7L7BS5cVZwCa4BpbgkOMYRL7bXrYVJXZ';
const checkoutOrigin = 'https://checkout.stripe.com';
const checkoutPath = /^\/[cg]\/pay\/(cs_test_[A-Za-z0-9]+)$/;
const previousListingId = '0a0b8819-ce6a-4cdb-a924-3b88dc899e1c';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cards = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficient_funds: '4000000000009995',
  three_ds: '4000002500003155',
};
const hunter = {
  email: 'zachschmitt32@gmail.com',
  id: '7d582821-90a3-49e6-84cf-8ee344d840f3',
  signupRole: 'guest',
  password: process.env.QA_PAYMENT_HUNTER_PASSWORD,
};
const owner = {
  email: 'roamquestlx@gmail.com',
  id: '7bdc7bf0-ad2d-436c-b4ad-425765ba9d48',
  password: process.env.QA_PAYMENT_OWNER_PASSWORD,
};
const stripeKey = process.env.QA_STRIPE_TEST_READ_KEY;
const publicKey = process.env.QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY;
const listingId = process.env.QA_PAYMENT_LISTING_ID?.toLowerCase();

test.use({ trace: 'off', screenshot: 'off', video: 'off', serviceWorkers: 'block' });
test.describe.configure({ retries: 0, timeout: 150_000 });

async function json(url, options, label) {
  let response;
  try {
    response = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new Error(label + ' request failed');
  }
  if (!response.ok) throw new Error(label + ' returned HTTP ' + response.status);
  try {
    return await response.json();
  } catch {
    throw new Error(label + ' returned invalid JSON');
  }
}

function stripe(path, label = 'Stripe test read') {
  return json('https://api.stripe.com/v1/' + path, {
    headers: { Authorization: 'Bearer ' + stripeKey },
  }, label);
}

async function authenticate(identity) {
  const session = await json(database + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: publicKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: identity.email, password: identity.password }),
  }, 'Synthetic account authentication');
  if (session.user?.id !== identity.id || session.user?.email !== identity.email ||
      session.user?.role !== 'authenticated' || !session.user?.email_confirmed_at || !session.access_token ||
      (identity.signupRole && session.user?.user_metadata?.role !== identity.signupRole)) {
    throw new Error('BLOCKED: unexpected synthetic account identity');
  }
  return { apikey: publicKey, Authorization: 'Bearer ' + session.access_token, Origin: origin, 'Content-Type': 'application/json' };
}

function bookingCall(headers, endpoint, body) {
  return json(database + '/functions/v1/sandbox-booking-' + endpoint, {
    method: 'POST', headers, body: JSON.stringify(body),
  }, 'Sandbox booking ' + endpoint + ' / ' + body.action);
}

async function preflight() {
  if ((process.env.QA_BASE_URL || origin).replace(/\/$/, '') !== origin) {
    throw new Error('BLOCKED: payment QA requires the canonical LeaseWild sandbox URL');
  }
  const missing = Object.entries({
    QA_PAYMENT_HUNTER_PASSWORD: hunter.password,
    QA_PAYMENT_OWNER_PASSWORD: owner.password,
    QA_STRIPE_TEST_READ_KEY: stripeKey,
    QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY: publicKey,
    QA_PAYMENT_LISTING_ID: listingId,
  }).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error('BLOCKED: missing ' + missing.join(', '));
  if (!/^rk_test_[A-Za-z0-9]+$/.test(stripeKey) || !/^sb_publishable_[\w-]+$/.test(publicKey)) {
    throw new Error('BLOCKED: a restricted Stripe TEST key and sandbox publishable key are required');
  }
  if (!uuid.test(listingId) || listingId === previousListingId) {
    throw new Error('BLOCKED: QA_PAYMENT_LISTING_ID must identify a new listing for the verified landowner');
  }
  // Retrieve the pinned session in the key's own account scope before booking.
  const fixture = await stripe('checkout/sessions/' + stripeAccountFixture, 'BLOCKED: Stripe Checkout Session identity read');
  if (fixture.id !== stripeAccountFixture || fixture.object !== 'checkout.session' ||
      fixture.livemode !== false || fixture.status !== 'expired' || fixture.payment_status !== 'unpaid' ||
      fixture.payment_intent !== null || fixture.metadata?.sandbox !== 'true') {
    throw new Error('BLOCKED: unexpected Stripe sandbox account fixture for ' + stripeAccount);
  }
  await Promise.all([
    stripe('payment_intents?limit=1', 'BLOCKED: Stripe Payment Intents read'),
    stripe('charges?limit=1', 'BLOCKED: Stripe Charges read'),
    stripe('events?limit=1', 'BLOCKED: Stripe Events read'),
    stripe('refunds?limit=1', 'BLOCKED: Stripe Refunds read'),
  ]);
  const [hunterHeaders, ownerHeaders] = await Promise.all([authenticate(hunter), authenticate(owner)]);
  const rows = await json(database + '/rest/v1/listings?id=eq.' + listingId + '&select=id,owner_id,email,status,description,price_per_day,cleaning_fee,min_stay', { headers: ownerHeaders }, 'Synthetic listing lookup');
  const listing = rows[0];
  if (rows.length !== 1 || listing.id !== listingId || listing.owner_id !== owner.id || listing.email !== owner.email ||
      listing.status !== 'active' || !/^QA ONLY\b/i.test(listing.description || '') ||
      Number(listing.price_per_day) !== 100 || Number(listing.cleaning_fee || 0) !== 0 || Number(listing.min_stay || 0) > 1) {
    throw new Error('BLOCKED: dedicated QA ONLY active synthetic listing with $100/night and no cleaning fee is required');
  }
  return { hunterHeaders, ownerHeaders };
}

async function verifiedCheckout(url, bookingId) {
  const checkout = new URL(url);
  const sessionId = checkoutPath.exec(checkout.pathname)?.[1];
  if (checkout.origin !== checkoutOrigin || checkout.username || checkout.password ||
      !sessionId) {
    throw new Error('BLOCKED: invalid Stripe TEST Checkout URL');
  }
  const session = await stripe('checkout/sessions/' + sessionId);
  if (session.id !== sessionId || session.livemode !== false || session.status !== 'open' ||
      session.payment_status !== 'unpaid' || session.payment_intent || session.url !== url ||
      session.metadata?.booking_id !== bookingId || session.metadata?.sandbox !== 'true' ||
      session.customer_email !== hunter.email || session.success_url?.split('?')[0] !== origin + '/guest-portal.html' ||
      session.cancel_url?.split('?')[0] !== origin + '/') {
    throw new Error('BLOCKED: Stripe did not verify the fresh sandbox booking and Checkout Session');
  }
  return session;
}

const stripeFrameOrigins = new Set([checkoutOrigin, 'https://js.stripe.com', 'https://hooks.stripe.com']);
const cardNumber = 'input[name="cardNumber"],input[autocomplete="cc-number"]';

function stripeFrames(page) {
  return page.frames().filter(frame => stripeFrameOrigins.has(new URL(frame.url() || 'about:blank').origin));
}

async function findCheckoutControl(page, locate, timeout, label) {
  let control;
  await expect.poll(async () => {
    for (const frame of stripeFrames(page)) {
      const candidate = locate(frame).filter({ visible: true }).first();
      if (await candidate.isVisible()) {
        control = candidate;
        return true;
      }
    }
    return false;
  }, { timeout, message: label }).toBe(true);
  return control;
}

async function enterCard(page, sessionId, card) {
  const url = new URL(page.url());
  if (url.origin !== checkoutOrigin || checkoutPath.exec(url.pathname)?.[1] !== sessionId || url.username || url.password) {
    throw new Error('BLOCKED: Checkout browser moved outside the verified TEST session');
  }
  const cardOption = frame => frame.getByRole('button', { name: /^card$/i });
  const ready = await findCheckoutControl(page, frame => frame.locator(cardNumber).or(cardOption(frame)), 25_000,
    'Stripe card form or payment method selector');
  if (await ready.evaluate(element => element.tagName !== 'INPUT')) await ready.click();
  const number = await findCheckoutControl(page, frame => frame.locator(cardNumber), 15_000, 'Stripe card number field');
  await number.fill(card);
  const field = selector => findCheckoutControl(page, frame => frame.locator(selector), 15_000, 'Stripe field ' + selector);
  await (await field('input[name="cardExpiry"],input[autocomplete="cc-exp"]')).fill('12' + String(new Date().getUTCFullYear() + 3).slice(-2));
  await (await field('input[name="cardCvc"],input[autocomplete="cc-csc"]')).fill('123');
  for (const frame of stripeFrames(page)) {
    const optional = selector => frame.locator(selector).filter({ visible: true }).first();
    const name = optional('input[name="billingName"],input[autocomplete="cc-name"]');
    if (await name.isVisible()) await name.fill('LeaseWild Synthetic QA');
    const country = optional('select[name="billingCountry"],select[autocomplete="country"]');
    if (await country.isVisible()) await country.selectOption('US');
    const zip = frame.getByRole('textbox', { name: /^(ZIP|postal) code$/i }).filter({ visible: true }).first();
    if (await zip.isVisible()) await zip.fill('32801');
    const save = frame.getByRole('checkbox', { name: 'Save my information for faster checkout' });
    if (await save.isVisible() && await save.isChecked()) await save.uncheck();
  }
  const submit = await findCheckoutControl(page, frame => frame.getByRole('button', { name: /^(?:pay|authorize)(?:\s+\$[\d.,]+)?$/i }),
    15_000, 'Stripe Checkout submit button');
  await submit.click();
}

async function authorize3ds(page) {
  // Stripe can also render its test challenge in a single frame.
  await expect.poll(async () => {
    for (const frame of page.frames()) {
      const button = frame.getByRole('button', { name: 'Complete authentication', exact: true });
      if (await button.count() && await button.first().isVisible() &&
          ['https://hooks.stripe.com', 'https://js.stripe.com'].includes(new URL(frame.url()).origin)) {
        await button.first().click();
        return true;
      }
    }
    return false;
  }, { timeout: 30_000 }).toBe(true);
}

async function waitForBooking(headers, bookingId, status) {
  let booking;
  await expect.poll(async () => {
    const result = await bookingCall(headers, 'approval', { action: 'hunter_list' });
    booking = result.bookings?.find(row => row.id === bookingId);
    return booking?.status;
  }, { timeout: 30_000 }).toBe(status);
  return booking;
}

async function reconcileAuthorization(headers, bookingId, sessionId) {
  const booking = await waitForBooking(headers, bookingId, 'pending_approval');
  const session = await stripe('checkout/sessions/' + sessionId);
  expect(session.status).toBe('complete');
  expect(session.payment_status).toBe('unpaid');
  expect(session.payment_intent).toMatch(/^pi_[A-Za-z0-9]+$/);
  const intent = await stripe('payment_intents/' + session.payment_intent);
  expect(intent.livemode).toBe(false);
  expect(intent.status).toBe('requires_capture');
  expect(intent.amount_received).toBe(0);
  expect(intent.amount_capturable).toBe(10_650);
  expect(Math.round(Number(booking.total) * 100)).toBe(10_650);
  return intent;
}

async function captureAndRefund(hunterHeaders, ownerHeaders, bookingId, intentId, evidence) {
  const capture = await bookingCall(ownerHeaders, 'approval', { action: 'approve', booking_id: bookingId });
  expect(capture.booking?.status).toBe('confirmed');
  await waitForBooking(hunterHeaders, bookingId, 'confirmed');
  const intent = await stripe('payment_intents/' + intentId + '?expand[]=latest_charge');
  expect(intent.livemode).toBe(false);
  expect(intent.status).toBe('succeeded');
  expect(intent.amount_received).toBe(10_650);
  expect(/^https:\/\/pay\.stripe\.com\/receipts\//.test(intent.latest_charge?.receipt_url || ''), 'Stripe receipt URL exists').toBe(true);
  evidence.chargeId = intent.latest_charge.id;
  const preview = await bookingCall(hunterHeaders, 'cancel', { action: 'preview', booking_id: bookingId });
  expect(preview.refund_type).toBe('full_refund');
  const cancel = await bookingCall(hunterHeaders, 'cancel', { action: 'cancel', booking_id: bookingId });
  expect(cancel.result).toBe('full_refund_issued');
  await waitForBooking(hunterHeaders, bookingId, 'cancelled');
  const refunds = await stripe('refunds?payment_intent=' + intentId);
  expect(refunds.data).toHaveLength(1);
  const refund = refunds.data[0];
  evidence.refundId = refund.id;
  expect(refund.livemode).toBe(false);
  expect(refund.status).toBe('succeeded');
  expect(refund.amount).toBe(10_650);
}

let credentials;
test.beforeAll(async () => {
  credentials = await preflight();
});

for (const scenario of ['success', 'declined', 'insufficient_funds', 'three_ds', 'retry']) {
  test(scenario + ' / real Stripe TEST card entry', async ({ page }, info) => {
    const { hunterHeaders, ownerHeaders } = credentials;
    const evidence = { scenario, stripeAccount };
    // Use a different future night per case, beyond the 72-hour refund cutoff.
    const day = 21 + ['success', 'declined', 'insufficient_funds', 'three_ds', 'retry'].indexOf(scenario);
    const date = offset => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
    const created = await bookingCall(hunterHeaders, 'checkout', {
      action: 'request', listing_id: listingId, check_in: date(day), check_out: date(day + 1),
      guests: 1, additional_guests: [], trip_protection: false,
    });
    if (!uuid.test(created.booking_id || '')) throw new Error('Sandbox checkout did not return a booking ID');
    const bookingId = evidence.bookingId = created.booking_id;
    let checkoutVerified = false;
    try {
      const session = await verifiedCheckout(created.url, bookingId);
      evidence.sessionId = session.id;
      checkoutVerified = true;
      await expect.poll(async () => (await bookingCall(hunterHeaders, 'approval', { action: 'hunter_list' })).bookings
        ?.some(row => row.id === bookingId && row.listing_id === listingId && row.status === 'authorization_pending')).toBe(true);
      expect(session.amount_total).toBe(10_650);
      expect(session.currency).toBe('usd');
      // Prevent top-level navigation to any other LeaseWild environment.
      await page.route('**/*', route => {
        const request = route.request();
        const target = new URL(request.url());
        if (request.isNavigationRequest() && request.frame() === page.mainFrame() &&
            ![origin, checkoutOrigin, 'https://hooks.stripe.com'].includes(target.origin)) return route.abort();
        return route.continue();
      });
      try {
        await page.goto(created.url, { waitUntil: 'domcontentloaded' });
      } catch {
        throw new Error('Verified Stripe TEST Checkout could not load in Chromium');
      }
      await enterCard(page, session.id, cards[scenario === 'retry' ? 'declined' : scenario]);
      if (['declined', 'insufficient_funds', 'retry'].includes(scenario)) {
        await findCheckoutControl(page, frame => frame.getByText(scenario === 'insufficient_funds' ? /insufficient funds/i : /card was declined/i),
          25_000, 'Stripe decline message');
        const unpaid = await stripe('checkout/sessions/' + session.id);
        expect(unpaid.status).toBe('open');
        expect(unpaid.payment_status).toBe('unpaid');
        if (unpaid.payment_intent) {
          expect(unpaid.payment_intent).toMatch(/^pi_[A-Za-z0-9]+$/);
          const failed = await stripe('payment_intents/' + unpaid.payment_intent);
          expect(failed.amount_received).toBe(0);
          expect(failed.amount_capturable).toBe(0);
          if (failed.last_payment_error) expect(failed.last_payment_error.decline_code)
            .toBe(scenario === 'insufficient_funds' ? 'insufficient_funds' : 'generic_decline');
        }
        await waitForBooking(hunterHeaders, bookingId, 'authorization_pending');
        if (scenario !== 'retry') return;
        await enterCard(page, session.id, cards.success);
      }
      if (scenario === 'three_ds') await authorize3ds(page);
      await expect.poll(() => {
        const url = new URL(page.url());
        return url.origin === origin && url.pathname === '/guest-portal.html' &&
          url.searchParams.get('authorization') === 'success' && url.searchParams.get('session_id') === session.id;
      }, { timeout: 45_000 }).toBe(true);
      const intent = await reconcileAuthorization(hunterHeaders, bookingId, session.id);
      evidence.paymentIntentId = intent.id;
      const events = await stripe('events?type=checkout.session.completed&limit=50');
      const event = events.data.find(event => event.livemode === false && event.data.object.id === session.id);
      expect(Boolean(event), 'Stripe TEST completion event for this session').toBe(true);
      evidence.webhookEventId = event.id;
      if (scenario === 'success') {
        await captureAndRefund(hunterHeaders, ownerHeaders, bookingId, intent.id, evidence);
      }
    } finally {
      try {
        if (checkoutVerified) {
          await bookingCall(hunterHeaders, 'cancel', { action: 'cancel', booking_id: bookingId });
          await waitForBooking(hunterHeaders, bookingId, 'cancelled');
          if (scenario === 'declined' || scenario === 'insufficient_funds') {
            const expired = await stripe('checkout/sessions/' + evidence.sessionId);
            expect(expired.status).toBe('expired');
            expect(expired.payment_status).toBe('unpaid');
          }
          if (evidence.paymentIntentId && scenario !== 'success') {
            const intent = await stripe('payment_intents/' + evidence.paymentIntentId);
            expect(intent.status).toBe('canceled');
            expect(intent.amount_received).toBe(0);
          }
        }
      } finally {
        await info.attach('payment-identifiers', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
      }
    }
  });
}

for (const name of ['receipt email delivery', '20% commission', 'connected-account transfer and payout readiness', 'partial refund']) {
  test(name, () => test.skip(true, 'BLOCKED: requires dedicated inbox or a supported Connect/partial-refund flow and its own reconciliation'));
}
