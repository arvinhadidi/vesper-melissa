'use client';

import { useState } from 'react';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { Heading } from '@/components/onboarding/Heading';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

export default function NamePage() {
  const { data, updateAndNavigate } = useOnboardingData();
  const [nameInput, setNameInput] = useState(data.display_name);
  const [nameError, setNameError] = useState('');

  function handleContinue() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError('Please enter your name.'); return; }
    if (trimmed.length > 10) { setNameError('Keep it under 15 characters.'); return; }
    setNameError('');
    updateAndNavigate({ display_name: trimmed }, '/onboarding/star-sign');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 200px)' }}>
      <div>
        <Heading>What should Melissa call you?</Heading>
        <input
          type="text" value={nameInput}
          onChange={e => { const filtered = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 15); setNameInput(filtered); setNameError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') handleContinue(); }}
          placeholder="your name..." maxLength={10} autoFocus
          style={{ width: '100%', padding: '16px', background: 'rgba(250,247,240,0.07)', border: `1px solid ${nameError ? '#E07070' : 'rgba(201,168,76,0.4)'}`, borderRadius: '12px', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', color: '#FAF7F0', outline: 'none', marginBottom: nameError ? '8px' : '24px', boxSizing: 'border-box' }}
        />
        {nameError && <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#E07070', margin: '0 0 16px' }}>{nameError}</p>}
      </div>
      <div style={{ marginTop: 'auto' }}>
        <PrimaryButton onClick={handleContinue} disabled={!nameInput.trim()}>Continue</PrimaryButton>
      </div>
    </div>
  );
}
