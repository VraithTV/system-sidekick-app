import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audio = formData.get("audio");
    const language = formData.get("language");

    if (!(audio instanceof File)) {
      return jsonResponse({ error: "audio file is required." }, 400);
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "ELEVENLABS_API_KEY is not configured." }, 500);
    }

    const requestBody = new FormData();
    requestBody.append("file", audio);
    requestBody.append("model_id", "scribe_v2");
    requestBody.append("tag_audio_events", "false");
    requestBody.append("diarize", "false");

    if (typeof language === "string" && language.trim()) {
      requestBody.append("language_code", language.trim());
    }

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs STT error:", response.status, errorText);
      return jsonResponse(
        {
          error: "Speech transcription failed.",
          provider: "ElevenLabs",
          details: errorText,
        },
        response.status >= 500 ? 502 : response.status
      );
    }

    const data = await response.json();

    return jsonResponse({
      text: typeof data?.text === "string" ? data.text : "",
      words: Array.isArray(data?.words) ? data.words : [],
    });
  } catch (error) {
    console.error("elevenlabs-transcribe error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});