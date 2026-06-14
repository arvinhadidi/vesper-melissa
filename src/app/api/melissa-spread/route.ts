import Anthropic from '@anthropic-ai/sdk';
import { getCardById } from '@/lib/cards';
import type { UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { cards, positionLabels, questionText, promptContext, userProfile } = await req.json() as {
    cards: Array<{ cardIndex: number; isReversed: boolean }>;
    positionLabels: string[];
    questionText: string;
    promptContext: string;
    userProfile: UserProfile;
  };

  const cardLines = cards.map((c, i) => {
    const card = getCardById(c.cardIndex);
    const meaning = c.isReversed ? card.meaning_rev : card.meaning_up;
    return `${positionLabels[i]}: ${card.name}${c.isReversed ? ' (Reversed)' : ''} — ${meaning}`;
  }).join('\n');

  const systemPrompt = buildSpreadSystemPrompt(cardLines, questionText, promptContext, userProfile);

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 280,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Read my spread.' }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function buildSpreadSystemPrompt(
  cardLines: string,
  questionText: string,
  promptContext: string,
  user: UserProfile
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
