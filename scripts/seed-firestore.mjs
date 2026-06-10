#!/usr/bin/env node
// Bamboo Firestore seeder.
//
// Seeds the 3 demo pitches (EduNexus / Ledgr / Northbound) and their founder
// profiles into Firestore so that flipping NEXT_PUBLIC_DEV_BYPASS_AUTH=false
// doesn't leave the discovery feed empty.
//
// Usage:
//   1) Download a service-account JSON key from the Firebase console
//      (Project Settings → Service accounts → Generate new private key).
//   2) Save it as ./scripts/service-account.json (gitignored).
//   3) From the repo root:
//        npm install --no-save firebase-admin
//        node scripts/seed-firestore.mjs
//
// The script is idempotent — re-running it overwrites the same doc IDs.

import { readFileSync } from 'node:fs';
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

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const now = Date.now();

const FOUNDERS = [
  {
    id: 'hussain-naqvi',
    displayName: 'Hussain Naqvi',
    title: 'Founder & CEO · EduNexus',
    bio:
      'AI-systems engineer turned founder. Building EduNexus, a curriculum studio for teachers and a mastery cockpit for students.',
    location: 'London, UK',
    isVerified: true,
  },
  {
    id: 'daniel-okafor',
    displayName: 'Daniel Okafor',
    title: 'Founder & CEO · Ledgr',
    bio:
      'Ex-Stripe payments engineer. Building Ledgr to fix emerging-market B2B settlements.',
    location: 'Lagos, NG',
    isVerified: true,
  },
  {
    id: 'iris-lindqvist',
    displayName: 'Iris Lindqvist',
    title: 'Founder & CEO · Northbound',
    bio:
      'Metallurgist & climate-tech founder. Carbon-negative steel via hydrogen reduction.',
    location: 'Stockholm, SE',
    isVerified: true,
  },
];

// Numeric goals (dollars). The seed treats display values like "$2.3M" as ints.
const PITCHES = [
  {
    id: 'edunexus',
    inventorId: 'hussain-naqvi',
    inventorName: 'Hussain Naqvi',
    title: 'EduNexus',
    tagline: 'AI-powered adaptive learning',
    description:
      'A curriculum studio for teachers, a mastery cockpit for students. EduNexus uses adaptive AI to personalise every learning path.',
    category: 'education',
    tags: ['ai', 'edtech', 'k12'],
    fundingGoal: 230_000_000, // $2.3M in cents
    minimumInvestment: 630_000, // $6,300 in cents
    equityOffered: 20,
    amountRaised: 142_600_000, // 62% of $2.3M, in cents
    status: 'live',
    isVerified: true,
    investorCount: 47,
    listingFeePaid: true,
    verifiedBadgePaid: true,
    videoURL: '', // wire to the hosted Vercel Blob URL from demo-assets.json
    documents: [],
    viewCount: 4218,
    watchlistCount: 312,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  },
  {
    id: 'ledgr',
    inventorId: 'daniel-okafor',
    inventorName: 'Daniel Okafor',
    title: 'Ledgr',
    tagline: 'Stripe for emerging-market B2B settlements',
    description:
      'Programmable cross-border B2B settlement rails for the emerging-market mid-market.',
    category: 'fintech',
    tags: ['fintech', 'payments', 'emerging-markets'],
    fundingGoal: 800_000_000,
    minimumInvestment: 500_000,
    equityOffered: 9,
    amountRaised: 648_000_000,
    status: 'live',
    isVerified: true,
    investorCount: 112,
    listingFeePaid: true,
    verifiedBadgePaid: true,
    videoURL: '',
    documents: [],
    viewCount: 9081,
    watchlistCount: 540,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  },
  {
    id: 'northbound',
    inventorId: 'iris-lindqvist',
    inventorName: 'Iris Lindqvist',
    title: 'Northbound',
    tagline: 'Carbon-negative steel via hydrogen reduction',
    description:
      'Direct-reduced iron + green hydrogen — a path to carbon-negative steel for hard-to-decarbonise industries.',
    category: 'sustainability',
    tags: ['climatetech', 'hardware', 'industrial'],
    fundingGoal: 1_200_000_000,
    minimumInvestment: 500_000,
    equityOffered: 15,
    amountRaised: 492_000_000,
    status: 'live',
    isVerified: true,
    investorCount: 23,
    listingFeePaid: true,
    verifiedBadgePaid: true,
    videoURL: '',
    documents: [],
    viewCount: 2117,
    watchlistCount: 188,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  },
];

async function seed() {
  console.log('Seeding founders…');
  for (const f of FOUNDERS) {
    await db.collection('founders').doc(f.id).set(f, { merge: true });
    console.log(`  · ${f.id}`);
  }

  console.log('Seeding pitches…');
  for (const p of PITCHES) {
    await db.collection('pitches').doc(p.id).set(p, { merge: true });
    console.log(`  · ${p.id}`);
  }

  console.log('\n✓ Seed complete.');
  console.log('Tip: re-run any time you change the seed data — writes are upserts.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
