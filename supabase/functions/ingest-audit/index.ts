// Ingest audit results from an external automation (e.g. Dack's Mac mini bot).
// Auth: shared secret header `x-ingest-secret` must match INGEST_SECRET env var.
// Uses the service role key (auto-injected) to bypass RLS for bulk upserts.
//
// Accepts EITHER:
//   A) A normalized payload:
//      {
//        students?:     [{ slug, display_name, ig_handle?, shop_name?, location?, profile_md? }, ...],
//        videos?:       [{ slug, video_id, ...video columns... }, ...],
//        answers?:      [{ slug, video_id, payload, questions_version?, audited_date? }, ...],
//        business_log?: [{ slug, date, new_clients?, returning?, cuts?, no_shows?, revenue?, notes? }, ...],
//        coaching_library?: [{ file_name, content_md }, ...],
//        video_assets?: [{ slug, video_id, payload }, ...]
//      }
//
//   B) A full cis-snapshot.json shape:
//      { snapshot: { students: [...], data: { [slug]: { profile_md, videos_jsonl, answers, business_log_jsonl, audit_simple_md, meta } }, patterns: {...} } }

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INGEST_SECRET = Deno.env.get("INGEST_SECRET") ?? "";

const ingestHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Headers":
    (corsHeaders as Record<string, string>)["Access-Control-Allow-Headers"] +
    ", x-ingest-secret",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...ingestHeaders, "Content-Type": "application/json" },
  });
}

function parseProfileMd(slug: string, txt: string) {
  const display_name = (() => {
    const m = txt.match(/^#\s+(.+?)\s+—/);
    return m ? m[1].trim() : slug.charAt(0).toUpperCase() + slug.slice(1);
  })();
  const ig_handle = (() => {
    const m = txt.match(/Handle \(Instagram\):\*?\*?\s*@?(\S+)/i);
    return m ? m[1].replace(/[*\s]/g, "") : null;
  })();
  const shop_name = (() => {
    const m = txt.match(/Business name[^:]*:\*?\*?\s*\*?\*?([A-Z][^\n*]+?)\*?\*?\s*—/);
    return m ? m[1].trim() : null;
  })();
  const location = (() => {
    const m = txt.match(/\*\*Location:\*\*\s*([^\n]+)/);
    return m ? m[1].trim().replace(/\([^)]*\)\s*$/, "").trim() : null;
  })();
  return { display_name, ig_handle, shop_name, location };
}

// Convert snapshot-shape -> normalized arrays
function flattenSnapshot(snap: any) {
  const out: any = { students: [], videos: [], answers: [], business_log: [], coaching_library: [] };
  for (const slug of snap.students ?? []) {
    const d = snap.data?.[slug] ?? {};
    const parsed = parseProfileMd(slug, d.profile_md ?? "");
    out.students.push({ slug, ...parsed, profile_md: d.profile_md ?? "" });

    const auditSimple = d.audit_simple_md ?? {};
    const metaByVid = d.meta ?? {};
    for (const v of d.videos_jsonl ?? []) {
      const m = metaByVid[v.video_id] ?? {};
      out.videos.push({
        slug, video_id: v.video_id, source_url: v.url ?? null,
        posted_date: v.posted_date ?? null, audited_date: v.audited_date ?? null,
        hook_type: v.hook_type ?? null, structure_arc: v.structure_arc ?? null,
        format_typicality: v.format_typicality ?? null, verdict_tier: v.verdict_tier ?? null,
        verdict_oneline: v.verdict_oneline ?? null,
        likes: typeof v.likes === "number" ? v.likes : null,
        comments: typeof v.comments === "number" ? v.comments : null,
        views: typeof v.views === "number" ? v.views : null,
        audit_simple_md: auditSimple[v.video_id] ?? null,
        caption: typeof m.description === "string" ? m.description : null,
        hashtags: Array.isArray(m.hashtags) ? m.hashtags : [],
        uploader_id: m.uploader ?? null,
        resolution_px: m.resolution ?? null,
        comment_count_reported: typeof m.comment_count_reported === "number" ? m.comment_count_reported : null,
        top_comments_sample: Array.isArray(m.top_comments_sample) ? m.top_comments_sample : [],
      });
    }
    const validIds = new Set((d.videos_jsonl ?? []).map((v: any) => v.video_id));
    for (const [video_id, payload] of Object.entries(d.answers ?? {})) {
      if (!validIds.has(video_id)) continue;
      const p: any = payload;
      out.answers.push({ slug, video_id, payload: p,
        questions_version: p?.questions_version ?? null,
        audited_date: p?.audited_date ?? null });
    }
    for (const e of d.business_log_jsonl ?? []) {
      out.business_log.push({
        slug, date: e.date,
        new_clients: e.new_clients ?? 0, returning: e.returning ?? 0,
        cuts: e.cuts ?? 0, no_shows: e.no_shows ?? 0,
        revenue: e.revenue ?? null, notes: e.notes ?? null,
      });
    }
  }
  const p = snap.patterns ?? {};
  for (const [file_name, key] of [
    ["anti_patterns.md", "anti_patterns_md"],
    ["drop_offs.md", "drop_offs_md"],
    ["hooks.md", "hooks_md"],
    ["structures.md", "structures_md"],
  ] as const) {
    const content_md = p[key] ?? "";
    if (content_md.trim().length > 0) out.coaching_library.push({ file_name, content_md });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: ingestHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  if (!INGEST_SECRET) return json({ error: "INGEST_SECRET not configured" }, 500);
  if (req.headers.get("x-ingest-secret") !== INGEST_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const payload = body.snapshot ? flattenSnapshot(body.snapshot) : body;
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const counts: Record<string, number> = {};
  const errors: any[] = [];

  async function upsert(table: string, rows: any[] | undefined, onConflict: string, chunk = 200) {
    if (!Array.isArray(rows) || rows.length === 0) return;
    for (let i = 0; i < rows.length; i += chunk) {
      const slice = rows.slice(i, i + chunk);
      const { error } = await supabase.from(table).upsert(slice, { onConflict });
      if (error) { errors.push({ table, batch_start: i, error: error.message }); return; }
    }
    counts[table] = (counts[table] ?? 0) + rows.length;
  }

  await upsert("students", payload.students, "slug");
  await upsert("videos", payload.videos, "slug,video_id");
  await upsert("answers", payload.answers, "slug,video_id", 100);
  await upsert("business_log", payload.business_log, "slug,date");
  await upsert("coaching_library", payload.coaching_library, "file_name");
  await upsert("video_assets", payload.video_assets, "slug,video_id", 4);

  if (errors.length) return json({ ok: false, counts, errors }, 207);
  return json({ ok: true, counts });
});
