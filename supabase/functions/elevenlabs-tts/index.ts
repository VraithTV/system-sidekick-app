import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const defaultVoiceId = "onwK4e9ZLuTAKqWW03F9";

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function mapProviderError(status: number, rawError: string) {
  let providerCode: string | null = null;
  let providerMessage = rawError;

  try {
    const parsed = JSON.parse(rawError);
    providerCode = parsed?.detail?.status ?? null;
    providerMessage = parsed?.detail?.message ?? parsed?.error ?? rawError;
  } catch {
    providerMessage = rawError;
  }

  if (providerCode === "missing_permissions") {
    return {
      status: 403,
      body: {
        error: "The ElevenLabs API key is missing the text_to_speech permission.",
        provider: "ElevenLabs",
        code: providerCode,
        fallback: "browser_tts",
      },
    };
  }

  if (providerCode === "detected_unusual_activity") {
    return {
      status: 403,
      body: {
        error:
          "ElevenLabs blocked this key for free-tier TTS usage. Use a paid ElevenLabs plan or let the app fall back to browser speech.",
        provider: "ElevenLabs",
        code: providerCode,
        fallback: "browser_tts",
      },
    };
  }

  if (providerCode === "voice_not_found") {
    return {
      status: 404,
      body: {
        error: "The requested voice was not found. It may not be available on your ElevenLabs account.",
        provider: "ElevenLabs",
        code: providerCode,
        fallback: "browser_tts",
      },
    };
  }

  if (providerCode === "quota_exceeded") {
    return {
      status: 429,
      body: {
        error: "ElevenLabs quota exceeded. No credits remaining.",
        provider: "ElevenLabs",
        code: providerCode,
        fallback: "browser_tts",
      },
    };
  }

  return {
    status: status >= 500 ? 502 : status,
    body: {
      error: providerMessage || "TTS provider rejected the request.",
      provider: "ElevenLabs",
      code: providerCode ?? "tts_request_failed",
      fallback: "browser_tts",
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();

    if (typeof text !== "string" || !text.trim()) {
      return jsonResponse({ error: "Text is required." }, 400);
    }

    if (voiceId !== undefined && typeof voiceId !== "string") {
      return jsonResponse({ error: "voiceId must be a string." }, 400);
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "ELEVENLABS_API_KEY is not configured." }, 500);
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || defaultVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
            speed: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const rawError = await response.text();
      console.error("ElevenLabs error:", response.status, rawError);
      const mapped = mapProviderError(response.status, rawError);
      return jsonResponse(mapped.body, mapped.status);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("elevenlabs-tts error:", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});
