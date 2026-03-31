// Calendar-based smart nudge engine

export interface CalendarEvent {
  title: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  type: 'meeting' | 'focus' | 'break' | 'other';
}

export interface SmartNudge {
  time: string;       // HH:mm
  emoji: string;
  message: string;
  type: 'hydration' | 'walk' | 'stretch' | 'breathe' | 'snack';
  priority: 'gentle' | 'important';
}

export interface FreeSlot {
  startTime: string;
  endTime: string;
  durationMin: number;
}

// Generate demo calendar based on current day
export function getDemoCalendar(): CalendarEvent[] {
  const now = new Date();
  const hour = now.getHours();
  // Create a realistic Indian work schedule
  return [
    { title: 'Morning standup', startTime: '09:30', endTime: '09:45', type: 'meeting' },
    { title: 'Sprint planning', startTime: '10:00', endTime: '11:00', type: 'meeting' },
    { title: 'Deep work — feature build', startTime: '11:15', endTime: '13:00', type: 'focus' },
    { title: 'Lunch break', startTime: '13:00', endTime: '14:00', type: 'break' },
    { title: 'Design review', startTime: '14:00', endTime: '14:45', type: 'meeting' },
    { title: 'Client sync', startTime: '15:00', endTime: '15:30', type: 'meeting' },
    { title: 'Code review', startTime: '16:00', endTime: '16:30', type: 'meeting' },
    { title: 'Wrap up & planning', startTime: '17:00', endTime: '17:30', type: 'focus' },
  ];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function findFreeSlots(events: CalendarEvent[], dayStart = '09:00', dayEnd = '18:00'): FreeSlot[] {
  const sorted = [...events].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const slots: FreeSlot[] = [];
  let cursor = timeToMinutes(dayStart);
  const end = timeToMinutes(dayEnd);

  for (const event of sorted) {
    const evStart = timeToMinutes(event.startTime);
    if (evStart > cursor) {
      const dur = evStart - cursor;
      if (dur >= 5) {
        slots.push({ startTime: minutesToTime(cursor), endTime: event.startTime, durationMin: dur });
      }
    }
    cursor = Math.max(cursor, timeToMinutes(event.endTime));
  }
  if (cursor < end) {
    slots.push({ startTime: minutesToTime(cursor), endTime: dayEnd, durationMin: end - cursor });
  }
  return slots;
}

// Find consecutive meeting blocks (back-to-back or close meetings)
function findLongSittingBlocks(events: CalendarEvent[]): { start: string; end: string; durationMin: number }[] {
  const meetings = events
    .filter(e => e.type === 'meeting' || e.type === 'focus')
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const blocks: { start: string; end: string; durationMin: number }[] = [];
  if (meetings.length === 0) return blocks;

  let blockStart = meetings[0].startTime;
  let blockEnd = meetings[0].endTime;

  for (let i = 1; i < meetings.length; i++) {
    const gap = timeToMinutes(meetings[i].startTime) - timeToMinutes(blockEnd);
    if (gap <= 15) {
      // Continuous or nearly continuous block
      blockEnd = meetings[i].endTime;
    } else {
      const dur = timeToMinutes(blockEnd) - timeToMinutes(blockStart);
      if (dur >= 60) blocks.push({ start: blockStart, end: blockEnd, durationMin: dur });
      blockStart = meetings[i].startTime;
      blockEnd = meetings[i].endTime;
    }
  }
  const dur = timeToMinutes(blockEnd) - timeToMinutes(blockStart);
  if (dur >= 60) blocks.push({ start: blockStart, end: blockEnd, durationMin: dur });
  return blocks;
}

export function generateSmartNudges(events: CalendarEvent[]): SmartNudge[] {
  const nudges: SmartNudge[] = [];
  const freeSlots = findFreeSlots(events);
  const longBlocks = findLongSittingBlocks(events);
  const sorted = [...events].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // 1. Walk nudges before meetings if there's a gap
  for (const event of sorted) {
    if (event.type !== 'meeting') continue;
    const evStart = timeToMinutes(event.startTime);
    // Find a free slot ending just before this meeting
    const gap = freeSlots.find(s => {
      const sEnd = timeToMinutes(s.endTime);
      return sEnd === evStart && s.durationMin >= 10;
    });
    if (gap) {
      const walkTime = minutesToTime(timeToMinutes(gap.endTime) - 10);
      nudges.push({
        time: walkTime,
        emoji: '🚶',
        message: `Take a 5-10 min walk before "${event.title}" starts at ${event.startTime}`,
        type: 'walk',
        priority: 'important',
      });
    }
  }

  // 2. Hydration nudges during long sitting blocks
  for (const block of longBlocks) {
    const midpoint = minutesToTime(Math.floor((timeToMinutes(block.start) + timeToMinutes(block.end)) / 2));
    nudges.push({
      time: midpoint,
      emoji: '💧',
      message: `You've been in meetings since ${block.start} — stay hydrated, grab water now`,
      type: 'hydration',
      priority: 'important',
    });
    if (block.durationMin >= 120) {
      const thirdPoint = minutesToTime(timeToMinutes(block.start) + Math.floor(block.durationMin / 3));
      nudges.push({
        time: thirdPoint,
        emoji: '🧘',
        message: `Long stretch ahead — take 30 seconds to roll your shoulders and breathe`,
        type: 'stretch',
        priority: 'gentle',
      });
    }
  }

  // 3. Use free slots for wellness activities
  for (const slot of freeSlots) {
    if (slot.durationMin >= 15 && slot.durationMin <= 45) {
      // Check if we already have a walk nudge near this time
      const slotMid = timeToMinutes(slot.startTime) + Math.floor(slot.durationMin / 2);
      const hasNearby = nudges.some(n => Math.abs(timeToMinutes(n.time) - slotMid) < 20);
      if (!hasNearby) {
        nudges.push({
          time: slot.startTime,
          emoji: '🌿',
          message: `${slot.durationMin} min free — step outside, stretch, or just breathe`,
          type: 'breathe',
          priority: 'gentle',
        });
      }
    }
    if (slot.durationMin >= 20) {
      const hydrateTime = minutesToTime(timeToMinutes(slot.startTime) + 5);
      const hasHydration = nudges.some(n => n.type === 'hydration' && Math.abs(timeToMinutes(n.time) - timeToMinutes(hydrateTime)) < 30);
      if (!hasHydration) {
        nudges.push({
          time: hydrateTime,
          emoji: '💧',
          message: `Free window — good time to refill your water bottle`,
          type: 'hydration',
          priority: 'gentle',
        });
      }
    }
  }

  // 4. General hydration at fixed intervals if not enough nudges
  const hydrationTimes = ['10:30', '12:00', '14:30', '16:00'];
  for (const t of hydrationTimes) {
    const hasNearby = nudges.some(n => n.type === 'hydration' && Math.abs(timeToMinutes(n.time) - timeToMinutes(t)) < 45);
    if (!hasNearby) {
      nudges.push({
        time: t,
        emoji: '💧',
        message: `Quick reminder — have you had water recently?`,
        type: 'hydration',
        priority: 'gentle',
      });
    }
  }

  // Sort by time
  nudges.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  // Filter to only show upcoming nudges (from current time onward) + limit
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const upcoming = nudges.filter(n => timeToMinutes(n.time) >= nowMins - 30);
  return upcoming.slice(0, 6);
}

// Browser notification support
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return Promise.resolve('denied' as NotificationPermission);
  return Notification.requestPermission();
}

export function scheduleNotification(nudge: SmartNudge): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const [h, m] = nudge.time.split(':').map(Number);
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  const delay = target.getTime() - now.getTime();

  if (delay <= 0) return; // Past time
  if (delay > 8 * 60 * 60 * 1000) return; // More than 8 hours away

  setTimeout(() => {
    new Notification('Vitale 🌿', {
      body: `${nudge.emoji} ${nudge.message}`,
      icon: '/placeholder.svg',
      tag: `vitale-${nudge.type}-${nudge.time}`,
    });
  }, delay);
}

export function scheduleAllNotifications(nudges: SmartNudge[]): void {
  nudges.forEach(scheduleNotification);
}
