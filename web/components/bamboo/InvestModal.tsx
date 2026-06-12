'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInvestments } from '@/lib/investment-store';
import { useAuth } from '@/context/AuthContext';
import { isStripeEnabled } from '@/lib/stripe/client';
import { PaymentStep } from './PaymentStep';
import type { Pitch } from '@/lib/mock-pitches';

/** Parse a display ask like "$2.3M" / "$750K" into dollars. */
function parseAmount(display: string): number {
  const m = display.trim().match(/\$?\s*([\d.]+)\s*([kKmMbB])?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = (m[2] || '').toLowerCase();
  const mult = unit === 'b' ? 1e9 : unit === 'm' ? 1e6 : unit === 'k' ? 1e3 : 1;
  return n * mult;
}

const MIN = 100;
const PRESETS = [5000, 10000, 25000, 50000];

type Step = 'amount' | 'review' | 'payment' | 'success';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function InvestModal({
  pitch,
  open,
  onClose,
  onRecorded,
}: {
  pitch: Pitch;
  open: boolean;
  onClose: () => void;
  onRecorded?: (amount: number) => void;
}) {
  const { record } = useInvestments();
  const { user, firebaseUser } = useAuth();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState(10000);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [payError, setPayError] = useState('');
  const realPayments = isStripeEnabled();

  const goalDollars = useMemo(() => parseAmount(pitch.asking), [pitch.asking]);
  const equityPct = useMemo(() => {
    if (!goalDollars) return 0;
    return (amount / goalDollars) * (pitch.equityOffered / 100);
  }, [amount, goalDollars, pitch.equityOffered]);

  // Reset to first step whenever the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setStep('amount');
      setAmount(10000);
      setAnonymous(false);
      setSubmitting(false);
      setClientSecret('');
      setPayError('');
    }
  }, [open]);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const valid = amount >= MIN;

  function recordAndSucceed() {
    record({
      pitchId: pitch.id,
      company: pitch.company,
      amount,
      equityPct,
      anonymous,
    });
    setStep('success');
    onRecorded?.(amount);
  }

  async function confirm() {
    setSubmitting(true);
    setPayError('');

    if (!realPayments) {
      // No Stripe keys configured — keep the demo simulation.
      setTimeout(() => {
        setSubmitting(false);
        recordAndSucceed();
      }, 850);
      return;
    }

    try {
      const res = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'investment',
          pitchId: pitch.id,
          investorId: user?.uid ?? 'unknown',
          amountCents: Math.round(amount * 100),
          anonymous,
          email: user?.email ?? firebaseUser?.email ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || 'Could not start payment.');
      }
      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err: any) {
      setPayError(err.message || 'Could not start payment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Invest in ${pitch.company}`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fade_180ms_ease-out]"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-t-3xl sm:rounded-3xl ring-1 ring-white/10 bamboo-grain p-6 animate-[rise_220ms_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
              {step === 'success' ? 'Capital planted' : `Invest · ${pitch.company}`}
            </p>
            <p className="text-xs text-white/50 mt-0.5">{pitch.hook?.slice(0, 56)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/40 hover:text-white transition-colors text-lg leading-none -mt-1"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="flex gap-1.5 mb-5">
            {(realPayments
              ? (['amount', 'review', 'payment'] as Step[])
              : (['amount', 'review'] as Step[])
            ).map((s, i, steps) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  steps.indexOf(step as Step) >= i ? 'bg-[color:var(--gold)]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}

        {step === 'amount' && (
          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/60">
              Your Investment
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--gold)] font-mono">
                $
              </span>
              <input
                type="number"
                min={MIN}
                value={amount}
                autoFocus
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-xl font-mono font-bold text-[color:var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`py-1.5 text-[10px] font-mono uppercase rounded transition-all ${
                    amount === p
                      ? 'bg-[color:var(--gold)] text-[color:var(--gold-foreground)]'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  ${p / 1000}k
                </button>
              ))}
            </div>

            {/* Live equity preview */}
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                Est. equity
              </span>
              <span className="font-mono font-bold text-[color:var(--gold)] tabular-nums">
                {(equityPct * 100).toFixed(3)}%
              </span>
            </div>

            {!valid && (
              <p className="text-[10px] font-mono text-red-300/80">
                Minimum investment is ${fmt(MIN)}.
              </p>
            )}

            <button
              type="button"
              disabled={!valid}
              onClick={() => setStep('review')}
              className="w-full py-4 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
            >
              Review
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-3">
            <dl className="rounded-xl bg-white/5 ring-1 ring-white/10 divide-y divide-white/10 overflow-hidden">
              {[
                ['Investment', `$${fmt(amount)}`],
                ['Est. equity', `${(equityPct * 100).toFixed(3)}%`],
                ['Implied valuation', pitch.valuation],
                ['Stage', pitch.stage],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-4 py-3">
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-white/55">
                    {k}
                  </dt>
                  <dd className="font-mono font-bold text-sm text-[color:var(--gold)] tabular-nums">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Anonymity toggle — investors can hide their identity from the
                founder and any public-facing surface. Bamboo still records the
                real investor ID for compliance and the investor's own portfolio. */}
            <button
              type="button"
              onClick={() => setAnonymous((a) => !a)}
              aria-pressed={anonymous}
              className={`group w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 transition-all ${
                anonymous
                  ? 'bg-[color:var(--gold)]/10 ring-[color:var(--gold)]/40'
                  : 'bg-white/5 ring-white/10 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-2.5 text-left min-w-0 flex-1">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke={anonymous ? 'var(--gold)' : 'rgba(255,255,255,0.55)'}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  {anonymous ? (
                    <>
                      <path d="M3 3l18 18" />
                      <path d="M10.6 5.1A10.5 10.5 0 0112 5c5 0 9.3 3.3 11 8a17 17 0 01-2.8 4.2" />
                      <path d="M6.6 6.6A17 17 0 001 13c1.7 4.7 6 8 11 8 1.6 0 3.1-.3 4.5-.9" />
                      <path d="M9.9 9.9A3 3 0 0014 14" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
                <span className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-white/90">
                    {anonymous ? 'Investing as Anonymous backer' : 'Show my name to the inventor'}
                  </span>
                  <span className="text-[10px] font-mono text-white/45 leading-tight mt-0.5">
                    {anonymous
                      ? 'Inventor sees "Anonymous backer" only. Your portfolio is unchanged.'
                      : 'Tap to hide your identity from the inventor & public lists.'}
                  </span>
                </span>
              </span>
              <span
                className={`shrink-0 h-5 w-9 rounded-full transition-colors relative ${
                  anonymous ? 'bg-[color:var(--gold)]' : 'bg-white/15'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white/95 transition-transform ${
                    anonymous ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </span>
            </button>

            {payError && (
              <p className="text-[10px] font-mono text-red-300/90 bg-red-500/10 ring-1 ring-red-500/30 rounded-lg px-3 py-2">
                {payError}
              </p>
            )}

            <p className="text-[10px] font-mono text-white/40 text-center leading-relaxed">
              {realPayments
                ? 'Payment on the next step · Powered by Stripe · escrow until close.'
                : 'Demo only — no real funds move. Powered by Stripe · escrow until close.'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('amount')}
                className="px-4 py-4 rounded-lg text-[10px] font-mono uppercase tracking-widest text-white/60 bg-white/5 hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={confirm}
                className="flex-1 py-4 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {submitting
                  ? 'Preparing…'
                  : realPayments
                    ? 'Continue to Payment'
                    : 'Confirm & Plant Capital'}
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && clientSecret && (
          <PaymentStep
            clientSecret={clientSecret}
            amount={amount}
            onSuccess={recordAndSucceed}
            onBack={() => setStep('review')}
          />
        )}

        {step === 'success' && (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 grid place-items-center h-16 w-16 rounded-full bg-[color:var(--gold)]/15 ring-1 ring-[color:var(--gold)]/30 animate-[pop_360ms_cubic-bezier(0.16,1,0.3,1)]">
              <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="font-display text-2xl tracking-tight text-[color:var(--gold)]">
              ${fmt(amount)} planted
            </p>
            <p className="text-xs text-white/55 mt-1">
              You now hold an est. {(equityPct * 100).toFixed(3)}% stake in {pitch.company}.
            </p>
            {anonymous && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]/90 bg-[color:var(--gold)]/10 ring-1 ring-[color:var(--gold)]/30 rounded-full px-3 py-1">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 5.1A10.5 10.5 0 0112 5c5 0 9.3 3.3 11 8a17 17 0 01-2.8 4.2" />
                  <path d="M6.6 6.6A17 17 0 001 13c1.7 4.7 6 8 11 8 1.6 0 3.1-.3 4.5-.9" />
                </svg>
                Visible to the inventor as Anonymous
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-4 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pop {
          0% {
            opacity: 0;
            transform: scale(0.4);
          }
          60% {
            transform: scale(1.12);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
