import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const NOTIFY_EMAIL = 'zachschmitt52@gmail.com';

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) return new Response('No record', { status: 200 });

    const email = record.email ?? 'unknown';
    const created = record.created_at ? new Date(record.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' }) : 'unknown';
    const meta = record.raw_user_meta_data ?? {};
    const role = meta.role ?? 'guest';
    const name = meta.full_name ?? meta.first_name ?? 'Unknown';
    const business = meta.business_name ?? '';

    const roleLabel = role === 'landowner' ? '🏡 Landowner' : role === 'outfitter' ? '🦌 Outfitter' : '🎯 Hunter/Guest';

    const subject = `New ${roleLabel} signup on LeaseWild — ${name}`;
    const body = `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
  <div style="background:#2d5a27;padding:18px 24px;border-radius:8px 8px 0 0">
    <h2 style="color:#fff;margin:0;font-size:18px">New Signup on LeaseWild</h2>
  </div>
  <div style="background:#f9f7f4;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e8e4de">
    <p style="margin:0 0 12px"><strong>Role:</strong> ${roleLabel}</p>
    <p style="margin:0 0 12px"><strong>Name:</strong> ${name}</p>
    ${business ? `<p style="margin:0 0 12px"><strong>Business:</strong> ${business}</p>` : ''}
    <p style="margin:0 0 12px"><strong>Email:</strong> ${email}</p>
    <p style="margin:0 0 12px"><strong>Signed up:</strong> ${created} ET</p>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e8e4de">
      <a href="https://supabase.com/dashboard/project/teohfzegpoxzimfsmviy/auth/users" style="background:#c17f3a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">View in Supabase →</a>
    </div>
  </div>
</div>`;

    // Send via Resend if key available, otherwise log
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LeaseWild <noreply@leasewild.com>',
          to: [NOTIFY_EMAIL],
          subject,
          html: body,
        }),
      });
    } else {
      console.log('New signup:', { email, role, name });
    }

    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('Error', { status: 500 });
  }
});
