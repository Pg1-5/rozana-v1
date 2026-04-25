import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Calendar, Clock, Link2, Loader2, LogOut } from 'lucide-react';
import {
  CalendarEvent,
  SmartNudge,
  FreeSlot,
  getDemoCalendar,
  findFreeSlots,
  generateSmartNudges,
  googleEventsToCalendarEvents,
  requestNotificationPermission,
  scheduleAllNotifications,
} from '@/lib/calendar-nudges';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Props {
  animationDelay?: number;
}

export default function CalendarNudges({ animationDelay = 0 }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>(getDemoCalendar());
  const [isDemo, setIsDemo] = useState(true);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [nudges, setNudges] = useState<SmartNudge[]>([]);
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  // Recompute nudges whenever events change
  useEffect(() => {
    const generated = generateSmartNudges(events);
    setNudges(generated);
    setFreeSlots(findFreeSlots(events));
    if (notificationsEnabled) scheduleAllNotifications(generated);
  }, [events, notificationsEnabled]);

  // Load notification permission state + saved prefs + sync calendar
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    void loadPrefs();
    void syncCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPrefs = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase
      .from('user_notification_prefs')
      .select('web_push_enabled')
      .eq('user_id', u.user.id)
      .maybeSingle();
    if (data?.web_push_enabled && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  };

  const savePref = async (enabled: boolean) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data: existing } = await supabase
      .from('user_notification_prefs')
      .select('id')
      .eq('user_id', u.user.id)
      .maybeSingle();
    if (existing) {
      await supabase
        .from('user_notification_prefs')
        .update({ web_push_enabled: enabled, native_push_enabled: enabled })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_notification_prefs').insert({
        user_id: u.user.id,
        web_push_enabled: enabled,
        native_push_enabled: enabled,
      });
    }
  };

  const syncCalendar = useCallback(async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {},
      });
      if (error) throw error;
      if (data?.connected && Array.isArray(data.events)) {
        setConnectedEmail(data.email ?? null);
        if (data.events.length > 0) {
          setEvents(googleEventsToCalendarEvents(data.events));
          setIsDemo(false);
        } else {
          // Connected but no events today — keep showing free-day reminders
          setEvents([]);
          setIsDemo(false);
        }
      } else {
        setIsDemo(true);
        setEvents(getDemoCalendar());
      }
    } catch (e) {
      console.error('Calendar sync failed', e);
    } finally {
      setSyncing(false);
    }
  }, []);

  const connectGoogle = async () => {
    setConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/calendar-callback`;
      const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
        body: { action: 'get_auth_url', redirect_uri: redirectUri },
      });
      if (error || !data?.url) throw new Error(error?.message || 'Could not start sign-in');
      window.location.href = data.url;
    } catch (e: unknown) {
      console.error(e);
      toast({
        title: 'Could not connect',
        description: e instanceof Error ? e.message : 'Try again in a moment',
      });
      setConnecting(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      await supabase.functions.invoke('google-calendar-oauth', {
        body: { action: 'disconnect' },
      });
      setConnectedEmail(null);
      setIsDemo(true);
      setEvents(getDemoCalendar());
      toast({ title: 'Calendar disconnected' });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      await savePref(false);
      return;
    }
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      scheduleAllNotifications(nudges);
      await savePref(true);
      toast({ title: 'Soft nudges enabled', description: 'You\'ll get gentle reminders today' });
    }
  };

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const priorityStyles = {
    important: 'border-l-2 border-l-primary',
    gentle: 'border-l-2 border-l-secondary',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
    >
      {/* Header with notification toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <h2 className="text-xs text-muted-foreground font-body uppercase tracking-widest">
            Smart Reminders
          </h2>
        </div>
        <button
          onClick={toggleNotifications}
          className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full transition-all"
          style={{
            background: notificationsEnabled
              ? 'hsl(76 86% 67% / 0.12)'
              : 'hsl(var(--muted) / 0.5)',
            color: notificationsEnabled
              ? 'hsl(76 86% 67%)'
              : 'hsl(var(--muted-foreground))',
          }}
        >
          {notificationsEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
          {notificationsEnabled ? 'Nudges on' : 'Enable nudges'}
        </button>
      </div>

      {/* Google Calendar connection card */}
      <div className="card-surface p-4 mb-4 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {connectedEmail ? (
            <>
              <p className="text-xs text-muted-foreground font-body">Synced with Google Calendar</p>
              <p className="text-sm font-body text-foreground truncate">{connectedEmail}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-body">
                {isDemo ? 'Showing sample schedule' : 'Not connected'}
              </p>
              <p className="text-sm font-body text-foreground">
                Connect Google Calendar for real reminders
              </p>
            </>
          )}
        </div>
        {connectedEmail ? (
          <button
            onClick={disconnectGoogle}
            className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full"
            style={{ background: 'hsl(var(--muted) / 0.5)', color: 'hsl(var(--muted-foreground))' }}
          >
            <LogOut className="w-3 h-3" /> Disconnect
          </button>
        ) : (
          <button
            onClick={connectGoogle}
            disabled={connecting}
            className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full disabled:opacity-60"
            style={{ background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))' }}
          >
            {connecting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Link2 className="w-3 h-3" />
            )}
            Connect
          </button>
        )}
      </div>

      {notificationPermission === 'denied' && (
        <p className="text-xs text-muted-foreground font-body mb-3 italic">
          Notifications blocked by your browser — enable from browser settings
        </p>
      )}

      {/* Today's schedule overview */}
      {events.length > 0 && (
        <div className="card-surface p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-body">
              {isDemo ? "Today's schedule (sample)" : "Today's calendar"}
            </p>
            {syncing && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex flex-wrap gap-2">
            {events.slice(0, 5).map((ev, i) => (
              <span
                key={i}
                className="text-xs font-body px-2 py-1 rounded"
                style={{
                  background:
                    ev.type === 'meeting'
                      ? 'hsl(var(--primary) / 0.1)'
                      : ev.type === 'break'
                        ? 'hsl(var(--secondary) / 0.1)'
                        : 'hsl(var(--muted) / 0.3)',
                  color: 'hsl(var(--foreground) / 0.8)',
                }}
              >
                {ev.startTime} {ev.title}
              </span>
            ))}
            {events.length > 5 && (
              <span className="text-xs font-body text-muted-foreground px-2 py-1">
                +{events.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Free slots */}
      {freeSlots.length > 0 && (
        <div className="card-surface p-4 mb-4">
          <p className="text-xs text-muted-foreground font-body mb-2">Free windows today</p>
          <div className="flex flex-wrap gap-2">
            {freeSlots.map((slot, i) => (
              <span
                key={i}
                className="text-xs font-body px-2.5 py-1 rounded flex items-center gap-1"
                style={{ background: 'hsl(76 86% 67% / 0.08)', color: 'hsl(76 86% 67%)' }}
              >
                <Clock className="w-3 h-3" />
                {slot.startTime}–{slot.endTime} ({slot.durationMin}m)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Smart nudges */}
      <div className="space-y-3 mb-4">
        {nudges.map((nudge, i) => {
          const isPast = nudge.time < currentTime;
          return (
            <motion.div
              key={`${nudge.time}-${nudge.type}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: animationDelay + 0.1 + i * 0.08 }}
              className={`card-surface p-4 rounded-lg ${priorityStyles[nudge.priority]} ${isPast ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">{nudge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-foreground leading-relaxed">{nudge.message}</p>
                  <p className="text-xs font-body text-muted-foreground mt-1">
                    {isPast ? 'Earlier' : `Around ${nudge.time}`}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {nudges.length === 0 && (
        <div className="card-surface p-4 mb-4">
          <p className="text-sm font-body text-muted-foreground">
            🌿 No more reminders for today — you're doing great
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground font-body italic mb-2">
        {connectedEmail
          ? 'Synced with your calendar • reminders adapt to free windows'
          : 'Connect your calendar for personalized reminders'}
      </p>
    </motion.div>
  );
}
