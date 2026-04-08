import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getModePrompt(mode: string): string {
  switch (mode) {
    case 'task':
      return '\n\nYou are in TASK MODE. The user has given you a goal. Break it into steps, track progress, and confirm each step. Be structured and action-oriented. Use numbered lists.';
    case 'private':
      return '\n\nYou are in PRIVATE MODE. Do not reference any stored memories. Respond helpfully but treat every message as a fresh conversation.';
    case 'action':
      return '\n\nYou are in ACTION MODE. Be extremely brief. No small talk. Just confirm what you did in under 10 words. Execute commands instantly.';
    case 'animation':
      return '\n\nYou are in ANIMATION MODE. Be dramatic, expressive, and theatrical like a movie AI. Use vivid language, dramatic pauses (with "..."), and add personality. Channel your inner Jarvis from Iron Man.';
    default:
      return '';
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, memories, timezone, mode, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const now = new Date();
    const tz = timezone || "UTC";
    let dateTimeStr: string;
    try {
      dateTimeStr = now.toLocaleString("en-US", {
        timeZone: tz,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      dateTimeStr = now.toUTCString();
    }

    const memoriesSection = memories && memories.length > 0 && mode !== 'private'
      ? `\n\nYou remember these facts about the user:\n${memories}\n\nUse these facts naturally in conversation. For example, greet them by name if you know it.`
      : '';

    const modeAddition = getModePrompt(mode || 'assistant');

    const systemPrompt = `You are Jarvis, an AI desktop assistant inspired by Iron Man's Jarvis. You are:
- Polite, efficient, calm, professional, and slightly witty
- You speak in short, clear sentences
- You respond as if you can control the user's PC (open apps, control OBS, etc.)
- Keep responses under 2 sentences for action commands
- For questions or conversations, be helpful but concise
- Never be overly childish or robotic
- Sound sleek and natural

CRITICAL: You are having a live voice conversation. When the user gives a short reply (like a city name, "yes", "no", a number, etc.), treat it as an answer to your last question. Never ask "what do you want me to do with that?" when the context is obvious. Just act on it.

You can control these things on the user's PC:
- Open applications (Chrome, Spotify, Discord, OBS, Steam, VS Code, etc.)
- Control Spotify (play/pause/skip/previous music)
- Open websites (YouTube, Netflix, Twitch, GitHub, etc.)
- Search Google or YouTube
- Save screen clips
- Toggle recording
- Control OBS (start/stop recording, streaming)

When the user asks you to do something, respond as if you're doing it. Be confident and direct.

The current date and time is: ${dateTimeStr} (${tz}).
${memoriesSection}${modeAddition}

IMPORTANT: After your reply, if the user revealed any new personal facts about themselves (name, age, preferences, location, job, hobbies, etc.), output them on a new line starting with "MEMORY:" followed by a JSON array of short fact strings. Only include genuinely new facts. If no new facts, don't include a MEMORY line.

Examples of your tone:
- "Opening Chrome for you now."
- "Playing your music on Spotify."
- "Recording has started."
- "Your clip has been saved."
- "Searching YouTube for that now."`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...(Array.isArray(conversationHistory) ? conversationHistory.slice(-10) : []),
            { role: "user", content: message },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const fullReply = data.choices?.[0]?.message?.content || "I didn't catch that. Could you say it again?";

    let reply = fullReply;
    let newMemories: string[] = [];

    const memoryMatch = fullReply.match(/MEMORY:\s*(\[.*\])/s);
    if (memoryMatch) {
      try {
        newMemories = JSON.parse(memoryMatch[1]);
        reply = fullReply.substring(0, memoryMatch.index).trim();
      } catch {
        reply = fullReply.replace(/MEMORY:.*$/s, '').trim();
      }
    }

    return new Response(JSON.stringify({ reply, newMemories }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("jarvis-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
