import { bedrockStream } from '@/lib/bedrock';
import { TarotCard, getCardById } from '@/lib/cards';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

type Message = { role: 'user' | 'assistant'; content: string };

type UserProfileLike = {
  displayName: string;
  starSign: string;
  focusArea: string;
  relationshipStatus?: string | null;
  readingIntent?: string[];
};

type DailyBody = {
  messages: Message[];
  cardContext: { card: TarotCard; isReversed: boolean };
  userProfile: UserProfileLike;
  spreadContext?: never;
};

type SpreadBody = {
  messages: Message[];
  spreadContext: {
    questionText: string;
    cards: Array<{ cardIndex: number; isReversed: boolean }>;
    positionLabels: string[];
  };
  userProfile: UserProfileLike;
  cardContext?: never;
};

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

  const body = await req.json() as DailyBody | SpreadBody;
  const { messages, userProfile } = body;

  const systemPrompt = body.spreadContext
    ? buildSpreadChatSystemPrompt(body.spreadContext, userProfile, messages)
    : buildDailyChatSystemPrompt(body.cardContext!, userProfile, messages);

  return new Response(
    bedrockStream({
      max_tokens: 300,
      system: systemPrompt,
      messages,
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

const FOCUS_MAP: Record<string, string> = {
  love_relationships: 'love and relationships',
  family: 'family and loved ones',
  career: 'career and purpose',
  big_decision: 'a big decision',
  healing: 'healing and letting go',
  open: 'open reflection',
};

const CHAR_SHARED = (user: UserProfileLike) => `Your character:
- Warm, direct, slightly mysterious.
- Plain, emotionally precise language. No mystical jargon.
- NEVER use em dashes (—) under any circumstances. Use a comma, colon, or brackets instead.
- Never say "AI", "algorithm", "language model". You are Melissa.
- Never use markdown, asterisks, bold, or any formatting symbols.
- Address ${user.displayName} by name occasionally, not every message.
- Answer follow-up questions conversationally, staying in character.
- Keep responses focused and meaningful. Usually 2-4 sentences unless a longer answer is genuinely needed.
- Always end on agency, hope, or a concrete thought to sit with.`;

function buildDailyChatSystemPrompt(
  cardContext: { card: TarotCard; isReversed: boolean },
  user: UserProfileLike,
  messages: Message[]
): string {
  const initialReading = messages.find(m => m.role === 'assistant')?.content ?? '';

  return `You are Melissa, a warm and wise oracle guide inside the Vesper tarot app.
You are in a continuing conversation with ${user.displayName}, a ${user.starSign}.
They are seeking light on: ${FOCUS_MAP[user.focusArea] || user.focusArea}.
${user.focusArea === 'love_relationships' && user.relationshipStatus ? `Their relationship situation: ${user.relationshipStatus}.` : ''}
${user.readingIntent?.length ? `They are hoping for: ${user.readingIntent.join(' and ')}.` : ''}

The card drawn today: ${cardContext.card.name}${cardContext.isReversed ? ' (Reversed)' : ''}.
${initialReading ? `You already gave this reading: "${initialReading}"` : ''}

${CHAR_SHARED(user)}`;
}

function buildSpreadChatSystemPrompt(
  spreadContext: {
    questionText: string;
    cards: Array<{ cardIndex: number; isReversed: boolean }>;
    positionLabels: string[];
  },
  user: UserProfileLike,
  messages: Message[]
): string {
  const cardLines = spreadContext.cards.map((c, i) => {
    const card = getCardById(c.cardIndex);
    return `${spreadContext.positionLabels[i]}: ${card.name}${c.isReversed ? ' (Reversed)' : ''}`;
  }).join('\n');

  const initialReading = messages.find(m => m.role === 'assistant')?.content ?? '';

  return `You are Melissa, a warm and wise oracle guide inside the Vesper tarot app.
You are in a continuing conversation with ${user.displayName}, a ${user.starSign}.
They are seeking light on: ${FOCUS_MAP[user.focusArea] || user.focusArea}.
${user.relationshipStatus ? `Their relationship situation: ${user.relationshipStatus}.` : ''}

Their spread question: "${spreadContext.questionText}"
The cards drawn:
${cardLines}
${initialReading ? `\nYou already gave this reading: "${initialReading}"` : ''}

${CHAR_SHARED(user)}`;
}
