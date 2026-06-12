/**
 * GET  /api/admin/pitch?status=pending_review  → review queue
 * GET  /api/admin/pitch?status=reported        → reported pitches
 * POST /api/admin/pitch
 *   { action: 'approve',        pitchId }          → status 'live'
 *   { action: 'reject',         pitchId, reason? } → status 'rejected' + listing-fee refund
 *   { action: 'dismiss_report', pitchId }          → clears reportCount, status stays 'live'
 *
 * Auth: Bearer Firebase ID-token from a user whose Firestore doc has role 'admin'.
 */

import { NextRequest } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { getAdminDb, verifyAdmin } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const uid = await verifyAdmin(request.headers.get('authorization'));
  if (!uid) return Response.json({ error: 'Admin access required.' }, { status: 403 });

  const status = request.nextUrl.searchParams.get('status') ?? 'pending_review';
  const ALLOWED_STATUSES = ['pending_review', 'reported'];
  const BADGE_FILTER = status === 'pending_badge_review';

  if (!ALLOWED_STATUSES.includes(status) && !BADGE_FILTER) {
    return Response.json({ error: 'Unknown status filter.' }, { status: 400 });
  }

  try {
    // Badge applications are a sub-field, not a top-level status — query differently.
    const snap = BADGE_FILTER
      ? await getAdminDb().collection('pitches').where('verifiedBadgeStatus', '==', 'pending_badge_review').get()
      : await getAdminDb().collection('pitches').where('status', '==', status).get();

    const pitches = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (a.submittedForReviewAt ?? a.createdAt ?? 0) - (b.submittedForReviewAt ?? b.createdAt ?? 0));

    return Response.json({ pitches });
  } catch (err: any) {
    console.error('[admin/pitch] Queue read failed:', err?.message ?? err);
    return Response.json({ error: 'Could not load the queue.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const uid = await verifyAdmin(request.headers.get('authorization'));
  if (!uid) return Response.json({ error: 'Admin access required.' }, { status: 403 });

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
  if (!['approve', 'reject', 'dismiss_report', 'approve_badge'].includes(action)) {
    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  const db = getAdminDb();
  const pitchRef = db.collection('pitches').doc(pitchId);
  const pitchSnap = await pitchRef.get();
  if (!pitchSnap.exists) return Response.json({ error: 'Pitch not found.' }, { status: 404 });
  const pitch = pitchSnap.data()!;
  const now = Date.now();

  if (action === 'approve') {
    if (pitch.status !== 'pending_review') {
      return Response.json({ error: `Pitch is '${pitch.status}', not awaiting review.` }, { status: 409 });
    }
    await pitchRef.update({ status: 'live', publishedAt: now, reviewedAt: now, reviewedBy: uid, updatedAt: now });
    return Response.json({ ok: true, status: 'live' });
  }

  if (action === 'dismiss_report') {
    await pitchRef.update({
      status: 'live',
      reportCount: 0,
      reportReasons: [],
      reportedAt: null,
      reviewedAt: now,
      reviewedBy: uid,
      updatedAt: now,
    });
    return Response.json({ ok: true, status: 'live' });
  }

  if (action === 'approve_badge') {
    if (pitch.verifiedBadgeStatus !== 'pending_badge_review') {
      return Response.json({ error: 'No pending badge application for this pitch.' }, { status: 409 });
    }
    await pitchRef.update({
      isVerified: true,
      verifiedBadgeStatus: 'approved',
      verifiedBadgeApprovedAt: now,
      verifiedBadgeApprovedBy: uid,
      updatedAt: now,
    });
    return Response.json({ ok: true, isVerified: true });
  }

  // reject — works on both pending_review and reported pitches
  if (pitch.status !== 'pending_review' && pitch.status !== 'reported' && pitch.status !== 'live') {
    return Response.json({ error: `Cannot reject a pitch with status '${pitch.status}'.` }, { status: 409 });
  }

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
        return Response.json({ error: 'Could not refund the listing fee. Pitch left in queue.' }, { status: 502 });
      }
    }
  }

  await pitchRef.update({
    status: 'rejected',
    rejectionReason: typeof reason === 'string' && reason.length > 0 ? reason.slice(0, 500) : null,
    listingFeePaid: !listingFeeRefunded,
    reviewedAt: now,
    reviewedBy: uid,
    updatedAt: now,
  });

  return Response.json({ ok: true, status: 'rejected', listingFeeRefunded });
}
