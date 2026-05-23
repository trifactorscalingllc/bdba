CREATE TABLE public.profiles (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('coach', 'student')),
  slug         TEXT NULL,
  display_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_slug ON public.profiles (slug);

CREATE TABLE public.students (
  slug         TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  ig_handle    TEXT,
  shop_name    TEXT,
  location     TEXT,
  profile_md   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.videos (
  slug                    TEXT NOT NULL REFERENCES public.students(slug) ON DELETE CASCADE,
  video_id                TEXT NOT NULL,
  source_url              TEXT,
  posted_date             DATE,
  audited_date            DATE,
  hook_type               TEXT,
  structure_arc           TEXT,
  format_typicality       TEXT,
  verdict_tier            TEXT CHECK (verdict_tier IN ('strong', 'mid', 'weak') OR verdict_tier IS NULL),
  verdict_oneline         TEXT,
  likes                   BIGINT,
  comments                BIGINT,
  views                   BIGINT,
  metrics_history         JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_captured          BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url           TEXT,
  operator_notes          TEXT,
  caption                 TEXT,
  hashtags                JSONB DEFAULT '[]'::jsonb,
  caption_cta             TEXT,
  caption_location        TEXT,
  aspect_ratio            TEXT,
  resolution_px           TEXT,
  uploader_id             TEXT,
  comment_count_reported  BIGINT,
  top_comments_sample     JSONB DEFAULT '[]'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (slug, video_id)
);
CREATE INDEX idx_videos_posted_date ON public.videos (slug, posted_date DESC);
CREATE INDEX idx_videos_audited_date ON public.videos (slug, audited_date DESC);

CREATE TABLE public.answers (
  slug              TEXT NOT NULL,
  video_id          TEXT NOT NULL,
  payload           JSONB NOT NULL,
  questions_version INT,
  audited_date      DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (slug, video_id),
  FOREIGN KEY (slug, video_id) REFERENCES public.videos(slug, video_id) ON DELETE CASCADE
);

CREATE TABLE public.business_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL REFERENCES public.students(slug) ON DELETE CASCADE,
  date          DATE NOT NULL,
  new_clients   INT NOT NULL DEFAULT 0,
  "returning"   INT NOT NULL DEFAULT 0,
  cuts          INT NOT NULL DEFAULT 0,
  no_shows      INT NOT NULL DEFAULT 0,
  revenue       NUMERIC(10,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, date)
);
CREATE INDEX idx_business_log_date ON public.business_log (slug, date DESC);

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach');
$$;

CREATE OR REPLACE FUNCTION public.my_slug()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT slug FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "coach reads all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_coach());
CREATE POLICY "coach writes profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_coach()) WITH CHECK (public.is_coach());

CREATE POLICY "coach reads all students" ON public.students FOR SELECT TO authenticated USING (public.is_coach());
CREATE POLICY "student reads own row" ON public.students FOR SELECT TO authenticated USING (slug = public.my_slug());
CREATE POLICY "coach writes students" ON public.students FOR ALL TO authenticated USING (public.is_coach()) WITH CHECK (public.is_coach());

CREATE POLICY "coach reads all videos" ON public.videos FOR SELECT TO authenticated USING (public.is_coach());
CREATE POLICY "student reads own videos" ON public.videos FOR SELECT TO authenticated USING (slug = public.my_slug());
CREATE POLICY "coach writes videos" ON public.videos FOR ALL TO authenticated USING (public.is_coach()) WITH CHECK (public.is_coach());

CREATE POLICY "coach reads all answers" ON public.answers FOR SELECT TO authenticated USING (public.is_coach());
CREATE POLICY "student reads own answers" ON public.answers FOR SELECT TO authenticated USING (slug = public.my_slug());
CREATE POLICY "coach writes answers" ON public.answers FOR ALL TO authenticated USING (public.is_coach()) WITH CHECK (public.is_coach());

CREATE POLICY "coach reads all business_log" ON public.business_log FOR SELECT TO authenticated USING (public.is_coach());
CREATE POLICY "student reads own business_log" ON public.business_log FOR SELECT TO authenticated USING (slug = public.my_slug());
CREATE POLICY "coach writes business_log" ON public.business_log FOR ALL TO authenticated USING (public.is_coach()) WITH CHECK (public.is_coach());

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch     BEFORE UPDATE ON public.profiles     FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER students_touch     BEFORE UPDATE ON public.students     FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER videos_touch       BEFORE UPDATE ON public.videos       FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER answers_touch      BEFORE UPDATE ON public.answers      FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER business_log_touch BEFORE UPDATE ON public.business_log FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();