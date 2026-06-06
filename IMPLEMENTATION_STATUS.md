# Bamboo Implementation Status

> **MVP-first mode (2026-06-02).** Auth + Firestore are bypassed in dev. Focus
> is the investor-side demo. See [MILESTONES.md](./MILESTONES.md) for phase
> ordering and `web/CLAUDE.md` for the bypass toggle.

---

## ✅ Phase 1: Foundation — DONE
Monorepo, types, landing page, theme, Firebase scaffolding, Card components,
nav, footer.

## ✅ Phase 2: Auth & Inventor Build — DONE (bypassed in dev)
Login, register, role selector, password reset, `ProtectedRoute`, pitch
creation wizard, video/doc uploads, inventor dashboard, inventor layout. All
shipped against Firebase. Bypassed for MVP demo via `NEXT_PUBLIC_DEV_BYPASS_AUTH`.

## ✅ Phase 3: Investor Build — DONE (mock-driven in dev)
Discovery feed, search/filters/sort, pitch detail, watchlist toggle,
investment modal (Firestore transaction), investor dashboard, investor layout.
Currently reads from `web/lib/mock-pitches.ts`.

---

## 🔥 Phase 4: MVP Demo Polish — IN PROGRESS

### 4.1 Three real demo pitches (BLOCKER for demo day)
- [ ] Oxo: 60s pitch video at `web/public/demo/oxo/pitch.mp4`
- [ ] Oxo: `poster.jpg`, `deck.pdf`, `financials.pdf`, `unit-economics.pdf`
- [ ] Ledgr: video, poster, deck, market analysis, regulatory memo
- [ ] Northbound: video, poster, deck, whitepaper, LCA report
- [ ] Verify each `/discover/{id}` page plays the video and opens the PDFs

### 4.2 Discovery polish
- [ ] Wire `PitchCardSkeleton` into discovery loading state
- [ ] Card hover/focus refinements
- [ ] Ticker speed/contrast pass
- [ ] Mobile filter drawer
- [ ] Empty-state polish

### 4.3 Pitch detail polish
- [ ] Custom video player styling
- [ ] Document list cards with icons + hover
- [ ] `BambooProgress` for funding bar (replace any ad-hoc bars)
- [ ] `EquityChart` integration on traction section
- [ ] Sticky invest CTA (desktop rail / mobile bottom)
- [ ] Founder block → `/founder/{id}` link with bio

### 4.4 Investment flow
- [ ] 4-step modal: amount → review → confirm → success
- [ ] Live equity preview
- [ ] Subtle success animation
- [ ] Persist mock investments to `localStorage`
- [ ] Success toast

### 4.5 Landing page demo path
- [ ] Featured pitch hero using `featured-pitch.jpg`
- [ ] "Walk the Grove" CTA → `/discover` (no auth wall)
- [ ] Audit copy for stale auth references

---

## ⏭ Phase 5: Inventor Demo Polish — NEXT
- [ ] Inventor dashboard pulls from `getPitchesByFounder('maya-chen')`
- [ ] Funding progress driven by mock data
- [ ] Pitch creation wizard writes to localStorage (no Firestore in dev)
- [ ] Verified badge upsell styled
- [ ] Stats: raised, views, investors from mocks

---

## 🔐 Phase 6: Re-enable Auth + Persistence — POST-DEMO
- [ ] Toggle `NEXT_PUBLIC_DEV_BYPASS_AUTH=false`
- [ ] Verify `ProtectedRoute` gates
- [ ] Re-test pitch creation Firestore round-trip
- [ ] Re-test investment atomic transaction
- [ ] Write Firestore security rules
- [ ] Write Cloud Storage rules
- [ ] Seed 3 demo pitches into Firestore
- [ ] Decide mock fallback strategy

---

## 📱 Phase 7: Mobile (Expo) — DEFERRED
- [ ] Create pitch screen
- [ ] Discover feed (bottom sheet filters)
- [ ] Pitch detail with `expo-av`
- [ ] Investment bottom sheet
- [ ] Inventor + investor dashboards
- [ ] Watchlist + portfolio
- [ ] Settings

---

## 💳 Phase 8: Real Stripe + Differentiators — POST-MVP
- [ ] Stripe Elements for listing fee
- [ ] Stripe Elements for investments
- [ ] Webhook handlers
- [ ] Refund handling
- [ ] Stripe Connect (marketplace payouts)
- [ ] Match-score algorithm
- [ ] Community Q&A
- [ ] Due-diligence checklist
- [ ] Pitch analytics dashboard
- [ ] Bamboo score
- [ ] Push notifications (Expo + FCM)
- [ ] Milestone-based tranches
- [ ] Secondary market
- [ ] Tax reporting

---

## Build & Deploy

- ✅ Next.js dev build passes
- ✅ Expo configured
- ✅ Firebase scaffolded (unused in dev mode)
- [ ] Deploy demo to Vercel under preview URL

---

## Known Issues / TODOs

1. **Auth bypass leakage**: confirm `NEXT_PUBLIC_DEV_BYPASS_AUTH` defaults to
   `false` in any production deploy
2. **Mock investments not persisted yet** — need localStorage layer
3. **Firebase rules**: still default test mode (revisit in Phase 6)
4. **Admin panel**: no UI for verified-badge approval (post-MVP)
5. **Mobile**: deferred entirely until web demo locks

---

## Quick Commands

```bash
# Web dev (auth bypass on by default)
cd web && npm run dev

# Web dev with real auth (when re-enabling)
NEXT_PUBLIC_DEV_BYPASS_AUTH=false npm run dev

# Type check
cd web && npx tsc --noEmit
```

---

**Last Updated**: 2026-06-02
