'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';

const OPTIONS = [
  { label: '🌧️  Heavy', value: 'heavy' },
  { label: '🌱  Hopeful', value: 'hopeful' },
  { label: '🌀  Restless', value: 'restless' },
  { label: '🌫️  Numb', value: 'numb' },
  { label: '🤍  Honestly, fine', value: 'fine' },
];

export default function MoodPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  return (
    <div>
      <Heading>How&apos;s your heart today{data.display_name ? `, ${data.display_name}?` : '?'}</Heading>
      {OPTIONS.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.current_mood === opt.value}
          onClick={() => setTimeout(() => updateAndNavigate({ current_mood: opt.value }, '/onboarding/notices-signs'), 300)}
        />
      ))}
    </div>
  );
}
