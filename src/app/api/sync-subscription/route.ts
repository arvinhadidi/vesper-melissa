import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

// Reconciles entitlement directly from Stripe right after Checkout redirects back,
// instead of relying solely on the webhook (which may be delayed or, in local dev, never fire).
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { sessionId } = (await req.json()) as { sessionId?: string };
  if (!sessionId) return new Response('Missing sessionId', { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });

  const subscription = session.subscription;
  if (!subscription || typeof subscription === 'string') {
    return new Response('Subscription not found', { status: 404 });
  }
  if (subscription.metadata.supabase_uid !== user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  const isTrial = subscription.status === 'trialing';
  // upsert, not update: don't assume the profile row already exists.
  await supabase.from('user_profiles').upsert({
    id: user.id,
    subscription_status: 'active',
    is_subscribed: true,
    stripe_subscription_id: subscription.id,
    subscription_plan: subscription.items.data[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly',
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
    ...(isTrial && subscription.trial_start
      ? { trial_started_at: new Date(subscription.trial_start * 1000).toISOString() }
      : {}),
  }, { onConflict: 'id' });

  return Response.json({ status: 'active' });
}
