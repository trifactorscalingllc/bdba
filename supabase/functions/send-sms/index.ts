const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { Pingram } from "npm:pingram";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fullName, instagramHandle, phoneNumber } = await req.json();

    if (!fullName || !instagramHandle || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanHandle = instagramHandle.replace(/^@/, '');
    const igUrl = `https://instagram.com/${cleanHandle}`;
    const message = `New Lead for $Billion Barber Academy:\nName: ${fullName}\nIG: ${igUrl}\nPhone: ${phoneNumber}`;

    const pingram = new Pingram({
      apiKey: Deno.env.get("PINGRAM_API_KEY"),
      baseUrl: "https://api.pingram.io",
    });

    const result = await pingram.send({
      type: "cutbydack",
      to: {
        id: "trifactorscaling@gmail.com",
        number: "+14848602177",
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
