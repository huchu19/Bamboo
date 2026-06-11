'use client';

import { useEffect } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/bamboo/SiteNav";
import { BambooLeaf } from "@/components/bamboo/BambooIcons";

export default function GroveError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Errors caught by this boundary never reach Sentry's global handlers,
    // so report explicitly. No-op while no DSN is configured.
    import("@sentry/nextjs")
      .then((Sentry) => Sentry.captureException(error))
      .catch(() => {});
    if (process.env.NODE_ENV !== "production") {
      console.error("[Grove error boundary]", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />

      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Something snapped in the canopy
          </p>

          <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter leading-[0.9] mt-6">
            A Branch
            <br />
            Broke.
          </h1>

          <p className="text-base md:text-lg text-foreground/70 mt-6 max-w-md mx-auto leading-snug">
            We hit an unexpected error while loading this view. Tend the grove
            again — most of the time a fresh attempt works.
          </p>

          {error.digest && (
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-6">
              Reference · {error.digest}
            </p>
          )}

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={reset}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-primary to-[color:var(--primary-deep)] text-primary-foreground rounded-lg hover:opacity-90 transition-all inline-flex items-center justify-center gap-2"
            >
              <BambooLeaf size={12} className="text-[color:var(--gold)]" />
              Try again
            </button>
            <Link
              href="/"
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-[color:var(--input)] rounded-lg hover:bg-secondary transition-all"
            >
              Back to Start
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
