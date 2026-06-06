# 🎯 Bamboo — Project Milestones

**Plant Your Seed. Build Your Portfolio.**

> **MVP-first pivot (2026-06-02):** Auth and Firestore are temporarily bypassed
> in dev so we can iterate on the investor-facing demo experience at zero
> latency. See [CLAUDE.md](./CLAUDE.md) → _Dev Bypass_ for the toggle. Auth +
> persistence return in Phase 5, after the demo is locked.

---

## 🚀 Phase 1: Foundation ✅ COMPLETED

Monorepo, types, landing page, theme system, Firebase scaffolding. Locked
2026-05-24.

---

## ✅ Phase 2: Auth & Inventor Flow — SHIPPED (now bypassed for MVP demo)

Login, register, password reset, pitch creation wizard, inventor dashboard,
file uploads, Firestore writes — all built and working. **Temporarily bypassed
in dev** via `NEXT_PUBLIC_DEV_BYPASS_AUTH` so we can demo without standing up
Firebase. Code is intact and re-enables in Phase 5.

---

## ✅ Phase 3: Discovery & Investor Flow — SHIPPED (now mock-driven for MVP demo)

Discovery feed, filters, pitch detail, watchlist, investment flow built end-
to-end against Firestore. Now reading from `web/lib/mock-pitches.ts` for the
demo. Three "real" pitches (Oxo, Ledgr, Northbound) have slots for actual
video + documents under `web/public/demo/{id}/`.

---

## 🔥 Phase 4: MVP Demo Polish — IN PROGRESS

**Timeline**: 2026-06-02 → 2026-06-16 (target)
**Status**: 0% — this is where we are now
**Goal**: Make the investor-side demo feel like a finished product. Discovery,
pitch detail, and the investment flow are the entire surface a reviewer
touches. Nothing else matters until these are pristine.

### 4.1 Three real demo pitches (HIGHEST PRIORITY)
- [ ] Record / source 60s pitch videos for Oxo, Ledgr, Northbound
- [ ] Drop into `web/public/demo/{id}/pitch.mp4` (already wired via `videoUrl`)
- [ ] Author proper PDFs: deck, financials, supporting docs (3 each)
- [ ] Generate poster frames `poster.jpg` for each video
- [ ] Verify each opens correctly from `/discover/{id}`

### 4.2 Discovery feed polish
- [ ] Hover/focus states feel premium on `DiscoverPitchCard`
- [ ] Empty-state illustration tightened
- [ ] Ticker animation tuned (current speed, contrast)
- [ ] Skeleton loading states (`PitchCardSkeleton` already exists — wire it)
- [ ] Mobile breakpoints: cards stack cleanly, filters collapse to drawer

### 4.3 Pitch detail page polish
- [ ] HTML5 video player styling (custom controls or polished defaults)
- [ ] Document list cards with file-type icons, hover affordance
- [ ] Funding progress visual upgrade (use `BambooProgress` consistently)
- [ ] Traction sparkline → richer `EquityChart` integration
- [ ] Sticky "Invest" CTA on scroll (desktop side rail, mobile bottom bar)
- [ ] Founder block links to `/founder/{id}` with full bio

### 4.4 Investment flow polish (still stubbed)
- [ ] 4-step modal: amount → review → confirm → success
- [ ] Equity preview updates live as user types
- [ ] Confetti / success animation on confirm (subtle, branded)
- [ ] Mock investment writes to localStorage so it persists for the demo
- [ ] Toast confirming "investment recorded"

### 4.5 Landing page demo path
- [ ] Featured pitch hero (currently `featured-pitch.jpg` is unused)
- [ ] "Walk the Grove" CTA goes straight to `/discover` (no login wall)
- [ ] Removed any auth-gated copy that no longer applies

### Success Criteria
- A reviewer can click from landing → discover → pitch detail → invest → success
  without ever seeing a login screen or a loading spinner that lasts >300ms
- All three demo pitches play their real videos and serve real PDFs
- Zero console errors in the demo path
- LCP <2s on `/discover`

---

## 🎨 Phase 5: Inventor Demo Polish — NEXT

**Timeline**: After Phase 4 → ~1 week
**Goal**: Inventor-side equivalent. Lower priority because the demo story is
"investor browses pitches," not "founder uploads a pitch live." We still want
the inventor dashboard to look real if a reviewer clicks the dev role switch.

- [ ] Inventor dashboard reads from `getPitchesByFounder('maya-chen')` mock
- [ ] Funding progress bars use real demo pitch numbers
- [ ] Pitch creation wizard accessible (already built) but writes to localStorage
- [ ] "Verified" badge upsell card styled to match grove aesthetic
- [ ] Stats: total raised, views, investors — driven by mock data

---

## 🔐 Phase 6: Re-enable Auth + Persistence — POST-DEMO

**Timeline**: After demo lockdown
**Goal**: Flip `NEXT_PUBLIC_DEV_BYPASS_AUTH=false` and harden for real users.

- [ ] Verify all `ProtectedRoute` gates still work
- [ ] Re-test pitch creation → Firestore round-trip
- [ ] Re-test investment transaction (atomic update)
- [ ] Firestore security rules (currently permissive test-mode)
- [ ] Cloud Storage rules
- [ ] Migrate the 3 demo pitches into Firestore as seed data
- [ ] Decide: keep mock fallback as an env flag, or remove?

---

## 📱 Phase 7: Mobile (Expo) — DEFERRED

Was Phase 4. Pushed back — web demo is the MVP. Mobile inherits whatever the
web demo lands on. Same scope as before:
- Create pitch, discover feed, pitch detail with `expo-av`, investment flow,
  inventor/investor dashboards, watchlist, portfolio, settings.

---

## 💳 Phase 8: Real Stripe + Differentiators — POST-MVP

Was Phase 5. Unchanged scope: real Stripe Elements, webhooks, refunds, Stripe
Connect; match-score algorithm, community Q&A, due-diligence checklist,
analytics, "Bamboo score", push notifications, milestone-based tranches,
secondary market, tax reporting.

---

## 📊 Overall Timeline

```
Phase 1 (Foundation)             │████████████████████████│ ✅ DONE
Phase 2 (Auth & Inventor build)  │████████████████████████│ ✅ DONE (bypassed)
Phase 3 (Investor build)         │████████████████████████│ ✅ DONE (mocked)
Phase 4 (MVP Demo Polish)        │██░░░░░░░░░░░░░░░░░░░░░░│ 🔥 NOW
Phase 5 (Inventor Demo Polish)   │░░░░░░░░░░░░░░░░░░░░░░░░│ ⏭  NEXT
Phase 6 (Re-enable Auth)         │░░░░░░░░░░░░░░░░░░░░░░░░│ 🔐 POST-DEMO
Phase 7 (Mobile)                 │░░░░░░░░░░░░░░░░░░░░░░░░│ 📱 DEFERRED
Phase 8 (Stripe + extras)        │░░░░░░░░░░░░░░░░░░░░░░░░│ 💳 POST-MVP
```

---

## 🎯 Demo Day Success Metrics

- A reviewer goes from landing → invested in a pitch in <90 seconds
- All three demo pitches: real video plays, real PDFs open
- Dev role switcher lets reviewer flip to inventor view in one click
- Zero console errors, zero broken images, zero placeholder Lorem Ipsum
- Lighthouse: 90+ on landing and `/discover`

---

**Last Updated**: 2026-06-02
**Owned By**: Hussain Naqvi
