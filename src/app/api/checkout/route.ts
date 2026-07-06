import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { TRIAL_DAYS } from '@/lib/onboarding/constants';
import { getRequestOrigin } from '@/lib/requestOrigin';

const PRICE_MAP: Record<string, string | undefined> = {
  monthly_GBP: process.env.STRIPE_PRICE_ID_MONTHLY_GBP,
  yearly_GBP: process.env.STRIPE_PRICE_ID_YEARLY_GBP,
};

interface CheckoutBody {
  plan: 'monthly' | 'yearly';
  currency: string;
  trial?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { plan, currency, trial, successUrl, cancelUrl } = (await req.json()) as CheckoutBody;
  const priceId = PRICE_MAP[`${plan}_${currency}`];
  if (!priceId) return new Response('Invalid plan or currency', { status: 400 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_uid: user.id },
    });
    customerId = customer.id;
    // Reaching checkout is the one server-trusted signal that onboarding is done —
    // set it here so an abandoned checkout sends the user back to the paywall
    // (not back through the whole onboarding flow) without granting any access.
    // upsert (not update): the profile row may not exist yet if this is the user's
    // first ever write — update() silently no-ops on zero matching rows.
    await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        stripe_customer_id: customerId,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  }

  // Guard against double subscriptions: two tabs both reaching this endpoint (e.g.
  // a stale paywall tab revisited after already subscribing elsewhere) would
  // otherwise each create an independent Checkout Session. If both get completed,
  // Stripe creates two real subscriptions on the same customer — our webhook only
  // ever tracks the latest stripe_subscription_id, so the first one keeps billing
  // silently in the background with no way to see or cancel it from the app.
  // Check Stripe directly (not just our own DB mirror, which can lag a beat behind).
  const existingSubs = await stripe.subscriptions.list({ customer: customerId, status: 'all' });
  const hasLiveSubscription = existingSubs.data.some(s => s.status === 'active' || s.status === 'trialing');
  if (hasLiveSubscription) {
    return Response.json({ error: 'already_subscribed' }, { status: 409 });
  }

  const origin = getRequestOrigin(req);
  const successDestination = successUrl ? `${origin}${successUrl}` : `${origin}/paywall?success=true`;
  const successUrlWithSession = `${successDestination}${successDestination.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrlWithSession,
    // Trial flow cancels back to the trial offer (/onboarding/paywall); only genuinely
    // lapsed users (standalone /paywall) cancel back to the "trial has ended" page.
    cancel_url: cancelUrl ? `${origin}${cancelUrl}` : `${origin}/paywall`,
    subscription_data: {
      metadata: { supabase_uid: user.id },
      ...(trial ? { trial_period_days: TRIAL_DAYS } : {}),
    },
    allow_promotion_codes: true,
  });

  return Response.json({ url: session.url });
}
