-- The app uses human-readable string IDs (e.g. "daily-2026-06-17", "reading-173...")
-- rather than UUIDs. Change the PK column type so upserts succeed.
alter table saved_readings
  alter column id drop default,
  alter column id set data type text using id::text;
