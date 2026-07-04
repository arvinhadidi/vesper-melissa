'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';
import { NOTICES_SIGNS_OPTIONS as OPTIONS } from '@/lib/onboarding/options';

export default function NoticesSignsPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  return (
    <div>
      <Heading>When the universe sends you a sign, do you notice?</Heading>
      {OPTIONS.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.notices_signs === opt.value}
          onClick={() => setTimeout(() => updateAndNavigate({ notices_signs: opt.value }, '/onboarding/focus-area'), 300)}
        />
      ))}
    </div>
  );
}
