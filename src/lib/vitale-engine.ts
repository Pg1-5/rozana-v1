// Types
export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  goals: string[];
  activityLevel: string;
}

// Helper: get primary goal (first selected) for single-goal functions
export function getPrimaryGoal(goals: string[]): string {
  return goals[0] || 'stay_fit';
}

export type DietPreference = 'vegetarian' | 'non_vegetarian' | 'eggitarian';

export interface CheckInData {
  energy: 'low' | 'balanced' | 'high';
  sleep: 'poor' | 'okay' | 'rested';
  mind: 'heavy' | 'neutral' | 'clear';
  dietPreferences: DietPreference[];
  kitchenInput?: string;
}

// Activity multipliers
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// BMR Calculation — Mifflin-St Jeor
export function calculateBMR(profile: UserProfile): number {
  if (profile.gender === 'male') {
    return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5);
  }
  return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161);
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

// Priority order: fat_loss > lose_weight > build_muscle > stay_fit > build_consistency
const GOAL_PRIORITY: string[] = ['fat_loss', 'lose_weight', 'build_muscle', 'stay_fit', 'build_consistency'];

const GOAL_ADJUSTMENTS: Record<string, number> = {
  lose_weight: -300,
  fat_loss: -300,
  stay_fit: 0,
  build_consistency: 0,
  build_muscle: 200,
};

// Get the highest-priority goal from a multi-select list
function getTopPriorityGoal(goals: string[]): string {
  for (const g of GOAL_PRIORITY) {
    if (goals.includes(g)) return g;
  }
  return goals[0] || 'stay_fit';
}

export function calculateTargetCalories(tdee: number, goals: string[]): number {
  if (!goals.length) return tdee;
  const top = getTopPriorityGoal(goals);
  const adj = GOAL_ADJUSTMENTS[top] ?? 0;
  return tdee + adj;
}

export function calculateBMI(weight: number, heightCm: number): { value: number; label: string } {
  const heightM = heightCm / 100;
  const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
  let label = 'Normal';
  if (bmi < 18.5) label = 'Underweight';
  else if (bmi >= 25 && bmi < 30) label = 'Overweight';
  else if (bmi >= 30) label = 'Obese';
  return { value: bmi, label };
}

export function getActivityMultiplier(level: string): number {
  return ACTIVITY_MULTIPLIERS[level] || 1.2;
}

export function getGoalAdjustmentLabel(goals: string[]): string {
  if (!goals.length) return 'No adjustment';
  const top = getTopPriorityGoal(goals);
  const adj = GOAL_ADJUSTMENTS[top] ?? 0;
  if (adj < 0) return `${adj} kcal deficit`;
  if (adj > 0) return `+${adj} kcal surplus`;
  return 'No adjustment';
}

export function getDynamicCopy(goals: string[], tdee: number): string {
  const primary = getTopPriorityGoal(goals);
  switch (primary) {
    case 'lose_weight': return `To stay on track, your body needs around ${tdee} kcal/day. A 300 kcal deficit helps you lose weight safely and sustainably.`;
    case 'fat_loss': return `Your maintenance is ${tdee} kcal/day. A moderate 300 kcal deficit helps burn fat while keeping your muscle intact.`;
    case 'stay_fit': return `Your body runs well at around ${tdee} kcal/day. We'll help you stay right there.`;
    case 'build_consistency': return `Numbers matter less right now. Your baseline is ${tdee} kcal/day — we'll keep things simple and sustainable.`;
    case 'build_muscle': return `To grow, your body needs a little more. We'll add 200 kcal above your ${tdee} kcal/day baseline.`;
    default: return '';
  }
}

export function getGoalTip(goals: string[]): string {
  return goals.map(g => {
    switch (g) {
      case 'lose_weight': return 'A 300 kcal/day deficit supports steady, sustainable weight loss without muscle loss.';
      case 'fat_loss': return 'A 300 kcal deficit preserves muscle while burning fat. Add strength training 3x/week.';
      case 'stay_fit': return 'Eat at your maintenance calories. Prioritise food quality, sleep, and daily movement.';
      case 'build_consistency': return 'Calories matter less than showing up. Move your body daily and track without obsessing.';
      case 'build_muscle': return 'A 200 kcal surplus supports lean muscle growth. Prioritise progressive overload and protein.';
      default: return '';
    }
  }).filter(Boolean).join(' • ');
}

// Workout types
export type WorkoutCategory = 'chest_triceps' | 'back_biceps' | 'legs' | 'abs_mobility' | 'shoulders' | 'rest' | 'walk';

export interface WorkoutOption {
  category: WorkoutCategory;
  emoji: string;
  title: string;
  description: string;
  duration: string;
  exercises?: string[];
}

export interface WorkoutPlan {
  message: string;
  dayLabel: string;
  walk: WorkoutOption;           // mandatory daily walk
  exerciseOptions: WorkoutOption[]; // 2 exercise choices to pick from
  restOption: WorkoutOption;     // always available
  walkTarget: { km: number; note: string };
}

// ─── 6-DAY GYM SPLIT (Day 7 = Rest) ───

interface DaySplit {
  category: WorkoutCategory;
  emoji: string;
  title: string;
  description: string;
  duration: string;
  exercises: string[];
  lowExercises: string[]; // gentler version for low-energy days
}

const WEEKLY_SPLIT: DaySplit[] = [
  // Day 1 — Chest & Triceps
  {
    category: 'chest_triceps', emoji: '🏋️', title: 'Chest & Triceps',
    description: 'Build a strong chest and defined triceps.',
    duration: '45 min',
    exercises: [
      'Incline bench press — 4 × 12',
      'Seated chest press machine — 4 × 12',
      'Cable crossover — 3 × 15',
      'Triceps push-down — 4 × 15',
      'Dumbbell overhead extension — 4 × 15',
      'Triceps dips — 3 × to failure',
    ],
    lowExercises: [
      'Incline push-ups — 3 × 12',
      'Chest press (light) — 3 × 12',
      'Light cable crossover — 2 × 12',
      'Triceps push-down (light) — 3 × 12',
      'Overhead extension (light) — 3 × 10',
    ],
  },
  // Day 2 — Back & Biceps
  {
    category: 'back_biceps', emoji: '🏋️', title: 'Back & Biceps',
    description: 'Strengthen your back and build bicep definition.',
    duration: '45 min',
    exercises: [
      'Seated row — 4 × 12',
      'Lat pulldown — 3 × 15',
      'One-arm dumbbell row — 3 × 12 each',
      'Hyperextension — 2 × 15',
      'Standing barbell curl — 4 × 12',
      'Cable rope hammer curl — 4 × 15',
    ],
    lowExercises: [
      'Seated row (light) — 3 × 10',
      'Lat pulldown (light) — 3 × 12',
      'One-arm dumbbell row (light) — 2 × 10 each',
      'Light bicep curls — 3 × 12',
      'Hammer curls (light) — 3 × 10',
    ],
  },
  // Day 3 — Legs
  {
    category: 'legs', emoji: '🦵', title: 'Legs',
    description: 'Build powerful legs — the foundation of your strength.',
    duration: '45 min',
    exercises: [
      'Leg extension — 4 × 15',
      'Leg press — 3 × 15',
      'Smith machine squats — 3 × 12',
      'Lying leg curls — 3 × 12-15',
      'Calf raises — 4 × 15',
    ],
    lowExercises: [
      'Bodyweight squats — 3 × 12',
      'Leg extension (light) — 3 × 12',
      'Glute bridges — 3 × 15',
      'Calf raises — 3 × 15',
      'Wall sit — 3 × 30s',
    ],
  },
  // Day 4 — Abs, Mobility & Cardio
  {
    category: 'abs_mobility', emoji: '🧘', title: 'Abs, Mobility & Cardio',
    description: '40 min cardio + core work + full-body stretching.',
    duration: '60 min',
    exercises: [
      '40 min cardio (treadmill / cycling / elliptical)',
      'Sit-up crunches — 3 sets to failure',
      'Lying leg raises — 3 × 15',
      'Plank hold — 3 × 45s',
      'Russian twists — 3 × 20',
      'Whole body stretching — 10 min',
    ],
    lowExercises: [
      '20 min light walk / cycling',
      'Gentle crunches — 2 × 12',
      'Lying leg raises — 2 × 10',
      'Plank hold — 2 × 20s',
      'Full body stretching — 15 min',
    ],
  },
  // Day 5 — Shoulders
  {
    category: 'shoulders', emoji: '💪', title: 'Shoulders',
    description: 'Build strong, well-rounded shoulders.',
    duration: '40 min',
    exercises: [
      'Machine overhead press — 3 × 15',
      'Lateral raise — 3 × 15',
      'Cable rope front raises — 3 × 15',
      'Cable Z-bar upright rows — 3 × 12',
      'Dumbbell shrugs — 4 × 12',
    ],
    lowExercises: [
      'Light overhead press — 2 × 12',
      'Lateral raise (light) — 2 × 12',
      'Front raises (light) — 2 × 12',
      'Shoulder shrugs (light) — 3 × 12',
    ],
  },
  // Day 6 — Rest
  {
    category: 'rest', emoji: '😌', title: 'Rest Day',
    description: 'Recovery is when your body grows stronger. Stretch, hydrate, and rest well.',
    duration: '—',
    exercises: [
      'Light stretching — 10-15 min',
      'Foam rolling (if available)',
      'Hydrate well — aim for 3L+ water',
      'Prioritise 7-8 hours of sleep tonight',
    ],
    lowExercises: [
      'Gentle stretching — 10 min',
      'Deep breathing exercises — 5 min',
      'Rest and recover',
    ],
  },
];

function getIntensityLevel(checkIn: CheckInData): string {
  if (checkIn.mind === 'heavy' || (checkIn.sleep === 'poor' && checkIn.energy === 'low')) return 'low';
  if (checkIn.energy === 'high' && checkIn.sleep === 'rested') return 'high';
  return 'moderate';
}

function getWalkTarget(goal: string, intensity: string): { km: number; note: string } {
  let km: number;
  if (intensity === 'low') {
    km = 3;
  } else if (intensity === 'high') {
    km = goal === 'lose_weight' || goal === 'fat_loss' ? 7 : 6;
  } else {
    km = 5;
  }
  const notes: Record<string, string> = {
    lose_weight: `Walking ${km} km daily creates a steady calorie deficit without stressing your body.`,
    fat_loss: `A ${km} km walk keeps your fat-burning zone active while preserving muscle.`,
    build_muscle: `${km} km walk aids recovery and keeps your metabolism active.`,
    stay_fit: `${km} km daily walk maintains cardiovascular health and keeps you energised.`,
    build_consistency: `Start with ${km} km — consistency beats intensity every time.`,
  };
  return { km, note: notes[goal] || `Walk ${km} km at a comfortable pace today.` };
}

// Workout categories (excluding rest day entry from WEEKLY_SPLIT)
const EXERCISE_SPLITS = WEEKLY_SPLIT.filter(s => s.category !== 'rest');

// Get two rotating exercise options that change each day
function getRotatingPair(): [DaySplit, DaySplit] {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const idx1 = dayOfYear % EXERCISE_SPLITS.length;
  const idx2 = (dayOfYear + 1) % EXERCISE_SPLITS.length;
  return [EXERCISE_SPLITS[idx1], EXERCISE_SPLITS[idx2]];
}

function buildWalkOption(walkTarget: { km: number; note: string }): WorkoutOption {
  return {
    category: 'walk', emoji: '🚶', title: `Daily Walk — ${walkTarget.km} km`,
    description: walkTarget.note,
    duration: `~${Math.round(walkTarget.km * 12)} min`,
  };
}

const REST_OPTION: WorkoutOption = {
  category: 'rest', emoji: '😌', title: 'Rest Today',
  description: 'Not feeling it? Rest is progress too. Stretch, hydrate, recover.',
  duration: '—',
  exercises: ['Light stretching — 10 min', 'Deep breathing — 5 min', 'Hydrate well'],
};

// Check-in adaptive logic
export function getWorkoutSuggestion(checkIn: CheckInData, goal: string = 'stay_fit'): WorkoutPlan {
  const intensity = getIntensityLevel(checkIn);
  const walkTarget = getWalkTarget(goal, intensity);
  const walkOption = buildWalkOption(walkTarget);
  const [splitA, splitB] = getRotatingPair();

  // Heavy mind → walk only + rest
  if (checkIn.mind === 'heavy') {
    return {
      message: "Let's keep it gentle today. A walk is your workout.",
      dayLabel: 'Light Day',
      walk: walkOption,
      exerciseOptions: [],
      restOption: REST_OPTION,
      walkTarget,
    };
  }

  const buildExerciseOption = (split: DaySplit): WorkoutOption => ({
    category: split.category,
    emoji: split.emoji,
    title: split.title,
    description: split.description,
    duration: split.duration,
    exercises: intensity === 'low' ? split.lowExercises : split.exercises,
  });

  const messages: Record<string, string> = {
    low: 'Take it easy today — lighter version of your workout.',
    moderate: "You've got good energy. Let's hit today's workout.",
    high: "You're fired up — give it your all today!",
  };

  return {
    message: messages[intensity] || messages.moderate,
    dayLabel: `${splitA.title} or ${splitB.title}`,
    walk: walkOption,
    exerciseOptions: [buildExerciseOption(splitA), buildExerciseOption(splitB)],
    restOption: REST_OPTION,
    walkTarget,
  };
}

export function getInsightLine(checkIn: CheckInData): string {
  if (checkIn.mind === 'heavy') return "Let's protect your energy today. Small actions only.";
  if (checkIn.energy === 'low' && checkIn.sleep === 'poor') return "Let's keep today light and steady.";
  if (checkIn.energy === 'high' && checkIn.sleep === 'rested') return "You've got good energy today — let's use it well.";
  return "A calm, consistent day is a good day.";
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}.`;
  if (hour < 17) return `Good afternoon, ${name}.`;
  return `Good evening, ${name}.`;
}

// Recipe data
export interface Macros {
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
}

export interface Portion {
  item: string;
  grams: number;
  unit?: string; // e.g. "1 cup cooked" as a friendly reference
}

export interface Recipe {
  name: string;
  kcal: number;
  prepTime: string;
  steps: string[];
  why: string;
  tags: string[];
  macros?: Macros;
  portions?: Portion[];
}

// Estimate balanced macros from kcal based on meal type
function estimateMacros(kcal: number, mealType?: string): Macros {
  let carbPct = 0.50, protPct = 0.25, fatPct = 0.25;
  if (mealType === 'snacks') { carbPct = 0.45; protPct = 0.20; fatPct = 0.35; }
  if (mealType === 'breakfast') { carbPct = 0.55; protPct = 0.20; fatPct = 0.25; }

  const carbs = Math.round((kcal * carbPct) / 4);
  const protein = Math.round((kcal * protPct) / 4);
  const fat = Math.round((kcal * fatPct) / 9);
  const fiber = Math.round(kcal / 100 * 3);

  return { carbs, protein, fat, fiber };
}

// Calorie density per 100g cooked for common Indian ingredients
const KCAL_PER_100G: Record<string, number> = {
  rice: 130, chawal: 130, 'steamed rice': 130, 'basmati rice': 130,
  roti: 240, chapati: 240, paratha: 260,
  dal: 120, 'toor dal': 120, 'moong dal': 105, 'moong': 105,
  rajma: 125, chole: 160, chickpeas: 160,
  paneer: 265, egg: 155,
  chicken: 195, 'chicken breast': 165, fish: 140, keema: 210,
  poha: 110, oats: 68, rava: 340, idli: 130, dosa: 165, bread: 265, 'brown bread': 245,
  ghee: 900, butter: 717, oil: 884,
  milk: 60, curd: 60, 'peanut butter': 588,
  potato: 77, aloo: 77, spinach: 23, palak: 23, capsicum: 20, onion: 40, tomato: 18, cucumber: 15,
  banana: 89, fruits: 50, peanuts: 567, almonds: 579, nuts: 570, sprouts: 100, makhana: 350,
  murmura: 390, maggi: 390, 'soy sauce': 53, pickle: 150,
  coconut: 354, 'mint chutney': 20, 'green chutney': 20,
};

// Map recipe names → their key ingredients with rough kcal share weights
const RECIPE_PORTIONS: Record<string, { item: string; tag: string; share: number; unit?: string }[]> = {
  'Rajma Chawal': [
    { item: 'Rajma (cooked)', tag: 'rajma', share: 0.45, unit: 'bowl' },
    { item: 'Chawal (cooked)', tag: 'rice', share: 0.45, unit: 'bowl' },
    { item: 'Oil/Ghee', tag: 'ghee', share: 0.10 },
  ],
  'Dal Tadka with Rice': [
    { item: 'Toor Dal (cooked)', tag: 'dal', share: 0.40, unit: 'bowl' },
    { item: 'Rice (cooked)', tag: 'rice', share: 0.45, unit: 'bowl' },
    { item: 'Ghee (tadka)', tag: 'ghee', share: 0.15 },
  ],
  'Palak Paneer with Roti': [
    { item: 'Paneer', tag: 'paneer', share: 0.35 },
    { item: 'Palak (cooked)', tag: 'palak', share: 0.10 },
    { item: 'Roti', tag: 'roti', share: 0.45, unit: 'pieces' },
    { item: 'Oil/Ghee', tag: 'ghee', share: 0.10 },
  ],
  'Chole with Rice': [
    { item: 'Chole (cooked)', tag: 'chole', share: 0.45, unit: 'bowl' },
    { item: 'Rice (cooked)', tag: 'rice', share: 0.45, unit: 'bowl' },
    { item: 'Oil', tag: 'ghee', share: 0.10 },
  ],
  'Chicken Curry with Rice': [
    { item: 'Chicken (cooked)', tag: 'chicken', share: 0.40 },
    { item: 'Rice (cooked)', tag: 'rice', share: 0.45, unit: 'bowl' },
    { item: 'Oil/Ghee', tag: 'ghee', share: 0.15 },
  ],
  'Egg Curry with Rice': [
    { item: 'Eggs', tag: 'egg', share: 0.40, unit: 'nos' },
    { item: 'Rice (cooked)', tag: 'rice', share: 0.45, unit: 'bowl' },
    { item: 'Oil', tag: 'ghee', share: 0.15 },
  ],
  'Poha with Peanuts': [
    { item: 'Poha (cooked)', tag: 'poha', share: 0.70, unit: 'bowl' },
    { item: 'Peanuts', tag: 'peanuts', share: 0.20 },
    { item: 'Oil', tag: 'ghee', share: 0.10 },
  ],
  'Khichdi with Ghee': [
    { item: 'Rice+Dal (cooked)', tag: 'rice', share: 0.80, unit: 'bowl' },
    { item: 'Ghee', tag: 'ghee', share: 0.20 },
  ],
  'Masala Egg Bhurji': [
    { item: 'Eggs', tag: 'egg', share: 0.55, unit: 'nos' },
    { item: 'Roti/Toast', tag: 'roti', share: 0.35, unit: 'pieces' },
    { item: 'Oil', tag: 'ghee', share: 0.10 },
  ],
  'Banana Oat Porridge': [
    { item: 'Oats (dry)', tag: 'oats', share: 0.50 },
    { item: 'Banana', tag: 'banana', share: 0.30, unit: 'medium' },
    { item: 'Milk', tag: 'milk', share: 0.20 },
  ],
};

function estimatePortions(recipe: Recipe, targetKcal: number): Portion[] {
  const known = RECIPE_PORTIONS[recipe.name];
  if (known) {
    return known.map(p => {
      const kcalShare = targetKcal * p.share;
      const density = KCAL_PER_100G[p.tag] || 150;
      const grams = Math.round(kcalShare / density * 100);
      return { item: p.item, grams, unit: p.unit };
    });
  }
  // Fallback: use tags to generate rough portions
  const tags = recipe.tags.filter(t => KCAL_PER_100G[t]);
  if (tags.length === 0) return [];
  const share = 1 / tags.length;
  return tags.map(tag => {
    const kcalShare = targetKcal * share;
    const density = KCAL_PER_100G[tag] || 150;
    const grams = Math.round(kcalShare / density * 100);
    return { item: tag.charAt(0).toUpperCase() + tag.slice(1), grams };
  });
}
export interface MealSlot {
  label: string;
  emoji: string;
  targetKcal: number;
  options: [Recipe, Recipe];
}

// Calorie distribution by goal (% of target: breakfast, lunch, snacks, dinner)
const CALORIE_SPLITS: Record<string, [number, number, number, number]> = {
  lose_weight:       [0.25, 0.35, 0.10, 0.30],
  fat_loss:          [0.25, 0.30, 0.15, 0.30],
  stay_fit:          [0.25, 0.30, 0.15, 0.30],
  build_consistency: [0.25, 0.30, 0.15, 0.30],
  build_muscle:      [0.20, 0.30, 0.20, 0.30],
};

type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

const MEAL_RECIPES: Record<MealType, Record<DietPreference, Recipe[]>> = {
  breakfast: {
    vegetarian: [
      { name: 'Poha with Peanuts', kcal: 320, prepTime: '10 min', steps: ['Wash and drain flattened rice', 'Fry mustard seeds, onions, chilli', 'Toss in poha with turmeric and peanuts', 'Squeeze lime, serve'], why: 'Light yet balanced — everyday Indian breakfast', tags: ['poha', 'peanuts', 'onion'] },
      { name: 'Banana Oat Porridge', kcal: 300, prepTime: '7 min', steps: ['Cook oats in milk until creamy', 'Slice banana on top', 'Add honey if you like'], why: 'Simple, filling, and nutritious', tags: ['oats', 'banana', 'milk'] },
      { name: 'Upma', kcal: 290, prepTime: '10 min', steps: ['Roast rava, set aside', 'Temper mustard, curry leaves, onion', 'Add water, then rava, stir till done'], why: 'Quick, filling, everyday staple', tags: ['rava', 'onion'] },
      { name: 'Idli with Chutney', kcal: 250, prepTime: '5 min', steps: ['Steam idli batter in moulds', 'Serve with coconut chutney', 'Add sambhar on the side'], why: 'Fermented, light on stomach, great digestion', tags: ['idli', 'coconut'] },
      { name: 'Peanut Butter Toast', kcal: 320, prepTime: '3 min', steps: ['Toast 2 slices of bread', 'Spread peanut butter', 'Slice banana on top'], why: 'Zero cooking, high energy start', tags: ['bread', 'peanut butter', 'banana'] },
      { name: 'Moong Dal Cheela', kcal: 250, prepTime: '12 min', steps: ['Blend soaked moong dal into batter', 'Pour thin on hot pan like dosa', 'Fill with paneer or veggies', 'Serve with green chutney'], why: 'Protein-packed, no flour', tags: ['moong', 'dal', 'paneer'] },
    ],
    eggitarian: [
      { name: 'Masala Egg Bhurji', kcal: 320, prepTime: '10 min', steps: ['Heat oil, toss in onions and tomatoes', 'Crack 3 eggs and scramble', 'Add turmeric, salt, chilli', 'Have with 1 roti or toast'], why: 'High protein, quick to make', tags: ['egg', 'onion', 'tomato', 'roti'] },
      { name: 'Bread Omelette', kcal: 350, prepTime: '5 min', steps: ['Beat 2 eggs with onion, chilli, salt', 'Cook omelette, place on toast', 'Add ketchup or chutney'], why: 'Simple, satisfying, protein-rich', tags: ['egg', 'bread', 'onion'] },
      { name: 'Egg Dosa', kcal: 290, prepTime: '8 min', steps: ['Pour dosa batter on hot tawa', 'Crack an egg on top, spread it', 'Add salt, pepper, chopped onions', 'Fold and serve with chutney'], why: 'Protein + fermented carbs', tags: ['egg', 'dosa', 'onion'] },
      { name: 'Banana Oat Porridge', kcal: 300, prepTime: '7 min', steps: ['Cook oats in milk', 'Slice banana, drizzle honey'], why: 'Simple and nutritious', tags: ['oats', 'banana', 'milk'] },
      { name: 'Boiled Eggs + Toast', kcal: 280, prepTime: '8 min', steps: ['Boil 2-3 eggs', 'Toast bread, add butter', 'Sprinkle salt, pepper on eggs'], why: 'Clean protein with energy from carbs', tags: ['egg', 'bread', 'butter'] },
      { name: 'Poha with Peanuts', kcal: 320, prepTime: '10 min', steps: ['Wash poha, fry with mustard seeds', 'Add onions, turmeric, peanuts', 'Squeeze lime, serve'], why: 'Light and balanced', tags: ['poha', 'peanuts', 'onion'] },
    ],
    non_vegetarian: [
      { name: 'Masala Egg Bhurji', kcal: 320, prepTime: '10 min', steps: ['Heat oil, toss in onions and tomatoes', 'Crack 3 eggs and scramble', 'Add turmeric, salt, chilli', 'Have with roti or toast'], why: 'High protein start to the day', tags: ['egg', 'onion', 'tomato', 'roti'] },
      { name: 'Bread Omelette', kcal: 350, prepTime: '5 min', steps: ['Beat eggs, cook omelette', 'Place on toast, add ketchup'], why: 'The easiest protein meal', tags: ['egg', 'bread'] },
      { name: 'Chicken Sandwich', kcal: 380, prepTime: '10 min', steps: ['Shred leftover chicken', 'Mix with mayo, lettuce', 'Toast bread, assemble'], why: 'Protein-rich grab-and-go breakfast', tags: ['chicken', 'bread'] },
      { name: 'Banana Oat Porridge', kcal: 300, prepTime: '7 min', steps: ['Cook oats in milk', 'Top with banana, honey'], why: 'Simple, no-fuss nutrition', tags: ['oats', 'banana', 'milk'] },
      { name: 'Poha with Peanuts', kcal: 320, prepTime: '10 min', steps: ['Wash poha, fry with mustard seeds', 'Add onions, turmeric, peanuts', 'Squeeze lime'], why: 'Classic Indian breakfast', tags: ['poha', 'peanuts', 'onion'] },
      { name: 'Egg Paratha', kcal: 400, prepTime: '12 min', steps: ['Roll paratha, cook one side', 'Crack egg on uncooked side, flip', 'Cook till golden', 'Serve with curd'], why: 'Filling, protein-rich, Indian classic', tags: ['egg', 'curd'] },
    ],
  },
  lunch: {
    vegetarian: [
      { name: 'Dal Tadka with Rice', kcal: 450, prepTime: '20 min', steps: ['Cook toor dal until soft', 'Make tadka with ghee, cumin, garlic', 'Serve with rice and onion salad'], why: 'Balanced macros — protein, energy, good fats', tags: ['dal', 'rice', 'ghee', 'onion'] },
      { name: 'Rajma Chawal', kcal: 480, prepTime: '25 min', steps: ['Cook rajma in onion-tomato gravy', 'Add garam masala, ginger-garlic', 'Serve hot over steamed rice'], why: 'Complete protein from beans + rice', tags: ['rajma', 'rice', 'onion', 'tomato'] },
      { name: 'Palak Paneer with Roti', kcal: 420, prepTime: '18 min', steps: ['Blanch and blend spinach', 'Sauté paneer cubes lightly', 'Mix spinach puree with spices', 'Serve with 2 rotis'], why: 'Iron + protein, filling and nutritious', tags: ['paneer', 'spinach', 'palak', 'roti'] },
      { name: 'Chole with Rice', kcal: 460, prepTime: '22 min', steps: ['Cook chickpeas in spicy gravy', 'Add tea bag for dark colour', 'Serve with rice or bhature'], why: 'Protein-rich, satisfying Indian staple', tags: ['chole', 'chickpeas', 'rice'] },
      { name: 'Aloo Paratha with Curd', kcal: 420, prepTime: '20 min', steps: ['Make spiced potato filling', 'Stuff in wheat dough, roll out', 'Cook on tawa with ghee', 'Serve with curd'], why: 'Comfort food with balanced energy', tags: ['potato', 'aloo', 'curd', 'ghee'] },
      { name: 'Paneer Stir Fry with Roti', kcal: 400, prepTime: '15 min', steps: ['Cube paneer, chop capsicum and onions', 'Stir fry with soy sauce', 'Serve with 2 rotis'], why: 'High protein, quick to make', tags: ['paneer', 'capsicum', 'onion', 'roti'] },
    ],
    eggitarian: [
      { name: 'Egg Curry with Rice', kcal: 450, prepTime: '18 min', steps: ['Boil eggs, halve them', 'Make onion-tomato gravy', 'Simmer eggs in gravy', 'Serve with steamed rice'], why: 'Protein-rich, satisfying and homely', tags: ['egg', 'rice', 'onion', 'tomato'] },
      { name: 'Dal Tadka with Rice', kcal: 450, prepTime: '20 min', steps: ['Cook toor dal until soft', 'Make tadka with ghee, cumin, garlic', 'Serve with rice'], why: 'Balanced macros from dal + rice', tags: ['dal', 'rice', 'ghee'] },
      { name: 'Egg Fried Rice', kcal: 420, prepTime: '12 min', steps: ['Scramble 2 eggs, keep aside', 'Fry leftover rice with veggies', 'Mix eggs back with soy sauce'], why: 'Balanced carbs and protein', tags: ['egg', 'rice'] },
      { name: 'Rajma Chawal', kcal: 480, prepTime: '25 min', steps: ['Cook rajma in onion-tomato gravy', 'Add garam masala, ginger-garlic', 'Serve with rice'], why: 'Complete protein from beans + rice', tags: ['rajma', 'rice', 'onion', 'tomato'] },
      { name: 'Paneer Stir Fry with Roti', kcal: 400, prepTime: '15 min', steps: ['Cube paneer, chop capsicum and onions', 'Stir fry with soy sauce', 'Serve with 2 rotis'], why: 'High protein, quick lunch', tags: ['paneer', 'capsicum', 'onion', 'roti'] },
      { name: 'Egg Bhurji with Roti', kcal: 380, prepTime: '10 min', steps: ['Scramble eggs with onions, tomatoes', 'Add turmeric and green chillies', 'Serve with 2 hot rotis'], why: 'Quick protein-rich Indian lunch', tags: ['egg', 'roti', 'onion', 'tomato'] },
    ],
    non_vegetarian: [
      { name: 'Chicken Curry with Rice', kcal: 520, prepTime: '25 min', steps: ['Cook chicken in onion-tomato gravy', 'Add garam masala, turmeric', 'Simmer till tender', 'Serve with steamed rice'], why: 'Complete balanced meal', tags: ['chicken', 'rice', 'onion', 'tomato'] },
      { name: 'Keema Roti', kcal: 480, prepTime: '20 min', steps: ['Cook minced meat with onion-tomato', 'Add peas, garam masala', 'Serve with 2 rotis'], why: 'Protein-heavy comfort meal', tags: ['keema', 'roti', 'onion', 'tomato'] },
      { name: 'Fish Curry with Rice', kcal: 450, prepTime: '20 min', steps: ['Make light tomato-coconut curry', 'Simmer fish pieces in it', 'Serve with rice'], why: 'Omega-3 rich, nourishing', tags: ['fish', 'rice', 'coconut', 'tomato'] },
      { name: 'Chicken Biryani', kcal: 580, prepTime: '30 min', steps: ['Marinate chicken in yogurt+spices', 'Layer with basmati rice', 'Dum cook for 20 min'], why: 'Calorie-dense, protein-rich', tags: ['chicken', 'rice', 'curd'] },
      { name: 'Dal with Chicken Fry + Rice', kcal: 500, prepTime: '25 min', steps: ['Cook dal, make tadka', 'Pan fry chicken pieces with spices', 'Serve both with rice'], why: 'Balanced protein from multiple sources', tags: ['dal', 'chicken', 'rice'] },
      { name: 'Egg Curry with Rice', kcal: 450, prepTime: '18 min', steps: ['Boil eggs, halve them', 'Make gravy, simmer eggs', 'Serve with rice'], why: 'Quick, protein-rich lunch', tags: ['egg', 'rice', 'onion', 'tomato'] },
    ],
  },
  snacks: {
    vegetarian: [
      { name: 'Sprouts Chaat', kcal: 180, prepTime: '5 min', steps: ['Mix boiled sprouts with onion, tomato', 'Add lemon, chaat masala, coriander', 'Crunchy, fresh, and filling'], why: 'High fiber, high protein, low calorie', tags: ['sprouts', 'onion', 'tomato'] },
      { name: 'Cucumber Raita Bowl', kcal: 120, prepTime: '3 min', steps: ['Grate cucumber into thick curd', 'Add roasted cumin, salt, mint', 'Refreshing and light'], why: 'Very low calorie, cooling', tags: ['cucumber', 'curd'] },
      { name: 'Roasted Makhana', kcal: 150, prepTime: '5 min', steps: ['Dry roast makhana in a pan', 'Add salt, pepper, chaat masala', 'Munch anytime'], why: 'Light, crunchy, guilt-free snacking', tags: ['makhana'] },
      { name: 'Fruit Bowl with Nuts', kcal: 200, prepTime: '3 min', steps: ['Chop seasonal fruits', 'Top with a few almonds or walnuts', 'Drizzle honey if needed'], why: 'Natural sugars with healthy fats', tags: ['fruits', 'almonds', 'nuts'] },
      { name: 'Brown Bread Paneer Sandwich', kcal: 280, prepTime: '8 min', steps: ['Crumble paneer with green chutney', 'Add cucumber, onion slices', 'Toast brown bread, assemble'], why: 'Complex carbs with protein', tags: ['brown bread', 'bread', 'paneer', 'cucumber', 'onion'] },
      { name: 'Masala Buttermilk + Murmura', kcal: 160, prepTime: '3 min', steps: ['Blend curd with water, salt, cumin', 'Have with a bowl of puffed rice', 'Light and refreshing'], why: 'Probiotic, hydrating, fills you up', tags: ['curd', 'murmura'] },
    ],
    eggitarian: [
      { name: 'Boiled Egg Salad', kcal: 180, prepTime: '8 min', steps: ['Boil 2 eggs, halve them', 'Toss with cucumber, onion, tomato', 'Add lemon, salt, chaat masala'], why: 'Pure protein snack', tags: ['egg', 'cucumber', 'onion', 'tomato'] },
      { name: 'Egg Maggi', kcal: 350, prepTime: '8 min', steps: ['Cook maggi as usual', 'Crack an egg while cooking', 'Stir and serve hot'], why: 'Comfort snack with protein boost', tags: ['egg', 'maggi'] },
      { name: 'Sprouts Chaat', kcal: 180, prepTime: '5 min', steps: ['Mix boiled sprouts with onion, tomato', 'Add lemon, chaat masala'], why: 'High fiber, filling', tags: ['sprouts', 'onion', 'tomato'] },
      { name: 'Roasted Makhana', kcal: 150, prepTime: '5 min', steps: ['Dry roast in pan', 'Add salt, pepper, chaat masala'], why: 'Guilt-free crunchy snack', tags: ['makhana'] },
      { name: 'Fruit Bowl with Nuts', kcal: 200, prepTime: '3 min', steps: ['Chop fruits, add nuts', 'Drizzle honey'], why: 'Natural energy boost', tags: ['fruits', 'nuts'] },
      { name: 'Egg Sandwich', kcal: 300, prepTime: '8 min', steps: ['Make quick egg bhurji', 'Toast bread, assemble sandwich', 'Add ketchup or chutney'], why: 'Filling snack with protein', tags: ['egg', 'bread'] },
    ],
    non_vegetarian: [
      { name: 'Chicken Tikka (3 pcs)', kcal: 200, prepTime: '15 min', steps: ['Marinate chicken in curd+spices', 'Grill or pan-fry', 'Serve with mint chutney'], why: 'Lean protein snack', tags: ['chicken', 'curd'] },
      { name: 'Boiled Egg Salad', kcal: 180, prepTime: '8 min', steps: ['Boil 2 eggs, halve them', 'Toss with cucumber, onion', 'Add lemon, chaat masala'], why: 'Pure protein snack', tags: ['egg', 'cucumber', 'onion'] },
      { name: 'Sprouts Chaat', kcal: 180, prepTime: '5 min', steps: ['Mix sprouts with onion, tomato', 'Add lemon, chaat masala'], why: 'Light and filling', tags: ['sprouts', 'onion', 'tomato'] },
      { name: 'Roasted Makhana', kcal: 150, prepTime: '5 min', steps: ['Dry roast, add seasoning'], why: 'Guilt-free munching', tags: ['makhana'] },
      { name: 'Chicken Maggi', kcal: 380, prepTime: '12 min', steps: ['Shred leftover chicken', 'Cook maggi, add chicken', 'Add chilli sauce'], why: 'Comfort + protein', tags: ['chicken', 'maggi'] },
      { name: 'Fish Fingers (baked)', kcal: 220, prepTime: '15 min', steps: ['Coat fish strips in spiced rava', 'Bake or shallow fry', 'Serve with lemon'], why: 'Omega-3 rich protein snack', tags: ['fish', 'rava'] },
    ],
  },
  dinner: {
    vegetarian: [
      { name: 'Curd Rice', kcal: 280, prepTime: '5 min', steps: ['Mix leftover rice with fresh curd', 'Add salt, mustard seeds', 'Top with pickle on the side'], why: 'Easy on digestion, perfect for night', tags: ['rice', 'curd', 'pickle'] },
      { name: 'Khichdi with Ghee', kcal: 350, prepTime: '18 min', steps: ['Cook rice and moong dal together', 'Add turmeric, salt', 'Top with ghee and pickle'], why: 'Light, easy to digest, Indian comfort food', tags: ['rice', 'dal', 'moong', 'ghee'] },
      { name: 'Roti with Mixed Veg', kcal: 380, prepTime: '20 min', steps: ['Chop seasonal veggies', 'Cook in light masala gravy', 'Serve with 2 rotis'], why: 'Fiber-rich, light on stomach', tags: ['roti', 'vegetables'] },
      { name: 'Palak Dal with Rice', kcal: 400, prepTime: '20 min', steps: ['Cook dal with chopped spinach', 'Make light tadka', 'Serve with small rice portion'], why: 'Iron + protein, light dinner', tags: ['dal', 'spinach', 'palak', 'rice'] },
      { name: 'Paneer Tikka with Salad', kcal: 320, prepTime: '15 min', steps: ['Marinate paneer in curd+spices', 'Grill or pan-fry', 'Serve with onion-cucumber salad'], why: 'High protein, low carb dinner', tags: ['paneer', 'curd', 'cucumber', 'onion'] },
      { name: 'Moong Dal Soup', kcal: 200, prepTime: '15 min', steps: ['Cook moong dal till mushy', 'Blend with turmeric, garlic', 'Add lemon, serve hot'], why: 'Ultra-light, easy to digest', tags: ['moong', 'dal'] },
    ],
    eggitarian: [
      { name: 'Egg Curry with Roti', kcal: 400, prepTime: '15 min', steps: ['Boil eggs, halve them', 'Make light onion-tomato gravy', 'Simmer eggs, serve with 2 rotis'], why: 'Protein-rich, homely dinner', tags: ['egg', 'roti', 'onion', 'tomato'] },
      { name: 'Curd Rice', kcal: 280, prepTime: '5 min', steps: ['Mix rice with curd', 'Add salt, temper with mustard', 'Simple and comforting'], why: 'Light on stomach, aids sleep', tags: ['rice', 'curd'] },
      { name: 'Khichdi with Ghee', kcal: 350, prepTime: '18 min', steps: ['Cook rice and dal together', 'Add turmeric, top with ghee'], why: 'Comfort food, easy to digest', tags: ['rice', 'dal', 'ghee'] },
      { name: 'Boiled Egg + Roti + Dal', kcal: 420, prepTime: '20 min', steps: ['Boil 2 eggs', 'Make simple dal tadka', 'Serve with 2 rotis'], why: 'Complete balanced dinner', tags: ['egg', 'roti', 'dal'] },
      { name: 'Egg Drop Soup + Toast', kcal: 250, prepTime: '10 min', steps: ['Boil water with garlic, ginger', 'Crack eggs in, stir gently', 'Season and serve with toast'], why: 'Ultra-light protein dinner', tags: ['egg', 'bread'] },
      { name: 'Paneer Tikka with Salad', kcal: 320, prepTime: '15 min', steps: ['Grill marinated paneer', 'Serve with cucumber-onion salad'], why: 'High protein, low carb', tags: ['paneer', 'curd', 'cucumber'] },
    ],
    non_vegetarian: [
      { name: 'Grilled Chicken with Salad', kcal: 380, prepTime: '18 min', steps: ['Season chicken breast, grill', 'Make fresh cucumber-onion salad', 'Serve together, squeeze lemon'], why: 'Lean protein, low carb — ideal dinner', tags: ['chicken', 'cucumber', 'onion'] },
      { name: 'Fish Curry with Rice', kcal: 420, prepTime: '20 min', steps: ['Make light tomato-coconut curry', 'Simmer fish pieces', 'Serve with small rice portion'], why: 'Omega-3 rich, light on stomach', tags: ['fish', 'rice', 'tomato'] },
      { name: 'Chicken Soup', kcal: 250, prepTime: '20 min', steps: ['Simmer chicken with garlic, ginger', 'Add veggies, season well', 'Strain or serve chunky'], why: 'Warm, light, healing dinner', tags: ['chicken'] },
      { name: 'Egg Curry with Roti', kcal: 400, prepTime: '15 min', steps: ['Boil eggs, make gravy', 'Simmer eggs in gravy', 'Serve with 2 rotis'], why: 'Protein-rich, homely', tags: ['egg', 'roti', 'onion', 'tomato'] },
      { name: 'Khichdi with Ghee', kcal: 350, prepTime: '18 min', steps: ['Cook rice + dal together', 'Top with ghee, serve with pickle'], why: 'Light comfort food for the night', tags: ['rice', 'dal', 'ghee'] },
      { name: 'Keema with Roti', kcal: 450, prepTime: '20 min', steps: ['Cook minced meat in light gravy', 'Add peas, garam masala', 'Serve with 2 rotis'], why: 'Protein-dense, filling dinner', tags: ['keema', 'roti', 'onion'] },
    ],
  },
};

function parseIngredients(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function scoreRecipe(recipe: Recipe, ingredients: string[]): number {
  if (ingredients.length === 0) return 0;
  const matchCount = recipe.tags.filter((tag) =>
    ingredients.some((ing) => ing.includes(tag) || tag.includes(ing))
  ).length;
  // Heavy bonus for recipes where most tags match user's grocery
  const coverageBonus = matchCount >= recipe.tags.length - 1 ? 5 : 0;
  return matchCount * 3 + coverageBonus;
}

function pickBestTwo(pool: Recipe[], targetKcal: number, ingredients: string[], mealType?: string, usedRecipes?: string[]): [Recipe, Recipe] {
  // Filter out recently used recipes if possible
  const used = new Set(usedRecipes || []);
  const fresh = pool.filter(r => !used.has(r.name));
  const candidates = fresh.length >= 2 ? fresh : pool;

  const scored = candidates.map((r) => ({
    recipe: r,
    ingScore: scoreRecipe(r, ingredients),
    kcalDiff: Math.abs(r.kcal - targetKcal),
  }));
  scored.sort((a, b) => {
    if (b.ingScore !== a.ingScore) return b.ingScore - a.ingScore;
    return a.kcalDiff - b.kcalDiff;
  });
  const first = scored[0];
  const second = scored.find((s) => s.recipe.name !== first.recipe.name) || scored[1];
  const macros = estimateMacros(targetKcal, mealType);
  const r1 = { ...first.recipe, kcal: targetKcal, macros, portions: estimatePortions(first.recipe, targetKcal) };
  const r2 = { ...second.recipe, kcal: targetKcal, macros, portions: estimatePortions(second.recipe, targetKcal) };
  return [r1, r2];
}

export function getRecipeSuggestions(goal: string, dietPreferences: DietPreference[] | undefined, targetCalories: number, kitchenInput?: string, usedRecipes?: string[]): MealSlot[] {
  const splits = CALORIE_SPLITS[goal] || CALORIE_SPLITS.stay_fit;
  const ingredients = kitchenInput ? parseIngredients(kitchenInput) : [];
  const safeDietPrefs = Array.isArray(dietPreferences) ? dietPreferences : [];
  const prefs = safeDietPrefs.length > 0 ? safeDietPrefs : ['vegetarian' as DietPreference];

  const mealTypes: { type: MealType; label: string; emoji: string }[] = [
    { type: 'breakfast', label: 'Breakfast', emoji: '\uD83C\uDF05' },
    { type: 'lunch', label: 'Lunch', emoji: '\u2600\uFE0F' },
    { type: 'snacks', label: 'Snacks', emoji: '\uD83C\uDF7F' },
    { type: 'dinner', label: 'Dinner', emoji: '\uD83C\uDF19' },
  ];

  return mealTypes.map((meal, i) => {
    const targetKcal = Math.round(targetCalories * splits[i]);
    const seen = new Set<string>();
    const pool: Recipe[] = [];
    for (const pref of prefs) {
      const recipes = MEAL_RECIPES[meal.type][pref] || [];
      for (const r of recipes) {
        if (!seen.has(r.name)) {
          seen.add(r.name);
          pool.push(r);
        }
      }
    }
    const options = pickBestTwo(pool.length >= 2 ? pool : [...MEAL_RECIPES[meal.type].vegetarian], targetKcal, ingredients, meal.type, usedRecipes);
    return {
      label: meal.label,
      emoji: meal.emoji,
      targetKcal,
      options,
    };
  });
}

export const GOAL_OPTIONS = [
  { id: 'lose_weight', emoji: '🎯', title: 'Weight loss', description: 'Reduce overall body weight gradually' },
  { id: 'fat_loss', emoji: '🔥', title: 'Fat loss', description: 'Burn fat while preserving muscle' },
  { id: 'stay_fit', emoji: '✨', title: 'Stay fit', description: 'Keep current weight, improve energy' },
  { id: 'build_consistency', emoji: '🧱', title: 'Build consistency', description: 'Start small, stay consistent' },
  { id: 'build_muscle', emoji: '💪', title: 'Build muscle', description: 'Increase lean mass and strength' },
];

export const ACTIVITY_OPTIONS = [
  { id: 'sedentary', title: 'Sedentary', description: 'Desk job, little or no exercise' },
  { id: 'lightly_active', title: 'Lightly active', description: 'Exercise 1-3 days/week' },
  { id: 'moderately_active', title: 'Moderately active', description: 'Exercise 3-5 days/week' },
  { id: 'very_active', title: 'Very active', description: 'Hard exercise 6-7 days/week' },
  { id: 'extra_active', title: 'Extra active', description: 'Athlete or physical job + training' },
];
