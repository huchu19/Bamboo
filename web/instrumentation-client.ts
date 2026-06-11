/**
 * Client-side Sentry init (Phase 7.3). Runs after the HTML loads, before
 * hydration. Inert until NEXT_PUBLIC_SENTRY_DSN is set — and because that
 * env var is inlined at build time, DSN-less builds dead-code-eliminate the
 * dynamic import and ship zero Sentry bytes to the client.
 */

type SentryModule = typeof import('@sentry/nextjs');

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

let sentry: SentryModule | null = null;

if (dsn) {
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
      // Beta-cohort scale (~100 users): trace everything; revisit before
      // opening up.
      tracesSampleRate: 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0,
    });
    sentry = Sentry;
  });
}

export function onRouterTransitionStart(
  url: string,
  navigationType: 'push' | 'replace' | 'traverse',
): void {
  sentry?.captureRouterTransitionStart(url, navigationType);
}
