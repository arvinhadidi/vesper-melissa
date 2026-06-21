import posthog from 'posthog-js';

// Thin, app-wide wrapper around PostHog so screens import ONE helper instead of posthog-js
// directly. Every call is a no-op when no key is configured (local dev without analytics, SSR),
// so it's always safe to call from anywhere without guarding at the call site.
const HAS_POSTHOG = typeof window !== 'undefined' && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

/** Named product event (e.g. 'onboarding_step_viewed', 'trial_checkout_started'). */
export function track(event: string, props?: Record<string, unknown>): void {
  if (!HAS_POSTHOG) return;
  posthog.capture(event, props);
}

/** Tie subsequent events to a known user once they're authenticated. */
export function identifyUser(id: string, props?: Record<string, unknown>): void {
  if (!HAS_POSTHOG) return;
  posthog.identify(id, props);
}

/** Clear the identity on sign-out / account deletion so events aren't merged across users. */
export function resetAnalytics(): void {
  if (!HAS_POSTHOG) return;
  posthog.reset();
}
