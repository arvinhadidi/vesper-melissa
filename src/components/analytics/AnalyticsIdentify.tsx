'use client';

import { useEffect, useRef } from 'react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { identifyUser } from '@/lib/analytics';

// Ties PostHog events to the logged-in user once their profile loads, so the onboarding
// funnel and in-app events are attributed to a stable person (and across devices/sessions).
// Rendered inside the authenticated (app) layout where a user is always present.
export default function AnalyticsIdentify() {
  const { user, profile } = useUserProfile();
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || identifiedRef.current === user.id) return;
    identifiedRef.current = user.id;
    identifyUser(user.id, {
      email: user.email,
      star_sign: profile?.starSign ?? undefined,
      focus_area: profile?.focusArea ?? undefined,
      subscription_status: profile?.subscriptionStatus ?? undefined,
      subscription_plan: profile?.subscriptionPlan ?? undefined,
    });
  }, [user, profile]);

  return null;
}
