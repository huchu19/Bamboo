'use client';

/**
 * Admin review queue (Phase 8). Lists pitches with status 'pending_review'
 * and lets an admin approve (→ live) or reject (→ rejected + listing-fee
 * refund). The page is gated on role === 'admin'; the API re-checks server-side
 * via verifyAdmin, so the client gate is only for UX.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteNav } from '@/components/bamboo/SiteNav';
import { useAuth } from '@/context/AuthContext';

type QueuePitch = {
  id: string;
  title: string;
  tagline: string;
  inventorName: string;
  inventorId: string;
  category: string;
  fundingGoal: number; // cents
  equityOffered: number;
  videoURL?: string;
  documents?: { name: string; url: string }[];
  submittedForReviewAt?: number;
};

export default function AdminPage() {
  const { firebaseUser, role, isLoading } = useAuth();
  const [pitches, setPitches] = useState<QueuePitch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!firebaseUser) return;
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/admin/pitch', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load the queue.');
      setPitches(data.pitches);
    } catch (err: any) {
      setError(err.message);
      setPitches([]);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (role === 'admin') load();
  }, [role, load]);

  async function act(pitchId: string, action: 'approve' | 'reject') {
    if (!firebaseUser) return;
    if (action === 'reject' && !confirm('Reject this pitch and refund the $49 listing fee?')) {
      return;
    }
    setBusyId(pitchId);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/admin/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, pitchId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      // Drop the actioned pitch from the local queue.
      setPitches((cur) => (cur ? cur.filter((p) => p.id !== pitchId) : cur));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="max-w-5xl mx-auto px-6 py-32 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="max-w-5xl mx-auto px-6 py-32 text-center">
          <h1 className="font-display text-4xl uppercase tracking-tighter">Not authorised</h1>
          <p className="text-sm text-muted-foreground mt-3">
            This area is for administrators only.{' '}
            <Link href="/discover" className="text-[color:var(--gold)] hover:underline">
              Back to Discover →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
            Admin · Moderation
          </span>
          <h1 className="font-display text-5xl uppercase tracking-tighter mt-2">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Pitches that paid the listing fee and are awaiting approval before going live.
          </p>
        </header>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {pitches === null ? (
          <p className="text-sm text-muted-foreground">Loading queue…</p>
        ) : pitches.length === 0 ? (
          <div className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing awaiting review. The grove is tidy. 🌱
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {pitches.map((p) => (
              <li
                key={p.id}
                className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-2xl uppercase tracking-tight">{p.title}</h2>
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/70 mt-1">{p.tagline}</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">
                      by {p.inventorName} · ${(p.fundingGoal / 100).toLocaleString()} ask ·{' '}
                      {p.equityOffered}% equity
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'approve')}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 transition disabled:opacity-40"
                    >
                      {busyId === p.id ? '…' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, 'reject')}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-[11px] font-mono">
                  {p.videoURL && (
                    <a
                      href={p.videoURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--gold)] hover:underline"
                    >
                      ▶ View video
                    </a>
                  )}
                  {p.documents?.map((d) => (
                    <a
                      key={d.url}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--gold)] hover:underline"
                    >
                      📄 {d.name}
                    </a>
                  ))}
                  {!p.videoURL && !p.documents?.length && (
                    <span className="text-muted-foreground">No media attached.</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
