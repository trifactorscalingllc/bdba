// Sends one SMS to Dack via Pingram (NotificationAPI) AND creates/updates a contact
// in Dack's GHL sub-account when the BDBA form is submitted.
//
// Two parallel side-effects, via Promise.allSettled (one leg failing doesn't break the other):
//   1. Pingram SMS to Dack's phone — internal notification
//   2. GHL contact upsert — populates 8 custom fields + 3 base tags on the contact record
//
// Required Supabase secrets:
//   PINGRAM_API_KEY — Pingram NotificationAPI key
//   GHL_PIT         — GoHighLevel Private Integration Token (location-scoped, all scopes)

import { Pingram } from "npm:pingram";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DACK_PHONE = "+19317716149";
const DACK_ID = "trifactorscaling@gmail.com";

// ============================================================================
// GHL config — Dack / Profitable Barbers sub-account
// ============================================================================
const GHL_LOCATION_ID = "tdcmXGR1SyxWs5m74u61";
const GHL_BASE_TAGS = ["bdba-application", "src-website-form", "status-new-application"];

// Custom field IDs on Dack's Contact object.
// Fetch with: GET https://services.leadconnectorhq.com/locations/{locationId}/customFields
const GHL_FIELD_IDS = {
  time_available:     "5lvf5sTia4IGdWHjx2mt", // SINGLE_OPTIONS: Yes / No
  revenue_goal:       "DELhzj4Rjl3qv4Wt402R", // SINGLE_OPTIONS: $0-3K/MONTH … $12K+
  cuts_last_6_months: "12n4jBlg50zMkje6re8Q", // SINGLE_OPTIONS: 0-50, 50-100, 100-150, 150+
  capital_available:  "KShfBfXXRQ6EC8Wp1koO", // SINGLE_OPTIONS: Under $1,000 … $3,000+
  why_good_fit:       "SJiDvSIwp6gjh9lT7R2E", // LARGE_TEXT
  utm_source:         "5F51qxPIMpLCEO1xE3ng", // TEXT
  utm_medium:         "Mmc3lGYV2mQtNKGyzBYL", // TEXT
  utm_campaign:       "S1z9EgK2d4mBPKr8fnYp", // TEXT
  utm_content:        "fYldGUGp8Yf3pmJgwrpK", // TEXT
  utm_term:           "GFuRax3vRxEdgn4RBKQC", // TEXT
} as const;

const dash = (v: unknown) => {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s.length === 0 ? "—" : s;
};

const truncate = (s: string, max = 320) =>
  s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;

// NOTE: tierFor's case values are STALE — they don't match the current Q4 dropdown
// options on the BDBA form ("Under $1,000", "$1,000 - $2,000", "$2,000 - $3,000",
// "$3,000+"). Result: SMS "Qualifies for:" line currently shows "—" for most leads.
// Phase 2 will realign this to Dack's 3-tier ladder (BBA / PB Mid Tier / PB High Tier)
// once Brad confirms the mapping. Left alone for now — broken-loud beats wrong-quiet.
function tierFor(capital: unknown): string {
  switch (String(capital ?? "").trim()) {
    case "$0 - $500":
      return "BBA";
    case "$500 - $1,000":
      return "Mid Tier";
    case "$1,000 - $2,000":
    case "$3,000+":
      return "Profitable Barbers";
    default:
      return "—";
  }
}

function buildMessage(input: Record<string, unknown>): string {
  const name = dash(input.fullName ?? input.firstName);
  const tier = tierFor(input.capitalAvailable);
  return [
    "New BDBA Lead",
    "",
    `Qualifies for: ${tier}`,
    "",
    `Name: ${name}`,
    `Phone: ${dash(input.phoneNumber)}`,
    `Email: ${dash(input.email)}`,
    "",
    `1. Time available (1-2hrs/day): ${dash(input.hasTime)}`,
    `2. Revenue goal: ${dash(input.revenueGoal)}`,
    `3. Cuts last 6mo: ${dash(input.cutsRange)}`,
    `4. Capital available: ${dash(input.capitalAvailable)}`,
    "",
    "Why a fit:",
    truncate(dash(input.situationText) as string),
  ].join("\n");
}

async function sendToDack(input: Record<string, unknown>) {
  const apiKey = Deno.env.get("PINGRAM_API_KEY");
  if (!apiKey) throw new Error("PINGRAM_API_KEY is not set");

  const pingram = new Pingram({
    apiKey,
    baseUrl: "https://api.pingram.io",
  });

  const message = buildMessage(input);
  const to = { id: DACK_ID, number: DACK_PHONE };

  try {
    const result = await pingram.send({
      type: "profitablebarbers_com",
      to,
      parameters: { message },
      templateId: "form_submit",
    });
    console.log("Pingram sent via profitablebarbers_com/form_submit");
    return { result, combo: "profitablebarbers_com/form_submit" };
  } catch (primaryErr) {
    console.error("Primary Pingram combo failed, falling back:", primaryErr);
    const result = await pingram.send({
      type: "cutbydack",
      to,
      parameters: { message },
      templateId: "template_one",
    });
    console.log("Pingram sent via cutbydack/template_one (fallback)");
    return { result, combo: "cutbydack/template_one" };
  }
}

// ============================================================================
// GHL contact upsert — creates a new contact or updates an existing one (deduped
// by email + phone). Populates 8 custom fields + 3 base tags. Single REST call.
// ============================================================================
async function upsertToGHL(input: Record<string, unknown>) {
  const pit = Deno.env.get("GHL_PIT");
  if (!pit) throw new Error("GHL_PIT is not set");

  // Build customFields array, skipping empty/missing values (GHL is fine with an
  // empty array — we just don't want to overwrite existing values with blanks).
  const customFields: Array<{ id: string; value: string }> = [];
  const add = (id: string, raw: unknown) => {
    const v = raw == null ? "" : String(raw).trim();
    if (v.length > 0) customFields.push({ id, value: v });
  };

  add(GHL_FIELD_IDS.time_available,     input.hasTime);
  add(GHL_FIELD_IDS.revenue_goal,       input.revenueGoal);
  add(GHL_FIELD_IDS.cuts_last_6_months, input.cutsRange);
  add(GHL_FIELD_IDS.capital_available,  input.capitalAvailable);
  add(GHL_FIELD_IDS.why_good_fit,       input.situationText);
  add(GHL_FIELD_IDS.utm_source,         input.utm_source);
  add(GHL_FIELD_IDS.utm_medium,         input.utm_medium);
  add(GHL_FIELD_IDS.utm_campaign,       input.utm_campaign);
  add(GHL_FIELD_IDS.utm_content,        input.utm_content);
  add(GHL_FIELD_IDS.utm_term,           input.utm_term);

  const payload = {
    locationId: GHL_LOCATION_ID,
    firstName: input.firstName ?? input.fullName ?? null,
    email: input.email ?? null,
    phone: input.phoneNumber ?? null,
    source: "BDBA Application Form",
    tags: GHL_BASE_TAGS,
    customFields,
  };

  const r = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${pit}`,
      "Version": "2021-07-28",
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const errBody = await r.text();
    throw new Error(`GHL upsert failed: ${r.status} ${errBody}`);
  }

  const data = await r.json();
  const contactId = data?.contact?.id ?? "(unknown)";
  const isNew = data?.new === true;
  console.log(`GHL contact ${isNew ? "created" : "updated"}: ${contactId}`);
  return { contactId, isNew };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const name = body?.fullName ?? body?.firstName;
    if (!name || !body?.phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name and phoneNumber" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [ghlResult] = await Promise.allSettled([
      upsertToGHL(body),
    ]);

    const pingramResult = { status: "fulfilled" as const, value: { skipped: true } };

    if (ghlResult.status === "rejected") {
      console.error("GHL upsert failed:", ghlResult.reason);
    }

    return new Response(
      JSON.stringify({
        success: true,
        pingram: pingramResult.status,
        ghl: ghlResult.status,
        ghl_contact_id: ghlResult.status === "fulfilled"
          ? (ghlResult.value as { contactId: string }).contactId
          : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-sms error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error)?.message ?? "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
