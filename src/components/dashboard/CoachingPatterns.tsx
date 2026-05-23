// ─── CoachingPatterns — synthesis across the whole audited corpus ──────────
// Replaces the "From Recent Audits" section that just dumped the last 5
// `verdict_next_video_prescription` strings.
//
// This component answers Brad's real coaching question: "Across everything
// I've shown Dack about this student, what's been proven to work, and what
// recurring problems are killing their performance?"
//
// Three signals computed from the full corpus:
//   1. PROVEN FORMATS — hook_type / structure_arc combos that landed in
//      Strong-tier audits more than once
//   2. RECURRING ANTI-PATTERN FLAGS — most-frequent kebab-slug flags
//      across every audited video, plainified for display
//   3. POST-TYPE MIX — converting vs viral counts among Strong-tier posts
//      (which formats actually move the booking-funnel needle)
//
// Pure read; no fetches. Pulls answers via the synchronous cis-bridge
// helpers, which are populated at page level by the TanStack Query.

import { useMemo } from "react";
import { getAntiPatternFlags, getPostType } from "@/lib/cis-bridge";
import type { Slug, VideosJsonlRow } from "@/lib/types";

interface Props {
  slug: Slug;
  videos: VideosJsonlRow[];
}

function flagToPlain(slug: string): string {
  const words = slug.replace(/[_-]/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function tierLabel(t?: string): string {
  if (!t) return "—";
  const x = t.toLowerCase();
  if (x === "strong") return "WORKED";
  if (x === "mid") return "OK";
  if (x === "weak") return "DIDN'T";
  return t;
}

interface ComboCount {
  hook: string;
  structure: string;
  count: number;
}

export default function CoachingPatterns({ slug, videos }: Props) {
  const audited = useMemo(() => videos.filter((v) => v.audited_date), [videos]);
  const strong = useMemo(() => audited.filter((v) => v.verdict_tier === "strong"), [audited]);
  const mid    = useMemo(() => audited.filter((v) => v.verdict_tier === "mid"), [audited]);
  const weak   = useMemo(() => audited.filter((v) => v.verdict_tier === "weak"), [audited]);

  // ─── 1. Proven formats — hook × structure combos that worked >1× ─────
  const provenCombos = useMemo<ComboCount[]>(() => {
    const counts = new Map<string, number>();
    for (const v of strong) {
      const key = `${v.hook_type ?? "—"} || ${v.structure_arc ?? "—"}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([k, c]) => {
        const [hook, structure] = k.split(" || ");
        return { hook, structure, count: c };
      })
      .filter((c) => c.count >= 1) // Show every Strong combo even if only 1× — they're rare for these students
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [strong]);

  // ─── 2. Recurring anti-pattern flags — across the FULL corpus ────────
  const flagCounts = useMemo<{ slug: string; plain: string; count: number; pctOfCorpus: number }[]>(() => {
    const counts = new Map<string, number>();
    let covered = 0; // how many audits had v4 anti_pattern_flags set
    for (const v of audited) {
      const flags = getAntiPatternFlags(slug, v.video_id);
      if (flags.length > 0) covered += 1; // 'covered' counts videos with ≥1 flag, not v4-coverage strictly; close enough for display
      for (const f of flags) counts.set(f, (counts.get(f) ?? 0) + 1);
    }
    const total = audited.length;
    return [...counts.entries()]
      .map(([flagSlug, count]) => ({
        slug: flagSlug,
        plain: flagToPlain(flagSlug),
        count,
        pctOfCorpus: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [audited, slug]);

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
            {strong.length} of {audited.length} {strong.length === 1 ? "post" : "posts"} = Strong
          </span>
        </div>

        {provenCombos.length === 0 ? (
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
              {provenCombos.map((c, i) => (
                <li key={`${c.hook}-${c.structure}`} className="text-[13px]">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[11px] text-green-400 min-w-[24px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="text-white">
                        <span className="font-semibold">{c.hook}</span>
                        <span className="text-white/40"> + </span>
                        <span className="font-semibold">{c.structure}</span>
                      </div>
                      <div className="font-mono text-[11px] text-white/50 mt-0.5">
                        Hit Strong {c.count}× — repeat this combo
                      </div>
                    </div>
                  </div>
                </li>
              ))}
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

        {flagCounts.length === 0 ? (
          <p className="text-[13px] text-white/60 leading-relaxed">
            No recurring anti-pattern flags across the audited corpus. Either
            this student is dialed in, or v4 anti-pattern flags haven't been
            backfilled yet.
          </p>
        ) : (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">
              Recurring flags across all {audited.length} audits — fix these to lift the score
            </p>
            <ul className="space-y-2.5">
              {flagCounts.map((f, i) => (
                <li key={f.slug} className="text-[13px]">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[11px] text-brand-red min-w-[24px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{f.plain}</div>
                      <div className="font-mono text-[11px] text-white/50 mt-0.5">
                        Flagged in {f.count} of {audited.length} posts ({f.pctOfCorpus}%)
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
