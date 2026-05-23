ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS audit_simple_md TEXT;

COMMENT ON COLUMN public.videos.audit_simple_md IS
  'Deterministic plain-English audit (D-047 / D-056). Mirrors the
   audit-simple.md file CIS writes at students/<slug>/videos/<id>/audit-simple.md.
   Re-populated on every import-cis-snapshot.mjs run.';