/**
 * POST /api/pitch/cancel
 *
 * Inventor cancels their own pitch: the pitch is closed (immediately
 * invisible to discovery, which only lists `live`) and every completed
 * investment is refunded through Stripe.
 *
 * Division of labour matches the rest of the payment stack:
 *   - this route authenticates the caller, closes the pitch, and *creates*
 *     the Stripe refunds (idempotency-keyed on the PaymentIntent id);
 *   - the webhook's `charge.refunded` handler is the source of truth for
 *     fulfilment — it marks investments `refunded` and rolls back pitch
 *     counters. Refunds issued manually from the Stripe dashboard flow
 *     through the exact same path.
 *
 * Auth: `Authorization: Bearer <firebase-id-token>`; the caller must be the
 * pitch's inventor.
 *
 * Body: { pitchId: string }
 */

import { NextRequest } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { getAdminDb, verifyBearerToken } from '@/lib/firebase/admin';

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

  const { pitchId } = body ?? {};
  if (!pitchId || typeof pitchId !== 'string') {
    return Response.json({ error: 'pitchId is required.' }, { status: 400 });
  }

  const db = getAdminDb();
  const pitchRef = db.collection('pitches').doc(pitchId);
  const pitchSnap = await pitchRef.get();
  if (!pitchSnap.exists) {
    return Response.json({ error: 'Pitch not found.' }, { status: 404 });
  }
  const pitch = pitchSnap.data()!;
  if (pitch.inventorId !== uid) {
    return Response.json({ error: 'Only the pitch owner can cancel it.' }, { status: 403 });
  }
  if (pitch.status === 'closed') {
    return Response.json({ error: 'Pitch is already closed.' }, { status: 409 });
  }

  // Close first so no new investments start while refunds are in flight.
  await pitchRef.update({ status: 'closed', closedAt: Date.now(), updatedAt: Date.now() });

  const invSnap = await db.collection('investments').where('pitchId', '==', pitchId).get();
  const toRefund = invSnap.docs
    .map((d) => d.data())
    .filter((inv) => inv.status === 'completed');

  let refundsCreated = 0;
  const failures: string[] = [];

  for (const inv of toRefund) {
    if (inv.stripePaymentIntentId && isStripeConfigured()) {
      try {
        // Idempotency-keyed on the PaymentIntent: retrying a partially-failed
        // cancellation never double-refunds anyone.
        await getStripe().refunds.create(
          { payment_intent: inv.stripePaymentIntentId },
          { idempotencyKey: `refund_${inv.stripePaymentIntentId}` },
        );
        refundsCreated += 1;
      } catch (err: any) {
        // `charge_already_refunded` means a previous attempt got through.
        if (err?.code === 'charge_already_refunded') {
          refundsCreated += 1;
        } else {
          console.error(`[pitch/cancel] Refund failed for ${inv.id}:`, err);
          failures.push(inv.id);
        }
      }
    } else {
      // Legacy/demo records with no money behind them — mark refunded directly.
      const now = Date.now();
      await db.collection('investments').doc(inv.id).update({
        status: 'refunded',
        refundedAt: now,
        updatedAt: now,
      });
    }
  }

  if (failures.length > 0) {
    return Response.json(
      {
        error: `Pitch closed, but ${failures.length} refund(s) failed. Retry the cancellation to finish them.`,
        refundsCreated,
        failed: failures,
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, refundsCreated, investmentsFound: toRefund.length });
}
