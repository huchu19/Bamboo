/**
 * Server-side Stripe client — API routes and webhooks only.
 *
 * Requires STRIPE_SECRET_KEY (sk_test_... in dev, sk_live_... in prod).
 * The stub value `sk_test_stub` is treated as unconfigured so demo mode
 * keeps working without real keys.
 */

import 'server-only';
import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key !== 'sk_test_stub');
}

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY in web/.env.local ' +
        '(get keys at https://dashboard.stripe.com/test/apikeys).',
    );
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripe;
}
