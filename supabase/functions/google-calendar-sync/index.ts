import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const CLIENT_ID = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: tokenRow } = await admin
      .from("user_calendar_tokens")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "google")
      .maybeSingle();

    if (!tokenRow) {
      return new Response(JSON.stringify({ connected: false, events: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let accessToken: string = tokenRow.access_token;
    const expiresAt = new Date(tokenRow.expires_at).getTime();
    if (expiresAt - Date.now() < 60_000 && tokenRow.refresh_token) {
      const refreshed = await refreshAccessToken(tokenRow.refresh_token);
      if (refreshed.access_token) {
        accessToken = refreshed.access_token;
        const newExp = new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000).toISOString();
        await admin
          .from("user_calendar_tokens")
          .update({ access_token: accessToken, expires_at: newExp, updated_at: new Date().toISOString() })
          .eq("id", tokenRow.id);
      }
    }

    // Fetch today's events
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const params = new URLSearchParams({
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    const evRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const evJson = await evRes.json();

    if (!evRes.ok) {
      return new Response(JSON.stringify({ connected: true, error: "calendar_fetch_failed", details: evJson }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items = (evJson.items ?? []).filter((e: any) => e.status !== "cancelled" && e.start?.dateTime && e.end?.dateTime);

    // Persist (replace for today)
    await admin
      .from("user_calendar_events")
      .delete()
      .eq("user_id", userId)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString());

    if (items.length > 0) {
      const rows = items.map((e: any) => ({
        user_id: userId,
        google_event_id: e.id,
        title: e.summary ?? "Busy",
        start_time: e.start.dateTime,
        end_time: e.end.dateTime,
        event_type: "meeting",
        raw: e,
      }));
      await admin.from("user_calendar_events").insert(rows);
    }

    const events = items.map((e: any) => ({
      id: e.id,
      title: e.summary ?? "Busy",
      start: e.start.dateTime,
      end: e.end.dateTime,
    }));

    return new Response(JSON.stringify({ connected: true, email: tokenRow.google_email, events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
