-- ============================================
-- VESPER — DAILY CHECK-IN EMAIL
-- Migration: add_email_checkin_fields
-- Adds the fields needed to actually send the daily check-in email that
-- onboarding/email-checkin has promised since Session 12: an opt-out flag
-- (set by the one-click unsubscribe link, separate from the original
-- email_marketing_consent opt-in) and a timestamp used by the cron route
-- to avoid double-sending the same user within one send window.
-- ============================================

alter table user_profiles
  add column if not exists email_opt_out                boolean not null default false,
  add column if not exists last_checkin_email_sent_at    timestamptz;
