// ─── CoachingPatterns — synthesis across the whole audited corpus ──────────
// Two side-by-side panels:
//   ✓ What's been proven to work — hook × structure combos that hit Strong
//   ✕ What keeps hurting performance — recurring anti-pattern flags
//
// D-061 push 5 (2026-05-23): each row now has a "See examples" toggle that
// expands to show 1-3 example posts (date + one-line verdict + relevant
// audit-simple snippet) so students can see EXACTLY which posts these
// patterns came from and what the content was.

import { useMemo, useState } from "react";
import {
  getAntiPatternFlags,
  getAuditSimpleMd,
  getPostType,
} from "@/lib/cis-bridge";
import type { Slug, VideosJsonlRow } from "@/lib/types";

interface Props {
  slug: Slug;
  videos: VideosJsonlRow[];
}

function flagToPlain(slug: string): string {
  const w = slug.replace(/[_-]/g, " ").trim();
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** Pull the first bullet of "## N. <title>" from an audit-simple.md body. */
function firstBulletOfSection(md: string, sectionNum: number): string | null {
  if (!md) return null;
  const headingRe = new RegExp(`^##\\s+${sectionNum}\\.[^\\n]*\\n`, "m");
  const m = md.match(headingRe);
  if (!m || m.index === undefined) return null;
  const rest = md.slice(m.index + m[0].length);
  const nextHeading = rest.search(/^##\s/m);
  const body = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;
  const bulletMatch = body.match(/^-\s+([\s\S]+?)(?=\n-\s|\n\s*\n|$)/m);
  if (!bulletMatch) return null;
  return bulletMatch[1].replace(/\s+/g, " ").trim();
}

interface ComboCount {
  hook: string;
  structure: string;
  count: number;
  videos: VideosJsonlRow[];
}

interface FlagCount {
  slug: string;
  plain: string;
  count: number;
  pctOfCorpus: number;
  videos: VideosJsonlRow[];
}

interface ExampleCardProps {
  video: VideosJsonlRow;
  /** Which audit-simple section to surface — 2 for "what worked" examples,
   *  1 for "what to fix" examples. */
  sectionForSnippet: 1 | 2;
}

function ExampleCard({ video, sectionForSnippet }: ExampleCardProps) {
  const snippet = useMemo(() => {
    if (!video.audit_simple_md) return null;
    return firstBulletOfSection(video.audit_simple_md, sectionForSnippet);
  }, [video.audit_simple_md, sectionForSnippet]);

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg px-3.5 py-3">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <div className="font-mono text-[11px] text-white/60">
          {video.posted_date ?? "—"}
        </div>
        {video.url && (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-red hover:underline"
          >
            Watch ↗
          </a>
        )}
      </div>
      {video.verdict_oneline && (
        <div className="text-[13px] text-white font-semibold mb-1 leading-tight">
          {video.verdict_oneline}
        </div>
      )}
      {snippet && (
        <div className="text-[12px] text-white/70 leading-relaxed">
          {snippet}
        </div>
      )}
      {!snippet && !video.verdict_oneline && (
        <div className="text-[12px] text-white/40 italic">
          {video.hook_type ?? "—"} · {video.structure_arc ?? "—"}
        </div>
      )}
    </div>
  );
}

export default function CoachingPatterns({ slug, videos }: Props) {
  // Per-row expand state keyed by a stable identifier
  const [openCombo, setOpenCombo] = useState<string | null>(null);
  const [openFlag, setOpenFlag] = useState<string | null>(null);

  const audited = useMemo(() => videos.filter((v) => v.audited_date), [videos]);
  const strong = useMemo(() => audited.filter((v) => v.verdict_tier === "strong"), [audited]);
  const mid    = useMemo(() => audited.filter((v) => v.verdict_tier === "mid"), [audited]);
  const weak   = useMemo(() => audited.filter((v) => v.verdict_tier === "weak"), [audited]);

  // ─── 1. Proven formats — hook × structure combos that hit Strong ────
  const provenCombos = useMemo<ComboCount[]>(() => {
    const counts = new Map<string, { count: number; videos: VideosJsonlRow[] }>();
    for (const v of strong) {
      const key = `${v.hook_type ?? "—"} || ${v.structure_arc ?? "—"}`;
      const ex = counts.get(key) ?? { count: 0, videos: [] };
      ex.count += 1;
      ex.videos.push(v);
      counts.set(key, ex);
    }
    return [...counts.entries()]
      .map(([k, { count, videos: vids }]) => {
        const [hook, structure] = k.split(" || ");
        // Sort each combo's videos newest-first so the most recent example
        // shows first when expanded.
        vids.sort((a, b) => (b.posted_date || "").localeCompare(a.posted_date || ""));
        return { hook, structure, count, videos: vids };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [strong]);

  // ─── 2. Recurring anti-pattern flags ─────────────────────────────────
  const flagCounts = useMemo<FlagCount[]>(() => {
    const counts = new Map<string, { count: number; videos: VideosJsonlRow[] }>();
    for (const v of audited) {
      const flags = getAntiPatternFlags(slug, v.video_id);
      for (const f of flags) {
        const ex = counts.get(f) ?? { count: 0, videos: [] };
        ex.count += 1;
        ex.videos.push(v);
        counts.set(f, ex);
      }
    }
    const total = audited.length;
    return [...counts.entries()]
      .map(([flagSlug, { count, videos: vids }]) => {
        vids.sort((a, b) => (b.posted_date || "").localeCompare(a.posted_date || ""));
        return {
          slug: flagSlug,
          plain: flagToPlain(flagSlug),
          count,
          pctOfCorpus: total > 0 ? Math.round((count / total) * 100) : 0,
          videos: vids,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [audited, slug]);

  // Attach audit-simple to combo videos (cis-bridge sync read)
  const enrichedCombos = useMemo<ComboCount[]>(
    () => provenCombos.map((c) => ({
      ...c,
      videos: c.videos.map((v) => ({
        ...v,
        audit_simple_md: v.audit_simple_md ?? getAuditSimpleMd(slug, v.video_id),
      })),
    })),
    [provenCombos, slug],
  );
  const enrichedFlags = useMemo<FlagCount[]>(
    () => flagCounts.map((f) => ({
      ...f,
      videos: f.videos.map((v) => ({
        ...v,
        audit_simple_md: v.audit_simple_md ?? getAuditSimpleMd(slug, v.video_id),
      })),
    })),
    [flagCounts, slug],
  );

  // ─── 3. Post-type mix among Strong posts ─────────────────────────────
  const strongMix = useMemo(() => {
    let converting = 0, viral = 0, untagged = 0;
    for (const v of strong) {
      const pt = getPostType(slug, v.video_id);
      if (pt === "converting") converting += 1;
      else if (pt === "viral") viral += 1;
      else untagged += 1;
    }
    return { converting, viral, untagged };
  }, [strong, slug]);

  if (audited.length === 0) {
    return (
      <div className="text-[13px] text-white/40 italic">
        No audited posts yet — patterns will appear once Dack has audited at
        least one post.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ── PROVEN FORMATS ────────────────────────────────────────── */}
      <div className="bg-black/40 border border-green-500/20 border-l-[3px] border-l-green-500 rounded-r-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-green-400">
            ✓ What's been proven to work
          </div>
          <span className="font-mono text-[10px] text-white/40">
            {strong.length} of {audited.length} = Strong
          </span>
        </div>

        {enrichedCombos.length === 0 ? (
          <p className="text-[13px] text-white/60 leading-relaxed">
            No Strong-tier posts in the audited corpus yet. Once a post hits
            Strong, the hook + structure combo that delivered it will appear
            here as a proven format.
          </p>
        ) : (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">
              Hook + structure combos that landed Strong-tier
            </p>
            <ul className="space-y-2.5">
              {enrichedCombos.map((c, i) => {
                const key = `${c.hook}||${c.structure}`;
                const isOpen = openCombo === key;
                return (
                  <li key={key} className="text-[13px]">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[11px] text-green-400 min-w-[24px] pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white">
                          <span className="font-semibold">{c.hook}</span>
                          <span className="text-white/40"> + </span>
                          <span className="font-semibold">{c.structure}</span>
                        </div>
                        <div className="font-mono text-[11px] text-white/50 mt-0.5">
                          Hit Strong {c.count}× — repeat this combo
                        </div>
                        <button
                          onClick={() => setOpenCombo(isOpen ? null : key)}
                          className="font-mono text-[10px] uppercase tracking-[0.2em] text-green-400 hover:text-green-300 mt-1.5 inline-flex items-center gap-1"
                          aria-expanded={isOpen}
                        >
                          {isOpen ? "▼ Hide examples" : "▶ See examples"}
                          <span className="text-white/40">
                            ({c.count})
                          </span>
                        </button>
                        {isOpen && (
                          <div className="space-y-2 mt-3">
                            {c.videos.map((v) => (
                              <ExampleCard
                                key={v.video_id}
                                video={v}
                                sectionForSnippet={2}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {(strongMix.converting > 0 || strongMix.viral > 0) && (
              <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[11px] text-white/60">
                Among Strong posts:{" "}
                <span className="text-white">{strongMix.converting}</span> booking
                {" · "}
                <span className="text-white">{strongMix.viral}</span> reach
                {strongMix.untagged > 0 && (
                  <span className="text-white/40"> · {strongMix.untagged} not yet tagged</span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── RECURRING PROBLEMS ────────────────────────────────────── */}
      <div className="bg-black/40 border border-red-500/20 border-l-[3px] border-l-brand-red rounded-r-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red">
            ✕ What keeps hurting performance
          </div>
          <span className="font-mono text-[10px] text-white/40">
            {weak.length} Weak · {mid.length} OK
          </span>
        </div>

        {enrichedFlags.length === 0 ? (
          <p className="text-[13px] text-white/60 leading-relaxed">
            No recurring anti-pattern flags across the audited corpus.
          </p>
        ) : (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">
              Recurring flags across all {audited.length} audits — fix these to lift the score
            </p>
            <ul className="space-y-2.5">
              {enrichedFlags.map((f, i) => {
                const isOpen = openFlag === f.slug;
                return (
                  <li key={f.slug} className="text-[13px]">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[11px] text-brand-red min-w-[24px] pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold">{f.plain}</div>
                        <div className="font-mono text-[11px] text-white/50 mt-0.5">
                          Flagged in {f.count} of {audited.length} posts ({f.pctOfCorpus}%)
                        </div>
                        <button
                          onClick={() => setOpenFlag(isOpen ? null : f.slug)}
                          className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-red hover:text-red-300 mt-1.5 inline-flex items-center gap-1"
                          aria-expanded={isOpen}
                        >
                          {isOpen ? "▼ Hide examples" : "▶ See examples"}
                          <span className="text-white/40">
                            ({f.count})
                          </span>
                        </button>
                        {isOpen && (
                          <div className="space-y-2 mt-3">
                            {f.videos.slice(0, 6).map((v) => (
                              <ExampleCard
                                key={v.video_id}
                                video={v}
                                sectionForSnippet={1}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
