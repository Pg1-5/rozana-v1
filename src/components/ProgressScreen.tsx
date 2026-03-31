import { motion } from 'framer-motion';
import { getActiveDays, getMomentum } from '@/lib/vitale-store';
import { getProfile } from '@/lib/vitale-store';
import { calculateBMR, calculateTDEE, calculateTargetCalories } from '@/lib/vitale-engine';
import ScreenNav from '@/components/ScreenNav';
import { Footprints, Flame, TrendingDown, TrendingUp } from 'lucide-react';

interface Props {
  onCheckIn: () => void;
  onReset: () => void;
  onBack?: () => void;
}

const insights = [
  "You're moving in the right direction.",
  "Small steps, real progress.",
  "Consistency is your superpower.",
  "Every day counts — even the slow ones.",
];

// Demo random values (seeded by today's date so they stay consistent within a session)
function getDemoStats() {
  const seed = new Date().toDateString().length + new Date().getDate();
  const steps = 5000 + Math.round(((seed * 7919) % 5001));
  const kmWalked = Math.round((steps / 1300) * 10) / 10;
  const caloriesBurned = Math.round(steps * 0.04);
  return { steps, kmWalked, caloriesBurned };
}

export default function ProgressScreen({ onCheckIn, onReset, onBack }: Props) {
  const activeDays = getActiveDays();
  const momentum = getMomentum();
  const insight = insights[Math.floor(Math.random() * insights.length)];
  const { steps, kmWalked, caloriesBurned } = getDemoStats();

  // Calorie goal info
  const profile = getProfile();
  let calorieLabel = '';
  let calorieValue = 0;
  let isDeficit = true;
  if (profile) {
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const target = calculateTargetCalories(tdee, profile.goal);
    const diff = tdee - target;
    if (diff > 0) {
      calorieLabel = 'Calorie deficit';
      calorieValue = diff + caloriesBurned;
      isDeficit = true;
    } else if (diff < 0) {
      calorieLabel = 'Calorie surplus';
      calorieValue = Math.abs(diff);
      isDeficit = false;
    } else {
      calorieLabel = 'Calories burned (walking)';
      calorieValue = caloriesBurned;
      isDeficit = true;
    }
  }

  return (
    <div className="min-h-screen bg-background vitale-gradient flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[520px]">
        <ScreenNav onBack={onBack} title="Progress" />

        <motion.h1
          className="font-heading text-3xl font-semibold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your progress
        </motion.h1>
        <motion.p
          className="text-muted-foreground font-body mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {insight}
        </motion.p>

        <div className="space-y-4 mb-10">
          {/* Active days */}
          <motion.div
            className="card-surface p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">This week</p>
            <p className="font-heading text-4xl font-bold text-primary">{activeDays} <span className="text-lg font-body text-muted-foreground font-normal">of 7 days active</span></p>
          </motion.div>

          {/* Steps & Distance */}
          <motion.div
            className="card-surface p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-3">Today's Activity</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Footprints className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">{steps.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-body">steps</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">{kmWalked}</p>
                  <p className="text-xs text-muted-foreground font-body">km walked</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Calorie Deficit/Surplus */}
          {profile && (
            <motion.div
              className="card-surface p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-2">
                {isDeficit ? (
                  <TrendingDown className="w-4 h-4 text-primary" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-secondary" />
                )}
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">{calorieLabel}</p>
              </div>
              <p className="font-heading text-3xl font-bold text-primary">
                {isDeficit ? '−' : '+'}{calorieValue} <span className="text-lg font-body text-muted-foreground font-normal">kcal</span>
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Includes {caloriesBurned} kcal burned from {steps.toLocaleString()} steps
              </p>
            </motion.div>
          )}

          {/* Momentum */}
          <motion.div
            className="card-surface p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-3">Momentum</p>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${momentum}%` }}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-sm text-muted-foreground font-body mt-2">
              {momentum > 50 ? "You're building momentum." : 'Keep going — every action counts.'}
            </p>
          </motion.div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onCheckIn}
            className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Start Today's Check-in
          </button>
          <button
            onClick={onReset}
            className="w-full py-3 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset profile
          </button>
        </div>
      </div>
    </div>
  );
}
