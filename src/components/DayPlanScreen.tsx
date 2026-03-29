import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import ScreenNav from '@/components/ScreenNav';
import {
  CheckInData,
  UserProfile,
  MealSlot,
  getInsightLine,
  getWorkoutSuggestion,
  getRecipeSuggestions,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
} from '@/lib/vitale-engine';

interface Props {
  profile: UserProfile;
  checkIn: CheckInData;
  onReflect: () => void;
  onBack?: () => void;
  onForward?: () => void;
}

export default function DayPlanScreen({ profile, checkIn, onReflect, onBack, onForward }: Props) {
  const insight = getInsightLine(checkIn);
  const workout = getWorkoutSuggestion(checkIn);
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const target = calculateTargetCalories(tdee, profile.goal);
  const mealSlots = getRecipeSuggestions(profile.goal, checkIn.dietPreference, target, checkIn.kitchenInput);

  const isStressed = checkIn.mind === 'heavy';

  // Track selected meal per slot
  const [selections, setSelections] = useState<Record<number, number>>({});

  const selectMeal = (slotIndex: number, optionIndex: number) => {
    setSelections((prev) => ({ ...prev, [slotIndex]: optionIndex }));
  };

  const dietLabel =
    checkIn.dietPreference === 'vegetarian' ? '🥦 Vegetarian' :
    checkIn.dietPreference === 'non_vegetarian' ? '🍗 Non-Veg' :
    '🥚 Eggitarian';

  return (
    <div className="min-h-screen bg-background vitale-gradient px-6 py-12">
      <div className="w-full max-w-[520px] mx-auto">
        <ScreenNav onBack={onBack} onForward={onForward} title="Today's Plan" />

        {/* Insight line */}
        <motion.p
          className="font-heading text-2xl font-semibold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {insight}
        </motion.p>

        {/* Stress interruption */}
        {isStressed && (
          <motion.div
            className="rounded-lg p-5 mb-6"
            style={{ background: 'hsl(76 86% 67% / 0.08)', border: '1px solid hsl(76 86% 67% / 0.15)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-body text-sm text-foreground leading-relaxed">
              Stress is high today. Take 5 deep breaths. Step outside for 60 seconds. Let's keep today light and protect your energy.
            </p>
          </motion.div>
        )}

        {/* Move section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isStressed ? 0.5 : 0.2 }}
        >
          <h2 className="text-xs text-muted-foreground font-body uppercase tracking-widest mb-4">Move</h2>
          <div className="card-surface p-5 mb-8">
            <p className="font-body font-medium text-foreground">{workout.title}</p>
            <p className="text-sm text-muted-foreground font-body mt-1">{workout.description}</p>
          </div>
        </motion.div>

        {/* Eat Smart section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isStressed ? 0.7 : 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs text-muted-foreground font-body uppercase tracking-widest">Eat Smart Today</h2>
            <span className="text-xs font-body text-muted-foreground">{dietLabel}</span>
          </div>

          <p className="text-xs text-muted-foreground font-body mb-2">
            Daily target: <span className="text-foreground font-medium">{target} kcal</span>
          </p>

          {checkIn.kitchenInput && (
            <p className="text-xs text-muted-foreground font-body mb-4 italic">
              Prioritised meals with: {checkIn.kitchenInput}
            </p>
          )}

          <div className="space-y-8 mb-4">
            {mealSlots.map((slot, slotIdx) => (
              <motion.div
                key={slot.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (isStressed ? 0.8 : 0.5) + slotIdx * 0.15 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-body font-medium text-foreground">
                    {slot.emoji} {slot.label}
                  </p>
                  <span className="text-xs font-body text-muted-foreground">~{slot.targetKcal} kcal</span>
                </div>
                <div className="space-y-3">
                  {slot.options.map((recipe, optIdx) => {
                    const isSelected = selections[slotIdx] === optIdx;
                    return (
                      <button
                        key={recipe.name}
                        onClick={() => selectMeal(slotIdx, optIdx)}
                        className="w-full text-left transition-all"
                      >
                        <div
                          className={`p-5 rounded-lg transition-all ${
                            isSelected
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'card-surface hover:bg-card-hover'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground/30'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <h3 className="font-body font-medium text-foreground">{recipe.name}</h3>
                            </div>
                            <div className="flex gap-3 text-xs text-muted-foreground font-body flex-shrink-0">
                              <span>{recipe.kcal} kcal</span>
                              <span>{recipe.prepTime}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.2 }}
                            >
                              <ol className="space-y-1.5 mb-3 ml-7">
                                {recipe.steps.map((step, j) => (
                                  <li key={j} className="text-sm font-body text-foreground/80 leading-relaxed">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                              <p className="text-xs text-muted-foreground font-body italic ml-7">{recipe.why}</p>
                            </motion.div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground font-body mb-10">
            This keeps you close to your target (approx {target} kcal)
          </p>
        </motion.div>

        {/* Midday nudges */}
        <motion.div
          className="space-y-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-xs text-muted-foreground font-body uppercase tracking-widest mb-4">Later Today</h2>
          <div className="card-surface p-4">
            <p className="text-sm font-body text-muted-foreground">💧 Water check — you've probably not had enough today</p>
          </div>
          <div className="card-surface p-4">
            <p className="text-sm font-body text-muted-foreground">🚶 A short walk might help reset your energy</p>
          </div>
        </motion.div>

        <button
          onClick={onReflect}
          className="w-full py-4 rounded-lg font-body font-medium text-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          End My Day
        </button>
      </div>
    </div>
  );
}
