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

### 6.1 Listing fee
- [ ] Stripe Elements on pitch submission final step
- [ ] Webhook: confirm payment → set `listingFeePaid: true` → queue for admin review
- [ ] Handle failed/cancelled payments (clear draft pitch or retry)

### 6.2 Investment payments
- [ ] Replace stub in investment modal with Stripe Elements
- [ ] Stripe Connect marketplace setup
- [ ] Store `stripePaymentIntentId` on investment record
- [ ] Webhook: mark investment `completed` on payment confirmation

### 6.3 Refunds & edge cases
- [ ] Cancelled pitch → trigger refund for all investments
- [ ] Failed payment → clear pending investment record
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
3. **Stripe is stubbed** — no real money moves until Phase 6 lands.
4. **Investor dashboard still reads localStorage investments** — migrate to Firestore
   reads as part of Phase 6 payment confirmation flow.

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
