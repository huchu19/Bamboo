'use client';

/**
 * First-login beta onboarding (Phase 7.4). Shows once per account on the
 * first signed-in page view — dismissal is remembered per uid in
 * localStorage, so a shared machine doesn't hide it for the next user.
 * Never renders in dev bypass (the demo doesn't need a welcome).
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const STORAGE_PREFIX = 'bamboo:onboarded:';

export function OnboardingModal() {
  const { user, devBypass, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const uid = user?.uid;
  const role = user?.role;

  useEffect(() => {
    if (devBypass || !isAuthenticated || !uid) return;
    try {
      if (!window.localStorage.getItem(STORAGE_PREFIX + uid)) setOpen(true);
    } catch {
      // Storage unavailable (private mode) — skip rather than nag every view.
    }
  }, [devBypass, isAuthenticated, uid]);

  if (!open) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + uid, String(Date.now()));
    } catch {
      // ignore
    }
    setOpen(false);
  }

  const steps =
    role === 'inventor'
      ? [
          ['🎬', 'Plant your pitch', 'A 60-second video, your documents, and your raise terms — the wizard walks you through it.'],
          ['💳', 'One listing fee', 'A one-time $49 fee publishes your pitch to every investor in the grove.'],
          ['🌱', 'Watch it grow', 'Track backers, raised capital, and inbound interest from your dashboard.'],
        ]
      : [
          ['🔍', 'Walk the grove', 'Browse 60-second founder pitches in Discover — filter by sector and stage.'],
          ['💰', 'Plant capital', 'Invest from $100. Funds are held in escrow via Stripe until the round closes.'],
          ['📊', 'Track your sprouts', 'Your portfolio, equity, and watchlist live in the investor dashboard.'],
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the Bamboo beta"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative w-full sm:max-w-md bg-[color:var(--ink)] text-[color:var(--ink-foreground)] rounded-t-3xl sm:rounded-3xl ring-1 ring-white/10 bamboo-grain p-7">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)]">
          Private Beta · Welcome
        </p>
        <h2 className="font-display text-3xl uppercase tracking-tighter mt-2">
          Welcome to the grove
        </h2>
        <p className="text-sm text-white/60 mt-2 leading-relaxed">
          You&apos;re one of ~100 invited members of the Bamboo beta. Here&apos;s the lay of
          the land{role === 'inventor' ? ', founder' : ''}:
        </p>

        <ul className="mt-5 space-y-4">
          {steps.map(([icon, title, copy]) => (
            <li key={title} className="flex gap-3">
              <span className="text-xl shrink-0" aria-hidden="true">
                {icon}
              </span>
              <span>
                <span className="block text-sm font-bold text-white/90">{title}</span>
                <span className="block text-xs text-white/55 mt-0.5 leading-relaxed">{copy}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[10px] font-mono text-white/40 leading-relaxed">
          It&apos;s a beta — if anything looks off, use the Contact page and we&apos;ll fix it
          fast.
        </p>

        <button
          type="button"
          onClick={dismiss}
          className="mt-5 w-full py-4 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--gold-soft)] text-[color:var(--gold-foreground)] rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all"
        >
          Start growing
        </button>
      </div>
    </div>
  );
}
