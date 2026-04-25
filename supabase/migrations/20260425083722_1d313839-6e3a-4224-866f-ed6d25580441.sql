
-- Store per-user Google Calendar OAuth tokens
CREATE TABLE public.user_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  google_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own calendar tokens"
  ON public.user_calendar_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own calendar tokens"
  ON public.user_calendar_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own calendar tokens"
  ON public.user_calendar_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own calendar tokens"
  ON public.user_calendar_tokens FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_calendar_tokens_updated_at
  BEFORE UPDATE ON public.user_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cache of synced events for today (so we don't hit Google on every render)
CREATE TABLE public.user_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'meeting',
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, google_event_id)
);

ALTER TABLE public.user_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own events"
  ON public.user_calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own events"
  ON public.user_calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own events"
  ON public.user_calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own events"
  ON public.user_calendar_events FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_calendar_events_user_start
  ON public.user_calendar_events (user_id, start_time);

-- Notification preferences
CREATE TABLE public.user_notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hydration_enabled BOOLEAN NOT NULL DEFAULT true,
  stretch_enabled BOOLEAN NOT NULL DEFAULT true,
  walk_enabled BOOLEAN NOT NULL DEFAULT true,
  breathe_enabled BOOLEAN NOT NULL DEFAULT true,
  web_push_enabled BOOLEAN NOT NULL DEFAULT false,
  native_push_enabled BOOLEAN NOT NULL DEFAULT false,
  push_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notification prefs"
  ON public.user_notification_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notification prefs"
  ON public.user_notification_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notification prefs"
  ON public.user_notification_prefs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_notification_prefs_updated_at
  BEFORE UPDATE ON public.user_notification_prefs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
