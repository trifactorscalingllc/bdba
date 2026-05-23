// ─── flag-details — coaching detail per anti-pattern / drop-off slug ───────
// Parses dack-cis-knowledge-base/patterns/anti-patterns.md and drop-offs.md
// (loaded into Supabase by import-cis-snapshot.mjs, fetched by cis-bridge)
// into a Map<slug, FlagDetail> the dashboard renders inline.
//
// Anti-patterns.md entries look like:
//
//   ### slug-name
//   - **Description:** what the student is doing
//   - **Why it backfires:** mechanism
//   - **What to do instead:** corrective behavior
//   - **Severity:** [minor | moderate | major]
//
// Drop-offs.md entries:
//
//   ### slug-name
//   - **Usual location:** 00:00-00:03
//   - **Symptom in transcript/frames:** what you see
//   - **Why it kills retention:** mechanism
//   - **Fix:** how to restructure
//
// Both shapes get normalized to:
//   { title, description, change, why, severity?, location?, source }

import { getPatternsMd } from "@/lib/cis-bridge";
import type { VideosJsonlRow } from "@/lib/types";

export interface FlagDetail {
  slug: string;
  title: string;
  description: string;
  change: string;
  why: string;
  severity?: string;
  location?: string;
  source: "anti_patterns" | "drop_offs" | "unknown";
}

/** Turn a kebab-case slug into a plain-English title. */
function titleFromSlug(slug: string): string {
  const w = slug.replace(/[_-]/g, " ").trim();
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** Parse a single ### section body into a field map. */
function parseEntryBody(body: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = body.split(/\r?\n/);
  let curKey: string | null = null;
  for (const line of lines) {
    // Bullet line with a **Key:** prefix
    const m = line.match(/^\s*-\s+\*\*([^:]+):\*\*\s*(.*)$/);
    if (m) {
      curKey = m[1].trim().toLowerCase();
      fields[curKey] = m[2].trim();
    } else if (curKey && line.trim() && !line.startsWith("###")) {
      // Continuation of the previous field
      fields[curKey] = (fields[curKey] + " " + line.trim()).trim();
    }
  }
  return fields;
}

/** Parse a full markdown file into a map of slug → FlagDetail. */
function parseLibrary(md: string, source: FlagDetail["source"]): Map<string, FlagDetail> {
  const out = new Map<string, FlagDetail>();
  if (!md) return out;
  // Split on "### " at start of line
  const sections = md.split(/^### /m).slice(1);
  for (const sect of sections) {
    const nlIdx = sect.indexOf("\n");
    if (nlIdx < 0) continue;
    const slug = sect.slice(0, nlIdx).trim();
    if (!slug || slug.startsWith("<")) continue; // skip the template line
    const body = sect.slice(nlIdx + 1);
    const fields = parseEntryBody(body);
    const description = fields["description"]
      ?? fields["symptom in transcript/frames"]
      ?? fields["symptom"]
      ?? "";
    const change = fields["what to do instead"]
      ?? fields["fix"]
      ?? "";
    const why = fields["why it backfires"]
      ?? fields["why it kills retention"]
      ?? "";
    out.set(slug, {
      slug,
      title: titleFromSlug(slug),
      description,
      change,
      why,
      severity: fields["severity"],
      location: fields["usual location"],
      source,
    });
  }
  return out;
}

// ─── Public API ────────────────────────────────────────────────────────────

// Built once per page-load, after the CIS query resolves and getPatternsMd()
// can read the cached library content.
let _flagMap: Map<string, FlagDetail> | null = null;

function buildFlagMap(): Map<string, FlagDetail> {
  const anti = parseLibrary(getPatternsMd("anti_patterns.md"), "anti_patterns");
  const drops = parseLibrary(getPatternsMd("drop_offs.md"), "drop_offs");
  const merged = new Map(anti);
  for (const [k, v] of drops) {
    if (!merged.has(k)) merged.set(k, v);
  }
  return merged;
}

export function getFlagDetail(slug: string): FlagDetail {
  if (!_flagMap) _flagMap = buildFlagMap();
  const existing = _flagMap.get(slug);
  if (existing) return existing;
  // Unknown flag — best-effort fallback (still better than just the slug)
  return {
    slug,
    title: titleFromSlug(slug),
    description: "Dack hasn't documented this pattern yet — but it appeared in your audit.",
    change: "Review the full audit notes above for the specific fix on this post.",
    why: "",
    source: "unknown",
  };
}

/** For flags where we can surface concrete evidence from THIS post's data,
 *  return an evidence string. Returns null when no evidence is available. */
export function getFlagEvidence(slug: string, video: VideosJsonlRow): string | null {
  switch (slug) {
    case "hashtag-hail-mary-spam": {
      const tags = video.hashtags ?? [];
      if (tags.length === 0) return null;
      return `On this post you used: #${tags.slice(0, 15).join(" #")}${tags.length > 15 ? ` (+${tags.length - 15} more)` : ""}`;
    }
    case "off-niche-tangent": {
      if (video.caption) {
        const c = video.caption.replace(/\s+/g, " ").trim();
        return `Your caption read: "${c.length > 220 ? c.slice(0, 220) + "…" : c}"`;
      }
      return null;
    }
    case "caption-video-transformation-mismatch": {
      if (video.caption) {
        return `Your caption read: "${video.caption.slice(0, 200)}"`;
      }
      return null;
    }
    default:
      return null;
  }
}

/** Reset cache — used by tests / when patterns reload. */
export function _resetFlagMapForTesting() {
  _flagMap = null;
}
