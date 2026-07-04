'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { Heading } from '@/components/onboarding/Heading';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { CHECKIN_TIME_OPTIONS as TIME_OPTIONS } from '@/lib/onboarding/options';

export default function EmailCheckinPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  const [consentChecked, setConsentChecked] = useState<boolean>(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(data.preferred_checkin_time ?? 'morning');

  function handleTimeSelect(value: string | null) {
    setSelectedTime(value);
    if (value !== null) { setConsentChecked(true); } else { setConsentChecked(false); }
  }

  function handleContinue() {
    updateAndNavigate({
      preferred_checkin_time: selectedTime,
      email_marketing_consent: consentChecked,
      email_consent_given_at: consentChecked ? new Date().toISOString() : null,
    }, '/onboarding/synthesis');
  }

  return (
    <div>
      <Heading sub="She'll send daily reminders by email - unsubscribe any time">
        When would you like Melissa to check in?
      </Heading>
      {TIME_OPTIONS.map(opt => {
        const active = selectedTime === opt.value;
        return (
          <motion.button key={opt.value ?? 'none'} onClick={() => handleTimeSelect(opt.value)}
            animate={active ? { scale: 1.01 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ width: '100%', padding: '18px 20px', border: `1px solid ${active ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`, borderRadius: '14px', marginBottom: '12px', background: active ? 'rgba(201,168,76,0.15)' : 'rgba(250,247,240,0.04)', boxShadow: active ? 'inset 0 0 12px rgba(201,168,76,0.08)' : 'none', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', color: active ? '#FAF7F0' : 'rgba(250,247,240,0.8)', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.15s ease, background 0.15s ease' }}
          >
            {opt.label}
          </motion.button>
        );
      })}
      <div style={{ marginTop: '4px', marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
          <div
            onClick={() => { if (selectedTime !== null) setConsentChecked(c => !c); }}
            style={{ width: '22px', height: '22px', minWidth: '22px', border: `2px solid ${consentChecked ? '#C9A84C' : 'rgba(201,168,76,0.4)'}`, borderRadius: '6px', background: consentChecked ? '#C9A84C' : 'transparent', opacity: selectedTime === null ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', transition: 'background 0.15s ease, border-color 0.15s ease', cursor: selectedTime === null ? 'default' : 'pointer' }}
          >
            {consentChecked && (
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M1 5l4 4 7-8" stroke="#1E1256" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.8)', lineHeight: 1.4, display: 'block' }}>
              Send me my daily reading and updates from Vesper
            </span>
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', color: 'rgba(250,247,240,0.4)', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
              You can unsubscribe any time. We&apos;ll never share your email.
            </span>
          </div>
        </label>
      </div>
      <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
    </div>
  );
}
