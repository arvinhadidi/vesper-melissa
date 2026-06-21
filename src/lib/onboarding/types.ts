export type FocusArea =
  | 'love_relationships'
  | 'family'
  | 'career'
  | 'big_decision'
  | 'healing'
  | 'open';

export type OnboardingData = {
  disclaimer_accepted_at: string | null;
  display_name: string;
  star_sign: string | null;
  birth_date: string | null;
  current_mood: string | null;
  notices_signs: string | null;
  focus_area: FocusArea | null;
  relationship_status: string | null;
  life_weight: string | null;
  has_specific_person: string | null;
  micro_pull_card: string | null;
  duration_weight: string | null;
  reading_intent: string[];
  gut_feeling: string | null;
  preferred_checkin_time: string | null;
  email_marketing_consent: boolean;
  email_consent_given_at: string | null;
};

export type MicroCard = { name: string; imagePath: string; line: string };
