/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook — the single source of truth for payment fulfilment.
 * Writes happen here (via Admin SDK, bypassing client security rules), never
 * in the client and never in the payment-intent route.
 *
 * Handled events:
 *   payment_intent.succeeded
 *     type=investment  → transaction: create investments/{id}, bump pitch
 *                        counters, write payments/{pi_id} audit record
 *     type=listing_fee → set pitch.listingFeePaid=true + status 'live'
 *                        (Phase 8 will switch this to 'pending_review')
 *   payment_intent.payment_failed → payments/{pi_id} audit record only
 *   charge.refunded
 *     type=investment  → investment status 'refunded', pitch counters rolled
 *                        back in a transaction (idempotent)
 *     type=listing_fee → pitch delisted (listingFeePaid=false, status 'closed')
 *
 * The production webhook endpoint must subscribe to all three event types.
 *
 * Local dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 * and copy the printed whsec_... into STRIPE_WEBHOOK_SECRET.
 */

import { NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { getAdminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  // Signature verification needs the exact raw body.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await recordPayment(event.data.object as Stripe.PaymentIntent, 'failed');
        break;
      case 'charge.refunded':
        await handleRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        // Acknowledge everything else so Stripe stops retrying.
        break;
    }
  } catch (err: any) {
    console.error(`[webhook] Handler error for ${event.type}:`, err);
    // 500 → Stripe retries with backoff, which is what we want for
    // transient Firestore failures.
    return Response.json({ error: 'Handler failure.' }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function handleSucceeded(pi: Stripe.PaymentIntent) {
  const { type } = pi.metadata;
  if (type === 'investment') {
    await fulfilInvestment(pi);
  } else if (type === 'listing_fee') {
    await fulfilListingFee(pi);
  }
  await recordPayment(pi, 'succeeded');
}

/**
 * Idempotent: keyed on the PaymentIntent id, so Stripe retries can't
 * double-create the investment or double-bump pitch counters.
 */
async function fulfilInvestment(pi: Stripe.PaymentIntent) {
  const db = getAdminDb();
  const { pitchId, investorId, anonymous } = pi.metadata;
  const investmentId = `inv_${pi.id}`;
  const now = Date.now();

  await db.runTransaction(async (tx) => {
    const invRef = db.collection('investments').doc(investmentId);
    if ((await tx.get(invRef)).exists) return; // already fulfilled

    const pitchRef = db.collection('pitches').doc(pitchId);
    const pitchSnap = await tx.get(pitchRef);
    if (!pitchSnap.exists) throw new Error(`Pitch ${pitchId} not found`);
    const pitch = pitchSnap.data()!;

    const equityPortion =
      pitch.fundingGoal > 0 ? (pi.amount / pitch.fundingGoal) * pitch.equityOffered : 0;

    tx.set(invRef, {
      id: investmentId,
      investorId,
      pitchId,
      inventorId: pitch.inventorId,
      amount: pi.amount, // cents
      equityPortion,
      status: 'completed',
      anonymous: anonymous === 'true',
      stripePaymentIntentId: pi.id,
      createdAt: now,
      updatedAt: now,
      completedAt: now,
    });

    tx.update(pitchRef, {
      amountRaised: (pitch.amountRaised || 0) + pi.amount,
      investorCount: (pitch.investorCount || 0) + 1,
      updatedAt: now,
    });
  });
}

async function fulfilListingFee(pi: Stripe.PaymentIntent) {
  const db = getAdminDb();
  const { pitchId } = pi.metadata;
  const now = Date.now();

  // TODO(phase-8): set status 'pending_review' once the admin queue exists.
  await db.collection('pitches').doc(pitchId).set(
    {
      listingFeePaid: true,
      listingFeePaymentId: pi.id,
      status: 'live',
      publishedAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}

/**
 * Refund fulfilment — runs for refunds created by /api/pitch/cancel AND for
 * refunds issued manually from the Stripe dashboard (same single path).
 * Idempotent: an already-refunded investment is left untouched, so Stripe
 * retries and partial-refund events can't double-roll-back pitch counters.
 */
async function handleRefunded(charge: Stripe.Charge) {
  const piId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!piId) return;

  const db = getAdminDb();

  // Charge objects don't carry PaymentIntent metadata; recover type/pitchId
  // from our payments audit record, falling back to the PI itself.
  let meta = (await db.collection('payments').doc(piId).get()).data()?.metadata;
  if (!meta?.type) {
    meta = (await getStripe().paymentIntents.retrieve(piId)).metadata;
  }
  const now = Date.now();

  if (meta?.type === 'investment') {
    const invRef = db.collection('investments').doc(`inv_${piId}`);
    await db.runTransaction(async (tx) => {
      const invSnap = await tx.get(invRef);
      if (!invSnap.exists) return;
      const inv = invSnap.data()!;
      if (inv.status === 'refunded') return; // already fulfilled

      const pitchRef = db.collection('pitches').doc(inv.pitchId);
      const pitchSnap = await tx.get(pitchRef);

      tx.update(invRef, { status: 'refunded', refundedAt: now, updatedAt: now });
      if (pitchSnap.exists) {
        const pitch = pitchSnap.data()!;
        tx.update(pitchRef, {
          amountRaised: Math.max(0, (pitch.amountRaised || 0) - inv.amount),
          investorCount: Math.max(0, (pitch.investorCount || 0) - 1),
          updatedAt: now,
        });
      }
    });
  } else if (meta?.type === 'listing_fee' && meta.pitchId) {
    // Refunding a listing fee means delisting the pitch.
    await db.collection('pitches').doc(meta.pitchId).set(
      { listingFeePaid: false, status: 'closed', updatedAt: now },
      { merge: true },
    );
  }

  await db.collection('payments').doc(piId).set(
    { status: 'refunded', updatedAt: now },
    { merge: true },
  );
}

/** Audit trail under payments/{pi_id} — idempotent by construction. */
async function recordPayment(pi: Stripe.PaymentIntent, status: 'succeeded' | 'failed') {
  const db = getAdminDb();
  const { type, pitchId, investorId, inventorId } = pi.metadata;
  const now = Date.now();

  await db.collection('payments').doc(pi.id).set(
    {
      id: pi.id,
      userId: investorId || inventorId || 'unknown',
      pitchId: pitchId || null,
      investmentId: type === 'investment' ? `inv_${pi.id}` : null,
      type: type || 'unknown',
      amount: pi.amount,
      currency: pi.currency,
      status,
      stripePaymentIntentId: pi.id,
      metadata: pi.metadata,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}
