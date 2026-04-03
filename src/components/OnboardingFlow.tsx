import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { UserProfile, GOAL_OPTIONS, ACTIVITY_OPTIONS } from '@/lib/vitale-engine';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

export default function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));
  const update = (field: string, value: string | number | string[]) => setProfile((p) => ({ ...p, [field]: value }));
  const toggleGoal = (goalId: string) => {
    setProfile((p) => {
      const current = p.goals || [];
      const next = current.includes(goalId) ? current.filter(g => g !== goalId) : [...current, goalId];
      return { ...p, goals: next };
    });
  };

  const getValidationError = (): string | null => {
    if (step === 2 && profile.age !== undefined) {
      if (profile.age < 13) return "This app is designed for users aged 13 and above.";
      if (profile.age > 80) return "Please enter a valid age between 13 and 80.";
    }
    if (step === 3 && profile.weight !== undefined) {
      if (profile.weight < 30) return "The weight entered seems a bit low — please enter at least 30 kg.";
      if (profile.weight > 200) return "Let's double-check this value — please enter a weight under 200 kg.";
    }
    if (step === 4 && profile.height !== undefined) {
      if (profile.height < 100) return "Please enter a height of at least 100 cm.";
      if (profile.height > 250) return "This doesn't look quite right — please enter a height under 250 cm.";
    }
    // Age–weight correlation
    if (step === 3 && profile.age && profile.weight) {
      const minWeight = profile.age < 18 ? 25 : 35;
      if (profile.weight < minWeight) return "The weight entered seems too low for the selected age. Please check and update.";
    }
    return null;
  };

  const validationError = getValidationError();

  const canProceed = () => {
    if (validationError) return false;
    switch (step) {
      case 0: return !!profile.name?.trim();
      case 1: return !!profile.gender;
      case 2: return !!profile.age && profile.age >= 13 && profile.age <= 80;
      case 3: return !!profile.weight && profile.weight >= 30 && profile.weight <= 200;
      case 4: return !!profile.height && profile.height >= 100 && profile.height <= 250;
      case 5: return !!(profile.goals && profile.goals.length > 0);
      case 6: return !!profile.activityLevel;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 6) {
      onComplete(profile as UserProfile);
    } else {
      next();
    }
  };

  return (
    <div className="min-h-screen bg-background vitale-gradient flex items-center justify-center px-6">
      <div className="w-full max-w-[520px]">
        {/* Back + Progress bar */}
        <div className="flex items-center gap-3 mb-12">
          {step > 0 ? (
            <button
              onClick={back}
              className="w-10 h-10 rounded-full card-surface hover:bg-card-hover flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <div className="w-10 flex-shrink-0" />
          )}
          <div className="flex gap-1.5 flex-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} {...fadeUp}>
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-heading text-3xl font-semibold mb-3">Let's understand your rhythm.</h1>
                  <p className="text-muted-foreground font-body text-lg">What should I call you?</p>
                </div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={profile.name || ''}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full bg-card border border-border rounded-lg px-5 py-4 text-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-heading text-3xl font-semibold mb-3">And your gender?</h1>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => update('gender', g)}
                      className={`p-5 rounded-lg text-left font-body text-lg capitalize transition-all ${
                        profile.gender === g ? 'card-surface-selected' : 'card-surface hover:bg-card-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{g}</span>
                        <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
                          profile.gender === g ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <NumberInput
                question="How old are you?"
                unit="yrs"
                value={profile.age}
                onChange={(v) => update('age', v)}
                error={validationError}
              />
            )}

            {step === 3 && (
              <NumberInput
                question="What's your current weight?"
                unit="kg"
                value={profile.weight}
                onChange={(v) => update('weight', v)}
                error={validationError}
              />
            )}

            {step === 4 && (
              <NumberInput
                question="What's your height?"
                unit="cm"
                value={profile.height}
                onChange={(v) => update('height', v)}
                error={validationError}
              />
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h1 className="font-heading text-3xl font-semibold">What's your health goal?</h1>
                <div className="space-y-3">
                  {GOAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => update('goal', opt.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        profile.goal === opt.id ? 'card-surface-selected' : 'card-surface hover:bg-card-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{opt.emoji}</span>
                          <div>
                            <p className="font-body font-medium">{opt.title}</p>
                            <p className="text-sm text-muted-foreground">{opt.description}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0 ${
                          profile.goal === opt.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <h1 className="font-heading text-3xl font-semibold">How active are you?</h1>
                <div className="space-y-3">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => update('activityLevel', opt.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        profile.activityLevel === opt.id ? 'card-surface-selected' : 'card-surface hover:bg-card-hover'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body font-medium">{opt.title}</p>
                          <p className="text-sm text-muted-foreground">{opt.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0 ${
                          profile.activityLevel === opt.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
          >
            {step === 6 ? 'See my baseline' : 'Continue'}
          </button>
        </motion.div>

        {/* Disclaimer */}
        {step === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8 max-w-sm mx-auto">
            Rozana supports general health and fitness guidance. For medical conditions, please consult a healthcare professional.
          </p>
        )}
      </div>
    </div>
  );
}

function NumberInput({ question, unit, value, onChange, error }: {
  question: string;
  unit: string;
  value?: number;
  onChange: (v: number) => void;
  error?: string | null;
}) {
  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold">{question}</h1>
      <div>
        <div className="relative">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`w-full bg-card border rounded-lg px-5 py-4 text-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors pr-16 ${
              error ? 'border-amber-400/60' : 'border-border focus:border-primary'
            }`}
            autoFocus
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-body">{unit}</span>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-amber-400 font-body"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
