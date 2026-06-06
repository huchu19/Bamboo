'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { WATCHLIST_IDS } from './mock-investor-data';

const STORAGE_KEY = 'bamboo:watchlist';

type Listener = () => void;
const listeners = new Set<Listener>();

let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  if (typeof window === 'undefined') {
    cache = [...WATCHLIST_IDS];
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as string[];
    } else {
      cache = [...WATCHLIST_IDS];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    cache = [...WATCHLIST_IDS];
  }
  return cache;
}

function write(next: string[]) {
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

function getSnapshot(): string[] {
  return read();
}

function getServerSnapshot(): string[] {
  return [...WATCHLIST_IDS];
}

export function useWatchlist() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Hydration guard: render the server snapshot until mount to keep SSR/CSR aligned.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const effective = mounted ? ids : getServerSnapshot();

  return {
    ids: effective,
    has: (id: string) => effective.includes(id),
    add: (id: string) => {
      const cur = read();
      if (cur.includes(id)) return;
      write([id, ...cur]);
    },
    remove: (id: string) => {
      const cur = read();
      if (!cur.includes(id)) return;
      write(cur.filter((x) => x !== id));
    },
    toggle: (id: string) => {
      const cur = read();
      if (cur.includes(id)) {
        write(cur.filter((x) => x !== id));
      } else {
        write([id, ...cur]);
      }
    },
  };
}
