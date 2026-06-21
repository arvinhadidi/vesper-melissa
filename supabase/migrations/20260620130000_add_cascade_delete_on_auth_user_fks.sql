-- ============================================
-- Add ON DELETE CASCADE to the auth.users foreign keys.
--
-- The original schema created these FKs inline (`references auth.users`) with no
-- cascade. Combined with a missing DELETE policy on user_profiles, that let a
-- "deleted" account survive: deleting the auth user failed a FK check while the
-- profile row was still present. The /api/delete-account route now deletes child
-- rows explicitly with the service-role client, but this makes the database itself
-- the backstop — deleting an auth.users row cleanly removes their profile + readings.
--
-- Drops whatever the existing FK is named (it was auto-generated) and re-adds it
-- with ON DELETE CASCADE.
-- ============================================

-- user_profiles.id -> auth.users
do $$
declare
  c text;
begin
  select conname into c
  from pg_constraint
  where conrelid = 'public.user_profiles'::regclass
    and contype = 'f'
    and conkey = array[
      (select attnum from pg_attribute
       where attrelid = 'public.user_profiles'::regclass and attname = 'id')
    ];
  if c is not null then
    execute format('alter table public.user_profiles drop constraint %I', c);
  end if;
end $$;

alter table public.user_profiles
  add constraint user_profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- saved_readings.user_id -> auth.users
do $$
declare
  c text;
begin
  select conname into c
  from pg_constraint
  where conrelid = 'public.saved_readings'::regclass
    and contype = 'f'
    and conkey = array[
      (select attnum from pg_attribute
       where attrelid = 'public.saved_readings'::regclass and attname = 'user_id')
    ];
  if c is not null then
    execute format('alter table public.saved_readings drop constraint %I', c);
  end if;
end $$;

alter table public.saved_readings
  add constraint saved_readings_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;
