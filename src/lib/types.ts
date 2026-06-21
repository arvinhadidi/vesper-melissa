export type FocusArea =
  | 'love_relationships'
  | 'family'
  | 'career'
  | 'big_decision'
  | 'healing'
  | 'open';

export type UserProfile = {
  id: string;
  displayName: string;
  starSign: string;
  birthDate: string | null;
  focusArea: FocusArea;
  relationshipStatus: string | null;
  lifeWeight: string | null;
  hasSpecificPerson: 'yes_someone' | 'situation' | 'about_me' | null;
  readingIntent: string[];
  currentMood: string | null;
  noticesSigns: string | null;
  durationWeight: string | null;
  gutFeeling: string | null;
  microPullCard: string | null;
  disclaimerAcceptedAt: string | null;
  preferredCheckinTime: string | null;
  emailMarketingConsent: boolean;
  emailConsentGivenAt: string | null;
  onboardingCompleted: boolean;
  onboardingCompletedAt: string | null;
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  trialStartedAt: string | null;
};

export type TarotCardDraw = {
  cardIndex: number;
  isReversed: boolean;
};

export type ReadingType = 'daily_card' | 'spread';

export type SavedReading = {
  id: string;
  readingType: ReadingType;
  questionText: string | null;
  spreadName: string | null;
  cardIds: number[];
  cardsReversed: boolean[];
  cardPositionLabels: string[] | null;
  melissaResponse: string;
  isSavedToJournal: boolean;
  createdAt: string;
};

// How a reading resonated, asked some days later (Option B follow-up)
export type ResonanceRating = 'yes' | 'some' | 'no';

// Quick emoji reaction tapped right after a reading completes
export type EmojiReaction =
  | 'spot_on'
  | 'got_me_thinking'
  | 'surprisingly_accurate'
  | 'not_quite';

// A reading the user saved to their journal (persisted in localStorage)
export type JournalEntry = {
  id: string;
  type: 'daily' | 'spread';
  savedAt: string; // ISO date string
  questionText: string | null; // null for daily cards
  cards: { cardIndex: number; isReversed: boolean }[];
  positionLabels: string[] | null;
  melissaText: string;
  impression: string | null; // user's own note — starts null
  resonanceRating: ResonanceRating | null; // starts null
  emojiReaction: EmojiReaction | null; // starts null
};
