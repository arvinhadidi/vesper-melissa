import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types';

type ProfileRow = {
  id: string;
  display_name: string | null;
  star_sign: string | null;
  birth_date: string | null;
  focus_area: string | null;
  relationship_status: string | null;
  life_weight: string | null;
  has_specific_person: string | null;
  reading_intent: string[] | null;
  current_mood: string | null;
  notices_signs: string | null;
  duration_weight: string | null;
  gut_feeling: string | null;
  micro_pull_card: string | null;
  disclaimer_accepted_at: string | null;
  preferred_checkin_time: string | null;
  email_marketing_consent: boolean;
  email_consent_given_at: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  subscription_status: string;
  is_subscribed: boolean;
  subscription_plan: string | null;
  trial_started_at: string | null;
};

const SELECT_FIELDS = [
  'id', 'display_name', 'star_sign', 'birth_date', 'focus_area',
  'relationship_status', 'life_weight', 'has_specific_person', 'reading_intent',
  'current_mood', 'notices_signs', 'duration_weight', 'gut_feeling', 'micro_pull_card',
  'disclaimer_accepted_at', 'preferred_checkin_time', 'email_marketing_consent',
  'email_consent_given_at', 'onboarding_completed', 'onboarding_completed_at',
  'subscription_status', 'is_subscribed', 'subscription_plan', 'trial_started_at',
].join(', ');

export async function getUserProfile(supabase: SupabaseClient): Promise<UserProfile | null> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select(SELECT_FIELDS)
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  const row = data as unknown as ProfileRow;
  return {
    id: row.id,
    displayName: row.display_name ?? '',
    starSign: row.star_sign ?? '',
    birthDate: row.birth_date ?? null,
    focusArea: (row.focus_area as UserProfile['focusArea']) ?? 'open',
    relationshipStatus: row.relationship_status,
    lifeWeight: row.life_weight,
    hasSpecificPerson: (row.has_specific_person as UserProfile['hasSpecificPerson']) ?? null,
    readingIntent: row.reading_intent ?? [],
    currentMood: row.current_mood,
    noticesSigns: row.notices_signs,
    durationWeight: row.duration_weight,
    gutFeeling: row.gut_feeling,
    microPullCard: row.micro_pull_card,
    disclaimerAcceptedAt: row.disclaimer_accepted_at,
    preferredCheckinTime: row.preferred_checkin_time,
    emailMarketingConsent: row.email_marketing_consent ?? false,
    emailConsentGivenAt: row.email_consent_given_at,
    onboardingCompleted: row.onboarding_completed,
    onboardingCompletedAt: row.onboarding_completed_at,
    isSubscribed: row.is_subscribed,
    subscriptionStatus: row.subscription_status,
    subscriptionPlan: row.subscription_plan ?? null,
    trialStartedAt: row.trial_started_at ?? null,
  };
}
