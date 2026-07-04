'use client';

import { useState } from 'react';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { READING_INTENT_OPTIONS as OPTIONS } from '@/lib/onboarding/options';

export default function ReadingIntentPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  const [selected, setSelected] = useState<string[]>(data.reading_intent);

  function toggle(value: string) {
    setSelected(prev => {
      if (prev.includes(value)) return prev.filter(v => v !== value);
      if (prev.length >= 2) return prev;
      return [...prev, value];
    });
  }

  return (
    <div>
      <Heading sub="Pick up to 2">What are you hoping Melissa will show you?</Heading>
      {OPTIONS.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={selected.includes(opt.value)} onClick={() => toggle(opt.value)} />
      ))}
      <div style={{ marginTop: '8px' }}>
        <PrimaryButton onClick={() => updateAndNavigate({ reading_intent: selected }, '/onboarding/gut-feeling')} disabled={selected.length === 0}>Continue</PrimaryButton>
      </div>
    </div>
  );
}
