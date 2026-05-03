const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { Pingram } from "npm:pingram";

// Trim a free-text field so the SMS doesn't blow up to many segments
const MAX_SITUATION_CHARS = 280;
const truncate = (s: string, n: number) =>
  s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : (s ?? "");

const fallback = (v: unknown) => {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s.length === 0 ? "—" : s;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      // Contact
      fullName,
      firstName,
      phoneNumber,
      email,
      // The 6 questions
      hasTime,           // Q1: Yes/No  — at least 1-2 hrs/day available
      revenueGoal,       // Q2: long-term revenue goal
      cutsRange,         // Q4a: cuts in last 6 months
      situationText,     // Q4b: why a fit (free text)
      capitalAvailable,  // Q5: capital available to invest
    } = body ?? {};

    const name = fallback(fullName ?? firstName);

    // Required: we need at minimum a name and a phone to act on the lead
    if (name === "—" || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name and phoneNumber" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = [
      "🪒 New BDBA Lead",
      "",
      `Name: ${name}`,
      `Phone: ${fallback(phoneNumber)}`,
      `Email: ${fallback(email)}`,
      "",
      `Cuts (6mo): ${fallback(cutsRange)}`,
      `Revenue Goal: ${fallback(revenueGoal)}`,
      `Capital: ${fallback(capitalAvailable)}`,
      `Has 1-2 hrs/day: ${fallback(hasTime)}`,
      "",
      "Why a fit:",
      truncate(fallback(situationText), MAX_SITUATION_CHARS),
    ].join("\n");

    const pingram = new Pingram({
      apiKey: Deno.env.get("PINGRAM_API_KEY"),
      baseUrl: "https://api.pingram.io",
    });

    const result = await pingram.send({
      type: "cutbydack",
      to: {
        id: "trifactorscaling@gmail.com",
        number: "+19317716149",
      },
      parameters: {
        message: [message],
      },
      templateId: "template_one",
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-sms error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
