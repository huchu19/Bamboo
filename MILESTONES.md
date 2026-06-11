# 🎯 Bamboo — Project Milestones

**Plant Your Seed. Build Your Portfolio.**

> **Goal**: A live, hosted product used by ~100 selected participants.
> Phases 1–4 are done. The remainder takes us from polished demo to a real
> hosted application that real users can sign up for, pitch, and invest through.

---

## ✅ Phase 1: Foundation — DONE
Monorepo, types, landing page, theme system, Firebase scaffolding. Locked 2026-05-24.

---

## ✅ Phase 2: Auth & Inventor Flow — DONE
Login, register, password reset, pitch creation wizard, inventor dashboard,
file uploads, Firestore writes — built and verified against Firebase.

---

## ✅ Phase 3: Discovery & Investor Flow — DONE
Discovery feed, filters, pitch detail, watchlist, investment flow built end-to-end.

---

## ✅ Phase 4: Demo Polish — DONE
Investor-facing demo path locked: landing → discover → pitch detail → invest → success.
EduNexus pitch has real hosted video. Investment flow is 4-step with localStorage persistence.

---

## ✅ Phase 5: Auth Hardening & Real Persistence — DONE (2026-06-11)

Real Firebase auth is live: `NEXT_PUBLIC_DEV_BYPASS_AUTH=false`, Email/Password
provider enabled, login/register/forgot-password all wired and verified.
Firestore security rules + composite indexes deployed. Cloud Storage rules
deployed (Blaze plan, us-east1). Demo pitches + founders seeded via
`scripts/seed-firestore.mjs`. Discover feed reads Firestore through
`usePitches` with mock fallback. Auth-aware nav with account menu + logout.

Carried forward:
- Email-verification gating for pitch creation → folded into Phase 7 onboarding
- Full round-trip smoke tests (pitch creation, investment transaction,
  watchlist persistence) → verify during Phase 6 payment work, which touches
  the same flows

---

## ✅ Phase 6: Real Payments (Stripe) — DONE (2026-06-11)

**Goal**: Real money can move. Inventors pay a listing fee. Investors commit funds.
Nothing ships to real users without this.

**Completed**: 2026-06-11 (ahead of the 2026-06-24 target). Payment rails,
listing-fee UI, Firestore investor dashboard, Connect stub, refunds, and
receipt emails are all in. Connect payout *activation* (real `acct_...` id)
and live keys land with Phase 7 production env setup.

### 6.1 Listing fee (Inventor → Bamboo)
- [x] Integrate Stripe Elements for listing fee payment on pitch submission
      (wizard payment step; pitch created as `pending_payment` before charge)
- [x] Webhook: confirm payment before pitch goes live (`pending_payment` → `live`)
- [x] Handle failed/cancelled payments gracefully — unpaid pitches stay
      `pending_payment` (invisible to discovery); retry reuses the created
      pitch without re-uploading media

### 6.2 Investment payments (Investor → Escrow)
- [x] Stripe Elements in investment modal (replace stub)
- [x] Investor dashboard reads investments from Firestore in real time
      (`onSnapshot`, investorId == uid) instead of localStorage
- [x] Stripe Connect payout rails **stubbed** — `STRIPE_CONNECT_ACCOUNT_ID`
      env var; when set to a real `acct_...` id, investment PaymentIntents
      route funds via `transfer_data.destination`. While it's the `acct_stub`
      placeholder, funds settle on the platform account (escrow behaviour).
- [x] Store `stripePaymentIntentId` on investment record in Firestore
- [x] Webhook: update investment status on payment confirmation

**Activating Connect payouts (when ready):**
1. Enable Connect in the Stripe dashboard (Settings → Connect) and pick a
   charge model — `transfer_data` as wired here is the *destination charges*
   model, the simplest fit for a marketplace.
2. Onboard the payout recipient: create an Express account via
   `stripe.accounts.create({ type: 'express' })` (or the dashboard) and have
   them complete Stripe's hosted onboarding (KYC, bank account).
3. Put the resulting `acct_...` id in `STRIPE_CONNECT_ACCOUNT_ID`
   (web/.env.local locally, Vercel env in prod) and redeploy.
4. Optional: take a platform cut by adding `application_fee_amount` next to
   `transfer_data` in `web/app/api/stripe/payment-intent/route.ts`.
5. Per-inventor payouts (each founder their own connected account) is a
   Phase 8+ follow-up — store each inventor's `acct_...` id on their user
   record and resolve the destination per pitch instead of the single
   env-level account.

### 6.3 Refunds & edge cases
- [x] Cancelled pitch → refund all investors — `POST /api/pitch/cancel`
      (ID-token auth, owner-only) closes the pitch and creates Stripe refunds
      idempotency-keyed per PaymentIntent; the webhook's `charge.refunded`
      handler marks investments refunded and rolls back pitch counters.
      Dashboard-issued refunds flow through the same webhook path.
      Founder dashboard has the Cancel & Refund action (MyPitchesPanel).
- [x] Failed payment → clear investment record — satisfied by architecture:
      investments are only ever *created* by the webhook on
      `payment_intent.succeeded`, so a failed payment never leaves a record
      to clear (it's audit-logged under `payments/{pi_id}` as `failed`).
      Both payment surfaces (modal + wizard) support in-place retry.
- [x] Basic receipt email via Stripe — `receipt_email` set on all
      PaymentIntents from the signed-in user's email; Stripe sends receipts
      automatically in live mode.

> ⚠️ The production Stripe webhook endpoint must subscribe to
> `payment_intent.succeeded`, `payment_intent.payment_failed`, and
> `charge.refunded`.

---

## 🚀 Phase 7: Hosting & Launch Infrastructure — REQUIRED FOR LAUNCH

**Goal**: The app is publicly accessible via a real domain, stable, and observable.
Must be done before inviting any real participant.

**Target**: 2026-06-28

### 7.1 Production deployment
- [ ] Deploy web app to Vercel under custom domain (e.g. `bamboo.app` or similar)
- [ ] Configure Vercel environment variables for production Firebase + Stripe live keys
- [ ] Set `NEXT_PUBLIC_DEV_BYPASS_AUTH=false` in Vercel production env
- [ ] Verify DevRoleSwitcher does not render in production
- [ ] Run Lighthouse audit: 90+ on `/` and `/discover`

### 7.2 Firebase production project
- [ ] Separate Firebase project for production (not the dev/test project)
- [ ] Production Firestore indexes for discovery feed queries (category, fundingGoal, createdAt)
- [ ] Production Cloud Storage with CORS configured for Vercel domain
- [ ] Enable Firebase App Check to prevent abuse

### 7.3 Error monitoring
- [ ] Integrate Sentry (or equivalent) for JS error tracking
- [ ] Set up uptime monitoring (e.g. Better Uptime or Vercel Analytics)
- [ ] Global error boundary already in place (`app/error.tsx`) — verify it reports to Sentry

### 7.4 Onboarding for selected participants
- [ ] Invite-only access: whitelist of 100 emails, or invite code system
- [ ] Welcome email template (send via Firebase Extensions or Resend)
- [ ] Brief onboarding modal on first login explaining the beta

---

## 🔍 Phase 8: Admin & Moderation — PRE-LAUNCH REQUIREMENT

**Goal**: You need to be able to review pitches before they go live and handle
the verified badge process without touching the database directly.

**Target**: 2026-07-05

### 8.1 Admin dashboard (internal, password-protected route)
- [ ] `/admin` route, only accessible to `role === 'admin'` accounts
- [ ] Pitch review queue: approve / reject / request changes
- [ ] Verified badge approval: view application, approve, charge $199

### 8.2 Pitch moderation
- [ ] New pitches start in `status: 'pending'` — not visible on discovery until approved
- [ ] Rejected pitches: notify inventor with reason, refund listing fee
- [ ] Reported pitches: flag for review, temporarily hide

---

## 📱 Phase 9: Mobile (Expo) — POST-LAUNCH

**Timeline**: After first 100-user cohort feedback
**Goal**: iOS/Android app for the same feature set as web.

- [ ] Discover feed + pitch detail with `expo-av`
- [ ] Investment bottom sheet
- [ ] Inventor pitch creation
- [ ] Inventor + investor dashboards
- [ ] Watchlist, portfolio, settings
- [ ] App Store + Google Play submission

---

## 📈 Phase 10: Growth & Differentiators — POST-LAUNCH

After the first cohort has used the product for a few weeks:

- [ ] Match-score algorithm (investor ↔ pitch affinity)
- [ ] Community Q&A on pitch pages
- [ ] Due-diligence checklist for verified pitches
- [ ] Pitch analytics dashboard for inventors (views, watch time, conversion)
- [ ] "Bamboo Score" — founder credibility signal
- [ ] Milestone-based investment tranches
- [ ] Push notifications (Expo + FCM)
- [ ] Secondary market (investor → investor transfers)
- [ ] Tax reporting export (PDF / CSV)
- [ ] Scalability pass: Firestore pagination, CDN for video, rate limiting

---

## 📊 Overall Timeline

```
Phase 1 (Foundation)           │████████████████████████│ ✅ DONE
Phase 2 (Auth & Inventor)      │████████████████████████│ ✅ DONE
Phase 3 (Investor build)       │████████████████████████│ ✅ DONE
Phase 4 (Demo Polish)          │████████████████████████│ ✅ DONE
Phase 5 (Auth + Persistence)   │████████████████████████│ ✅ DONE (Jun 11)
Phase 6 (Stripe Payments)      │████████████████████████│ ✅ DONE (Jun 11)
Phase 7 (Hosting + Launch)     │░░░░░░░░░░░░░░░░░░░░░░░░│ 🚀 NOW  → Jun 28
Phase 8 (Admin + Moderation)   │░░░░░░░░░░░░░░░░░░░░░░░░│ 🔍 SOON → Jul 5
Phase 9 (Mobile)               │░░░░░░░░░░░░░░░░░░░░░░░░│ 📱 POST-LAUNCH
Phase 10 (Growth)              │░░░░░░░░░░░░░░░░░░░░░░░░│ 📈 POST-LAUNCH
```

---

## 🎯 Launch Readiness Checklist

Before inviting the first real participant:
- [x] Phase 5 complete: real auth + Firestore persistence
- [x] Phase 6 complete: real payments flowing (live keys + webhook events
      configured in prod as part of Phase 7)
- [ ] Phase 7 complete: live domain, production Firebase, error monitoring
- [ ] Phase 8 complete: admin can moderate pitches before they go live
- [ ] Zero known P0 bugs
- [ ] Privacy policy + terms of service page live
- [ ] `NEXT_PUBLIC_DEV_BYPASS_AUTH=false` confirmed in Vercel production env

---

**Last Updated**: 2026-06-11
**Owned By**: Hussain Naqvi
