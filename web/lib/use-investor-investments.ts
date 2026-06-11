'use client';

/**
 * Investor portfolio source-of-truth switch.
 *
 * Dev bypass on  → the localStorage investment store (seeded demo data).
 * Dev bypass off → real-time Firestore subscription on the `investments`
 *                  collection where investorId == uid (written by the Stripe
 *                  webhook), adapted to the UI shape the dashboard renders.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useInvestments, type Investment } from './investment-store';
import type { Investment as FirestoreInvestment } from '../types';

function adapt(fi: FirestoreInvestment): Investment {
  return {
    id: fi.id,
    pitchId: fi.pitchId,
    // The dashboard joins on pitchId for display names; keep the raw id here.
    company: fi.pitchId,
    amount: Math.round(fi.amount / 100), // cents → dollars
    equityPct: (fi.equityPortion ?? 0) / 100, // percent units → fraction
    date: new Date(fi.createdAt).toISOString().slice(0, 10),
    status: fi.status === 'completed' ? 'completed' : 'processing',
    anonymous: Boolean(fi.anonymous),
  };
}

export function useInvestorInvestments() {
  const { firebaseUser, devBypass } = useAuth();
  const local = useInvestments();
  const [remote, setRemote] = useState<Investment[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(!devBypass);

  const uid: string | undefined = firebaseUser?.uid;

  useEffect(() => {
    if (devBypass) return;
    if (!uid) {
      setRemote([]);
      setRemoteLoading(false);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    setRemoteLoading(true);
    import('./firebase/firestore')
      .then(({ onInvestorInvestmentsChange }) => {
        if (cancelled) return;
        unsubscribe = onInvestorInvestmentsChange(uid, (list) => {
          setRemote(
            list
              .filter((fi) => fi.status !== 'failed' && fi.status !== 'refunded')
              .map(adapt),
          );
          setRemoteLoading(false);
        });
      })
      .catch((err) => {
        console.error('[useInvestorInvestments] Firestore error:', err);
        if (!cancelled) setRemoteLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [devBypass, uid]);

  if (devBypass) {
    return { investments: local.investments, loading: false };
  }
  return { investments: remote, loading: remoteLoading };
}
