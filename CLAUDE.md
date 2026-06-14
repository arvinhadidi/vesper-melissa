# CLAUDE.md — Vesper

Read this at the start of every session before touching any code.

## What Vesper Is
Tarot reading web app for women 18-35, UK/US, focused on relationships and emotional clarity.
AI guide character: Melissa — warm oracle persona, never called AI in the product.
Revenue model: 3-day free trial → £9.99/month or yearly. No permanent free tier. Hard paywall at end of onboarding.

## Tech Stack
- Next.js 16.2.7 (App Router, TypeScript)
- Tailwind CSS with custom design tokens (globals.css @theme block — no tailwind.config.ts)
- Framer Motion for animations
- Supabase for auth (Google OAuth) + PostgreSQL database
- Anthropic SDK: claude-haiku-4-5-20251001 for all Melissa readings
- Lemon Squeezy for subscriptions (MoR handles VAT)
- Vercel for deployment

## Design Tokens
- Dark indigo: #1E1256 (page background), deep indigo #120B3A (darkest chrome)
- Cream: #FAF7F0 (component surfaces: cards, buttons, modals, chat bubbles, bottom nav)
- Gold: #C9A84C (accents, primary CTAs, active states, hairline borders rgba(201,168,76,0.3))
- Fonts (next/font/google, CSS vars set on <html>): DM Serif Display `var(--font-dm-serif-var)` for headings/display/Melissa speech, EB Garamond `var(--font-garamond-var)` for body prose, DM Sans `var(--font-dm-sans-var)` for UI labels/buttons/eyebrows. Faculty Glyphic and Lato are no longer used.
- Page background is always dark indigo with the starry-sky texture (globals.css body::before, /landing/starrysky.webp). Components sit on it as cream surfaces with dark indigo text — dark-on-light for readability, and the dark card-back design pops on the dark page.
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
- Background: The starry sky background (`body::before` pseudo-element in globals.css, using `/landing/starrysky.webp`) applies to ALL pages globally — do NOT set a solid `background` colour on any page wrapper div, as this will cover the starry texture. Let the body::before show through.
- One component per file
- Export types from src/lib/types.ts, import from there
- All Anthropic API calls go through server-side API routes only (never client-side)
- Environment variables: NEXT_PUBLIC_ prefix only for values safe to expose
- Melissa system prompts: NEVER use em dashes in output — explicitly instruct the model to use commas, colons, or brackets instead
- Do NOT open, screenshot, or test pages in a browser (headless or otherwise) unless the user explicitly asks. Verify with typecheck/lint/build only.

## Onboarding (Session 12 — live)
- 22-screen flow at `/onboarding`, single route, step-index state machine in `page.tsx`
- All screen components are top-level (not nested inside parent) to satisfy `react-hooks/static-components`
- `OnboardingData` holds all answers in snake_case; written to Supabase once on reaching the paywall screen (before payment), with a `useRef` guard to prevent double-fire
- `onboarding_completed` and `onboarding_completed_at` are only set in the trial-start handler AFTER the user taps the paywall CTA
- Conditional screens: `situation` (screen 10) always present, renders love vs. other variant based on `focus_area`; `hold_in_mind` (screen 12) inserted only when `has_specific_person === 'yes_someone'`
- Micro-pull (screen 13): zero API calls — 5 hardcoded cards with verbatim lines, typewriter via `setInterval`
- Synthesis (screen 20): 6 lines built from state, each fading in ~1.4s apart, auto-advances after all lines shown
- Analytics: `console.log('[onboarding]', 'onboarding_step_viewed', { step })` fired on every step change

## Auth (Session 11 — live)
- TEST_USER is removed. All screens use real Supabase auth via @supabase/ssr.
- Supabase client utilities: src/lib/supabase/{client,server,middleware}.ts
- Client-side user hook: src/lib/hooks/useUserProfile.ts → { user, profile, loading, error }
- Server-side utility: src/lib/getUserProfile.ts (pass supabase server client)
- Google OAuth flow: /signin → Google → /auth/callback → /daily (middleware handles onboarding redirect)
- All three API routes (melissa-daily, melissa-spread, melissa-chat) verify auth via supabase.auth.getUser() and return 401 if unauthenticated.
- Journal saves go to Supabase (saved_readings table) via /api/journal, with localStorage as warm cache/fallback.
- OnboardingMigration component in app layout: migrates vesper_onboarding from localStorage to user_profiles on first app load.

## App Navigation
Bottom nav bar: Daily (/daily) | Spread (/spread) | Journal (/journal)
Additional routes: /main (home/menu), /chat/[id] (Melissa conversation, no bottom nav)
Auth: handled in src/middleware.ts — redirect unauthenticated users to /signin
Subscription check: middleware redirects expired trial to /paywall

## Melissa Reading Flow
The daily reading uses a 5-phase animated sequence (MelissaReadingFlow component):
1. intro — typewriters "Let me read your card, [name]." then erases itself
2. thinking — animated dots, fires API call in background (min 5s display)
3. eureka — typewriters "I have a verdict. Here goes..." then erases itself
4. revealing — typewriters the actual API response
5. complete — shows "Carry on the conversation" button → navigates to /chat/[id]

Chat context is passed via sessionStorage key `chat-{chatId}` (e.g. chat-daily-2026-06-09).
chatId format for daily: `daily-YYYY-MM-DD`

## Session Workflow
1. Read this file
2. Read progress.json — find the first feature with status: "pending"
3. Run `npm run dev` and confirm it starts
4. Implement the one pending feature
5. Verify with typecheck/lint (the user tests in the browser themselves)
6. Update progress.json — mark feature as "complete"
7. Commit with message: "feat: [feature name]"
8. Report what was done and what the next pending feature is
