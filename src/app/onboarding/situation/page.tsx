'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';
import { LOVE_SITUATION_OPTIONS as LOVE_OPTIONS, OTHER_SITUATION_OPTIONS as OTHER_OPTIONS } from '@/lib/onboarding/options';

export default function SituationPage() {
  const { data, updateAndNavigate } = useOnboardingData();
  const isLove = data.focus_area === 'love_relationships';
  const options = isLove ? LOVE_OPTIONS : OTHER_OPTIONS;
  const heading = isLove ? 'What does love look like right now?' : "What's weighing on you most?";
  const sub = isLove ? 'Melissa reads differently for each situation' : undefined;
  const currentVal = isLove ? data.relationship_status : data.life_weight;

  return (
    <div>
      <Heading sub={sub}>{heading}</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={currentVal === opt.value}
          onClick={() => {
            setTimeout(() => updateAndNavigate({
              relationship_status: isLove ? opt.value : null,
              life_weight: isLove ? null : opt.value,
            }, '/onboarding/specific-person'), 300);
          }}
        />
      ))}
    </div>
  );
}
