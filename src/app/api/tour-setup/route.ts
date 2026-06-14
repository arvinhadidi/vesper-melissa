import Anthropic from '@anthropic-ai/sdk';
import { getCardById } from '@/lib/cards';
import { getSpreadCards } from '@/lib/cardLogic.js';
import type { UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const QUESTION_TEXT = 'What energy surrounds me right now?';
const POSITION_LABELS = ['What is leaving', 'What is arriving', 'What to prepare for'];

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { userProfile, spreadTimestamp } = await req.json() as {
    userProfile: UserProfile;
    spreadTimestamp: number;
  };

  const spreadCards = getSpreadCards(user.id, spreadTimestamp, 3) as Array<{ cardIndex: number; isReversed: boolean }>;

  const cardLines = spreadCards.map((c, i) => {
    const card = getCardById(c.cardIndex);
    const meaning = c.isReversed ? card.meaning_rev : card.meaning_up;
    return `${POSITION_LABELS[i]}: ${card.name}${c.isReversed ? ' (Reversed)' : ''} — ${meaning}`;
  }).join('\n');

  const systemPrompt = buildSpreadSystemPrompt(cardLines, QUESTION_TEXT, '', userProfile);

  try {
    const message = await Promise.race([
      anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 280,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Read my spread.' }],
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
    ]);

    const melissaText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    return Response.json({
      spreadCards,
      positionLabels: POSITION_LABELS,
      questionText: QUESTION_TEXT,
      melissaText,
    });
  } catch {
    // Timeout or API error — return cards without reading, will be generated lazily
    return Response.json({
      spreadCards,
      positionLabels: POSITION_LABELS,
      questionText: QUESTION_TEXT,
      melissaText: '',
      pending: true,
    });
  }
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
