import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveDays, getMomentum, getWeeklySummary, checkWeeklyBadge, getBadges } from '@/lib/vitale-store';
import { getProfile } from '@/lib/vitale-store';
import { calculateBMR, calculateTDEE, calculateTargetCalories } from '@/lib/vitale-engine';
import ScreenNav from '@/components/ScreenNav';
import { Footprints, Flame, TrendingDown, TrendingUp, Trophy, Users, Award, Share2 } from 'lucide-react';
import { Twitter, Instagram, Facebook } from '@/components/SocialIcons';
import type { Badge } from '@/lib/vitale-store';

interface Props {
  onCheckIn: () => void;
  onReset: () => void;
  onBack?: () => void;
  onCommunity?: () => void;
}

const insights = [
  "You're moving in the right direction.",
  "Small steps, real progress.",
  "Consistency is your superpower.",
  "Every day counts - even the slow ones.",
];

function getDemoStats() {
  const seed = new Date().toDateString().length + new Date().getDate();
  const steps = 5000 + Math.round(((seed * 7919) % 5001));
  const kmWalked = Math.round((steps / 1300) * 10) / 10;
  const caloriesBurned = Math.round(steps * 0.04);
  return { steps, kmWalked, caloriesBurned };
}

function getWeeklySummaryMessage(summary: { onTrack: number; almost: number; rest: number; total: number }) {
  if (summary.total === 0) return "Your week is just beginning. Let's make it count!";
  if (summary.onTrack >= 5) return "Incredible week! You stayed on track almost every day. Keep this energy going!";
  if (summary.onTrack >= 3) return "Solid week! More good days than not. You're building real habits.";
  if (summary.onTrack + summary.almost >= 4) return "You showed up most days this week. That consistency is what matters!";
  if (summary.total >= 3) return "You checked in " + summary.total + " days this week. Every check-in is a step forward!";
  return "You've started the week. Remember, even one day of showing up makes a difference.";
}

export default function ProgressScreen({ onCheckIn, onReset, onBack, onCommunity }: Props) {
  const activeDays = getActiveDays();
  const momentum = getMomentum();
  const insight = insights[Math.floor(Math.random() * insights.length)];
  const { steps, kmWalked, caloriesBurned } = getDemoStats();
  const badges = getBadges();
  const summary = getWeeklySummary();
  const summaryMessage = getWeeklySummaryMessage(summary);

  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const badge = checkWeeklyBadge();
    if (badge) setNewBadge(badge);
  }, []);

  const profile = getProfile();
  let calorieLabel = '';
  let calorieValue = 0;
  let isDeficit = true;
  if (profile) {
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const target = calculateTargetCalories(tdee, profile.goals);
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
    <div className="min-h-screen bg-background vitale-gradient px-6 py-12">
      <div className="w-full max-w-[520px] mx-auto">
        <ScreenNav onBack={onBack} title="Progress" />

        {/* New badge celebration */}
        <AnimatePresence>
          {newBadge && (
            <motion.div
              className="rounded-lg p-6 mb-6 text-center"
              style={{ background: 'hsl(76 86% 67% / 0.10)', border: '1px solid hsl(76 86% 67% / 0.20)' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <p className="text-4xl mb-2">{newBadge.emoji}</p>
              <p className="font-heading text-xl font-semibold text-foreground mb-1">New Badge Earned!</p>
              <p className="font-body text-primary font-medium">{newBadge.label}</p>
              <p className="text-xs text-muted-foreground font-body mt-2">7 days active this week. You are amazing!</p>
              <button
                onClick={() => setNewBadge(null)}
                className="mt-3 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          className="font-heading text-3xl font-semibold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your progress
        </motion.h1>
        <motion.p
          className="text-muted-foreground font-body mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {insight}
        </motion.p>

        <div className="space-y-4 mb-6">
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
                {isDeficit ? '\u2212' : '+'}{calorieValue} <span className="text-lg font-body text-muted-foreground font-normal">kcal</span>
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">
                Includes {caloriesBurned} kcal burned from {steps.toLocaleString()} steps
              </p>
            </motion.div>
          )}

          {/* Weekly Summary */}
          {summary.total > 0 && (
            <motion.div
              className="card-surface p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.43 }}
            >
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-3">Week in Review</p>
              <div className="flex gap-4 mb-3">
                <div className="text-center">
                  <p className="font-heading text-xl font-bold text-primary">{summary.onTrack}</p>
                  <p className="text-xs text-muted-foreground font-body">on track</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-xl font-bold text-secondary">{summary.almost}</p>
                  <p className="text-xs text-muted-foreground font-body">almost</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-xl font-bold text-muted-foreground">{summary.rest}</p>
                  <p className="text-xs text-muted-foreground font-body">rest days</p>
                </div>
              </div>
              <p className="font-body text-sm text-foreground leading-relaxed">{summaryMessage}</p>
            </motion.div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <motion.div
              className="card-surface p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Badges</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {badges.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10">
                    <span className="text-lg">{b.emoji}</span>
                    <span className="text-xs font-body font-medium text-foreground">{b.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Momentum */}
          <motion.div
            className="card-surface p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 }}
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
              {momentum > 50 ? "You're building momentum." : 'Keep going - every action counts.'}
            </p>
          </motion.div>
        </div>

        {/* Share Progress */}
        <motion.div
          className="card-surface p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Share Your Progress</p>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-4">
            Inspire others by sharing your journey!
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const text = `I've been active ${activeDays} of 7 days this week! ${steps.toLocaleString()} steps today 🚶‍♀️ #Rozana #HealthJourney`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg card-surface hover:bg-card-hover transition-colors font-body text-sm text-foreground"
            >
              <Twitter size={18} />
              <span>X</span>
            </button>
            <button
              onClick={() => {
                window.open('https://www.instagram.com/', '_blank');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg card-surface hover:bg-card-hover transition-colors font-body text-sm text-foreground"
            >
              <Instagram size={18} />
              <span>Instagram</span>
            </button>
            <button
              onClick={() => {
                const text = `I've been active ${activeDays} of 7 days this week! ${steps.toLocaleString()} steps today 🚶‍♀️`;
                window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg card-surface hover:bg-card-hover transition-colors font-body text-sm text-foreground"
            >
              <Facebook size={18} />
              <span>Facebook</span>
            </button>
          </div>
        </motion.div>
        <div className="space-y-3">
          <button
            onClick={onCheckIn}
            className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Start Today's Check-in
          </button>
          {onCommunity && (
            <button
              onClick={onCommunity}
              className="w-full py-4 rounded-lg font-body font-medium text-lg card-surface hover:bg-card-hover transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Community
            </button>
          )}
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
