import { createClient } from '@/lib/supabase/server';
import { JournalEntry } from '@/lib/types';
import { NextRequest } from 'next/server';

// GET /api/journal — fetch all saved readings for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data, error } = await supabase
    .from('saved_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return new Response(error.message, { status: 500 });

  // Map DB rows to JournalEntry shape
  const entries: JournalEntry[] = (data ?? []).map(row => ({
    id: row.id,
    type: row.reading_type === 'daily_card' ? 'daily' : 'spread',
    savedAt: row.created_at,
    questionText: row.question_text ?? null,
    cards: Array.isArray(row.cards) ? row.cards : [],
    positionLabels: row.position_labels ?? null,
    melissaText: row.melissa_text,
    impression: row.impression ?? null,
    resonanceRating: row.resonance_rating ?? null,
    emojiReaction: row.emoji_reaction ?? null,
  }));

  return Response.json(entries);
}

// POST /api/journal — upsert a reading
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const entry: JournalEntry = await req.json();

  const { data, error } = await supabase
    .from('saved_readings')
    .upsert({
      id: entry.id,
      user_id: user.id,
      reading_type: entry.type === 'daily' ? 'daily_card' : 'spread',
      question_text: entry.questionText ?? null,
      cards: entry.cards,
      position_labels: entry.positionLabels ?? null,
      melissa_text: entry.melissaText,
      impression: entry.impression ?? null,
      resonance_rating: entry.resonanceRating ?? null,
      emoji_reaction: entry.emojiReaction ?? null,
    }, { onConflict: 'id' })
    .select('id')
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ id: data?.id ?? entry.id });
}

// PATCH /api/journal — partial update (impression, resonanceRating, emojiReaction)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { id, ...patch } = await req.json() as { id: string } & Partial<JournalEntry>;

  const dbPatch: Record<string, unknown> = {};
  if (patch.impression !== undefined) dbPatch.impression = patch.impression;
  if (patch.resonanceRating !== undefined) dbPatch.resonance_rating = patch.resonanceRating;
  if (patch.emojiReaction !== undefined) dbPatch.emoji_reaction = patch.emojiReaction;
  if (patch.melissaText !== undefined) dbPatch.melissa_text = patch.melissaText;

  const { error } = await supabase
    .from('saved_readings')
    .update(dbPatch)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return new Response(error.message, { status: 500 });

  return new Response(null, { status: 204 });
}

// DELETE /api/journal?id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });

  const { error } = await supabase
    .from('saved_readings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return new Response(error.message, { status: 500 });

  return new Response(null, { status: 204 });
}
