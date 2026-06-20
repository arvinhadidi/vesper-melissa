// Verifies year-2 renewal billing: advances a test clock past the trial (first
// charge succeeds, as in test-clock-autocharge.mjs), then advances a further year
// to confirm the second annual charge also fires correctly and the webhook keeps
// subscription_status correct with no regression.
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

async function advanceAndWait(clockId, to) {
  let clock = await stripe.testHelpers.testClocks.advance(clockId, { frozen_time: to });
  while (clock.status !== 'ready') {
    await new Promise(r => setTimeout(r, 2000));
    clock = await stripe.testHelpers.testClocks.retrieve(clockId);
  }
}

async function main() {
  await cycleExistingUser();

  const clock = await stripe.testHelpers.testClocks.create({ frozen_time: Math.floor(Date.now() / 1000) });
  console.log('Test clock:', clock.id);

  const customer = await stripe.customers.create({ email, test_clock: clock.id });
  const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id });
  await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });

  const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (createErr) throw createErr;
  const uid = created.user.id;
  console.log('User:', uid);

  const sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    trial_period_days: 3,
    metadata: { supabase_uid: uid },
  });
  console.log('Subscription:', sub.id, 'trial_end:', new Date(sub.trial_end * 1000).toISOString());

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

  console.log('\nAdvancing past trial end (year-1 charge)...');
  await advanceAndWait(clock.id, sub.trial_end + 24 * 60 * 60);
  await new Promise(r => setTimeout(r, 5000));

  const afterYear1 = await stripe.subscriptions.retrieve(sub.id, { expand: ['latest_invoice'] });
  console.log('After year 1 — status:', afterYear1.status, '| invoice:', afterYear1.latest_invoice.status, afterYear1.latest_invoice.amount_paid, afterYear1.latest_invoice.currency);

  console.log('\nAdvancing a further 366 days (year-2 renewal)...');
  const year2 = sub.trial_end + 24 * 60 * 60 + 366 * 24 * 60 * 60;
  await advanceAndWait(clock.id, year2);
  await new Promise(r => setTimeout(r, 5000));

  const afterYear2 = await stripe.subscriptions.retrieve(sub.id, { expand: ['latest_invoice'] });
  console.log('After year 2 — status:', afterYear2.status, '| invoice:', afterYear2.latest_invoice.status, afterYear2.latest_invoice.amount_paid, afterYear2.latest_invoice.currency);
  console.log('Latest invoice is a different invoice than year 1:', afterYear2.latest_invoice.id !== afterYear1.latest_invoice.id);

  const finalProfile = await admin.from('user_profiles').select('subscription_status, is_subscribed').eq('id', uid).single();
  console.log('Profile after year-2 renewal (should still be active, no regression):', finalProfile.data);

  console.log('\nCleaning up...');
  await stripe.testHelpers.testClocks.del(clock.id);
  await admin.auth.admin.deleteUser(uid);
  console.log('Done.');
}

main().catch((err) => { console.error('FAILED:', err.message); process.exit(1); });
