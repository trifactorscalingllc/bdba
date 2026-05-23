CREATE TABLE public.app_errors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email   TEXT,
  route        TEXT,
  message      TEXT NOT NULL,
  stack        TEXT,
  context      JSONB,
  user_agent   TEXT,
  severity     TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_errors_created ON public.app_errors (created_at DESC);
CREATE INDEX idx_app_errors_user ON public.app_errors (user_id, created_at DESC);
CREATE INDEX idx_app_errors_severity ON public.app_errors (severity, created_at DESC);

ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can log errors" ON public.app_errors
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "coach reads errors" ON public.app_errors
  FOR SELECT TO authenticated
  USING (public.is_coach());

CREATE POLICY "coach deletes errors" ON public.app_errors
  FOR DELETE TO authenticated
  USING (public.is_coach());