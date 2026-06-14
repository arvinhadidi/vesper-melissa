-- ============================================
-- VESPER — SESSION 12
-- Migration: add_onboarding_v2_fields
-- Adds new columns collected by the 22-screen onboarding flow.
-- ============================================

alter table user_profiles
  add column if not exists current_mood              text,
  add column if not exists notices_signs             text,
  add column if not exists life_weight               text,
  add column if not exists duration_weight           text,
  add column if not exists gut_feeling               text,
  add column if not exists micro_pull_card           text,
  add column if not exists birth_date                date,
  add column if not exists disclaimer_accepted_at    timestamptz,
  add column if not exists preferred_checkin_time    text,
  add column if not exists email_marketing_consent   boolean default false,
  add column if not exists email_consent_given_at    timestamptz,
  add column if not exists onboarding_completed_at   timestamptz;
