/**
 * POST /api/admin/pitch
 *
 * Admin moderation actions on a pitch in the review queue (Phase 8).
 *   { action: 'approve', pitchId }  → status 'live', publishedAt set
 *   { action: 'reject',  pitchId, reason? } → status 'rejected' and the $49
 *                                     listing fee is refunded via Stripe
 *
 * Auth: `Authorization: Bearer <firebase-id-token>` from a user whose Firestore
 * doc has role 'admin' (verified server-side via verifyAdmin). The Admin SDK
 * bypasses Firestore rules, so moderation never needs client-side rule access.
 *
 * GET /api/admin/pitch → the review queue (pitches with status 'pending_review').
 */

import { NextRequest } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { getAdminDb, verifyAdmin } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const uid = await verifyAdmin(request.headers.get('authorization'));
  if (!uid) {
    return Response.json({ error: 'Admin access required.' }, { status: 403 });
  }

  try {
    const snap = await getAdminDb()
      .collection('pitches')
      .where('status', '==', 'pending_review')
      .get();

    const pitches = snap.docs
      .map((d) => d.data())
      .sort((a, b) => (a.submittedForReviewAt ?? 0) - (b.submittedForReviewAt ?? 0));

    return Response.json({ pitches });
  } catch (err: any) {
    console.error('[admin/pitch] Queue read failed:', err?.message ?? err);
    return Response.json({ error: 'Could not load the review queue.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const uid = await verifyAdmin(request.headers.get('authorization'));
  if (!uid) {
    return Response.json({ error: 'Admin access required.' }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { action, pitchId, reason } = body ?? {};
  if (!pitchId || typeof pitchId !== 'string') {
    return Response.json({ error: 'pitchId is required.' }, { status: 400 });
  }
  if (action !== 'approve' && action !== 'reject') {
    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  const db = getAdminDb();
  const pitchRef = db.collection('pitches').doc(pitchId);
  const pitchSnap = await pitchRef.get();
  if (!pitchSnap.exists) {
    return Response.json({ error: 'Pitch not found.' }, { status: 404 });
  }
  const pitch = pitchSnap.data()!;
  if (pitch.status !== 'pending_review') {
    return Response.json(
      { error: `Pitch is '${pitch.status}', not awaiting review.` },
      { status: 409 },
    );
  }

  const now = Date.now();

  if (action === 'approve') {
    await pitchRef.update({
      status: 'live',
      publishedAt: now,
      reviewedAt: now,
      reviewedBy: uid,
      updatedAt: now,
    });
    return Response.json({ ok: true, status: 'live' });
  }

  // reject → mark rejected and refund the listing fee.
  let listingFeeRefunded = false;
  if (pitch.listingFeePaymentId && isStripeConfigured()) {
    try {
      await getStripe().refunds.create(
        { payment_intent: pitch.listingFeePaymentId },
        { idempotencyKey: `refund_${pitch.listingFeePaymentId}` },
      );
      listingFeeRefunded = true;
    } catch (err: any) {
      if (err?.code === 'charge_already_refunded') {
        listingFeeRefunded = true;
      } else {
        console.error(`[admin/pitch] Listing-fee refund failed for ${pitchId}:`, err);
        return Response.json(
          { error: 'Could not refund the listing fee. Pitch left in review.' },
          { status: 502 },
        );
      }
    }
  }

  await pitchRef.update({
    status: 'rejected',
    rejectionReason: typeof reason === 'string' ? reason.slice(0, 500) : null,
    listingFeePaid: !listingFeeRefunded,
    reviewedAt: now,
    reviewedBy: uid,
    updatedAt: now,
  });

  return Response.json({ ok: true, status: 'rejected', listingFeeRefunded });
}
