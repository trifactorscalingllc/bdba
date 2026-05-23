CREATE TABLE IF NOT EXISTS public.coaching_library (
  file_name   TEXT PRIMARY KEY,
  content_md  TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coaching_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_coaching_library_TEMPORARY_D061" ON public.coaching_library
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "coach_writes_coaching_library" ON public.coaching_library
  FOR ALL TO authenticated
  USING (public.is_coach())
  WITH CHECK (public.is_coach());

DROP TRIGGER IF EXISTS coaching_library_touch ON public.coaching_library;
CREATE TRIGGER coaching_library_touch BEFORE UPDATE ON public.coaching_library
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();