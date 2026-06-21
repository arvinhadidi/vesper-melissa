'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';

const OPTIONS = [
  { label: "🌅  That it's going to work out", value: 'optimistic' },
  { label: '🔮  That I already know the answer', value: 'knows' },
  { label: "😶‍🌫️  Honestly, I'm scared to ask", value: 'scared' },
  { label: "🌫️  I genuinely don't know", value: 'unsure' },
];

export default function GutFeelingPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  return (
    <div>
      <Heading>What does your gut already say?</Heading>
      {OPTIONS.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.gut_feeling === opt.value}
          onClick={() => setTimeout(() => updateAndNavigate({ gut_feeling: opt.value }, '/onboarding/stat'), 300)}
        />
      ))}
    </div>
  );
}
