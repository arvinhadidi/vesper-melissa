'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';
import { GUT_FEELING_OPTIONS as OPTIONS } from '@/lib/onboarding/options';

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
