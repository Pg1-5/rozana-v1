// Sync today's events from Google Calendar for the authenticated user
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function refreshIfNeeded(admin: any, row: any) {
  const expiresAt = new Date(row.expires_at).getTime();
  if (expiresAt - Date.now() > 60_000) return row.access_token;
  if (!row.refresh_token) return row.access_token;

  const CLIENT_ID = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")!;
  const CLIENT_SECRET = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")!;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      grant_type: "refresh_token", refresh_token: row.refresh_token,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Refresh failed: ${JSON.stringify(data)}`);
  const newExpiry = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString();
  await admin.from("user_calendar_tokens")
    .update({ access_token: data.access_token, expires_at: newExpiry, updated_at: new Date().toISOString() })
    .eq("id", row.id);
  return data.access_token;
}

function hasCalendarReadonlyScope(scope?: string | null) {
  return (scope ?? "").split(/\s+/).includes("https://www.googleapis.com/auth/calendar.readonly");
}

function isInsufficientScopeError(data: any) {
  return data?.error?.status === "PERMISSION_DENIED"
    && data?.error?.details?.some((detail: any) => detail?.reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: tokenRow } = await admin
      .from("user_calendar_tokens")
      .select("*").eq("user_id", user.id).eq("provider", "google").maybeSingle();

    if (!tokenRow) {
      return new Response(JSON.stringify({ connected: false, events: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!hasCalendarReadonlyScope(tokenRow.scope)) {
      return new Response(JSON.stringify({
        connected: false,
        needsReconnect: true,
        reason: "calendar_scope_missing",
        events: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const accessToken = await refreshIfNeeded(admin, tokenRow);

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("timeMin", startOfDay);
    url.searchParams.set("timeMax", endOfDay);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");

    const evRes = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const evData = await evRes.json();
    if (!evRes.ok) {
      if (evRes.status === 403 && isInsufficientScopeError(evData)) {
        return new Response(JSON.stringify({
          connected: false,
          needsReconnect: true,
          reason: "calendar_scope_missing",
          events: [],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ error: "Calendar fetch failed", details: evData }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const events = (evData.items ?? []).filter((e: any) => e.start?.dateTime && e.end?.dateTime);

    // Persist
    if (events.length) {
      const rows = events.map((e: any) => ({
        user_id: user.id,
        google_event_id: e.id,
        title: e.summary ?? "(busy)",
        start_time: e.start.dateTime,
        end_time: e.end.dateTime,
        event_type: "meeting",
        raw: e,
      }));
      // Clear today's then insert (simple sync)
      await admin.from("user_calendar_events")
        .delete().eq("user_id", user.id)
        .gte("start_time", startOfDay).lte("start_time", endOfDay);
      await admin.from("user_calendar_events").insert(rows);
    }

    return new Response(JSON.stringify({
      connected: true,
      email: tokenRow.google_email,
      events: events.map((e: any) => ({
        id: e.id,
        title: e.summary ?? "(busy)",
        start: e.start.dateTime,
        end: e.end.dateTime,
      })),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
