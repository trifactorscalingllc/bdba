-- ─────────────────────────────────────────────────────────────────────────────
-- Fix for "Wrong password" on freshly-seeded accounts.
--
-- Supabase Auth's signIn flow checks BOTH auth.users (for the password hash)
-- AND auth.identities (for the email-provider link). seed_users.sql only
-- populated auth.users, so the identity row is missing and signIn rejects
-- every login with "Invalid login credentials."
--
-- This script backfills the missing email-provider identity for each
-- @bdba.local user. Idempotent — skips users that already have an identity.
-- Re-runnable safely.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object(
    'sub',            u.id::text,
    'email',          u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  u.id::text,
  NOW(),
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email LIKE '%@bdba.local'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities i
    WHERE i.user_id = u.id AND i.provider = 'email'
  );

-- Verify result: should list 7 rows (1 coach + 6 students), each with
-- has_password=t, email_confirmed=t, role + slug filled, identity_provider='email'.
SELECT
  u.email,
  u.encrypted_password IS NOT NULL AS has_password,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  p.role,
  p.slug,
  i.provider AS identity_provider
FROM auth.users u
LEFT JOIN public.profiles p   ON p.user_id = u.id
LEFT JOIN auth.identities i   ON i.user_id = u.id AND i.provider = 'email'
WHERE u.email LIKE '%@bdba.local'
ORDER BY u.email;
