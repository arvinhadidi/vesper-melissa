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
  focusArea: FocusArea;
  relationshipStatus: string | null;
  lifeWeight: string | null;
  hasSpecificPerson: 'yes_someone' | 'situation' | 'about_me' | null;
  readingIntent: string[];
  onboardingCompleted: boolean;
  isSubscribed: boolean;
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
