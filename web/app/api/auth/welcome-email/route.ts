/**
 * POST /api/auth/welcome-email
 *
 * Sends a welcome email to a new user after registration.
 * Called client-side right after registerUser() succeeds.
 *
 * Body: { email: string, displayName: string, role: 'investor' | 'inventor' }
 *
 * Requires env vars:
 *   RESEND_API_KEY      — from resend.com/api-keys
 *   RESEND_FROM_EMAIL   — your verified sender address, e.g. "Bamboo <hello@bamboo.app>"
 *
 * The route is a no-op (returns 200) when RESEND_API_KEY is unset so local
 * dev never fails and the feature activates as soon as you add the key.
 */

import { NextRequest } from 'next/server';
import 'server-only';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { email, displayName, role } = body ?? {};

  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'email is required.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? 'Bamboo <hello@bamboo.app>';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bamboo-xi-ebon.vercel.app';

  if (!apiKey) {
    // Not configured yet — silently skip without failing registration.
    return Response.json({ ok: true, skipped: true });
  }

  const name = typeof displayName === 'string' && displayName.trim() ? displayName.trim() : 'there';
  const isInventor = role === 'inventor';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to Bamboo</title></head>
<body style="margin:0;padding:0;background:#0c0a09;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#f5f0e8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <p style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#d4a843;font-family:monospace;margin:0 0 32px;">Bamboo · Welcome to the Grove</p>
      <h1 style="font-size:48px;font-weight:900;letter-spacing:-0.03em;text-transform:uppercase;margin:0 0 16px;line-height:1;">
        Welcome,<br/><span style="color:#d4a843;">${name}.</span>
      </h1>
      <p style="font-size:14px;color:rgba(245,240,232,0.7);line-height:1.6;margin:0 0 32px;">
        ${isInventor
          ? 'Your inventor account is ready. Start by planting your first pitch — a 60-second video is all it takes to reach accredited investors.'
          : 'Your investor account is ready. Browse live pitches from vetted founders and start building your portfolio.'
        }
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 40px;">
        <tr>
          <td style="background:#d4a843;border-radius:8px;">
            <a href="${siteUrl}/${isInventor ? 'pitch/new' : 'discover'}"
               style="display:block;padding:14px 32px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0c0a09;text-decoration:none;">
              ${isInventor ? 'Plant Your Pitch →' : 'Browse Pitches →'}
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size:11px;color:rgba(245,240,232,0.35);letter-spacing:0.1em;text-transform:uppercase;font-family:monospace;border-top:1px solid rgba(245,240,232,0.08);padding-top:24px;margin:0;">
        © Bamboo Asset Corp · <a href="${siteUrl}/terms" style="color:rgba(245,240,232,0.35);text-decoration:none;">Terms</a> · <a href="${siteUrl}/privacy" style="color:rgba(245,240,232,0.35);text-decoration:none;">Privacy</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: `Welcome to the grove, ${name} 🌿`,
      html,
    });

    if (error) {
      console.error('[welcome-email] Resend error:', error);
      return Response.json({ error: 'Email send failed.' }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('[welcome-email] Unexpected error:', err?.message ?? err);
    return Response.json({ error: 'Email send failed.' }, { status: 502 });
  }
}
