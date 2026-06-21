'use client';

import { useState } from 'react';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

const OPTIONS = [
  { label: '🔦  Clarity', value: 'clarity' },
  { label: '🪶  A Sign', value: 'sign' },
  { label: '🤝  Whether to Hold On', value: 'hold_on' },
  { label: '🗺️  What I Need to Do', value: 'what_to_do' },
  { label: '🌤️  That Things Will Be Okay', value: 'things_okay' },
  { label: '🕊️  Permission to Let Go', value: 'let_go' },
];

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
