// Verifies customer.subscription.deleted updates the DB purely via the webhook,
// isolated from the /account page's own on-load reconcile call (POST
// /api/subscription-status), which would mask a broken webhook by fixing the
// state anyway. Cancels directly via the API (what the billing portal does under
// the hood) and checks the DB without ever visiting /account.
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

  const customer = await stripe.customers.create({ email });
  const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id });
  await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });
  console.log('Customer:', customer.id);

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

  console.log('\nCancelling subscription directly via API (same as billing-portal action)...');
  await stripe.subscriptions.cancel(sub.id);

  console.log('Waiting for webhook to process (no app pages visited, no reconcile call made)...');
  await new Promise(r => setTimeout(r, 5000));

  const afterProfile = await admin.from('user_profiles').select('subscription_status, is_subscribed').eq('id', uid).single();
  console.log('Profile after cancellation (webhook-only, should be cancelled/false):', afterProfile.data);

  console.log('\nCleaning up...');
  await admin.auth.admin.deleteUser(uid);
  console.log('Done.');
}

main().catch((err) => { console.error('FAILED:', err.message); process.exit(1); });
