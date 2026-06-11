# 🎋 Bamboo — Development Guide

**Plant Your Seed. Build Your Portfolio.**

A two-sided investing marketplace connecting innovative entrepreneurs with impact-driven investors.

---

## 🚀 Launch Mode (current)

The project is heading to a **real launch** for ~100 selected participants.
Real Firebase auth + Firestore persistence are now active.

- **Auth**: `NEXT_PUBLIC_DEV_BYPASS_AUTH=false` in `web/.env.local` — real
  Firebase Email/Password auth, real Firestore reads/writes. Set it back to
  `true` only for offline UI iteration against mock data.
- **Firebase project**: `bambooo-5d4d2` (Blaze plan). Firestore rules,
  composite indexes, and Cloud Storage rules are deployed
  (`firebase deploy --only firestore,storage`).
- **Seed data**: 3 demo pitches (EduNexus / Ledgr / Northbound) + founder
  profiles live in Firestore. Re-seed with `node scripts/seed-firestore.mjs`
  (needs `scripts/service-account.json` — gitignored, never commit it).
- **Data source switch**: `web/lib/use-pitches.ts` reads Firestore when bypass
  is off, falls back to `web/lib/mock-pitches.ts` when bypass is on or
  Firestore errors.
- **Dev role switcher**: `web/components/DevRoleSwitcher.tsx` floating pill —
  only renders when bypass is on.
- **Roadmap**: see [MILESTONES.md](./MILESTONES.md). Phase 5 (auth +
  persistence) is done; Phase 6 (real Stripe payments) is active.

---

## Project Overview

Bamboo is a greenfield full-stack application built to connect inventors with investors. The platform enables:
- **Inventors**: Upload pitch videos, supporting documents, and pay a listing fee to reach investors
- **Investors**: Discover innovative pitches, watch founder videos, and invest in ideas they believe in

### Core Philosophy
- **Web-first**: Next.js 14 (App Router) with TypeScript and Tailwind CSS
- **Mobile-ready**: Expo React Native for iOS/Android
- **Real-time**: Firebase Firestore for data, real-time listeners for updates
- **Payment-ready**: Stripe integration path defined, stubbed for MVP

---

## 📁 Repository Structure

```
/Bamboo
├── /shared                 # Shared TypeScript types, constants, utilities
│   ├── src/
│   │   ├── types/         # User, Pitch, Investment, Payment types
│   │   ├── constants/     # Fees, categories, formatters
│   │   └── utils/         # Currency, date, equity calculation helpers
│   └── package.json
│
├── /web                    # Next.js 14 web application
│   ├── app/               # App Router pages
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (dashboard)/   # Protected dashboard routes
│   │   ├── discover/      # Pitch discovery pages
│   │   ├── pitch/         # Pitch creation & detail
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── Card.tsx       # Base card component with theme variants
│   │   ├── ThemeToggle.tsx # Light/dark theme toggle
│   │   ├── Navigation.tsx  # Header navigation
│   │   ├── Footer.tsx      # Footer component
│   │   ├── auth/          # Login, register, role selector
│   │   ├── pitch/         # Pitch creation wizard, pitch cards
│   │   ├── dashboard/     # Inventor & investor dashboards
│   │   ├── investment/    # Investment flow, payment stubs
│   │   └── ui/            # Reusable UI components
│   ├── context/           # React contexts (Auth, Theme)
│   ├── lib/
│   │   ├── firebase/      # Firebase auth, Firestore, storage
│   │   ├── stripe/        # Stripe payment stubs
│   │   └── utils/         # Helpers, validators
│   ├── styles/            # Global styles, theme variables
│   ├── public/            # Static assets
│   └── package.json
│
├── /mobile                 # Expo React Native app
│   ├── app/               # Expo Router screens
│   ├── components/        # Mobile-specific components
│   ├── navigation/        # Tab-based navigation
│   └── package.json
│
├── CLAUDE.md              # This file
├── MILESTONES.md          # Project phases and status
├── IMPLEMENTATION_STATUS.md # Detailed task checklist
├── README.md              # User-facing project overview
└── .firebase/             # Firebase configuration
```

---

## 🛠️ Development Environment

### Prerequisites
- Node.js 18+ (use `nvm use` to match `.nvmrc` if present)
- npm or yarn
- Firebase account (free tier sufficient)
- Git

### Setup

1. **Install root dependencies**
   ```bash
   npm install -r  # Install all packages in monorepo
   ```

2. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database (start in test mode)
   - Enable Cloud Storage
   - Copy project credentials

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

### Development Servers

**Web App**:
```bash
cd web
npm run dev
# Opens at http://localhost:3000
```

**Mobile App**:
```bash
cd mobile
npm start
# Scan QR code with Expo Go app
```

**Type Checking**:
```bash
npm run lint   # Web linting
npx tsc --noEmit  # Type check
```

---

## 🏗️ Architecture Decisions

### Frontend Architecture
- **App Router**: Next.js 14's App Router for file-based routing with nested layouts
- **Server Components**: Default to server components; use `'use client'` only where needed
- **Context API**: Used for Auth and Theme state (lightweight, no external deps)
- **Tailwind CSS**: Utility-first styling with CSS variables for theming

### Theme System
- **CSS Variables**: `--bg-primary`, `--text-primary`, `--accent-green`, `--shadow-md` etc.
- **Data Attribute**: `data-theme="light"` or `data-theme="dark"` on `<html>`
- **LocalStorage**: Theme preference persisted in browser
- **Card Component**: Base card component with `variant` prop (default, elevated, bordered)

### Firebase Architecture
- **Auth Context**: Manages user authentication state globally
- **Dynamic Imports**: Firebase imports wrapped to avoid SSR hydration errors
- **Firestore Structure**: Hierarchical collections (users, pitches, investments, payments, watchlist, notifications)
- **Real-time Listeners**: Configured but not fully consumed by UI yet

### Payment Architecture (Stubbed)
- **Abstraction Layer**: `web/lib/stripe/stub.ts` simulates payment processing
- **Mock Delays**: Realistic API delays simulated for UX testing
- **Stub Components**: `PaymentStub.tsx` UI ready for Stripe Elements integration
- **Real Integration Path**: Documented for post-MVP Stripe implementation

---

## 📋 Current Status

### Completed ✅
- Monorepo structure with `/shared`, `/web`, `/mobile`
- Landing page, theme system, nav/footer, Card components
- Auth pages (login, register, forgot-password) wired to Firebase
- Pitch creation wizard, inventor dashboard
- Discovery feed, pitch detail, watchlist, investment flow (investor side)
- Firestore security rules + composite indexes — **deployed**
- Cloud Storage rules — **deployed**
- Demo pitches + founders seeded into Firestore (`scripts/seed-firestore.mjs`)
- Auth-aware nav (`SiteNavActions`: account menu, dashboard link, logout)

### In Progress ⏳ (Phase 6)
- Real Stripe payments: listing fee + investment payments, webhooks

### Not Started 🔴
- Production Vercel deployment under custom domain (Phase 7)
- Sentry / uptime monitoring (Phase 7)
- Invite-only access for the 100-participant cohort (Phase 7)
- Admin moderation panel (Phase 8)
- Mobile screens (Phase 9)

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed task breakdown.

---

## 🔑 Key Features Explained

### Pitch Video Upload
- **Max Duration**: 60 seconds (enforced in form validation)
- **Storage**: Firebase Cloud Storage (path: `pitches/{pitchId}/video.mp4`)
- **Streaming**: Not implemented yet (will use `expo-av` for mobile, HTML5 video for web)

### Investment Flow
- **Minimum Investment**: $100 (enforced in form)
- **Equity Calculation**: `(investmentAmount / fundingGoal) * equityOffered`
- **Payment Processing**: Currently stubbed; Stripe Elements integration coming post-MVP

### Verified Badge
- **Cost**: $199
- **Process**: Due diligence verification (admin approval stubbed)
- **UI**: Badge display and modal info component (not yet built)

### Real-time Updates
- **Firestore Listeners**: Configured for investments, pitch views, watchlist changes
- **UI Integration**: Ready to be consumed by dashboard and detail pages

---

## 🚀 Common Tasks

### Add a New Page
1. Create route in `web/app/[route]/page.tsx`
2. Add navigation link in `components/Navigation.tsx`
3. If protected, wrap with `ProtectedRoute` (to be built)
4. Add types in `/shared/src/types/` if needed

### Add a New Component
1. Create in `web/components/` with kebab-case filename
2. Use `'use client'` only if it has interactivity or hooks
3. Accept `className` prop for customization
4. Follow existing naming conventions

### Add a Firebase Function
1. Create in `web/lib/firebase/` or `/shared/src/utils/`
2. Export from `index.ts` files
3. Add TypeScript types from `/shared/src/types/`
4. Test with Firestore emulator (setup in progress)

### Theme-aware Styling
```tsx
// Use CSS variables for theme colors
<div className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
  Content
</div>

// Or create theme variants in components
const variants = {
  default: 'bg-[var(--bg-primary)]',
  elevated: 'shadow-[var(--shadow-md)]',
};
```

---

## 🐛 Debugging Tips

### Firebase Auth Issues
- Check browser console for auth errors
- Verify `.env.local` has correct credentials
- Ensure Firebase project has Email/Password auth enabled

### Tailwind Classes Not Applying
- Restart dev server after adding new CSS variable names
- Check that filename matches content scan pattern in `tailwind.config.js`
- Verify class names don't use arbitrary values with spaces

### Hydration Errors
- Check for `useEffect` running on first render without `setIsClient` pattern
- Review ThemeToggle implementation for best practice

### Theme Not Persisting
- Check browser DevTools for `data-theme` attribute on `<html>`
- Verify localStorage is being read/written (DevTools > Application > Storage)
- Clear browser cache if theme variable changes aren't visible

---

## 📊 Performance Considerations

- **Code Splitting**: Automatic with App Router; no extra setup needed
- **Image Optimization**: Use Next.js `<Image>` component for all images
- **CSS Variables**: Lightweight theme system; no runtime overhead
- **Firestore Queries**: Add indexes for filtered/sorted queries on collections >10k docs
- **Video Streaming**: Plan for CDN (Firebase Storage has limited bandwidth)

---

## 🔐 Security Notes

- **Auth Context**: Only call Firebase auth from client-side (not server)
- **Firestore Rules**: Hardened and deployed (`firestore.rules`) — owner-only writes,
  public reads for live pitches, immutable investments
- **Storage Rules**: Deployed (`storage.rules`) — pitch-owner-only uploads with
  size/MIME limits
- **Payment Data**: Never handle raw payment data; use Stripe Elements for PCI compliance
- **Secrets**: `scripts/service-account.json` and `web/.env.local` are gitignored —
  never commit them. `NEXT_PUBLIC_*` keys are safe to expose; `STRIPE_SECRET_KEY`
  and service-account keys are not.

---

## 📚 Resources

- **Next.js 14 Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Firebase**: https://firebase.google.com/docs
- **Expo**: https://docs.expo.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## 🤝 Contribution Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint config (run `npm run lint` before committing)
- Use kebab-case for filenames, PascalCase for components
- Keep components small and composable
- Default to server components; use `'use client'` only when necessary

### Commits
- Write clear, imperative commit messages
- Group related changes into logical commits
- Reference MILESTONES.md when closing phases

### PR Process
1. Create a feature branch: `git checkout -b feature/description`
2. Make atomic commits
3. Run `npm run lint` and `npm run build` before pushing
4. Create PR with description of changes and testing notes

---

**Last Updated**: 2026-06-11  
**Maintained By**: Hussain Naqvi
