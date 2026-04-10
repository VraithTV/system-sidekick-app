import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getPayload(req: Request) {
  if (req.method === "GET") {
    const url = new URL(req.url);
    return {
      text: url.searchParams.get("text") ?? "",
      voice: url.searchParams.get("voice") ?? "",
    };
  }

  const body = await req.json().catch(() => ({}));
  return {
    text: typeof body.text === "string" ? body.text : "",
    voice: typeof body.voice === "string" ? body.voice : "",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voice } = await getPayload(req);

    if (!text.trim()) {
      return jsonResponse({ error: "Text is required." }, 400);
    }

    const kokoroUrl = Deno.env.get("KOKORO_TTS_URL");
    if (!kokoroUrl) {
      return jsonResponse({ error: "KOKORO_TTS_URL is not configured.", fallback: "elevenlabs" }, 500);
    }

    const baseUrl = kokoroUrl.replace(/\/+$/, "").replace(/\/(docs|v1)(\/.*)?$/, "");
    const endpoint = `${baseUrl}/v1/audio/speech`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: text.trim(),
          voice: voice || "af_bella",
          model: "kokoro",
          response_format: "mp3",
          speed: 1.0,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const rawError = await response.text();
      console.error("Kokoro TTS error:", response.status, rawError);
      return jsonResponse(
        {
          error: "Kokoro TTS server returned an error.",
          details: rawError,
          fallback: "elevenlabs",
        },
        502,
      );
    }

    if (!response.body) {
      return jsonResponse({ error: "Kokoro TTS server returned no audio stream.", fallback: "elevenlabs" }, 502);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") ?? "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("kokoro-tts error:", error);

    const isTimeout = error instanceof DOMException && error.name === "AbortError";
    return jsonResponse(
      {
        error: isTimeout ? "Kokoro TTS server timed out." : (error instanceof Error ? error.message : "Unknown error"),
        fallback: "elevenlabs",
      },
      isTimeout ? 504 : 500,
    );
  }
});
