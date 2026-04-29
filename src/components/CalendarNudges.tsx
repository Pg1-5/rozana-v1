import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Calendar, Clock, Link as LinkIcon, RefreshCw } from 'lucide-react';
import {
  CalendarEvent,
  SmartNudge,
  FreeSlot,
  getDemoCalendar,
  findFreeSlots,
  generateSmartNudges,
  requestNotificationPermission,
  scheduleAllNotifications,
} from '@/lib/calendar-nudges';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  animationDelay?: number;
}

function toHHmm(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function CalendarNudges({ animationDelay = 0 }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>(getDemoCalendar());
  const [nudges, setNudges] = useState<SmartNudge[]>([]);
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [connected, setConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [usingDemo, setUsingDemo] = useState(true);
  const [needsReconnect, setNeedsReconnect] = useState(false);

  const loadGoogleEvents = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', { body: {} });
      if (error || !data) {
        setSyncing(false);
        return;
      }
      if (data.needsReconnect) {
        setConnected(false);
        setGoogleEmail(null);
        setNeedsReconnect(true);
        setSyncing(false);
        return;
      }
      if (data.connected) {
        setConnected(true);
        setGoogleEmail(data.email ?? null);
        setNeedsReconnect(false);
        if (Array.isArray(data.events) && data.events.length > 0) {
          const mapped: CalendarEvent[] = data.events.map((e: any) => ({
            title: e.title,
            startTime: toHHmm(e.start),
            endTime: toHHmm(e.end),
            type: 'meeting',
          }));
          setEvents(mapped);
          setUsingDemo(false);
        } else {
          setUsingDemo(false);
          setEvents([]);
        }
      }
    } catch (_) {
      // silent
    }
    setSyncing(false);
  };

  const connectGoogle = async () => {
    const redirectUri = `${window.location.origin}/calendar-callback`;
    const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
      body: { action: 'start', redirect_uri: redirectUri },
    });
    if (error || !data?.url) return;
    window.location.href = data.url;
  };

  useEffect(() => {
    loadGoogleEvents();
  }, []);

  useEffect(() => {
    const generated = generateSmartNudges(events);
    setNudges(generated);
    setFreeSlots(findFreeSlots(events));

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, [events]);


  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }

    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      scheduleAllNotifications(nudges);
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
          {notificationsEnabled ? (
            <Bell className="w-3 h-3" />
          ) : (
            <BellOff className="w-3 h-3" />
          )}
          {notificationsEnabled ? 'Notifications on' : 'Enable notifications'}
        </button>
      </div>

      {/* Google Calendar connection */}
      <div className="card-surface p-3 mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-body text-foreground">
            {connected ? `Synced with ${googleEmail ?? 'Google Calendar'}` : needsReconnect ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
          </p>
          <p className="text-[11px] font-body text-muted-foreground">
            {connected
              ? usingDemo
                ? 'No events today — using sample schedule'
                : 'Reminders adapt to your real busy/free windows'
              : needsReconnect
                ? 'Calendar permission needs a fresh approval'
              : 'Get reminders based on your real schedule'}
          </p>
        </div>
        {connected ? (
          <button
            onClick={loadGoogleEvents}
            disabled={syncing}
            className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing' : 'Resync'}
          </button>
        ) : (
          <button
            onClick={connectGoogle}
            className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full bg-primary text-primary-foreground"
          >
            <LinkIcon className="w-3 h-3" />
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
      <div className="card-surface p-4 mb-4">
        <p className="text-xs text-muted-foreground font-body mb-2">Today's schedule</p>
        <div className="flex flex-wrap gap-2">
          {events.slice(0, 5).map((ev, i) => (
            <span
              key={i}
              className="text-xs font-body px-2 py-1 rounded"
              style={{
                background: ev.type === 'meeting'
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

      {/* Free slots */}
      {freeSlots.length > 0 && (
        <div className="card-surface p-4 mb-4">
          <p className="text-xs text-muted-foreground font-body mb-2">Free windows today</p>
          <div className="flex flex-wrap gap-2">
            {freeSlots.map((slot, i) => (
              <span
                key={i}
                className="text-xs font-body px-2.5 py-1 rounded flex items-center gap-1"
                style={{
                  background: 'hsl(76 86% 67% / 0.08)',
                  color: 'hsl(76 86% 67%)',
                }}
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
        Based on your calendar schedule • reminders adapt to your day
      </p>
    </motion.div>
  );
}
