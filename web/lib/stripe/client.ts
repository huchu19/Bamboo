'use client';

/**
 * Client-side Stripe loader. When the publishable key is missing or still the
 * `pk_test_stub` placeholder, payments fall back to the demo simulation.
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';

const KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function isStripeEnabled(): boolean {
  return Boolean(KEY && KEY !== 'pk_test_stub');
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> {
  if (!isStripeEnabled()) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(KEY!);
  return stripePromise;
}
