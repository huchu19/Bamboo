'use client';

import { useRef, useState, use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { BambooLeaf, VerifiedLeafBadge } from "@/components/bamboo/BambooIcons";
import { FounderAvatar } from "@/components/bamboo/FounderAvatar";
import { EquityChart, TractionSpark } from "@/components/bamboo/EquityChart";
import { BambooDivider } from "@/components/bamboo/BambooDivider";
import { getPitch, PITCHES, type Pitch } from "@/lib/mock-pitches";
import { adaptFirestorePitch } from "@/lib/use-pitches";
import { useWatchlist } from "@/lib/watchlist-store";
import { InvestModal } from "@/components/bamboo/InvestModal";
import { DocumentCard } from "@/components/bamboo/DocumentCard";
import { useAuth } from "@/context/AuthContext";

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH !== "false";

export default function PitchDetail({
  params,
}: {
  params: Promise<{ pitchId: string }>;
}) {
  const { pitchId } = use(params);
  // Mock catalogue first (seeded demo pitches), then fall back to a live
  // Firestore lookup by id for pitches created through the wizard.
  const mockPitch = getPitch(pitchId);
  const [pitch, setPitch] = useState<Pitch | null | undefined>(
    mockPitch ?? (DEV_BYPASS ? null : undefined),
  );
  const [investOpen, setInvestOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (mockPitch || DEV_BYPASS) return;
    let cancelled = false;
    import("@/lib/firebase/firestore")
      .then(({ getPitch: getFirestorePitch }) => getFirestorePitch(pitchId))
      .then((fp) => {
        if (cancelled) return;
        setPitch(fp ? adaptFirestorePitch(fp) : null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[PitchDetail] Firestore lookup failed:", err);
        setPitch(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pitchId, mockPitch]);

  // undefined = still loading the Firestore fallback; null = confirmed missing.
  if (pitch === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center text-sm text-muted-foreground">
          Loading pitch…
        </div>
      </div>
    );
  }
  if (!pitch) return notFound();

  function handleRecorded(amount: number) {
    setToast(`Investment of $${amount.toLocaleString("en-US")} recorded`);
    window.setTimeout(() => setToast(null), 4000);
  }

  const similar = PITCHES.filter((p) => p.id !== pitch.id && p.sector === pitch.sector).slice(0, 3);
  const fallback = PITCHES.filter((p) => p.id !== pitch.id).slice(0, 3);
  const sidebar = similar.length ? similar : fallback;

  // A founder can't invest in their own pitch.
  const isOwnPitch = !!firebaseUser && firebaseUser.uid === pitch.founderId;

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

          {pitch.id === "edunexus" && <PlatformMetricsStrip />}

          <section className="grid sm:grid-cols-[auto_1fr] gap-6 items-center bg-card ring-1 ring-[color:var(--border)] rounded-3xl p-6">
            <EquityChart raised={pitch.raised} equityOffered={pitch.equityOffered} size={160} />
            <div className="min-w-0">
              {pitch.traction.length > 0 && (
                <>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Growth signal · last 12 months
                  </p>
                  <div className="-mx-1">
                    <TractionSpark data={pitch.traction} height={64} width={420} />
                  </div>
                </>
              )}
              <dl className="grid grid-cols-2 gap-px bg-[color:var(--border)] rounded-lg overflow-hidden mt-4 ring-1 ring-[color:var(--border)]">
                {pitch.daysLeft > 0 && (
                  <div className="bg-card p-3">
                    <dt className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      Round close
                    </dt>
                    <dd className="font-bold font-mono text-sm mt-0.5 tabular-nums">
                      {pitch.daysLeft} days
                    </dd>
                  </div>
                )}
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
            {pitch.documents && pitch.documents.length > 0 ? (
              <div className="space-y-2">
                {pitch.documents.map((doc) => (
                  <DocumentCard key={doc.label} doc={doc} />
                ))}
              </div>
            ) : (
              <div className="bg-card ring-1 ring-[color:var(--border)] rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Documents haven&apos;t been shared for this round yet.
                </p>
              </div>
            )}
          </section>

        </main>

        <aside className="lg:col-span-4 space-y-6">
          <div id="invest" className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-3xl p-6 ring-1 ring-white/10 lg:sticky lg:top-24 bamboo-grain">
            <div className="grid grid-cols-2 gap-px bg-white/10 rounded-xl overflow-hidden mb-5">
              {[
                ["Ask", pitch.asking],
                ["Valuation", pitch.valuation],
                ["Backers", String(pitch.investors)],
                ...(pitch.daysLeft > 0 ? [["Days Left", String(pitch.daysLeft)]] : []),
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

            {isOwnPitch ? (
              <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-4 text-center">
                <p className="text-[11px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
                  This is your pitch
                </p>
                <p className="text-[11px] text-white/50 mt-1.5">
                  You can&apos;t invest in your own pitch.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-3 inline-block text-[10px] font-mono uppercase tracking-widest text-white/70 hover:text-[color:var(--gold)] transition-colors"
                >
                  Manage in your dashboard →
                </Link>
              </div>
            ) : (
              <>
                <InvestForm onOpen={() => setInvestOpen(true)} />

                <p className="mt-4 text-[10px] font-mono text-white/40 text-center">
                  Powered by Stripe · Funds held in escrow until close
                </p>
              </>
            )}
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
            {pitch.raised}% raised{pitch.daysLeft > 0 ? ` · ${pitch.daysLeft}d left` : ""}
          </p>
          <div className="h-1 mt-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[color:var(--gold)] to-white rounded-full"
              style={{ width: `${pitch.raised}%` }}
            />
          </div>
        </div>
        {isOwnPitch ? (
          <span className="shrink-0 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white/50">
            Your pitch
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setInvestOpen(true)}
            className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-[11px] inline-flex items-center gap-1.5"
          >
            <BambooLeaf size={11} />
            Plant Capital
          </button>
        )}
      </div>

      <InvestModal
        pitch={pitch}
        open={investOpen && !isOwnPitch}
        onClose={() => setInvestOpen(false)}
        onRecorded={handleRecorded}
      />

      {/* Success toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-full bg-[color:var(--ink)] text-[color:var(--ink-foreground)] ring-1 ring-[color:var(--gold)]/30 shadow-xl flex items-center gap-2 animate-[fade_220ms_ease-out]"
        >
          <span className="grid place-items-center h-4 w-4 rounded-full bg-[color:var(--gold)]/20">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="text-xs font-mono text-[color:var(--gold)]">{toast}</span>
        </div>
      )}
    </div>
  );
}

function InvestForm({ onOpen }: { onOpen: () => void }) {
  const presets = [5000, 10000, 25000, 50000];
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-white/60">
        Plant from
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={onOpen}
            className="py-1.5 text-[10px] font-mono uppercase rounded transition-all bg-white/5 text-white/60 hover:bg-white/10"
          >
            ${p / 1000}k
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="w-full py-4 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
      >
        Plant Capital
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  );
}

function PlatformMetricsStrip() {
  const metrics: { label: string; value: string }[] = [
    { label: "Active students", value: "12,400+" },
    { label: "Registered teachers", value: "800+" },
    { label: "Lessons generated", value: "50,000+" },
    { label: "Completion rate", value: "95%" },
    { label: "Active classrooms", value: "7" },
  ];
  return (
    <section className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-3xl p-6 ring-1 ring-white/10 bamboo-grain">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mb-4">
        Live platform metrics · in production
      </p>
      <dl className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-white/10 rounded-xl overflow-hidden ring-1 ring-white/10">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[color:var(--ink)] p-4">
            <dd className="font-display text-2xl md:text-3xl text-[color:var(--gold)] tracking-tighter tabular-nums">
              {m.value}
            </dd>
            <dt className="text-[9px] font-mono uppercase tracking-widest text-white/55 mt-1">
              {m.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
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
