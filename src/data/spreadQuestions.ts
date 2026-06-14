export type SpreadQuestion = {
  id: string;
  text: string;
  promptContext: string;
  cardCount: 2 | 3;
  positionLabels: string[];
};

export const SPREAD_QUESTIONS: SpreadQuestion[] = [
  {
    id: 'what_thinking',
    text: 'What is he thinking right now?',
    promptContext: 'The user wants to understand what a specific person is thinking and feeling about them.',
    cardCount: 3,
    positionLabels: ['Their mind', 'Their feelings', 'Their intentions'],
  },
  {
    id: 'should_reach_out',
    text: 'Should I reach out?',
    promptContext: 'The user is deciding whether to initiate contact with someone.',
    cardCount: 2,
    positionLabels: ['If I reach out', 'If I wait'],
  },
  {
    id: 'energy_between_us',
    text: 'What is the energy between us?',
    promptContext: 'The user wants to understand the dynamics and underlying energy in a connection.',
    cardCount: 3,
    positionLabels: ['What you bring', 'What they bring', 'What exists between you'],
  },
  {
    id: 'will_it_work_out',
    text: 'Will this work out?',
    promptContext: 'The user wants insight into the potential outcome of a romantic situation.',
    cardCount: 3,
    positionLabels: ['Where things stand', 'What is in the way', 'Where this is heading'],
  },
  {
    id: 'what_release',
    text: 'What do I need to let go of?',
    promptContext: 'The user is seeking clarity on what is holding them back emotionally.',
    cardCount: 2,
    positionLabels: ['What to release', 'What replaces it'],
  },
  {
    id: 'what_next',
    text: "What's coming next for me?",
    promptContext: 'The user wants a general look at what is approaching in their love life.',
    cardCount: 3,
    positionLabels: ['What is leaving', 'What is arriving', 'What to prepare for'],
  },
  {
    id: 'right_choice',
    text: 'Am I making the right choice?',
    promptContext: 'The user is navigating a decision and wants guidance on whether their instinct is correct.',
    cardCount: 3,
    positionLabels: ['Your heart', 'Your head', 'What the cards advise'],
  },
  {
    id: 'custom',
    text: 'Ask your own question',
    promptContext: '',
    cardCount: 3,
    positionLabels: ['Past', 'Present', 'Future'],
  },
];
