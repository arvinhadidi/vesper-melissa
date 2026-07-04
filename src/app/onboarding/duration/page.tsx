'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';
import { DURATION_OPTIONS as OPTIONS } from '@/lib/onboarding/options';

export default function DurationPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  return (
    <div>
      <Heading>How long has this been with you?</Heading>
      {OPTIONS.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.duration_weight === opt.value}
          onClick={() => setTimeout(() => updateAndNavigate({ duration_weight: opt.value }, '/onboarding/reading-intent'), 300)}
        />
      ))}
    </div>
  );
}
