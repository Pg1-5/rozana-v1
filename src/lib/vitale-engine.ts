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
  tags: string[];
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
  return recipe.tags.filter((tag) =>
    ingredients.some((ing) => ing.includes(tag) || tag.includes(ing))
  ).length;
}

function pickBestTwo(pool: Recipe[], targetKcal: number, ingredients: string[]): [Recipe, Recipe] {
  // Score by ingredient match, then closeness to target kcal
  const scored = pool.map((r) => ({
    recipe: r,
    ingScore: scoreRecipe(r, ingredients),
    kcalDiff: Math.abs(r.kcal - targetKcal),
  }));
  scored.sort((a, b) => {
    if (b.ingScore !== a.ingScore) return b.ingScore - a.ingScore;
    return a.kcalDiff - b.kcalDiff;
  });
  // Pick top 2, ensure they're different
  const first = scored[0];
  const second = scored.find((s) => s.recipe.name !== first.recipe.name) || scored[1];
  return [first.recipe, second.recipe];
}

export function getRecipeSuggestions(goal: string, dietPreferences: DietPreference[], targetCalories: number, kitchenInput?: string): MealSlot[] {
  const splits = CALORIE_SPLITS[goal] || CALORIE_SPLITS.stay_fit;
  const ingredients = kitchenInput ? parseIngredients(kitchenInput) : [];
  const prefs = dietPreferences.length > 0 ? dietPreferences : ['vegetarian' as DietPreference];

  const mealTypes: { type: MealType; label: string; emoji: string }[] = [
    { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { type: 'lunch', label: 'Lunch', emoji: '☀️' },
    { type: 'snacks', label: 'Snacks', emoji: '🍿' },
    { type: 'dinner', label: 'Dinner', emoji: '🌙' },
  ];

  return mealTypes.map((meal, i) => {
    const targetKcal = Math.round(targetCalories * splits[i]);
    // Merge recipe pools from all selected diet preferences, deduplicate by name
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
    const options = pickBestTwo(pool.length >= 2 ? pool : [...MEAL_RECIPES[meal.type].vegetarian], targetKcal, ingredients);
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
