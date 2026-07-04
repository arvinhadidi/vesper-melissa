# CLAUDE.md — Vesper

Read this at the start of every session before touching any code.

## What Vesper Is
Tarot reading web app for women 18-35, UK/US, focused on relationships and emotional clarity.
AI guide character: Melissa — warm oracle persona, never called AI in the product.
Revenue model: 14-day free trial → £9.99/month or yearly. No permanent free tier. Hard paywall at end of onboarding.

## Tech Stack
- Next.js 16.2.7 (App Router, TypeScript)
- Tailwind CSS with custom design tokens (globals.css @theme block — no tailwind.config.ts)
- Framer Motion for animations
- Supabase for auth (Google OAuth) + PostgreSQL database
- AWS Bedrock (bearer token auth) for all Melissa readings — model: us.anthropic.claude-haiku-4-5-20251001-v1:0
- Stripe for subscriptions (hosted checkout, Stripe handles PCI/SCA)
- Vercel for deployment

## Design Tokens
- Dark indigo: #1E1256 (page background), deep indigo #120B3A (darkest chrome)
- Cream: #FAF7F0 (component surfaces: cards, buttons, modals, chat bubbles, bottom nav)
- Gold: #C9A84C (accents, primary CTAs, active states, hairline borders rgba(201,168,76,0.3))
- Fonts (next/font/google, CSS vars set on <html>): DM Serif Display `var(--font-dm-serif-var)` for headings/display/Melissa speech, EB Garamond `var(--font-garamond-var)` for body prose, DM Sans `var(--font-dm-sans-var)` for UI labels/buttons/eyebrows. Faculty Glyphic and Lato are no longer used.
- Page background: two themes with a hard cutover at the onboarding `trial-enabled` screen (see Background convention below). Before it = lighter "bluer" indigo gradient; from `trial-enabled` onward = the dark night sky. Both sit over /landing/starrysky.webp. Components sit on it as cream surfaces with dark indigo text — dark-on-light for readability, and the dark card-back design pops on the dark page.
- Muted text: rgba(250,247,240,0.55-0.6) on dark, rgba(30,18,86,0.62) on cream
- Layout: app content is centred in a 520px max-width column (mobile-first, nothing critical outside the middle third)

## File Conventions
- Components: PascalCase in src/components/{category}/
- Utilities: camelCase in src/lib/
- Card data: src/data/cards.json (78 Rider-Waite cards with meanings)
- Card images: public/cards-cropped/{name_short}.png — all 78 cards auto-cropped to remove Rider-Waite black borders (script: scripts/crop-card-borders.mjs)
- Melissa images: public/melissa/melissa-default.png, melissa-thinking.png, melissa-insight.png (note: prefixed with "melissa-")
- Brand source assets: brand_assets/brand_mascot/*_final.png (canonical Melissa art) and brand_assets/background_images/. brand_assets/brand_mascot/other_mascot_images/ holds rejected variants and is gitignored. Landing page uses optimised copies in public/landing/
- API routes: src/app/api/{route}/route.ts
- Types: src/lib/types.ts
- Card logic (seeded daily + spread): src/lib/cardLogic.js (plain JS with ES module exports)

## Coding Conventions
- Functional components only, no class components
- TypeScript strict mode — no `any` types
- Styling: inline styles are used for app pages and components (not Tailwind utility classes). Tailwind tokens are defined in globals.css @theme block and used via CSS variables. Do not switch to Tailwind utility classes for new components — match the inline style pattern already in place.
- Background — two themes with a hard cutover at the onboarding `trial-enabled` screen (`STEP_ORDER` in src/lib/onboarding/constants.ts):
  - **Bluer (lighter indigo gradient)** — onboarding screens `welcome` through `social-proof`. Set in `src/app/onboarding/layout.tsx` (the `lightBg` style: `backgroundColor: '#1E1256'` + `linear-gradient(... rgba(30,18,86,1) 100%)` over `/landing/starrysky.webp`, `backgroundAttachment: fixed`). This is the original look and stays. The global `body::before` in globals.css carries the same gradient as a fallback for any page that sets no background of its own (e.g. `/signin`).
  - **Dark night sky** — from `trial-enabled` onward: onboarding `trial-enabled` + `paywall`, standalone `/paywall`, `/personalisation`, and every `(app)` page (main, spread, daily, journal, chat). Rendered by the shared `src/components/ui/NightSky.tsx`: fixed full-viewport `#120B3A` base + drifting starfield + twinkling stars + gold motes + moon-glow halo. Keyframes (`mn-twinkle`/`mn-drift`/`mn-glow`/`mn-mote`) live in globals.css; motion is disabled under `prefers-reduced-motion` via the `.mn-anim` class.
  - **How to apply NightSky:** render `<NightSky />` as a sibling BEHIND content and give the content wrapper `position: relative; zIndex: 1` (NightSky is `position: fixed; zIndex: 0` with an opaque base, so content must sit above it). The `(app)` layout and `onboarding/layout` (dark branch via `isDark`) already render it, so pages inside them need nothing. For a NEW standalone dark route, wrap the root in a fragment with `<NightSky />` first and make the root `position: relative; zIndex: 1` with no opaque background of its own.
  - Do NOT use a plain solid background colour — every screen must have either the bluer gradient (pre-trial) or NightSky (trial-enabled onward).
- One component per file
- Export types from src/lib/types.ts, import from there
- All AI API calls go through server-side API routes only (never client-side)
- Bedrock calls use the thin wrapper at src/lib/bedrock.ts (bedrockStream for streaming routes, bedrockCreate for non-streaming). Do NOT use @anthropic-ai/bedrock-sdk — it has a bug with bearer token auth that causes silent empty responses. The wrapper calls the Bedrock REST API directly with fetch and parses AWS EventStream binary framing manually.
- Bedrock env vars: AWS_REGION (us-east-1) and AWS_BEARER_TOKEN_BEDROCK (ABSK... token). The standard ANTHROPIC_API_KEY is not used.
- Environment variables: NEXT_PUBLIC_ prefix only for values safe to expose
- Melissa system prompts: NEVER use em dashes in output — explicitly instruct the model to use commas, colons, or brackets instead
- Do NOT open, screenshot, or test pages in a browser (headless or otherwise) unless the user explicitly asks. Verify with typecheck/lint/build only.

## Onboarding (Session 12; restructured into per-route screens — live)
- 22-step flow at `/onboarding`, now **one route per step** (`/onboarding/welcome`, `/onboarding/name`, … see `STEP_ORDER` in `src/lib/onboarding/constants.ts`). `/onboarding/page.tsx` is just a `redirect('/onboarding/welcome')`. Shared chrome (progress bar, background cutover) lives in `onboarding/layout.tsx`; the slide transition + funnel analytics live in `onboarding/template.tsx`. (The old single-route step-index state machine in `page.tsx` is gone.)
- Shared step UI is in `src/components/onboarding/` (Heading, OptionTile, PrimaryButton, ProgressBar, MelissaAvatar, **PlanSelector**); shared state/constants/helpers in `src/lib/onboarding/` (`constants.ts`, `useOnboardingData.ts`, `useDetectedCurrency.ts`, `helpers.ts`, `types.ts`)
- `OnboardingData` holds all answers in snake_case; written to Supabase once on reaching the paywall screen (before payment), with a `useRef` guard to prevent double-fire
- `onboarding_completed` and `onboarding_completed_at` are only set in the trial-start handler AFTER the user taps the paywall CTA
- Conditional screens: `situation` (screen 10) always present, renders love vs. other variant based on `focus_area`; `hold_in_mind` (screen 12) inserted only when `has_specific_person === 'yes_someone'`
- Micro-pull (screen 13): zero API calls — 5 hardcoded cards with verbatim lines, typewriter via `setInterval`
- Synthesis (screen 20): 6 lines built from state, each fading in ~1.4s apart, auto-advances after all lines shown
- Analytics: `onboarding/template.tsx` fires a PostHog `onboarding_step_viewed` event ({ step, index, total }) on every step change (see Analytics section below). PostHog also auto-captures a `$pageview` per `/onboarding/<step>` route, so the funnel is visible two ways.
- Email check-in (screen `email-checkin`) collects `preferred_checkin_time` and `email_marketing_consent`/`email_consent_given_at` and stores them on the profile — **but no email is actually ever sent.** There is no email provider integrated yet (no Resend/Postmark/SES, no cron/Edge Function to dispatch the daily reading email). This is a known gap, tracked as a pending feature in progress.json — implement before promoting the "she'll send daily reminders by email" promise made on that screen.

## Auth (Session 11 — live)
- TEST_USER is removed. All screens use real Supabase auth via @supabase/ssr.
- Supabase client utilities: src/lib/supabase/{client,server,middleware}.ts
- Client-side user hook: src/lib/hooks/useUserProfile.ts → { user, profile, loading, error }
- Server-side utility: src/lib/getUserProfile.ts (pass supabase server client)
- Google OAuth flow: /signin → Google → /auth/callback → /daily (middleware handles onboarding redirect)
- All three API routes (melissa-daily, melissa-spread, melissa-chat) verify auth via supabase.auth.getUser() and return 401 if unauthenticated.
- Journal saves go to Supabase (saved_readings table) via /api/journal, with localStorage as warm cache/fallback.
- OnboardingMigration component in app layout: migrates vesper_onboarding (answer fields only — name, star sign, focus area, etc.) from localStorage to user_profiles on first app load. As of Session 14 it must NEVER write `onboarding_completed`, `subscription_status`, or `trial_started_at` — those are entitlement fields and are written exclusively by the server routes listed under Subscription & Billing below. This component used to grant free access by writing `subscription_status: 'trial'` client-side with no Stripe customer; that bug is what Session 14 fixed.

## App Navigation
Bottom nav bar: Daily (/daily) | Spread (/spread) | Journal (/journal) | Account (/account)
Side nav (desktop): same four tabs plus /main (home)
Additional routes: /main (home/menu), /chat/[id] (Melissa conversation, no bottom nav)
Auth: handled in src/middleware.ts — `AUTH_REQUIRED_PATHS` = /daily, /spread, /journal, /chat, /main, /account (unauthenticated → /signin). /account is intentionally auth-only with no subscription check, so a user can always reach it to manage/cancel/delete regardless of status.
Subscription check: `SUBSCRIPTION_REQUIRED_PATHS` = /daily, /spread, /chat, /main. /journal is exempt (accessible when expired). subscription_status='none' (never subscribed) → /onboarding/paywall (trial still offered); 'expired'/'cancelled' (lapsed) → standalone /paywall (no second trial, immediate charge).

## Subscription & Billing (Session 14 rewrite — Stripe is the single source of truth)
**Architecture principle:** `user_profiles` is a read-only mirror of Stripe. The client never writes entitlement fields (`subscription_status`, `is_subscribed`, `stripe_subscription_id`, `subscription_plan`, `trial_started_at`, `onboarding_completed`). Only these server-side routes may touch them:
1. **`/api/checkout`** — creates the Stripe customer on first checkout attempt and writes `stripe_customer_id` + `onboarding_completed` + `onboarding_completed_at` at that moment (trial or not, completed or abandoned). Appends `session_id={CHECKOUT_SESSION_ID}` to the Stripe success_url for reconciliation.
2. **`/api/sync-subscription`** (new) — called by `/personalisation` and standalone `/paywall` immediately on return from Stripe Checkout. Retrieves the checkout session + subscription directly from Stripe (verifies `subscription.metadata.supabase_uid` matches the caller) and writes `subscription_status: 'active'` + subscription id/plan/trial_started_at. Exists so entitlement doesn't depend solely on the webhook, which can lag or never reach localhost in dev.
3. **`/api/webhooks/stripe`** — handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Authoritative for everything that happens *after* checkout (renewals, card failures, portal cancellations).
4. **`/api/subscription-status`** — reconcile-on-read for the `/account` page: re-fetches the tracked subscription from Stripe and re-mirrors `subscription_status`/`is_subscribed` (and clears a stale `trial_started_at`) so the page is correct even if a webhook was missed. Read-mostly, but it does write, so it obeys the same upsert rule.

**All writers use `.upsert({ id: ..., ... }, { onConflict: 'id' })`, never `.update()`.** `.update().eq('id', uid)` silently no-ops if the profile row doesn't exist yet — this caused a real regression (Session 15) where a brand-new user could pay, return to `/personalisation`, and get bounced back to `/onboarding/welcome` because the checkout write vanished. Any new entitlement write must upsert, not update.

- Stripe Checkout with 3-day trial (card collected upfront) at end of onboarding → /api/checkout
- Standalone /paywall page for lapsed (expired/cancelled) users — no trial, immediate charge. Useful to manually visit in test mode to prove a charge lands without waiting on a trial period.
- Stripe Customer Portal for cancellation/card changes → /api/billing-portal (404s only if `stripe_customer_id` is null, which should now be unreachable for any genuinely entitled user)
- /account page: shows subscription status, trial end date, "Manage subscription" button. Shows an inline error (not infinite "Loading…") if the profile can't be fetched, with a link back to /signin.
- Webhook at /api/webhooks/stripe handles: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
- subscription_status values: 'none' | 'active' | 'expired' | 'cancelled' (Stripe trialing maps to 'active'). DB-enforced via a CHECK constraint (migration `20260620120000_fix_subscription_status_source_of_truth.sql`) — no other value can ever be written again.
- Price IDs in .env.local: STRIPE_PRICE_ID_MONTHLY_GBP, STRIPE_PRICE_ID_YEARLY_GBP (must be test-mode IDs when using sk_test_ key)
- To verify trial→paid conversion without waiting 3 real days, use a Stripe Test Clock (Dashboard → Developers → Test clocks) and fast-forward past trial end — fires the same webhooks as production.

## Melissa Reading Flow
The daily reading uses a 5-phase animated sequence (MelissaReadingFlow component):
1. intro — typewriters "Let me read your card, [name]." then erases itself
2. thinking — animated dots, fires API call in background (min 5s display)
3. eureka — typewriters "I have a verdict. Here goes..." then erases itself
4. revealing — typewriters the actual API response
5. complete — shows "Carry on the conversation" button → navigates to /chat/[id]

Chat context is passed via sessionStorage key `chat-{chatId}` (e.g. chat-daily-2026-06-09).
chatId format for daily: `daily-YYYY-MM-DD`

## Analytics (Vercel Analytics + PostHog — live)
- Two providers, both wired in the root `src/app/layout.tsx`: Vercel `<Analytics />` (traffic/Web Vitals, zero config on Vercel) and `<PostHogProvider>` (product analytics + funnels).
- **PostHog setup:** `src/components/analytics/PostHogProvider.tsx` inits posthog-js (StrictMode-guarded) and captures a `$pageview` on every App Router navigation (built-in `capture_pageview` is off because App Router doesn't emit page loads on client nav). `person_profiles: 'identified_only'`. `src/components/analytics/AnalyticsIdentify.tsx` (rendered in the `(app)` layout) calls `posthog.identify(user.id, …)` once the profile loads.
- **One helper:** import `track`/`identifyUser`/`resetAnalytics` from `src/lib/analytics.ts`. Every call is a safe no-op when `NEXT_PUBLIC_POSTHOG_KEY` is unset (local dev, SSR), so call it anywhere without guards. `resetAnalytics()` is called on sign-out and account deletion.
- **Named events so far:** `onboarding_step_viewed` ({ step, index, total }, in `onboarding/template.tsx`), `trial_checkout_started` (onboarding paywall), `checkout_started` (standalone paywall), `reading_completed` ({ type: daily|spread }, in `MelissaReadingFlow`). Screen visits (spread, journal, daily, main, account, paywall) come for free via `$pageview`. Add new events through `track()`, not posthog-js directly.
- **Env vars (client-exposed, `NEXT_PUBLIC_`):** `NEXT_PUBLIC_POSTHOG_KEY` (PostHog project API key) and optional `NEXT_PUBLIC_POSTHOG_HOST` (defaults to `https://us.i.posthog.com`; use `https://eu.i.posthog.com` for EU). Vercel Analytics needs no key. Set both in `.env.local` and in Vercel project env.
- **Note:** `@vercel/analytics` drags in an optional `@sveltejs/kit` peer that conflicts with the repo's vite 5 — `.npmrc` pins `legacy-peer-deps=true` so `npm install` (and the Vercel build) resolves. Don't delete it.

## Pre-Launch Checklist (selling this for real, not just deployed)
Deploying to Vercel is necessary but not sufficient. Before charging real customers:
- Switch Stripe to live mode: live secret key, live price IDs, live webhook endpoint + signing secret registered against the production domain (not localhost)
- Production env vars on Vercel for Supabase + Stripe + AWS Bedrock — confirm no test/live key mixing
- Real domain + HTTPS; Google OAuth authorized redirect URI updated to the production domain
- Privacy Policy + Terms of Service pages actually built and linked (signin page already references "Terms of Service")
- Stripe Customer Portal configured in live mode (separate config from test mode)
- Tax/VAT handling (Stripe Tax) depending on registration status
- Error monitoring (e.g. Sentry) — billing failures are currently easy to miss
- Rate limiting on the Bedrock-backed routes (melissa-daily/spread/chat): in-memory stopgap is live (30 calls/user/hour, per-instance — acceptable for now). Replace with Upstash Redis for a true global limit before high traffic.
- Confirm Supabase backups/PITR on the production project
- Build the email check-in sender (see Onboarding section above) before promoting that feature

## Session Workflow
1. Read this file
2. Read progress.json — find the first feature with status: "pending"
3. Run `npm run dev` and confirm it starts
4. Implement the one pending feature
5. Verify with typecheck/lint (the user tests in the browser themselves)
6. Update progress.json — mark feature as "complete"
7. Commit with message: "feat: [feature name]"
8. Report what was done and what the next pending feature is
