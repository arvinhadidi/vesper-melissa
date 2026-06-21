-- ============================================
-- VESPER — ADD STRIPE COLUMNS
-- Migration: add_stripe_columns
-- Replaces lemon_squeezy_customer_id with Stripe fields
-- ============================================

ALTER TABLE user_profiles
  DROP COLUMN IF EXISTS lemon_squeezy_customer_id;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id       text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id   text,
  ADD COLUMN IF NOT EXISTS subscription_plan        text;

CREATE INDEX IF NOT EXISTS user_profiles_stripe_customer_id_idx
  ON user_profiles (stripe_customer_id);
