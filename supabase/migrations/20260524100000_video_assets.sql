-- ─────────────────────────────────────────────────────────────────────────────
-- video_assets — base64 cover + frame screenshots per audited video
-- Date: 2026-05-24 (D-061 push 4)
--
-- Each audited video has an assets.b64.json file in the CIS repo (D-032
-- sanctioned imagery persistence — the only place CIS keeps frame imagery
-- long-term). Payload shape:
--   {
--     "video_id": "C0P0u40Ps9y",
--     "captured_date": "2026-05-18",
--     "cover":  "<base64-encoded PNG, ~150-200KB>",
--     "frames": { "0:00": "<base64>", "0:03": "<base64>", … }
--   }
--
-- Stored one-row-per-video, fetched lazily by PostRow when a row is expanded
-- (TanStack-cached). Loading all assets up-front would push the dashboard
-- initial fetch past 30 MB, which is unacceptable.
-- ─────────────────────────────────────────────────────────────────────────────

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

-- Public read in D-061 mode. Coach-only write (service-role used by import
-- script bypasses RLS, so this only matters once auth is re-enabled).
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
