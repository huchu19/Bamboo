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

## ⏳ Phase 2: Auth & Core Inventor Flow — IN PROGRESS

**Timeline**: 2026-05-24 → TBD  
**Estimated Duration**: 1-2 weeks

### Deliverables
- [ ] Login page (`/login`)
  - [ ] Email/password form
  - [ ] "Forgot password" link
  - [ ] "Sign up" redirect
  - [ ] Auth error messages
  - [ ] Loading state

- [ ] Register page (`/register`)
  - [ ] Email/password form with validation
  - [ ] Role selector (Inventor vs Investor cards)
  - [ ] Inventor-specific fields (name, industry focus)
  - [ ] Investor-specific fields (name, investment range)
  - [ ] Terms & conditions checkbox
  - [ ] "Sign in" redirect

- [ ] Role selector component
  - [ ] Card-based UI for Inventor/Investor selection
  - [ ] Hover states and visual feedback
  - [ ] Accessibility (keyboard navigation)

- [ ] Protected route wrapper / AuthGuard
  - [ ] Redirects unauthenticated users to login
  - [ ] Preserves intended destination
  - [ ] Loading skeleton during auth check

- [ ] Password reset flow
  - [ ] Reset request page
  - [ ] Email confirmation
  - [ ] New password submission page

- [ ] Pitch creation wizard (7-step form)
  - [ ] Step 1: Basic info (title, tagline, category, description)
  - [ ] Step 2: Video upload (60s validation, upload progress)
  - [ ] Step 3: Document uploads (PDFs, max 3 files)
  - [ ] Step 4: Funding details (goal amount, equity offered, min investment)
  - [ ] Step 5: Review (summary of all data)
  - [ ] Step 6: Payment stub (collect $49 listing fee)
  - [ ] Step 7: Confirmation (success page with next steps)

- [ ] Video uploader component
  - [ ] File input with preview
  - [ ] Duration validation (max 60s)
  - [ ] Upload progress bar
  - [ ] Error handling

- [ ] Document uploader component
  - [ ] Multiple file selection
  - [ ] File type validation (PDF only)
  - [ ] File size validation (max 10MB each)
  - [ ] Preview list with remove option

- [ ] Inventor dashboard (basic)
  - [ ] Overview page with greeting
  - [ ] Pitch status summary
  - [ ] Recent pitches list
  - [ ] Navigation to create new pitch
  - [ ] Link to settings

### Success Criteria
- Users can create an account as Inventor or Investor
- Users can log in/out
- Inventors can upload a pitch with video and documents
- Payment stub processes "payment" and creates pitch in Firestore
- All forms validate input properly
- Mobile responsive on all pages

### Blockers/Dependencies
- None; can start immediately

### Next Milestone Gates
- All forms must validate input
- Video duration validation working
- Payment stub creates pitch in Firestore

---

## ⏳ Phase 3: Discovery & Investor Flow — PLANNED

**Timeline**: After Phase 2 → TBD  
**Estimated Duration**: 2 weeks

### Deliverables
- [ ] Discovery feed page (`/discover`)
  - [ ] Pitch grid layout (responsive)
  - [ ] Pitch card component with thumbnail, title, category badge
  - [ ] Funding progress bar on cards
  - [ ] "Verified badge" indicator
  - [ ] Pagination or infinite scroll

- [ ] Search and filter sidebar
  - [ ] Search by title/description
  - [ ] Filter by category (multi-select)
  - [ ] Filter by verified status
  - [ ] Filter by funding stage
  - [ ] Sort options (newest, trending, most funded)

- [ ] Pitch detail page (`/discover/[pitchId]`)
  - [ ] Video player (HTML5 video with controls)
  - [ ] Pitch title, inventor name, category
  - [ ] Full description text
  - [ ] Documents section (downloadable PDFs)
  - [ ] Funding progress bar with metrics
  - [ ] Investor list (anonymized, count only)
  - [ ] Similar pitches carousel
  - [ ] "Add to watchlist" button
  - [ ] "Invest" CTA button (sticky on mobile)

- [ ] Investment submission flow
  - [ ] Investment amount input with validation
  - [ ] Equity calculation display
  - [ ] Investment summary review
  - [ ] Payment stub UI
  - [ ] Success confirmation

- [ ] Investor dashboard (basic)
  - [ ] Portfolio summary card (total invested, estimated value)
  - [ ] Investments table with status
  - [ ] Allocation chart (by category)
  - [ ] Recommended pitches carousel
  - [ ] Navigation to watchlist and portfolio

- [ ] Watchlist page (`/watchlist`)
  - [ ] Saved pitches grid
  - [ ] Remove from watchlist option
  - [ ] Empty state if no pitches saved

### Success Criteria
- Users can browse all pitches on discovery page
- Search and filters work correctly
- Investors can view pitch details and make investments
- Payment stub processes investment and updates Firestore
- Real-time updates reflect new investments
- Mobile responsive on all pages

### Blockers/Dependencies
- Phase 2 must be complete (investors must be able to register)

### Next Milestone Gates
- Discovery page loads 20+ pitches
- Filters work correctly
- Investment submission creates record in Firestore

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
