'use client';

import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { OptionTile } from '@/components/onboarding/OptionTile';
import { Heading } from '@/components/onboarding/Heading';

const LOVE_OPTIONS = [
  { label: '🌸  Single', value: 'single' },
  { label: '💬  Talking to Someone', value: 'talking' },
  { label: '🌀  Situationship', value: 'situationship' },
  { label: '💔  Healing from a Breakup', value: 'healing_breakup' },
  { label: '💑  In a Relationship', value: 'in_relationship' },
  { label: '🤐  Prefer Not to Say', value: 'prefer_not_say' },
];

const OTHER_OPTIONS = [
  { label: '🫂  A Loved One', value: 'loved_one' },
  { label: '🔭  My Own Future', value: 'own_future' },
  { label: '⚖️  An Impossible Choice', value: 'impossible_choice' },
  { label: '🕯️  Grief or Loss', value: 'grief_loss' },
  { label: "🌊  Something I Can't Shake", value: 'cant_shake' },
  { label: '🌫️  Hard to Put Into Words', value: 'unnamed' },
];

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
