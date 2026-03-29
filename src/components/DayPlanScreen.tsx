import { motion } from 'framer-motion';
import {
  CheckInData,
  UserProfile,
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
}

export default function DayPlanScreen({ profile, checkIn, onReflect }: Props) {
  const insight = getInsightLine(checkIn);
  const workout = getWorkoutSuggestion(checkIn);
  const recipes = getRecipeSuggestions(profile.goal, checkIn.kitchenInput);
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const target = calculateTargetCalories(tdee, profile.goal);

  const isStressed = checkIn.mind === 'heavy';

  return (
    <div className="min-h-screen bg-background vitale-gradient px-6 py-12">
      <div className="w-full max-w-[520px] mx-auto">
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

        {/* Eats Smart section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isStressed ? 0.7 : 0.4 }}
        >
          <h2 className="text-xs text-muted-foreground font-body uppercase tracking-widest mb-4">Eat Smart Today</h2>
          <div className="space-y-4 mb-4">
            {recipes.map((recipe, i) => (
              <motion.div
                key={recipe.name}
                className="p-5 rounded-lg"
                style={{
                  background: 'hsl(var(--card))',
                  border: `1px solid ${i === 0 ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--secondary) / 0.3)'}`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (isStressed ? 0.8 : 0.5) + i * 0.15 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-body font-medium text-foreground">{recipe.name}</h3>
                  <div className="flex gap-3 text-xs text-muted-foreground font-body flex-shrink-0">
                    <span>{recipe.kcal} kcal</span>
                    <span>{recipe.prepTime}</span>
                  </div>
                </div>
                <ol className="space-y-1.5 mb-3">
                  {recipe.steps.map((step, j) => (
                    <li key={j} className="text-sm font-body text-foreground/80 leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-muted-foreground font-body italic">{recipe.why}</p>
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
