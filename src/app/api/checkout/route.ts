import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { TRIAL_DAYS } from '@/lib/onboarding/constants';
import { getRequestOrigin } from '@/lib/requestOrigin';
import { getChargeableCurrencies } from '@/lib/stripeCurrencies';
import { isCurrencyCode, type CurrencyCode } from '@/lib/onboarding/pricing';

// One Stripe price per plan. They are GBP prices; local currencies (USD/EUR/INR) are
// `currency_options` on the same price, selected per session via `currency` below.
const PRICE_MAP: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY_GBP,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY_GBP,
};

interface CheckoutBody {
  plan: 'monthly' | 'yearly';
  currency: string;
  trial?: boolean;
  /** 'closing_offer' = % off the first paid month (monthly only), from the paywall exit sheet. */
  offer?: 'closing_offer';
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { plan, currency, trial, offer, successUrl, cancelUrl } = (await req.json()) as CheckoutBody;
  const priceId = PRICE_MAP[plan];
  if (!priceId) return new Response('Invalid plan', { status: 400 });
  // Charge in the visitor's currency only if the live price really carries it
  // (otherwise GBP). Previously any non-GBP currency 400'd here, so US visitors
  // tapping "Try for $0" silently got nothing.
  const chargeable = await getChargeableCurrencies();
  const requestedCurrency = isCurrencyCode(currency) && currency !== 'GBP' && chargeable.has(currency)
    ? currency.toLowerCase()
    : undefined;
  const offerCoupon = offer === 'closing_offer' && plan === 'monthly' ? process.env.STRIPE_COUPON_FIRST_MONTH : undefined;
  if (offer === 'closing_offer' && !offerCoupon) return new Response('Offer unavailable', { status: 400 });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null;

  // A stored id can be stale: it may belong to a different Stripe account or
  // mode (e.g. ids minted under test keys after switching to live keys), or the
  // customer may have been deleted in the dashboard. Using it then makes every
  // Stripe call below throw "No such customer", bricking checkout for that user
  // forever. Verify it and fall through to creating a fresh customer instead.
  if (customerId) {
    try {
      const existing = await stripe.customers.retrieve(customerId);
      if (existing.deleted) customerId = null;
    } catch (err) {
      if (err instanceof Stripe.errors.StripeInvalidRequestError && err.code === 'resource_missing') {
        customerId = null;
      } else {
        throw err;
      }
    }
  }

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

  // Trial and closing offer are first-subscription only. Both arrive from the client,
  // so a lapsed customer (any prior subscription) never gets a second trial or the discount.
  const firstSubscription = existingSubs.data.length === 0;
  const applyTrial = Boolean(trial) && firstSubscription;
  const applyCoupon = firstSubscription ? offerCoupon : undefined;
  // Stripe locks a customer to the currency of their earlier subscriptions, so a
  // returning customer keeps that currency (GBP when it isn't one we can charge).
  const priorCurrency = existingSubs.data[0]?.currency;
  const sessionCurrency = firstSubscription
    ? requestedCurrency
    : priorCurrency && priorCurrency !== 'gbp' && isCurrencyCode(priorCurrency.toUpperCase()) && chargeable.has(priorCurrency.toUpperCase() as CurrencyCode) ? priorCurrency : undefined;

  const origin = getRequestOrigin(req);
  const successDestination = successUrl ? `${origin}${successUrl}` : `${origin}/paywall?success=true`;
  const successUrlWithSession = `${successDestination}${successDestination.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`;
  const params: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    ...(sessionCurrency ? { currency: sessionCurrency } : {}),
    success_url: successUrlWithSession,
    // Trial flow cancels back to the trial offer (/onboarding/paywall); only genuinely
    // lapsed users (standalone /paywall) cancel back to the "trial has ended" page.
    cancel_url: cancelUrl ? `${origin}${cancelUrl}` : `${origin}/paywall`,
    subscription_data: {
      metadata: { supabase_uid: user.id, ...(applyCoupon ? { offer: 'closing_offer' } : {}) },
      ...(applyTrial ? { trial_period_days: TRIAL_DAYS } : {}),
    },
    // Stripe forbids discounts + allow_promotion_codes together. The coupon is
    // duration "once", so with a trial it lands on the first paid invoice.
    ...(applyCoupon ? { discounts: [{ coupon: applyCoupon }] } : { allow_promotion_codes: true }),
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(params);
  } catch (err) {
    // Any currency mismatch Stripe still rejects (e.g. a customer balance in GBP):
    // fall back to the price's default currency rather than failing checkout.
    if (!sessionCurrency || !(err instanceof Stripe.errors.StripeInvalidRequestError)) throw err;
    const { currency: _drop, ...gbpParams } = params;
    void _drop;
    session = await stripe.checkout.sessions.create(gbpParams);
  }

  return Response.json({ url: session.url });
}
