import { useState, useEffect } from 'react';
import OnboardingFlow from '@/components/OnboardingFlow';
import InsightScreen from '@/components/InsightScreen';
import CheckInScreen from '@/components/CheckInScreen';
import RoziVoiceCoach from '@/components/RoziVoiceCoach';
import DayPlanScreen from '@/components/DayPlanScreen';
import EveningReflection from '@/components/EveningReflection';
import ProgressScreen from '@/components/ProgressScreen';
import CommunityFeed from '@/components/CommunityFeed';
import { UserProfile, CheckInData } from '@/lib/vitale-engine';
import { saveProfile, getProfile, saveCheckIn, getTodayCheckIn, saveReflection, addMomentum, clearAll } from '@/lib/vitale-store';
import { addCommunityPost } from '@/lib/community-store';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SCREENS = ['onboarding', 'insight', 'checkin', 'dayplan', 'reflection', 'progress', 'community'] as const;
type Screen = (typeof SCREENS)[number];

// Demo stats for sharing
function getDemoStats() {
  const seed = new Date().toDateString().length + new Date().getDate();
  const steps = 5000 + Math.round(((seed * 7919) % 5001));
  const kmWalked = Math.round((steps / 1300) * 10) / 10;
  const caloriesBurned = Math.round(steps * 0.04);
  return { steps, kmWalked, caloriesBurned };
}

const SHARE_MESSAGES: Record<string, string[]> = {
  on_track: [
    'Ate clean, moved well - feeling great today!',
    'Finished all meals within target. Small wins matter!',
    'Hit my step goal and stuck to the meal plan!',
  ],
  almost: [
    'Almost hit my target today - getting closer each day!',
    'Not perfect but I showed up and that counts!',
  ],
  not_today: [
    'Rest day today - listening to my body. Back at it tomorrow!',
    'Not my best day, but progress is not perfection.',
  ],
};

export default function Index() {
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [history, setHistory] = useState<Screen[]>([]);
  const [prefillName, setPrefillName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const saved = getProfile();
    if (saved) {
      setProfile(saved);
      const todayCheckIn = getTodayCheckIn();
      if (todayCheckIn) {
        setCheckIn(todayCheckIn);
        setScreen('dayplan');
      } else {
        setScreen('progress');
      }
    }
  }, []);

  // Pull name from signed-in user's profile so onboarding can prefill it
  useEffect(() => {
    if (!user) return;
    const metaName = (user.user_metadata?.full_name as string | undefined)?.trim();
    if (metaName) setPrefillName(metaName);
    supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setPrefillName(data.full_name);
      });
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
  };

  const goTo = (next: Screen) => {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setScreen(prev);
    }
  };

  const getForwardScreen = (): Screen | null => {
    switch (screen) {
      case 'insight': return 'checkin';
      case 'checkin': return checkIn ? 'dayplan' : null;
      case 'dayplan': return 'reflection';
      case 'reflection': return 'progress';
      case 'progress': return 'checkin';
      default: return null;
    }
  };

  const goForward = () => {
    const next = getForwardScreen();
    if (next) goTo(next);
  };

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
    saveProfile(p);
    goTo('insight');
  };

  const handleCheckInComplete = (data: CheckInData) => {
    setCheckIn(data);
    saveCheckIn(data);
    goTo('dayplan');
  };

  const handleReflectionComplete = (reflection: string, shared?: boolean) => {
    saveReflection(reflection);
    const type = reflection === 'on_track' ? 'full' : reflection === 'almost' ? 'partial' : 'recovery';
    addMomentum(type);

    // Share to community if opted in
    if (shared && profile) {
      const { steps, kmWalked, caloriesBurned } = getDemoStats();
      const msgs = SHARE_MESSAGES[reflection] || SHARE_MESSAGES.on_track;
      addCommunityPost({
        userName: profile.name,
        avatar: profile.gender === 'female' ? '\uD83E\uDDD8\u200D\u2640\uFE0F' : '\uD83C\uDFC3\u200D\u2642\uFE0F',
        reflection: reflection as 'on_track' | 'almost' | 'not_today',
        message: msgs[Math.floor(Math.random() * msgs.length)],
        steps,
        kmWalked,
        caloriesBurned,
        isOwn: true,
      });
    }

    goTo('progress');
  };

  const handleReset = () => {
    clearAll();
    setProfile(null);
    setCheckIn(null);
    setHistory([]);
    setScreen('onboarding');
  };

  const canGoBack = history.length > 0;
  const canGoForward = !!getForwardScreen();

  switch (screen) {
    case 'onboarding':
      return <OnboardingFlow onComplete={handleOnboardingComplete} initialName={prefillName} />;
    case 'insight':
      return <InsightScreen profile={profile!} onContinue={() => goTo('checkin')} onBack={canGoBack ? goBack : undefined} onForward={canGoForward ? goForward : undefined} />;
    case 'checkin':
      return (
        <>
          <CheckInScreen name={profile!.name} onComplete={handleCheckInComplete} onBack={canGoBack ? goBack : undefined} />
          <RoziVoiceCoach userName={profile!.name} onCheckInComplete={handleCheckInComplete} />
        </>
      );
    case 'dayplan':
      return <DayPlanScreen profile={profile!} checkIn={checkIn!} onReflect={() => goTo('reflection')} onBack={canGoBack ? goBack : undefined} onForward={canGoForward ? goForward : undefined} />;
    case 'reflection':
      return <EveningReflection onComplete={handleReflectionComplete} onBack={canGoBack ? goBack : undefined} />;
    case 'progress':
      return <ProgressScreen onCheckIn={() => goTo('checkin')} onReset={handleReset} onBack={canGoBack ? goBack : undefined} onCommunity={() => goTo('community')} onSignOut={handleSignOut} />;
    case 'community':
      return <CommunityFeed onBack={goBack} />;
  }
}
