-- ============================================
-- VESPER — CHAT MESSAGE PERSISTENCE
-- Migration: create_chat_messages
-- Conversations (the "carry on the conversation" follow-up after a reading)
-- were previously only held in client React state with no persistence at
-- all, so navigating away and back lost every message. This table stores
-- just the follow-up exchange — the original reading text stays canonical
-- in saved_readings.melissa_text, not duplicated here.
-- ============================================

create table if not exists chat_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  reading_id  text not null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz default now()
);

create index if not exists chat_messages_user_reading_idx
  on chat_messages (user_id, reading_id, created_at);

alter table chat_messages enable row level security;

create policy "Users can read own chat messages"
  on chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
  on chat_messages for insert
  with check (auth.uid() = user_id);
