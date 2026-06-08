export const TEST_USER = {
  id: 'test-user-vesper-001',
  displayName: 'Arvin',
  starSign: 'scorpio',
  focusArea: 'love_relationships' as const,
  relationshipStatus: 'situationship',
  lifeWeight: null,
  hasSpecificPerson: 'yes_someone' as const,
  readingIntent: ['sign', 'things_okay'],
  onboardingCompleted: true,
  isSubscribed: true,
} as const;

// TODO Session 12: replace with real Supabase auth + profiles fetch
