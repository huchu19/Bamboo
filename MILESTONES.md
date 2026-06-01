# 🎯 Bamboo — Project Milestones

**Plant Your Seed. Build Your Portfolio.**

---

## 🚀 Phase 1: Foundation ✅ COMPLETED

**Timeline**: Initial setup → 2026-05-24  
**Status**: 100% Complete

### Deliverables
- ✅ Monorepo structure (`/shared`, `/web`, `/mobile`)
- ✅ TypeScript configuration across all packages
- ✅ Next.js 14 with App Router
- ✅ Expo with Expo Router
- ✅ Firebase configuration (Auth, Firestore, Storage)
- ✅ All shared types (User, Pitch, Investment, Payment)
- ✅ All shared constants (fees, categories, formatters)
- ✅ Landing page (hero, how-it-works, stats, CTA)
- ✅ Navigation header and footer
- ✅ Theme system with CSS variables
- ✅ Theme toggle component
- ✅ Card component with variants
- ✅ Project documentation (README, CLAUDE.md)

### Key Achievements
- Established clean monorepo architecture
- Defined all core types and constants upfront
- Landing page passes accessibility checks
- Theme system ready for dark mode
- Firebase ready for integration

### Notes
- No external UI libraries used (Tailwind CSS only)
- All code is TypeScript with strict mode enabled
- Ready for next phase without refactoring

---

## ✅ Phase 2: Auth & Core Inventor Flow — COMPLETED

**Timeline**: 2026-05-24 → 2026-06-01  
**Status**: 100% Complete

### Deliverables
- ✅ Login page (`/login`) — email/password form, role-based redirect, forgot password link
- ✅ Register page (`/register`) — two-step role selector + form, Firebase auth wired
- ✅ Role selector — card-based Inventor/Investor picker
- ✅ Protected route wrapper (`ProtectedRoute.tsx`) — redirects unauthenticated users, role enforcement
- ✅ Password reset flow (`/forgot-password`) — Firebase `sendPasswordResetEmail`, safe non-revealing response
- ✅ Pitch creation wizard (7-step) — basic info → video → docs → funding → review → payment → confirmation
- ✅ Video uploader — file input, preview, 100MB limit, Firebase Storage upload with progress bar
- ✅ Document uploader — multi-file PDF upload, 25MB/file limit, Firebase Storage
- ✅ Pitch saved to Firestore — `createPitch()` with real IDs, video/doc URLs, status `under_review`
- ✅ Inventor dashboard — real data from `onInventorPitchesChange()`, funding progress bars, live/review status badges, verified upsell
- ✅ Inventor layout — sticky nav, mobile sidebar, real Sign Out wired to `logout()`

### Key Achievements
- All routes protected by `ProtectedRoute` with role enforcement
- Files uploaded to Firebase Storage, URLs stored in Firestore pitch document
- Inventor dashboard shows live stats (total raised, views, investors) from Firestore
- Empty state with CTA when no pitches created yet

---

## ✅ Phase 3: Discovery & Investor Flow — COMPLETED

**Timeline**: 2026-06-01 → 2026-06-01  
**Status**: 100% Complete

### Deliverables
- ✅ Discovery feed (`/discover`) — responsive pitch grid, real-time Firestore listener, empty state
- ✅ Search & filters — title/founder search, category filter, verified-only checkbox, sort (recent/trending/funding)
- ✅ Pitch detail (`/discover/[pitchId]`) — real Firestore data via `onPitchChange()`, HTML5 video player, documents, funding progress
- ✅ Watchlist toggle — `addToWatchlist` / `removeFromWatchlist` wired to Firestore, persisted per user
- ✅ Investment modal — 4-step flow (amount → review → confirm → success), `createInvestment()` Firestore transaction atomically updates pitch `amountRaised` + `investorCount`
- ✅ Investor layout (`/investor/*`) — sticky nav, mobile sidebar, real Sign Out, protected by `ProtectedRoute`
- ✅ Investor dashboard (`/investor/dashboard`) — total invested, investment count, unique deals, sector breakdown with bars, enriched investment history with pitch titles
- ✅ Watchlist page (`/investor/watchlist`) — live watchlist loaded from Firestore, remove button, empty state

### Key Achievements
- Discover page now driven by Firestore `onPitchesChange()` real-time listener
- Investments use a Firestore transaction — pitch `amountRaised` and `investorCount` updated atomically
- Watchlist is persisted under `watchlist/{userId}/items/{pitchId}` subcollection
- Investor dashboard enriches investments with pitch metadata (title, category)
- Route guard enforces role — investors can't access `/dashboard`, inventors can't access `/investor/dashboard`

### Blockers/Dependencies
- Phase 2 complete ✅

### Next Milestone Gates
- ✅ Discovery page loads from Firestore
- ✅ Filters work correctly
- ✅ Investment submission creates record in Firestore

---

## ⏳ Phase 4: Polish & Mobile — PLANNED

**Timeline**: After Phase 3 → TBD  
**Estimated Duration**: 2-3 weeks

### Deliverables
- [ ] Mobile app (Expo)
  - [ ] Create pitch screen (matching web wizard)
  - [ ] Discover feed (bottom sheet filters)
  - [ ] Pitch detail with video player (expo-av)
  - [ ] Investment submission (bottom sheet UI)
  - [ ] Inventor dashboard (tab-based)
  - [ ] Investor dashboard (tab-based)
  - [ ] Watchlist screen (tab)
  - [ ] Portfolio screen (tab)
  - [ ] Settings screen (theme, logout)

- [ ] Landing page enhancements
  - [ ] Featured pitches carousel
  - [ ] Testimonials section
  - [ ] Team section
  - [ ] FAQ section
  - [ ] Smooth scroll animations

- [ ] Verified badge system
  - [ ] Badge UI component (trophy icon)
  - [ ] Info modal explaining verified status
  - [ ] Badge display on pitch cards
  - [ ] Badge display on inventor profile
  - [ ] Admin dashboard stub for approval (post-MVP)

- [ ] Notification system
  - [ ] Notification data model (Firestore subcollection)
  - [ ] Notification bell UI with unread count
  - [ ] Notification list/dropdown
  - [ ] Real-time listeners for new notifications
  - [ ] Mark as read functionality

- [ ] UI polish and consistency
  - [ ] Toast/notification system (non-blocking alerts)
  - [ ] Loading skeletons (card placeholders)
  - [ ] Error boundaries and error states
  - [ ] Empty states (no results, no data)
  - [ ] Loading spinners and transitions
  - [ ] Consistent spacing and typography

### Success Criteria
- Mobile app has feature parity with web
- All screens responsive and touch-optimized
- Notifications appear in real-time
- UI is polished with consistent spacing and colors
- No console errors or warnings

### Blockers/Dependencies
- Phase 3 must be complete (all web features working)

### Next Milestone Gates
- Mobile app builds and runs
- All tabs navigate correctly
- Video playback works on mobile

---

## 🔮 Phase 5: Integrations & Differentiators — PLANNED (POST-MVP)

**Timeline**: After Phase 4 → TBD  
**Estimated Duration**: 4+ weeks

### Deliverables
- [ ] Real Stripe integration
  - [ ] Stripe Account setup (Stripe.com)
  - [ ] `@stripe/react-stripe-js` installation
  - [ ] Payment Elements UI for listing fee
  - [ ] Payment Elements UI for investments
  - [ ] Webhook handlers for payment events
  - [ ] Payment confirmation emails
  - [ ] Refund handling
  - [ ] Stripe Connect for marketplace payouts (future)

- [ ] Differentiating features
  - [ ] Investor match score algorithm (ML-based compatibility)
  - [ ] Community Q&A on pitches
  - [ ] Due diligence checklist template
  - [ ] Pitch analytics dashboard (views, click-through rate, conversion rate)
  - [ ] "Bamboo score" (inventor trust rating based on activity)
  - [ ] Push notifications (Expo FCM integration)
  - [ ] Milestone-based funding tranches (partial fund release)
  - [ ] Secondary market for investment resale (trading)
  - [ ] Investor portfolio performance tracking
  - [ ] Tax reporting (annual statements)

### Success Criteria
- Real payments process successfully
- Webhook handlers update Firestore correctly
- All edge cases handled (failed payments, refunds)
- Differentiating features drive engagement

### Blockers/Dependencies
- Phase 4 must be complete
- Stripe production account setup

---

## 📊 Overall Timeline

```
Phase 1 (Foundation)
│████████████████████████│ ✅ COMPLETED
│
Phase 2 (Auth & Inventor)
│████████████░░░░░░░░░░░░│ ⏳ IN PROGRESS
│
Phase 3 (Discovery & Investor)
│░░░░░░░░░░░░░░░░░░░░░░░░│ 🔴 PLANNED
│
Phase 4 (Polish & Mobile)
│░░░░░░░░░░░░░░░░░░░░░░░░│ 🔴 PLANNED
│
Phase 5 (Integrations)
│░░░░░░░░░░░░░░░░░░░░░░░░│ 🔮 POST-MVP
```

---

## 🎯 Key Success Metrics

### Phase 2 Success
- [ ] 0 TypeScript errors in web build
- [ ] 0 console warnings or errors in browser
- [ ] Forms validate all inputs
- [ ] Video upload works with progress bar
- [ ] Firestore contains test pitch documents

### Phase 3 Success
- [ ] Discovery page loads in <2 seconds
- [ ] Search/filters work with zero lag
- [ ] Investment payment stub creates records
- [ ] Real-time updates visible (watchlist, investments)

### Phase 4 Success
- [ ] Mobile app runs in Expo Go
- [ ] All features work identically to web
- [ ] Performance: LCP <2.5s, FCP <1.5s
- [ ] No console errors on iOS or Android

### Phase 5 Success
- [ ] Real Stripe payments work end-to-end
- [ ] Webhooks process successfully
- [ ] Differentiating features measurably increase engagement

---

## 📝 Notes

- **Tech Debt**: Minimal; codebase designed for clarity over cleverness
- **Testing**: Unit tests for utilities; E2E tests for critical flows (post-MVP)
- **Accessibility**: WCAG 2.1 Level AA compliance on all pages
- **Performance**: Target Lighthouse score 90+ on all pages
- **Documentation**: Every component has JSDoc comments; CLAUDE.md kept up-to-date

---

**Last Updated**: 2026-06-01  
**Owned By**: Hussain Naqvi
