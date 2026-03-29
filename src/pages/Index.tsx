import { useState, useEffect } from 'react';
import OnboardingFlow from '@/components/OnboardingFlow';
import InsightScreen from '@/components/InsightScreen';
import CheckInScreen from '@/components/CheckInScreen';
import DayPlanScreen from '@/components/DayPlanScreen';
import EveningReflection from '@/components/EveningReflection';
import ProgressScreen from '@/components/ProgressScreen';
import { UserProfile, CheckInData } from '@/lib/vitale-engine';
import { saveProfile, getProfile, saveCheckIn, getTodayCheckIn, saveReflection, addMomentum, clearAll } from '@/lib/vitale-store';

type Screen = 'onboarding' | 'insight' | 'checkin' | 'dayplan' | 'reflection' | 'progress';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);

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

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
    saveProfile(p);
    setScreen('insight');
  };

  const handleInsightContinue = () => setScreen('checkin');

  const handleCheckInComplete = (data: CheckInData) => {
    setCheckIn(data);
    saveCheckIn(data);
    setScreen('dayplan');
  };

  const handleReflect = () => setScreen('reflection');

  const handleReflectionComplete = (reflection: string) => {
    saveReflection(reflection);
    const type = reflection === 'on_track' ? 'full' : reflection === 'almost' ? 'partial' : 'recovery';
    addMomentum(type);
    setScreen('progress');
  };

  const handleReset = () => {
    clearAll();
    setProfile(null);
    setCheckIn(null);
    setScreen('onboarding');
  };

  switch (screen) {
    case 'onboarding':
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    case 'insight':
      return <InsightScreen profile={profile!} onContinue={handleInsightContinue} />;
    case 'checkin':
      return <CheckInScreen name={profile!.name} onComplete={handleCheckInComplete} />;
    case 'dayplan':
      return <DayPlanScreen profile={profile!} checkIn={checkIn!} onReflect={handleReflect} />;
    case 'reflection':
      return <EveningReflection onComplete={handleReflectionComplete} />;
    case 'progress':
      return <ProgressScreen onCheckIn={() => setScreen('checkin')} onReset={handleReset} />;
  }
}
