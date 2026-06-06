'use client';

import Link from 'next/link';
import { DiscoverPitchCard } from '@/components/bamboo/DiscoverPitchCard';
import { RootGlyph, BambooLeaf } from '@/components/bamboo/BambooIcons';
import { getPitch } from '@/lib/mock-pitches';
import { useWatchlist } from '@/lib/watchlist-store';
import type { Pitch } from '@/lib/mock-pitches';

export default function WatchlistPage() {
  const { ids, remove } = useWatchlist();
  const pitches = ids
    .map((id) => getPitch(id))
    .filter((p): p is Pitch => Boolean(p));

  return (
    <div className="space-y-8">
      <header>
        <span className="font-mono text-[color:var(--gold)] text-[10px] uppercase tracking-widest">
          Investor Console · 02
        </span>
        <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter mt-3 leading-[0.9]">
          Watchlist · <span className="text-[color:var(--gold)]">Saved Seeds</span>
        </h1>
        <p className="text-foreground/60 mt-3 max-w-md text-sm leading-relaxed">
          {pitches.length} {pitches.length === 1 ? 'sprout' : 'sprouts'} waiting on your decision.
        </p>
      </header>

      {pitches.length === 0 ? (
        <div className="bg-card ring-1 ring-[color:var(--border)] rounded-3xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <RootGlyph size={120} className="text-[color:var(--primary)]/50" />
          </div>
          <h3 className="font-display text-4xl uppercase tracking-tighter">
            Your grove is bare.
          </h3>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
            Walk the rows and save the seeds that catch your eye. They&apos;ll wait here
            until you&apos;re ready to plant capital.
          </p>
          <Link
            href="/discover"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground rounded-lg hover:opacity-90 transition-all cursor-pointer"
          >
            <BambooLeaf size={12} className="text-[color:var(--gold)]" />
            Walk the Grove
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map((pitch) => (
            <div key={pitch.id} className="relative group">
              <DiscoverPitchCard pitch={pitch} />
              <button
                type="button"
                onClick={() => remove(pitch.id)}
                aria-label={`Remove ${pitch.company} from watchlist`}
                title="Remove from watchlist"
                className="absolute top-3 right-14 z-10 size-8 rounded-full bg-[color:var(--ink)]/80 text-white/80 hover:bg-red-500 hover:text-white backdrop-blur-md ring-1 ring-white/10 flex items-center justify-center text-xs font-mono uppercase transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
