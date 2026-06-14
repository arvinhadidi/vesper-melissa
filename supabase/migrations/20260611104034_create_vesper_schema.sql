-- ============================================
-- VESPER — INITIAL SCHEMA
-- Migration: create_vesper_schema
-- ============================================

-- USER PROFILES

create table if not exists user_profiles (
  id                    uuid references auth.users primary key,
  display_name          text,
  star_sign             text,
  focus_area            text,
  relationship_status   text,
  has_specific_person   text,
  reading_intent        text[],
  notifications_opt_in  boolean default false,
  marketing_opt_in      boolean default false,
  onboarding_completed  boolean default false,
  disclaimer_seen       boolean default false,
  trial_started_at      timestamptz,
  subscription_status   text default 'none',
  is_subscribed         boolean default false,
  lemon_squeezy_customer_id text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- SAVED READINGS

create table if not exists saved_readings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users not null,
  reading_type      text not null,
  question_text     text,
  spread_name       text,
  cards             jsonb not null,
  position_labels   text[],
  melissa_text      text not null,
  impression        text,
  resonance_rating  text,
  emoji_reaction    text,
  created_at        timestamptz default now()
);

-- INDEXES

create index if not exists saved_readings_user_id_idx
  on saved_readings (user_id);

create index if not exists saved_readings_created_at_idx
  on saved_readings (user_id, created_at desc);

-- ROW LEVEL SECURITY

alter table user_profiles enable row level security;
alter table saved_readings enable row level security;

create policy "Users can read own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

create policy "Users can read own readings"
  on saved_readings for select
  using (auth.uid() = user_id);

create policy "Users can insert own readings"
  on saved_readings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own readings"
  on saved_readings for update
  using (auth.uid() = user_id);

create policy "Users can delete own readings"
  on saved_readings for delete
  using (auth.uid() = user_id);

-- UPDATED_AT TRIGGER

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();