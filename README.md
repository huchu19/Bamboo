# 🎋 Bamboo — Investing Platform
**Plant Your Seed. Build Your Portfolio.**

A two-sided investing marketplace connecting innovative entrepreneurs with impact-driven investors.

## 📋 Overview

Bamboo enables:
- **Inventors**: Upload 60-second pitch videos, supporting documents (business plans, financials), and reach verified investors
- **Investors**: Discover innovative pitches, watch founder pitches, and invest in ideas they believe in

### Key Features
✅ Pitch video uploads (60-second limit)  
✅ Document uploads (business plans, financials, etc.)  
✅ Payment portal for inventors ($49 listing fee, $199 verified badge)  
✅ Investment submissions from investors  
✅ Real-time funding progress tracking  
✅ Verified badge system  
✅ Web & mobile apps (iOS/Android)

## 🏗️ Project Structure

```
/Bamboo
├── /shared          # Shared TypeScript types, constants, utilities
├── /web             # Next.js 14 web app
├── /mobile          # Expo React Native app
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Web** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **Mobile** | Expo (React Native) + Expo Router |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **Payments** | Stripe (stubbed for MVP, ready for integration) |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn
- Firebase project (free tier available)

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install -r
   ```

2. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Copy your credentials

3. **Set up environment variables**
   
   **Web** (`web/.env.local`):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   **Mobile** (`mobile/.env`):
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run development servers**
   
   **Web**:
   ```bash
   cd web
   npm run dev
   # Opens at http://localhost:3000
   ```

   **Mobile**:
   ```bash
   cd mobile
   npm start
   # Scan QR code with Expo Go app
   ```

## 📱 MVP Pages & Screens

### Web
- `/` — Landing page
- `/login` — Login form
- `/register` — Registration + role selection
- `/discover` — Pitch discovery feed
- `/discover/[pitchId]` — Pitch detail page
- `/pitch/new` — Multi-step pitch creation wizard (inventor)
- `/dashboard` — Inventor/Investor dashboard
- `/payments` — Payment history (inventor)
- `/portfolio` — Investment portfolio (investor)

### Mobile
- Discover feed
- Pitch detail with video player
- Investment submission flow (bottom sheet)
- Inventor/Investor dashboards (tab-based)
- Watchlist
- Portfolio

## 💰 Fee Structure

```typescript
LISTING_FEE = $49       // Inventors pay to publish pitch
VERIFIED_BADGE = $199   // Due diligence verification service
MIN_INVESTMENT = $100   // Minimum investor contribution
```

## 🗄️ Firebase Collections

- **users/{userId}** — User profiles (inventor/investor)
- **pitches/{pitchId}** — Pitch documents with video URLs, documents, funding info
- **investments/{investmentId}** — Investment records
- **payments/{paymentId}** — Payment transactions
- **watchlist/{userId}/items/{pitchId}** — Saved pitches (subcollection)
- **notifications/{userId}/items/{notifId}** — User notifications (subcollection)

## 🔐 Firebase Security Rules

Rules are configured to:
- Allow inventors to create and edit only their own pitches
- Allow investors to submit investments
- Restrict document viewing based on pitch status
- Protect user profile updates

See `firebase-rules.json` (to be created) for full rules.

## 💳 Payment Flow (Stubbed)

**Status**: Stripe integration ready but using mock payment stubs for MVP.

The payment abstraction layer is in `web/lib/stripe/stub.ts`. All payment processing functions are stubbed to:
1. Simulate API delays
2. Return mock transaction IDs
3. Update Firestore documents

To integrate real Stripe:
1. Install `@stripe/react-stripe-js`
2. Replace stub implementations in `web/lib/stripe/stub.ts`
3. Wire payment stubs in `web/components/investment/PaymentStub.tsx`

See the plan file for more details: `/.claude/plans/bamboo-investing-platform-plant-validated-lamport.md`

## 🎨 Design System

**Primary Green** (`bamboo-500`): `#22c55e`  
**Font**: Inter (Google Fonts)  
**Components**: Built with Tailwind CSS (shadcn/ui ready)

## 📝 Shared Types

All types are defined in `/shared/src/types/`:
- `user.ts` — User, InventorProfile, InvestorProfile
- `pitch.ts` — Pitch, PitchStatus, PitchCategory
- `investment.ts` — Investment, InvestmentStatus
- `payment.ts` — Payment, PaymentType

Constants in `/shared/src/constants/`:
- `payments.ts` — Fee amounts
- `categories.ts` — Pitch categories with emojis

## 🚧 Next Steps (Post-MVP)

- [ ] Stripe full integration
- [ ] Community Q&A on pitches
- [ ] Investor match scoring algorithm
- [ ] Pitch analytics dashboard
- [ ] Due diligence checklist
- [ ] Push notifications
- [ ] Milestone-based funding tranches
- [ ] Secondary market for investment resale

## 📖 Documentation

Full implementation plan: [/Users/huchu/.claude/plans/bamboo-investing-platform-plant-validated-lamport.md]

## 🤝 Contributing

This is an authorized greenfield project. See plan file for architecture decisions.

## 📄 License

TBD

---

**Tagline**: Plant Your Seed. Build Your Portfolio. 🌱💚
