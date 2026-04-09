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

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "LOVABLE_API_KEY is not configured." }, 500);
    }

    // Read audio file and convert to base64
    const arrayBuffer = await audio.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64Audio = btoa(binary);

    // Determine MIME type
    const mimeType = audio.type || "audio/webm";

    // Build language instruction
    const langNames: Record<string, string> = {
      eng: "English", fra: "French", deu: "German", spa: "Spanish",
      por: "Portuguese", rus: "Russian", jpn: "Japanese", kor: "Korean",
      cmn: "Mandarin Chinese", ara: "Arabic", hin: "Hindi", ita: "Italian",
      ron: "Romanian", nld: "Dutch",
    };
    const langHint =
      typeof language === "string" && language.trim() && langNames[language.trim()]
        ? ` The audio is in ${langNames[language.trim()]}.`
        : "";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Transcribe the following audio exactly as spoken. Return ONLY the transcribed text, nothing else. No quotes, no labels, no explanations. If the audio is silent or unintelligible, return an empty string.${langHint}`,
                },
                {
                  type: "input_audio",
                  input_audio: {
                    data: base64Audio,
                    format: mimeType.includes("wav") ? "wav" : mimeType.includes("mp3") ? "mp3" : "webm",
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway STT error:", response.status, errorText);

      if (response.status === 429) {
        return jsonResponse({ error: "Rate limited. Please try again in a moment.", code: "rate_limited" }, 429);
      }
      if (response.status === 402) {
        return jsonResponse({ error: "AI credits exhausted. Add funds in Settings.", code: "quota_exceeded" }, 402);
      }

      return jsonResponse(
        { error: "Speech transcription failed.", details: errorText },
        502
      );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";

    return jsonResponse({ text, words: [] });
  } catch (error) {
    console.error("ai-transcribe error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});
