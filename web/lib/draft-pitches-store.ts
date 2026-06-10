'use client';

/**
 * Local-storage draft pitches store.
 *
 * Used during MVP dev-bypass mode so the inventor wizard can "save" without
 * touching Firebase. Phase 6 will replace this with a real Firestore path.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'bamboo:draft-pitches';

export type DraftPitch = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  fundingGoalCents: number;
  minimumInvestmentCents: number;
  equityOffered: number;
  videoFileName?: string;
  documentFileNames: string[];
  createdAt: number;
};

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: DraftPitch[] | null = null;

function read(): DraftPitch[] {
  if (cache) return cache;
  if (typeof window === 'undefined') {
    cache = [];
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as DraftPitch[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: DraftPitch[]) {
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

function snapshot(): DraftPitch[] {
  return read();
}

function serverSnapshot(): DraftPitch[] {
  return [];
}

export function useDraftPitches() {
  const list = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return {
    drafts: mounted ? list : [],
    save: (draft: Omit<DraftPitch, 'id' | 'createdAt'>): DraftPitch => {
      const created: DraftPitch = {
        ...draft,
        id: `draft-${Date.now()}`,
        createdAt: Date.now(),
      };
      write([created, ...read()]);
      return created;
    },
  };
}
