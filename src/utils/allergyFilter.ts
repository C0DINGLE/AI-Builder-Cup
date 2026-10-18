import { Recipe } from '../types';

export const COMMON_ALLERGENS_MAP: Record<string, string[]> = {
  Peanuts: ['peanut', 'peanuts', 'peanut butter', 'groundnut', 'arachis oil'],
  'Tree Nuts': ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'pine nut'],
  Dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein', 'ghee', 'dairy', 'curd'],
  Eggs: ['egg', 'eggs', 'egg white', 'egg yolk', 'mayonnaise', 'meringue', 'albumin'],
  'Gluten / Wheat': ['wheat', 'flour', 'bread', 'pasta', 'gluten', 'barley', 'rye', 'couscous', 'breadcrumbs'],
  Soy: ['soy', 'soy sauce', 'tofu', 'edamame', 'tamari', 'miso', 'tempeh', 'soya'],
  Shellfish: ['shrimp', 'crab', 'lobster', 'prawn', 'clam', 'mussel', 'oyster', 'scallop'],
  Fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'halibut', 'anchovy', 'sardine'],
  Sesame: ['sesame', 'tahini', 'sesame oil', 'sesame seeds'],
};

export const DIETARY_RESTRICTIONS_MAP: Record<string, string[]> = {
  Vegetarian: ['chicken', 'beef', 'pork', 'meat', 'bacon', 'fish', 'salmon', 'tuna', 'shrimp', 'poultry', 'steak', 'lamb'],
  Vegan: ['chicken', 'beef', 'pork', 'meat', 'bacon', 'fish', 'salmon', 'tuna', 'shrimp', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'honey', 'whey', 'ghee'],
  Halal: ['pork', 'bacon', 'ham', 'lard', 'alcohol', 'wine', 'beer'],
  Kosher: ['pork', 'bacon', 'ham', 'shellfish', 'shrimp', 'crab', 'lobster'],
};

export interface AllergyFilterResult {
  isSafe: boolean;
  violations: string[];
  cleanRecipes: Recipe[];
}

/**
 * Deterministic Post-Gemini Allergy Filter [NEW 4]
 * Plain code, not the AI, checks every ingredient and instruction for allergen keywords.
 * If any violation is found, it is either flagged or excluded.
 */
export function verifyRecipeAllergySafety(
  recipes: Recipe[],
  declaredAllergies: string[],
  dietaryPreferences: string[] = []
): { sanitizedRecipes: Recipe[]; blockedCount: number; violationsReport: Record<string, string[]> } {
  let blockedCount = 0;
  const violationsReport: Record<string, string[]> = {};

  const sanitizedRecipes = recipes.map(recipe => {
    const allRecipeText = [
      recipe.title,
      ...recipe.rescuedIngredients,
      ...recipe.otherIngredients,
      ...recipe.instructions,
    ].join(' ').toLowerCase();

    const detectedViolations: string[] = [];

    // Check declared allergies
    for (const allergy of declaredAllergies) {
      const keywords = COMMON_ALLERGENS_MAP[allergy] || [allergy.toLowerCase()];
      for (const kw of keywords) {
        // Regex word boundary match to avoid false positives (e.g. "milk" vs "buttermilk" or substring)
        const regex = new RegExp(`\\b${kw}s?\\b`, 'i');
        if (regex.test(allRecipeText)) {
          detectedViolations.push(`Contains allergen: ${allergy} (${kw})`);
          break;
        }
      }
    }

    // Check dietary restrictions
    for (const diet of dietaryPreferences) {
      const prohibitedKeywords = DIETARY_RESTRICTIONS_MAP[diet] || [];
      for (const kw of prohibitedKeywords) {
        const regex = new RegExp(`\\b${kw}s?\\b`, 'i');
        if (regex.test(allRecipeText)) {
          detectedViolations.push(`Violates ${diet} preference (${kw})`);
          break;
        }
      }
    }

    const isSafe = detectedViolations.length === 0;
    if (!isSafe) {
      blockedCount++;
      violationsReport[recipe.title] = detectedViolations;
    }

    return {
      ...recipe,
      allergySafe: isSafe,
      allergensDetected: detectedViolations,
    };
  });

  return {
    sanitizedRecipes,
    blockedCount,
    violationsReport,
  };
}
