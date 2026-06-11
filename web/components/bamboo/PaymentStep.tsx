'use client';

/**
 * Stripe Elements payment step, rendered inside InvestModal once a
 * PaymentIntent exists. Fulfilment happens in the webhook — this component
 * only confirms the payment and reports the outcome to the modal.
 */

import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripePromise } from '@/lib/stripe/client';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function PaymentForm({
  amount,
  onSuccess,
  onBack,
}: {
  amount: number; // dollars
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement />

      {error && (
        <p className="text-[10px] font-mono text-red-300/90 bg-red-500/10 ring-1 ring-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-[10px] font-mono text-white/40 text-center leading-relaxed">
        Secured by Stripe · funds held in escrow until close.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="px-4 py-4 rounded-lg text-[10px] font-mono uppercase tracking-widest text-white/60 bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-4 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-60 transition-all"
        >
          {processing ? 'Processing…' : `Pay $${fmt(amount)}`}
        </button>
      </div>
    </form>
  );
}

export function PaymentStep({
  clientSecret,
  amount,
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  amount: number; // dollars
  onSuccess: () => void;
  onBack: () => void;
}) {
  return (
    <Elements
      stripe={getStripePromise()}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#d4a843',
            colorBackground: '#1c1917',
            borderRadius: '8px',
            fontSizeBase: '14px',
          },
        },
      }}
    >
      <PaymentForm amount={amount} onSuccess={onSuccess} onBack={onBack} />
    </Elements>
  );
}
