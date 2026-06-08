# CLAUDE.md — Vesper

Read this at the start of every session before touching any code.

## What Vesper Is
Tarot reading web app for women 18-35, UK/US, focused on relationships and emotional clarity.
AI guide character: Melissa — warm oracle persona, never called AI in the product.
Revenue model: 3-day free trial → £9.99/month or yearly. No permanent free tier. Hard paywall at end of onboarding.

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS with custom design tokens (see tailwind.config.ts)
- Framer Motion for animations
- Supabase for auth (Google OAuth) + PostgreSQL database
- Anthropic SDK: claude-haiku-4-5-20251001 for all Melissa readings
- Lemon Squeezy for subscriptions (MoR handles VAT)
- Vercel for deployment

## Design Tokens
- Dark indigo: #1E1256 (primary text, backgrounds)
- Cream: #FAF7F0 (page background, button text)
- Gold: #C9A84C (accents, CTA, active states)
- Fonts: Cinzel (headings), EB Garamond (body/Melissa text), Lato (UI labels)

## File Conventions
- Components: PascalCase in src/components/{category}/
- Utilities: camelCase in src/lib/
- Card data: src/data/cards.json (78 Rider-Waite cards with meanings)
- Card images: public/cards/{name_short}.jpg (e.g. ar01.jpg, wapa.jpg)
- Melissa images: public/melissa/default.png, thinking.png, insight.png
- API routes: src/app/api/{route}/route.ts
- Types: src/lib/types.ts

## Coding Conventions
- Functional components only, no class components
- TypeScript strict mode — no `any` types
- Tailwind for all styling — no inline styles, no CSS modules
- One component per file
- Export types from src/lib/types.ts, import from there
- All Anthropic API calls go through server-side API routes only (never client-side)
- Environment variables: NEXT_PUBLIC_ prefix only for values safe to expose

## App Navigation
Bottom nav bar: Daily (/daily) | Spread (/spread) | Journal (/journal)
Auth: handled in src/middleware.ts — redirect unauthenticated users to /
Subscription check: middleware redirects expired trial to /paywall

## Session Workflow
1. Read this file
2. Read progress.json — find the first feature with status: "pending"
3. Run `npm run dev` and confirm it starts
4. Implement the one pending feature
5. Test it works in the browser
6. Update progress.json — mark feature as "complete"
7. Commit with message: "feat: [feature name]"
8. Report what was done and what the next pending feature is
