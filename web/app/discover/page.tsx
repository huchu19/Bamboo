'use client';

import { useState, useMemo } from "react";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { BambooLeaf, RootGlyph } from "@/components/bamboo/BambooIcons";
import { DiscoverPitchCard } from "@/components/bamboo/DiscoverPitchCard";
import { Reveal } from "@/components/bamboo/Reveal";
import { PITCHES } from "@/lib/mock-pitches";

const SECTORS = ["All", "Hardware", "Fintech", "ClimateTech", "Healthcare", "Media"];
const STAGES = ["All Stages", "Pre-Seed", "Seed", "Series A"];

export default function DiscoverPage() {
  const [sector, setSector] = useState("All");
  const [stage, setStage] = useState("All Stages");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = useMemo(
    () =>
      PITCHES.filter(
        (p) =>
          (sector === "All" || p.sector === sector) &&
          (stage === "All Stages" || p.stage === stage) &&
          (!verifiedOnly || p.verified),
      ),
    [sector, stage, verifiedOnly],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Ticker */}
      <div className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] overflow-hidden border-b border-white/5">
        <div className="flex gap-12 py-2 animate-ticker whitespace-nowrap font-mono text-[10px] uppercase tracking-widest">
          {[...PITCHES, ...PITCHES].map((p, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className={p.raised > 50 ? "text-[color:var(--gold)]" : "text-white/50"}>●</span>
              <span className="text-white/80">{p.company}</span>
              <span className="text-white/40">{p.asking}</span>
              <span className="text-[color:var(--gold)]">+{p.raised}%</span>
            </span>
          ))}
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              The Grove · {filtered.length} seeds in bloom
            </span>
            <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter mt-3">
              Watch It Grow.
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Every grove starts with one seed. Walk the rows, find the next one.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={() => setVerifiedOnly((v) => !v)}
              className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
                verifiedOnly
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-[color:var(--input)] hover:border-foreground"
              }`}
            >
              <BambooLeaf size={11} className={verifiedOnly ? "text-[color:var(--gold)]" : "opacity-60"} />
              Root-Verified
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {SECTORS.map((s) => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer ${
                  sector === s
                    ? "bg-foreground text-background"
                    : "bg-secondary hover:bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="md:ml-auto flex gap-2 flex-wrap">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer ${
                  stage === s
                    ? "bg-foreground text-background"
                    : "bg-secondary hover:bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-32">
        {filtered.length === 0 ? (
          <div className="text-center py-24 max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <RootGlyph size={120} className="text-[color:var(--primary)]/50" />
            </div>
            <h2 className="font-display text-4xl uppercase tracking-tighter">
              No seeds match.
            </h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              The grove is wider than these filters. Loosen them up — or come back when
              new seeds break ground.
            </p>
            <button
              type="button"
              onClick={() => {
                setSector("All");
                setStage("All Stages");
                setVerifiedOnly(false);
              }}
              className="mt-6 px-5 py-2.5 text-xs font-bold uppercase tracking-widest border border-[color:var(--input)] rounded-lg hover:bg-secondary transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <BambooLeaf size={12} className="text-[color:var(--gold)]" />
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80}>
                <DiscoverPitchCard pitch={p} />
              </Reveal>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

