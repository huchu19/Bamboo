# Production Checklist

Things to verify before pointing real users at `bamboo-xi-ebon.vercel.app`
(or the custom domain once attached). Walk this top-to-bottom; mark items
off as they pass.

> Updated 2026-06-11 for Phase 6 (real Stripe payments) and Phase 7
> (invites, Sentry, onboarding). The old "Stripe is stubbed" assumptions no
> longer apply.

## Build & Deploy

- [ ] `web/` builds clean: `cd web && npm run build` — zero warnings
- [ ] `npx tsc --noEmit` from `web/` exits 0
- [ ] Vercel preview URL matches what you expect to ship
- [ ] `vercel.json` reflects the actual project root (currently `web/` set in dashboard)

## Environment Variables (Vercel → Production)

Firebase:
- [ ] `NEXT_PUBLIC_FIREBASE_*` — all 7 vars, matching your local `.env.local`
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` — full service-account JSON as one line.
      **Required**: the Stripe webhook, refunds, and invite redemption all
      run on the Admin SDK and fail without it.

Stripe (Phase 6 — real payments):
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — `pk_live_...` for launch
      (`pk_test_...` on previews)
- [ ] `STRIPE_SECRET_KEY` — `sk_live_...` (server-only, never `NEXT_PUBLIC_`)
- [ ] `STRIPE_WEBHOOK_SECRET` — from the **production** webhook endpoint:
      Stripe dashboard → Webhooks → Add endpoint →
      `https://<domain>/api/stripe/webhook`, subscribed to
      `payment_intent.succeeded`, `payment_intent.payment_failed`,
      `charge.refunded`
- [ ] `STRIPE_CONNECT_ACCOUNT_ID` — leave as `acct_stub` until payouts are
      activated (steps in MILESTONES.md §6.2)

Launch posture (Phase 7):
- [ ] `NEXT_PUBLIC_DEV_BYPASS_AUTH=false`
- [ ] `NEXT_PUBLIC_INVITE_REQUIRED=true` — registration then needs a code
      from `node scripts/generate-invites.mjs --count 100`
- [ ] `NEXT_PUBLIC_SENTRY_DSN` — from the Sentry project; plus
      `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` for source maps
- [ ] `NEXT_PUBLIC_SITE_URL=https://<production-domain>`
- [ ] No secret keys mistakenly added to `NEXT_PUBLIC_*` (those leak to the browser)

## Firebase (see [PHASE_C_DEPLOY.md](./PHASE_C_DEPLOY.md))

- [ ] Firestore rules deployed (`firebase deploy --only firestore:rules`) —
      includes the `invites` / `inviteRedemptions` lockdown
- [ ] Optional hard invite enforcement: enable the `inviteRedemptions`
      clause on `users.create` in `firestore.rules` (see inline comment)
      and redeploy **together with** `NEXT_PUBLIC_INVITE_REQUIRED=true`
- [ ] Firestore indexes built (check Firestore → Indexes, all "Enabled")
- [ ] Storage rules deployed (`firebase deploy --only storage:rules`)
- [ ] Seed data loaded (`node scripts/seed-firestore.mjs`)
- [ ] Invite codes minted (`node scripts/generate-invites.mjs --count 100 > invites.txt`)
- [ ] Authorized domains include the production domain
- [ ] Email/Password sign-in method enabled

## Smoke test on production

- [ ] `/` loads, no console errors, no "Firebase not configured" warning
- [ ] `/discover` shows the three seeded pitches
- [ ] Register **without** an invite code → blocked with a friendly error
- [ ] Register with a fresh code → account created, code's `usedCount`
      incremented, onboarding modal appears once (and not on next login)
- [ ] Sign up as a new inventor — `/pitch/new` walks to the payment step,
      4242 test card (preview) or real card (prod) pays the $49 fee, pitch
      flips to `live` via the webhook within seconds
- [ ] Newly created pitch appears on `/discover/{id}` with documents
- [ ] Watchlist toggle persists across refresh
- [ ] Invest with the modal → webhook writes the investment → investor
      dashboard shows it in real time (Firestore, not localStorage)
- [ ] Stripe receipt email arrives (live mode only)
- [ ] Founder dashboard → Your Pitches → Cancel & refund: pitch leaves
      Discover, investments flip to `refunded`, Stripe shows the refunds
- [ ] Invest modal "Investing as Anonymous backer" toggle: founder sees
  "Anonymous backer" + masked avatar; investor's own dashboard shows the
  Anonymous pill on that row
- [ ] Mobile filter drawer opens, applies filters, dismisses on Escape

## Defensive

- [ ] Try an unauthenticated invest call (DevTools → Network) — rejected
- [ ] `POST /api/pitch/cancel` without a Bearer token → 401; with another
      user's pitch → 403
- [ ] `POST /api/invites/redeem` with a used-up code → 409
- [ ] Try writing to another user's `/users/{otherUid}` doc — rejected
- [ ] Try reading `/invites/{anything}` from the client — rejected
- [ ] Try uploading to a pitch you don't own — rejected
- [ ] `/discover/<random-id-that-does-not-exist>` renders the 404 page
- [ ] Force an error (e.g. throw in a page) — error boundary renders, not a
      stack trace, and the event shows up in Sentry

## Performance

Local prod-build baseline (2026-06-11, Lighthouse 13 / simulated 4G):
`/` = 94 perf / 94 a11y / 100 BP / 100 SEO · `/discover` = 85 perf / 94 /
100 / 100. The `/discover` gap is LCP-only (hero headline repaint under
font swap on throttled 4G); TBT is ~50 ms on both pages.

- [ ] Re-run Lighthouse against the **deployed** URL (CDN + HTTP/2 move LCP
      materially) — targets: ≥ 90 Performance, ≥ 90 Accessibility, ≥ 95 SEO
- [ ] If `/discover` still misses 90: investigate `font-display` on the
      Anton display font / consider `Reveal` skip on first viewport
- [ ] No unused JS chunks > 50 kB in Vercel's bundle analyzer (Sentry is
      lazy-loaded and tree-shaken out of DSN-less builds — keep it that way)

## After Launch

- [ ] Watch the Sentry inbox for the first week; the `error.digest` refs on
      the error page now link to real events
- [ ] Uptime monitoring (Better Uptime / Vercel monitor) pointed at `/` and
      `/api/stripe/webhook` (HEAD)
- [ ] Activate Stripe Connect payouts when the recipient account is ready —
      MILESTONES.md §6.2 has the steps
- [ ] Build the Callable Function that redacts `investorId` on investment reads
  when `anonymous=true` and the caller is not the investor. Today's UI-only
  anonymity is good enough for an MVP but not for a real privacy promise.
