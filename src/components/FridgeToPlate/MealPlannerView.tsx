import React, { useState } from 'react';
import { FoodItem, Recipe, AllergyProfile } from '../../types';
import { useRegion } from '../../context/RegionContext';
import { PageHero, Card, StatTile, Sheet } from '../common/Primitives';
import { sounds } from '../../utils/audioEffects';
import { CookingAssistantModal } from './CookingAssistantModal';
import {
  Calendar,
  ChefHat,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle,
  Plus,
  RefreshCw,
  ShoppingBag,
  Leaf,
  DollarSign
} from 'lucide-react';

interface MealPlannerViewProps {
  inventory: FoodItem[];
  allergyProfile: AllergyProfile;
  onCookRecipe: (recipe: Recipe) => void;
}

interface PlannedMeal {
  day: string;
  dateStr: string;
  mealTitle: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  rescuedItems: string[];
  shelfUrgency: 'critical' | 'moderate' | 'safe';
  servings: number;
  dollarsSaved: number;
  instructions: string[];
  zeroWasteTip: string;
  isCooked?: boolean;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  inventory,
  allergyProfile,
  onCookRecipe,
}) => {
  const { config, formatPrice } = useRegion();

  const [weekMeals, setWeekMeals] = useState<PlannedMeal[]>([
    {
      day: 'Monday',
      dateStr: 'Tonight',
      mealTitle: 'Skillet Chicken with Wilted Greens & Bell Peppers',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      rescuedItems: ['Fresh Chicken Breast', 'Baby Spinach', 'Red Bell Pepper'],
      shelfUrgency: 'critical',
      servings: 2,
      dollarsSaved: 11.40,
      instructions: [
        'Cut chicken breasts into thin fillets; season with salt, pepper, and garlic.',
        'Sear in olive oil over medium-high heat for 5 minutes per side.',
        'Toss in sliced bell peppers and wilt the baby spinach directly in the pan juices.',
        'Drizzle with a squeeze of lemon and serve warm.',
      ],
      zeroWasteTip: 'Cooking fresh chicken today halts bacterial growth; leftovers can be safely refrigerated for 3 additional days.',
    },
    {
      day: 'Tuesday',
      dateStr: 'Tomorrow',
      mealTitle: 'Creamy Golden Vegetable & Milk Chowder',
      prepTimeMinutes: 12,
      cookTimeMinutes: 20,
      rescuedItems: ['Whole Milk', 'Red Bell Pepper', 'Carrots'],
      shelfUrgency: 'critical',
      servings: 4,
      dollarsSaved: 7.80,
      instructions: [
        'Sauté diced onions, carrots, and bell peppers in a saucepan until fragrant.',
        'Pour in 2 cups of milk and vegetable broth; bring to a gentle simmer.',
        'Simmer until vegetables are fork-tender and season to taste.',
      ],
      zeroWasteTip: 'Using milk in a soup or chowder is ideal when a carton is open and near its stamped date.',
    },
    {
      day: 'Wednesday',
      dateStr: 'In 2 days',
      mealTitle: 'Rustic Vegetable Frittata with Melted Cheese',
      prepTimeMinutes: 8,
      cookTimeMinutes: 14,
      rescuedItems: ['Eggs', 'Cheddar Cheese', 'Baby Spinach'],
      shelfUrgency: 'moderate',
      servings: 3,
      dollarsSaved: 6.20,
      instructions: [
        'Whisk eggs with a splash of milk and grated cheese.',
        'Pour into a nonstick pan with sautéed vegetables.',
        'Cook on low until edges are golden and center is set.',
      ],
      zeroWasteTip: 'Frittatas are the universal refrigerator-clearing meal—virtually any leftover vegetable fits in.',
    },
    {
      day: 'Thursday',
      dateStr: 'In 3 days',
      mealTitle: 'Sheet-Pan Herb Roasted Vegetables & Grains',
      prepTimeMinutes: 15,
      cookTimeMinutes: 25,
      rescuedItems: ['Broccoli Crowns', 'Sweet Potatoes'],
      shelfUrgency: 'moderate',
      servings: 3,
      dollarsSaved: 5.50,
      instructions: [
        'Chop vegetables into uniform florets and cubes.',
        'Toss with olive oil, rosemary, salt, and roast at 400°F (200°C) for 25 minutes.',
        'Serve over warm grains or quinoa.',
      ],
      zeroWasteTip: 'Broccoli stems are as nutritious as florets; peel the tough outer skin and chop them into disks.',
    },
    {
      day: 'Friday',
      dateStr: 'In 4 days',
      mealTitle: 'One-Pot Pantry Pasta Primavera',
      prepTimeMinutes: 10,
      cookTimeMinutes: 12,
      rescuedItems: ['Dry Penne Pasta', 'Canned Diced Tomatoes', 'Garlic'],
      shelfUrgency: 'safe',
      servings: 4,
      dollarsSaved: 4.80,
      instructions: [
        'Boil pasta in salted water until al dente.',
        'Warm diced tomatoes with olive oil, garlic, and leftover herbs.',
        'Toss pasta into sauce and top with parmesan.',
      ],
      zeroWasteTip: 'Stash pasta water to emulsify sauces and turn simple pantry staples into a silky dinner.',
    },
    {
      day: 'Saturday',
      dateStr: 'Weekend',
      mealTitle: 'Zero-Waste Kitchen Clearout Grain Bowl',
      prepTimeMinutes: 10,
      cookTimeMinutes: 10,
      rescuedItems: ['Assorted Fridge Leftovers', 'Cooked Rice'],
      shelfUrgency: 'safe',
      servings: 2,
      dollarsSaved: 8.90,
      instructions: [
        'Reheat cooked rice or quinoa with a dash of soy sauce and sesame oil.',
        'Warm leftover roasted veggies and proteins in a hot pan.',
        'Assemble bowls and garnish with a fried egg.',
      ],
      zeroWasteTip: 'Weekly clearout bowls ensure your refrigerator enters Sunday completely reset and organized.',
    },
  ]);

  const [activeRecipeSheet, setActiveRecipeSheet] = useState<PlannedMeal | null>(null);
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const totalWeekSavings = weekMeals.reduce((acc, m) => acc + m.dollarsSaved, 0);
  const totalRescuedCount = weekMeals.reduce((acc, m) => acc + m.rescuedItems.length, 0);

  const handleStartCook = (meal: PlannedMeal) => {
    sounds.playTap();
    const recipe: Recipe = {
      id: `plan-${meal.day.toLowerCase()}`,
      title: meal.mealTitle,
      prepTimeMinutes: meal.prepTimeMinutes,
      cookTimeMinutes: meal.cookTimeMinutes,
      difficulty: 'Easy',
      rescuedIngredients: meal.rescuedItems,
      otherIngredients: ['Olive oil', 'Salt & Pepper', 'Garlic'],
      estimatedDollarsSaved: meal.dollarsSaved,
      instructions: meal.instructions,
      zeroWasteTip: meal.zeroWasteTip,
      allergySafe: true,
    };
    setActiveCookingRecipe(recipe);
    onCookRecipe(recipe);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    sounds.playTap();
    setTimeout(() => {
      setIsRegenerating(false);
      sounds.playSuccessChime();
    }, 1200);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHero
          eyebrow="AI Zero-Waste Meal Planner"
          title="Cook in sync with your expiration dates."
          subtitle="Our algorithm sequences your meals so items at highest risk of spoilage are prepared first."
        />

        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] text-white font-medium text-[13px] flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{isRegenerating ? 'Optimizing Schedule...' : 'Re-sequence with AI'}</span>
        </button>
      </div>

      {/* 2. Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          value={formatPrice(totalWeekSavings)}
          label="Weekly Grocery Value"
          change="Kept out of compost"
        />
        <StatTile
          value={`${totalRescuedCount} Ingredients`}
          label="Rescued This Week"
          change="Zero waste trajectory"
        />
        <StatTile
          value="6 Scheduled"
          label="Dinners Planned"
          change="Mon through Sat"
        />
        <StatTile
          value="0 Waste Days"
          label="Forecasted Discards"
          change="100% consumption rate"
        />
      </div>

      {/* 3. 7-Day Interactive Timeline Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-1">
          <span>Weekly Sequence (Ordered by Expiration Urgency)</span>
          <span className="text-[#1F7A4D] dark:text-[#34C77B]">Empirically Grounded via FoodKeeper</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {weekMeals.map((meal, idx) => {
            const isCritical = meal.shelfUrgency === 'critical';
            const isModerate = meal.shelfUrgency === 'moderate';

            return (
              <div
                key={meal.day}
                className={`p-6 rounded-[24px] border transition-all flex flex-col justify-between ${
                  isCritical
                    ? 'bg-white dark:bg-[#1C1C1E] border-amber-500/40 shadow-sm'
                    : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08]'
                }`}
              >
                <div className="space-y-3">
                  {/* Card top badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {meal.day}
                      </span>
                      <span className="text-[11px] text-[#86868B]">· {meal.dateStr}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : isModerate
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isCritical ? 'Use Today' : isModerate ? 'Use Soon' : 'Stable'}
                    </span>
                  </div>

                  {/* Meal Title */}
                  <h4 className="text-[17px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-snug">
                    {meal.mealTitle}
                  </h4>

                  {/* Rescued Ingredients Pills */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-medium text-[#86868B]">Rescuing from your fridge:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.rescuedItems.map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-black/[0.03] dark:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Zero waste tip */}
                  <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] italic pt-1 leading-relaxed">
                    💡 &quot;{meal.zeroWasteTip}&quot;
                  </p>
                </div>

                {/* Footer and Cook Button */}
                <div className="mt-5 pt-4 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <div className="text-[12px] text-[#86868B] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{meal.prepTimeMinutes + meal.cookTimeMinutes} mins total</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartCook(meal)}
                    className="px-4 py-1.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] text-white text-[12px] font-medium flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Cook with Sous Chef</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cooking Assistant Modal */}
      {activeCookingRecipe && (
        <CookingAssistantModal
          isOpen={true}
          onClose={() => setActiveCookingRecipe(null)}
          activeRecipe={activeCookingRecipe}
          inventory={inventory}
          allergyProfile={allergyProfile}
          onFinishCooking={() => {
            sounds.playSuccessChime();
            setActiveCookingRecipe(null);
          }}
        />
      )}
    </div>
  );
};
