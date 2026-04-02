// Types
export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  goal: string;
  activityLevel: string;
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

export function calculateTargetCalories(tdee: number, goal: string): number {
  switch (goal) {
    case 'lose_weight': return tdee - 500;
    case 'fat_loss': return tdee - 300;
    case 'stay_fit': return tdee;
    case 'build_consistency': return tdee;
    case 'build_muscle': return tdee + 300;
    default: return tdee;
  }
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

export function getGoalAdjustmentLabel(goal: string): string {
  switch (goal) {
    case 'lose_weight': return '−500 kcal deficit';
    case 'fat_loss': return '−300 kcal deficit';
    case 'stay_fit': return 'No adjustment';
    case 'build_consistency': return 'No adjustment';
    case 'build_muscle': return '+300 kcal surplus';
    default: return 'No adjustment';
  }
}

export function getDynamicCopy(goal: string, tdee: number): string {
  switch (goal) {
    case 'lose_weight': return `To stay on track, your body needs around ${tdee} kcal/day. We'll guide you slightly below this to support steady weight loss.`;
    case 'fat_loss': return `Your maintenance is ${tdee} kcal/day. A moderate deficit helps burn fat while keeping your muscle intact.`;
    case 'stay_fit': return `Your body runs well at around ${tdee} kcal/day. We'll help you stay right there.`;
    case 'build_consistency': return `Numbers matter less right now. Your baseline is ${tdee} kcal/day — we'll keep things simple and sustainable.`;
    case 'build_muscle': return `To grow, your body needs a little more. We'll work slightly above your ${tdee} kcal/day baseline.`;
    default: return '';
  }
}

export function getGoalTip(goal: string): string {
  switch (goal) {
    case 'lose_weight': return 'A 500 cal/day deficit creates roughly 0.5kg loss per week. Focus on protein-rich, filling foods. Never go below your BMR.';
    case 'fat_loss': return 'A 300 cal deficit preserves muscle while burning fat. Add strength training 3x/week and aim for 1.6-2g protein per kg bodyweight.';
    case 'stay_fit': return 'Eat at your maintenance calories. Prioritise food quality, sleep, and daily movement. Your body will naturally improve over time.';
    case 'build_consistency': return 'Calories matter less than showing up. Move your body daily, eat close to your baseline, and track without obsessing.';
    case 'build_muscle': return 'A 300 cal surplus supports lean muscle growth. Prioritise progressive overload and 1.8-2.2g protein per kg bodyweight.';
    default: return '';
  }
}

// Workout types
export interface WorkoutOption {
  category: 'upper_body' | 'lower_body' | 'cardio' | 'walk' | 'rest';
  emoji: string;
  title: string;
  description: string;
  duration: string;
  exercises?: string[];
}

export interface WorkoutPlan {
  message: string;
  options: WorkoutOption[];
  walkTarget: { km: number; note: string };
}

// Exercise pools — unique exercises per day, with reps × sets
// Each day (0=Sun..6=Sat) has different exercises so nothing repeats in a week

const UPPER_BODY_DAILY: Record<number, string[]> = {
  0: ['Push-ups — 3 sets × 15 reps', 'Dumbbell shoulder press — 3 sets × 12 reps', 'Tricep dips — 3 sets × 12 reps', 'Plank hold — 3 sets × 45s'],
  1: ['Incline push-ups — 3 sets × 15 reps', 'Lateral raises — 3 sets × 12 reps', 'Bicep curls — 3 sets × 15 reps', 'Dead hangs — 3 sets × 30s'],
  2: ['Diamond push-ups — 3 sets × 12 reps', 'Dumbbell rows — 3 sets × 12 reps each', 'Overhead tricep extension — 3 sets × 12 reps', 'Plank to push-up — 3 sets × 10 reps'],
  3: ['Wide push-ups — 3 sets × 15 reps', 'Arnold press — 3 sets × 10 reps', 'Hammer curls — 3 sets × 12 reps', 'Superman hold — 3 sets × 30s'],
  4: ['Pike push-ups — 3 sets × 10 reps', 'Bent-over rows — 3 sets × 15 reps', 'Skull crushers — 3 sets × 12 reps', 'Side plank — 3 sets × 30s each'],
  5: ['Dumbbell bench press — 3 sets × 12 reps', 'Face pulls (band) — 3 sets × 15 reps', 'Concentration curls — 3 sets × 10 reps each', 'Hollow body hold — 3 sets × 30s'],
  6: ['Decline push-ups — 3 sets × 12 reps', 'Rear delt flyes — 3 sets × 15 reps', 'Close-grip push-ups — 3 sets × 12 reps', 'Farmer carry — 3 sets × 40s'],
};

const LOWER_BODY_DAILY: Record<number, string[]> = {
  0: ['Squats — 3 sets × 15 reps', 'Glute bridges — 3 sets × 15 reps', 'Calf raises — 3 sets × 20 reps', 'Wall sit — 3 sets × 45s'],
  1: ['Lunges — 3 sets × 12 reps each leg', 'Romanian deadlift — 3 sets × 12 reps', 'Step-ups — 3 sets × 12 reps each', 'Single-leg calf raise — 3 sets × 15 each'],
  2: ['Sumo squats — 3 sets × 15 reps', 'Hip thrusts — 3 sets × 15 reps', 'Side lunges — 3 sets × 12 each', 'Seated calf raise — 3 sets × 20 reps'],
  3: ['Bulgarian split squats — 3 sets × 10 reps each', 'Good mornings — 3 sets × 12 reps', 'Donkey kicks — 3 sets × 15 each', 'Goblet squat — 3 sets × 12 reps'],
  4: ['Jump squats — 3 sets × 12 reps', 'Single-leg deadlift — 3 sets × 10 each', 'Curtsy lunges — 3 sets × 12 each', 'Isometric squat hold — 3 sets × 40s'],
  5: ['Pistol squat progression — 3 sets × 8 each', 'Sumo deadlift — 3 sets × 12 reps', 'Fire hydrants — 3 sets × 15 each', 'Box jumps — 3 sets × 10 reps'],
  6: ['Reverse lunges — 3 sets × 12 each', 'Frog pumps — 3 sets × 20 reps', 'Standing calf raise — 3 sets × 20 reps', 'Squat pulse — 3 sets × 15 reps'],
};

const CARDIO_DAILY: Record<number, string[]> = {
  0: ['Jumping jacks — 3 sets × 1 min', 'High knees — 3 sets × 45s', 'Mountain climbers — 3 sets × 45s', 'Rest 30s between sets'],
  1: ['Burpees — 3 sets × 10 reps', 'Squat jumps — 3 sets × 12 reps', 'Skaters — 3 sets × 1 min', 'Rest 30s between sets'],
  2: ['Star jumps — 3 sets × 15 reps', 'Tuck jumps — 3 sets × 10 reps', 'Sprint in place — 3 sets × 45s', 'Rest 30s between sets'],
  3: ['Lateral shuffles — 3 sets × 1 min', 'Plank jacks — 3 sets × 15 reps', 'Speed skips — 3 sets × 1 min', 'Rest 30s between sets'],
  4: ['Box step-ups (fast) — 3 sets × 1 min', 'Bicycle crunches — 3 sets × 20 reps', 'Butt kicks — 3 sets × 45s', 'Rest 30s between sets'],
  5: ['Broad jumps — 3 sets × 8 reps', 'Cross-body mountain climbers — 3 sets × 45s', 'Power skips — 3 sets × 1 min', 'Rest 30s between sets'],
  6: ['Shadow boxing — 3 sets × 1 min', 'Lunge jumps — 3 sets × 10 each', 'Bear crawl — 3 sets × 30s', 'Rest 30s between sets'],
};

// Low intensity versions (shorter, fewer sets)
const UPPER_LOW_DAILY: Record<number, string[]> = {
  0: ['Wall push-ups — 2 sets × 12 reps', 'Arm circles — 2 sets × 30s each direction', 'Light band pull-aparts — 2 sets × 12 reps'],
  1: ['Incline push-ups (table) — 2 sets × 10 reps', 'Shoulder shrugs — 2 sets × 15 reps', 'Wrist circles — 2 sets × 30s'],
  2: ['Seated press (light) — 2 sets × 10 reps', 'Light bicep curls — 2 sets × 12 reps', 'Cat-cow stretch — 2 sets × 10 reps'],
  3: ['Wall push-ups — 2 sets × 15 reps', 'Band rows — 2 sets × 12 reps', 'Neck stretches — hold 30s each side'],
  4: ['Light lateral raises — 2 sets × 10 reps', 'Doorframe stretch — hold 30s each side', 'Gentle plank — 2 sets × 20s'],
  5: ['Arm swings — 2 sets × 1 min', 'Light overhead press — 2 sets × 10 reps', 'Chest opener stretch — hold 30s'],
  6: ['Slow push-ups — 2 sets × 8 reps', 'Light rows — 2 sets × 10 reps', 'Shoulder rolls — 2 sets × 30s'],
};

const LOWER_LOW_DAILY: Record<number, string[]> = {
  0: ['Bodyweight squats — 2 sets × 12 reps', 'Calf raises — 2 sets × 15 reps', 'Glute bridges — 2 sets × 12 reps'],
  1: ['Standing leg lifts — 2 sets × 10 each', 'Gentle lunges — 2 sets × 8 each', 'Ankle circles — 2 sets × 15 each'],
  2: ['Chair squats — 2 sets × 10 reps', 'Side-lying leg lifts — 2 sets × 12 each', 'Seated calf raise — 2 sets × 15 reps'],
  3: ['Wall sit — 2 sets × 30s', 'Hip circles — 2 sets × 10 each direction', 'Gentle step-ups — 2 sets × 10 each'],
  4: ['Sumo squats (slow) — 2 sets × 10 reps', 'Donkey kicks — 2 sets × 12 each', 'Toe touches — 2 sets × 15 reps'],
  5: ['Reverse lunges — 2 sets × 8 each', 'Glute bridge hold — 2 sets × 30s', 'Calf stretch — hold 30s each'],
  6: ['Bodyweight squats — 2 sets × 10 reps', 'Standing hamstring curl — 2 sets × 12 each', 'Hip flexor stretch — hold 30s each'],
};

const CARDIO_LOW_DAILY: Record<number, string[]> = {
  0: ['Marching in place — 2 sets × 2 min', 'Step touch — 2 sets × 2 min', 'Gentle arm swings — 2 sets × 1 min'],
  1: ['Slow jumping jacks — 2 sets × 1 min', 'Side steps — 2 sets × 2 min', 'Seated marching — 2 sets × 2 min'],
  2: ['Walking in place — 2 sets × 3 min', 'Gentle high knees — 2 sets × 1 min', 'Torso twists — 2 sets × 1 min'],
  3: ['Step side-to-side — 2 sets × 2 min', 'Light skipping — 2 sets × 1 min', 'Deep breathing walk — 3 min'],
  4: ['Slow marching — 2 sets × 3 min', 'Arm circles + walk — 2 min', 'Gentle step-ups — 2 sets × 1 min'],
  5: ['Dancing in place — 2 sets × 2 min', 'Easy speed walk — 3 min', 'Cool-down stretches — 2 min'],
  6: ['Leisurely walk in place — 5 min', 'Gentle toe taps — 2 sets × 1 min', 'Deep breathing — 2 min'],
};

function getIntensityLevel(checkIn: CheckInData): string {
  if (checkIn.mind === 'heavy' || (checkIn.sleep === 'poor' && checkIn.energy === 'low')) return 'low';
  if (checkIn.energy === 'high' && checkIn.sleep === 'rested') return 'high';
  return 'moderate';
}

function getWalkTarget(goal: string, intensity: string): { km: number; note: string } {
  const base = goal === 'lose_weight' || goal === 'fat_loss' ? 5 : goal === 'build_muscle' ? 3 : 4;
  const multiplier = intensity === 'low' ? 0.6 : intensity === 'high' ? 1.2 : 1;
  const km = Math.round(base * multiplier * 10) / 10;
  const notes: Record<string, string> = {
    lose_weight: `Walking ${km} km daily creates a steady calorie deficit without stressing your body.`,
    fat_loss: `A ${km} km walk keeps your fat-burning zone active while preserving muscle.`,
    build_muscle: `${km} km walk aids recovery and keeps your metabolism active on rest days.`,
    stay_fit: `${km} km daily walk maintains cardiovascular health and keeps you energised.`,
    build_consistency: `Start with ${km} km — consistency beats intensity every time.`,
  };
  return { km, note: notes[goal] || `Walk ${km} km at a comfortable pace today.` };
}

function getDayOfWeek(): number {
  return new Date().getDay(); // 0=Sun, 1=Mon...
}

function buildWorkoutOption(
  category: 'upper_body' | 'lower_body' | 'cardio',
  intensity: string,
  day: number,
): WorkoutOption {
  const meta: Record<string, { emoji: string; titles: Record<string, string>; descs: Record<string, string>; durations: Record<string, string> }> = {
    upper_body: {
      emoji: '💪',
      titles: { low: 'Light Upper Body', moderate: 'Upper Body Strength', high: 'Upper Body Power' },
      descs: { low: 'Gentle movements to keep your upper body engaged.', moderate: 'Build strength in your arms, shoulders and back.', high: 'Push your upper body to build lean muscle.' },
      durations: { low: '15 min', moderate: '25 min', high: '35 min' },
    },
    lower_body: {
      emoji: '🦵',
      titles: { low: 'Light Lower Body', moderate: 'Lower Body Strength', high: 'Lower Body Power' },
      descs: { low: 'Easy leg movements to stay mobile.', moderate: 'Strengthen legs and glutes for everyday power.', high: 'Intense leg session for serious results.' },
      durations: { low: '15 min', moderate: '25 min', high: '35 min' },
    },
    cardio: {
      emoji: '❤️‍🔥',
      titles: { low: 'Light Cardio', moderate: 'Cardio Burn', high: 'HIIT Cardio Blast' },
      descs: { low: 'Get your heart rate up gently.', moderate: 'Steady-state cardio to burn calories effectively.', high: 'High-intensity intervals for maximum fat burn.' },
      durations: { low: '15 min', moderate: '25 min', high: '30 min' },
    },
  };

  const m = meta[category];
  const exercisePools: Record<string, Record<string, Record<number, string[]>>> = {
    upper_body: { low: UPPER_LOW_DAILY, moderate: UPPER_BODY_DAILY, high: UPPER_BODY_DAILY },
    lower_body: { low: LOWER_LOW_DAILY, moderate: LOWER_BODY_DAILY, high: LOWER_BODY_DAILY },
    cardio: { low: CARDIO_LOW_DAILY, moderate: CARDIO_DAILY, high: CARDIO_DAILY },
  };

  return {
    category,
    emoji: m.emoji,
    title: m.titles[intensity] || m.titles.moderate,
    description: m.descs[intensity] || m.descs.moderate,
    duration: m.durations[intensity] || m.durations.moderate,
    exercises: exercisePools[category][intensity]?.[day] || exercisePools[category].moderate[day],
  };
}

function getWorkoutRotation(goal: string, day: number): ('upper_body' | 'lower_body' | 'cardio')[] {
  if (goal === 'lose_weight' || goal === 'fat_loss') {
    const patterns: ('upper_body' | 'lower_body' | 'cardio')[][] = [
      ['cardio', 'upper_body'], // Sun
      ['lower_body', 'cardio'], // Mon
      ['upper_body', 'cardio'], // Tue
      ['cardio', 'lower_body'], // Wed
      ['upper_body', 'cardio'], // Thu
      ['lower_body', 'cardio'], // Fri
      ['cardio'],               // Sat - active recovery
    ];
    return patterns[day];
  }
  if (goal === 'build_muscle') {
    const patterns: ('upper_body' | 'lower_body' | 'cardio')[][] = [
      ['upper_body', 'lower_body'], // Sun
      ['lower_body', 'upper_body'], // Mon
      ['upper_body', 'cardio'],     // Tue
      ['lower_body', 'upper_body'], // Wed
      ['upper_body', 'lower_body'], // Thu
      ['cardio', 'lower_body'],     // Fri
      ['upper_body'],               // Sat
    ];
    return patterns[day];
  }
  // stay_fit / build_consistency — balanced
  const patterns: ('upper_body' | 'lower_body' | 'cardio')[][] = [
    ['cardio', 'upper_body'],     // Sun
    ['lower_body', 'cardio'],     // Mon
    ['upper_body', 'lower_body'], // Tue
    ['cardio'],                   // Wed
    ['lower_body', 'upper_body'], // Thu
    ['cardio', 'lower_body'],     // Fri
    ['upper_body'],               // Sat
  ];
  return patterns[day];
}

// Check-in adaptive logic
export function getWorkoutSuggestion(checkIn: CheckInData, goal: string = 'stay_fit'): WorkoutPlan {
  const intensity = getIntensityLevel(checkIn);
  const walkTarget = getWalkTarget(goal, intensity);

  if (checkIn.mind === 'heavy') {
    return {
      message: "Let's keep it gentle today. A walk is your workout.",
      options: [{
        category: 'walk', emoji: '🚶', title: 'Mindful Walk',
        description: 'Step outside, breathe deep. That\'s your move today.',
        duration: `${walkTarget.km} km`,
      }],
      walkTarget,
    };
  }

  const day = getDayOfWeek();
  const rotation = getWorkoutRotation(goal, day);
  const options: WorkoutOption[] = rotation.map(cat => buildWorkoutOption(cat, intensity, day));

  // Always include walk as an option
  options.push({
    category: 'walk', emoji: '🚶', title: `Walk — ${walkTarget.km} km`,
    description: walkTarget.note,
    duration: `~${Math.round(walkTarget.km * 12)} min`,
  });

  const messages: Record<string, string> = {
    low: 'Take it easy today — pick what feels right.',
    moderate: "You've got good energy. Choose your workout.",
    high: "You're fired up — make the most of today!",
  };

  return {
    message: messages[intensity],
    options,
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
