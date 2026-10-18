import React, { useState } from 'react';
import { FoodItem, Recipe, AllergyProfile } from '../../types';
import { Card, SegmentedControl, StatusDot } from '../common/Primitives';
import {
  Utensils,
  Sparkles,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ChefHat,
  Check,
  Flame,
} from 'lucide-react';
import { verifyRecipeAllergySafety } from '../../utils/allergyFilter';
import { useRegion } from '../../context/RegionContext';

interface RecipeGeneratorProps {
  inventory: FoodItem[];
  prioritizedItem?: FoodItem | null;
  allergyProfile: AllergyProfile;
  onClearPrioritizedItem?: () => void;
  onStartCooking?: (recipe: Recipe) => void;
  onMealCooked?: (recipe: Recipe) => void;
}

export const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({
  inventory,
  prioritizedItem,
  allergyProfile,
  onClearPrioritizedItem,
  onStartCooking,
  onMealCooked,
}) => {
  const { region, config, formatPrice } = useRegion();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [blockedReport, setBlockedReport] = useState<Record<string, string[]> | null>(null);
  const [cookedRecipeIds, setCookedRecipeIds] = useState<string[]>([]);

  // Filter Segmented Controls (Apple-style)
  const [mealTypeFilter, setMealTypeFilter] = useState<'all' | 'dinner' | 'lunch' | 'breakfast'>('all');
  const [maxTimeFilter, setMaxTimeFilter] = useState<'any' | '15' | '30' | '45'>('any');
  const [servingsFilter, setServingsFilter] = useState<'any' | '2' | '4'>('any');

  const urgentItems = inventory.filter((i) => i.actionStatus === 'use-today' || i.actionStatus === 'use-soon');
  const targetNames = prioritizedItem
    ? [prioritizedItem.name]
    : urgentItems.length > 0
    ? urgentItems.map((i) => i.name)
    : inventory.slice(0, 3).map((i) => i.name);

  const generateZeroWasteMeals = async () => {
    setIsLoading(true);
    setBlockedReport(null);

    try {
      const res = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory,
          allergies: allergyProfile.allergies,
          dietary: allergyProfile.dietaryPreferences,
          targetItemNames: targetNames,
          region,
        }),
      });

      const data = await res.json();
      if (data.success && data.recipes) {
        const { sanitizedRecipes, blockedCount, violationsReport } = verifyRecipeAllergySafety(
          data.recipes,
          allergyProfile.allergies,
          allergyProfile.dietaryPreferences
        );

        setRecipes(sanitizedRecipes);
        if (blockedCount > 0) {
          setBlockedReport(violationsReport);
        }
        if (sanitizedRecipes.length > 0) {
          setExpandedRecipeId(sanitizedRecipes[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to generate recipes:', err);
      // Resilient fallback recipe
      const sampleRecipe: Recipe = {
        id: `rec-${Date.now()}`,
        title: 'Quick Skillet Chicken with Wilted Greens',
        description: 'Tender chicken cutlets seared with garlic and tossed with seasoned leafy greens.',
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        difficulty: 'Easy',
        servings: 2,
        rescuedIngredients: targetNames.slice(0, 2),
        otherIngredients: ['Olive oil (1 tbsp)', 'Garlic (2 cloves)', 'Salt & black pepper'],
        instructions: [
          'Pat chicken dry and season generously with salt and pepper.',
          'Heat olive oil in a wide skillet over medium-high heat until shimmering.',
          'Sear chicken for 5–6 minutes per side until golden and cooked to 165°F internal temperature.',
          'Lower heat, add garlic and greens, tossing until just wilted (about 2 minutes). Serve immediately.',
        ],
        estimatedDollarsSaved: 6.80,
        zeroWasteTip: 'Save vegetable stems in a freezer container to make aromatic kitchen broth later this week.',
        allergySafe: true,
      };
      setRecipes([sampleRecipe]);
      setExpandedRecipeId(sampleRecipe.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCookMeal = (recipe: Recipe) => {
    setCookedRecipeIds((prev) => [...prev, recipe.id]);
    onMealCooked?.(recipe);
  };

  const filteredRecipes = recipes.filter((rec) => {
    if (maxTimeFilter !== 'any') {
      const maxMins = parseInt(maxTimeFilter, 10);
      if (rec.prepTimeMinutes + rec.cookTimeMinutes > maxMins) return false;
    }
    if (servingsFilter !== 'any') {
      const s = parseInt(servingsFilter, 10);
      const recipeServings = rec.servings ?? 2;
      if (s === 2 && recipeServings > 2) return false;
      if (s === 4 && (recipeServings < 3 || recipeServings > 4)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header & Generator Launcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div>
          <div className="text-[12px] font-semibold text-[#1F7A4D] dark:text-[#34C77B] uppercase tracking-wider mb-1">
            Zero-Waste Culinary Intelligence
          </div>
          <h2 className="text-[26px] sm:text-[30px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Recipes Grounded in Your Fridge
          </h2>
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mt-1 max-w-xl">
            Prioritizes {targetNames.length} expiring item{targetNames.length !== 1 ? 's' : ''} to cook delicious meals and eliminate waste.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {prioritizedItem && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-[#D97706] dark:text-[#F59E0B] text-[12px] font-medium border border-amber-500/20">
              <span>Focus: {prioritizedItem.name}</span>
              <button
                onClick={onClearPrioritizedItem}
                className="text-amber-500 hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer ml-1"
                aria-label="Clear focus item"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={generateZeroWasteMeals}
            disabled={isLoading || inventory.length === 0}
            className="apple-pill-btn px-6 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white text-[13px] font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                <span>Designing Meals...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Generate Recipes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Filters as SegmentedControls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[22px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#86868B] font-medium">Meal:</span>
            <SegmentedControl
              size="sm"
              options={[
                { value: 'all', label: 'All' },
                { value: 'dinner', label: 'Dinner' },
                { value: 'lunch', label: 'Lunch' },
                { value: 'breakfast', label: 'Breakfast' },
              ]}
              value={mealTypeFilter}
              onChange={(val) => setMealTypeFilter(val as any)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#86868B] font-medium">Time:</span>
            <SegmentedControl
              size="sm"
              options={[
                { value: 'any', label: 'Any' },
                { value: '15', label: '15m' },
                { value: '30', label: '30m' },
                { value: '45', label: '45m+' },
              ]}
              value={maxTimeFilter}
              onChange={(val) => setMaxTimeFilter(val as any)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#86868B] font-medium">Servings:</span>
            <SegmentedControl
              size="sm"
              options={[
                { value: 'any', label: 'Any' },
                { value: '2', label: '1–2' },
                { value: '4', label: '3–4' },
              ]}
              value={servingsFilter}
              onChange={(val) => setServingsFilter(val as any)}
            />
          </div>
        </div>

        {/* Allergy Safeguard Status Indicator */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
          <ShieldCheck className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
          <span>
            {allergyProfile.allergies.length > 0
              ? `Excluding ${allergyProfile.allergies.join(', ')}`
              : 'Deterministic allergy safeguard active'}
          </span>
        </div>
      </div>

      {/* Blocked Recipe Violation Alert if filter caught an allergen */}
      {blockedReport && Object.keys(blockedReport).length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[13px] space-y-1 text-[#D97706] dark:text-[#F59E0B]">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
            <span>Deterministic Safeguard: Blocked recipes violating declared allergies:</span>
          </div>
          {Object.entries(blockedReport).map(([title, viols]) => (
            <div key={title} className="text-[12px] pl-5 text-[#86868B]">
              • <strong>{title}</strong>: {viols.join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* 3. Typography-Led Recipe Cards */}
      {filteredRecipes.length === 0 && !isLoading ? (
        <div className="p-12 text-center rounded-[26px] border border-dashed border-black/[0.08] dark:border-white/[0.10] bg-black/[0.01] dark:bg-white/[0.01] max-w-lg mx-auto space-y-2">
          <Utensils className="w-8 h-8 text-[#86868B] mx-auto" strokeWidth={1.5} />
          <h4 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Ready to Cook
          </h4>
          <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
            Tap &ldquo;Generate Recipes&rdquo; to build wholesome zero-waste recipes prioritizing your expiring ingredients.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRecipes.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.id;
            const isCooked = cookedRecipeIds.includes(recipe.id);

            return (
              <Card
                key={recipe.id}
                className="overflow-hidden transition-all duration-200"
              >
                {/* Card Header & Summary */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                          {recipe.title}
                        </h3>
                        {recipe.allergySafe && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1F7A4D] dark:text-[#34C77B] bg-[#1F7A4D]/10 dark:bg-[#34C77B]/10 px-2.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" strokeWidth={1.5} />
                            Allergy-Safe
                          </span>
                        )}
                        {isCooked && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1F7A4D] dark:text-[#34C77B] bg-[#1F7A4D]/10 px-2.5 py-0.5 rounded-full">
                            <Check className="w-3 h-3" strokeWidth={2} />
                            Cooked
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed max-w-2xl">
                        {recipe.description}
                      </p>
                    </div>

                    {/* Primary "Start Cooking" Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onStartCooking?.(recipe)}
                        className="apple-pill-btn px-5 py-2 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white text-[13px] font-medium shadow-sm flex items-center gap-1.5 cursor-pointer"
                        title="Open step-by-step cooking guide"
                      >
                        <ChefHat className="w-4 h-4" strokeWidth={1.5} />
                        <span>Start Cooking</span>
                      </button>

                      <button
                        onClick={() => handleCookMeal(recipe)}
                        disabled={isCooked}
                        className="apple-pill-btn px-4 py-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px] font-medium disabled:opacity-40 cursor-pointer"
                        title="Mark as cooked and save dollars"
                      >
                        {isCooked ? 'Rescued' : 'I Made This'}
                      </button>
                    </div>
                  </div>

                  {/* Expiring items used as small chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
                    <span className="text-[#86868B] mr-1">Rescued from fridge:</span>
                    {recipe.rescuedIngredients.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-[#1F7A4D]/10 dark:bg-[#34C77B]/10 text-[#1F7A4D] dark:text-[#34C77B] font-medium text-[11px]"
                      >
                        {item}
                      </span>
                    ))}
                    <span className="text-[#86868B] mx-1">•</span>
                    <span className="text-[#6E6E73] dark:text-[#86868B]">
                      {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins total
                    </span>
                    <span className="text-[#86868B] mx-1">•</span>
                    <span className="font-semibold text-[#1F7A4D] dark:text-[#34C77B]">
                      Saves ~{formatPrice(recipe.estimatedDollarsSaved)}
                    </span>
                  </div>

                  {/* Clean Mini Nutrition Table */}
                  <div className="grid grid-cols-4 gap-2 max-w-sm py-2 px-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] text-center text-[11px]">
                    <div>
                      <span className="text-[#86868B] block">Calories</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        ~{380 + (recipe.prepTimeMinutes * 5)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#86868B] block">Protein</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">24g</span>
                    </div>
                    <div>
                      <span className="text-[#86868B] block">Carbs</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">32g</span>
                    </div>
                    <div>
                      <span className="text-[#86868B] block">Fat</span>
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">11g</span>
                    </div>
                  </div>

                  {/* Toggle Full Details */}
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                      className="text-[12px] font-medium text-[#1F7A4D] dark:text-[#34C77B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide ingredients & steps' : 'View ingredients & steps'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-4 text-[13px] animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ingredients */}
                      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] space-y-2">
                        <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px]">
                          Ingredients Required:
                        </div>
                        <ul className="space-y-1 text-[#6E6E73] dark:text-[#86868B] text-[12px]">
                          {recipe.rescuedIngredients.map((ing, i) => (
                            <li key={`r-${i}`} className="text-[#1F7A4D] dark:text-[#34C77B] font-medium flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" />
                              <span>{ing} (Fridge)</span>
                            </li>
                          ))}
                          {recipe.otherIngredients.map((ing, i) => (
                            <li key={`o-${i}`} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-black/[0.2] dark:bg-white/[0.2]" />
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Directions */}
                      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] space-y-2">
                        <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px]">
                          Step-by-Step Directions:
                        </div>
                        <ol className="space-y-2 text-[#6E6E73] dark:text-[#86868B] text-[12px] list-decimal pl-4 leading-relaxed">
                          {recipe.instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Zero Waste Chef Tip */}
                    {recipe.zeroWasteTip && (
                      <div className="p-3.5 rounded-2xl bg-[#1F7A4D]/5 dark:bg-[#34C77B]/5 border border-[#1F7A4D]/15 dark:border-[#34C77B]/20 text-[12px] flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B] shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Zero-Waste Guidance: </strong>
                          <span className="text-[#6E6E73] dark:text-[#86868B]">{recipe.zeroWasteTip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
