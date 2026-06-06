'use client';

import { useRef, useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { BambooLeaf, BambooNode, VerifiedLeafBadge } from "@/components/bamboo/BambooIcons";
import { FounderAvatar } from "@/components/bamboo/FounderAvatar";
import { EquityChart, TractionSpark } from "@/components/bamboo/EquityChart";
import { BambooDivider } from "@/components/bamboo/BambooDivider";
import { getPitch, PITCHES, type Pitch } from "@/lib/mock-pitches";
import { useWatchlist } from "@/lib/watchlist-store";

export default function PitchDetail({
  params,
}: {
  params: Promise<{ pitchId: string }>;
}) {
  const { pitchId } = use(params);
  const pitch = getPitch(pitchId);
  if (!pitch) return notFound();

  const similar = PITCHES.filter((p) => p.id !== pitch.id && p.sector === pitch.sector).slice(0, 3);
  const fallback = PITCHES.filter((p) => p.id !== pitch.id).slice(0, 3);
  const sidebar = similar.length ? similar : fallback;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-7xl mx-auto px-6 pt-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <Link href="/discover" className="hover:text-foreground">Discover</Link>
        <span className="mx-2">/</span>
        <span>{pitch.sector}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{pitch.company}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-32 grid lg:grid-cols-12 gap-10">
        <main className="lg:col-span-8 space-y-10">
          <header>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {pitch.verified && (
                <span className="bg-[color:var(--gold)] text-[color:var(--gold-foreground)] text-[10px] font-bold pl-1 pr-2 py-0.5 rounded-full uppercase tracking-tighter inline-flex items-center gap-1">
                  <VerifiedLeafBadge size={12} /> Root-Verified
                </span>
              )}
              <span className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {pitch.stage}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {pitch.sector} · {pitch.location}
              </span>
              <WatchlistButton pitch={pitch} />
            </div>
            <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter leading-[0.9]">
              {pitch.company}
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 mt-4 max-w-2xl leading-snug">
              {pitch.hook}
            </p>
            <Link
              href={`/founder/${pitch.founderId}`}
              className="group inline-flex items-center gap-3 mt-5 -ml-1 p-1 pr-3 rounded-full hover:bg-secondary transition-colors"
            >
              <FounderAvatar name={pitch.founder} size={40} />
              <div>
                <p className="text-sm font-bold leading-tight group-hover:text-[color:var(--primary)] transition-colors">
                  {pitch.founder}
                  <span className="ml-1.5 text-[color:var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Founder & CEO · View profile
                </p>
              </div>
            </Link>
          </header>

          <PitchVideoPlayer pitch={pitch} />

          <section className="grid sm:grid-cols-[auto_1fr] gap-6 items-center bg-card ring-1 ring-[color:var(--border)] rounded-3xl p-6">
            <EquityChart raised={pitch.raised} equityOffered={pitch.equityOffered} size={160} />
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Growth signal · last 12 months
              </p>
              <div className="-mx-1">
                <TractionSpark data={pitch.traction} height={64} width={420} />
              </div>
              <dl className="grid grid-cols-3 gap-px bg-[color:var(--border)] rounded-lg overflow-hidden mt-4 ring-1 ring-[color:var(--border)]">
                <div className="bg-card p-3">
                  <dt className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                    Min check
                  </dt>
                  <dd className="font-bold font-mono text-sm mt-0.5 tabular-nums">$5,000</dd>
                </div>
                <div className="bg-card p-3">
                  <dt className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                    Round close
                  </dt>
                  <dd className="font-bold font-mono text-sm mt-0.5 tabular-nums">
                    {pitch.daysLeft} days
                  </dd>
                </div>
                <div className="bg-card p-3">
                  <dt className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                    Backers
                  </dt>
                  <dd className="font-bold font-mono text-sm mt-0.5 tabular-nums">{pitch.investors}</dd>
                </div>
              </dl>
            </div>
          </section>

          <BambooDivider label="Due Diligence" className="!my-2" />

          <section>
            <h2 className="font-display text-3xl uppercase tracking-tighter mb-4">The Vault</h2>
            <div className="space-y-2">
              {[
                { title: "Business Plan", size: "2.4 MB", pages: 32, locked: false },
                { title: "Financial Model (3-year)", size: "880 KB", pages: 12, locked: false },
                { title: "Pitch Deck", size: "5.1 MB", pages: 18, locked: false },
                { title: "Cap Table & Term Sheet", size: "210 KB", pages: 4, locked: true },
              ].map((doc) => (
                <details key={doc.title} className="group bg-card ring-1 ring-[color:var(--border)] rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary transition-all">
                    <div className="flex items-center gap-3">
                      <span className="size-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                        {doc.locked ? <BambooNode size={16} /> : <BambooLeaf size={16} />}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{doc.title}</p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                          {doc.size} · {doc.pages} pages
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground group-open:text-[color:var(--gold)]">
                      {doc.locked ? "Request" : "Preview ↓"}
                    </span>
                  </summary>
                  <div className="p-4 pt-0 text-sm text-muted-foreground">
                    {doc.locked
                      ? "This document requires NDA acceptance. Submit a non-binding interest first."
                      : "Preview is available to accredited investors. Click to open the full document."}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <BambooDivider label="Capital" className="!my-2" />

          <section>
            <h2 className="font-display text-3xl uppercase tracking-tighter mb-4">Backers</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {["Sequoia Scout", "AngelList Syndicate", "Cassia Capital"].map((b) => (
                <div key={b} className="bg-card ring-1 ring-[color:var(--border)] rounded-xl p-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">Lead</p>
                  <p className="font-bold mt-1">{b}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="lg:col-span-4 space-y-6">
          <div id="invest" className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-3xl p-6 ring-1 ring-white/10 lg:sticky lg:top-24 bamboo-grain">
            <div className="grid grid-cols-2 gap-px bg-white/10 rounded-xl overflow-hidden mb-5">
              {[
                ["Ask", pitch.asking],
                ["Valuation", pitch.valuation],
                ["Backers", String(pitch.investors)],
                ["Days Left", String(pitch.daysLeft)],
              ].map(([k, v]) => (
                <div key={k} className="bg-[color:var(--ink)] p-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">{k}</p>
                  <p className="font-bold font-mono text-base text-[color:var(--gold)]">{v}</p>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/60 mb-2">
                <span>Raised</span>
                <span className="text-[color:var(--gold)] font-bold">{pitch.raised}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[color:var(--gold)] to-white rounded-full"
                  style={{ width: `${pitch.raised}%` }}
                />
              </div>
            </div>

            <InvestForm />

            <p className="mt-4 text-[10px] font-mono text-white/40 text-center">
              Powered by Stripe · Funds held in escrow until close
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Similar opportunities
            </h3>
            <div className="space-y-2">
              {sidebar.map((p) => (
                <SimilarCard key={p.id} pitch={p} />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[color:var(--ink)] text-[color:var(--ink-foreground)] border-t border-white/10 px-4 py-3 flex items-center gap-3 backdrop-blur-md">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-mono uppercase tracking-widest text-white/50">
            {pitch.raised}% raised · {pitch.daysLeft}d left
          </p>
          <div className="h-1 mt-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[color:var(--gold)] to-white rounded-full"
              style={{ width: `${pitch.raised}%` }}
            />
          </div>
        </div>
        <Link
          href="#invest"
          className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-[11px] inline-flex items-center gap-1.5"
        >
          <BambooLeaf size={11} />
          Plant Capital
        </Link>
      </div>
    </div>
  );
}

function InvestForm() {
  const [amount, setAmount] = useState(10000);
  const presets = [5000, 10000, 25000, 50000];
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
      <label className="text-[10px] font-mono uppercase tracking-widest text-white/60">
        Your Investment
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--gold)] font-mono">$</span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-xl font-mono font-bold text-[color:var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
        />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmount(p)}
            className={`py-1.5 text-[10px] font-mono uppercase rounded transition-all ${
              amount === p
                ? "bg-[color:var(--gold)] text-[color:var(--gold-foreground)]"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            ${p / 1000}k
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
      >
        Plant Capital
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </form>
  );
}

function WatchlistButton({ pitch }: { pitch: Pitch }) {
  const { has, toggle } = useWatchlist();
  const saved = has(pitch.id);
  return (
    <button
      type="button"
      onClick={() => toggle(pitch.id)}
      aria-pressed={saved}
      className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full inline-flex items-center gap-1 cursor-pointer transition-all ${
        saved
          ? 'bg-[color:var(--gold)] text-[color:var(--gold-foreground)]'
          : 'bg-secondary text-foreground hover:bg-[color:var(--gold)] hover:text-[color:var(--gold-foreground)]'
      }`}
    >
      <svg viewBox="0 0 24 24" width="11" height="11" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}

function PitchVideoPlayer({ pitch }: { pitch: Pitch }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const hasVideo = !!pitch.videoUrl;

  if (!hasVideo) {
    return (
      <section
        className={`relative aspect-video bg-gradient-to-br ${pitch.posterColor} rounded-3xl overflow-hidden ring-1 ring-[color:var(--border)]`}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(255,255,255,.3) 0, transparent 50%)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="size-20 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center opacity-60">
            <span className="text-white translate-x-1 text-2xl">▶</span>
          </span>
        </div>
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-full">
          Coming soon
        </div>
      </section>
    );
  }

  const start = () => {
    setPlaying(true);
    queueMicrotask(() => {
      ref.current?.play().catch(() => {});
    });
  };

  return (
    <section className="relative aspect-video rounded-3xl overflow-hidden ring-1 ring-[color:var(--border)] bg-[color:var(--ink)]">
      <video
        ref={ref}
        src={pitch.videoUrl}
        poster={pitch.posterUrl}
        controls={playing}
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />
      {!playing && (
        <button
          type="button"
          onClick={start}
          aria-label="Play pitch video"
          className="absolute inset-0 flex items-center justify-center group bg-black/20 hover:bg-black/10 transition-colors"
        >
          <span className="size-20 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center group-hover:bg-[color:var(--gold)] group-hover:ring-[color:var(--gold)] transition-all">
            <span className="text-white group-hover:text-[color:var(--gold-foreground)] translate-x-1 text-2xl">▶</span>
          </span>
        </button>
      )}
      {!playing && (
        <div className="pointer-events-none absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-full">
          0:60 · The Pitch
        </div>
      )}
    </section>
  );
}

function SimilarCard({ pitch }: { pitch: Pitch }) {
  return (
    <Link
      href={`/discover/${pitch.id}`}
      className="flex items-center gap-3 p-3 bg-card ring-1 ring-[color:var(--border)] rounded-xl hover:ring-foreground/30 transition-all"
    >
      <div className={`size-12 rounded-lg bg-gradient-to-br ${pitch.posterColor} shrink-0`} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm truncate">{pitch.company}</p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {pitch.asking} · {pitch.stage}
        </p>
      </div>
      <span className="text-[color:var(--gold)] text-xs">→</span>
    </Link>
  );
}
