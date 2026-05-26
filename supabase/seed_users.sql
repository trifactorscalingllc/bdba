-- ─────────────────────────────────────────────────────────────────────────────
-- Seed users — paste this block into Lovable chat as "run this SQL".
--
-- Creates 7 accounts:
--   1 coach  → dackbarberacc@gmail.com         (password: CHANGE_ME_DACK)
--   6 students → <slug>@bdba.local              (passwords: CHANGE_ME_<SLUG>)
--      students never see the @bdba.local email — they log in at
--      /login/<slug> with just a password.
--
-- ⚠ BEFORE RUNNING:
--   1. Replace each CHANGE_ME_* password below with a real one Brad picks.
--      Students get told their password by text/whatever; Dack gets his.
--   2. Passwords must be ≥ 6 chars (Supabase default minimum).
--   3. This script is idempotent — re-running won't duplicate accounts. It
--      uses ON CONFLICT (email) DO NOTHING for auth.users and ON CONFLICT
--      (user_id) DO UPDATE for profiles, so a re-run silently no-ops if
--      everything is already in place.
--
-- After running:
--   - Dack opens /login (email + password)
--   - Each student opens /login/<their-slug> (password only) — Brad texts
--     them the URL + their password.
-- ─────────────────────────────────────────────────────────────────────────────

-- We use a CTE to insert each user into auth.users and capture the returned
-- id, then insert the matching profiles row in the same statement. This way
-- we don't have to hardcode UUIDs or run two manual steps.

-- Coach: Dack
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'dackbarberacc@gmail.com',
    crypt('CHANGE_ME_DACK', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO public.profiles (user_id, role, slug, display_name)
SELECT id, 'coach', NULL, 'Dack' FROM new_user
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      slug = EXCLUDED.slug,
      display_name = EXCLUDED.display_name;

-- Student: yari
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'yari@bdba.local',
    crypt('CHANGE_ME_YARI', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO public.profiles (user_id, role, slug, display_name)
SELECT id, 'student', 'yari', 'Yari' FROM new_user
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      slug = EXCLUDED.slug,
      display_name = EXCLUDED.display_name;

-- Student: jay
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'jay@bdba.local',
    crypt('CHANGE_ME_JAY', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO public.profiles (user_id, role, slug, display_name)
SELECT id, 'student', 'jay', 'Jay' FROM new_user
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      slug = EXCLUDED.slug,
      display_name = EXCLUDED.display_name;

-- Student: cutbykeenan (Keenan)
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'cutbykeenan@bdba.local',
    crypt('CHANGE_ME_KEENAN', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO public.profiles (user_id, role, slug, display_name)
SELECT id, 'student', 'cutbykeenan', 'Keenan' FROM new_user
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      slug = EXCLUDED.slug,
      display_name = EXCLUDED.display_name;

-- Student: george
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'george@bdba.local',
    crypt('CHANGE_ME_GEORGE', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO public.profiles (user_id, role, slug, display_name)
SELECT id, 'student', 'george', 'George' FROM new_user
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      slug = EXCLUDED.slug,
      display_name = EXCLUDED.display_name;

-- Student: abdoul
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'abdoul@bdba.local',
    crypt('CHANGE_ME_ABDOUL', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO public.profiles (user_id, role, slug, display_name)
SELECT id, 'student', 'abdoul', 'Abdoul' FROM new_user
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      slug = EXCLUDED.slug,
      display_name = EXCLUDED.display_name;

-- Student: eb
WITH new_user AS (
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    'eb@bdba.local',
    crypt('CHANGE_ME_EB', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id
)
INSERT INTO public.profiles (user_id, role, slug, display_name)
SELECT id, 'student', 'eb', 'EB' FROM new_user
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      slug = EXCLUDED.slug,
      display_name = EXCLUDED.display_name;
