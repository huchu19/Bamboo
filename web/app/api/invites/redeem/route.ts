/**
 * POST /api/invites/redeem
 *
 * Consumes one use of an invite code for the authenticated caller and writes
 * the inviteRedemptions/{uid} marker. Runs in a transaction so concurrent
 * signups can't oversubscribe a code. Idempotent: a uid that already
 * redeemed (any code) gets ok back without consuming another use, so a
 * retried registration flow never burns a second seat.
 *
 * Auth: `Authorization: Bearer <firebase-id-token>`
 * Body: { code: string }
 */

import { NextRequest } from 'next/server';
import { getAdminDb, verifyBearerToken } from '@/lib/firebase/admin';
import { normalizeInviteCode } from '@/lib/invites';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const uid = await verifyBearerToken(request.headers.get('authorization'));
  if (!uid) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const code = normalizeInviteCode(body?.code);
  if (!code) {
    return Response.json({ error: 'A valid invite code is required.' }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    await db.runTransaction(async (tx) => {
      const redemptionRef = db.collection('inviteRedemptions').doc(uid);
      if ((await tx.get(redemptionRef)).exists) return; // already redeemed

      const inviteRef = db.collection('invites').doc(code);
      const inviteSnap = await tx.get(inviteRef);
      if (!inviteSnap.exists) {
        throw new RedeemError('That invite code is not recognised.');
      }
      const invite = inviteSnap.data()!;
      if ((invite.usedCount ?? 0) >= (invite.maxUses ?? 1)) {
        throw new RedeemError('That invite code has already been used.');
      }

      tx.update(inviteRef, {
        usedCount: (invite.usedCount ?? 0) + 1,
        usedBy: [...(invite.usedBy ?? []), uid],
      });
      tx.set(redemptionRef, { code, redeemedAt: Date.now() });
    });
  } catch (err: any) {
    if (err instanceof RedeemError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    console.error('[invites/redeem] Transaction failed:', err);
    return Response.json({ error: 'Could not redeem the invite. Try again.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}

class RedeemError extends Error {}
