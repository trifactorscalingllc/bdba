-- ─────────────────────────────────────────────────────────────────────────────
-- coaching_library — CIS pattern docs (anti-patterns, drop-offs, hooks, structures)
-- Date: 2026-05-24 (D-061 push 3)
--
-- Stores the markdown bodies of Dack's curated coaching libraries from
-- dack-cis-knowledge-base/patterns/*.md. The dashboard parses these
-- markdown files at render time to produce flag-detail cards showing
-- "what this means + what to do instead + why it matters" for every
-- anti-pattern / drop-off flagged on a student's post.
--
-- One row per file. import-cis-snapshot.mjs upserts on every run.
-- Public-read so the dashboard's anon key works (D-061 mode).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coaching_library (
  file_name   TEXT PRIMARY KEY,
  content_md  TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coaching_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_coaching_library_TEMPORARY_D061" ON public.coaching_library
  FOR SELECT TO anon, authenticated
  USING (true);

-- Coach-only writes (when auth is re-enabled). For now the import script
-- uses the service-role key which bypasses RLS, so this policy doesn't
-- need to be loosened.
CREATE POLICY "coach_writes_coaching_library" ON public.coaching_library
  FOR ALL TO authenticated
  USING (public.is_coach())
  WITH CHECK (public.is_coach());

DROP TRIGGER IF EXISTS coaching_library_touch ON public.coaching_library;
CREATE TRIGGER coaching_library_touch BEFORE UPDATE ON public.coaching_library
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
