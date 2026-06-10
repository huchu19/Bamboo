# Production Checklist

Things to verify before pointing real users at `bamboo-xi-ebon.vercel.app`.
Walk this top-to-bottom; mark items off as they pass.

## Build & Deploy

- [ ] `web/` builds clean: `cd web && npm run build` — zero warnings
- [ ] `npx tsc --noEmit` from `web/` exits 0
- [ ] Vercel preview URL matches what you expect to ship
- [ ] `vercel.json` reflects the actual project root (currently `web/` set in dashboard)

## Environment Variables (Vercel → Production)

- [ ] `NEXT_PUBLIC_FIREBASE_*` — all 7 vars, matching your local `.env.local`
- [ ] `NEXT_PUBLIC_DEV_BYPASS_AUTH=false`
- [ ] `NEXT_PUBLIC_SITE_URL=https://bamboo-xi-ebon.vercel.app`
- [ ] Stripe keys: still `*_stub` until Phase 8 — verify nothing crashes
- [ ] No secret keys mistakenly added to `NEXT_PUBLIC_*` (those leak to the browser)

## Firebase (see [PHASE_C_DEPLOY.md](./PHASE_C_DEPLOY.md))

- [ ] Firestore rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Firestore indexes built (check Firestore → Indexes, all "Enabled")
- [ ] Storage rules deployed (`firebase deploy --only storage:rules`)
- [ ] Seed data loaded (`node scripts/seed-firestore.mjs`)
- [ ] Authorized domains include `bamboo-xi-ebon.vercel.app`
- [ ] Email/Password sign-in method enabled

## Smoke test on production

- [ ] `/` loads, no console errors, no "Firebase not configured" warning
- [ ] `/discover` shows the three seeded pitches
- [ ] Sign up as a new investor — Firestore user doc created
- [ ] Sign up as a new inventor — `/pitch/new` accepts a submission
- [ ] Newly created pitch appears on `/discover/{id}` with documents
- [ ] Watchlist toggle persists across refresh
- [ ] Invest modal records → inventor dashboard counter ticks up
- [ ] Invest modal "Investing as Anonymous backer" toggle: founder sees
  "Anonymous backer" + masked avatar; investor's own dashboard shows the
  Anonymous pill on that row
- [ ] Mobile filter drawer opens, applies filters, dismisses on Escape

## Defensive

- [ ] Try an unauthenticated invest call (DevTools → Network) — rejected
- [ ] Try writing to another user's `/users/{otherUid}` doc — rejected
- [ ] Try uploading to a pitch you don't own — rejected
- [ ] `/discover/<random-id-that-does-not-exist>` renders the 404 page
- [ ] Force an error (e.g. throw in a page) — error boundary renders, not a stack trace

## Performance

- [ ] Lighthouse on `/` — ≥ 90 Performance, ≥ 90 Accessibility, ≥ 95 SEO
- [ ] Lighthouse on `/discover` — ≥ 90 Performance
- [ ] LCP < 2s on a throttled connection (Lighthouse's "Slow 4G")
- [ ] No unused JS chunks > 50 kB in Vercel's bundle analyzer

## After Launch

- [ ] Wire Sentry (or equivalent) to receive the `error.digest` references
  that `app/error.tsx` already surfaces. Until then, errors are silent in prod.
- [ ] Set a Vercel cron for `firebase deploy --only firestore:indexes` when
  you touch `firestore.indexes.json` (it's a no-op when no changes).
- [ ] Decide on Stripe Connect vs. simple charges — see MILESTONES.md Phase 8.
- [ ] Build the Callable Function that redacts `investorId` on investment reads
  when `anonymous=true` and the caller is not the investor. Today's UI-only
  anonymity is good enough for an MVP but not for a real privacy promise.
