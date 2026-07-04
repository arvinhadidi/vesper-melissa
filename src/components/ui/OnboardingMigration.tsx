'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ensureLocalDataMatchesUser } from '@/lib/clearLocalData';

const ATTEMPTS_KEY = 'vesper_onboarding_migration_attempts';
const MAX_ATTEMPTS = 5;

type StoredOnboarding = {
  // v1 fields (camelCase)
  displayName?: string;
  starSign?: string;
  focusArea?: string;
  relationshipStatus?: string | null;
  hasSpecificPerson?: string | null;
  readingIntent?: string[];
  // v2 fields (snake_case)
  display_name?: string;
  star_sign?: string;
  birth_date?: string | null;
  focus_area?: string;
  relationship_status?: string | null;
  life_weight?: string | null;
  has_specific_person?: string | null;
  reading_intent?: string[];
  current_mood?: string | null;
  notices_signs?: string | null;
  duration_weight?: string | null;
  gut_feeling?: string | null;
  micro_pull_card?: string | null;
  disclaimer_accepted_at?: string | null;
  preferred_checkin_time?: string | null;
  email_marketing_consent?: boolean;
  email_consent_given_at?: string | null;
};

export default function OnboardingMigration() {
  useEffect(() => {
    (async () => {
      // Wait for the account-switch check so a stale vesper_onboarding payload left
      // over from a previous account on this device is cleared (not migrated onto
      // whichever user happens to be signed in now) before we read it.
      await ensureLocalDataMatchesUser();

      const raw = localStorage.getItem('vesper_onboarding');
      if (!raw) return;

      let data: StoredOnboarding;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }

      // If there's no real onboarding data (e.g. an empty/abandoned payload), don't migrate —
      // upserting nulls would wipe answers the user already has saved.
      if (!(data.display_name ?? data.displayName)) {
        localStorage.removeItem('vesper_onboarding');
        return;
      }

      // Give up after a few failed attempts instead of retrying forever on every
      // app load — an indefinitely-retried upsert would silently clobber any future
      // profile-edit feature's writes the next time this component mounts.
      const attempts = Number(localStorage.getItem(ATTEMPTS_KEY) ?? '0');
      if (attempts >= MAX_ATTEMPTS) {
        localStorage.removeItem('vesper_onboarding');
        localStorage.removeItem(ATTEMPTS_KEY);
        return;
      }

      const supabase = createClient();

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;

        // Answer fields only — entitlement (onboarding_completed, subscription_status,
        // trial_started_at) is written exclusively by /api/checkout, /api/sync-subscription,
        // and the Stripe webhook. This component must never grant access on its own.
        supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            // Support both v1 (camelCase) and v2 (snake_case) stored formats
            display_name: data.display_name ?? data.displayName ?? null,
            star_sign: data.star_sign ?? data.starSign ?? null,
            birth_date: data.birth_date ?? null,
            focus_area: data.focus_area ?? data.focusArea ?? null,
            relationship_status: data.relationship_status ?? data.relationshipStatus ?? null,
            life_weight: data.life_weight ?? null,
            has_specific_person: data.has_specific_person ?? data.hasSpecificPerson ?? null,
            reading_intent: data.reading_intent ?? data.readingIntent ?? [],
            current_mood: data.current_mood ?? null,
            notices_signs: data.notices_signs ?? null,
            duration_weight: data.duration_weight ?? null,
            gut_feeling: data.gut_feeling ?? null,
            micro_pull_card: data.micro_pull_card ?? null,
            disclaimer_accepted_at: data.disclaimer_accepted_at ?? null,
            preferred_checkin_time: data.preferred_checkin_time ?? null,
            email_marketing_consent: data.email_marketing_consent ?? false,
            email_consent_given_at: data.email_consent_given_at ?? null,
          }, { onConflict: 'id' })
          .then(({ error }) => {
            if (!error) {
              localStorage.removeItem('vesper_onboarding');
              localStorage.removeItem(ATTEMPTS_KEY);
            } else {
              localStorage.setItem(ATTEMPTS_KEY, String(attempts + 1));
            }
          });
      });
    })();
  }, []);

  return null;
}
