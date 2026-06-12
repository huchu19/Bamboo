'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { SiteNav } from '@/components/bamboo/SiteNav';
import type { User } from '@/types';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-[color:var(--border)] px-5 py-4 text-center">
      <p className="font-display text-2xl text-foreground">{value}</p>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground font-medium">{value || <span className="text-muted-foreground/50 italic font-normal">Not set</span>}</p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, firebaseUser, isLoading, isAuthenticated, devBypass } = useAuth();
  const [firestoreUser, setFirestoreUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!firebaseUser || devBypass) return;
    setLoadingProfile(true);
    import('@/lib/firebase/firestore').then(({ getUser }) =>
      getUser(firebaseUser.uid)
    ).then((u) => {
      setFirestoreUser(u);
    }).finally(() => setLoadingProfile(false));
  }, [firebaseUser, devBypass]);

  const profile = devBypass ? user : (firestoreUser ?? user);

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteNav />
        <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-[color:var(--gold)] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isInventor = profile.role === 'inventor';
  const isInvestor = profile.role === 'investor';
  const inv = profile.inventorProfile;
  const inves = profile.investorProfile;

  const initials = profile.displayName
    ? profile.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : profile.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Avatar + name */}
        <div className="rounded-2xl bg-card ring-1 ring-[color:var(--border)] p-8">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ background: 'var(--primary)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl tracking-tight truncate">{profile.displayName || 'Unnamed'}</h1>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/30 text-[color:var(--gold)] px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest">
                  {profile.role}
                </span>
                {inv?.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/60 mt-5">
            Member since {memberSince}
          </p>
        </div>

        {/* Role-specific stats */}
        {isInventor && inv && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Pitches" value={String(inv.totalPitches)} />
            <StatCard
              label="Funds Raised"
              value={
                inv.totalFundsRaised >= 100
                  ? `$${(inv.totalFundsRaised / 100).toLocaleString()}`
                  : '$0'
              }
            />
          </div>
        )}

        {isInvestor && inves && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Portfolio" value={String(inves.portfolioCount)} />
            <StatCard
              label="Total Invested"
              value={
                inves.investmentTotal >= 100
                  ? `$${(inves.investmentTotal / 100).toLocaleString()}`
                  : '$0'
              }
            />
          </div>
        )}

        {/* Profile details */}
        <div className="rounded-2xl bg-card ring-1 ring-[color:var(--border)] p-8 space-y-5">
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Account Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Display Name" value={profile.displayName} />
            <Field label="Email" value={profile.email} />
          </div>

          {isInventor && inv && (
            <>
              <div className="h-px bg-[color:var(--border)]" />
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Founder Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Company" value={inv.companyName} />
                <Field label="Website" value={inv.website} />
                <Field label="LinkedIn" value={inv.linkedIn} />
              </div>
              {inv.bio && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{inv.bio}</p>
                </div>
              )}
            </>
          )}

          {isInvestor && inves && inves.preferredCategories.length > 0 && (
            <>
              <div className="h-px bg-[color:var(--border)]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Preferred Categories</p>
                <div className="flex flex-wrap gap-2">
                  {inves.preferredCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center bg-secondary border border-[color:var(--border)] text-foreground/70 px-3 py-1 rounded-full text-[11px] font-mono capitalize"
                    >
                      {cat.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 py-3 text-center bg-[color:var(--gold)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/contact"
            className="flex-1 py-3 text-center bg-secondary border border-[color:var(--border)] text-muted-foreground rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-muted transition-all"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}
