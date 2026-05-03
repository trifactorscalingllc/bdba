// Sends one SMS to Dack via Pingram (NotificationAPI) when the BDBA form is submitted.
// All 6 question answers are concatenated into the `message` merge tag of template `template_one`.

import { Pingram } from "npm:pingram";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DACK_PHONE = "+14848602177";
const DACK_ID = "trifactorscaling@gmail.com";

const dash = (v: unknown) => {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s.length === 0 ? "—" : s;
};

const truncate = (s: string, max = 320) =>
  s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;

function buildMessage(input: Record<string, unknown>): string {
  const name = dash(input.fullName ?? input.firstName);
  return [
    "🪒 New BDBA Lead",
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

  return pingram.send({
    type: "cutbydack",
    to: { id: DACK_ID, number: DACK_PHONE },
    parameters: { message: buildMessage(input) },
    templateId: "template_one",
  });
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

    const result = await sendToDack(body);

    return new Response(
      JSON.stringify({ success: true, result }),
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
