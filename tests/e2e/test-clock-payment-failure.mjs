// One-off script to verify the invoice.payment_failed webhook path: a card that
// declines when the trial ends should flip subscription_status to 'expired'.
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
}

async function main() {
  await cycleExistingUser();

  const clock = await stripe.testHelpers.testClocks.create({ frozen_time: Math.floor(Date.now() / 1000) });
  console.log('Test clock:', clock.id);

  // This Stripe account has raw-card-data APIs disabled (sensible default), which
  // rules out the documented "succeeds on attach, declines on charge" test card
  // number. pm_card_chargeDeclined isn't usable either — it declines immediately
  // at attach time, before a subscription even exists. So: attach a normal valid
  // card to create the subscription, then detach it before the renewal attempt —
  // Stripe will fail the renewal invoice for lack of any payment method on file,
  // which fires the exact same invoice.payment_failed webhook we're testing.
  const customer = await stripe.customers.create({ email, test_clock: clock.id });
  const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id });
  await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });
  console.log('Customer:', customer.id, '| payment method (will be detached before renewal):', pm.id);

  const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (createErr) throw createErr;
  const uid = created.user.id;
  console.log('User:', uid);

  const sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    trial_period_days: 3,
    metadata: { supabase_uid: uid },
    expand: ['latest_invoice'],
  });
  console.log('Subscription:', sub.id, 'status:', sub.status);

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

  const advanceTo = sub.trial_end + 24 * 60 * 60;
  console.log('Detaching the payment method so the renewal has nothing to charge...');
  await stripe.paymentMethods.detach(pm.id);

  console.log(`\nAdvancing test clock 1 day past trial end (${new Date(advanceTo * 1000).toISOString()})...`);
  let advancedClock = await stripe.testHelpers.testClocks.advance(clock.id, { frozen_time: advanceTo });
  while (advancedClock.status !== 'ready') {
    await new Promise(r => setTimeout(r, 2000));
    advancedClock = await stripe.testHelpers.testClocks.retrieve(clock.id);
    console.log('Clock status:', advancedClock.status);
  }
  console.log('Clock advanced and ready.');

  await new Promise(r => setTimeout(r, 5000));

  const finalSub = await stripe.subscriptions.retrieve(sub.id, { expand: ['latest_invoice'] });
  console.log('\nSubscription status after declined renewal:', finalSub.status);
  console.log('Latest invoice status:', finalSub.latest_invoice.status);

  const afterProfile = await admin.from('user_profiles').select('subscription_status, is_subscribed').eq('id', uid).single();
  console.log('Profile after declined charge (should be expired via invoice.payment_failed webhook):', afterProfile.data);

  console.log('\nCleaning up...');
  await stripe.testHelpers.testClocks.del(clock.id);
  await admin.auth.admin.deleteUser(uid);
  console.log('Done.');
}

main().catch((err) => { console.error('FAILED:', err.message); process.exit(1); });
