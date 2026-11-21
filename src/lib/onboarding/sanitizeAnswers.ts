import { ZODIAC_SIGNS, MICRO_CARDS } from '@/lib/onboarding/constants';
import {
  FOCUS_AREA_OPTIONS, LOVE_SITUATION_OPTIONS, OTHER_SITUATION_OPTIONS, SPECIFIC_PERSON_OPTIONS,
  DURATION_OPTIONS, READING_INTENT_OPTIONS, GUT_FEELING_OPTIONS, CHECKIN_TIME_OPTIONS,
  MOOD_OPTIONS, NOTICES_SIGNS_OPTIONS,
} from '@/lib/onboarding/options';

const set = (opts: readonly { value: string | null }[]) => new Set<string>(opts.flatMap(o => (o.value ? [o.value] : [])));
const ENUMS: Record<string, Set<string>> = {
  star_sign: new Set(ZODIAC_SIGNS.map(s => s.value)),
  current_mood: set(MOOD_OPTIONS),
  notices_signs: set(NOTICES_SIGNS_OPTIONS),
  focus_area: set(FOCUS_AREA_OPTIONS),
  has_specific_person: set(SPECIFIC_PERSON_OPTIONS),
  duration_weight: set(DURATION_OPTIONS),
  gut_feeling: set(GUT_FEELING_OPTIONS),
  preferred_checkin_time: set(CHECKIN_TIME_OPTIONS),
  micro_pull_card: new Set(MICRO_CARDS.map(c => c.name)),
};
const READING_INTENT = set(READING_INTENT_OPTIONS);
const LOVE = set(LOVE_SITUATION_OPTIONS);
const OTHER = set(OTHER_SITUATION_OPTIONS);
const isIso = (v: unknown) => typeof v === 'string' && v.length < 40 && !Number.isNaN(Date.parse(v));

/**
 * Lenient allowlist for onboarding answers coming from the client. Unknown keys and
 * invalid values are DROPPED (never rejected), so a partial or stale sessionStorage
 * blob still saves everything that is valid. Only answer fields can ever come out of
 * this: entitlement fields (onboarding_completed, subscription_*, stripe_*) cannot.
 * Empty values are omitted so a later, emptier save never wipes an earlier answer.
 */
export function sanitizeAnswers(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const a = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  if (typeof a.display_name === 'string') {
    const n = a.display_name.trim();
    if (n && n.length <= 15 && /^[a-zA-Z]+$/.test(n)) out.display_name = n;
  }
  for (const [k, allowed] of Object.entries(ENUMS)) {
    if (typeof a[k] === 'string' && allowed.has(a[k] as string)) out[k] = a[k];
  }
  if (typeof a.birth_date === 'string' && /^\d{2}-\d{2}$/.test(a.birth_date)) out.birth_date = a.birth_date;
  const love = out.focus_area === 'love_relationships';
  if (typeof a.relationship_status === 'string' && love && LOVE.has(a.relationship_status)) out.relationship_status = a.relationship_status;
  if (typeof a.life_weight === 'string' && !love && OTHER.has(a.life_weight)) out.life_weight = a.life_weight;
  if (Array.isArray(a.reading_intent)) {
    const ri = a.reading_intent.filter((v): v is string => typeof v === 'string' && READING_INTENT.has(v)).slice(0, 2);
    if (ri.length) out.reading_intent = ri;
  }
  if (isIso(a.disclaimer_accepted_at)) out.disclaimer_accepted_at = a.disclaimer_accepted_at;
  if (a.email_marketing_consent === true) {
    out.email_marketing_consent = true;
    if (isIso(a.email_consent_given_at)) out.email_consent_given_at = a.email_consent_given_at;
  }
  return out;
}
