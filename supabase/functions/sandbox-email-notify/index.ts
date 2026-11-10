// Sandbox-only transactional email worker. Do not deploy to production.
// Caller must be a trusted server-side booking/messaging handler, never the browser.
// Required secrets: LEASEWILD_NOTIFY_TOKEN, RESEND_API_KEY.
// Required configuration: verified RESEND_FROM_EMAIL and SANDBOX_EMAIL_ALLOWLIST.
// Requests are dry-run by default. Set SANDBOX_EMAIL_SEND_ENABLED=true only after domain verification.
const events = {
  booking_requested: { subject: 'New booking request', line: 'A hunter has requested a booking. Sign in to review it.' },
  booking_approved: { subject: 'Booking approved', line: 'Your booking request has been approved. Sign in for details.' },
  booking_declined: { subject: 'Booking declined', line: 'Your booking request was declined. Sign in for details.' },
  booking_cancelled: { subject: 'Booking cancelled', line: 'A booking has been cancelled. Sign in for details.' },
  booking_expired: { subject: 'Booking request expired', line: 'A booking request has expired. Sign in for details.' },
  message_received: { subject: 'New LeaseWild message', line: 'You have a new message. Sign in to read and reply.' },
} as const;
type EventName = keyof typeof events;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
});
function sameSecret(a: string, b: string): boolean {
  const aa = new TextEncoder().encode(a), bb = new TextEncoder().encode(b);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < Math.max(aa.length, bb.length); i++) diff |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}
Deno.serve(async req => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const token = Deno.env.get('LEASEWILD_NOTIFY_TOKEN') ?? '';
  if (!token || !sameSecret(req.headers.get('x-leasewild-notify-token') ?? '', token))
    return json({ error: 'Unauthorized' }, 401);
  let data: Record<string, unknown>;
  try { data = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  const event = String(data.event ?? '') as EventName;
  const to = String(data.to ?? '').trim().toLowerCase();
  const eventId = String(data.event_id ?? '');
  if (!(event in events) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) ||
      !/^[a-zA-Z0-9:_-]{8,160}$/.test(eventId))
    return json({ error: 'Invalid event, recipient, or event_id' }, 400);
  const allow = (Deno.env.get('SANDBOX_EMAIL_ALLOWLIST') ?? '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!allow.includes(to)) return json({ error: 'Recipient not allowed in sandbox' }, 403);
  const template = events[event];
  const enabled = Deno.env.get('SANDBOX_EMAIL_SEND_ENABLED') === 'true';
  if (!enabled) return json({ mode: 'dry_run', event, recipient_allowed: true, event_id: eventId });
  const key = Deno.env.get('RESEND_API_KEY') ?? '';
  const from = Deno.env.get('RESEND_FROM_EMAIL') ?? '';
  if (!key || !/^.+@.+\..+$/.test(from)) return json({ error: 'Email provider not configured' }, 503);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json',
      'Idempotency-Key': 'leasewild-sandbox-' + eventId },
    body: JSON.stringify({ from, to: [to], subject: '[LeaseWild Sandbox] ' + template.subject,
      text: template.line + '\n\nhttps://leasewild-sandbox.pages.dev/' })
  });
  if (!response.ok) {
    console.error('Sandbox notification provider failed', response.status);
    return json({ error: 'Delivery provider rejected request', provider_status: response.status }, 502);
  }
  const result = await response.json();
  return json({ mode: 'sent_to_provider', event, provider_id: result.id, event_id: eventId });
});
