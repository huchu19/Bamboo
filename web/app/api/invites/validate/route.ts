/**
 * POST /api/invites/validate
 *
 * Unauthenticated pre-check used by the register form *before* the Firebase
 * Auth account is created, so a bad code never leaves an orphaned account
 * behind. Validation is advisory — redemption (/api/invites/redeem) re-checks
 * everything inside a transaction.
 *
 * Body: { code: string }
 * Response: { valid: boolean, reason?: string }
 */

import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { normalizeInviteCode } from '@/lib/invites';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const code = normalizeInviteCode(body?.code);
  if (!code) {
    return Response.json({ valid: false, reason: 'Enter your invite code.' });
  }

  try {
    const snap = await getAdminDb().collection('invites').doc(code).get();
    if (!snap.exists) {
      return Response.json({ valid: false, reason: 'That invite code is not recognised.' });
    }

    const invite = snap.data()!;
    if ((invite.usedCount ?? 0) >= (invite.maxUses ?? 1)) {
      return Response.json({ valid: false, reason: 'That invite code has already been used.' });
    }

    return Response.json({ valid: true });
  } catch (err: any) {
    console.error('[invites/validate] Admin SDK error:', err?.message ?? err);
    return Response.json(
      { valid: false, reason: `Server error: ${err?.message ?? 'unknown'}` },
      { status: 500 },
    );
  }
}
