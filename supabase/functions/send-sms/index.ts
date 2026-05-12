// Sends one SMS to Dack via Pingram (NotificationAPI) when the BDBA form is submitted.
// All 6 question answers are concatenated into the `message` merge tag of template `template_one`.

import { Pingram } from "npm:pingram";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DACK_PHONE = "+19317716149";
const DACK_ID = "trifactorscaling@gmail.com";

const dash = (v: unknown) => {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s.length === 0 ? "—" : s;
};

const truncate = (s: string, max = 320) =>
  s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;

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

    const makePayload = {
      firstName: body?.firstName ?? body?.fullName ?? null,
      phone: body?.phoneNumber ?? null,
      email: body?.email ?? null,
      timeCommitment: body?.hasTime ?? null,
      revenueGoal: body?.revenueGoal ?? null,
      cutsLast6Months: body?.cutsRange ?? null,
      whyGoodFit: body?.situationText ?? null,
      capital: body?.capitalAvailable ?? null,
    };

    const [dackResult, makeResult] = await Promise.allSettled([
      sendToDack(body),
      fetch("https://hook.us2.make.com/ihr8xwcpmhnxthjrmjam6qfly5ni6adk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(makePayload),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`Make webhook failed: ${r.status} ${await r.text()}`);
        return r.status;
      }),
    ]);

    if (dackResult.status === "rejected") console.error("Dack send failed:", dackResult.reason);
    if (makeResult.status === "rejected") console.error("Make webhook failed:", makeResult.reason);

    return new Response(
      JSON.stringify({
        success: true,
        dack: dackResult.status,
        make: makeResult.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-sms error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
