#!/usr/bin/env node
// Bamboo invite-code minter.
//
// Creates invite codes in the `invites` Firestore collection for the
// invite-only launch cohort. Each code allows `--uses` registrations
// (default 1). Codes look like BAMBOO-7F3K-Q2XN.
//
// Usage (from the repo root, needs scripts/service-account.json):
//   node scripts/generate-invites.mjs                  # 10 single-use codes
//   node scripts/generate-invites.mjs --count 100      # the launch batch
//   node scripts/generate-invites.mjs --count 1 --uses 25 --note "uni demo day"
//
// Prints the minted codes to stdout — pipe to a file to hand out:
//   node scripts/generate-invites.mjs --count 100 > invites.txt

import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = resolve(__dirname, 'service-account.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf8'));
} catch (e) {
  console.error(
    `\n  ✕ Could not read ${KEY_PATH}\n` +
      `    Download a service-account key from\n` +
      `    https://console.firebase.google.com/project/bambooo-5d4d2/settings/serviceaccounts/adminsdk\n` +
      `    and save it at scripts/service-account.json.\n`,
  );
  process.exit(1);
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const count = parseInt(arg('count', '10'), 10);
const maxUses = parseInt(arg('uses', '1'), 10);
const note = arg('note', '');

if (!Number.isInteger(count) || count < 1 || count > 1000) {
  console.error('  ✕ --count must be 1–1000');
  process.exit(1);
}
if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 1000) {
  console.error('  ✕ --uses must be 1–1000');
  process.exit(1);
}

// Unambiguous alphabet — no 0/O/1/I/L so codes survive being read aloud.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function segment(len) {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const now = Date.now();

const batch = db.batch();
const codes = [];
for (let i = 0; i < count; i++) {
  const code = `BAMBOO-${segment(4)}-${segment(4)}`;
  codes.push(code);
  batch.set(db.collection('invites').doc(code), {
    code,
    maxUses,
    usedCount: 0,
    usedBy: [],
    note,
    createdAt: now,
  });
}

await batch.commit();

console.error(`\n  ✓ Minted ${count} invite code(s) · ${maxUses} use(s) each${note ? ` · "${note}"` : ''}\n`);
for (const code of codes) console.log(code);
