-- ============================================================
-- VESPER — ONBOARDING SESSIONS (continual, anonymous-first save)
-- ============================================================
-- One row per browser (client-generated uuid kept in localStorage). Written on
-- every onboarding step by /api/onboarding/save using the service role, so we keep
-- every visitor's answers, geo and source even if they never sign in. When the
-- visitor signs in with Google the row is claimed (user_id + email filled in) and
-- the answers are copied onto user_profiles.
--
-- RLS is on with NO policies: anon/authenticated clients cannot read or write it,
-- only the service role (server routes) can.

create table if not exists public.onboarding_sessions (
  id                    uuid primary key,
  user_id               uuid references auth.users(id) on delete set null,
  email                 text,
  last_step             text,
  last_step_index       int,
  max_step_index        int not null default 0,
  steps_seen            text[] not null default '{}',
  answers               jsonb not null default '{}'::jsonb,
  country               text,
  region                text,
  city                  text,
  currency              text,
  user_agent            text,
  referrer              text,
  landing_path          text,
  utm                   jsonb,
  posthog_distinct_id   text,
  events                jsonb not null default '{}'::jsonb,  -- {"paywall_viewed": ts, "checkout_started": ts, ...}
  visit_count           int not null default 1,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists onboarding_sessions_user_id_idx on public.onboarding_sessions (user_id);
create index if not exists onboarding_sessions_updated_at_idx on public.onboarding_sessions (updated_at desc);

alter table public.onboarding_sessions enable row level security;
