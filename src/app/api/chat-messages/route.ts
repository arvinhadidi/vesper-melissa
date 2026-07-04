import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// GET /api/chat-messages?readingId=xxx — fetch the conversation for one reading
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const readingId = req.nextUrl.searchParams.get('readingId');
  if (!readingId) return new Response('Missing readingId', { status: 400 });

  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('user_id', user.id)
    .eq('reading_id', readingId)
    .order('created_at', { ascending: true });

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(data ?? []);
}

// POST /api/chat-messages — append one message to a reading's conversation
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { readingId, role, content } = await req.json() as {
    readingId: string;
    role: 'user' | 'assistant';
    content: string;
  };

  if (!readingId || !role || !content) {
    return new Response('Missing readingId, role, or content', { status: 400 });
  }

  const { error } = await supabase
    .from('chat_messages')
    .insert({ user_id: user.id, reading_id: readingId, role, content });

  if (error) return new Response(error.message, { status: 500 });

  return new Response(null, { status: 204 });
}
