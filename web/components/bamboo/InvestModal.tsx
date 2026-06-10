'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInvestments } from '@/lib/investment-store';
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

type Step = 'amount' | 'review' | 'success';

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
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState(10000);
  const [submitting, setSubmitting] = useState(false);

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
      setSubmitting(false);
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

  function confirm() {
    setSubmitting(true);
    // Simulate a short processing delay for realism (stubbed payment).
    setTimeout(() => {
      record({
        pitchId: pitch.id,
        company: pitch.company,
        amount,
        equityPct,
      });
      setSubmitting(false);
      setStep('success');
      onRecorded?.(amount);
    }, 850);
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
            {(['amount', 'review'] as Step[]).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step === s || (s === 'amount' && step === 'review')
                    ? 'bg-[color:var(--gold)]'
                    : 'bg-white/10'
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
            <p className="text-[10px] font-mono text-white/40 text-center leading-relaxed">
              Demo only — no real funds move. Powered by Stripe · escrow until close.
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
                {submitting ? 'Planting…' : 'Confirm & Plant Capital'}
              </button>
            </div>
          </div>
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
