'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'bamboo:investments';

export type Investment = {
  id: string;
  pitchId: string;
  company: string;
  amount: number;
  /** Fractional equity, e.g. 0.05 === 5%. */
  equityPct: number;
  date: string;
  status: 'completed' | 'processing';
  /**
   * When true, the investor chose to hide their identity from the founder and
   * any public-facing list. The investor's own dashboard still shows the full
   * record — anonymity is one-way, viewer-dependent.
   */
  anonymous: boolean;
};

// Portfolios start empty — only real investments (made through the flow) show.
const SEED: Investment[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: Investment[] | null = null;

function read(): Investment[] {
  if (cache) return cache;
  if (typeof window === 'undefined') {
    cache = [...SEED];
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as Investment[];
    } else {
      cache = [...SEED];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    cache = [...SEED];
  }
  return cache;
}

function write(next: Investment[]) {
  cache = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot(): Investment[] {
  return read();
}

function getServerSnapshot(): Investment[] {
  return SEED;
}

export function useInvestments() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Hydration guard: render the server snapshot until mount to keep SSR/CSR aligned.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const effective = mounted ? list : getServerSnapshot();

  return {
    investments: effective,
    totalInvested: effective.reduce((sum, i) => sum + i.amount, 0),
    has: (pitchId: string) => effective.some((i) => i.pitchId === pitchId),
    /** Record a new investment; returns the created entry. */
    record: (entry: {
      pitchId: string;
      company: string;
      amount: number;
      equityPct: number;
      anonymous?: boolean;
    }): Investment => {
      const created: Investment = {
        id: `inv-${Date.now()}`,
        pitchId: entry.pitchId,
        company: entry.company,
        amount: entry.amount,
        equityPct: entry.equityPct,
        date: new Date().toISOString().slice(0, 10),
        status: 'completed',
        anonymous: Boolean(entry.anonymous),
      };
      write([created, ...read()]);
      return created;
    },
  };
}
