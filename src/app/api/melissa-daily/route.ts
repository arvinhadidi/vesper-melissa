import { bedrockStream } from '@/lib/bedrock';
import { getCardById, TarotCard } from '@/lib/cards';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { allowed, retryAfterSecs } = checkRateLimit(user.id);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "You've reached Melissa's limit for now. Come back in a little while." }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfterSecs) } },
    );
  }

  const { cardIndex, isReversed, userProfile } = await req.json();
  const card = getCardById(cardIndex);

  const systemPrompt = buildDailySystemPrompt(card, isReversed, userProfile);

  return new Response(
    bedrockStream({
      max_tokens: 220,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Read my card for today.` }],
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    },
  );
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
