'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteNav } from '@/components/bamboo/SiteNav';
import { FounderAvatar } from '@/components/bamboo/FounderAvatar';
import { DiscoverPitchCard } from '@/components/bamboo/DiscoverPitchCard';
import { BambooDivider } from '@/components/bamboo/BambooDivider';
import { Reveal } from '@/components/bamboo/Reveal';
import { VerifiedLeafBadge } from '@/components/bamboo/BambooIcons';
import { getFounder } from '@/lib/mock-founders';
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
        <span>Inventors</span>
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
              Inventor · {founder.location}
            </p>
            <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter leading-[0.9] mt-2">
              {founder.name}
            </h1>
            <p className="text-lg text-foreground/70 mt-4 max-w-xl leading-snug">{founder.bio}</p>
            <div className="flex items-center gap-5 mt-5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
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
            This inventor hasn’t listed any pitches yet.
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

    </div>
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
