import type { OnboardingData, MicroCard } from './types';

export const ONBOARDING_SESSION_KEY = 'vesper_onboarding_session';

export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  disclaimer_accepted_at: null,
  display_name: '',
  star_sign: null,
  birth_date: null,
  current_mood: null,
  notices_signs: null,
  focus_area: null,
  relationship_status: null,
  life_weight: null,
  has_specific_person: null,
  micro_pull_card: null,
  duration_weight: null,
  reading_intent: [],
  gut_feeling: null,
  preferred_checkin_time: null,
  email_marketing_consent: false,
  email_consent_given_at: null,
};

export const STEP_ORDER = [
  'welcome', 'disclaimer', 'name', 'star-sign', 'mood',
  'notices-signs', 'focus-area', 'interstitial-focus', 'privacy', 'situation',
  'specific-person', 'micro-pull', 'duration', 'reading-intent', 'gut-feeling',
  'stat', 'commitment', 'email-checkin', 'synthesis', 'social-proof',
  'trial-enabled', 'paywall',
] as const;

export const NO_PROGRESS = new Set([
  'welcome', 'disclaimer', 'interstitial-focus',
  'micro-pull', 'synthesis', 'social-proof', 'trial-enabled', 'paywall',
]);

export function getNextStep(current: string): string | null {
  const idx = STEP_ORDER.indexOf(current as typeof STEP_ORDER[number]);
  if (idx === -1 || idx >= STEP_ORDER.length - 1) return null;
  return `/onboarding/${STEP_ORDER[idx + 1]}`;
}

export function getPrevStep(current: string): string | null {
  const idx = STEP_ORDER.indexOf(current as typeof STEP_ORDER[number]);
  if (idx <= 0) return null;
  return `/onboarding/${STEP_ORDER[idx - 1]}`;
}

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const MICRO_CARDS: MicroCard[] = [
  {
    name: 'The High Priestess',
    imagePath: 'ar02',
    line: "You didn't need the cards for this one. You've known for a while now. The real question is whether you trust yourself enough to act on it.",
  },
  {
    name: 'Two of Wands',
    imagePath: 'wa02',
    line: "You're standing at the edge of this, waiting for permission. Here it is: the choice is yours, and you're already leaning one way.",
  },
  {
    name: 'Wheel of Fortune',
    imagePath: 'ar10',
    line: 'This is already in motion - the answer is being written right now. What you do in the next few weeks matters more than what you asked.',
  },
  {
    name: 'The Star',
    imagePath: 'ar17',
    line: "Whatever you asked: it's going to be okay. Maybe not exactly how you pictured it. But okay.",
  },
  {
    name: 'The Moon',
    imagePath: 'ar18',
    line: "Not everything about this is visible yet - someone or something isn't showing its full face. The answer becomes clear when you watch what's done, not what's said.",
  },
];

export const MICRO_CARD_INDICES: Record<string, number> = { ar02: 2, wa02: 23, ar10: 10, ar17: 17, ar18: 18 };

export const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries', glyph: '♈' },
  { value: 'taurus', label: 'Taurus', glyph: '♉' },
  { value: 'gemini', label: 'Gemini', glyph: '♊' },
  { value: 'cancer', label: 'Cancer', glyph: '♋' },
  { value: 'leo', label: 'Leo', glyph: '♌' },
  { value: 'virgo', label: 'Virgo', glyph: '♍' },
  { value: 'libra', label: 'Libra', glyph: '♎' },
  { value: 'scorpio', label: 'Scorpio', glyph: '♏' },
  { value: 'sagittarius', label: 'Sagittarius', glyph: '♐' },
  { value: 'capricorn', label: 'Capricorn', glyph: '♑' },
  { value: 'aquarius', label: 'Aquarius', glyph: '♒' },
  { value: 'pisces', label: 'Pisces', glyph: '♓' },
];

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const FOCUS_INTERSTITIALS: Record<string, string> = {
  love_relationships: 'Matters of the heart. I had a feeling. Most who find me are carrying someone.',
  family: "The people closest to us pull the strongest threads. Let's look at yours.",
  career: "Purpose questions are never really about work. They're about who you're becoming.",
  big_decision: 'A crossroads. The cards love a crossroads.',
  healing: "You're here to put something down. That takes more courage than holding on.",
  open: 'No agenda. Those are often the most honest readings.',
};

export const SYNTHESIS_DURATION: Record<string, string> = {
  recent: "This is fresh - I can feel it.",
  weeks: 'A few weeks of carrying this. I can feel it.',
  months: "It's been months now - I can feel the weight of it.",
  long: "You've carried this longer than you'd like to admit. I can feel the weight of it.",
};

export const SYNTHESIS_PERSON: Record<string, string> = {
  yes_someone: "Someone specific. You didn't need to say much.",
  situation: 'A situation with many threads. I see them.',
  about_me: 'This one is about you. Those are the bravest readings.',
};

export const SYNTHESIS_GUT: Record<string, string> = {
  optimistic: "Your gut says it works out. Let's see what the cards say.",
  knows: "You said you already know. The cards will confirm it - or challenge it.",
  scared: "You said you're scared to ask. We'll go gently.",
  unsure: "You genuinely don't know. That's why the cards exist.",
};

export const VALUE_PROPS = [
  "A daily card reading with Melissa's personal take",
  "Guided spreads for the questions you can't stop thinking about",
  'A private journal to track what the cards have been telling you',
];

export const PRICING: Record<string, { symbol: string; monthly: number; yearly: number; savePct: number }> = {
  GBP: { symbol: '£', monthly: 9.99, yearly: 79.99, savePct: 33 },
  USD: { symbol: '$', monthly: 12.99, yearly: 103.99, savePct: 33 },
};
export const DEFAULT_CURRENCY = 'GBP';
export const TRIAL_DAYS = 3;
export const COUNTDOWN_SECONDS = 5 * 60;
