'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';
import type { FocusArea } from '@/lib/onboarding/types';

const OPTIONS: { label: string; value: FocusArea }[] = [
  { label: '💗  Love & Relationships', value: 'love_relationships' },
  { label: '🏡  Family & Loved Ones', value: 'family' },
  { label: '🌟  Career & Purpose', value: 'career' },
  { label: '🔀  A Big Decision', value: 'big_decision' },
  { label: '🕊️  Healing & Letting Go', value: 'healing' },
  { label: '✨  Open to Anything', value: 'open' },
];

export default function FocusAreaPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  return (
    <div>
      <Heading>What are you seeking light on?</Heading>
      {OPTIONS.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.focus_area === opt.value}
          onClick={() => {
            setTimeout(() => updateAndNavigate({
              focus_area: opt.value,
              relationship_status: opt.value === 'love_relationships' ? data.relationship_status : null,
              life_weight: opt.value === 'love_relationships' ? null : data.life_weight,
            }, '/onboarding/interstitial-focus'), 300);
          }}
        />
      ))}
    </div>
  );
}
