import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// A customer can end up with more than one Stripe subscription object (e.g. two
// tabs both completing checkout, or a stale/duplicate one lingering from a bug).
// We only ever track one (user_profiles.stripe_subscription_id) as the "real"
// one. Without this check, an event for any OTHER subscription on that customer
// (even one being cleaned up as test data) would still overwrite the account's
// status — exactly what happened here: cancelling an orphaned duplicate marked
// the whole account "cancelled" even though the tracked subscription was still live.
async function isTrackedSubscription(uid: string, subscriptionId: string): Promise<boolean> {
  const { data: profile } = await getAdminSupabase()
    .from('user_profiles')
    .select('stripe_subscription_id')
    .eq('id', uid)
    .single();
  return profile?.stripe_subscription_id === subscriptionId;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = getAdminSupabase();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string | null;
      if (!subscriptionId) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const uid = sub.metadata.supabase_uid;
      if (!uid) break;

      const isTrial = sub.status === 'trialing';
      // upsert, not update: don't assume the profile row already exists.
      await supabase.from('user_profiles').upsert({
        id: uid,
        subscription_status: 'active',
        is_subscribed: true,
        stripe_subscription_id: subscriptionId,
        subscription_plan: sub.items.data[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly',
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        // Explicitly clear (not just conditionally set) — a lapsed user starting a
        // fresh non-trial subscription after an earlier trial would otherwise keep
        // the old trial_started_at, making a paid subscription still look trialing.
        trial_started_at: isTrial ? new Date().toISOString() : null,
      }, { onConflict: 'id' });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const uid = sub.metadata.supabase_uid;
      if (!uid) break;
      if (!(await isTrackedSubscription(uid, sub.id))) break;

      let appStatus: string;
      if (sub.status === 'active' || sub.status === 'trialing') appStatus = 'active';
      else if (sub.status === 'canceled') appStatus = 'cancelled';
      else appStatus = 'expired';

      await supabase.from('user_profiles').upsert({
        id: uid,
        subscription_status: appStatus,
        is_subscribed: appStatus === 'active',
        subscription_plan: sub.items.data[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly',
      }, { onConflict: 'id' });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const uid = sub.metadata.supabase_uid;
      if (!uid) break;
      if (!(await isTrackedSubscription(uid, sub.id))) break;

      await supabase.from('user_profiles').upsert({
        id: uid,
        subscription_status: 'cancelled',
        is_subscribed: false,
      }, { onConflict: 'id' });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoice.parent?.subscription_details?.subscription;
      if (!subId || typeof subId !== 'string') break;

      const sub = await stripe.subscriptions.retrieve(subId);
      const uid = sub.metadata.supabase_uid;
      if (!uid) break;
      if (!(await isTrackedSubscription(uid, sub.id))) break;

      await supabase.from('user_profiles').upsert({
        id: uid,
        subscription_status: 'expired',
        is_subscribed: false,
      }, { onConflict: 'id' });
      break;
    }
  }

  return new Response('ok', { status: 200 });
}
