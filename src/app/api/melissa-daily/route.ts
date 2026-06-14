import Anthropic from '@anthropic-ai/sdk';
import { getCardById, TarotCard } from '@/lib/cards';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { cardIndex, isReversed, userProfile } = await req.json();
  const card = getCardById(cardIndex);

  const systemPrompt = buildDailySystemPrompt(card, isReversed, userProfile);

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 220,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Read my card for today.` }],
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

function buildDailySystemPrompt(
  card: TarotCard,
  isReversed: boolean,
  user: { displayName: string; starSign: string; focusArea: string; relationshipStatus?: string | null; readingIntent?: string[] }
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
${user.focusArea === 'love_relationships' && user.relationshipStatus ? `Their situation: ${user.relationshipStatus}.` : ''}
${user.readingIntent?.length ? `They are hoping for: ${user.readingIntent.join(' and ')}.` : ''}

Today's card: ${card.name}${isReversed ? ' (Reversed)' : ''} — ${isReversed ? card.meaning_rev : card.meaning_up}.
${isReversed ? 'This card is reversed: energy turned inward or blocked — always find the opening.' : ''}

Speak this reading as a single flowing monologue, directly to ${user.displayName}.
Write as if you are speaking aloud, not writing a report.
Weave the card's meaning naturally into what you say — don't label or announce it. One continuous piece of speech, 4-6 sentences total.

Your voice:
- Warm, direct, slightly mysterious — you see things others cannot
- Plain emotional language, no mystical jargon
- You are Melissa. Never say "AI", "algorithm", or "language model"
- Use ${user.displayName}'s name once or twice, where it lands naturally
- Always positively framed — even difficult cards are guidance, not warnings
- Never use em dashes. Use commas, colons, or short sentences instead
- Never use markdown, asterisks, bold, or any formatting symbols`;
}
