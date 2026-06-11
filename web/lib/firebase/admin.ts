/**
 * Firebase Admin SDK init — server-side only (API routes, webhooks).
 *
 * Credential resolution order:
 *   1. FIREBASE_SERVICE_ACCOUNT_KEY env var — the full service-account JSON as
 *      a string. This is how production (Vercel) is configured.
 *   2. ../scripts/service-account.json — local dev fallback (gitignored).
 */

import 'server-only';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let app: App | null = null;

function loadServiceAccount(): Record<string, string> {
  const fromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (fromEnv) return JSON.parse(fromEnv);

  const keyPath = resolve(process.cwd(), '../scripts/service-account.json');
  try {
    return JSON.parse(readFileSync(keyPath, 'utf8'));
  } catch {
    throw new Error(
      'Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_KEY ' +
        'or place the service-account JSON at scripts/service-account.json.',
    );
  }
}

function getApp(): App {
  if (!app) {
    app = getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount()) });
  }
  return app;
}

export function getAdminDb(): Firestore {
  return getFirestore(getApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getApp());
}

/**
 * Verify a `Authorization: Bearer <firebase-id-token>` header and return the
 * caller's uid, or null when the header is missing/invalid. API routes that
 * act on a user's behalf must call this — never trust uids in request bodies.
 */
export async function verifyBearerToken(authorization: string | null): Promise<string | null> {
  if (!authorization?.startsWith('Bearer ')) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice('Bearer '.length));
    return decoded.uid;
  } catch {
    return null;
  }
}
