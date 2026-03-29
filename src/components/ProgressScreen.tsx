import { motion } from 'framer-motion';
import { getActiveDays, getMomentum } from '@/lib/vitale-store';
import ScreenNav from '@/components/ScreenNav';

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

export default function ProgressScreen({ onCheckIn, onReset, onBack }: Props) {
  const activeDays = getActiveDays();
  const momentum = getMomentum();
  const insight = insights[Math.floor(Math.random() * insights.length)];

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

          {/* Momentum */}
          <motion.div
            className="card-surface p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
