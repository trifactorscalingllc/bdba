// ─── PerformanceChart — per-day engagement bars with 30/60/90 toggle ────────
// Visualizes a student's posting cadence + engagement over a rolling window.
//
//   • One bar per audited post, anchored on its posted_date
//   • Bar height = likes + comments (engagement proxy — views are usually
//     -1 in CIS data because yt-dlp can't read IG-Reels views)
//   • Days with no post = no bar in that slot (visualizes missed-post days)
//   • Bar color reflects verdict tier (strong = green, mid = yellow, weak = red,
//     unknown = neutral grey)
//   • X-axis = date, Y-axis = engagement
//   • Three time-range buttons: 30d / 60d / 90d (D-058 pattern from the CIS
//     playbook.html chart)
//
// Recharts (already in deps) handles axis scaling. We pre-compute one tick
// per day in the window so missing days produce visible gaps.

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import type { VideosJsonlRow } from "@/lib/types";

interface Props {
  videos: VideosJsonlRow[];
}

type Range = 30 | 60 | 90;

interface ChartPoint {
  date: string;       // YYYY-MM-DD
  shortDate: string;  // "May 18" — for the x-axis label
  engagement: number; // 0 = no post that day; positive = engagement value
  hasPost: boolean;
  tier?: string;
  hookType?: string;
}

function tierColor(tier?: string): string {
  switch ((tier ?? "").toLowerCase()) {
    case "strong": return "#22c55e";
    case "mid":    return "#d4a017";
    case "weak":   return "#dc2626";
    default:       return "#9a9a9a";
  }
}

function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export default function PerformanceChart({ videos }: Props) {
  const [range, setRange] = useState<Range>(30);

  const data = useMemo<ChartPoint[]>(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - (range - 1) * 86_400_000);

    // Bucket videos by posted_date
    const byDate = new Map<string, VideosJsonlRow>();
    for (const v of videos) {
      if (!v.posted_date) continue;
      // Keep the highest-engagement post if there are multiple that day
      const existing = byDate.get(v.posted_date);
      const e = (v.likes ?? 0) + (v.comments ?? 0);
      const eEx = existing ? (existing.likes ?? 0) + (existing.comments ?? 0) : -1;
      if (!existing || e > eEx) byDate.set(v.posted_date, v);
    }

    const out: ChartPoint[] = [];
    for (let i = 0; i < range; i++) {
      const d = new Date(start.getTime() + i * 86_400_000);
      const iso = d.toISOString().slice(0, 10);
      const v = byDate.get(iso);
      const engagement = v ? Math.max((v.likes ?? 0) + (v.comments ?? 0), 0) : 0;
      out.push({
        date: iso,
        shortDate: shortDate(iso),
        engagement,
        hasPost: !!v,
        tier: v?.verdict_tier,
        hookType: v?.hook_type,
      });
    }
    return out;
  }, [videos, range]);

  const totals = useMemo(() => {
    const posted = data.filter((d) => d.hasPost).length;
    const missed = range - posted;
    const strong = data.filter((d) => d.tier === "strong").length;
    return { posted, missed, strong };
  }, [data, range]);

  return (
    <div>
      {/* Range toggle + summary row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-full p-1">
          {[30, 60, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as Range)}
              className={`font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full transition-colors ${
                range === r
                  ? "bg-brand-red text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-white/60">
          <span><span className="text-white font-semibold">{totals.posted}</span> posted</span>
          <span className={totals.missed > totals.posted ? "text-red-400" : ""}>
            <span className="font-semibold">{totals.missed}</span> missed days
          </span>
          <span className="text-green-400">
            <span className="font-semibold">{totals.strong}</span> strong
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="shortDate"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              interval={Math.max(0, Math.floor(range / 12) - 1)}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
              width={36}
            />
            <Tooltip
              cursor={{ fill: "rgba(220,38,38,0.08)" }}
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10 }}
              formatter={(value: number, _name, props) => {
                const point = props.payload as ChartPoint;
                if (!point.hasPost) return ["No post", "Engagement"];
                return [`${value.toLocaleString()} (${point.tier?.toUpperCase() ?? "—"})`, "Engagement"];
              }}
            />
            <Bar dataKey="engagement" radius={[3, 3, 0, 0]}>
              {data.map((p, i) => (
                <Cell key={`cell-${i}`} fill={tierColor(p.tier)} opacity={p.hasPost ? 1 : 0} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-green-500" /> Strong
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-yellow-500" /> Mid
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-red-600" /> Weak
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm border border-white/20" /> Missed day
        </span>
      </div>
    </div>
  );
}
