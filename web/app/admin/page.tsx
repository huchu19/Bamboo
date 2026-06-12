'use client';

/**
 * Admin review queue (Phase 8). Lists pitches with status 'pending_review'
 * and lets an admin approve (→ live) or reject (→ rejected + listing-fee
 * refund). Also shows reported pitches for moderation. The page is gated on
 * role === 'admin'; the API re-checks server-side via verifyAdmin.
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
  fundingGoal: number;
  equityOffered: number;
  videoURL?: string;
  documents?: { name: string; url: string }[];
  submittedForReviewAt?: number;
  reportCount?: number;
  reportReasons?: string[];
  status: string;
};

type Tab = 'review' | 'reported' | 'badges';

export default function AdminPage() {
  const { firebaseUser, role, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('review');
  const [reviewPitches, setReviewPitches] = useState<QueuePitch[] | null>(null);
  const [reportedPitches, setReportedPitches] = useState<QueuePitch[] | null>(null);
  const [badgePitches, setBadgePitches] = useState<QueuePitch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Rejection reason modal state
  const [rejectTarget, setRejectTarget] = useState<QueuePitch | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    if (!firebaseUser) return;
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const [reviewRes, reportedRes, badgeRes] = await Promise.all([
        fetch('/api/admin/pitch?status=pending_review', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/pitch?status=reported', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/pitch?status=pending_badge_review', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [reviewData, reportedData, badgeData] = await Promise.all([reviewRes.json(), reportedRes.json(), badgeRes.json()]);
      if (!reviewRes.ok) throw new Error(reviewData.error || 'Failed to load the queue.');
      if (!reportedRes.ok) throw new Error(reportedData.error || 'Failed to load reported pitches.');
      if (!badgeRes.ok) throw new Error(badgeData.error || 'Failed to load badge applications.');
      setReviewPitches(reviewData.pitches);
      setReportedPitches(reportedData.pitches);
      setBadgePitches(badgeData.pitches);
    } catch (err: any) {
      setError(err.message);
      setReviewPitches([]);
      setReportedPitches([]);
      setBadgePitches([]);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (role === 'admin') load();
  }, [role, load]);

  async function act(pitchId: string, action: 'approve' | 'reject' | 'dismiss_report' | 'approve_badge', reason?: string) {
    if (!firebaseUser) return;
    setBusyId(pitchId);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/admin/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, pitchId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      setReviewPitches((cur) => (cur ? cur.filter((p) => p.id !== pitchId) : cur));
      setReportedPitches((cur) => (cur ? cur.filter((p) => p.id !== pitchId) : cur));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function openRejectModal(pitch: QueuePitch) {
    setRejectTarget(pitch);
    setRejectReason('');
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    await act(rejectTarget.id, 'reject', rejectReason.trim() || undefined);
    setRejectTarget(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="max-w-5xl mx-auto px-6 py-32 text-center text-sm text-muted-foreground">Loading…</div>
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
            <Link href="/discover" className="text-[color:var(--gold)] hover:underline">Back to Discover →</Link>
          </p>
        </div>
      </div>
    );
  }

  const activePitches = tab === 'review' ? reviewPitches : tab === 'reported' ? reportedPitches : badgePitches;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Rejection reason modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-display text-2xl uppercase tracking-tighter mb-1">Reject Pitch</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Rejecting <strong>{rejectTarget.title}</strong> will refund the $49 listing fee and notify the inventor.
            </p>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
              Reason (optional — shown to the inventor)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Video quality too low, missing financial projections…"
              className="w-full px-3 py-2.5 bg-secondary border border-[color:var(--input)] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <p className="text-[10px] font-mono text-muted-foreground mt-1 mb-5">{rejectReason.length}/500</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg border border-[color:var(--border)] text-muted-foreground hover:bg-secondary transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === rejectTarget.id}
                onClick={confirmReject}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-40"
              >
                {busyId === rejectTarget.id ? 'Rejecting…' : 'Reject & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">Admin · Moderation</span>
          <h1 className="font-display text-5xl uppercase tracking-tighter mt-2">Review Queue</h1>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 w-fit">
          {([
            { key: 'review', label: 'Pending Review', count: reviewPitches?.length, color: 'bg-[color:var(--gold)]/20 text-[color:var(--gold)]' },
            { key: 'reported', label: 'Reported', count: reportedPitches?.length, color: 'bg-red-500/15 text-red-500' },
            { key: 'badges', label: 'Badge Applications', count: badgePitches?.length, color: 'bg-primary/15 text-primary' },
          ] as { key: Tab; label: string; count?: number; color: string }[]).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${
                tab === t.key ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${t.color}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {activePitches === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : activePitches.length === 0 ? (
          <div className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {tab === 'review' ? 'Nothing awaiting review. The grove is tidy. 🌱' : tab === 'reported' ? 'No reported pitches.' : 'No badge applications pending.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {activePitches.map((p) => (
              <li key={p.id} className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-2xl uppercase tracking-tight">{p.title}</h2>
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                      {tab === 'reported' && p.reportCount && p.reportCount > 0 && (
                        <span className="text-[10px] font-mono uppercase tracking-widest bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full">
                          {p.reportCount} report{p.reportCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/70 mt-1">{p.tagline}</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">
                      by {p.inventorName} · ${(p.fundingGoal / 100).toLocaleString()} ask · {p.equityOffered}% equity
                    </p>
                    {tab === 'reported' && p.reportReasons && p.reportReasons.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {p.reportReasons.map((r, i) => (
                          <li key={i} className="text-[11px] font-mono text-red-500/80">· {r}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {tab === 'review' && (
                      <>
                        <button type="button" disabled={busyId === p.id} onClick={() => act(p.id, 'approve')}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 transition disabled:opacity-40">
                          {busyId === p.id ? '…' : 'Approve'}
                        </button>
                        <button type="button" disabled={busyId === p.id} onClick={() => openRejectModal(p)}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition disabled:opacity-40">
                          Reject
                        </button>
                      </>
                    )}
                    {tab === 'reported' && (
                      <>
                        <button type="button" disabled={busyId === p.id} onClick={() => act(p.id, 'dismiss_report')}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90 transition disabled:opacity-40">
                          {busyId === p.id ? '…' : 'Dismiss'}
                        </button>
                        <Link href={`/discover/${p.id}`} target="_blank"
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-[color:var(--border)] text-foreground hover:bg-secondary transition">
                          View
                        </Link>
                        <button type="button" disabled={busyId === p.id} onClick={() => openRejectModal(p)}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition disabled:opacity-40">
                          Remove
                        </button>
                      </>
                    )}
                    {tab === 'badges' && (
                      <>
                        <button type="button" disabled={busyId === p.id} onClick={() => act(p.id, 'approve_badge')}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-[color:var(--gold)] text-[color:var(--gold-foreground)] hover:opacity-90 transition disabled:opacity-40">
                          {busyId === p.id ? '…' : '✓ Grant Badge'}
                        </button>
                        <Link href={`/discover/${p.id}`} target="_blank"
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-[color:var(--border)] text-foreground hover:bg-secondary transition">
                          View Pitch
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-[11px] font-mono">
                  {p.videoURL && (
                    <a href={p.videoURL} target="_blank" rel="noopener noreferrer" className="text-[color:var(--gold)] hover:underline">
                      ▶ View video
                    </a>
                  )}
                  {p.documents?.map((d) => (
                    <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--gold)] hover:underline">
                      📄 {d.name}
                    </a>
                  ))}
                  {!p.videoURL && !p.documents?.length && (
                    <span className="text-muted-foreground">No media attached.</span>
                  )}
                  <Link
                    href={`/discover/${p.id}`}
                    target="_blank"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    → Open pitch page
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
