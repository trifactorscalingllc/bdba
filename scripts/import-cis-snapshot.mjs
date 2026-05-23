#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// import-cis-snapshot.mjs
//
// One-shot CIS → Supabase importer. Reads the bundled cis-snapshot.json
// from the sibling dack-ai-app repo (or any path you pass via --snapshot)
// and upserts into students / videos / answers / business_log.
//
// Bypasses RLS using the service-role key (required for bulk inserts).
// Run locally only — service key never goes near client code.
//
// Usage:
//   1. Get your service-role key:
//      Supabase dashboard → Project settings → API → service_role (secret)
//      copy it (starts with eyJ..., role: "service_role" in the JWT)
//
//   2. Run from the bdba repo root:
//      SUPABASE_URL=https://osqkqbyaaflbuudrgtqi.supabase.co \
//      SUPABASE_SERVICE_ROLE_KEY=eyJ...your-secret-key... \
//      node scripts/import-cis-snapshot.mjs
//
//   On Windows PowerShell:
//      $env:SUPABASE_URL="https://osqkqbyaaflbuudrgtqi.supabase.co"
//      $env:SUPABASE_SERVICE_ROLE_KEY="eyJ...your-secret-key..."
//      node scripts/import-cis-snapshot.mjs
//
// Idempotent — re-runs upsert the same rows; safe to run multiple times.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CLI args ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function arg(name, fallback) {
  const ix = argv.indexOf(name);
  return ix >= 0 && ix + 1 < argv.length ? argv[ix + 1] : fallback;
}

// Snapshot file resolution: look in the bdba repo first (the committed
// seed snapshot for Lovable/CI), then fall back to the sibling dack-ai-app
// repo (Brad's local dev machine). Override with --snapshot <path>.
const SEED_SNAPSHOT     = resolve(__dirname, "cis-snapshot.json");
const SIBLING_SNAPSHOT  = resolve(__dirname, "../../Dack/dack-ai-app/lib/cis-snapshot.json");
const snapshotPath = arg(
  "--snapshot",
  existsSync(SEED_SNAPSHOT) ? SEED_SNAPSHOT : SIBLING_SNAPSHOT
);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  console.error("   See the header of this file for the exact commands.");
  process.exit(1);
}
if (!existsSync(snapshotPath)) {
  console.error(`❌ Snapshot not found at ${snapshotPath}`);
  console.error("   Pass --snapshot <path> to point at it, or run `python scripts/snapshot-cis.py` in dack-ai-app first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Read snapshot ─────────────────────────────────────────────────────────
console.log(`📂 Reading snapshot: ${snapshotPath}`);
const raw = readFileSync(snapshotPath, "utf-8");
const snapshot = JSON.parse(raw);
console.log(`   Generated at: ${snapshot.generated_at}`);
console.log(`   Students:     ${snapshot.students.join(", ")}`);

// ─── Helpers to parse profile.md for the structured columns ────────────────
function parseProfileMd(slug, txt) {
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

// ─── Upsert students ───────────────────────────────────────────────────────
console.log(`\n🎓 Upserting ${snapshot.students.length} students…`);
const studentRows = snapshot.students.map((slug) => {
  const data = snapshot.data[slug] ?? {};
  const parsed = parseProfileMd(slug, data.profile_md ?? "");
  return {
    slug,
    display_name: parsed.display_name,
    ig_handle: parsed.ig_handle,
    shop_name: parsed.shop_name,
    location: parsed.location,
    profile_md: data.profile_md ?? "",
  };
});
{
  const { error } = await supabase.from("students").upsert(studentRows, { onConflict: "slug" });
  if (error) { console.error("   ❌", error.message); process.exit(2); }
  console.log(`   ✓ ${studentRows.length} students upserted`);
}

// ─── Upsert videos ─────────────────────────────────────────────────────────
console.log("\n🎬 Upserting videos…");
let videoCount = 0;
for (const slug of snapshot.students) {
  const data = snapshot.data[slug] ?? {};
  const auditSimple = data.audit_simple_md ?? {};
  const metaByVid = data.meta ?? {};
  const rows = (data.videos_jsonl ?? []).map((v) => {
    const m = metaByVid[v.video_id] ?? {};
    return {
      slug,
      video_id: v.video_id,
      source_url: v.url ?? null,
      posted_date: v.posted_date ?? null,
      audited_date: v.audited_date ?? null,
      hook_type: v.hook_type ?? null,
      structure_arc: v.structure_arc ?? null,
      format_typicality: v.format_typicality ?? null,
      verdict_tier: v.verdict_tier ?? null,
      verdict_oneline: v.verdict_oneline ?? null,
      likes: typeof v.likes === "number" ? v.likes : null,
      comments: typeof v.comments === "number" ? v.comments : null,
      views: typeof v.views === "number" ? v.views : null,
      audit_simple_md: auditSimple[v.video_id] ?? null,
      // D-044 extra metadata (hashtags / caption / etc) from meta.json
      caption: typeof m.description === "string" ? m.description : null,
      hashtags: Array.isArray(m.hashtags) ? m.hashtags : [],
      uploader_id: m.uploader ?? null,
      resolution_px: m.resolution ?? null,
      comment_count_reported: typeof m.comment_count_reported === "number"
        ? m.comment_count_reported : null,
      top_comments_sample: Array.isArray(m.top_comments_sample)
        ? m.top_comments_sample : [],
    };
  });
  if (rows.length === 0) continue;
  // Batch in chunks of 200 to stay under any payload limits
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await supabase.from("videos").upsert(chunk, { onConflict: "slug,video_id" });
    if (error) { console.error("   ❌", error.message); process.exit(2); }
    videoCount += chunk.length;
  }
  console.log(`   ✓ ${slug}: ${rows.length} videos`);
}
console.log(`   total: ${videoCount} videos`);

// ─── Upsert answers ────────────────────────────────────────────────────────
console.log("\n📝 Upserting answers…");
let answerCount = 0;
for (const slug of snapshot.students) {
  const data = snapshot.data[slug] ?? {};
  const answers = data.answers ?? {};
  const rows = Object.entries(answers).map(([video_id, payload]) => ({
    slug,
    video_id,
    payload,
    questions_version: payload?.questions_version ?? null,
    audited_date: payload?.audited_date ?? null,
  }));
  if (rows.length === 0) continue;
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase.from("answers").upsert(chunk, { onConflict: "slug,video_id" });
    if (error) { console.error("   ❌", error.message); process.exit(2); }
    answerCount += chunk.length;
  }
  console.log(`   ✓ ${slug}: ${rows.length} answer payloads`);
}
console.log(`   total: ${answerCount} answer payloads`);

// ─── Upsert business_log ───────────────────────────────────────────────────
console.log("\n💼 Upserting business log…");
let bizCount = 0;
for (const slug of snapshot.students) {
  const data = snapshot.data[slug] ?? {};
  const rows = (data.business_log_jsonl ?? []).map((e) => ({
    slug,
    date: e.date,
    new_clients: e.new_clients ?? 0,
    returning: e.returning ?? 0,
    cuts: e.cuts ?? 0,
    no_shows: e.no_shows ?? 0,
    revenue: e.revenue ?? null,
    notes: e.notes ?? null,
  }));
  if (rows.length === 0) continue;
  const { error } = await supabase.from("business_log").upsert(rows, { onConflict: "slug,date" });
  if (error) { console.error("   ❌", error.message); process.exit(2); }
  bizCount += rows.length;
  console.log(`   ✓ ${slug}: ${rows.length} log entries`);
}
console.log(`   total: ${bizCount} log entries`);

// ─── Upsert coaching_library (CIS patterns/*.md) ───────────────────────────
console.log("\n📚 Upserting coaching library…");
const patterns = snapshot.patterns ?? {};
const libRows = [
  { file_name: "anti_patterns.md", content_md: patterns.anti_patterns_md ?? "" },
  { file_name: "drop_offs.md",     content_md: patterns.drop_offs_md ?? "" },
  { file_name: "hooks.md",         content_md: patterns.hooks_md ?? "" },
  { file_name: "structures.md",    content_md: patterns.structures_md ?? "" },
].filter((r) => r.content_md.trim().length > 0);
if (libRows.length > 0) {
  const { error } = await supabase.from("coaching_library").upsert(libRows, { onConflict: "file_name" });
  if (error) { console.error("   ❌", error.message); process.exit(2); }
  console.log(`   ✓ ${libRows.length} library files (${libRows.map((r) => r.file_name).join(", ")})`);
} else {
  console.log("   (no library content in snapshot — patterns/*.md missing in CIS?)");
}

// ─── Upsert video_assets (cover + frames per video) ────────────────────────
// Read the separate cis-assets.json file (D-061 push 4). Big file (~19 MB)
// — kept out of the main snapshot to avoid bloating the Cloudflare bundle.
const ASSETS_PATH = resolve(__dirname, "cis-assets.json");
if (existsSync(ASSETS_PATH)) {
  console.log("\n🖼  Upserting video_assets…");
  const assetsRaw = readFileSync(ASSETS_PATH, "utf-8");
  const assets = JSON.parse(assetsRaw);
  let assetCount = 0;
  for (const slug of Object.keys(assets.data ?? {})) {
    const perVideo = assets.data[slug] ?? {};
    const rows = Object.entries(perVideo).map(([video_id, payload]) => ({
      slug,
      video_id,
      payload,
    }));
    if (rows.length === 0) continue;
    // Batch in small chunks — each row is ~300 KB so 5 rows = ~1.5 MB per
    // request. Stay under PostgREST's default 1 MB payload limit by keeping
    // the chunk smaller than that on average (assets vary).
    for (let i = 0; i < rows.length; i += 4) {
      const chunk = rows.slice(i, i + 4);
      const { error } = await supabase
        .from("video_assets")
        .upsert(chunk, { onConflict: "slug,video_id" });
      if (error) {
        console.error(`   ❌ ${slug} batch starting ${i}:`, error.message);
        process.exit(2);
      }
      assetCount += chunk.length;
    }
    console.log(`   ✓ ${slug}: ${rows.length} video_assets bundles`);
  }
  console.log(`   total: ${assetCount} video_assets bundles`);
} else {
  console.log("\n🖼  (no cis-assets.json — skipping video_assets import)");
}

console.log("\n✅ Import complete.");
console.log("   Next: log into the dashboard at /login and confirm the data renders.");
