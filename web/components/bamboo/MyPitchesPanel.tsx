'use client';

/**
 * Real-mode founder panel: the inventor's actual Firestore pitches with live
 * status, raise progress, and the cancel-&-refund action (POST
 * /api/pitch/cancel). Rendered on the founder dashboard only when dev bypass
 * is off — the demo dashboard keeps its mock data.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { Pitch, PitchStatus } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  live: 'bg-primary/15 text-primary',
  pending_payment: 'bg-[color:var(--gold)]/15 text-[color:var(--gold)]',
  pending_review: 'bg-[color:var(--gold)]/15 text-[color:var(--gold)]',
  closed: 'bg-secondary text-muted-foreground',
  funded: 'bg-primary/15 text-primary',
  rejected: 'bg-red-500/15 text-red-500',
  draft: 'bg-secondary text-muted-foreground',
};

function statusLabel(status: PitchStatus): string {
  return status.replace('_', ' ');
}

export function MyPitchesPanel() {
  const { firebaseUser } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState('');

  const uid: string | undefined = firebaseUser?.uid;

  useEffect(() => {
    if (!uid) {
      setPitches([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    import('@/lib/firebase/firestore')
      .then(({ onInventorPitchesChange }) => {
        if (cancelled) return;
        unsubscribe = onInventorPitchesChange(uid, (list) => {
          setPitches(list);
          setLoading(false);
        });
      })
      .catch((err) => {
        console.error('[MyPitchesPanel] Firestore error:', err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [uid]);

  async function cancelPitch(pitch: Pitch) {
    const confirmed = window.confirm(
      `Cancel "${pitch.title}"? It will be removed from Discover and every ` +
        'investor will be refunded in full. This cannot be undone.',
    );
    if (!confirmed) return;

    setCancelling(pitch.id);
    setError('');
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/pitch/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pitchId: pitch.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed.');
      // The onSnapshot subscription picks up the status change; nothing to do.
    } catch (err: any) {
      console.error('[MyPitchesPanel] Cancel failed:', err);
      setError(err.message || 'Cancellation failed. Please try again.');
    } finally {
      setCancelling(null);
    }
  }

  if (loading) {
    return (
      <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-8 mb-6 text-center">
        <p className="text-sm text-muted-foreground">Loading your pitches…</p>
      </section>
    );
  }

  return (
    <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl mb-6">
      <header className="flex items-center justify-between p-5 border-b border-[color:var(--border)]">
        <h2 className="font-display text-2xl uppercase tracking-tighter">Your Pitches</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {pitches.length} total
        </span>
      </header>

      {error && (
        <p className="mx-5 mt-4 text-sm text-red-600 bg-red-500/10 ring-1 ring-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {pitches.length === 0 ? (
        <p className="p-8 text-sm text-muted-foreground text-center">
          No pitches yet.{' '}
          <Link href="/pitch/new" className="text-[color:var(--gold)] font-bold hover:underline">
            Plant your first seed →
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--border)]">
          {pitches.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="flex-1 min-w-[12rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{p.title}</p>
                  <span
                    className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      STATUS_STYLES[p.status] ?? STATUS_STYLES.draft
                    }`}
                  >
                    {statusLabel(p.status)}
                  </span>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  ${(p.amountRaised / 100).toLocaleString()} raised of $
                  {(p.fundingGoal / 100).toLocaleString()} · {p.investorCount} investor
                  {p.investorCount === 1 ? '' : 's'}
                </p>
              </div>

              {p.status === 'live' && (
                <Link
                  href={`/discover/${p.id}`}
                  className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] hover:underline"
                >
                  View live →
                </Link>
              )}

              {p.status !== 'closed' && p.status !== 'rejected' && (
                <button
                  type="button"
                  disabled={cancelling === p.id}
                  onClick={() => cancelPitch(p)}
                  className="text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-red-600 disabled:opacity-50 px-3 py-1.5 rounded-lg ring-1 ring-red-500/30 hover:bg-red-500/10 transition-all"
                >
                  {cancelling === p.id ? 'Cancelling…' : 'Cancel & refund'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
