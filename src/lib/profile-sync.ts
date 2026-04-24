import { supabase } from '@/integrations/supabase/client';
import type { UserProfile } from '@/lib/vitale-engine';

/**
 * Persist the full onboarding profile to the backend so it can later be
 * exported as an Excel sheet. Uses upsert on user_id so re-running
 * onboarding overwrites the previous profile for the same user.
 */
export async function saveProfileToBackend(profile: UserProfile): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // Not signed in; skip silently.

  const row = {
    user_id: user.id,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    height_cm: profile.height,
    weight_kg: profile.weight,
    activity_level: profile.activityLevel,
    goal: (profile.goals && profile.goals[0]) || null,
    raw_profile: JSON.parse(JSON.stringify(profile)),
  };

  const { error } = await supabase
    .from('user_profiles')
    .upsert([row], { onConflict: 'user_id' });

  if (error) console.error('Failed to save profile to backend:', error);
}

/**
 * Fetch the current user's full profile from the backend (for Excel export).
 */
export async function fetchMyProfileRow() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
  return data;
}
