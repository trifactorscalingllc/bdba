CREATE TABLE IF NOT EXISTS public.video_assets (
  slug         TEXT NOT NULL,
  video_id     TEXT NOT NULL,
  payload      JSONB NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (slug, video_id),
  FOREIGN KEY (slug, video_id) REFERENCES public.videos(slug, video_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_video_assets_slug ON public.video_assets (slug);

ALTER TABLE public.video_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_video_assets_TEMPORARY_D061" ON public.video_assets
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "coach_writes_video_assets" ON public.video_assets
  FOR ALL TO authenticated
  USING (public.is_coach())
  WITH CHECK (public.is_coach());

DROP TRIGGER IF EXISTS video_assets_touch ON public.video_assets;
CREATE TRIGGER video_assets_touch BEFORE UPDATE ON public.video_assets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();