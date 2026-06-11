/**
 * Server instrumentation hook (Next.js convention). Loads the runtime-
 * appropriate Sentry config and forwards server request errors to Sentry.
 * Everything here is a no-op until a DSN is configured.
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
