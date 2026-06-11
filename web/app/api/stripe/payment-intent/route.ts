/**
 * POST /api/stripe/payment-intent
 *
 * Creates a Stripe PaymentIntent for an investment or a listing fee.
 * The webhook (api/stripe/webhook) is the source of truth for fulfilment —
 * this route only opens the payment, it never writes to Firestore.
 *
 * Body:
 *   { type: 'investment', pitchId, investorId, amountCents, anonymous? }
 *   { type: 'listing_fee', pitchId, inventorId }
 */

import { NextRequest } from 'next/server';
import { getConnectAccountId, getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { LISTING_FEE_CENTS, MIN_INVESTMENT_CENTS } from '@/lib/fees';

export const runtime = 'nodejs';

const MAX_INVESTMENT_CENTS = 100_000_000; // $1M sanity cap per transaction

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return Response.json(
      { error: 'Payments are not configured on this environment.' },
      { status: 503 },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { type, pitchId } = body ?? {};
  if (!pitchId || typeof pitchId !== 'string') {
    return Response.json({ error: 'pitchId is required.' }, { status: 400 });
  }

  const stripe = getStripe();

  try {
    if (type === 'investment') {
      const { investorId, amountCents, anonymous } = body;
      if (!investorId || typeof investorId !== 'string') {
        return Response.json({ error: 'investorId is required.' }, { status: 400 });
      }
      const amount = Number(amountCents);
      if (!Number.isInteger(amount) || amount < MIN_INVESTMENT_CENTS || amount > MAX_INVESTMENT_CENTS) {
        return Response.json(
          { error: `Investment must be between $${MIN_INVESTMENT_CENTS / 100} and $${MAX_INVESTMENT_CENTS / 100}.` },
          { status: 400 },
        );
      }

      // Stripe Connect payouts (stubbed): when STRIPE_CONNECT_ACCOUNT_ID is a
      // real acct_... id, investment funds are routed to that connected
      // account on capture. While it's unset/stub, funds settle on the
      // platform account. Activation steps: MILESTONES.md §6.2.
      const connectAccountId = getConnectAccountId();

      const intent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        ...(connectAccountId
          ? { transfer_data: { destination: connectAccountId } }
          : {}),
        metadata: {
          type: 'investment',
          pitchId,
          investorId,
          anonymous: anonymous ? 'true' : 'false',
        },
      });

      return Response.json({ clientSecret: intent.client_secret });
    }

    if (type === 'listing_fee') {
      const { inventorId } = body;
      if (!inventorId || typeof inventorId !== 'string') {
        return Response.json({ error: 'inventorId is required.' }, { status: 400 });
      }

      const intent = await stripe.paymentIntents.create({
        amount: LISTING_FEE_CENTS,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          type: 'listing_fee',
          pitchId,
          inventorId,
        },
      });

      return Response.json({ clientSecret: intent.client_secret });
    }

    return Response.json({ error: `Unknown payment type: ${type}` }, { status: 400 });
  } catch (err: any) {
    console.error('[payment-intent] Stripe error:', err);
    return Response.json({ error: 'Failed to create payment.' }, { status: 502 });
  }
}
