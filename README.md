# Awakening — guided meditation web app

A full-stack meditation product: React frontend with a dark neon-glass
design (near-black surfaces, per-category aura glows, dot-matrix numerals,
electric-yellow accents, an aura-bloom session player), with a real backend
for accounts, subscriptions, and progress.

## Features

- **Marketing site** — landing page, pricing page, responsive.
- **Accounts** — email + password (bcrypt-hashed), JWT sessions, rate-limited
  auth endpoints.
- **Content library** — 20 programs across 9 categories: Calm, Sleep,
  Anxiety, Gateway (CIA Gateway-inspired), Guided, Self-Belief,
  Manifestation, Affirmations, Music. All content lives in
  `src/data/programs.js`.
- **Session player** — breathing orb, step-by-step guided instructions,
  generative ambient audio (Web Audio API — no audio files needed), chimes
  on step transitions, ±10s seek, waveform progress.
- **Freemium paywall** — the first steps of every program are free; locked
  steps trigger an upgrade modal. Premium status is verified server-side.
- **Subscriptions** — monthly ($9.99) and yearly ($59.99) plans via
  **Stripe Checkout**, with webhooks, cancel-at-period-end, and resume.
  With no Stripe keys configured the server runs in **demo mode**: a clearly
  labeled simulated checkout exercises the entire flow without charging
  anyone.
- **Progress** — completed sessions, minutes, and day streaks per account.
- **Journey** — evolving personalized avatar (Avatar Studio: skin, hair,
  robe), a dark "inner systems" body view showing where practice is landing,
  and a "Your Ascent" milestone mountain.
- **Intention** — onboarding asks what the user wants to awaken in
  themselves; the goal is saved and mapped to a recommended practice path.
- **Remedy** (Premium) — the user describes what's troubling them and gets a
  practice prescription: matched sessions, an in-the-moment technique, and a
  habit tip. Never medication — crisis keywords surface helpline info, and a
  see-a-doctor disclaimer is always shown.
- **Funmaxxing** (Premium) — daily real-world joy quests with fun points,
  levels, and a streak.
- **SQLite persistence** — zero-dependency `node:sqlite` database in
  `data/awakening.db` (gitignored).

## Run it

```
npm install
npm run dev        # starts API (:4000) + Vite dev server (:5173)
```

Open http://localhost:5173. Billing runs in demo/test mode until you add
Stripe keys.

## Going live with Stripe

1. Copy `.env.example` to `.env`.
2. In the [Stripe dashboard](https://dashboard.stripe.com):
   - create a product "Awakening Premium" with two recurring prices
     (monthly + yearly) and paste their IDs into `STRIPE_PRICE_MONTHLY` /
     `STRIPE_PRICE_YEARLY`;
   - copy your secret + publishable keys into the `.env`;
   - add a webhook endpoint `https://your-domain.com/api/webhooks/stripe`
     for events `checkout.session.completed`,
     `customer.subscription.updated`, `customer.subscription.deleted`, and
     paste the signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Set a strong `JWT_SECRET` and your real `CLIENT_URL`.
4. Restart. The pricing page will now send users to Stripe-hosted Checkout;
   the in-app simulated checkout page is disabled automatically.

Test cards: use Stripe test keys and card `4242 4242 4242 4242` before
switching to live keys.

## Production build & deploy

```
npm run build      # outputs static frontend to dist/
npm start          # serves API + built frontend on one port (PORT env)
```

The Express server serves `dist/` and falls back to `index.html` for client
routes, so a single Node process on Render / Railway / Fly / a VPS is
enough. SQLite needs a persistent disk (or swap `server/db.js` for Postgres
when you outgrow it).

## Structure

- `server/index.js` — Express app, static serving, progress endpoints
- `server/auth.js` — register / login / me, JWT middleware
- `server/billing.js` — plans, Stripe Checkout, webhooks, demo mode
- `server/db.js` — SQLite schema + queries, premium + streak logic
- `src/data/programs.js` — all program/step content (swap in your own)
- `src/pages/` — Landing, Auth, Home, Library, ProgramDetail,
  SessionPlayer, Pricing, Checkout (demo), BillingSuccess, Account
- `src/audio/engine.js` — generative ambient audio engine
- `src/components/` — AppShell (phone-card layout + tab bar), paywall
  modal, hand-drawn-style SVG illustrations

## Before charging real money

1. Replace placeholder step copy with original or licensed guided scripts,
   and add real narration audio (swap `AmbientEngine` for recorded tracks).
2. The "CIA Gateway" sessions are *inspired by* the declassified 1983
   Gateway Process report (public domain); keep the "-inspired" framing and
   avoid living teachers' names/likenesses in branding.
3. Add terms of service, privacy policy, and refund policy pages.
4. Meditation content is not medical advice — keep the footer disclaimer.
5. Legal review of content originality/trademarks before publishing.

## iOS & Android apps

The native apps are already scaffolded with Capacitor — the same React app
wrapped in native iOS (`ios/`) and Android (`android/`) shells, with status
bar, splash screen, safe-area insets, and Android back-button handling wired
in. See **[MOBILE.md](MOBILE.md)** for the full build/run/ship guide. Quick
reference:

```
npm run mobile:sync       # rebuild web + copy into both native projects
npm run mobile:ios        # + open Xcode        (needs Xcode installed)
npm run mobile:android    # + open Android Studio (needs Android Studio)
```

The one required config is `VITE_API_URL` (your deployed backend URL) so the
apps can reach the API instead of the phone's own localhost — details in
MOBILE.md.
