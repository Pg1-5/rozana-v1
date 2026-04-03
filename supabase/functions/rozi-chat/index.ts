import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Rozi, a warm and friendly AI health coach for the Rozana app. You speak like a caring Indian elder sister/brother. You help users with their daily health check-in.

Your role:
- Ask about their energy level (low, balanced, high)
- Ask about their sleep quality (poor, okay, rested)
- Ask about their mental state (heavy, neutral, clear)
- Ask about diet preferences (vegetarian, non-veg, eggitarian)
- Ask what groceries they have at home

Rules:
- Keep responses SHORT (1-2 sentences max)
- Be warm, encouraging, never judgmental
- Use simple English, occasionally Hindi words like "acha", "theek hai", "bahut accha"
- Never use medical terminology
- If they share a concern, acknowledge it warmly and gently redirect to the check-in
- After gathering all info, summarize what you understood

When you have enough information, respond with a JSON block at the end like:
[CHECKIN_DATA]{"energy":"low|balanced|high","sleep":"poor|okay|rested","mind":"heavy|neutral|clear","diet":["vegetarian","non_vegetarian","eggitarian"],"kitchen":"comma separated items"}[/CHECKIN_DATA]

Only include the JSON block when you have ALL the required fields (energy, sleep, mind, diet). Kitchen is optional.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits needed. Please add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I didn't catch that. Can you try again?";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rozi-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
