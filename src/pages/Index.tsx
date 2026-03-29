import { useState, useEffect } from 'react';
import OnboardingFlow from '@/components/OnboardingFlow';
import InsightScreen from '@/components/InsightScreen';
import CheckInScreen from '@/components/CheckInScreen';
import DayPlanScreen from '@/components/DayPlanScreen';
import EveningReflection from '@/components/EveningReflection';
import ProgressScreen from '@/components/ProgressScreen';
import { UserProfile, CheckInData } from '@/lib/vitale-engine';
import { saveProfile, getProfile, saveCheckIn, getTodayCheckIn, saveReflection, addMomentum, clearAll } from '@/lib/vitale-store';

const SCREENS = ['onboarding', 'insight', 'checkin', 'dayplan', 'reflection', 'progress'] as const;
type Screen = (typeof SCREENS)[number];

export default function Index() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [history, setHistory] = useState<Screen[]>([]);

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

  // Forward = next logical screen (for screens that have a natural "next")
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

  const handleReflectionComplete = (reflection: string) => {
    saveReflection(reflection);
    const type = reflection === 'on_track' ? 'full' : reflection === 'almost' ? 'partial' : 'recovery';
    addMomentum(type);
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
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    case 'insight':
      return <InsightScreen profile={profile!} onContinue={() => goTo('checkin')} onBack={canGoBack ? goBack : undefined} onForward={canGoForward ? goForward : undefined} />;
    case 'checkin':
      return <CheckInScreen name={profile!.name} onComplete={handleCheckInComplete} onBack={canGoBack ? goBack : undefined} />;
    case 'dayplan':
      return <DayPlanScreen profile={profile!} checkIn={checkIn!} onReflect={() => goTo('reflection')} onBack={canGoBack ? goBack : undefined} onForward={canGoForward ? goForward : undefined} />;
    case 'reflection':
      return <EveningReflection onComplete={handleReflectionComplete} onBack={canGoBack ? goBack : undefined} />;
    case 'progress':
      return <ProgressScreen onCheckIn={() => goTo('checkin')} onReset={handleReset} onBack={canGoBack ? goBack : undefined} />;
  }
}
