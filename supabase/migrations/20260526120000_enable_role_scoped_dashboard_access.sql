-- ─────────────────────────────────────────────────────────────────────────────
-- Enable role-scoped dashboard access.
--
-- Phase 1 (D-061) shipped with public_read_*_TEMPORARY_D061 policies so the
-- dashboard could render before auth was wired client-side. Auth is now wired
-- (AuthProvider + ProtectedRoute restored in App.tsx, login routes student to
-- own /dashboard/student/<slug>), so this migration locks the dashboard down:
--
--   1. DROP the 6 public_read_*_TEMPORARY_D061 policies on
--      students / videos / answers / business_log / coaching_library /
--      video_assets. After this, anon role gets nothing — only authenticated
--      users can SELECT.
--
--   2. Add the two missing student-scoped SELECT policies that were never
--      written when D-061 shipped (the bare D-061 schema only added student
--      policies for students/videos/answers/business_log; video_assets and
--      coaching_library were public-read-only). Students need both to read
--      their own page:
--        - "student reads own video_assets" — base64 cover/frame imagery
--          for their own audited posts.
--        - "all authenticated read coaching_library" — patterns/hooks/anti-
--          patterns content is shared coaching material, not per-student,
--          so any signed-in user can read it.
--
-- After this migration the access matrix is:
--   anon:           NOTHING (no policies match)
--   authenticated:  coach role     → reads all rows on every table
--                   student role   → reads only rows WHERE slug = my_slug()
--                                    + all of coaching_library (shared)
--   INSERT/UPDATE/DELETE: coach only (existing "coach writes X" policies
--                                     are unchanged by this migration)
--
-- Coach role is determined by public.is_coach(); student slug by
-- public.my_slug(). Both functions remain GRANTed to anon + authenticated
-- (re-granted by 20260526030000_restore_dashboard_public_read.sql).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. DROP the temporary public-read policies.
DROP POLICY IF EXISTS "public_read_students_TEMPORARY_D061"          ON public.students;
DROP POLICY IF EXISTS "public_read_videos_TEMPORARY_D061"            ON public.videos;
DROP POLICY IF EXISTS "public_read_answers_TEMPORARY_D061"           ON public.answers;
DROP POLICY IF EXISTS "public_read_business_log_TEMPORARY_D061"      ON public.business_log;
DROP POLICY IF EXISTS "public_read_coaching_library_TEMPORARY_D061"  ON public.coaching_library;
DROP POLICY IF EXISTS "public_read_video_assets_TEMPORARY_D061"      ON public.video_assets;

-- Also drop the second-generation public_read_* policies (no D061 suffix) from
-- migration 20260526032233_8cda2056. Same intent, different name.
DROP POLICY IF EXISTS "public_read_coaching_library"                 ON public.coaching_library;
DROP POLICY IF EXISTS "public_read_video_assets"                     ON public.video_assets;

-- 2. Add the two missing student-scoped policies.

-- Students can read base64 cover/frame imagery for their own audited videos.
-- Coach already has "coach reads all video_assets" from migration
-- 20260524100000 / 20260523223942 (one or both depending on history).
DROP POLICY IF EXISTS "student reads own video_assets" ON public.video_assets;
CREATE POLICY "student reads own video_assets" ON public.video_assets
  FOR SELECT TO authenticated
  USING (slug = public.my_slug());

-- coaching_library is shared coaching content (anti-patterns, drop-offs,
-- hooks, structures). All authenticated users — coach OR student — read it.
-- No per-slug scoping, so a single permissive policy suffices.
DROP POLICY IF EXISTS "authenticated reads coaching_library" ON public.coaching_library;
CREATE POLICY "authenticated reads coaching_library" ON public.coaching_library
  FOR SELECT TO authenticated
  USING (true);

-- 3. (Belt + suspenders) Make sure RLS is still enabled on all six tables.
-- DROP POLICY can't disable RLS but if a previous migration disabled it the
-- DROPs above would no-op silently. Force it on.
ALTER TABLE public.students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_library  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_assets      ENABLE ROW LEVEL SECURITY;
