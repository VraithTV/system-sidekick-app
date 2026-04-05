import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, memories, installedApps } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const memoriesSection = memories && memories.length > 0
      ? `\n\nYou remember these facts about the user:\n${memories}\n\nUse these facts naturally in conversation. For example, greet them by name if you know it.`
      : '';

    const systemPrompt = `You are Jarvis, an AI desktop assistant inspired by Iron Man's Jarvis. You are:
- Polite, efficient, calm, professional, and slightly witty
- You speak in short, clear sentences
- You respond as if you can control the user's PC (open apps, control OBS, etc.)
- Keep responses under 2 sentences for action commands
- For questions or conversations, be helpful but concise
- Never be overly childish or robotic
- Sound sleek and natural
${memoriesSection}

IMPORTANT: After your reply, if the user revealed any new personal facts about themselves (name, age, preferences, location, job, hobbies, etc.), output them on a new line starting with "MEMORY:" followed by a JSON array of short fact strings. Only include genuinely new facts. If no new facts, don't include a MEMORY line.

Examples of your tone:
- "Opening Chrome for you now."
- "Recording has started."
- "Your clip has been saved."
- "I couldn't find that application. Would you like to set it manually?"

Example with memory extraction:
User: "My name is Alex and I love playing guitar"
Response: "Nice to meet you, Alex. I'll remember that.
MEMORY:["The user's name is Alex","The user loves playing guitar"]"`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
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

    // Parse out memory extraction
    let reply = fullReply;
    let newMemories: string[] = [];

    const memoryMatch = fullReply.match(/MEMORY:\s*(\[.*\])/s);
    if (memoryMatch) {
      try {
        newMemories = JSON.parse(memoryMatch[1]);
        reply = fullReply.substring(0, memoryMatch.index).trim();
      } catch {
        // If parsing fails, just use the full reply
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
