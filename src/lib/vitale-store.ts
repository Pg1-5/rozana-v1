import { UserProfile, CheckInData } from './vitale-engine';

const PROFILE_KEY = 'vitale_profile';
const CHECKIN_KEY = 'vitale_checkin';
const REFLECTION_KEY = 'vitale_reflection';
const MOMENTUM_KEY = 'vitale_momentum';
const USED_RECIPES_KEY = 'vitale_used_recipes';
const BADGE_KEY = 'vitale_badges';

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile(): UserProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveCheckIn(data: CheckInData) {
  const today = new Date().toDateString();
  localStorage.setItem(CHECKIN_KEY, JSON.stringify({ ...data, date: today }));
}

export function getCheckIn(): (CheckInData & { date: string }) | null {
  const data = localStorage.getItem(CHECKIN_KEY);
  return data ? JSON.parse(data) : null;
}

export function getTodayCheckIn(): CheckInData | null {
  const checkIn = getCheckIn();
  if (checkIn && checkIn.date === new Date().toDateString()) {
    return checkIn;
  }
  return null;
}

export function saveReflection(reflection: string) {
  const today = new Date().toDateString();
  const existing = JSON.parse(localStorage.getItem(REFLECTION_KEY) || '[]');
  existing.push({ date: today, reflection });
  localStorage.setItem(REFLECTION_KEY, JSON.stringify(existing.slice(-30)));
}

export function getReflections(): { date: string; reflection: string }[] {
  return JSON.parse(localStorage.getItem(REFLECTION_KEY) || '[]');
}

export function getMomentum(): number {
  const data = JSON.parse(localStorage.getItem(MOMENTUM_KEY) || '{ "score": 0, "days": [] }');
  return data.score;
}

export function addMomentum(type: 'full' | 'partial' | 'recovery') {
  const data = JSON.parse(localStorage.getItem(MOMENTUM_KEY) || '{ "score": 0, "days": [] }');
  const points = type === 'full' ? 3 : type === 'partial' ? 2 : 1;
  data.score = Math.min(data.score + points, 100);
  data.days.push({ date: new Date().toDateString(), type });
  localStorage.setItem(MOMENTUM_KEY, JSON.stringify(data));
}

export function getActiveDays(): number {
  const data = JSON.parse(localStorage.getItem(MOMENTUM_KEY) || '{ "score": 0, "days": [] }');
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return data.days.filter((d: { date: string }) => new Date(d.date) >= weekAgo).length;
}

export function getMomentumDays(): { date: string; type: string }[] {
  const data = JSON.parse(localStorage.getItem(MOMENTUM_KEY) || '{ "score": 0, "days": [] }');
  return data.days || [];
}

// Used recipes tracking (to avoid repeats within a week)
export function getUsedRecipes(): string[] {
  const data = localStorage.getItem(USED_RECIPES_KEY);
  if (!data) return [];
  const parsed = JSON.parse(data);
  // Only keep recipes used in the last 7 days
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const valid = parsed.filter((r: { name: string; ts: number }) => r.ts > weekAgo);
  return valid.map((r: { name: string }) => r.name);
}

export function markRecipesUsed(names: string[]) {
  const data = JSON.parse(localStorage.getItem(USED_RECIPES_KEY) || '[]');
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const valid = data.filter((r: { name: string; ts: number }) => r.ts > weekAgo);
  const ts = Date.now();
  names.forEach(name => {
    if (!valid.find((r: { name: string }) => r.name === name)) {
      valid.push({ name, ts });
    }
  });
  localStorage.setItem(USED_RECIPES_KEY, JSON.stringify(valid));
}

// Badges
export interface Badge {
  id: string;
  label: string;
  emoji: string;
  earnedAt: number;
}

export function getBadges(): Badge[] {
  return JSON.parse(localStorage.getItem(BADGE_KEY) || '[]');
}

export function awardBadge(badge: Omit<Badge, 'earnedAt'>): boolean {
  const badges = getBadges();
  if (badges.find(b => b.id === badge.id)) return false;
  badges.push({ ...badge, earnedAt: Date.now() });
  localStorage.setItem(BADGE_KEY, JSON.stringify(badges));
  return true;
}

export function checkWeeklyBadge(): Badge | null {
  const activeDays = getActiveDays();
  if (activeDays >= 7) {
    const weekId = `week-${Math.floor(Date.now() / (7 * 24 * 3600 * 1000))}`;
    const isNew = awardBadge({ id: weekId, label: '7-Day Champion', emoji: '\uD83C\uDFC6' });
    if (isNew) return { id: weekId, label: '7-Day Champion', emoji: '\uD83C\uDFC6', earnedAt: Date.now() };
  }
  return null;
}

// Weekly summary data
export function getWeeklySummary() {
  const reflections = getReflections();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekReflections = reflections.filter(r => new Date(r.date) >= weekAgo);
  
  const onTrack = weekReflections.filter(r => r.reflection === 'on_track').length;
  const almost = weekReflections.filter(r => r.reflection === 'almost').length;
  const rest = weekReflections.filter(r => r.reflection === 'not_today').length;
  const total = weekReflections.length;
  
  return { onTrack, almost, rest, total };
}

export function clearAll() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(CHECKIN_KEY);
  localStorage.removeItem(REFLECTION_KEY);
  localStorage.removeItem(MOMENTUM_KEY);
  localStorage.removeItem(USED_RECIPES_KEY);
  localStorage.removeItem(BADGE_KEY);
}
