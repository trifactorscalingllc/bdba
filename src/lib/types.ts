// ─── Shared types for PB Assistant dashboard (ported from dack-ai-app) ─────
// Mirrors the CIS schemas. When CIS bumps a schema, update this file +
// src/lib/cis-bridge.ts together.

export type Slug = string;

export type Tier = "strong" | "mid" | "weak";
export type PostType = "converting" | "viral";
export type FormatTypicality = "typical" | "variation" | "departure" | "experiment" | "unclassified";

// CIS at-audit index row (matches the CIS videos.jsonl + Supabase videos table).
export interface VideosJsonlRow {
  video_id: string;
  url?: string;
  posted_date?: string;
  audited_date?: string;
  hook_type?: string;
  structure_arc?: string;
  format_typicality?: FormatTypicality;
  verdict_tier?: Tier;
  verdict_oneline?: string;
  likes?: number;
  comments?: number;
  views?: number;
  // D-061 push 2: plain-English audit content (the audit-simple.md body)
  // attached at fetch time so PostRow can render the expand panel without
  // a separate request per row.
  audit_simple_md?: string;
  // D-061 push 3 / D-044 extra metadata — used by flag-detail cards to
  // surface the specific evidence on a given post (e.g. the actual
  // hashtags used for the hashtag-hail-mary-spam flag).
  caption?: string;
  hashtags?: string[];
  duration_seconds?: number;
  resolution_px?: string;
}

// Daily business-log row (D-052 schema).
export interface BusinessLogEntry {
  date: string;
  new_clients?: number;
  returning?: number;
  cuts?: number;
  no_shows?: number;
  revenue?: number | null;
  notes?: string;
}

// answers.json v4 schema (stored as JSONB in Supabase answers.payload).
export interface AnswersJson {
  questions_version: number;
  video_id: string;
  audited_date: string;
  answers: Record<string, AnswerCell>;
}

export interface AnswerCell {
  value: unknown;
  answer_type: string;
}

export interface StudentProfile {
  slug: Slug;
  display_name: string;
  ig_handle?: string;
  shop_name?: string;
  location?: string;
  lanes?: string[];
}

// 5-2 Compliance (PRD F1)
export type FiveTwoStatus = "on_track" | "partial" | "off_track";

export interface FiveTwoWeek {
  weekStart: string;
  converting: number;
  viral: number;
  status: FiveTwoStatus;
  total: number;
}

// Playbook Health Bar (PRD F2)
export interface HealthBarScore {
  total: number;
  status: "price_raise_ready" | "almost_there" | "building" | "not_ready";
  factors: {
    fiveTwoCompliance: { earned: number; max: 25; explain: string };
    strongTierShare:   { earned: number; max: 20; explain: string };
    newClients:        { earned: number; max: 20; explain: string };
    noShowRate:        { earned: number; max: 15; explain: string };
    zeroAntiPattern:   { earned: number; max: 10; explain: string };
    engagementGrowth:  { earned: number; max: 10; explain: string };
  };
  coverage: {
    audited_in_window: number;
    posted_in_window?: number;
    business_log_days: number;
  };
}

// Sparkline trend (PRD F4)
export interface SparklineTrend {
  points: number[];
  arrow: "up" | "down" | "flat";
  label: "trending" | "dropping" | "flat";
  deltaPct: number;
  n: number;
}

// Internal cache shape used by cis-bridge.
export interface CisCache {
  students: Slug[];
  data: Record<Slug, {
    profile: StudentProfile;
    profile_md: string;
    videos: VideosJsonlRow[];
    business_log: BusinessLogEntry[];
    answers: Record<string, AnswersJson>;
  }>;
  // CIS patterns library — keyed by file name (anti_patterns.md, drop_offs.md,
  // hooks.md, structures.md). Used by flag-details.ts to render rich
  // description / fix / why cards for every flagged anti-pattern.
  patterns: Record<string, string>;
}
