#!/usr/bin/env node
// Bamboo admin-role granter.
//
// Sets role: 'admin' on a user's Firestore doc so they can reach /admin and
// the moderation API. Looks the user up by email via Firebase Auth.
//
// Usage (from the repo root, needs scripts/service-account.json):
//   node scripts/grant-admin.mjs you@example.com
//   node scripts/grant-admin.mjs you@example.com --revoke   # back to investor

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = resolve(__dirname, 'service-account.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch {
  console.error(
    `\n  ✕ Could not read ${KEY_PATH}\n` +
      `    Download a service-account key from\n` +
      `    https://console.firebase.google.com/project/bambooo-5d4d2/settings/serviceaccounts/adminsdk\n` +
      `    and save it at scripts/service-account.json.\n`,
  );
  process.exit(1);
}

const email = process.argv[2];
const revoke = process.argv.includes('--revoke');

if (!email || email.startsWith('--')) {
  console.error('\n  Usage: node scripts/grant-admin.mjs <email> [--revoke]\n');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db = getFirestore();

try {
  const user = await auth.getUserByEmail(email);
  const userRef = db.collection('users').doc(user.uid);
  const snap = await userRef.get();
  if (!snap.exists) {
    console.error(`\n  ✕ No Firestore user doc for ${email} (uid ${user.uid}).\n`);
    process.exit(1);
  }

  if (revoke) {
    await userRef.update({ role: 'investor', updatedAt: Date.now() });
    console.log(`\n  ✓ ${email} is no longer an admin (role → investor).\n`);
  } else {
    await userRef.update({ role: 'admin', updatedAt: Date.now() });
    console.log(`\n  ✓ ${email} is now an admin. Sign out and back in to refresh.\n`);
  }
  process.exit(0);
} catch (err) {
  console.error(`\n  ✕ ${err.message}\n`);
  process.exit(1);
}
