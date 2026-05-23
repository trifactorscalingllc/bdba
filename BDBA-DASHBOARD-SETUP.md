# PB Assistant Dashboard — Setup Guide (Phase 1)

This guide walks through getting Dack's coach dashboard live at
`profitablebarbers.com/dashboard`. Estimated time: **~30 minutes** if Supabase
is already linked in Lovable (which it is — env vars already in `.env`).

The marketing site (`/`, `/apply`, `/intro`) is **not changed**. Only new files
were added.

---

## What was built

| Area | Files |
|------|-------|
| **Schema** | `supabase/migrations/20260523000000_dashboard_schema.sql` — profiles, students, videos, answers, business_log + RLS |
| **Auth** | `src/lib/auth.tsx` + `src/components/ProtectedRoute.tsx` |
| **Login UI** | `src/pages/Login.tsx` (matches the approved mockup) |
| **Dashboard UI** | `src/pages/Dashboard.tsx` (matches the approved mockup) |
| **App-mode navbar** | `src/components/AppNavbar.tsx` (separate from the marketing Navbar) |
| **Scoring engines** | `src/lib/scoring/{health-bar,five-two,recap,sparkline}.ts` (ported from PB Assistant Cloudflare build) |
| **Data layer** | `src/lib/cis-bridge.ts` (fetches from Supabase, populates sync cache for scoring engines) + `src/lib/types.ts` |
| **CIS import** | `scripts/import-cis-snapshot.mjs` (one-shot Node script) |
| **Routes** | `src/App.tsx` (added `/login` + `/dashboard`, wrapped in AuthProvider + HelmetProvider) |

The marketing files (`Index.tsx`, `Apply.tsx`, `Intro.tsx`, `Navbar.tsx`, `Hero.tsx`, etc.) are untouched.

---

## Setup steps (in order)

### 1. Install — already done by Lovable

`@supabase/supabase-js`, `@tanstack/react-query`, `react-helmet-async`,
`react-router-dom`, `framer-motion` are all already in `package.json`. No
`npm install` needed.

### 2. Apply the Supabase migration

**Option A — Lovable's Supabase tab (recommended):**

1. Open this project in Lovable.
2. Click the **Supabase** tab in the right side panel.
3. Find the **Migrations** or **SQL** section.
4. Paste the contents of `supabase/migrations/20260523000000_dashboard_schema.sql` into the SQL editor.
5. Hit **Run**. You should see "Success" — 5 tables + 5 RLS-enabled + 2 helper functions + 14 policies + 5 triggers.

**Option B — Supabase dashboard direct:**

1. Open the Supabase dashboard for project `osqkqbyaaflbuudrgtqi` (URL: `https://supabase.com/dashboard/project/osqkqbyaaflbuudrgtqi`).
2. Go to **SQL Editor → New query**.
3. Paste the migration SQL → Run.

Verify by opening the **Database → Tables** view — you should now see: `profiles`, `students`, `videos`, `answers`, `business_log` (plus the existing `barber_leads`).

### 3. Create Dack's user account

In the Supabase dashboard:

1. Go to **Authentication → Users → Add user → Create new user**.
2. Email: `dack@profitablebarbers.com` (or whatever email Dack uses)
3. Auto-confirm email: **ON** (so he doesn't have to click an email link first)
4. Set a strong temp password — copy it; you'll text it to Dack.
5. Click **Create user**. Note the new user's UUID (shown after creation).

### 4. Set Dack's role to coach

Still in Supabase dashboard → **SQL Editor → New query**:

```sql
-- Replace <UUID> with the user_id from step 3
INSERT INTO public.profiles (user_id, role, slug, display_name)
VALUES (
  '<UUID>',
  'coach',
  NULL,
  'Dack'
);
```

Run it. Confirm by querying:

```sql
SELECT * FROM public.profiles;
```

You should see one row with `role = 'coach'`.

### 5. Import CIS data

From the bdba repo root in your terminal:

**PowerShell (Windows):**
```powershell
$env:SUPABASE_URL = "https://osqkqbyaaflbuudrgtqi.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<paste your service-role key here>"
node scripts/import-cis-snapshot.mjs
```

**bash/zsh (Mac/Linux):**
```bash
SUPABASE_URL=https://osqkqbyaaflbuudrgtqi.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<paste-service-role-key> \
node scripts/import-cis-snapshot.mjs
```

**Where to find the service-role key:**

Supabase dashboard → **Project Settings → API → Project API keys** → copy the `service_role` value (it's tagged "secret"). This key bypasses RLS so it can do bulk inserts. Never put it in client code or commit it.

The script reads `../Dack/dack-ai-app/lib/cis-snapshot.json` by default — which is where the current Yari + Jay + Cutbykeenan + George + EB audit data lives. To refresh, re-run `python scripts/snapshot-cis.py` in the dack-ai-app repo first.

Expected output:
```
📂 Reading snapshot: …/cis-snapshot.json
   Students: cutbykeenan, eb, george, jay, yari
🎓 Upserting 5 students…
   ✓ 5 students upserted
🎬 Upserting videos…
   ✓ cutbykeenan: 22 videos
   ✓ eb: 4 videos
   ✓ george: 22 videos
   ✓ jay: 23 videos
   ✓ yari: 33 videos
   total: 104 videos
📝 Upserting answers…
   ✓ … 104 answer payloads
💼 Upserting business log…
   ✓ yari: <n> log entries
✅ Import complete.
```

### 6. Test locally

```powershell
npm run dev
```

Open `http://localhost:5173/login`. Sign in as Dack. Should redirect to `/dashboard` and render all 5 students with real data.

If something errors:
- Open browser DevTools → Console. Most issues will print a clear Supabase error.
- Open Network tab → look at the `/rest/v1/students`, `/rest/v1/videos`, etc. requests. If they 401/403, RLS isn't seeing the user as coach — re-check step 4.

### 7. Deploy

Push to GitHub. Lovable auto-deploys on push. Once it's live at `profitablebarbers.com`:

1. Hit `profitablebarbers.com/dashboard` — should redirect to `/login`.
2. Sign in with Dack's account — should land on the dashboard.
3. Hit `profitablebarbers.com/` (the marketing homepage) — should look **exactly** like it did before. No Login button, no Dashboard link, nothing visible.
4. Bookmark `profitablebarbers.com/dashboard` and text it to Dack with his temp password.

---

## Phase 2 (next sprint) — what's NOT in this phase

- `/student/[slug]/dashboard` — student portal route + role-aware view switching
- Sign-up / invite flow for students (Dack adds them from the coach dashboard)
- Daily business-log entry form (PRD F3 UI)
- Copy-as-Message export for monthly recaps
- A CIS→Supabase sync cron (right now you re-run step 5 manually after each audit)
- Coverage-disclosure UI in the Health Bar tooltip (we compute it, just don't surface yet)

---

## Rollback

If anything goes sideways and you need to roll back:

```sql
-- Run in Supabase SQL editor; removes the dashboard schema + leaves barber_leads alone
DROP TABLE IF EXISTS public.business_log CASCADE;
DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.is_coach();
DROP FUNCTION IF EXISTS public.my_slug();
DROP FUNCTION IF EXISTS public.touch_updated_at();
```

Then `git revert` the App.tsx change to remove the routes. Marketing site
is fine either way — it doesn't touch any of these tables.

---

## Cross-references

- Approved design mockup: `../Dack/dashboard-bdba-mockup.html`
- PB Assistant scoring engines (source of truth for the port): `../Dack/dack-ai-app/lib/scoring/*`
- CIS data source: `../Dack/dack-cis-knowledge-base/`
- D-060 deployment context: `../Dack/BUILD_DEVIATIONS.md` (entry D-060)
