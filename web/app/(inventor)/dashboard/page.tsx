'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { BambooLeaf } from "@/components/bamboo/BambooIcons";
import { BambooProgress } from "@/components/bamboo/BambooProgress";
import { getPitchesByFounder, PITCHES, type Pitch } from "@/lib/mock-pitches";
import { useInvestments } from "@/lib/investment-store";

const FOUNDER_ID = "hussain-naqvi"; // demo inventor — owns EduNexus

/**
 * Parse a display ask like "$2.3M" / "$750K" into dollars.
 * Mirrors the parser in InvestModal so numbers stay consistent.
 */
function parseAmount(display: string): number {
  const m = display.trim().match(/\$?\s*([\d.]+)\s*([kKmMbB])?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "").toLowerCase();
  const mult = unit === "b" ? 1e9 : unit === "m" ? 1e6 : unit === "k" ? 1e3 : 1;
  return n * mult;
}

function formatMoneyCompact(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(n >= 10e6 ? 0 : 1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function DashboardPage() {
  const [tab, setTab] = useState<"overview" | "upload" | "billing">("overview");

  const pitches = useMemo(() => {
    const owned = getPitchesByFounder(FOUNDER_ID);
    // Fall back to the first demo pitch if seed data ever changes.
    return owned.length > 0 ? owned : [PITCHES.find((p) => p.isDemo)!];
  }, []);
  const pitch = pitches[0];

  const goal = parseAmount(pitch.asking);
  const raisedAmount = goal * (pitch.raised / 100);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Founder Console · {pitch.company}
            </span>
            <h1 className="font-display text-6xl uppercase tracking-tighter mt-2">
              Command Deck
            </h1>
            <p className="text-sm text-muted-foreground mt-2">Tend your grove.</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill verified={pitch.verified} />
            <Link
              href="/pitch/new"
              className="text-xs font-bold uppercase tracking-widest px-5 py-2.5 bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground rounded-full hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <BambooLeaf size={11} className="text-[color:var(--gold)]" /> New Seed
            </Link>
          </div>
        </header>

        <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit mb-8">
          {(["overview", "upload", "billing"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all ${
                tab === t
                  ? "bg-[color:var(--ink)] text-[color:var(--ink-foreground)] shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <Overview pitch={pitch} raisedAmount={raisedAmount} />
        )}
        {tab === "upload" && <UploadPanel pitch={pitch} />}
        {tab === "billing" && <BillingPanel pitch={pitch} />}
      </div>
    </div>
  );
}

function StatusPill({ verified }: { verified: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card ring-1 ring-[color:var(--border)]">
      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Live</span>
      {verified && <BambooLeaf size={11} className="text-[color:var(--gold)]" />}
    </div>
  );
}

function Overview({ pitch, raisedAmount }: { pitch: Pitch; raisedAmount: number }) {
  // Derive stat values from real pitch numbers so the demo feels coherent.
  // Views/saves/inquiries scale with pitch.investors so the bigger rounds look busier.
  const views = pitch.investors * 90 + 318;
  const saves = Math.round(pitch.investors * 6.6);
  const inquiries = Math.round(pitch.investors * 1.05);
  const watchSeconds = 42 + Math.round((pitch.raised / 10));

  const stats = [
    { k: "Views", v: views.toLocaleString(), trend: "+24%" },
    { k: "Avg Watch", v: `${watchSeconds}s`, trend: "+6s" },
    { k: "Saves", v: saves.toString(), trend: "+11%" },
    { k: "Inquiries", v: inquiries.toString(), trend: "+8" },
  ];

  // Pull real recorded investments for *this* pitch from the local store.
  // Anonymous investments are rendered as "Anonymous backer" with a masked
  // avatar — the founder still sees the amount because they need it.
  const { investments: liveInvestments } = useInvestments();
  type InboundRow = {
    id: string;
    name: string;
    note: string;
    amount: string;
    time: string;
    anonymous?: boolean;
  };

  const liveInbound: InboundRow[] = liveInvestments
    .filter((inv) => inv.pitchId === pitch.id)
    .slice(0, 4)
    .map((inv) => ({
      id: inv.id,
      name: inv.anonymous ? "Anonymous backer" : "Recent backer",
      note: inv.anonymous
        ? "Identity hidden · committed via Bamboo"
        : `Soft commit · ${(inv.equityPct * 100).toFixed(2)}% equity`,
      amount: `$${inv.amount.toLocaleString()}`,
      time: "just now",
      anonymous: inv.anonymous,
    }));

  const synthetic: InboundRow[] = [
    { id: "syn-cassia",  name: "Cassia Capital",      note: "Wants intro call this week",  amount: "$250K", time: "2h" },
    { id: "syn-marcus",  name: "Marcus Ng",           note: "Reviewing financials",        amount: "$50K",  time: "6h" },
    { id: "syn-veritas", name: "Veritas Syndicate",   note: "Soft commit · pending NDA",   amount: "$500K", time: "1d" },
    { id: "syn-olivia",  name: "Olivia Bishop",       note: "Requested cap table",         amount: "$25K",  time: "2d" },
  ];

  // Live entries take the top slots; synthetic ones fill any remaining slots
  // up to a max of 4 so the founder console always feels alive.
  const synthSliceCount = Math.max(
    0,
    Math.min(4, Math.ceil(inquiries / 12)) - liveInbound.length,
  );
  const inbound: InboundRow[] = [
    ...liveInbound,
    ...synthetic.slice(0, synthSliceCount),
  ].slice(0, 4);

  // Root score derived from pitch.verified + raised progress.
  const rootScore = pitch.verified ? 92 : 67;
  const checklist: [string, boolean][] = [
    ["Identity verified", pitch.verified],
    ["Financials uploaded", pitch.raised > 20],
    ["Cap table verified", pitch.raised > 50],
    ["Founder interview", pitch.verified && pitch.raised > 80],
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-3xl p-8 ring-1 ring-white/10 bamboo-grain">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                Round Progress · Bamboo Segments
              </p>
              <p className="font-display text-5xl uppercase tracking-tighter mt-2 text-[color:var(--gold)]">
                {formatMoneyCompact(raisedAmount)}
              </p>
              <p className="text-sm text-white/60 mt-1">of {pitch.asking} target</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">Bloomed</p>
              <p className="font-display text-4xl text-[color:var(--gold)]">{pitch.raised}%</p>
            </div>
          </div>
          <BambooProgress value={pitch.raised} segments={10} />
        </section>

        <section className="grid grid-cols-2 gap-px bg-[color:var(--border)] rounded-2xl overflow-hidden ring-1 ring-[color:var(--border)]">
          {stats.map((s) => (
            <div key={s.k} className="bg-card p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {s.k}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="font-display text-3xl uppercase tracking-tighter">{s.v}</p>
                <span className="text-[10px] font-mono text-primary">{s.trend}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl">
          <header className="flex items-center justify-between p-5 border-b border-[color:var(--border)]">
            <h2 className="font-display text-2xl uppercase tracking-tighter">Inbound</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Last 7 days · {inbound.length} new
            </span>
          </header>
          {inbound.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground text-center">
              No inbound interest yet. Publish your pitch to start the grove.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--border)]">
              {inbound.map((row) => (
                <li key={row.id} className="flex items-center justify-between p-5 hover:bg-secondary transition-all">
                  <div className="flex items-center gap-3">
                    {row.anonymous ? (
                      <div
                        className="size-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center ring-1 ring-[color:var(--border)]"
                        title="Identity hidden by investor"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 5.1A10.5 10.5 0 0112 5c5 0 9.3 3.3 11 8a17 17 0 01-2.8 4.2" />
                          <path d="M6.6 6.6A17 17 0 001 13c1.7 4.7 6 8 11 8 1.6 0 3.1-.3 4.5-.9" />
                        </svg>
                      </div>
                    ) : (
                      <div className="size-9 rounded-full bg-[color:var(--ink)] text-[color:var(--ink-foreground)] flex items-center justify-center font-bold text-xs">
                        {row.name.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm flex items-center gap-1.5">
                        {row.name}
                        {row.anonymous && (
                          <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.note}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-[color:var(--gold)]">{row.amount}</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {row.time} ago
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6">
          <h3 className="font-display text-xl uppercase tracking-tighter mb-4">Root Score</h3>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-5xl text-[color:var(--gold)]">{rootScore}</p>
            <p className="text-xs text-muted-foreground">/ 100</p>
          </div>
          <ul className="space-y-2 mt-5 text-xs">
            {checklist.map(([label, done]) => (
              <li key={label} className="flex items-center gap-2">
                {done ? (
                  <BambooLeaf size={11} className="text-[color:var(--gold)]" />
                ) : (
                  <span className="size-2.5 rounded-full border border-muted-foreground" />
                )}
                <span className={done ? "" : "text-muted-foreground"}>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Verified badge upsell — only show if not yet verified */}
        {!pitch.verified ? (
          <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--ink)] via-[color:var(--ink)] to-[color:var(--gold)]/30 text-[color:var(--ink-foreground)] rounded-2xl p-6 ring-1 ring-[color:var(--gold)]/30">
            <span aria-hidden="true" className="absolute -top-12 -right-10 size-40 rounded-full bg-[color:var(--gold)]/15 blur-2xl" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] flex items-center gap-1.5">
              <BambooLeaf size={10} /> Root-Verify
            </p>
            <h3 className="font-display text-2xl uppercase tracking-tighter mt-2">
              Get the Verified leaf
            </h3>
            <p className="text-xs text-white/70 mt-2 leading-relaxed">
              Background-checked founders close <span className="text-[color:var(--gold)] font-bold">2.4×</span> faster
              and earn a permanent green leaf in the grove.
            </p>
            <Link
              href="/contact"
              className="mt-4 block w-full py-2.5 bg-[color:var(--gold)] text-[color:var(--gold-foreground)] rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all text-center"
            >
              Contact Us · Verify
            </Link>
          </section>
        ) : (
          <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--ink)] to-primary text-[color:var(--ink-foreground)] rounded-2xl p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">Boost</p>
            <h3 className="font-display text-2xl uppercase tracking-tighter mt-2">
              Feature your pitch
            </h3>
            <p className="text-xs text-white/70 mt-2">
              Lock the top of Discover for 7 days. Avg <span className="text-[color:var(--gold)] font-bold">+4× views</span>.
            </p>
            <Link
              href="/contact"
              className="mt-4 block w-full py-2.5 bg-[color:var(--gold)] text-[color:var(--gold-foreground)] rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all text-center"
            >
              Contact Us · Boost
            </Link>
          </section>
        )}
      </aside>
    </div>
  );
}

function UploadPanel({ pitch }: { pitch: Pitch }) {
  const hasVideo = Boolean(pitch.videoUrl);
  const docCount = pitch.documents?.length ?? 0;
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-3xl uppercase tracking-tighter">60s Pitch Video</h2>
          {hasVideo && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] flex items-center gap-1">
              <BambooLeaf size={10} /> Live
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          MP4 or MOV · max 200 MB · 9:16 or 16:9
        </p>
        {hasVideo ? (
          <div className="relative aspect-video rounded-xl overflow-hidden ring-1 ring-[color:var(--border)] bg-[color:var(--ink)]">
            <video
              src={pitch.videoUrl}
              poster={pitch.posterUrl}
              muted
              loop
              playsInline
              autoPlay
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-widest text-white/80">
              Published · click below to replace
            </span>
          </div>
        ) : (
          <div className="aspect-video border-2 border-dashed border-[color:var(--input)] rounded-xl flex flex-col items-center justify-center text-center p-8 hover:border-foreground transition-all cursor-pointer">
            <div className="size-14 rounded-full bg-secondary flex items-center justify-center text-2xl mb-3">
              ⬆
            </div>
            <p className="font-bold">Drop your pitch here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          </div>
        )}
      </section>

      <section className="bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-3xl uppercase tracking-tighter">Vault Documents</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {docCount} attached
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          PDF, DOCX, XLSX · max 25 MB per file
        </p>
        <div className="space-y-2">
          {(pitch.documents ?? []).map((d) => (
            <div
              key={d.label}
              className="w-full flex items-center justify-between p-3 border border-[color:var(--border)] rounded-lg bg-secondary/40"
            >
              <span className="flex items-center gap-3 text-sm">
                <BambooLeaf size={12} className="text-[color:var(--gold)]" />
                {d.label}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {d.comingSoon ? "Pending" : d.locked ? "Gated" : "Published"}
              </span>
            </div>
          ))}
          <button
            className="w-full flex items-center justify-between p-3 border border-dashed border-[color:var(--input)] rounded-lg hover:border-foreground hover:bg-secondary transition-all"
          >
            <span className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">+</span>
              Add another document
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Upload
            </span>
          </button>
        </div>

        <button className="mt-6 w-full py-3 bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all">
          Save & Publish →
        </button>
      </section>
    </div>
  );
}

function BillingPanel({ pitch }: { pitch: Pitch }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Link
        href="/contact"
        className="block bg-card ring-1 ring-[color:var(--border)] rounded-2xl p-8 hover:ring-foreground transition-all"
      >
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Listing Fee
        </p>
        <p className="font-display text-5xl uppercase tracking-tighter mt-2">Contact Us</p>
        <p className="text-xs text-muted-foreground mt-1">Pricing finalised on listing</p>
        <div className="mt-6 pt-6 border-t border-[color:var(--border)] text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Speak with our team to plant your pitch →
        </div>
      </Link>

      <Link
        href="/contact"
        className="block bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-2xl p-8 ring-1 ring-white/10 hover:ring-[color:var(--gold)] transition-all"
      >
        <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
          {pitch.verified ? "Boost" : "Verified Badge"}
        </p>
        <p className="font-display text-5xl uppercase tracking-tighter mt-2 text-[color:var(--gold)]">
          Contact Us
        </p>
        <p className="text-xs text-white/60 mt-1">
          {pitch.verified
            ? "Pricing finalised on feature placement"
            : "Pricing finalised on verification"}
        </p>
        <span className="mt-6 block w-full py-2.5 bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-center">
          Talk to our team →
        </span>
      </Link>
    </div>
  );
}
