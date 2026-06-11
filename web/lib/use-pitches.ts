'use client';

import { useState, useEffect } from 'react';
import { PITCHES, type Pitch } from './mock-pitches';
import type { Pitch as FirestorePitch } from '../types';

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== 'false';

function adaptFirestorePitch(fp: FirestorePitch): Pitch {
  const raised =
    fp.fundingGoal > 0
      ? Math.round((fp.amountRaised / fp.fundingGoal) * 100)
      : 0;

  const sectorMap: Record<string, string> = {
    technology: 'Tech',
    health: 'Healthcare',
    fintech: 'Fintech',
    sustainability: 'ClimateTech',
    'food-beverage': 'Consumer',
    education: 'EdTech',
    'real-estate': 'Real Estate',
    entertainment: 'Media',
    'consumer-goods': 'Consumer',
    'b2b-saas': 'Tech',
  };

  const stageGuess = (): Pitch['stage'] => {
    const goal = fp.fundingGoal / 100;
    if (goal < 500_000) return 'Pre-Seed';
    if (goal < 2_000_000) return 'Seed';
    return 'Series A';
  };

  const daysLeft = fp.fundingDeadline
    ? Math.max(0, Math.round((fp.fundingDeadline - Date.now()) / 86_400_000))
    : 30;

  return {
    id: fp.id,
    company: fp.title,
    founder: fp.inventorName,
    founderId: fp.inventorId,
    hook: fp.tagline,
    sector: sectorMap[fp.category] ?? fp.category,
    stage: stageGuess(),
    asking: `$${(fp.fundingGoal / 100).toLocaleString()}`,
    valuation: `$${((fp.fundingGoal / fp.equityOffered) * 100).toLocaleString()}`,
    raised,
    investors: fp.investorCount,
    verified: fp.isVerified,
    daysLeft,
    posterColor: 'from-stone-900 to-stone-950',
    equityOffered: fp.equityOffered,
    traction: Array.from({ length: 12 }, (_, i) => Math.round((raised / 12) * (i + 1))),
    location: '',
    videoUrl: fp.videoURL,
    posterUrl: fp.videoThumbnailURL,
    documents: fp.documents.map((d) => ({ label: d.name, url: d.url })),
  };
}

export function usePitches() {
  const [pitches, setPitches] = useState<Pitch[]>(DEV_BYPASS ? PITCHES : []);
  const [loading, setLoading] = useState(!DEV_BYPASS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEV_BYPASS) return;

    let cancelled = false;
    setLoading(true);

    import('./firebase/firestore')
      .then(({ getPitches }) => getPitches(50))
      .then((fps) => {
        if (cancelled) return;
        setPitches(fps.map(adaptFirestorePitch));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[usePitches] Firestore error, falling back to mock:', err);
        setError(err.message);
        setPitches(PITCHES);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { pitches, loading, error };
}
