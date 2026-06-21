import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe';

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // Look up the Stripe subscription so we can cancel it before wiping the row.
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .single();

  if (profile?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    } catch {
      // Subscription may already be cancelled — continue with deletion.
    }
  }

  // Deletes MUST use the admin (service-role) client. The user-scoped client is bound
  // by RLS, and there is no DELETE policy on user_profiles, so a user-scoped delete
  // there silently affects zero rows. Child rows must also go before the auth user:
  // both user_profiles.id and saved_readings.user_id reference auth.users with no
  // ON DELETE CASCADE, so deleting the auth user while they exist is a FK violation.
  const { error: readingsErr } = await supabaseAdmin
    .from('saved_readings')
    .delete()
    .eq('user_id', user.id);

  const { error: profileErr } = await supabaseAdmin
    .from('user_profiles')
    .delete()
    .eq('id', user.id);

  const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  // Surface failures instead of swallowing them — a swallowed error here is what let
  // "deleted" accounts keep existing (and keep their access).
  if (readingsErr || profileErr || authErr) {
    console.error('[delete-account] failed', {
      readings: readingsErr?.message,
      profile: profileErr?.message,
      auth: authErr?.message,
    });
    return NextResponse.json(
      { error: 'Account deletion failed. Please try again or contact support.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
