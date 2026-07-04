'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';
import { SPECIFIC_PERSON_OPTIONS as OPTIONS } from '@/lib/onboarding/options';

export default function SpecificPersonPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  return (
    <div>
      <Heading>Is there someone specific on your mind?</Heading>
      {OPTIONS.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.has_specific_person === opt.value}
          onClick={() => setTimeout(() => updateAndNavigate({ has_specific_person: opt.value }, '/onboarding/micro-pull'), 300)}
        />
      ))}
    </div>
  );
}
