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
  dietPreference: DietPreference;
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
  tags: string[]; // ingredient tags for matching
}

export interface MealSlot {
  label: string;
  options: [Recipe, Recipe];
}

const ALL_RECIPES: Record<string, Record<DietPreference, Recipe[]>> = {
  lose_weight: {
    vegetarian: [
      { name: 'Curd Rice', kcal: 280, prepTime: '5 min', steps: ['Mix leftover rice with fresh curd', 'Add salt, mustard seeds if you want', 'Top with pickle on the side'], why: 'Easy on digestion, light calories', tags: ['rice', 'curd', 'pickle'] },
      { name: 'Cucumber Raita Bowl', kcal: 180, prepTime: '5 min', steps: ['Grate cucumber into thick curd', 'Add roasted cumin, salt, mint', 'Eat as a light meal or with 1 roti'], why: 'Very low calorie, high protein from curd', tags: ['cucumber', 'curd'] },
      { name: 'Moong Dal Cheela', kcal: 250, prepTime: '12 min', steps: ['Blend soaked moong dal into batter', 'Pour thin on hot pan like a dosa', 'Fill with paneer or veggies', 'Serve with green chutney'], why: 'Protein-packed, no flour', tags: ['moong', 'dal', 'paneer'] },
      { name: 'Palak Paneer (light)', kcal: 300, prepTime: '15 min', steps: ['Blanch and blend spinach', 'Sauté paneer cubes lightly', 'Mix spinach puree with light spices', 'Serve with 1 roti'], why: 'Iron-rich, high protein, low carb', tags: ['paneer', 'spinach', 'palak', 'roti'] },
    ],
    eggitarian: [
      { name: 'Masala Egg Bhurji', kcal: 320, prepTime: '10 min', steps: ['Heat oil, toss in onions and tomatoes', 'Crack 3 eggs and scramble', 'Add turmeric, salt, chilli', 'Have with 1 roti or on its own'], why: 'High protein, low carb', tags: ['egg', 'onion', 'tomato', 'roti'] },
      { name: 'Boiled Egg Salad', kcal: 220, prepTime: '10 min', steps: ['Boil 3 eggs, halve them', 'Toss with cucumber, onion, tomato', 'Add lemon, salt, chaat masala', 'Light and filling'], why: 'Pure protein, almost zero carbs', tags: ['egg', 'cucumber', 'onion', 'tomato'] },
      { name: 'Egg Dosa', kcal: 290, prepTime: '8 min', steps: ['Pour dosa batter on hot tawa', 'Crack an egg on top, spread it', 'Add salt, pepper, chopped onions', 'Fold and serve with chutney'], why: 'Balanced protein with fermented carbs', tags: ['egg', 'dosa', 'onion'] },
      { name: 'Curd Rice', kcal: 280, prepTime: '5 min', steps: ['Mix leftover rice with fresh curd', 'Add salt, mustard seeds', 'Top with pickle on the side'], why: 'Easy on digestion, light calories', tags: ['rice', 'curd'] },
    ],
    non_vegetarian: [
      { name: 'Chicken Salad Bowl', kcal: 350, prepTime: '15 min', steps: ['Grill or pan-fry chicken breast', 'Slice and toss with cucumber, onion', 'Add lemon dressing, salt, pepper', 'High protein, low carb meal'], why: 'Lean protein keeps you full for hours', tags: ['chicken', 'cucumber', 'onion'] },
      { name: 'Masala Egg Bhurji', kcal: 320, prepTime: '10 min', steps: ['Heat oil, toss in onions and tomatoes', 'Crack 3 eggs and scramble', 'Add turmeric, salt, chilli', 'Have with 1 roti'], why: 'High protein, low carb', tags: ['egg', 'onion', 'tomato', 'roti'] },
      { name: 'Fish Curry (light)', kcal: 300, prepTime: '20 min', steps: ['Marinate fish with turmeric, salt', 'Make light tomato-onion gravy', 'Simmer fish in the gravy', 'Serve with 1 small rice portion'], why: 'Omega-3 rich, lean protein', tags: ['fish', 'tomato', 'onion', 'rice'] },
      { name: 'Boiled Egg Salad', kcal: 220, prepTime: '10 min', steps: ['Boil 3 eggs, halve them', 'Toss with cucumber, onion, tomato', 'Squeeze lemon, add chaat masala'], why: 'Pure protein, almost zero carbs', tags: ['egg', 'cucumber', 'onion', 'tomato'] },
    ],
  },
  fat_loss: {
    vegetarian: [
      { name: 'Paneer Stir Fry', kcal: 380, prepTime: '15 min', steps: ['Cube paneer, chop capsicum and onions', 'Heat oil, toss veggies with soy sauce', 'Add paneer, stir on high heat', 'Serve with 1 roti'], why: 'High protein, minimal carbs — ideal for fat loss', tags: ['paneer', 'capsicum', 'onion', 'roti'] },
      { name: 'Moong Dal Cheela', kcal: 250, prepTime: '12 min', steps: ['Blend soaked moong dal into batter', 'Pour thin on hot pan', 'Fill with paneer or veggies', 'Serve with green chutney'], why: 'Protein-packed, no flour', tags: ['moong', 'dal', 'paneer'] },
      { name: 'Sprouts Chaat', kcal: 200, prepTime: '5 min', steps: ['Mix boiled sprouts with onion, tomato', 'Add lemon, chaat masala, coriander', 'Crunchy, fresh, and filling'], why: 'High fiber, high protein, low calorie', tags: ['sprouts', 'onion', 'tomato'] },
      { name: 'Brown Bread Paneer Sandwich', kcal: 340, prepTime: '8 min', steps: ['Crumble paneer with green chutney', 'Add cucumber, onion slices', 'Toast brown bread, assemble', 'Quick and satisfying'], why: 'Complex carbs with protein — keeps energy stable', tags: ['brown bread', 'bread', 'paneer', 'cucumber', 'onion'] },
    ],
    eggitarian: [
      { name: 'Egg White Omelette', kcal: 200, prepTime: '8 min', steps: ['Separate 4 egg whites', 'Whisk with onions, capsicum, salt', 'Cook on low flame till set', 'Serve with brown bread'], why: 'Maximum protein, minimum fat', tags: ['egg', 'onion', 'capsicum', 'brown bread', 'bread'] },
      { name: 'Paneer Stir Fry', kcal: 380, prepTime: '15 min', steps: ['Cube paneer, chop capsicum and onions', 'Heat oil, toss veggies with soy sauce', 'Add paneer, stir on high heat', 'Serve with 1 roti'], why: 'High protein from paneer, minimal carbs', tags: ['paneer', 'capsicum', 'onion', 'roti'] },
      { name: 'Boiled Egg & Sprouts Bowl', kcal: 280, prepTime: '10 min', steps: ['Boil eggs and sprouts', 'Toss with lemon, salt, chaat masala', 'Add chopped onion and coriander'], why: 'Double protein punch for fat burning', tags: ['egg', 'sprouts', 'onion'] },
      { name: 'Egg Bhurji Wrap', kcal: 350, prepTime: '10 min', steps: ['Make spicy egg bhurji', 'Warm a roti, add bhurji', 'Top with onion, chutney, wrap it'], why: 'Portable protein-rich meal', tags: ['egg', 'roti', 'onion'] },
    ],
    non_vegetarian: [
      { name: 'Chicken Tikka (dry)', kcal: 350, prepTime: '20 min', steps: ['Marinate chicken in curd+spices', 'Grill or pan-fry till charred', 'Serve with onion rings, lemon', 'Pure protein, zero carbs'], why: 'Lean protein — best for fat loss with muscle retention', tags: ['chicken', 'curd', 'onion'] },
      { name: 'Fish Fry (light oil)', kcal: 300, prepTime: '15 min', steps: ['Marinate fish with turmeric, chilli, salt', 'Shallow fry in minimal oil', 'Serve with lemon and salad'], why: 'Omega-3 fatty acids + lean protein', tags: ['fish'] },
      { name: 'Egg Bhurji Wrap', kcal: 350, prepTime: '10 min', steps: ['Make spicy egg bhurji', 'Warm a roti, add bhurji', 'Top with onion, chutney, wrap it'], why: 'Portable protein-rich meal', tags: ['egg', 'roti', 'onion'] },
      { name: 'Chicken Salad Bowl', kcal: 320, prepTime: '15 min', steps: ['Grill chicken, slice thin', 'Toss with cucumber, onion, tomato', 'Dress with lemon and pepper'], why: 'Clean eating — high satiety, low calorie', tags: ['chicken', 'cucumber', 'onion', 'tomato'] },
    ],
  },
  stay_fit: {
    vegetarian: [
      { name: 'Dal Tadka with Rice', kcal: 450, prepTime: '20 min', steps: ['Cook toor dal until soft', 'Make tadka with ghee, cumin, garlic', 'Serve with rice and onion salad'], why: 'Balanced macros — protein, energy, good fats', tags: ['dal', 'rice', 'ghee', 'onion'] },
      { name: 'Poha with Peanuts', kcal: 350, prepTime: '10 min', steps: ['Wash and drain flattened rice', 'Fry mustard seeds, onions, chilli', 'Toss in poha with turmeric and peanuts', 'Squeeze lime, serve'], why: 'The everyday Indian balanced meal', tags: ['poha', 'peanuts', 'onion'] },
      { name: 'Rajma Chawal', kcal: 480, prepTime: '25 min', steps: ['Cook rajma with onion-tomato gravy', 'Add garam masala, ginger-garlic', 'Serve hot over steamed rice'], why: 'Complete protein from beans + rice', tags: ['rajma', 'rice', 'onion', 'tomato'] },
      { name: 'Aloo Paratha with Curd', kcal: 420, prepTime: '20 min', steps: ['Make spiced potato filling', 'Stuff in wheat dough, roll out', 'Cook on tawa with ghee', 'Serve with curd'], why: 'Comfort food with balanced energy', tags: ['potato', 'aloo', 'curd', 'ghee'] },
    ],
    eggitarian: [
      { name: 'Egg Fried Rice', kcal: 420, prepTime: '12 min', steps: ['Scramble 2 eggs, keep aside', 'Fry leftover rice with veggies', 'Mix eggs back in with soy sauce', 'Quick and satisfying'], why: 'Balanced carbs and protein', tags: ['egg', 'rice'] },
      { name: 'Dal Tadka with Rice', kcal: 450, prepTime: '20 min', steps: ['Cook toor dal until soft', 'Make tadka with ghee, cumin, garlic', 'Serve with rice'], why: 'Balanced macros from dal + rice', tags: ['dal', 'rice', 'ghee'] },
      { name: 'Poha with Peanuts', kcal: 350, prepTime: '10 min', steps: ['Wash poha, fry with mustard seeds', 'Add onions, turmeric, peanuts', 'Squeeze lime, serve hot'], why: 'Light, balanced, everyday meal', tags: ['poha', 'peanuts', 'onion'] },
      { name: 'Bread Omelette', kcal: 380, prepTime: '8 min', steps: ['Beat 2 eggs with onion, chilli, salt', 'Cook omelette, place on toast', 'Add ketchup or chutney'], why: 'Simple, satisfying, balanced', tags: ['egg', 'bread'] },
    ],
    non_vegetarian: [
      { name: 'Chicken Curry with Rice', kcal: 520, prepTime: '25 min', steps: ['Cook chicken in onion-tomato gravy', 'Add garam masala, turmeric', 'Simmer till tender', 'Serve with steamed rice'], why: 'Complete balanced meal — protein, carbs, fats', tags: ['chicken', 'rice', 'onion', 'tomato'] },
      { name: 'Egg Fried Rice', kcal: 420, prepTime: '12 min', steps: ['Scramble eggs, fry rice with veggies', 'Mix together with soy sauce', 'Quick and filling'], why: 'Balanced and easy to make', tags: ['egg', 'rice'] },
      { name: 'Keema Roti', kcal: 480, prepTime: '20 min', steps: ['Cook minced meat with onion-tomato', 'Add peas, garam masala', 'Serve with 2 rotis'], why: 'Protein-heavy comfort meal', tags: ['keema', 'roti', 'onion', 'tomato'] },
      { name: 'Fish Curry with Rice', kcal: 450, prepTime: '20 min', steps: ['Make coconut-based light curry', 'Simmer fish pieces in it', 'Serve with rice'], why: 'Omega-3 rich, light and nourishing', tags: ['fish', 'rice', 'coconut'] },
    ],
  },
  build_consistency: {
    vegetarian: [
      { name: 'Banana Oat Porridge', kcal: 300, prepTime: '7 min', steps: ['Cook oats in milk until creamy', 'Slice banana on top', 'Add honey if you like'], why: 'Simple, no-fuss, nutritious', tags: ['oats', 'banana', 'milk'] },
      { name: 'Peanut Butter Toast', kcal: 320, prepTime: '3 min', steps: ['Toast 2 slices of bread', 'Spread peanut butter', 'Slice banana on top', 'Have with milk'], why: 'Zero cooking, healthy eating made easy', tags: ['bread', 'peanut butter', 'banana', 'milk'] },
      { name: 'Upma', kcal: 300, prepTime: '10 min', steps: ['Roast rava, set aside', 'Temper mustard, curry leaves, onion', 'Add water, then rava, stir till done'], why: 'Quick, filling, everyday breakfast', tags: ['rava', 'onion'] },
      { name: 'Curd Rice', kcal: 280, prepTime: '5 min', steps: ['Mix rice with curd', 'Add salt, temper with mustard', 'Simple and comforting'], why: 'Easiest meal that actually nourishes', tags: ['rice', 'curd'] },
    ],
    eggitarian: [
      { name: 'Banana Oat Porridge', kcal: 300, prepTime: '7 min', steps: ['Cook oats in milk', 'Slice banana, drizzle honey'], why: 'Simple and nutritious', tags: ['oats', 'banana', 'milk'] },
      { name: 'Bread Omelette', kcal: 350, prepTime: '5 min', steps: ['Beat 2 eggs with salt, chilli', 'Cook omelette, place on bread', 'Add ketchup — done'], why: 'Easiest protein-rich meal', tags: ['egg', 'bread'] },
      { name: 'Egg Maggi', kcal: 380, prepTime: '8 min', steps: ['Cook maggi as usual', 'Crack an egg in while cooking', 'Stir and serve hot'], why: 'Comfort food with added protein', tags: ['egg', 'maggi'] },
      { name: 'Peanut Butter Toast', kcal: 320, prepTime: '3 min', steps: ['Toast bread, spread PB', 'Add banana slices'], why: 'No-cook, high energy', tags: ['bread', 'peanut butter', 'banana'] },
    ],
    non_vegetarian: [
      { name: 'Chicken Maggi', kcal: 400, prepTime: '12 min', steps: ['Shred leftover chicken', 'Cook maggi, add chicken', 'Add chilli sauce'], why: 'Comfort + protein — consistency-friendly', tags: ['chicken', 'maggi'] },
      { name: 'Bread Omelette', kcal: 350, prepTime: '5 min', steps: ['Beat eggs, cook omelette', 'Place on toast, add ketchup'], why: 'The easiest protein meal', tags: ['egg', 'bread'] },
      { name: 'Banana Oat Porridge', kcal: 300, prepTime: '7 min', steps: ['Cook oats in milk', 'Top with banana, honey'], why: 'Simple, no-fuss nutrition', tags: ['oats', 'banana', 'milk'] },
      { name: 'Peanut Butter Toast', kcal: 320, prepTime: '3 min', steps: ['Toast bread, spread PB', 'Slice banana, glass of milk'], why: 'Zero cooking required', tags: ['bread', 'peanut butter', 'banana'] },
    ],
  },
  build_muscle: {
    vegetarian: [
      { name: 'Paneer Paratha', kcal: 500, prepTime: '18 min', steps: ['Crumble paneer with spices', 'Stuff into wheat dough, roll', 'Cook on tawa with ghee', 'Serve with curd'], why: 'High protein + complex carbs for muscle growth', tags: ['paneer', 'ghee', 'curd'] },
      { name: 'Rajma Chawal', kcal: 520, prepTime: '25 min', steps: ['Cook rajma in rich gravy', 'Serve over generous rice', 'Add onion salad on side'], why: 'Complete amino acid profile from beans + rice', tags: ['rajma', 'rice', 'onion'] },
      { name: 'Chole with Bhature', kcal: 580, prepTime: '30 min', steps: ['Cook chickpeas in spicy gravy', 'Make bhature from maida dough', 'Deep fry and serve hot'], why: 'Calorie-dense, protein-rich for bulking', tags: ['chole', 'chickpeas'] },
      { name: 'Soya Chunk Curry with Rice', kcal: 480, prepTime: '20 min', steps: ['Soak and squeeze soya chunks', 'Cook in onion-tomato gravy', 'Serve with rice'], why: 'Soya = plant protein powerhouse', tags: ['soya', 'rice', 'onion', 'tomato'] },
    ],
    eggitarian: [
      { name: 'Egg Rice Bowl', kcal: 520, prepTime: '12 min', steps: ['Fry 3-4 eggs sunny side up', 'Warm rice with ghee', 'Place eggs on rice, add soy sauce'], why: 'High protein + carbs — muscle fuel', tags: ['egg', 'rice', 'ghee'] },
      { name: 'Paneer Paratha', kcal: 500, prepTime: '18 min', steps: ['Crumble paneer, stuff in dough', 'Cook on tawa with ghee', 'Serve with curd'], why: 'Protein-dense comfort food', tags: ['paneer', 'ghee', 'curd'] },
      { name: 'Egg Curry with Rice', kcal: 480, prepTime: '15 min', steps: ['Boil eggs, halve them', 'Make onion-tomato gravy', 'Simmer eggs in gravy, serve with rice'], why: 'Protein-rich, calorie-adequate', tags: ['egg', 'rice', 'onion', 'tomato'] },
      { name: 'Double Egg Omelette + Toast', kcal: 450, prepTime: '8 min', steps: ['Beat 4 eggs with veggies', 'Make thick omelette', 'Serve with buttered toast'], why: 'Quick high-protein meal', tags: ['egg', 'bread', 'butter'] },
    ],
    non_vegetarian: [
      { name: 'Chicken Roti Wrap', kcal: 480, prepTime: '15 min', steps: ['Cook chicken with basic masala', 'Warm rotis', 'Wrap chicken with onion + chutney'], why: 'Lean protein with complex carbs', tags: ['chicken', 'roti', 'onion'] },
      { name: 'Egg Rice Bowl', kcal: 520, prepTime: '12 min', steps: ['Fry 3-4 eggs sunny side up', 'Warm rice with ghee', 'Place eggs on rice, add soy sauce'], why: 'High protein + carbs for growth', tags: ['egg', 'rice', 'ghee'] },
      { name: 'Chicken Biryani', kcal: 600, prepTime: '30 min', steps: ['Marinate chicken in yogurt+spices', 'Layer with basmati rice', 'Dum cook for 20 min'], why: 'Calorie-dense, protein-rich — ideal for muscle building', tags: ['chicken', 'rice', 'curd'] },
      { name: 'Keema Paratha', kcal: 550, prepTime: '25 min', steps: ['Cook minced meat with spices', 'Stuff into wheat dough, roll', 'Cook with ghee on tawa'], why: 'High protein, high calorie — growth fuel', tags: ['keema', 'ghee'] },
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
  return recipe.tags.filter((tag) =>
    ingredients.some((ing) => ing.includes(tag) || tag.includes(ing))
  ).length;
}

export function getRecipeSuggestions(goal: string, dietPreference: DietPreference, kitchenInput?: string): MealSlot[] {
  const goalKey = ALL_RECIPES[goal] ? goal : 'stay_fit';
  const pool = [...(ALL_RECIPES[goalKey][dietPreference] || ALL_RECIPES[goalKey].vegetarian)];
  const ingredients = kitchenInput ? parseIngredients(kitchenInput) : [];

  // Sort by ingredient match score (descending), then shuffle ties
  if (ingredients.length > 0) {
    pool.sort((a, b) => scoreRecipe(b, ingredients) - scoreRecipe(a, ingredients));
  }

  // Pick top 4 (or all if less) — split into 2 meal slots of 2 options each
  const selected = pool.slice(0, 4);
  const slots: MealSlot[] = [
    { label: 'Meal 1', options: [selected[0], selected[1]] },
    { label: 'Meal 2', options: [selected[2] || selected[0], selected[3] || selected[1]] },
  ];

  return slots;
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
