'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteNav } from '@/components/bamboo/SiteNav';
import { FounderAvatar } from '@/components/bamboo/FounderAvatar';
import { DiscoverPitchCard } from '@/components/bamboo/DiscoverPitchCard';
import { BambooDivider } from '@/components/bamboo/BambooDivider';
import { Reveal } from '@/components/bamboo/Reveal';
import { BambooLeaf, BambooNode, VerifiedLeafBadge } from '@/components/bamboo/BambooIcons';
import { getFounder, type FounderMilestone } from '@/lib/mock-founders';
import { getPitchesByFounder } from '@/lib/mock-pitches';

export default function FounderProfile({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = use(params);
  const founder = getFounder(founderId);
  if (!founder) return notFound();
  const pitches = getPitchesByFounder(founderId);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-7xl mx-auto px-6 pt-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <Link href="/discover" className="hover:text-foreground">
          Discover
        </Link>
        <span className="mx-2">/</span>
        <span>Founders</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">{founder.name}</span>
      </div>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="grid md:grid-cols-[auto_1fr_auto] gap-8 items-center">
          <div className="relative">
            <FounderAvatar name={founder.name} size={160} />
            {founder.rootVerified && (
              <span className="absolute -bottom-1 -right-1 bg-[color:var(--gold)] text-[color:var(--gold-foreground)] rounded-full p-1.5 ring-4 ring-background">
                <VerifiedLeafBadge size={20} />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Founder · {founder.location}
            </p>
            <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter leading-[0.9] mt-2">
              {founder.name}
            </h1>
            <p className="text-lg text-foreground/70 mt-4 max-w-xl leading-snug">{founder.bio}</p>
            <div className="flex items-center gap-5 mt-5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <span>
                <span className="text-foreground font-bold tabular-nums">
                  {founder.followers}
                </span>{' '}
                followers
              </span>
              <span className="text-[color:var(--border)]">·</span>
              <span>
                Active since{' '}
                <span className="text-foreground font-bold">
                  {formatActive(founder.activeSince)}
                </span>
              </span>
              <span className="text-[color:var(--border)]">·</span>
              <span>
                <span className="text-foreground font-bold tabular-nums">{pitches.length}</span>{' '}
                {pitches.length === 1 ? 'pitch' : 'pitches'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 self-start md:self-center">
            <button
              type="button"
              className="px-5 py-3 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg hover:opacity-90 transition-all inline-flex items-center justify-center gap-2"
            >
              <BambooLeaf size={12} />
              Follow Founder
            </button>
            <button
              type="button"
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest border border-[color:var(--input)] rounded-lg hover:bg-secondary transition-all"
            >
              Send Inquiry
            </button>
          </div>
        </div>
      </header>

      <BambooDivider label="The Grove" />

      {/* Their pitches */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Active seeds
            </p>
            <h2 className="font-display text-4xl uppercase tracking-tighter mt-1">
              Their Pitches
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {pitches.length} listed
          </span>
        </div>

        {pitches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-mono text-sm">
            This founder hasn’t listed any pitches yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitches.map((p, i) => (
              <Reveal key={p.id} delay={i * 80} as="div">
                <DiscoverPitchCard pitch={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <BambooDivider label="Track Record" />

      {/* Timeline + Backers */}
      <section className="max-w-7xl mx-auto px-6 pb-32 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Growth rings
          </p>
          <h2 className="font-display text-4xl uppercase tracking-tighter mt-1 mb-6">
            Timeline
          </h2>

          <ol className="relative pl-8">
            {/* Bamboo stalk spine */}
            <span
              aria-hidden="true"
              className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[color:var(--primary)] via-[color:var(--gold)] to-[color:var(--primary)]/30 rounded-full"
            />
            {founder.milestones.map((m, i) => (
              <Reveal key={i} delay={i * 60} as="li" className="relative pb-8 last:pb-0">
                <TimelineNode kind={m.kind} />
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {formatDate(m.date)}
                </p>
                <p className="font-display text-xl uppercase tracking-tight leading-tight mt-1">
                  {m.label}
                </p>
                {m.detail && (
                  <p className="text-sm text-foreground/70 mt-1">{m.detail}</p>
                )}
              </Reveal>
            ))}
          </ol>
        </div>

        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-card ring-1 ring-[color:var(--border)] rounded-3xl p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Backed by
            </p>
            <h3 className="font-display text-2xl uppercase tracking-tighter mt-1 mb-4">
              Trusted capital
            </h3>
            <ul className="space-y-2">
              {founder.backers.map((b) => (
                <li
                  key={b.name}
                  className="flex items-center justify-between p-3 bg-secondary/40 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-9 rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary-deep)] inline-flex items-center justify-center text-[color:var(--gold)] font-display text-base">
                      {b.name[0]}
                    </span>
                    <span className="font-bold text-sm">{b.name}</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
                    {b.kind}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-3xl p-6 ring-1 ring-white/10 bamboo-grain">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              Want to talk?
            </p>
            <h3 className="font-display text-2xl uppercase tracking-tighter mt-1">
              Get on their radar
            </h3>
            <p className="text-sm text-white/70 mt-2 leading-snug">
              Following surfaces this founder’s next listing in your feed before it goes
              public.
            </p>
            <button
              type="button"
              className="mt-4 w-full py-3 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all inline-flex items-center justify-center gap-2"
            >
              <BambooLeaf size={11} />
              Follow Founder
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function TimelineNode({ kind }: { kind: FounderMilestone['kind'] }) {
  const ring =
    kind === 'verified'
      ? 'bg-[color:var(--gold)] text-[color:var(--gold-foreground)]'
      : kind === 'raise'
        ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
        : 'bg-card text-[color:var(--primary)] ring-1 ring-[color:var(--primary)]/30';
  return (
    <span
      className={`absolute -left-8 top-0 size-6 rounded-full inline-flex items-center justify-center ring-4 ring-background ${ring}`}
    >
      {kind === 'verified' ? <VerifiedLeafBadge size={12} /> : <BambooNode size={12} />}
    </span>
  );
}

function formatDate(iso: string) {
  const [y, m] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

function formatActive(iso: string) {
  return formatDate(iso);
}
