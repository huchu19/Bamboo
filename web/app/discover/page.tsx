'use client';

import { useState, useMemo, useEffect } from "react";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { BambooLeaf, RootGlyph } from "@/components/bamboo/BambooIcons";
import { DiscoverPitchCard } from "@/components/bamboo/DiscoverPitchCard";
import { Reveal } from "@/components/bamboo/Reveal";
import { usePitches } from "@/lib/use-pitches";

const SECTORS = ["All", "EdTech", "Hardware", "Fintech", "ClimateTech", "Healthcare", "Media"];
const STAGES = ["All Stages", "Pre-Seed", "Seed", "Series A"];

export default function DiscoverPage() {
  const { pitches: allPitches, loading } = usePitches();
  const [sector, setSector] = useState("All");
  const [stage, setStage] = useState("All Stages");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(
    () =>
      allPitches.filter(
        (p) =>
          (sector === "All" || p.sector === sector) &&
          (stage === "All Stages" || p.stage === stage) &&
          (!verifiedOnly || p.verified),
      ),
    [allPitches, sector, stage, verifiedOnly],
  );

  const activeFilterCount =
    (sector !== "All" ? 1 : 0) + (stage !== "All Stages" ? 1 : 0) + (verifiedOnly ? 1 : 0);

  function clearFilters() {
    setSector("All");
    setStage("All Stages");
    setVerifiedOnly(false);
  }

  // Lock body scroll while the mobile filter drawer is open.
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileFiltersOpen]);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Ticker */}
      <div className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] overflow-hidden border-b border-white/5">
        <div className="flex gap-12 py-2 animate-ticker whitespace-nowrap font-mono text-[10px] uppercase tracking-widest">
          {[...allPitches, ...allPitches].map((p, i) => (
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
              The Grove · {loading ? "…" : filtered.length} seeds in bloom
            </span>
            <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter mt-3">
              Watch It Grow.
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Every grove starts with one seed. Walk the rows, find the next one.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs font-mono">
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

        {/* Mobile: single Filters button. Desktop: inline filter rows. */}
        <div className="mt-8 md:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary ring-1 ring-[color:var(--border)] text-left transition-all active:scale-[0.99]"
            aria-label="Open filters"
          >
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M7 12h10" />
                <path d="M11 18h2" />
              </svg>
              <span className="text-xs font-mono uppercase tracking-widest">Filters</span>
            </span>
            <span className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <span className="inline-grid place-items-center min-w-[20px] h-5 px-1.5 rounded-full bg-[color:var(--gold)] text-[color:var(--gold-foreground)] text-[10px] font-mono font-bold">
                  {activeFilterCount}
                </span>
              )}
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {filtered.length} seeds
              </span>
            </span>
          </button>
        </div>

        <div className="hidden md:flex mt-8 flex-col md:flex-row gap-4">
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
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-secondary animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
              onClick={clearFilters}
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

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fade_180ms_ease-out]"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-background ring-1 ring-[color:var(--border)] rounded-t-3xl p-6 pt-3 max-h-[85vh] overflow-y-auto animate-[rise_220ms_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex justify-center pb-3">
              <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-muted" />
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl uppercase tracking-tighter">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Verification
                </p>
                <button
                  onClick={() => setVerifiedOnly((v) => !v)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all flex items-center justify-between text-sm cursor-pointer ${
                    verifiedOnly
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-[color:var(--input)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BambooLeaf size={13} className={verifiedOnly ? "text-[color:var(--gold)]" : "opacity-60"} />
                    Root-Verified only
                  </span>
                  <span className={`h-5 w-9 rounded-full transition-colors relative ${verifiedOnly ? "bg-[color:var(--gold)]" : "bg-muted"}`}>
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform ${verifiedOnly ? "translate-x-4" : "translate-x-0.5"}`}
                    />
                  </span>
                </button>
              </section>

              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Sector
                </p>
                <div className="flex gap-2 flex-wrap">
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSector(s)}
                      className={`px-3 py-2 text-xs font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer ${
                        sector === s
                          ? "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Stage
                </p>
                <div className="flex gap-2 flex-wrap">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStage(s)}
                      className={`px-3 py-2 text-xs font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer ${
                        stage === s
                          ? "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sticky bottom-0 bg-background pt-4">
              <button
                type="button"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="py-3 rounded-lg text-xs font-mono uppercase tracking-widest border border-[color:var(--input)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="py-3 rounded-lg text-xs font-bold uppercase tracking-widest bg-[color:var(--gold)] text-[color:var(--gold-foreground)]"
              >
                Show {filtered.length} seeds
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes fade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes rise {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
