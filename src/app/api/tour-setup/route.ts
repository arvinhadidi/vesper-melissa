import { bedrockCreate } from '@/lib/bedrock';
import { getCardById } from '@/lib/cards';
import { getSpreadCards } from '@/lib/cardLogic.js';
import type { UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

const QUESTION_TEXT = 'What energy surrounds me right now?';
const POSITION_LABELS = ['What is leaving', 'What is arriving', 'What to prepare for'];

// Default demo daily card if the user somehow has no micro-pull card (The Star).
const FALLBACK_DAILY_CARD_INDEX = 17;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // NOTE: this route no longer writes entitlement (onboarding_completed / subscription_status /
  // trial_started_at). Those are owned exclusively by /api/checkout, /api/sync-subscription, and
  // the Stripe webhook. It only generates the demo readings the post-signin tour plays back.

  const { userProfile, spreadTimestamp, microPullCardIndex } = await req.json() as {
    userProfile: UserProfile;
    spreadTimestamp: number;
    microPullCardIndex: number | null;
  };

  // Draw more cards than needed so we can exclude the micro-pull card
  const rawCards = getSpreadCards(user.id, spreadTimestamp, 6) as Array<{ cardIndex: number; isReversed: boolean }>;
  const spreadCards = microPullCardIndex != null
    ? rawCards.filter(c => c.cardIndex !== microPullCardIndex).slice(0, 3)
    : rawCards.slice(0, 3);

  const cardLines = spreadCards.map((c, i) => {
    const card = getCardById(c.cardIndex);
    const meaning = c.isReversed ? card.meaning_rev : card.meaning_up;
    return `${POSITION_LABELS[i]}: ${card.name}${c.isReversed ? ' (Reversed)' : ''} — ${meaning}`;
  }).join('\n');

  // The demo daily card is the card the user pulled during onboarding (upright).
  const dailyCardIndex = microPullCardIndex ?? FALLBACK_DAILY_CARD_INDEX;
  const dailyIsReversed = false;
  const dailyCard = getCardById(dailyCardIndex);

  const spreadPrompt = buildSpreadSystemPrompt(cardLines, QUESTION_TEXT, '', userProfile);
  const dailyPrompt = buildDailySystemPrompt(dailyCard.name, dailyCard.meaning_up, userProfile);

  // Generate both readings concurrently; each falls back to '' if it times out or errors.
  const [melissaText, dailyReadingText] = await Promise.all([
    generateReading(spreadPrompt, 'Read my spread.', 280),
    generateReading(dailyPrompt, 'Read my card.', 220),
  ]);

  return Response.json({
    spreadCards,
    positionLabels: POSITION_LABELS,
    questionText: QUESTION_TEXT,
    melissaText,
    dailyCardIndex,
    dailyIsReversed,
    dailyReadingText,
    pending: !melissaText,
  });
}

async function generateReading(systemPrompt: string, userMessage: string, maxTokens: number): Promise<string> {
  try {
    const message = await Promise.race([
      bedrockCreate({
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
    ]);
    return message.content.filter(b => b.type === 'text').map(b => b.text).join('');
  } catch {
    return '';
  }
}

function buildDailySystemPrompt(cardName: string, meaning: string, user: UserProfile): string {
  const focusMap: Record<string, string> = {
    love_relationships: 'love and relationships',
    family: 'family and loved ones',
    career: 'career and purpose',
    big_decision: 'a big decision',
    healing: 'healing and letting go',
    open: 'open reflection',
  };

  return `You are Melissa, a warm and wise oracle guide inside the Vesper tarot app.
You are reading the daily card for ${user.displayName}, a ${user.starSign}.
Their focus: ${focusMap[user.focusArea] || user.focusArea}.

Today's card: ${cardName} — ${meaning}

Speak a short daily reading as a single flowing monologue, directly to ${user.displayName}, as if speaking aloud.
Tie the card to their day and their focus. Stop after 3 sentences. Do not write a 4th sentence.

Your voice:
- Warm, direct, slightly mysterious — you see things others cannot
- Plain emotional language, no mystical jargon
- You are Melissa. Never say "AI", "algorithm", or "language model"
- Use ${user.displayName}'s name once, where it lands naturally
- Always positively framed — even difficult cards are guidance, not warnings
- Never use em dashes. Use commas, colons, or short sentences instead
- Never use markdown, asterisks, bold, or any formatting symbols`;
}

function buildSpreadSystemPrompt(
  cardLines: string,
  questionText: string,
  promptContext: string,
  user: UserProfile,
): string {
  const focusMap: Record<string, string> = {
    love_relationships: 'love and relationships',
    family: 'family and loved ones',
    career: 'career and purpose',
    big_decision: 'a big decision',
    healing: 'healing and letting go',
    open: 'open reflection',
  };

  return `You are Melissa, a warm and wise oracle guide inside the Vesper tarot app.
You are reading for ${user.displayName}, a ${user.starSign}.
Their focus: ${focusMap[user.focusArea] || user.focusArea}.
${user.relationshipStatus ? `Their situation: ${user.relationshipStatus}.` : ''}

Their question: "${questionText}"
${promptContext ? `Context: ${promptContext}` : ''}

The cards:
${cardLines}

Speak this reading as a single flowing monologue, directly to ${user.displayName}.
Write as if you are speaking aloud, not writing a report.
Move through the cards naturally — let one flow into the next, weave them into the story they tell together.
Reference each card by name where it first appears, woven naturally into the sentence.
Reference each card's position obliquely ("what I'm reading for you", "on their side", "between you both") — never as a header or label.
Do not write separate sections or paragraphs per card. One continuous piece of speech. Stop after 4 sentences. Do not write a 5th sentence.

Your voice:
- Warm, direct, slightly mysterious — you see things others cannot
- Plain emotional language, no mystical jargon
- You are Melissa. Never say "AI", "algorithm", or "language model"
- Use ${user.displayName}'s name once or twice, where it lands naturally
- Always positively framed — even difficult cards are guidance, not warnings
- Reversed cards: energy turned inward or blocked — always find the opening
- Never use em dashes. Use commas, colons, or short sentences instead
- Never use markdown, asterisks, bold, or any formatting symbols`;
}
