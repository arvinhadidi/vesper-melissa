import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

// Reconciles the local subscription mirror against Stripe on demand (called by /account).
// This makes the account page show the truth even if a webhook was delayed or never fired
// (e.g. a cancellation done in the Stripe Customer Portal during local dev).
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_status, stripe_subscription_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return Response.json({
      status: profile?.subscription_status ?? 'none',
      cancelAtPeriodEnd: false,
      accessEndsAt: null,
      isTrialing: false,
    });
  }

  let sub: Stripe.Subscription;
  try {
    sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
  } catch {
    // Subscription no longer exists in Stripe — treat as cancelled.
    // upsert (not update) to stay consistent with the other entitlement writers —
    // update() silently no-ops if the row is somehow missing.
    await supabase.from('user_profiles')
      .upsert({ id: user.id, subscription_status: 'cancelled', is_subscribed: false }, { onConflict: 'id' });
    return Response.json({ status: 'cancelled', cancelAtPeriodEnd: false, accessEndsAt: null, isTrialing: false });
  }

  let appStatus: 'active' | 'cancelled' | 'expired';
  if (sub.status === 'active' || sub.status === 'trialing') appStatus = 'active';
  else if (sub.status === 'canceled') appStatus = 'cancelled';
  else appStatus = 'expired';

  // Keep the mirror in sync (covers a missed webhook). Also clear a stale
  // trial_started_at left over from an earlier trial — it's only ever set, never
  // cleared, by the checkout webhook, so a later non-trial subscription would
  // otherwise still look like it's "on trial" from this field alone.
  await supabase.from('user_profiles')
    .upsert({
      id: user.id,
      subscription_status: appStatus,
      is_subscribed: appStatus === 'active',
      ...(sub.status !== 'trialing' ? { trial_started_at: null } : {}),
    }, { onConflict: 'id' });

  // When access actually ends: trial end if still trialing, otherwise the current period end.
  const item = sub.items.data[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const periodEndUnix =
    sub.status === 'trialing' && sub.trial_end
      ? sub.trial_end
      : item?.current_period_end
        ?? (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end
        ?? null;

  // Stripe's billing portal schedules a cancellation via the `cancel_at` timestamp
  // field, not the legacy `cancel_at_period_end` boolean — checking only the latter
  // misses real, confirmed portal cancellations (status stays 'trialing'/'active'
  // until cancel_at actually arrives), showing "you'll be charged" when the user has
  // already cancelled.
  const cancelAtPeriodEnd = sub.cancel_at_period_end || sub.cancel_at != null;

  return Response.json({
    status: appStatus,
    cancelAtPeriodEnd,
    accessEndsAt: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
    // appStatus collapses Stripe's 'trialing' and 'active' into the same 'active'
    // value, so the account page needs this distinct signal — trial_started_at
    // alone isn't reliable (it's sticky: a later non-trial subscription doesn't
    // clear it, so a paid user can still look like they're "on trial").
    isTrialing: sub.status === 'trialing',
  });
}
