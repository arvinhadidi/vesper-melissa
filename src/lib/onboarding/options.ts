import type { FocusArea } from '@/lib/types';

// Single source of truth for onboarding option lists — shared between the
// onboarding step screens and the post-onboarding Edit Profile page so the
// wording/values never drift between the two.

export const MOOD_OPTIONS = [
  { label: '🌧️  Heavy', value: 'heavy' },
  { label: '🌱  Hopeful', value: 'hopeful' },
  { label: '🌀  Restless', value: 'restless' },
  { label: '🌫️  Numb', value: 'numb' },
  { label: '🤍  Honestly, fine', value: 'fine' },
];

export const NOTICES_SIGNS_OPTIONS = [
  { label: 'Always', value: 'always' },
  { label: 'I try to', value: 'sometimes' },
  { label: 'I want to get better at it', value: 'learning' },
];

export const FOCUS_AREA_OPTIONS: { label: string; value: FocusArea }[] = [
  { label: '💗  Love & Relationships', value: 'love_relationships' },
  { label: '🏡  Family & Loved Ones', value: 'family' },
  { label: '🌟  Career & Purpose', value: 'career' },
  { label: '🔀  A Big Decision', value: 'big_decision' },
  { label: '🕊️  Healing & Letting Go', value: 'healing' },
  { label: '✨  Open to Anything', value: 'open' },
];

export const LOVE_SITUATION_OPTIONS = [
  { label: '🌸  Single', value: 'single' },
  { label: '💬  Talking to Someone', value: 'talking' },
  { label: '🌀  Situationship', value: 'situationship' },
  { label: '💔  Healing from a Breakup', value: 'healing_breakup' },
  { label: '💑  In a Relationship', value: 'in_relationship' },
  { label: '🤐  Prefer Not to Say', value: 'prefer_not_say' },
];

export const OTHER_SITUATION_OPTIONS = [
  { label: '🫂  A Loved One', value: 'loved_one' },
  { label: '🔭  My Own Future', value: 'own_future' },
  { label: '⚖️  An Impossible Choice', value: 'impossible_choice' },
  { label: '🕯️  Grief or Loss', value: 'grief_loss' },
  { label: "🌊  Something I Can't Shake", value: 'cant_shake' },
  { label: '🌫️  Hard to Put Into Words', value: 'unnamed' },
];

export const SPECIFIC_PERSON_OPTIONS = [
  { label: "Yes, there's someone", value: 'yes_someone' },
  { label: 'More of a situation', value: 'situation' },
  { label: "It's about me", value: 'about_me' },
];

export const DURATION_OPTIONS = [
  { label: '🌱  Just recently', value: 'recent' },
  { label: '📅  A few weeks', value: 'weeks' },
  { label: '🌒  Months now', value: 'months' },
  { label: "🪨  Longer than I'd like to admit", value: 'long' },
];

export const READING_INTENT_OPTIONS = [
  { label: '🔦  Clarity', value: 'clarity' },
  { label: '🪶  A Sign', value: 'sign' },
  { label: '🤝  Whether to Hold On', value: 'hold_on' },
  { label: '🗺️  What I Need to Do', value: 'what_to_do' },
  { label: '🌤️  That Things Will Be Okay', value: 'things_okay' },
  { label: '🕊️  Permission to Let Go', value: 'let_go' },
];

export const GUT_FEELING_OPTIONS = [
  { label: "🌅  That it's going to work out", value: 'optimistic' },
  { label: '🔮  That I already know the answer', value: 'knows' },
  { label: "😶‍🌫️  Honestly, I'm scared to ask", value: 'scared' },
  { label: "🌫️  I genuinely don't know", value: 'unsure' },
];

export const CHECKIN_TIME_OPTIONS: { label: string; value: string | null }[] = [
  { label: 'Morning (7-9am)', value: 'morning' },
  { label: 'Lunchtime (12-2pm)', value: 'lunchtime' },
  { label: 'Evening (6-8pm)', value: 'evening' },
  { label: 'Night (9-11pm)', value: 'night' },
  { label: 'No thanks', value: null },
];
