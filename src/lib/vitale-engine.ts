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

export interface CheckInData {
  energy: 'low' | 'balanced' | 'high';
  sleep: 'poor' | 'okay' | 'rested';
  mind: 'heavy' | 'neutral' | 'clear';
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

// Check-in adaptive logic
export function getWorkoutSuggestion(checkIn: CheckInData): { title: string; description: string } {
  if (checkIn.mind === 'heavy') {
    return { title: 'A short 10 min walk outside', description: "That's your move today." };
  }
  if (checkIn.sleep === 'poor' && checkIn.energy === 'low') {
    return { title: '3 km walk + 10 min light stretch', description: "That's enough today." };
  }
  if (checkIn.sleep === 'poor' && checkIn.energy === 'balanced') {
    return { title: '20 min walk or light home flow', description: 'Keep it gentle today.' };
  }
  if (checkIn.energy === 'balanced') {
    return { title: '20 min home flow or a brisk walk', description: "A calm, consistent day is a good day." };
  }
  if (checkIn.sleep === 'rested' && checkIn.energy === 'high') {
    return { title: 'Full body session (30 min)', description: "You're ready for this." };
  }
  return { title: '20-30 min walk or home workout', description: 'Move at your own pace.' };
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
export interface Recipe {
  name: string;
  kcal: number;
  prepTime: string;
  steps: string[];
  why: string;
}

export function getRecipeSuggestions(goal: string, kitchenInput?: string): Recipe[] {
  const recipes: Record<string, Recipe[]> = {
    lose_weight: [
      { name: 'Masala Egg Bhurji', kcal: 320, prepTime: '10 min', steps: ['Heat a little oil, toss in chopped onions and tomatoes', 'Crack in 3 eggs and scramble them up', 'Add turmeric, salt, chilli — done', 'Have with 1 roti or on its own'], why: 'High protein, low carb — keeps you full without the calorie load' },
      { name: 'Curd Rice', kcal: 280, prepTime: '5 min', steps: ['Mix leftover rice with fresh curd', 'Add salt, a little mustard seeds if you want', 'Top with pickle on the side', 'Light, cool, and gut-friendly'], why: 'Easy on digestion, light calories — perfect when you want something simple' },
    ],
    fat_loss: [
      { name: 'Paneer Stir Fry', kcal: 380, prepTime: '15 min', steps: ['Cube paneer, chop capsicum and onions', 'Heat oil, toss in veggies with soy sauce', 'Add paneer cubes, stir on high heat', 'Serve hot with 1 roti'], why: 'High protein from paneer, minimal carbs — ideal for fat loss with muscle retention' },
      { name: 'Moong Dal Cheela', kcal: 250, prepTime: '12 min', steps: ['Blend soaked moong dal into a batter', 'Pour thin on a hot pan like a dosa', 'Fill with paneer or veggies', 'Serve with green chutney'], why: 'Protein-packed, no flour — filling without the carb spike' },
    ],
    stay_fit: [
      { name: 'Dal Tadka with Rice', kcal: 450, prepTime: '20 min', steps: ['Cook toor dal until soft', 'Make tadka with ghee, cumin, garlic', 'Pour over dal, serve with rice', 'Add raw onion salad on the side'], why: 'Balanced macros — protein from dal, energy from rice, good fats from ghee' },
      { name: 'Poha with Peanuts', kcal: 350, prepTime: '10 min', steps: ['Wash and drain flattened rice', 'Fry mustard seeds, onions, green chilli', 'Toss in poha with turmeric and peanuts', 'Squeeze lime, serve with curd'], why: 'Light yet satisfying — the everyday Indian balanced meal' },
    ],
    build_consistency: [
      { name: 'Banana Oat Porridge', kcal: 300, prepTime: '7 min', steps: ['Cook oats in milk until creamy', 'Slice a banana on top', 'Add honey if you like', 'Done — that easy'], why: "Simple, no-fuss, nutritious — consistency starts with things you'll actually make" },
      { name: 'Peanut Butter Toast', kcal: 320, prepTime: '3 min', steps: ['Toast 2 slices of bread', 'Spread peanut butter generously', 'Slice banana on top', 'Have with a glass of milk'], why: 'Zero cooking required — healthy eating should be this easy' },
    ],
    build_muscle: [
      { name: 'Egg Rice Bowl', kcal: 520, prepTime: '12 min', steps: ['Fry 3-4 eggs sunny side up', 'Warm up leftover rice with ghee', 'Place eggs on rice, add soy sauce', 'Top with spring onions if available'], why: 'High protein + adequate carbs — exactly what muscles need to grow' },
      { name: 'Chicken Roti Wrap', kcal: 480, prepTime: '15 min', steps: ['Cook chicken pieces with basic masala', 'Warm up rotis on tawa', 'Wrap chicken in roti with onion + chutney', 'Quick, portable, protein-heavy'], why: 'Lean protein with complex carbs — solid muscle fuel' },
    ],
  };

  return recipes[goal] || recipes.stay_fit;
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
