import { UserProfile, CheckInData } from './vitale-engine';

const PROFILE_KEY = 'vitale_profile';
const CHECKIN_KEY = 'vitale_checkin';
const REFLECTION_KEY = 'vitale_reflection';
const MOMENTUM_KEY = 'vitale_momentum';

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

export function clearAll() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(CHECKIN_KEY);
  localStorage.removeItem(REFLECTION_KEY);
  localStorage.removeItem(MOMENTUM_KEY);
}
