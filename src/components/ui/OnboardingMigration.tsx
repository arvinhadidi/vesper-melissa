'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

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
    const raw = localStorage.getItem('vesper_onboarding');
    if (!raw) return;

    let data: StoredOnboarding;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

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
          onboarding_completed: true,
          subscription_status: 'trial',
          trial_started_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .then(({ error }) => {
          if (!error) {
            localStorage.removeItem('vesper_onboarding');
          }
        });
    });
  }, []);

  return null;
}
