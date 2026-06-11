/**
 * Client-side Sentry init (Phase 7.3). Runs after the HTML loads, before
 * hydration. Inert until NEXT_PUBLIC_SENTRY_DSN is set — local dev and
 * preview builds without a DSN report nothing.
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    // Beta-cohort scale (~100 users): trace everything; revisit before
    // opening up.
    tracesSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
