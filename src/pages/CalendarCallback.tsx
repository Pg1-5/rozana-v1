import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function CalendarCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting your Google Calendar...");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      if (error) {
        setStatus(`Connection cancelled: ${error}`);
        setTimeout(() => navigate("/"), 1500);
        return;
      }
      if (!code) {
        setStatus("Missing authorization code.");
        setTimeout(() => navigate("/"), 1500);
        return;
      }
      try {
        const redirectUri = `${window.location.origin}/calendar-callback`;
        const { data, error: fnErr } = await supabase.functions.invoke("google-calendar-oauth", {
          body: { action: "exchange", code, redirect_uri: redirectUri },
        });
        if (fnErr || data?.error) {
          setStatus(`Could not connect: ${fnErr?.message || data?.error}`);
          setTimeout(() => navigate("/"), 2000);
          return;
        }
        setStatus(`Connected ${data.email ?? ""} ✓`);
        setTimeout(() => navigate("/"), 1200);
      } catch (e: any) {
        setStatus(`Error: ${e.message}`);
        setTimeout(() => navigate("/"), 2000);
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="card-surface p-6 max-w-sm text-center">
        <p className="text-sm font-body text-foreground">{status}</p>
      </div>
    </div>
  );
}
