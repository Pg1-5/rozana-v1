import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, GOAL_OPTIONS, ACTIVITY_OPTIONS } from '@/lib/vitale-engine';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export default function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  const next = () => setStep((s) => s + 1);
  const update = (field: string, value: string | number) => setProfile((p) => ({ ...p, [field]: value }));

  const canProceed = () => {
    switch (step) {
      case 0: return !!profile.name?.trim();
      case 1: return !!profile.gender;
      case 2: return !!profile.age && profile.age > 0;
      case 3: return !!profile.weight && profile.weight > 0;
      case 4: return !!profile.height && profile.height > 0;
      case 5: return !!profile.goal;
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
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-12">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
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
              />
            )}

            {step === 3 && (
              <NumberInput
                question="What's your current weight?"
                unit="kg"
                value={profile.weight}
                onChange={(v) => update('weight', v)}
              />
            )}

            {step === 4 && (
              <NumberInput
                question="What's your height?"
                unit="cm"
                value={profile.height}
                onChange={(v) => update('height', v)}
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
            Vitale supports general health and fitness guidance. For medical conditions, please consult a healthcare professional.
          </p>
        )}
      </div>
    </div>
  );
}

function NumberInput({ question, unit, value, onChange }: {
  question: string;
  unit: string;
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold">{question}</h1>
      <div className="relative">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-card border border-border rounded-lg px-5 py-4 text-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors pr-16"
          autoFocus
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-body">{unit}</span>
      </div>
    </div>
  );
}
