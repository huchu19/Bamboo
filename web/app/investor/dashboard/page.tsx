'use client';

import Link from 'next/link';
import { BambooLeaf, VerifiedLeafBadge } from '@/components/bamboo/BambooIcons';
import { BambooProgress } from '@/components/bamboo/BambooProgress';
import { BambooDivider } from '@/components/bamboo/BambooDivider';
import { DiscoverPitchCard } from '@/components/bamboo/DiscoverPitchCard';
import { getPitch } from '@/lib/mock-pitches';
import {
  ACTIVITY,
  PORTFOLIO_TARGET,
} from '@/lib/mock-investor-data';
import { useWatchlist } from '@/lib/watchlist-store';
import { useInvestorInvestments } from '@/lib/use-investor-investments';
import { usePitches } from '@/lib/use-pitches';

export default function InvestorDashboard() {
  const { investments: rawInvestments, loading: investmentsLoading } = useInvestorInvestments();
  // Join against live Firestore pitches first (real mode), then the mock
  // catalogue (dev bypass / seeded demo positions).
  const { pitches } = usePitches();
  const findPitch = (id: string) => pitches.find((p) => p.id === id) ?? getPitch(id);
  const investments = rawInvestments
    .map((inv) => ({ ...inv, pitch: findPitch(inv.pitchId) }))
    .filter((i): i is typeof i & { pitch: NonNullable<typeof i.pitch> } => Boolean(i.pitch));

  const totalPlanted = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const activeSprouts = investments.filter((i) => i.status === 'completed').length;
  const avgEquity = investments.length
    ? investments.reduce((sum, i) => sum + i.equityPct, 0) / investments.length
    : 0;
  const rootScoreAvg = 88; // mock — would be derived from pitch quality signals
  const best = [...investments].sort((a, b) => b.amount - a.amount)[0];
  const portfolioPct = Math.min(100, Math.round((totalPlanted / PORTFOLIO_TARGET) * 100));

  const { ids: watchlistIds } = useWatchlist();
  const watchlist = watchlistIds
    .slice(0, 3)
    .map((id) => getPitch(id))
    .filter(Boolean) as ReturnType<typeof getPitch>[];

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <span className="font-mono text-[color:var(--gold)] text-[10px] uppercase tracking-widest">
            Investor Console · 01
          </span>
          <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter mt-3 leading-[0.9]">
            Investor&apos;s <span className="text-[color:var(--gold)]">Grove</span>
          </h1>
          <p className="text-foreground/60 mt-3 max-w-md text-sm leading-relaxed">
            Your planted capital, your watch shelf, and every stalk pushing through the
            canopy this week.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color:var(--ink)] text-[color:var(--ink-foreground)] text-[10px] font-mono uppercase tracking-widest">
            <VerifiedLeafBadge size={12} /> Accredited
          </span>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
          >
            <BambooLeaf size={11} />
            Walk the Grove
          </Link>
        </div>
      </header>

      {/* Portfolio summary */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-3xl p-8 ring-1 ring-white/10 bamboo-grain relative overflow-hidden">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            Total Planted
          </p>
          <p className="font-display text-6xl md:text-7xl text-[color:var(--gold)] tracking-tighter mt-2 tabular-nums">
            ${totalPlanted.toLocaleString()}
          </p>
          <p className="text-sm text-white/60 mt-2">
            Across {investments.length} sprouts · target ${PORTFOLIO_TARGET.toLocaleString()}
          </p>
          <div className="mt-6">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/60 mb-2">
              <span>Toward target</span>
              <span className="text-[color:var(--gold)] font-bold">{portfolioPct}%</span>
            </div>
            <BambooProgress value={portfolioPct} segments={10} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-[color:var(--border)] rounded-3xl overflow-hidden ring-1 ring-[color:var(--border)]">
          <StatTile label="Active Sprouts" value={String(activeSprouts)} sub="completed deals" />
          <StatTile label="Avg Root Score" value={`${rootScoreAvg}/100`} sub="across portfolio" />
          <StatTile
            label="Avg Equity"
            value={`${(avgEquity * 100).toFixed(2)}%`}
            sub="per investment"
          />
          <StatTile
            label="Best Performer"
            value={best?.pitch.company ?? '—'}
            sub={best ? `+${best.pitch.raised}% raised` : 'No investments yet'}
          />
        </div>
      </section>

      {/* Investment list */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-mono text-[color:var(--gold)] text-[10px] uppercase tracking-widest">
              Portfolio · 02
            </span>
            <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tighter mt-2">
              Your Sprouts
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {investments.length} positions
          </span>
        </div>
        <div className="bg-card ring-1 ring-[color:var(--border)] rounded-3xl overflow-hidden divide-y divide-[color:var(--border)]">
          {investmentsLoading && (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading your portfolio…</p>
            </div>
          )}
          {!investmentsLoading && investments.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No sprouts planted yet.{' '}
                <Link href="/discover" className="text-[color:var(--gold)] font-bold hover:underline">
                  Walk the grove →
                </Link>
              </p>
            </div>
          )}
          {investments.map((inv) => (
            <div
              key={inv.id}
              className="p-5 flex flex-wrap items-center gap-5 hover:bg-secondary/50 transition-colors"
            >
              <div
                className={`size-14 rounded-xl bg-gradient-to-br ${inv.pitch.posterColor} shrink-0 ring-1 ring-white/10`}
              />
              <div className="flex-1 min-w-[10rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{inv.pitch.company}</p>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {inv.pitch.sector}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-full">
                    {inv.pitch.stage}
                  </span>
                  {inv.status === 'processing' && (
                    <span className="text-[9px] font-mono uppercase tracking-widest bg-[color:var(--gold)]/15 text-[color:var(--gold)] px-2 py-0.5 rounded-full">
                      Processing
                    </span>
                  )}
                  {inv.anonymous && (
                    <span
                      className="text-[9px] font-mono uppercase tracking-widest bg-[color:var(--ink)] text-[color:var(--ink-foreground)] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                      title="Hidden from founder and public lists"
                    >
                      <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 3l18 18" />
                        <path d="M10.6 5.1A10.5 10.5 0 0112 5c5 0 9.3 3.3 11 8a17 17 0 01-2.8 4.2" />
                        <path d="M6.6 6.6A17 17 0 001 13c1.7 4.7 6 8 11 8 1.6 0 3.1-.3 4.5-.9" />
                      </svg>
                      Anonymous
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  Planted {new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-[color:var(--gold)] tabular-nums">
                  ${inv.amount.toLocaleString()}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {(inv.equityPct * 100).toFixed(2)}% equity
                </p>
              </div>
              <Link
                href={`/discover/${inv.pitchId}`}
                className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] hover:underline"
              >
                View pitch →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <BambooDivider label="Watching" className="!my-2" />

      {/* Watchlist preview */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-mono text-[color:var(--gold)] text-[10px] uppercase tracking-widest">
              Saved Seeds · 03
            </span>
            <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tighter mt-2">
              On Your Watch
            </h2>
          </div>
          <Link
            href="/investor/watchlist"
            className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] hover:underline"
          >
            View full watchlist →
          </Link>
        </div>
        {watchlist.length === 0 ? (
          <div className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No saved seeds yet.{' '}
              <Link href="/discover" className="text-[color:var(--gold)] font-bold hover:underline">
                Walk the grove →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {watchlist.map((p) => (
              <DiscoverPitchCard key={p!.id} pitch={p!} />
            ))}
          </div>
        )}
      </section>

      {/* Activity + CTA */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card ring-1 ring-[color:var(--border)] rounded-3xl p-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span className="font-mono text-[color:var(--gold)] text-[10px] uppercase tracking-widest">
                Pulse · 04
              </span>
              <h3 className="font-display text-2xl uppercase tracking-tighter mt-2">
                What&apos;s Growing
              </h3>
            </div>
          </div>
          <ul className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 size-7 rounded-full bg-secondary flex items-center justify-center shrink-0 text-[color:var(--primary)]">
                  <BambooLeaf size={12} />
                </span>
                <p className="flex-1 text-foreground/80">{a.copy}</p>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground shrink-0">
                  {a.when} ago
                </span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/discover"
          className="group bg-gradient-to-br from-[color:var(--ink)] to-[color:var(--primary-deep)] text-[color:var(--ink-foreground)] rounded-3xl p-6 ring-1 ring-white/10 bamboo-grain relative overflow-hidden flex flex-col justify-between min-h-[16rem]"
        >
          <div>
            <span className="font-mono text-[color:var(--gold)] text-[10px] uppercase tracking-widest">
              Discover
            </span>
            <h3 className="font-display text-2xl uppercase tracking-tighter mt-2 leading-tight">
              Sprouts Worth A Look
            </h3>
            <p className="text-white/60 text-sm mt-3">
              New pitches verified this week. Walk the grove and find your next stake.
            </p>
          </div>
          <span className="self-start inline-flex items-center gap-2 mt-6 px-3 py-1.5 rounded-full bg-[color:var(--gold)] text-[color:var(--gold-foreground)] text-[10px] font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
            Walk the Grove
            <span>→</span>
          </span>
        </Link>
      </section>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-card p-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-2xl md:text-3xl tracking-tighter mt-1 truncate">
        {value}
      </p>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70 mt-1">
        {sub}
      </p>
    </div>
  );
}
