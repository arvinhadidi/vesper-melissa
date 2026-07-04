import { createClient } from '@/lib/supabase/server';
import { ZODIAC_SIGNS } from '@/lib/onboarding/constants';
import {
  FOCUS_AREA_OPTIONS,
  LOVE_SITUATION_OPTIONS,
  OTHER_SITUATION_OPTIONS,
  SPECIFIC_PERSON_OPTIONS,
  DURATION_OPTIONS,
  READING_INTENT_OPTIONS,
  GUT_FEELING_OPTIONS,
  CHECKIN_TIME_OPTIONS,
  MOOD_OPTIONS,
  NOTICES_SIGNS_OPTIONS,
} from '@/lib/onboarding/options';

const ZODIAC_VALUES = new Set(ZODIAC_SIGNS.map(s => s.value));
const FOCUS_AREA_VALUES = new Set(FOCUS_AREA_OPTIONS.map(o => o.value));
const LOVE_SITUATION_VALUES = new Set(LOVE_SITUATION_OPTIONS.map(o => o.value));
const OTHER_SITUATION_VALUES = new Set(OTHER_SITUATION_OPTIONS.map(o => o.value));
const SPECIFIC_PERSON_VALUES = new Set(SPECIFIC_PERSON_OPTIONS.map(o => o.value));
const DURATION_VALUES = new Set(DURATION_OPTIONS.map(o => o.value));
const READING_INTENT_VALUES = new Set(READING_INTENT_OPTIONS.map(o => o.value));
const GUT_FEELING_VALUES = new Set(GUT_FEELING_OPTIONS.map(o => o.value));
const CHECKIN_TIME_VALUES = new Set(CHECKIN_TIME_OPTIONS.map(o => o.value));
const MOOD_VALUES = new Set(MOOD_OPTIONS.map(o => o.value));
const NOTICES_SIGNS_VALUES = new Set(NOTICES_SIGNS_OPTIONS.map(o => o.value));

type ProfileUpdateBody = {
  display_name?: string;
  star_sign?: string | null;
  birth_date?: string | null;
  current_mood?: string | null;
  notices_signs?: string | null;
  focus_area?: string;
  relationship_status?: string | null;
  life_weight?: string | null;
  has_specific_person?: string | null;
  duration_weight?: string | null;
  reading_intent?: string[];
  gut_feeling?: string | null;
  preferred_checkin_time?: string | null;
  email_marketing_consent?: boolean;
};

// PATCH /api/profile — edit-profile page writes here.
// Only the answer fields below are ever readable from the request body and
// writable to user_profiles — entitlement fields (onboarding_completed,
// subscription_status, is_subscribed, stripe_*, subscription_plan,
// trial_started_at) are never part of this allowlist. Those remain exclusively
// writable by /api/checkout, /api/sync-subscription, /api/subscription-status,
// and the Stripe webhook, per CLAUDE.md.
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json() as ProfileUpdateBody;
  const update: Record<string, unknown> = {};

  if (body.display_name !== undefined) {
    const trimmed = body.display_name.trim();
    if (!trimmed || trimmed.length > 15 || !/^[a-zA-Z]+$/.test(trimmed)) {
      return new Response('Invalid display_name', { status: 400 });
    }
    update.display_name = trimmed;
  }

  if (body.star_sign !== undefined) {
    if (body.star_sign !== null && !ZODIAC_VALUES.has(body.star_sign)) {
      return new Response('Invalid star_sign', { status: 400 });
    }
    update.star_sign = body.star_sign;
  }

  if (body.birth_date !== undefined) {
    if (body.birth_date !== null && !/^\d{2}-\d{2}$/.test(body.birth_date)) {
      return new Response('Invalid birth_date', { status: 400 });
    }
    update.birth_date = body.birth_date;
  }

  if (body.current_mood !== undefined) {
    if (body.current_mood !== null && !MOOD_VALUES.has(body.current_mood)) {
      return new Response('Invalid current_mood', { status: 400 });
    }
    update.current_mood = body.current_mood;
  }

  if (body.notices_signs !== undefined) {
    if (body.notices_signs !== null && !NOTICES_SIGNS_VALUES.has(body.notices_signs)) {
      return new Response('Invalid notices_signs', { status: 400 });
    }
    update.notices_signs = body.notices_signs;
  }

  // focus_area determines which set relationship_status/life_weight are validated
  // against — resolve the effective focus_area (new value if provided, else the
  // user's existing one) before checking those two fields.
  let effectiveFocusArea: string | null = null;
  if (body.focus_area !== undefined) {
    if (!FOCUS_AREA_VALUES.has(body.focus_area as never)) {
      return new Response('Invalid focus_area', { status: 400 });
    }
    update.focus_area = body.focus_area;
    effectiveFocusArea = body.focus_area;
  } else if (body.relationship_status !== undefined || body.life_weight !== undefined) {
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('focus_area')
      .eq('id', user.id)
      .single();
    effectiveFocusArea = existing?.focus_area ?? null;
  }

  const isLove = effectiveFocusArea === 'love_relationships';

  if (body.relationship_status !== undefined) {
    if (body.relationship_status !== null && (!isLove || !LOVE_SITUATION_VALUES.has(body.relationship_status))) {
      return new Response('Invalid relationship_status', { status: 400 });
    }
    update.relationship_status = body.relationship_status;
  }

  if (body.life_weight !== undefined) {
    if (body.life_weight !== null && (isLove || !OTHER_SITUATION_VALUES.has(body.life_weight))) {
      return new Response('Invalid life_weight', { status: 400 });
    }
    update.life_weight = body.life_weight;
  }

  if (body.has_specific_person !== undefined) {
    if (body.has_specific_person !== null && !SPECIFIC_PERSON_VALUES.has(body.has_specific_person)) {
      return new Response('Invalid has_specific_person', { status: 400 });
    }
    update.has_specific_person = body.has_specific_person;
  }

  if (body.duration_weight !== undefined) {
    if (body.duration_weight !== null && !DURATION_VALUES.has(body.duration_weight)) {
      return new Response('Invalid duration_weight', { status: 400 });
    }
    update.duration_weight = body.duration_weight;
  }

  if (body.reading_intent !== undefined) {
    if (
      !Array.isArray(body.reading_intent) ||
      body.reading_intent.length > 2 ||
      !body.reading_intent.every(v => READING_INTENT_VALUES.has(v))
    ) {
      return new Response('Invalid reading_intent', { status: 400 });
    }
    update.reading_intent = body.reading_intent;
  }

  if (body.gut_feeling !== undefined) {
    if (body.gut_feeling !== null && !GUT_FEELING_VALUES.has(body.gut_feeling)) {
      return new Response('Invalid gut_feeling', { status: 400 });
    }
    update.gut_feeling = body.gut_feeling;
  }

  if (body.preferred_checkin_time !== undefined) {
    if (!CHECKIN_TIME_VALUES.has(body.preferred_checkin_time)) {
      return new Response('Invalid preferred_checkin_time', { status: 400 });
    }
    update.preferred_checkin_time = body.preferred_checkin_time;
  }

  if (body.email_marketing_consent !== undefined) {
    update.email_marketing_consent = body.email_marketing_consent;
    update.email_consent_given_at = body.email_marketing_consent ? new Date().toISOString() : null;
  }

  if (Object.keys(update).length === 0) {
    return new Response('No valid fields to update', { status: 400 });
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: user.id, ...update }, { onConflict: 'id' });

  if (error) return new Response(error.message, { status: 500 });

  return new Response(null, { status: 204 });
}
