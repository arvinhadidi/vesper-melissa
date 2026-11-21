'use client';

import { useState, useEffect, useRef } from 'react';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { MelissaAvatar } from '@/components/onboarding/MelissaAvatar';
import { PlanSelector } from '@/components/onboarding/PlanSelector';
import { useGeo } from '@/lib/onboarding/useDetectedCurrency';
import { ClosingOfferSheet } from '@/components/onboarding/ClosingOfferSheet';
import { saveProgress } from '@/lib/onboarding/saveProgress';
import { startGoogleSignIn } from '@/lib/onboarding/googleSignIn';
import { track } from '@/lib/analytics';
import { VALUE_PROPS, PRICING, DEFAULT_CURRENCY, TRIAL_DAYS, COUNTDOWN_SECONDS } from '@/lib/onboarding/constants';

export default function PaywallPage() {
  const { data } = useOnboardingData();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('monthly');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const { currency, closingOffer } = useGeo();
  const [trialStarting, setTrialStarting] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerBusy, setOfferBusy] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const offerShown = useRef(false);
  const [offerUsed, setOfferUsed] = useState(false);

  useEffect(() => {
    const KEY = 'vesper_paywall_deadline';
    const stored = sessionStorage.getItem(KEY);
    let deadline = stored ? parseInt(stored, 10) : NaN;
    // Restart when absent, corrupt, or already expired (e.g. returning to the
    // paywall in a tab whose earlier deadline has passed) — otherwise the
    // banner sits frozen at 00:00.
    if (!Number.isFinite(deadline) || deadline <= Date.now()) {
      deadline = Date.now() + COUNTDOWN_SECONDS * 1000;
      sessionStorage.setItem(KEY, String(deadline));
    }
    function tick() {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Answers are no longer written from here: onboarding/template.tsx saves them on
  // every step via /api/onboarding/save (server side, anonymous-first). The old
  // client-side upsert in this effect never landed (every new profile had null answers).

  function showClosingOffer(source: 'back' | 'not_now') {
    if (offerShown.current || !closingOffer) return false;
    offerShown.current = true;
    setOfferUsed(true);
    setOfferOpen(true);
    track('closing_offer_shown', { source, currency });
    saveProgress({ event: 'closing_offer_shown' });
    return true;
  }

  // Back-button exit intent: hold one history entry so the first "back" opens the
  // closing offer instead of leaving. Only armed when the offer is live.
  useEffect(() => {
    if (!closingOffer) return;
    window.history.pushState({ vesperPaywall: true }, '');
    function onPop() {
      if (!showClosingOffer('back')) window.history.back();
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closingOffer]);

  function handlePlanSelect(plan: 'yearly' | 'monthly') {
    track('paywall_plan_selected', { plan });
    setSelectedPlan(plan);
  }

  async function handleStartTrial(withOffer = false) {
    if (trialStarting || offerBusy) return;
    const plan = withOffer ? 'monthly' : selectedPlan;
    if (withOffer) { setOfferBusy(true); setOfferError(null); } else setTrialStarting(true);
    track(withOffer ? 'closing_offer_accepted' : 'trial_checkout_started', { plan, currency });
    saveProgress({ event: withOffer ? 'closing_offer_accepted' : 'checkout_started' });
    const reset = () => { setTrialStarting(false); setOfferBusy(false); };

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
          plan,
          currency,
          trial: true,
          ...(withOffer ? { offer: 'closing_offer' } : {}),
          successUrl: '/personalisation',
          cancelUrl: '/onboarding/paywall',
        }),
      });
      if (res.status === 401) {
        // Not signed in (e.g. landed here directly): sign in, then come straight back.
        await startGoogleSignIn('/onboarding/paywall');
        return;
      }
      const body = res.headers.get('content-type')?.includes('json') ? await res.json() : {};
      if (body.url) {
        window.location.href = body.url;
      } else if (res.status === 409 && body.error === 'already_subscribed') {
        // A stale tab reached checkout after the user already subscribed elsewhere
        // (e.g. another tab) — they already have access, so send them into the app
        // instead of leaving this button silently reset with no explanation.
        window.location.href = '/main';
      } else {
        if (withOffer) setOfferError('Sorry, that offer could not be opened. Please try again.');
        reset();
      }
    } catch {
      if (withOffer) setOfferError('Sorry, that offer could not be opened. Please try again.');
      reset();
    }
  }

  const p = PRICING[currency] ?? PRICING[DEFAULT_CURRENCY];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="paywall-grid">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: '100%', marginBottom: '14px', padding: '8px 14px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✦</span>
          <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.8)' }}>
            Your free trial is reserved for: <span style={{ color: '#C9A84C', fontWeight: 600 }}>{timerStr}</span>
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: 'clamp(26px, 4.6dvh, 36px)', fontWeight: 400, color: '#FAF7F0', margin: '0 0 12px', textAlign: 'center', lineHeight: 1.25 }}>
          {data.display_name ? <>{data.display_name}, try Vesper <span style={{ color: '#C9A84C' }}>free for {TRIAL_DAYS} days</span></> : <>Try Vesper <span style={{ color: '#C9A84C' }}>free for {TRIAL_DAYS} days</span></>}
        </h1>

        <div style={{ marginBottom: '12px' }}>
          <MelissaAvatar size={104} variant="insight" />
        </div>

        <div style={{ width: '100%', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {VALUE_PROPS.map((prop, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', textAlign: 'left' }}>
              <span style={{ color: '#C9A84C', fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>✓</span>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.85)', margin: 0, lineHeight: 1.45 }}>{prop}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', color: 'rgba(250,247,240,0.55)', textAlign: 'center', margin: '0 0 14px', fontStyle: 'italic' }}>
          A single tarot reading can cost {p.readingCost}. Melissa is with you every day.
        </p>

        <PlanSelector selectedPlan={selectedPlan} onSelect={handlePlanSelect} pricing={p} />

        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.65)', textAlign: 'center', margin: '0 0 8px' }}>
          No payment due now
        </p>
        <div style={{ width: '100%' }}>
          <PrimaryButton onClick={() => handleStartTrial()}>Try Vesper for {p.symbol}0</PrimaryButton>
        </div>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.45)', textAlign: 'center', margin: '8px 0 0' }}>
          Cancel anytime during your trial.
        </p>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.45)', textAlign: 'center', margin: '4px 0 0' }}>
          We&apos;ll email you before your trial ends.
        </p>
        {closingOffer && !offerUsed && (
          <button
            onClick={() => showClosingOffer('not_now')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '14px', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.4)', textDecoration: 'underline' }}
          >
            Not now
          </button>
        )}
        <ClosingOfferSheet
          open={offerOpen}
          name={data.display_name || undefined}
          currency={currency}
          busy={offerBusy}
          error={offerError}
          onAccept={() => handleStartTrial(true)}
          onDecline={() => {
            setOfferOpen(false);
            track('closing_offer_declined', { currency });
            saveProgress({ event: 'closing_offer_declined' });
          }}
        />
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
