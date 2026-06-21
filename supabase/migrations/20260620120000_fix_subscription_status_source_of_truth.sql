-- ============================================
-- VESPER — SUBSCRIPTION STATUS SOURCE OF TRUTH
-- Migration: fix_subscription_status_source_of_truth
-- 'trial' was never a real status (only none|active|expired|cancelled are).
-- It was written client-side without a Stripe customer ever being created.
-- Normalize existing bad rows, then lock the column down with a CHECK.
-- ============================================

UPDATE user_profiles
SET subscription_status = 'none'
WHERE subscription_status NOT IN ('none', 'active', 'expired', 'cancelled');

ALTER TABLE user_profiles
  ALTER COLUMN subscription_status SET DEFAULT 'none';

ALTER TABLE user_profiles
  ADD CONSTRAINT subscription_status_check
  CHECK (subscription_status IN ('none', 'active', 'expired', 'cancelled'));
