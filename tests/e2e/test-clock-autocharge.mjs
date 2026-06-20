// One-off script (not part of the Playwright suite) to verify trial -> autocharge
// conversion using a Stripe Test Clock, exercising the real webhook handler at
// /api/webhooks/stripe via the `stripe listen` forwarder the user has running.
// Bypasses the hosted Checkout UI (irrelevant to what's being tested here) by
// creating the subscription directly via the API for a customer attached to the
// test clock, then pre-seeding user_profiles the same way checkout.session.completed
// would, and advancing the clock past the 3-day trial.
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const get = (k) => env.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1].trim();

const admin = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));
const stripe = new Stripe(get('STRIPE_SECRET_KEY'));
const priceId = get('STRIPE_PRICE_ID_YEARLY_GBP');
const email = 'arvhadidi@gmail.com';

async function cycleExistingUser() {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list.users.find(u => u.email === email);
  if (!existing) return;
  const { data: profile } = await admin.from('user_profiles').select('stripe_customer_id').eq('id', existing.id).single();
  if (profile?.stripe_customer_id) {
    const subs = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: 'all' });
    for (const sub of subs.data) if (sub.status !== 'canceled') await stripe.subscriptions.cancel(sub.id);
  }
  await admin.auth.admin.deleteUser(existing.id);
  console.log('Cycled existing test user.');
}

async function main() {
  await cycleExistingUser();

  console.log('Creating test clock...');
  const clock = await stripe.testHelpers.testClocks.create({ frozen_time: Math.floor(Date.now() / 1000) });
  console.log('Test clock:', clock.id);

  console.log('Creating Stripe customer attached to test clock...');
  const customer = await stripe.customers.create({ email, test_clock: clock.id });
  const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id });
  await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });
  console.log('Customer:', customer.id, '| payment method:', pm.id);

  console.log('Creating Supabase test user...');
  const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (createErr) throw createErr;
  const uid = created.user.id;
  console.log('User:', uid);

  console.log('Creating subscription with 3-day trial (same config as /api/checkout)...');
  const sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    trial_period_days: 3,
    metadata: { supabase_uid: uid },
    expand: ['latest_invoice'],
  });
  console.log('Subscription:', sub.id, 'status:', sub.status, 'trial_end:', new Date(sub.trial_end * 1000).toISOString());

  // Mirror what the checkout.session.completed webhook handler would have written.
  await admin.from('user_profiles').upsert({
    id: uid,
    subscription_status: 'active',
    is_subscribed: true,
    stripe_customer_id: customer.id,
    stripe_subscription_id: sub.id,
    subscription_plan: 'yearly',
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
    trial_started_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  console.log('Seeded user_profiles row.');

  const beforeProfile = await admin.from('user_profiles').select('subscription_status, is_subscribed').eq('id', uid).single();
  console.log('Profile before advancing clock:', beforeProfile.data);

  const advanceTo = sub.trial_end + 24 * 60 * 60; // 1 day past trial end
  console.log(`\nAdvancing test clock to ${new Date(advanceTo * 1000).toISOString()} (1 day past trial end)...`);
  let advancedClock = await stripe.testHelpers.testClocks.advance(clock.id, { frozen_time: advanceTo });

  while (advancedClock.status !== 'ready') {
    await new Promise(r => setTimeout(r, 2000));
    advancedClock = await stripe.testHelpers.testClocks.retrieve(clock.id);
    console.log('Clock status:', advancedClock.status);
  }
  console.log('Clock advanced and ready.');

  // Give the webhook listener/handler a moment to process the resulting events.
  await new Promise(r => setTimeout(r, 5000));

  const finalSub = await stripe.subscriptions.retrieve(sub.id, { expand: ['latest_invoice'] });
  console.log('\nSubscription status after trial end:', finalSub.status);
  console.log('Latest invoice status:', finalSub.latest_invoice.status, '| amount_paid:', finalSub.latest_invoice.amount_paid, finalSub.latest_invoice.currency);

  const afterProfile = await admin.from('user_profiles').select('subscription_status, is_subscribed').eq('id', uid).single();
  console.log('Profile after advancing clock (should reflect webhook-driven update):', afterProfile.data);

  console.log('\nCleaning up test clock (deletes attached customer/subscription)...');
  await stripe.testHelpers.testClocks.del(clock.id);
  await admin.auth.admin.deleteUser(uid);
  console.log('Done.');
}

main().catch((err) => { console.error('FAILED:', err); process.exit(1); });
