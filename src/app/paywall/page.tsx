'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MelissaAvatar } from '@/components/onboarding/MelissaAvatar';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { PlanSelector } from '@/components/onboarding/PlanSelector';
import NightSky from '@/components/ui/NightSky';
import { useDetectedCurrency } from '@/lib/onboarding/useDetectedCurrency';
import { track } from '@/lib/analytics';
import { VALUE_PROPS, PRICING, DEFAULT_CURRENCY } from '@/lib/onboarding/constants';

// This page is the re-subscribe / pricing page for anyone logged in without live access.
// Copy adapts to *why* they have no access — but every path re-subscribes with no second
// free trial (immediate charge). Default copy is neutral so nothing wrong ever flashes.
type LapsedReason = 'cancelled' | 'expired' | 'lapsed';
const REASON_COPY: Record<LapsedReason, { title: string; subtitle: string; cta: string }> = {
  cancelled: {
    title: 'Pick up where you left off',
    subtitle: "You've already used your free trial, so resubscribing charges you today — then keeps your daily readings with Melissa going.",
    cta: 'Resubscribe',
  },
  expired: {
    title: 'Renew to continue',
    subtitle: 'Your access has lapsed. Resubscribe to keep your daily readings with Melissa.',
    cta: 'Resubscribe',
  },
  lapsed: {
    title: 'Choose your plan',
    subtitle: 'Subscribe to keep your daily readings with Melissa.',
    cta: 'Subscribe now',
  },
};

export default function PaywallPage() {
  return (
    <Suspense>
      <PaywallContent />
    </Suspense>
  );
}

function PaywallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const currency = useDetectedCurrency();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<LapsedReason>('lapsed');
  // Derived, not state: we're "activating" purely because Stripe sent us back with ?success=true.
  const activating = searchParams.get('success') === 'true';
  // Set if activation never lands within the timeout — gives the user an escape hatch
  // instead of the screen spinning "Activating..." forever (sync failed AND webhook lagged).
  const [activationTimedOut, setActivationTimedOut] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      // Reconcile directly from Stripe — don't wait on the webhook.
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        fetch('/api/sync-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {});
      }

      const supabase = createClient();
      const interval = setInterval(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();
        if (profile?.subscription_status === 'active') {
          clearInterval(interval);
          clearTimeout(timeout);
          router.push('/main');
        }
      }, 2000);
      // Hard stop: after 25s, give up polling and show a recovery path.
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setActivationTimedOut(true);
      }, 25000);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [searchParams, router]);

  // Adapt the heading to why they're here (cancelled vs lapsed). Defaults to neutral copy.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('user_profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.subscription_status === 'cancelled') setReason('cancelled');
          else if (data?.subscription_status === 'expired') setReason('expired');
        });
    });
  }, []);

  async function handleSubscribe() {
    if (loading) return;
    setLoading(true);
    track('checkout_started', { plan: selectedPlan, currency, reason });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, currency }),
      });
      const body = await res.json();
      if (body.url) {
        window.location.href = body.url;
      } else if (res.status === 409 && body.error === 'already_subscribed') {
        // A stale tab reached checkout after the user already subscribed elsewhere
        // (e.g. another tab) — they already have access, so send them into the app
        // instead of leaving this button silently reset with no explanation.
        window.location.href = '/main';
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  const p = PRICING[currency] ?? PRICING[DEFAULT_CURRENCY];
  const copy = REASON_COPY[reason];

  if (activating) {
    return (
      <>
      <NightSky />
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        maxWidth: '520px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        <MelissaAvatar size={120} variant={activationTimedOut ? 'insight' : 'thinking'} />
        <p style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: '24px',
          color: '#FAF7F0',
          textAlign: 'center',
          marginTop: '24px',
        }}>
          {activationTimedOut ? 'Almost there' : 'Activating your subscription...'}
        </p>
        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '14px',
          color: 'rgba(250,247,240,0.6)',
          textAlign: 'center',
          marginTop: '8px',
          maxWidth: '320px',
        }}>
          {activationTimedOut
            ? 'Your payment went through. It can take a moment to finish setting up — your account page has the latest status.'
            : 'This will only take a moment.'}
        </p>
        {activationTimedOut && (
          <button
            onClick={() => router.push('/account')}
            style={{
              marginTop: '24px',
              padding: '14px 28px',
              borderRadius: '12px',
              border: '1.5px solid #C9A84C',
              background: 'transparent',
              color: '#C9A84C',
              fontFamily: 'var(--font-dm-sans-var), sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go to my account
          </button>
        )}
      </div>
      </>
    );
  }

  return (
    <>
    <NightSky />
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px 40px',
      maxWidth: '520px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{ marginBottom: '24px' }}>
        <MelissaAvatar size={120} variant="insight" />
      </div>

      <h1 style={{
        fontFamily: 'var(--font-dm-serif-var), serif',
        fontSize: '32px',
        fontWeight: 400,
        color: '#FAF7F0',
        margin: '0 0 8px',
        textAlign: 'center',
        lineHeight: 1.25,
      }}>
        {copy.title}
      </h1>

      <p style={{
        fontFamily: 'var(--font-dm-sans-var), sans-serif',
        fontSize: '15px',
        color: 'rgba(250,247,240,0.7)',
        textAlign: 'center',
        margin: '0 0 28px',
        lineHeight: 1.5,
      }}>
        {copy.subtitle}
      </p>

      <div style={{ width: '100%', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {VALUE_PROPS.map((prop, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', textAlign: 'left' }}>
            <span style={{ color: '#C9A84C', fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>✓</span>
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', color: 'rgba(250,247,240,0.85)', margin: 0, lineHeight: 1.5 }}>{prop}</p>
          </div>
        ))}
      </div>

      <PlanSelector selectedPlan={selectedPlan} onSelect={setSelectedPlan} pricing={p} />

      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Redirecting...' : copy.cta}
        </PrimaryButton>
      </div>

      <p style={{
        fontFamily: 'var(--font-dm-sans-var), sans-serif',
        fontSize: '13px',
        color: 'rgba(250,247,240,0.45)',
        textAlign: 'center',
        margin: '12px 0 0',
      }}>
        Secure payment via Stripe. Cancel anytime.
      </p>
    </div>
    </>
  );
}
