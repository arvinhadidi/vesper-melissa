import { bedrockCreate } from '@/lib/bedrock';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { questionText, cardCount } = await req.json() as {
    questionText: string;
    cardCount: 2 | 3;
  };

  const systemPrompt = `You are Melissa, a tarot guide. A user has asked their own question for a ${cardCount}-card spread: "${questionText}"

Come up with ${cardCount} short position titles (2-4 words each) that frame what each card in the spread will reveal about this specific question, the way a tarot spread's positions are named (for example: "Their mind", "What you bring", "Where this is heading").

Reply with ONLY a JSON array of ${cardCount} strings, nothing else. No markdown, no explanation.`;

  const res = await bedrockCreate({
    max_tokens: 60,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'Give me the position titles.' }],
  });

  const raw = res.content[0]?.text ?? '';

  let labels: string[];
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : raw);
    if (!Array.isArray(parsed) || parsed.length !== cardCount || !parsed.every(l => typeof l === 'string')) {
      throw new Error('bad shape');
    }
    labels = parsed;
  } catch {
    labels = cardCount === 3 ? ['Past', 'Present', 'Future'] : ['What stays', 'What changes'];
  }

  return Response.json({ labels });
}
