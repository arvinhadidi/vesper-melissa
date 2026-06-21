'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { MelissaAvatar } from '@/components/onboarding/MelissaAvatar';
import { PlanSelector } from '@/components/onboarding/PlanSelector';
import { useDetectedCurrency } from '@/lib/onboarding/useDetectedCurrency';
import { track } from '@/lib/analytics';
import { VALUE_PROPS, PRICING, DEFAULT_CURRENCY, TRIAL_DAYS, COUNTDOWN_SECONDS } from '@/lib/onboarding/constants';

export default function PaywallPage() {
  const { data } = useOnboardingData();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const currency = useDetectedCurrency();
  const [trialStarting, setTrialStarting] = useState(false);
  const supabaseWriteFired = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (supabaseWriteFired.current) return;
    // Guard against wiping saved answers with nulls if we land here without onboarding
    // data in sessionStorage (e.g. returning to the trial offer in a fresh tab).
    if (!data.display_name) return;
    supabaseWriteFired.current = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('user_profiles').upsert({
        id: user.id,
        display_name: data.display_name || null,
        star_sign: data.star_sign || null,
        birth_date: data.birth_date || null,
        focus_area: data.focus_area || null,
        relationship_status: data.relationship_status || null,
        life_weight: data.life_weight || null,
        has_specific_person: data.has_specific_person || null,
        reading_intent: data.reading_intent,
        current_mood: data.current_mood || null,
        notices_signs: data.notices_signs || null,
        duration_weight: data.duration_weight || null,
        gut_feeling: data.gut_feeling || null,
        micro_pull_card: data.micro_pull_card || null,
        disclaimer_accepted_at: data.disclaimer_accepted_at || null,
        preferred_checkin_time: data.preferred_checkin_time || null,
        email_marketing_consent: data.email_marketing_consent,
        email_consent_given_at: data.email_consent_given_at || null,
      }, { onConflict: 'id' });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStartTrial() {
    if (trialStarting) return;
    setTrialStarting(true);
    track('trial_checkout_started', { plan: selectedPlan, currency });

    const now = new Date();
    const spreadTimestamp = now.getTime();

    const userProfile = {
      id: '',
      displayName: data.display_name || 'there',
      starSign: data.star_sign ?? 'unknown',
      birthDate: data.birth_date,
      focusArea: data.focus_area ?? 'open',
      relationshipStatus: data.relationship_status,
      lifeWeight: data.life_weight,
      hasSpecificPerson: data.has_specific_person as ('yes_someone' | 'situation' | 'about_me' | null),
      readingIntent: data.reading_intent,
      currentMood: data.current_mood,
      noticesSigns: data.notices_signs,
      durationWeight: data.duration_weight,
      gutFeeling: data.gut_feeling,
      microPullCard: data.micro_pull_card,
      disclaimerAcceptedAt: data.disclaimer_accepted_at,
      preferredCheckinTime: data.preferred_checkin_time,
      emailMarketingConsent: data.email_marketing_consent,
      emailConsentGivenAt: data.email_consent_given_at,
      onboardingCompleted: true,
      onboardingCompletedAt: now.toISOString(),
      isSubscribed: false,
    };

    localStorage.setItem('vesper_onboarding', JSON.stringify(data));
    localStorage.setItem('vesper_personalisation_payload', JSON.stringify({
      userProfile,
      spreadTimestamp,
      microPullCard: data.micro_pull_card,
      onboardingData: data,
    }));
    // Keep the onboarding session data: if the user abandons Stripe Checkout they come
    // back to this trial offer (cancel_url below) and should still have their answers.

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          currency,
          trial: true,
          successUrl: '/personalisation',
          cancelUrl: '/onboarding/paywall',
        }),
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
        setTrialStarting(false);
      }
    } catch {
      setTrialStarting(false);
    }
  }

  const p = PRICING[currency] ?? PRICING[DEFAULT_CURRENCY];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="paywall-grid">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '100%', marginBottom: '24px', padding: '10px 16px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✦</span>
          <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.8)' }}>
            Your free trial is reserved for: <span style={{ color: '#C9A84C', fontWeight: 600 }}>{timerStr}</span>
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '38px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 20px', textAlign: 'center', lineHeight: 1.25 }}>
          Try Vesper <span style={{ color: '#C9A84C' }}>free for {TRIAL_DAYS} days</span>
        </h1>

        <div style={{ marginBottom: '24px' }}>
          <MelissaAvatar size={132} variant="insight" />
        </div>

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
          <PrimaryButton onClick={handleStartTrial}>Try Vesper for {p.symbol}0</PrimaryButton>
        </div>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.45)', textAlign: 'center', margin: '12px 0 0' }}>
          Cancel anytime during your trial.
        </p>
      </div>

      <div className="paywall-timeline" style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <MelissaAvatar size={150} />
          <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '28px', fontStyle: 'italic', color: 'rgba(250,247,240,0.75)', margin: '16px 0 0' }}>
            Here&apos;s how it works...
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🔓</span>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', fontWeight: 600, color: '#FAF7F0', margin: '0 0 4px' }}>Today</p>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.6)', margin: 0, lineHeight: 1.4 }}>Full access unlocked, instantly.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>✨</span>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', fontWeight: 600, color: '#FAF7F0', margin: '0 0 4px' }}>Enjoy your free trial</p>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.6)', margin: 0, lineHeight: 1.4 }}>Daily readings, spreads, journal. All yours.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>📅</span>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', fontWeight: 600, color: '#FAF7F0', margin: '0 0 4px' }}>Day {TRIAL_DAYS}</p>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.6)', margin: 0, lineHeight: 1.4 }}>
                Trial ends and your {selectedPlan === 'yearly' ? `${p.symbol}${p.yearly}/year` : `${p.symbol}${p.monthly}/month`} subscription begins. Cancel anytime before.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
