'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

// Module-level guard so React StrictMode's double-mount (dev) doesn't double-init PostHog.
let initialized = false;

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || initialized) return;
    initialized = true;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
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
