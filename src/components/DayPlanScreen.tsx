import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw } from 'lucide-react';
import ScreenNav from '@/components/ScreenNav';

import {
  CheckInData,
  UserProfile,
  MealSlot,
  Recipe,
  getInsightLine,
  getWorkoutSuggestion,
  getRecipeSuggestions,
  getRefreshedMealOption,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
} from '@/lib/vitale-engine';
import { getUsedRecipes, markRecipesUsed } from '@/lib/vitale-store';

interface Props {
  profile: UserProfile;
  checkIn: CheckInData;
  onReflect: () => void;
  onBack?: () => void;
  onForward?: () => void;
}

export default function DayPlanScreen({ profile, checkIn, onReflect, onBack, onForward }: Props) {
  const primaryGoal = profile.goals[0] || 'stay_fit';
  const insight = getInsightLine(checkIn);
  const workout = getWorkoutSuggestion(checkIn, primaryGoal);
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const target = calculateTargetCalories(tdee, profile.goals);
  const usedRecipes = getUsedRecipes();
  const initialSlots = getRecipeSuggestions(primaryGoal, checkIn.dietPreferences, target, checkIn.kitchenInput, usedRecipes);

  const [mealSlots, setMealSlots] = useState<MealSlot[]>(initialSlots);

  // Mark today's recipes as used
  useEffect(() => {
    const names = mealSlots.flatMap(s => s.options.map(o => o.name));
    markRecipesUsed(names);
  }, []);

  const isStressed = checkIn.mind === 'heavy';

  // Track selected workout and meal per slot
  const [selectedWorkout, setSelectedWorkout] = useState<number | null>(null);
  const [selections, setSelections] = useState<Record<number, number>>({});

  const selectMeal = (slotIndex: number, optionIndex: number) => {
    setSelections((prev) => ({ ...prev, [slotIndex]: optionIndex }));
  };

  // Refresh a meal option: replace one option with a new one
  const refreshMealOption = useCallback((slotIdx: number, optIdx: number) => {
    const slot = mealSlots[slotIdx];
    const excludeNames = slot.options.map(o => o.name);
    const newRecipe = getRefreshedMealOption(
      primaryGoal,
      checkIn.dietPreferences,
      target,
      slotIdx,
      excludeNames,
      checkIn.kitchenInput,
    );
    if (!newRecipe) return;
    setMealSlots(prev => {
      const updated = [...prev];
      const newOptions = [...updated[slotIdx].options] as [Recipe, Recipe, Recipe];
      newOptions[optIdx] = newRecipe;
      updated[slotIdx] = { ...updated[slotIdx], options: newOptions };
      return updated;
    });
    // Clear selection for that slot if the replaced option was selected
    if (selections[slotIdx] === optIdx) {
      setSelections(prev => { const n = { ...prev }; delete n[slotIdx]; return n; });
    }
  }, [mealSlots, primaryGoal, checkIn, target, selections]);

  const dietLabel = checkIn.dietPreferences
    .map((p) => p === 'vegetarian' ? '🥦 Veg' : p === 'non_vegetarian' ? '🍗 Non-Veg' : '🥚 Egg')
    .join(' + ');

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
          <h2 className="text-xs text-muted-foreground font-body uppercase tracking-widest mb-1">Move</h2>
          <p className="font-heading text-base font-semibold text-foreground mb-1">{workout.dayLabel}</p>
          <p className="text-sm font-body text-foreground/80 mb-4">{workout.message}</p>

          {/* Mandatory walk — always shown */}
          <div className="p-5 rounded-lg card-surface mb-3 border border-primary/20">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-base mr-1">{workout.walk.emoji}</span>
                <h3 className="font-body font-medium text-foreground">{workout.walk.title}</h3>
                <span className="text-[10px] font-body uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">Daily</span>
              </div>
              <span className="text-xs font-body text-muted-foreground flex-shrink-0">{workout.walk.duration}</span>
            </div>
            <p className="text-sm text-muted-foreground font-body mt-1 ml-7">{workout.walk.description}</p>
          </div>

          {/* Exercise options to choose from */}
          {workout.exerciseOptions.length > 0 && (
            <div className="space-y-3 mb-3">
              <p className="text-xs text-muted-foreground font-body mt-4 mb-1">Pick one workout:</p>
              {workout.exerciseOptions.map((opt, idx) => {
                const isSelected = selectedWorkout === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedWorkout(isSelected ? null : idx)}
                    className="w-full text-left transition-all"
                  >
                    <div
                      className={`p-5 rounded-lg transition-all ${
                        isSelected
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'card-surface hover:bg-card-hover'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <span className="text-base mr-2">{opt.emoji}</span>
                          <h3 className="font-body font-medium text-foreground">{opt.title}</h3>
                        </div>
                        <span className="text-xs font-body text-muted-foreground flex-shrink-0">{opt.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-body mt-1 ml-7">{opt.description}</p>

                      {isSelected && opt.exercises && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.2 }}
                        >
                          <ul className="space-y-1.5 mt-3 ml-7">
                            {opt.exercises.map((ex, i) => (
                              <li key={i} className="text-sm font-body text-foreground/80 leading-relaxed flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                {ex}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Rest option */}
          <button
            onClick={() => setSelectedWorkout(selectedWorkout === -1 ? null : -1)}
            className="w-full text-left transition-all mb-4"
          >
            <div
              className={`p-5 rounded-lg transition-all ${
                selectedWorkout === -1
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'card-surface hover:bg-card-hover'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedWorkout === -1 ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    }`}
                  >
                    {selectedWorkout === -1 && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-base mr-2">{workout.restOption.emoji}</span>
                  <h3 className="font-body font-medium text-foreground">{workout.restOption.title}</h3>
                </div>
                <span className="text-xs font-body text-muted-foreground flex-shrink-0">{workout.restOption.duration}</span>
              </div>
              <p className="text-sm text-muted-foreground font-body mt-1 ml-7">{workout.restOption.description}</p>
              {selectedWorkout === -1 && workout.restOption.exercises && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                >
                  <ul className="space-y-1.5 mt-3 ml-7">
                    {workout.restOption.exercises.map((ex, i) => (
                      <li key={i} className="text-sm font-body text-foreground/80 leading-relaxed flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </button>

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
                    const isPrimary = optIdx === 0;
                    return (
                      <div key={recipe.name + optIdx} className="relative">
                        <button
                          onClick={() => selectMeal(slotIdx, optIdx)}
                          className="w-full text-left transition-all"
                        >
                          <div
                            className={`p-5 pr-12 rounded-lg transition-all ${
                              isSelected
                                ? 'ring-2 ring-primary bg-primary/5'
                                : 'card-surface hover:bg-card-hover'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
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
                              {isPrimary && (
                                <span className="text-[10px] font-body uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">Best match</span>
                              )}
                            </div>
                            <div className="flex gap-3 ml-7 mt-1 text-xs text-muted-foreground font-body">
                              <span>{recipe.kcal} kcal</span>
                              <span>⏱ {recipe.prepTime}</span>
                            </div>
                            {/* Macro breakdown */}
                            {recipe.macros && (
                              <div className="flex gap-3 ml-7 mt-1 mb-1">
                                <span className="text-xs font-body text-muted-foreground">C: <span className="text-foreground">{recipe.macros.carbs}g</span></span>
                                <span className="text-xs font-body text-muted-foreground">P: <span className="text-foreground">{recipe.macros.protein}g</span></span>
                                <span className="text-xs font-body text-muted-foreground">F: <span className="text-foreground">{recipe.macros.fat}g</span></span>
                                <span className="text-xs font-body text-muted-foreground">Fiber: <span className="text-foreground">{recipe.macros.fiber}g</span></span>
                              </div>
                            )}
                            {/* Portion sizes */}
                            {recipe.portions && recipe.portions.length > 0 && (
                              <div className="flex flex-wrap gap-x-3 gap-y-1 ml-7 mt-1 mb-1">
                                {recipe.portions.map((p, pIdx) => (
                                  <span key={pIdx} className="text-xs font-body text-muted-foreground">
                                    {p.item}: <span className="text-foreground font-medium">{p.grams}g</span>
                                  </span>
                                ))}
                              </div>
                            )}
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
                        {/* Refresh button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); refreshMealOption(slotIdx, optIdx); }}
                          className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Show another option"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Selected total */}
          {Object.keys(selections).length > 0 && (
            <div className="card-surface p-4 mb-10 flex justify-between items-center">
              <p className="text-sm font-body text-foreground">Selected meals total</p>
              <p className="text-sm font-body font-medium text-primary">
                {mealSlots.reduce((sum, slot, i) => sum + (selections[i] !== undefined ? slot.options[selections[i]].kcal : 0), 0)} / {target} kcal
              </p>
            </div>
          )}
          {Object.keys(selections).length === 0 && (
            <p className="text-xs text-muted-foreground font-body mb-10">
              Pick your meals to see how they add up against your {target} kcal target
            </p>
          )}
        </motion.div>

        {/* Smart calendar-based reminders */}
        <div className="mb-10">
          <CalendarNudges animationDelay={0.9} />
        </div>

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
