'use client';

/**
 * Stripe Elements payment step, rendered once a PaymentIntent exists.
 * Used by InvestModal (dark variant) and the pitch wizard's listing-fee step
 * (light variant). Fulfilment happens in the webhook — this component only
 * confirms the payment and reports the outcome to the caller.
 */

import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripePromise } from '@/lib/stripe/client';

type Variant = 'dark' | 'light';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const STYLES: Record<
  Variant,
  { error: string; footnote: string; back: string; pay: string }
> = {
  dark: {
    error:
      'text-[10px] font-mono text-red-300/90 bg-red-500/10 ring-1 ring-red-500/30 rounded-lg px-3 py-2',
    footnote: 'text-[10px] font-mono text-white/40 text-center leading-relaxed',
    back: 'px-4 py-4 rounded-lg text-[10px] font-mono uppercase tracking-widest text-white/60 bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-all',
    pay: 'flex-1 py-4 bg-[color:var(--gold)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-60 transition-all',
  },
  light: {
    error: 'text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2',
    footnote: 'text-xs text-gray-500 text-center leading-relaxed',
    back: 'px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 transition',
    pay: 'flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition',
  },
};

function PaymentForm({
  amount,
  variant,
  onSuccess,
  onBack,
}: {
  amount: number; // dollars
  variant: Variant;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed. Please try again.');
      setProcessing(false);
      return;
    }

    const status = result.paymentIntent?.status;
    if (status === 'succeeded' || status === 'processing') {
      onSuccess();
    } else {
      setError(`Unexpected payment status: ${status}. Please contact support.`);
      setProcessing(false);
    }
  }

  const s = STYLES[variant];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement />

      {error && <p className={s.error}>{error}</p>}

      <p className={s.footnote}>Secured by Stripe · funds held in escrow until close.</p>

      <div className="flex gap-2">
        <button type="button" onClick={onBack} disabled={processing} className={s.back}>
          Back
        </button>
        <button type="submit" disabled={!stripe || processing} className={s.pay}>
          {processing ? 'Processing…' : `Pay $${fmt(amount)}`}
        </button>
      </div>
    </form>
  );
}

export function PaymentStep({
  clientSecret,
  amount,
  variant = 'dark',
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  amount: number; // dollars
  variant?: Variant;
  onSuccess: () => void;
  onBack: () => void;
}) {
  return (
    <Elements
      stripe={getStripePromise()}
      options={{
        clientSecret,
        appearance:
          variant === 'dark'
            ? {
                theme: 'night',
                variables: {
                  colorPrimary: '#d4a843',
                  colorBackground: '#1c1917',
                  borderRadius: '8px',
                  fontSizeBase: '14px',
                },
              }
            : {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#16a34a',
                  borderRadius: '8px',
                  fontSizeBase: '14px',
                },
              },
      }}
    >
      <PaymentForm amount={amount} variant={variant} onSuccess={onSuccess} onBack={onBack} />
    </Elements>
  );
}
