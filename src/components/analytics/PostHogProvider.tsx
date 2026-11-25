'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { captureFirstTouch } from '@/lib/onboarding/saveProgress';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

// Module-level guard so React StrictMode's double-mount (dev) doesn't double-init PostHog.
let initialized = false;

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Record first-touch source (referrer/UTM/landing page) on the very first page,
    // before onboarding, so onboarding_sessions rows know where each visitor came from.
    captureFirstTouch();
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || initialized) return;
    initialized = true;
    posthog.init(key, {
      // First-party proxy (cf-worker.js on Cloudflare, rewrites in next.config.ts on Vercel) so ad blockers don't drop events.
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      // App Router doesn't emit page loads on client navigations, so we capture $pageview
      // ourselves (below) and turn off the built-in one to avoid missing/duplicate events.
      capture_pageview: false,
      capture_pageleave: true,
      // Only create person profiles for identified (logged-in) users — anonymous funnel
      // events still flow, but we don't pay for a profile per anonymous visitor.
      person_profiles: 'identified_only',
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}

// Fires a $pageview on every App Router navigation (covers /onboarding/* funnel steps,
// /spread, /journal, /daily, /main, /account, /paywall, etc. with no per-page wiring).
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
