# Phase C — Flip the bypass & lock down Firebase

When Phase 4 + 5 polish is locked and the demo is approved, run these steps to
move Bamboo from "dev bypass on / mocked data" to "real Firebase / locked-down
rules".

Order matters. Each step assumes the previous one succeeded.

---

## 0. One-time CLI setup

```bash
npm install -g firebase-tools
firebase login
```

Confirm the project is selected:

```bash
firebase use bambooo-5d4d2     # matches .firebaserc
```

---

## 1. Deploy security rules + indexes

The rules + indexes live in the repo root:

| File | Deploys to |
|---|---|
| [`firestore.rules`](../firestore.rules) | Cloud Firestore |
| [`firestore.indexes.json`](../firestore.indexes.json) | Cloud Firestore |
| [`storage.rules`](../storage.rules) | Cloud Storage |

Dry-run first:

```bash
firebase deploy --only firestore:rules --dry-run
firebase deploy --only firestore:indexes --dry-run
firebase deploy --only storage:rules --dry-run
```

Then deploy for real:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

Indexes can take a few minutes to build. The console shows progress at
**Firestore → Indexes**.

---

## 2. Seed the demo pitches into Firestore

The rules require `inventorId == request.auth.uid` on pitch creation. The seed
script uses the **Admin SDK** which bypasses rules — so this is the only sane
path for one-time data import.

```bash
# Download a service-account key from
#   Project Settings → Service accounts → Generate new private key
# Save it as scripts/service-account.json (gitignored).

npm install --no-save firebase-admin
node scripts/seed-firestore.mjs
```

Re-running is safe — every write is a `set(..., { merge: true })` upsert.

---

## 3. Flip the bypass

Local:

```bash
# web/.env.local
NEXT_PUBLIC_DEV_BYPASS_AUTH=false
```

Vercel (Dashboard → bamboo → Settings → Environment Variables):

- **Production**: `NEXT_PUBLIC_DEV_BYPASS_AUTH=false`
- **Preview** (optional): keep `=true` if you want preview builds to stay in
  demo mode.

Trigger a redeploy after the env vars change.

---

## 4. Add the production domain to Firebase Auth

Firebase → Authentication → Settings → Authorized domains. Add:

- `bamboo-xi-ebon.vercel.app`
- `*.vercel.app` (covers preview deploys — only if you want auth to work
  there too)

Without this, the redirect-based login flow fails on the deployed URL.

---

## 5. Smoke test (in order)

1. Land on `/` — no console errors, no "Firebase not configured" warning.
2. `/discover` shows the three seeded pitches.
3. `/login` accepts a new email/password account.
4. `/pitch/new` (as the new account) submits → pitch appears in Firestore.
5. `/discover/{newPitchId}` renders.
6. Open `/investor/dashboard` as a second user → invest in the new pitch →
   the round-progress on the inventor dashboard ticks up.
7. Confirm Firestore counters match what the UI shows.

If any step throws, the rules are tighter than the data model can satisfy.
Check the Firestore log under **Rules → Rules playground**.

---

## Rollback

If something breaks at scale:

```bash
# Re-enable bypass globally (effectively pre-Phase-C behaviour)
vercel env add NEXT_PUBLIC_DEV_BYPASS_AUTH true production

# Or re-deploy a permissive rule set (TEMPORARY — replace within 24h)
firebase deploy --only firestore:rules \
  --message "TEMP: rollback to dev-mode rules"
```

The bypass returns the app to mock data; the permissive rules let the existing
Firebase-backed code paths breathe while you find the real bug.
