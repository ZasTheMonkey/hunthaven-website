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
  email: process.env.QA_PAYMENT_HUNTER_EMAIL,
  id: process.env.QA_PAYMENT_HUNTER_ID,
  signupRole: 'guest',
  password: process.env.QA_PAYMENT_HUNTER_PASSWORD,
};
const owner = {
  email: process.env.QA_PAYMENT_OWNER_EMAIL,
  id: process.env.QA_PAYMENT_OWNER_ID,
  password: process.env.QA_PAYMENT_OWNER_PASSWORD,
};
const connectFixture = {
  outfitterId: '0c9ed01e-8c96-4a35-b0db-a8ed34322e11',
  accountId: 'acct_1TOJMRAO408zPcFQ',
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

async function authenticate(identity, role) {
  const session = await json(database + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: publicKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: identity.email, password: identity.password }),
  }, 'Synthetic ' + role + ' authentication');
  if (session.user?.id !== identity.id || session.user?.email !== identity.email ||
      session.user?.role !== 'authenticated' || !session.user?.email_confirmed_at || !session.access_token ||
      session.user?.app_metadata?.qa_fixture !== 'leasewild-payment-browser' ||
      (identity.signupRole && session.user?.user_metadata?.role !== identity.signupRole)) {
    throw new Error('BLOCKED: unexpected synthetic ' + role + ' identity');
  }
  return { apikey: publicKey, Authorization: 'Bearer ' + session.access_token, Origin: origin, 'Content-Type': 'application/json' };
}

function bookingCall(headers, endpoint, body) {
  return json(database + '/functions/v1/sandbox-booking-' + endpoint, {
    method: 'POST', headers, body: JSON.stringify(body),
  }, 'Sandbox booking ' + endpoint + ' / ' + body.action);
}

function sandboxFunction(headers, name, body) {
  return json(database + '/functions/v1/' + name, {
    method: 'POST', headers, body: JSON.stringify(body),
  }, 'Sandbox function ' + name);
}

async function preflight() {
  if ((process.env.QA_BASE_URL || origin).replace(/\/$/, '') !== origin) {
    throw new Error('BLOCKED: payment QA requires the canonical LeaseWild sandbox URL');
  }
  const missing = Object.entries({
    QA_PAYMENT_HUNTER_EMAIL: hunter.email,
    QA_PAYMENT_HUNTER_ID: hunter.id,
    QA_PAYMENT_OWNER_EMAIL: owner.email,
    QA_PAYMENT_OWNER_ID: owner.id,
    QA_PAYMENT_HUNTER_PASSWORD: hunter.password,
    QA_PAYMENT_OWNER_PASSWORD: owner.password,
    QA_STRIPE_TEST_READ_KEY: stripeKey,
    QA_PAYMENT_SUPABASE_PUBLISHABLE_KEY: publicKey,
    QA_PAYMENT_LISTING_ID: listingId,
  }).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error('BLOCKED: missing ' + missing.join(', '));
  const fixtureEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const invalid = Object.entries({
    QA_PAYMENT_HUNTER_EMAIL: fixtureEmail.test(hunter.email),
    QA_PAYMENT_HUNTER_ID: uuid.test(hunter.id),
    QA_PAYMENT_OWNER_EMAIL: fixtureEmail.test(owner.email),
    QA_PAYMENT_OWNER_ID: uuid.test(owner.id),
  }).filter(([, valid]) => !valid).map(([name]) => name);
  if (invalid.length) throw new Error('BLOCKED: invalid fixture settings: ' + invalid.join(', '));
  if (hunter.id.toLowerCase() === owner.id.toLowerCase() || hunter.email.toLowerCase() === owner.email.toLowerCase()) {
    throw new Error('BLOCKED: hunter and owner fixture settings identify the same account');
  }
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
  const logins = await Promise.allSettled([authenticate(hunter, 'hunter'), authenticate(owner, 'landowner')]);
  const failures = logins.filter(login => login.status === 'rejected');
  if (failures.length) throw new Error(failures.map(login => login.reason.message).join(' | '));
  const [hunterHeaders, ownerHeaders] = logins.map(login => login.value);
  const rows = await json(database + '/rest/v1/listings?id=eq.' + listingId + '&select=id,owner_id,email,status,description,price_per_day,cleaning_fee,min_stay', { headers: ownerHeaders }, 'Synthetic listing lookup');
  const listing = rows[0];
  if (rows.length !== 1 || listing.id !== listingId || listing.owner_id !== owner.id || listing.email !== owner.email ||
      listing.status !== 'active' || !/^QA ONLY\b/i.test(listing.description || '') ||
      Number(listing.price_per_day) !== 100 || Number(listing.cleaning_fee || 0) !== 0 || Number(listing.min_stay || 0) > 1) {
    throw new Error('BLOCKED: dedicated QA ONLY active synthetic listing with $100/night and no cleaning fee is required');
  }
  const staleBookingIds = new Set(['f0204963-1c7b-4650-bb4e-89a44842dc38',
    '4e9c504c-79f4-44d7-8548-c255bdc7e45c', '7b8bc889-fe75-44fc-b9e3-3f235c219416',
    'c1e43c0d-65df-4333-b16f-b867dd01819e']);
  const { bookings } = await bookingCall(hunterHeaders, 'approval', { action: 'hunter_list' });
  for (const booking of bookings || []) {
    if (staleBookingIds.has(booking.id) && booking.listing_id === listingId &&
        ['authorization_pending', 'pending_approval'].includes(booking.status)) {
      await bookingCall(hunterHeaders, 'cancel', { action: 'cancel', booking_id: booking.id });
    }
  }
  const staleConnect = await json(database + '/rest/v1/outfitter_booking_requests?notes=eq.' +
    encodeURIComponent('AUTOMATED QA ONLY — disposable Stripe TEST Connect fixture') +
    '&status=eq.accepted&payment_status=eq.paid&select=id', { headers: hunterHeaders }, 'Stale Connect fixture lookup');
  for (const row of staleConnect) {
    await sandboxFunction(hunterHeaders, 'sandbox-outfitter-cancel', { action: 'cancel', booking_id: row.id });
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
      try {
        if (await candidate.isVisible()) {
          control = candidate;
          return true;
        }
      } catch (error) {
        if (!frame.isDetached() && !/frame was detached/i.test(error.message)) throw error;
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
  let ready;
  try {
    ready = await findCheckoutControl(page, frame => frame.locator(cardNumber).or(cardOption(frame)), 25_000,
      'Stripe card form or payment method selector');
  } catch (error) {
    // Bounded diagnostic: never log checkout URLs, session IDs, credentials or card data.
    const frames = [];
    for (const frame of stripeFrames(page)) {
      const location = new URL(frame.url() || 'about:blank');
      const headings = await frame.locator('h1,h2,[role="alert"]').allTextContents().catch(() => []);
      frames.push({ origin: location.origin, headings: headings.slice(0, 3).map(value => value.trim().slice(0, 120)) });
    }
    let sessionStatus = 'unavailable';
    try {
      const verified = await stripe('checkout/sessions/' + sessionId, 'Stripe TEST failure-state read');
      sessionStatus = verified.livemode === false ? verified.status : 'invalid_account_mode';
    } catch { sessionStatus = 'read_failed'; }
    console.log('STRIPE_TEST_WEBKIT_SAFE_DIAGNOSTIC', JSON.stringify({ frames, sessionStatus }));
    throw error;
  }
  if (await ready.evaluate(element => element.tagName !== 'INPUT')) await ready.click();
  const number = await findCheckoutControl(page, frame => frame.locator(cardNumber), 15_000, 'Stripe card number field');
  await number.fill('');
  await number.pressSequentially(card, { delay: 35 });
  await expect(number).toHaveValue(new RegExp('^' + card.match(/.{4}/g).join('\\s*') + '$'));
  await number.press('Tab');
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
  const confirms = request => request.method() === 'POST' &&
    new URL(request.url()).origin === 'https://api.stripe.com' &&
    new URL(request.url()).pathname.endsWith('/confirm');
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const sent = page.waitForEvent('request', { predicate: confirms, timeout: 8_000 }).catch(() => null);
    await submit.click();
    if (await sent) return;
  }
  throw new Error('Stripe Checkout did not send a confirmation request');
}

async function authorize3ds(page, evidence) {
  let challengeFrame;
  const complete = frame => frame.getByRole('button', { name: /^(?:Complete|Complete authentication)$/i });
  await expect.poll(async () => {
    for (const frame of page.frames()) {
      const target = new URL(frame.url() || 'about:blank');
      if (target.protocol !== 'https:' || !target.hostname.endsWith('.stripe.com')) continue;
      const challenge = frame.getByText(/This is a test 3D Secure/i);
      if (await challenge.first().isVisible() && await complete(frame).isVisible()) {
        challengeFrame = frame;
        return true;
      }
    }
    return false;
  }, { timeout: 30_000, message: 'Find the Stripe test challenge and its Complete button' }).toBe(true);
  const button = complete(challengeFrame);
  evidence.challengeFrameOrigin = new URL(challengeFrame.url()).origin;
  await button.focus();
  await button.press('Enter');
  evidence.challengeInteraction = 'keyboard_enter';
  await expect.poll(async () => challengeFrame.isDetached() || !(await button.isVisible()),
    { timeout: 30_000, message: 'Stripe test challenge closes after activating Complete' }).toBe(true);
  evidence.challengeClosed = true;
}

async function read3dsAuthorization(sessionId, evidence) {
  const session = await stripe('checkout/sessions/' + sessionId);
  evidence.checkoutStatus = session.status;
  if (!session.payment_intent) return;
  evidence.paymentIntentId = session.payment_intent;
  const intent = await stripe('payment_intents/' + session.payment_intent + '?expand[]=latest_charge');
  expect(intent.livemode).toBe(false);
  evidence.intentStatusBeforeCleanup = intent.status;
  evidence.threeDSResult = intent.latest_charge?.payment_method_details?.card?.three_d_secure?.result;
  return [session.status, intent.status, evidence.threeDSResult];
}

async function verify3dsAuthorization(sessionId, evidence) {
  await expect.poll(async () => {
    return read3dsAuthorization(sessionId, evidence);
  }, { timeout: 25_000, message: 'Stripe TEST reports completed Checkout and an authenticated, capturable 3DS payment' })
    .toEqual(['complete', 'requires_capture', 'authenticated']);
}

async function verify3dsWebhook(sessionId, evidence) {
  await expect.poll(async () => {
    const events = await stripe('events?type=checkout.session.completed&limit=50');
    const event = events.data.find(event => event.livemode === false && event.data.object.id === sessionId &&
      event.data.object.payment_intent === evidence.paymentIntentId);
    evidence.webhookEventId = event?.id;
    evidence.pendingWebhookDeliveries = event?.pending_webhooks;
    return Boolean(event) && event.pending_webhooks === 0;
  }, { timeout: 25_000, message: 'The matching Stripe TEST completion event has no pending deliveries' }).toBe(true);
}

async function waitForBooking(headers, bookingId, status, timeout = 30_000) {
  let booking;
  await expect.poll(async () => {
    const result = await bookingCall(headers, 'approval', { action: 'hunter_list' });
    booking = result.bookings?.find(row => row.id === bookingId);
    return booking?.status;
  }, { timeout }).toBe(status);
  return booking;
}

async function reconcileAuthorization(headers, bookingId, sessionId, { allowRecovery = true } = {}) {
  // 3DS completion can reach the signed webhook at the edge of the default
  // polling window. Preserve the state assertion, but allow webhook delivery
  // enough time before declaring a payment failure.
  let booking;
  try {
    booking = await waitForBooking(headers, bookingId, 'pending_approval', 30_000);
  } catch (error) {
    if (!allowRecovery) throw error;
    await expect.poll(async () => {
      const reconciled = await bookingCall(headers, 'reconcile', { booking_id: bookingId, session_id: sessionId });
      return reconciled.booking?.status;
    }, { timeout: 90_000, intervals: [2_000, 3_000, 5_000] }).toBe('pending_approval');
    booking = await waitForBooking(headers, bookingId, 'pending_approval');
  }
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

async function captureAndRefund(hunterHeaders, bookingId, intentId, evidence) {
  const ownerHeaders = await authenticate(owner, 'landowner');
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
  const cancel = async () => {
    const response = await fetch(database + '/functions/v1/sandbox-booking-cancel', {
      method: 'POST', headers: hunterHeaders, redirect: 'error', signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({ action: 'cancel', booking_id: bookingId }),
    });
    return { status: response.status, body: await response.json() };
  };
  const cancellations = await Promise.all([cancel(), cancel()]);
  evidence.concurrentRefundStatuses = cancellations.map(({ status }) => status);
  expect(cancellations.filter(({ status, body }) => status === 200 && body.result === 'full_refund_issued')).toHaveLength(1);
  for (const { status, body } of cancellations) {
    if (status === 409) expect(body.error).toMatch(/processing|progress|^Booking is being updated; refresh and try again$/i);
    else {
      expect(status).toBe(200);
      expect(body.already_cancelled === true || body.result === 'full_refund_issued').toBe(true);
    }
  }
  await waitForBooking(hunterHeaders, bookingId, 'cancelled');
  const retry = await bookingCall(hunterHeaders, 'cancel', { action: 'cancel', booking_id: bookingId });
  expect(retry).toMatchObject({ status: 'cancelled', already_cancelled: true });
  evidence.refundRetryAcknowledged = true;
  const refunds = await stripe('refunds?payment_intent=' + intentId);
  expect(refunds.data).toHaveLength(1);
  const refund = refunds.data[0];
  evidence.refundId = refund.id;
  expect(refund.id).toMatch(/^re_[A-Za-z0-9]+$/);
  // Restricted-key list responses can omit `livemode`; prove that this is the
  // refund created for the already verified TEST PaymentIntent and charge.
  expect(refund.payment_intent).toBe(intentId);
  expect(refund.charge).toBe(evidence.chargeId);
  expect(refund.status).toBe('succeeded');
  expect(refund.amount).toBe(10_650);
}

async function waitForGuestPortalReturn(page, sessionId) {
  try {
    await expect(page).toHaveURL(target => target.origin === origin &&
      target.pathname.replace(/\.html$/, '') === '/guest-portal' &&
      target.searchParams.get('session_id') === sessionId,
    { timeout: 30_000 });
  } catch {
    const target = new URL(page.url());
    throw new Error('Stripe TEST payment reconciled but hosted Checkout did not return to the sandbox guest portal; final page: ' +
      target.origin + target.pathname + '; session_id present: ' + target.searchParams.has('session_id'));
  }
}

let credentials;
test.beforeAll(async () => {
  credentials = await preflight();
});

async function openPaymentListing(page) {
  await page.goto(origin + '/#listings-section');
  const candidates = page.getByRole('button', { name: 'View Orange details', exact: true });
  // Sandbox inventory can contain other properties in the same county.
  await expect(candidates.first()).toBeVisible({ timeout: 20_000 });
  const modal = page.locator('#listing-detail-modal');
  let found = false;
  for (const candidate of await candidates.all()) {
    await candidate.click();
    if (await modal.getByText('QA ONLY — dedicated LeaseWild payment browser fixture', { exact: true }).isVisible()) {
      found = true;
      break;
    }
    await modal.getByRole('button', { name: 'Close listing details' }).click();
  }
  expect(found, 'Dedicated sandbox listing is visible in discovery').toBe(true);
  return modal;
}

async function checkHeldDateInCalendar(page, date) {
  const modal = await openPaymentListing(page);
  const input = modal.locator('#bk-checkin');
  await expect.poll(() => input.evaluate(element => Boolean(element._flatpickr))).toBe(true);
  await input.evaluate((element, value) => element._flatpickr.jumpToDate(value), date);
  await input.click();
  const label = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'UTC' }).format(new Date(date));
  const heldDay = page.locator('.flatpickr-calendar.open .flatpickr-day').filter({ visible: true })
    .and(page.locator('[aria-label=' + JSON.stringify(label) + ']'));
  await expect(heldDay).toHaveClass(/\bflatpickr-disabled\b/);
  await heldDay.click();
  await expect(input).toHaveValue('');
}

async function requestBookingFromListing(page, bookingRequest, hunterHeaders) {
  await page.goto(origin + '/guest-portal.html');
  await page.locator('#si-email').fill(hunter.email);
  await page.locator('#si-pass').fill(hunter.password);
  const loginResponse = page.waitForResponse(response =>
    response.url().startsWith(database + '/auth/v1/token?grant_type=password') && response.request().method() === 'POST');
  await page.locator('#si-btn').click();
  const login = await (await loginResponse).json();
  expect(login.user?.id).toBe(hunter.id);
  expect(Boolean(login.access_token), 'Hunter browser login has a session').toBe(true);
  hunterHeaders.Authorization = 'Bearer ' + login.access_token;
  await expect(page.locator('#dashboard')).toBeVisible({ timeout: 20_000 });
  const modal = await openPaymentListing(page);
  for (const [selector, date] of [['#bk-checkin', bookingRequest.check_in], ['#bk-checkout', bookingRequest.check_out]]) {
    const input = modal.locator(selector);
    await expect.poll(() => input.evaluate(element => Boolean(element._flatpickr))).toBe(true);
    await input.evaluate((element, value) => element._flatpickr.setDate(value, true), date);
    await expect(input).toHaveValue(date);
  }
  const response = page.waitForResponse(result =>
    result.url() === database + '/functions/v1/sandbox-booking-checkout' && result.request().method() === 'POST');
  await modal.locator('#bk-btn').click();
  const checkout = await response;
  expect(checkout.request().postDataJSON()).toMatchObject({ listing_id: listingId,
    check_in: bookingRequest.check_in, check_out: bookingRequest.check_out, guests: 1 });
  expect(checkout.ok(), 'Listing checkout request succeeded').toBe(true);
  return checkout.json();
}

const scenarios = ['success', 'declined', 'insufficient_funds', 'three_ds', 'retry', 'hunter_journey'];
for (const scenario of scenarios) {
  test(scenario + ' / real Stripe TEST card entry', async ({ page }, info) => {
    const hunterHeaders = await authenticate(hunter, 'hunter');
    const evidence = { scenario, stripeAccount };
    const mobileJourney = scenario === 'hunter_journey' && page.context().browser()?.browserType().name() === 'webkit';
    // Use a different future night per case, beyond the 72-hour refund cutoff.
    const day = 21 + scenarios.indexOf(scenario);
    const date = offset => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
    const requestKey = crypto.randomUUID();
    const bookingRequest = {
      action: 'request', request_key: requestKey, listing_id: listingId,
      check_in: date(day), check_out: date(day + 1),
      guests: 1, additional_guests: [], trip_protection: false,
    };
    const submitCheckout = () => fetch(database + '/functions/v1/sandbox-booking-checkout', {
      method: 'POST', headers: hunterHeaders, body: JSON.stringify(bookingRequest),
      redirect: 'error', signal: AbortSignal.timeout(15_000),
    }).then(async response => ({ status: response.status, body: await response.json() }));
    const attempts = scenario === 'success' ? await Promise.all([submitCheckout(), submitCheckout()]) : [];
    const created = scenario === 'hunter_journey' ? await requestBookingFromListing(page, bookingRequest, hunterHeaders)
      : attempts.length ? attempts.find(attempt => attempt.body.idempotent_replay === false)?.body
      : await bookingCall(hunterHeaders, 'checkout', bookingRequest);
    if (!uuid.test(created?.booking_id || '')) throw new Error('Sandbox checkout did not return a booking ID');
    expect(created.idempotent_replay).toBe(false);
    const bookingId = evidence.bookingId = created.booking_id;
    evidence.checkoutRequestKey = requestKey;
    const stripeResponses = [];
    page.on('response', response => {
      const request = response.request();
      const target = new URL(response.url());
      if (target.origin === 'https://api.stripe.com' && request.method() === 'POST') {
        const endpoint = target.pathname.endsWith('/confirm') ? 'confirm' : target.pathname.split('/')[2];
        if (['confirm', 'payment_methods', 'payment_pages', 'payment_intents', 'tokens'].includes(endpoint)) {
          stripeResponses.push({ endpoint, status: response.status() });
        }
      }
    });
    let checkoutVerified = false;
    try {
      const session = await verifiedCheckout(created.url, bookingId);
      evidence.sessionId = session.id;
      checkoutVerified = true;
      if (scenario === 'success') {
        expect(attempts.filter(attempt => attempt.body.idempotent_replay === false)).toHaveLength(1);
        for (const attempt of attempts) {
          if (attempt.status === 409) continue;
          expect(attempt.status).toBe(200);
          expect(attempt.body.booking_id).toBe(bookingId);
          expect(attempt.body.url).toBe(created.url);
        }
        evidence.concurrentCheckoutStatuses = attempts.map(attempt => attempt.status);
        const replay = await bookingCall(hunterHeaders, 'checkout', bookingRequest);
        expect(replay.booking_id).toBe(bookingId);
        expect(replay.url).toBe(created.url);
        expect(replay.idempotent_replay).toBe(true);
        evidence.duplicateSubmission = {
          sameKeyBookingId: replay.booking_id,
          sameKeySessionReused: replay.url === created.url,
        };
      }
      await expect.poll(async () => (await bookingCall(hunterHeaders, 'approval', { action: 'hunter_list' })).bookings
        ?.some(row => row.id === bookingId && row.listing_id === listingId && row.status === 'authorization_pending')).toBe(true);
      expect(session.amount_total).toBe(10_650);
      expect(session.currency).toBe('usd');
      // Prevent top-level navigation to any other LeaseWild environment.
      await page.route(url => ![origin, checkoutOrigin, 'https://hooks.stripe.com'].includes(url.origin), route => {
        const request = route.request();
        const target = new URL(request.url());
        if (request.isNavigationRequest() && request.frame() === page.mainFrame() &&
            ![origin, checkoutOrigin, 'https://hooks.stripe.com'].includes(target.origin)) return route.abort();
        return route.continue();
      });
      if (scenario === 'success') {
        const checkoutDocument = url => url.origin === checkoutOrigin && checkoutPath.exec(url.pathname)?.[1] === session.id;
        await page.route(checkoutDocument, route => route.abort('internetdisconnected'), { times: 1 });
        await expect(page.goto(created.url, { waitUntil: 'domcontentloaded' })).rejects.toThrow(/ERR_INTERNET_DISCONNECTED/);
        const interrupted = await stripe('checkout/sessions/' + session.id);
        expect(interrupted).toMatchObject({ status: 'open', payment_status: 'unpaid', payment_intent: null });
        const resumed = await bookingCall(hunterHeaders, 'checkout', bookingRequest);
        expect(resumed).toMatchObject({ booking_id: bookingId, url: created.url, idempotent_replay: true });
        evidence.interruptedCheckoutResumed = true;
      }
      try {
        if (mobileJourney) {
          await page.waitForURL(url => url.origin === checkoutOrigin && checkoutPath.exec(url.pathname)?.[1] === session.id,
            { waitUntil: 'domcontentloaded' });
        } else {
          await page.goto(created.url, { waitUntil: 'domcontentloaded' });
        }
      } catch {
        throw new Error('Verified Stripe TEST Checkout could not load in the browser');
      }
      // Capture redacted hosted-checkout diagnostics only when the card UI fails to appear.
      // Do not log Checkout URLs, session tokens, cookies, request bodies or payment details.
      const checkoutFailures = [];
      const checkoutErrors = [];
      const onRequestFailed = request => {
        const url = new URL(request.url());
        checkoutFailures.push({ origin: url.origin, resource: request.resourceType(),
          failure: request.failure()?.errorText?.slice(0, 120) || 'unknown' });
      };
      const onPageError = error => checkoutErrors.push({ kind: 'pageerror', name: error.name });
      const onConsole = message => {
        if (message.type() === 'error') checkoutErrors.push({ kind: 'console', locationOrigin:
          (() => { try { return new URL(message.location().url).origin; } catch { return 'unknown'; } })() });
      };
      page.on('requestfailed', onRequestFailed);
      page.on('pageerror', onPageError);
      page.on('console', onConsole);
      try {
        await enterCard(page, session.id, cards[scenario === 'retry' ? 'declined' : scenario === 'hunter_journey' ? 'success' : scenario]);
      } catch (error) {
        const currentSession = await stripe('checkout/sessions/' + session.id).catch(() => null);
        const diagnostic = {
          browser: test.info().project.name, scenario, errorName: error.name,
          checkoutPageOrigin: new URL(page.url()).origin,
          visibleHostedError: await page.getByText('Something went wrong', { exact: true }).isVisible().catch(() => false),
          frameOrigins: [...new Set(page.frames().map(frame => {
            try { return new URL(frame.url()).origin; } catch { return 'unknown'; }
          }))],
          sessionStatus: currentSession?.status || 'unavailable',
          sessionPaymentStatus: currentSession?.payment_status || 'unavailable',
          sessionExpired: currentSession?.expires_at ? currentSession.expires_at <= Math.floor(Date.now() / 1000) : null,
          requestFailures: checkoutFailures.slice(-20), browserErrors: checkoutErrors.slice(-20),
        };
        await test.info().attach('stripe-checkout-redacted-diagnostic', {
          body: JSON.stringify(diagnostic, null, 2), contentType: 'application/json',
        });
        throw error;
      } finally {
        page.off('requestfailed', onRequestFailed);
        page.off('pageerror', onPageError);
        page.off('console', onConsole);
      }
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
      if (scenario === 'three_ds') {
        await authorize3ds(page, evidence);
        await verify3dsAuthorization(session.id, evidence);
        await verify3dsWebhook(session.id, evidence);
      }
      // A recovery call could advance the booking independently of the webhook.
      const intent = await reconcileAuthorization(hunterHeaders, bookingId, session.id, {
        allowRecovery: scenario !== 'three_ds',
      });
      evidence.paymentIntentId = intent.id;
      if (scenario === 'success') {
        const competing = await fetch(database + '/functions/v1/sandbox-booking-checkout', {
          method: 'POST', headers: hunterHeaders,
          body: JSON.stringify({ ...bookingRequest, request_key: crypto.randomUUID() }),
        });
        const competingBody = await competing.json();
        // Capture response and visible booking state before asserting; HTTP 200 alone
        // does not prove that a second eligible reservation exists.
        evidence.duplicateSubmission.differentKeyResponse = {
          httpStatus: competing.status,
          bookingId: competingBody?.booking_id ?? null,
          reservationStatus: competingBody?.status ?? competingBody?.booking?.status ?? null,
          error: competingBody?.error ?? null,
          idempotentReplay: competingBody?.idempotent_replay ?? null,
        };
        const competingRows = await bookingCall(hunterHeaders, 'approval', { action: 'hunter_list' });
        evidence.duplicateSubmission.differentKeyBookingRow = competingRows.bookings?.find(
          row => row.id === competingBody?.booking_id
        )?.status ?? null;
        await info.attach('competing-booking-diagnostic', {
          body: JSON.stringify(evidence.duplicateSubmission, null, 2),
          contentType: 'application/json',
        });
        expect(competing.status).toBe(409);
        expect(competingBody.error).toBe('Dates are unavailable');
        evidence.duplicateSubmission.differentKeyStatusAfterAuthorization = competing.status;
      }
      const events = await stripe('events?type=checkout.session.completed&limit=50');
      const event = events.data.find(event => event.livemode === false && event.data.object.id === session.id);
      expect(Boolean(event), 'Stripe TEST completion event for this session').toBe(true);
      evidence.webhookEventId = event.id;
      await waitForGuestPortalReturn(page, session.id);
      if (scenario === 'hunter_journey') {
        const booking = page.locator('.booking-card').filter({ has: page.locator('a[href="cancel.html?id=' + bookingId + '"]') });
        await expect(booking).toContainText('Awaiting landowner approval');
        await page.reload();
        await expect(booking).toContainText('Awaiting landowner approval');
        await checkHeldDateInCalendar(page, bookingRequest.check_in);
        evidence.heldDateDisabledInHunterCalendar = true;
      }
      if (scenario === 'hunter_journey') Object.assign(hunterHeaders, await authenticate(hunter, 'hunter'));
      if (['success', 'hunter_journey'].includes(scenario)) {
        await captureAndRefund(hunterHeaders, bookingId, intent.id, evidence);
      }
    } catch (error) {
      if (scenario === 'three_ds' && checkoutVerified) {
        await read3dsAuthorization(evidence.sessionId, evidence).catch(() => {
          evidence.stripeDiagnosticUnavailable = true;
        });
      }
      throw error;
    } finally {
      try {
        if (checkoutVerified) {
          if (scenario === 'hunter_journey') Object.assign(hunterHeaders, await authenticate(hunter, 'hunter'));
          const { bookings } = await bookingCall(hunterHeaders, 'approval', { action: 'hunter_list' });
          const booking = bookings?.find(row => row.id === bookingId);
          evidence.bookingStatusBeforeCleanup ??= booking?.status;
          if (booking?.status !== 'cancelled') {
            await bookingCall(hunterHeaders, 'cancel', { action: 'cancel', booking_id: bookingId });
          }
          await waitForBooking(hunterHeaders, bookingId, 'cancelled');
          if (scenario === 'declined' || scenario === 'insufficient_funds') {
            const expired = await stripe('checkout/sessions/' + evidence.sessionId);
            expect(expired.status).toBe('expired');
            expect(expired.payment_status).toBe('unpaid');
          }
          if (evidence.paymentIntentId) {
            const intent = await stripe('payment_intents/' + evidence.paymentIntentId);
            if (['success', 'hunter_journey'].includes(scenario)) {
              // Capture followed by a full refund leaves the PaymentIntent succeeded;
              // refund state is represented by the Refund/Charge, not by canceling the intent.
              expect(intent.status).toBe('succeeded');
              expect(intent.amount_received).toBe(10_650);
              expect(evidence.refundId).toMatch(/^re_[A-Za-z0-9]+$/);
            } else {
              expect(intent.status).toBe('canceled');
              expect(intent.amount_received).toBe(0);
            }
          }
        }
      } finally {
        console.log('Stripe sandbox payment responses', JSON.stringify(stripeResponses));
        await info.attach('payment-identifiers', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
      }
    }
  });
}

test('20% commission and connected-account transfer / real Stripe TEST card entry', async ({ page }, info) => {
  const hunterHeaders = await authenticate(hunter, 'hunter');
  const tripDate = new Date(Date.now() + 45 * 86_400_000).toISOString().slice(0, 10);
  let requestId;
  const evidence = { scenario: 'outfitter_connect_20_percent', stripeAccount, connectedAccountId: connectFixture.accountId };

  try {
  // The helper authorizes the server-marked sandbox guest identity, then activates only the exact synthetic listing.
  const created = await sandboxFunction(hunterHeaders, 'sandbox-outfitter-qa-fixture', { action: 'create', trip_date: tripDate });
  requestId = created.fixture?.id;
  if (!uuid.test(requestId || '')) throw new Error('Disposable Connect QA fixture was not created');
  evidence.requestId = requestId;

  const checkout = await sandboxFunction(hunterHeaders, 'sandbox-outfitter-checkout', { request_id: requestId });
  expect(checkout.request_id).toBe(requestId);
  expect(checkout.amount_cents).toBe(20_000);
  expect(checkout.platform_fee_cents).toBe(4_000);
  expect(checkout.currency).toBe('usd');
  expect(checkout.platform_only_test).toBe(false);
  const verified = new URL(checkout.url);
  const sessionId = checkoutPath.exec(verified.pathname)?.[1];
  expect(verified.origin).toBe(checkoutOrigin);
  expect(sessionId).toMatch(/^cs_test_[A-Za-z0-9]+$/);
  evidence.sessionId = sessionId;

  const sessionBefore = await stripe('checkout/sessions/' + sessionId);
  expect(sessionBefore.livemode).toBe(false);
  expect(sessionBefore.amount_total).toBe(20_000);
  expect(sessionBefore.metadata?.outfitter_booking_request_id).toBe(requestId);
  expect(sessionBefore.metadata?.platform_only_test).toBe('false');

  await page.route('**/*', route => {
    const request = route.request();
    const target = new URL(request.url());
    if (request.isNavigationRequest() && request.frame() === page.mainFrame() &&
        ![origin, checkoutOrigin, 'https://hooks.stripe.com'].includes(target.origin)) return route.abort();
    return route.continue();
  });
  await page.goto(checkout.url, { waitUntil: 'domcontentloaded' });
  await enterCard(page, sessionId, cards.success);
  await expect(page).toHaveURL(target => target.origin === origin &&
    target.pathname.replace(/\.html$/, '') === '/outfitter-pay' &&
    target.searchParams.get('session_id') === sessionId, { timeout: 45_000 });

  let row;
  await expect.poll(async () => {
    const rows = await json(database + '/rest/v1/outfitter_booking_requests?id=eq.' + requestId +
      '&select=id,outfitter_id,hunter_id,status,payment_status,amount_cents,stripe_payment_intent_id',
    { headers: hunterHeaders }, 'Outfitter payment reconciliation');
    row = rows[0];
    return row?.payment_status;
  }, { timeout: 60_000 }).toBe('paid');
  expect(row.outfitter_id).toBe(connectFixture.outfitterId);
  expect(row.hunter_id).toBe(hunter.id);
  expect(row.status).toBe('accepted');
  expect(row.amount_cents).toBe(20_000);

  const session = await stripe('checkout/sessions/' + sessionId);
  evidence.paymentIntentId = session.payment_intent;
  let intent;
  await expect.poll(async () => {
    intent = await stripe('payment_intents/' + session.payment_intent + '?expand[]=latest_charge');
    return {
      status: intent.status,
      amount: intent.amount_received,
      fee: intent.application_fee_amount,
      destination: intent.transfer_data?.destination,
      applicationFeeReady: /^fee_[A-Za-z0-9]+$/.test(intent.latest_charge?.application_fee || ''),
      transferReady: /^tr_[A-Za-z0-9]+$/.test(intent.latest_charge?.transfer || ''),
    };
  }, { timeout: 30_000 }).toEqual({
    status: 'succeeded', amount: 20_000, fee: 4_000, destination: connectFixture.accountId,
    applicationFeeReady: true, transferReady: true,
  });
  expect(intent.livemode).toBe(false);
  expect(intent.latest_charge?.application_fee).toMatch(/^fee_[A-Za-z0-9]+$/);
  expect(intent.latest_charge?.transfer).toMatch(/^tr_[A-Za-z0-9]+$/);
  evidence.applicationFeeId = intent.latest_charge.application_fee;
  evidence.transferId = intent.latest_charge.transfer;
  evidence.chargeId = intent.latest_charge.id;

  const preview = await sandboxFunction(hunterHeaders, 'sandbox-outfitter-cancel', { action: 'preview', booking_id: requestId });
  expect(preview.refund_type).toBe('full_refund');
  const cancelled = await sandboxFunction(hunterHeaders, 'sandbox-outfitter-cancel', { action: 'cancel', booking_id: requestId });
  expect(cancelled.result).toBe('full_refund_issued');
  await expect.poll(async () => {
    const rows = await json(database + '/rest/v1/outfitter_booking_requests?id=eq.' + requestId +
      '&select=status,payment_status', { headers: hunterHeaders }, 'Outfitter cancellation reconciliation');
    return rows[0]?.status + '/' + rows[0]?.payment_status;
  }, { timeout: 30_000 }).toBe('cancelled/refunded');
  const refunds = await stripe('refunds?payment_intent=' + intent.id);
  expect(refunds.data).toHaveLength(1);
  expect(refunds.data[0].amount).toBe(20_000);
  expect(refunds.data[0].status).toBe('succeeded');
  evidence.refundId = refunds.data[0].id;
  } finally {
    try {
      if (requestId) {
        const rows = await json(database + '/rest/v1/outfitter_booking_requests?id=eq.' + requestId +
          '&select=status,payment_status', { headers: hunterHeaders }, 'Outfitter test cleanup');
        if (rows[0]?.status === 'accepted' && rows[0]?.payment_status === 'paid') {
          await sandboxFunction(hunterHeaders, 'sandbox-outfitter-cancel', { action: 'cancel', booking_id: requestId });
        }
      }
    } finally {
      const cleanup = await sandboxFunction(hunterHeaders, 'sandbox-outfitter-qa-fixture', { action: 'cleanup' });
      evidence.fixtureCleanup = cleanup;
      await info.attach('connect-payment-identifiers', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
      expect(cleanup.listing_status).toBe('inactive');
      expect(cleanup.unsettled_paid_fixtures).toBe(0);
    }
  }
});

for (const name of ['receipt email delivery', 'connected-account bank payout readiness', 'partial refund']) {
  test(name, () => test.skip(true, 'BLOCKED: requires dedicated inbox or a supported Connect/partial-refund flow and its own reconciliation'));
}
