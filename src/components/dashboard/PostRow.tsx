// ─── PostRow — single audited post, click to expand full plain-English audit ─
// Each row is the same compact summary as the old table. Click anywhere on
// the row header → expands inline panel showing:
//   • posted/audited dates + IG link
//   • likes / comments / views
//   • full audit-simple.md content (the deterministic plain-English audit
//     CIS writes at students/<slug>/videos/<id>/audit-simple.md — already
//     plainified upstream by Python _plainify, no client-side glossary
//     needed)
//
// Markdown rendering is bespoke (tiny) — audit-simple.md has a known fixed
// shape (h1 + meta line + 13 h2 sections + bulleted lists + inline bold/
// italic/links). Bringing in react-markdown is overkill for this.

import { useState, useMemo, type ReactNode } from "react";
import { getAntiPatternFlagCount, getAntiPatternFlags } from "@/lib/cis-bridge";
import type { VideosJsonlRow } from "@/lib/types";

/** Turn a kebab-case anti-pattern slug into a plain-English label.
 *  Real examples from CIS data: `slow-setup-no-anchor` → "Slow setup, no anchor". */
function flagToPlain(slug: string): string {
  const words = slug.replace(/[_-]/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

interface Props {
  slug: string;
  video: VideosJsonlRow;
}

function tierLabel(tier?: string): { txt: string; cls: string } {
  const t = (tier ?? "").toLowerCase();
  if (t === "strong") return { txt: "WORKED", cls: "text-green-400" };
  if (t === "mid")    return { txt: "OK",     cls: "text-yellow-400" };
  if (t === "weak")   return { txt: "DIDN'T", cls: "text-red-400" };
  return { txt: "—", cls: "text-white/40" };
}

// ─── inline markdown ───────────────────────────────────────────────────────
// Handles **bold**, _italic_, [text](url). Anything else passes through.
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;
  let buf = "";
  let key = 0;
  while (i < text.length) {
    // [text](url)
    if (text[i] === "[") {
      const close = text.indexOf("]", i);
      const open = text.indexOf("(", close);
      const end = text.indexOf(")", open);
      if (close > i && open === close + 1 && end > open) {
        if (buf) { nodes.push(buf); buf = ""; }
        const label = text.slice(i + 1, close);
        const href = text.slice(open + 1, end);
        nodes.push(
          <a
            key={`l-${key++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red underline-offset-2 hover:underline"
          >
            {label}
          </a>,
        );
        i = end + 1;
        continue;
      }
    }
    // **bold**
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i + 2) {
        if (buf) { nodes.push(buf); buf = ""; }
        nodes.push(<strong key={`b-${key++}`} className="text-white">{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    // _italic_ — only when bounded by non-word chars (otherwise eats snake_case)
    if (
      text[i] === "_" &&
      (i === 0 || /\W/.test(text[i - 1]))
    ) {
      const end = text.indexOf("_", i + 1);
      if (end > i + 1 && /\W/.test(text[end + 1] ?? " ")) {
        if (buf) { nodes.push(buf); buf = ""; }
        nodes.push(<em key={`i-${key++}`} className="text-white/80">{text.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }
    buf += text[i];
    i++;
  }
  if (buf) nodes.push(buf);
  return nodes;
}

// ─── block markdown ────────────────────────────────────────────────────────
// Splits audit-simple.md into rendered blocks. Known structure:
//   # title             → page h2 (we drop this — the row header has the
//                          context already)
//   _meta line_         → muted line
//   **Bottom line:** …  → callout
//   ## N. Section name  → h3
//   - bullet            → li under the previous h3 (group consecutive)
//   ---                 → divider
//   plain paragraph     → p
function renderAuditMd(md: string): ReactNode {
  // Strip the closing CIS metadata footer ("_Plain-English notes from CIS…")
  // — it's an authoring breadcrumb, not user-facing copy.
  const stripped = md.replace(
    /\n*---\s*\n+_Plain-English notes from CIS[\s\S]*?_\s*$/m,
    "",
  );
  const lines = stripped.split(/\r?\n/);
  const out: ReactNode[] = [];
  let listBuf: string[] = [];
  let key = 0;
  const flushList = () => {
    if (listBuf.length === 0) return;
    out.push(
      <ul key={`ul-${key++}`} className="list-none space-y-1.5 mt-2 mb-4 pl-0">
        {listBuf.map((b, i) => (
          <li key={`li-${key}-${i}`} className="text-[13px] leading-relaxed text-white/85 pl-4 relative">
            <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-brand-red/70" />
            {renderInline(b)}
          </li>
        ))}
      </ul>,
    );
    listBuf = [];
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushList(); continue; }
    if (line.startsWith("# ")) {
      flushList();
      // skip — the post row header already shows the title context
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      out.push(
        <h3
          key={`h3-${key++}`}
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-red mt-5 mb-1.5"
        >
          {renderInline(line.slice(3))}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      listBuf.push(line.slice(2));
      continue;
    }
    if (line === "---") {
      flushList();
      out.push(<div key={`hr-${key++}`} className="h-px bg-white/10 my-4" />);
      continue;
    }
    // Plain paragraph (catches the meta line + bottom-line + closing italic note)
    flushList();
    const isMeta = line.startsWith("_") && line.endsWith("_");
    const isBottomLine = line.startsWith("**Bottom line:");
    if (isBottomLine) {
      out.push(
        <div
          key={`bl-${key++}`}
          className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-3 my-3 text-[13px] leading-relaxed"
        >
          {renderInline(line)}
        </div>,
      );
    } else if (isMeta) {
      out.push(
        <p key={`m-${key++}`} className="text-[11px] font-mono text-white/50 mb-3">
          {renderInline(line.slice(1, -1))}
        </p>,
      );
    } else {
      out.push(
        <p key={`p-${key++}`} className="text-[13px] leading-relaxed text-white/80 my-2">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flushList();
  return <div>{out}</div>;
}

// ─── PostRow ───────────────────────────────────────────────────────────────

export default function PostRow({ slug, video }: Props) {
  const [expanded, setExpanded] = useState(false);
  const tier = tierLabel(video.verdict_tier);
  const flagCount = getAntiPatternFlagCount(slug, video.video_id);
  const flagList = useMemo(() => getAntiPatternFlags(slug, video.video_id), [slug, video.video_id]);
  const renderedAudit = useMemo(
    () => (video.audit_simple_md ? renderAuditMd(video.audit_simple_md) : null),
    [video.audit_simple_md],
  );

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setExpanded((x) => !x)}
        className="w-full grid grid-cols-[24px_1fr_1.5fr_1fr_1.5fr_1fr] gap-3 items-center px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
        aria-expanded={expanded}
      >
        <span
          className={`font-mono text-xs transition-transform ${expanded ? "rotate-90 text-brand-red" : "text-white/40"}`}
        >
          ▶
        </span>
        <span className="font-mono text-[12px] text-white/70">
          {video.posted_date ?? "—"}
        </span>
        <span className="text-[13px] text-white/80 truncate">
          {video.hook_type ?? "—"}
        </span>
        <span className={`font-mono text-[12px] font-bold ${tier.cls}`}>
          {tier.txt}
        </span>
        <span className="font-mono text-[12px] text-white/80">
          {typeof video.likes === "number" && video.likes >= 0
            ? `${video.likes.toLocaleString()}♥`
            : "—"}
          {typeof video.comments === "number" && video.comments >= 0
            ? ` · ${video.comments}💬`
            : ""}
        </span>
        <span className="font-mono text-[12px]">
          {flagCount === 0 ? (
            <span className="text-green-400">✓ all good</span>
          ) : (
            <span className="text-yellow-400">⚠ {flagCount} to fix</span>
          )}
        </span>
      </button>

      {expanded && (
        <div className="bg-black/40 border-l-[3px] border-l-brand-red px-6 py-5 mb-1">
          {/* Quick-glance metrics row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 pb-4 border-b border-white/10">
            {video.url && (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-red hover:underline"
              >
                ▶ Watch on Instagram
              </a>
            )}
            <span className="font-mono text-[11px] text-white/60">
              Posted {video.posted_date ?? "—"}
              {video.audited_date && ` · audited ${video.audited_date}`}
            </span>
            <span className="font-mono text-[12px] text-white/80 ml-auto">
              {typeof video.likes === "number" && video.likes >= 0
                ? `${video.likes.toLocaleString()}♥`
                : "no ♥ data"}
              {typeof video.comments === "number" && video.comments >= 0
                ? ` · ${video.comments}💬`
                : ""}
              {typeof video.views === "number" && video.views >= 0
                ? ` · ${video.views.toLocaleString()}👁`
                : ""}
            </span>
          </div>

          {/* Flag detail — explicit list of WHAT the row's flag count refers to.
              Plainified kebab-slug → "Slow setup, no anchor" etc. */}
          {flagList.length > 0 && (
            <div className="bg-yellow-500/8 border border-yellow-500/25 rounded-lg px-4 py-3 mb-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-400 mb-2">
                ⚠ {flagList.length} thing{flagList.length === 1 ? "" : "s"} to fix on this post
              </div>
              <ul className="space-y-1">
                {flagList.map((f) => (
                  <li key={f} className="text-[13px] text-white/85 pl-4 relative">
                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-yellow-500/80" />
                    {flagToPlain(f)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {renderedAudit ?? (
            <div className="text-[13px] text-white/50 italic">
              Plain-English audit not yet imported for this post. Re-run the
              CIS snapshot + import.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
