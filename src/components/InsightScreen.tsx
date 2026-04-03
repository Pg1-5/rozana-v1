import { motion } from 'framer-motion';
import ScreenNav from '@/components/ScreenNav';
import {
  UserProfile,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateBMI,
  getActivityMultiplier,
  getGoalAdjustmentLabel,
  getDynamicCopy,
  getGoalTip,
} from '@/lib/vitale-engine';

interface Props {
  profile: UserProfile;
  onContinue: () => void;
  onBack?: () => void;
  onForward?: () => void;
}

export default function InsightScreen({ profile, onContinue, onBack, onForward }: Props) {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const target = calculateTargetCalories(tdee, profile.goals);
  const bmi = calculateBMI(profile.weight, profile.height);
  const multiplier = getActivityMultiplier(profile.activityLevel);

  return (
    <div className="min-h-screen bg-background vitale-gradient flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[520px]">
        <ScreenNav onBack={onBack} onForward={onForward} title="Your Baseline" />

        <motion.h1
          className="font-heading text-3xl font-semibold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Based on your body and routine, here's your baseline.
        </motion.h1>

        <motion.p
          className="text-muted-foreground font-body mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {profile.name}, these numbers are your starting point.
        </motion.p>

        {/* BMR Hero Card */}
        <motion.div
          className="card-surface p-6 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground font-body uppercase tracking-wider mb-1">Basal Metabolic Rate</p>
          <p className="font-heading text-5xl font-bold text-primary">{bmr}</p>
          <p className="text-sm text-muted-foreground font-body mt-1">kcal/day</p>
          <p className="text-sm text-muted-foreground font-body mt-3 leading-relaxed">
            The energy your body burns at complete rest — even while sleeping. This is your biological baseline.
          </p>
        </motion.div>

        {/* TDEE + Target side by side */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            className="card-surface p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">Maintenance</p>
            <p className="font-heading text-3xl font-bold text-tertiary">{tdee}</p>
            <p className="text-xs text-muted-foreground font-body">kcal/day</p>
          </motion.div>

          <motion.div
            className="p-5 rounded-lg"
            style={{ background: 'hsl(var(--card))', border: '1.5px solid hsl(var(--secondary))' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">Your Target</p>
            <p className="font-heading text-3xl font-bold text-secondary">{target}</p>
            <p className="text-xs text-muted-foreground font-body">kcal/day</p>
          </motion.div>
        </div>

        {/* Dynamic copy */}
        <motion.p
          className="text-muted-foreground font-body text-sm leading-relaxed mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          {getDynamicCopy(profile.goal, tdee)}
        </motion.p>

        {/* Insight rows */}
        <motion.div
          className="card-surface p-5 space-y-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="flex justify-between text-sm font-body">
            <span className="text-muted-foreground">Activity multiplier</span>
            <span className="text-foreground">×{multiplier}</span>
          </div>
          <div className="flex justify-between text-sm font-body">
            <span className="text-muted-foreground">Calorie adjustment</span>
            <span className="text-foreground">{getGoalAdjustmentLabel(profile.goal)}</span>
          </div>
          <div className="flex justify-between text-sm font-body">
            <span className="text-muted-foreground">BMI</span>
            <span className="text-foreground">{bmi.value} · {bmi.label}</span>
          </div>
        </motion.div>

        {/* Goal tip */}
        <motion.div
          className="rounded-lg p-5 mb-10"
          style={{ background: 'hsl(76 86% 67% / 0.08)', border: '1px solid hsl(76 86% 67% / 0.15)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-sm font-body text-foreground leading-relaxed">{getGoalTip(profile.goal)}</p>
        </motion.div>

        <motion.button
          onClick={onContinue}
          className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          Shape My Day →
        </motion.button>
      </div>
    </div>
  );
}
