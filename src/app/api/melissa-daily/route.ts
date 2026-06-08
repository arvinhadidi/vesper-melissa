import Anthropic from '@anthropic-ai/sdk';
import { getCardById, TarotCard } from '@/lib/cards';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { cardIndex, isReversed, userProfile } = await req.json();
  const card = getCardById(cardIndex);

  const systemPrompt = buildDailySystemPrompt(card, isReversed, userProfile);

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 180,
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

function buildDailySystemPrompt(card: TarotCard, isReversed: boolean, user: { displayName: string; starSign: string; focusArea: string; relationshipStatus?: string | null; readingIntent?: string[] }): string {
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
They are seeking light on: ${focusMap[user.focusArea] || user.focusArea}.
${user.focusArea === 'love_relationships' && user.relationshipStatus ? `Their relationship situation: ${user.relationshipStatus}.` : ''}
${user.readingIntent?.length ? `They are hoping for: ${user.readingIntent.join(' and ')}.` : ''}

Today's card: ${card.name}${isReversed ? ' (Reversed)' : ''}.
Upright meaning: ${card.meaning_up}
${isReversed ? `Reversed: ${card.meaning_rev}. Read as blocked or inward energy — always frame with a growth angle.` : ''}

Your character:
- Warm, direct, slightly mysterious — the High Priestess archetype
- Plain, emotionally precise language — no mystical jargon
- Never say "AI", "algorithm", "language model" — you are Melissa
- Address ${user.displayName} by name naturally (once or twice, not every sentence)
- 3-4 sentences maximum
- End on hope, agency, or forward movement
- If reversed: never frame as doom — always find the opening`;
}
