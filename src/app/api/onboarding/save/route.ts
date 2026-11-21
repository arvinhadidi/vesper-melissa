import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sanitizeAnswers } from '@/lib/onboarding/sanitizeAnswers';
import { geoFromHeaders, resolveCurrency } from '@/lib/geo';

// POST /api/onboarding/save — continual, anonymous-first onboarding save.
// Called on every onboarding step (template.tsx) and on key paywall events. Upserts
// one onboarding_sessions row per browser (sid = client uuid in localStorage) with
// answers + geo + source, signed in or not. Once the caller is signed in, the row is
// claimed (user_id/email) and the answers are mirrored onto user_profiles — answer
// fields ONLY (see sanitizeAnswers); entitlement fields are never written here.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENTS = new Set(['paywall_viewed', 'checkout_started', 'closing_offer_shown', 'closing_offer_accepted', 'closing_offer_declined', 'signin_started', 'signed_in']);
const str = (v: unknown, max: number) => (typeof v === 'string' && v ? v.slice(0, max) : null);

type Body = {
  sid?: string; step?: string; index?: number; answers?: unknown; event?: string;
  referrer?: string; landing_path?: string; utm?: Record<string, unknown>; posthog_id?: string;
};

export async function POST(req: NextRequest) {
  const text = await req.text();
  if (text.length > 16_000) return new Response('Too large', { status: 413 });
  let body: Body;
  try { body = JSON.parse(text) as Body; } catch { return new Response('Bad JSON', { status: 400 }); }
  if (!body.sid || !UUID.test(body.sid)) return new Response('Bad sid', { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const answers = sanitizeAnswers(body.answers);
  const geo = geoFromHeaders(req.headers);
  const currency = await resolveCurrency(geo.country);
  const step = str(body.step, 40);
  const index = Number.isInteger(body.index) ? Math.max(0, Math.min(99, body.index as number)) : null;
  const now = new Date().toISOString();

  const { data: existing } = await supabaseAdmin
    .from('onboarding_sessions')
    .select('answers, steps_seen, max_step_index, events, user_id, utm, referrer, landing_path, country, visit_count, updated_at')
    .eq('id', body.sid)
    .maybeSingle();

  // A sid already claimed by a different account is never re-pointed (shared device):
  // the save still lands on that account's profile below, the session row stays put.
  const claimable = !existing?.user_id || existing.user_id === user?.id;

  const stepsSeen: string[] = existing?.steps_seen ?? [];
  if (step && !stepsSeen.includes(step)) stepsSeen.push(step);
  const events = { ...(existing?.events ?? {}) } as Record<string, string>;
  if (body.event && EVENTS.has(body.event) && !events[body.event]) events[body.event] = now;
  if (user && !events.signed_in) events.signed_in = now;
  // New "visit" when the browser comes back after 30+ minutes away.
  const returning = existing?.updated_at && Date.now() - Date.parse(existing.updated_at) > 30 * 60 * 1000;

  const utm = body.utm && typeof body.utm === 'object'
    ? Object.fromEntries(Object.entries(body.utm).filter(([k, v]) => /^utm_|^ttclid$|^fbclid$|^gclid$/.test(k) && typeof v === 'string').map(([k, v]) => [k, (v as string).slice(0, 200)]))
    : null;

  const row = {
    id: body.sid,
    ...(claimable && user ? { user_id: user.id, email: user.email ?? null } : {}),
    last_step: step ?? undefined,
    last_step_index: index ?? undefined,
    max_step_index: Math.max(existing?.max_step_index ?? 0, index ?? 0),
    steps_seen: stepsSeen,
    answers: { ...(existing?.answers ?? {}), ...answers },
    events,
    // First-touch attribution: never overwrite once set.
    referrer: existing?.referrer ?? str(body.referrer, 500),
    landing_path: existing?.landing_path ?? str(body.landing_path, 300),
    utm: existing?.utm ?? (utm && Object.keys(utm).length ? utm : null),
    country: geo.country ?? existing?.country ?? null,
    region: geo.region ?? undefined,
    city: geo.city ?? undefined,
    currency,
    user_agent: str(req.headers.get('user-agent'), 400),
    posthog_distinct_id: str(body.posthog_id, 100) ?? undefined,
    visit_count: (existing?.visit_count ?? 0) + (existing ? (returning ? 1 : 0) : 1),
    updated_at: now,
  };

  // Never merge into a session row another account owns (sid reuse on a shared device,
  // or a leaked sid): only the owner or an unclaimed row gets written.
  let saved = true;
  if (claimable) {
    const { error } = await supabaseAdmin.from('onboarding_sessions').upsert(row, { onConflict: 'id' });
    if (error) console.error('[onboarding/save] session upsert failed', error.message);
    saved = !error;
  }

  if (user && Object.keys(answers).length) {
    // upsert (not update) so the row is created if this is the user's first write.
    const { error: pErr } = await supabaseAdmin
      .from('user_profiles')
      .upsert({ id: user.id, ...answers }, { onConflict: 'id' });
    if (pErr) console.error('[onboarding/save] profile upsert failed', pErr.message);
  }

  return Response.json({ ok: saved, currency, signedIn: Boolean(user) });
}
