# Bamboo Implementation Status

> **Goal**: Ship to ~100 selected participants. See [MILESTONES.md](./MILESTONES.md)
> for the phase roadmap.

---

## ✅ Phase 1: Foundation — DONE
Monorepo, types, landing page, theme, Firebase scaffolding, Card components, nav, footer.

## ✅ Phase 2: Auth & Inventor Build — DONE
Login, register, role selector, password reset, `ProtectedRoute`, pitch creation wizard,
video/doc uploads, inventor dashboard, inventor layout.

## ✅ Phase 3: Investor Build — DONE
Discovery feed, search/filters/sort, pitch detail, watchlist toggle, investment modal,
investor dashboard, investor layout.

## ✅ Phase 4: Demo Polish — DONE
EduNexus real video/poster via Vercel Blob. 4-step investment modal with localStorage
persistence. Sticky invest CTA. EquityChart on traction section. Confetti on success.

---

## ✅ Phase 5: Auth Hardening & Real Persistence — DONE (2026-06-11)

### 5.1 Re-enable auth
- [x] Login form wired to Firebase (`loginUser` + post-login role redirect)
- [x] Register form wired to Firebase (`registerUser`)
- [x] Forgot-password wired to Firebase (`sendPasswordResetEmail`)
- [x] Email/Password provider enabled in Firebase console
- [x] `NEXT_PUBLIC_DEV_BYPASS_AUTH=false` in `web/.env.local` — real auth verified
      (signup tested end-to-end)
- [x] Auth-aware nav: `SiteNavActions` shows account menu / dashboard / logout when
      signed in, Login + Plant Your Seed when not

### 5.2 Discovery page
- [x] `usePitches` hook — reads Firestore when bypass off, mock fallback otherwise
- [x] Loading skeleton on discover grid

### 5.3 Data
- [x] Seeded 3 demo pitches + 3 founder profiles into Firestore
      (`scripts/seed-firestore.mjs`, idempotent upserts, needs gitignored
      `scripts/service-account.json`)

### 5.4 Security
- [x] Firestore security rules — deployed to `bambooo-5d4d2`
- [x] Firestore composite indexes — deployed
- [x] Cloud Storage rules — deployed (Blaze plan, us-east1)

### Carried forward
- [ ] Email-verification gating for pitch creation → Phase 7 onboarding
- [ ] Round-trip smoke tests (pitch creation, investment, watchlist) → during Phase 6

---

## 💳 Phase 6: Real Payments (Stripe) — IN PROGRESS

> Architecture: client confirms via Stripe Elements; the webhook
> (`/api/stripe/webhook`) is the single source of truth for fulfilment and
> writes to Firestore via the Admin SDK. While Stripe keys are `*_stub`, the
> invest flow falls back to the demo simulation, so dev keeps working.

### 6.0 Infrastructure
- [x] `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`, `firebase-admin` installed
- [x] `lib/stripe/server.ts` — server Stripe client (stub-aware)
- [x] `lib/stripe/client.ts` — browser loader + `isStripeEnabled()`
- [x] `lib/firebase/admin.ts` — Admin SDK (env var on Vercel, local key fallback)
- [x] `POST /api/stripe/payment-intent` — investment + listing fee intents
- [x] `POST /api/stripe/webhook` — signature-verified, idempotent fulfilment
- [ ] Paste real Stripe test keys into `web/.env.local` + set `STRIPE_WEBHOOK_SECRET`
- [ ] End-to-end test with `stripe listen` + 4242 test card

### 6.1 Listing fee
- [x] Webhook: payment confirmed → `listingFeePaid: true` + pitch goes live
      (Phase 8 will switch to `pending_review`)
- [x] Stripe Elements step on pitch submission wizard — pitch is created as
      `pending_payment` (invisible to discovery), $49 charged via the shared
      `PaymentStep` (new `light` variant), webhook flips it `live`
- [x] Handle failed/cancelled listing payments — unpaid pitch stays
      `pending_payment`; retry reuses the created pitch (no re-upload)

### 6.2 Investment payments
- [x] Investment modal: amount → review → **Stripe payment step** → success
- [x] `stripePaymentIntentId` stored on investment record (webhook)
- [x] Webhook: investment `completed` + pitch counters bumped in one transaction
- [x] `payments/{pi_id}` audit record on success/failure
- [x] Investor dashboard reads investments from Firestore in real time —
      `useInvestorInvestments` hook (`onSnapshot`, investorId == uid); dev
      bypass still uses the localStorage store for demo data
- [x] Stripe Connect payouts **stubbed** — `STRIPE_CONNECT_ACCOUNT_ID` env
      var routes investment intents via `transfer_data.destination` when set
      to a real `acct_...` id; activation steps in MILESTONES.md §6.2

### 6.3 Refunds & edge cases
- [ ] Cancelled pitch → trigger refund for all investments
- [ ] Failed payment → surfaced in payments collection (recorded); UI retry flow
- [ ] Stripe built-in receipt emails

---

## 🚀 Phase 7: Hosting & Launch — TODO

- [ ] Deploy to Vercel under custom domain
- [ ] Configure production env vars (Firebase prod project + Stripe live keys)
- [ ] Confirm `NEXT_PUBLIC_DEV_BYPASS_AUTH=false` in Vercel production
- [ ] Separate Firebase production project (not the dev/test project)
- [ ] Firebase App Check enabled on production project
- [ ] Firestore composite indexes deployed to production
- [ ] Sentry JS error monitoring integrated
- [ ] Uptime monitoring configured
- [ ] Lighthouse audit: 90+ on `/` and `/discover`
- [ ] Invite-only access (whitelist / invite code) for first 100 users
- [ ] Welcome email for new signups

---

## 🔍 Phase 8: Admin & Moderation — TODO

- [ ] `/admin` route, `role === 'admin'` guard
- [ ] Pitch review queue: approve / reject / request changes
- [ ] New pitches start as `status: 'pending_review'` — invisible on discover until approved
- [ ] Rejected pitch: notify inventor, refund listing fee
- [ ] Verified badge approval: view application, charge $199, set `isVerified: true`

---

## 📱 Phase 9: Mobile — POST-LAUNCH

See MILESTONES.md Phase 9.

---

## 📈 Phase 10: Growth & Differentiators — POST-LAUNCH

See MILESTONES.md Phase 10.

---

## Known Issues / P0 Bugs

1. **Auth bypass must be off in production** — bypass defaults `true` when the env var
   is unset; Vercel production env MUST set `NEXT_PUBLIC_DEV_BYPASS_AUTH=false` (Phase 7).
2. **No admin panel** — pitches go directly to `status: 'live'` without review (fix in Phase 8).
3. **Stripe runs on test keys** — payment rails (listing fee + investments)
   are live end-to-end, but live keys + Connect activation land in Phase 7.
4. ~~Investor dashboard still reads localStorage investments~~ — resolved
   2026-06-11: real-time Firestore reads via `useInvestorInvestments`.

---

## Quick Commands

```bash
# Web dev (auth bypass on — mock data, no Firebase)
cd web && npm run dev

# Web dev with real Firebase auth
NEXT_PUBLIC_DEV_BYPASS_AUTH=false npm run dev

# Type check
cd web && npx tsc --noEmit

# Deploy Firestore rules + indexes
firebase deploy --only firestore

# Deploy full app to Vercel
vercel --prod
```

---

**Last Updated**: 2026-06-11
