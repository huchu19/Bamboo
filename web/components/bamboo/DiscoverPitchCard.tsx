'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BambooLeaf, VerifiedLeafBadge } from "./BambooIcons";
import { FounderAvatar } from "./FounderAvatar";
import { TractionSpark } from "./EquityChart";
import { useWatchlist } from "@/lib/watchlist-store";
import type { Pitch } from "@/lib/mock-pitches";

export function DiscoverPitchCard({ pitch }: { pitch: Pitch }) {
  const urgency = pitch.daysLeft <= 7;
  const router = useRouter();
  const { has, toggle } = useWatchlist();
  const saved = has(pitch.id);

  const goToDetail = () => router.push(`/discover/${pitch.id}`);

  return (
    <article
      onClick={goToDetail}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToDetail();
        }
      }}
      className="group relative bg-card rounded-2xl ring-1 ring-[color:var(--border)] overflow-hidden flex flex-col cursor-pointer hover:ring-foreground/30 hover:shadow-xl hover:shadow-foreground/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[color:var(--gold)]/40 to-transparent z-10"
      />

      <div className={`relative aspect-video bg-gradient-to-br ${pitch.posterColor} overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(255,255,255,.3) 0, transparent 50%)",
          }}
        />
        <button
          type="button"
          aria-label={`Play ${pitch.company} pitch`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/discover/${pitch.id}#video`);
          }}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
        >
          <span className="size-14 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center group-hover:bg-[color:var(--gold)] group-hover:ring-[color:var(--gold)] transition-all">
            <span className="text-white group-hover:text-[color:var(--gold-foreground)] translate-x-0.5 text-lg">▶</span>
          </span>
        </button>

        <div className="absolute top-3 left-3 flex gap-1.5">
          {pitch.verified && (
            <span className="bg-[color:var(--gold)] text-[color:var(--gold-foreground)] text-[9px] font-bold pl-1 pr-2 py-0.5 rounded-full uppercase tracking-tighter inline-flex items-center gap-1">
              <VerifiedLeafBadge size={11} />
              Verified
            </span>
          )}
          <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
            {pitch.stage}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggle(pitch.id);
            }}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${pitch.company} from watchlist` : `Save ${pitch.company} to watchlist`}
            title={saved ? "Saved · click to remove" : "Save to watchlist"}
            className={`size-8 rounded-full backdrop-blur-md ring-1 flex items-center justify-center text-sm cursor-pointer transition-all ${
              saved
                ? "bg-[color:var(--gold)] text-[color:var(--gold-foreground)] ring-[color:var(--gold)]"
                : "bg-black/40 text-white/90 ring-white/20 hover:bg-[color:var(--gold)] hover:text-[color:var(--gold-foreground)] hover:ring-[color:var(--gold)]"
            }`}
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {urgency && (
            <span className="bg-[color:var(--gold)] text-[color:var(--gold-foreground)] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
              Closing soon
            </span>
          )}
          <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
            0:60
          </span>
        </div>

        <div className="absolute -bottom-5 left-5 right-5 flex items-end gap-3 z-10">
          <Link
            href={`/founder/${pitch.founderId}`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`View ${pitch.founder}'s profile`}
            className="rounded-full hover:scale-105 transition-transform cursor-pointer"
          >
            <FounderAvatar name={pitch.founder} size={44} />
          </Link>
        </div>
      </div>

      <div className="p-5 pt-7 flex flex-col flex-1">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
          <span>{pitch.sector} · {pitch.location}</span>
          <span className={urgency ? "text-[color:var(--gold)] font-bold" : ""}>{pitch.daysLeft}d left</span>
        </div>

        <h3 className="font-display text-2xl uppercase tracking-tight leading-tight">
          {pitch.company}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          by{" "}
          <Link
            href={`/founder/${pitch.founderId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-foreground underline decoration-[color:var(--gold)]/40 underline-offset-2 transition-colors cursor-pointer"
          >
            {pitch.founder}
          </Link>
        </p>

        <p className="text-sm mt-3 text-foreground/80 leading-relaxed line-clamp-2 flex-1">
          {pitch.hook}
        </p>

        <div className="mt-5 -mx-1 px-1 py-3 border-y border-dashed border-[color:var(--border)]">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            <span>12-mo traction</span>
            <span className="text-[color:var(--primary)] font-bold">
              ↗ {pitch.traction[pitch.traction.length - 1]}x
            </span>
          </div>
          <TractionSpark data={pitch.traction} height={32} width={260} />
        </div>

        <div className="flex items-stretch mt-4 text-xs">
          <Stat label="Ask" value={pitch.asking} />
          <NodeDivider />
          <Stat label="Val" value={pitch.valuation} />
          <NodeDivider />
          <Stat label="Backers" value={String(pitch.investors)} />
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
            <span>{pitch.equityOffered}% equity</span>
            <span className="text-foreground font-bold">{pitch.raised}% raised</span>
          </div>
          <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-[color:var(--gold)] rounded-full"
              style={{ width: `${pitch.raised}%` }}
            />
            {[25, 50, 75].map((t) => (
              <span
                key={t}
                aria-hidden="true"
                className="absolute top-0 bottom-0 w-px bg-background"
                style={{ left: `${t}%` }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Link
            href={`/discover/${pitch.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-widest border border-[color:var(--input)] rounded-lg hover:bg-secondary transition-all cursor-pointer"
          >
            View
          </Link>
          <Link
            href={`/discover/${pitch.id}#invest`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground rounded-lg hover:opacity-90 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BambooLeaf size={11} className="text-[color:var(--gold)]" />
            Plant Capital
          </Link>
        </div>
      </div>
    </article>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 px-2 first:pl-0 last:pr-0">
      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-bold font-mono text-sm mt-0.5 tabular-nums">{value}</p>
    </div>
  );
}

function NodeDivider() {
  return (
    <span
      aria-hidden="true"
      className="relative w-px bg-[color:var(--border)] mx-1 self-stretch"
    >
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[color:var(--gold)]/40 ring-2 ring-[color:var(--card)]" />
    </span>
  );
}
