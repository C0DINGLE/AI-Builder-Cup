import { FoodKeeperRecord, StorageLocation, PackageState, ActionStatus } from '../types';

export const USDA_FOODKEEPER_DATABASE: FoodKeeperRecord[] = [
  {
    id: 'spinach-greens',
    name: 'Spinach / Leafy Greens',
    category: 'Produce',
    fridgeOpenedDays: 2,
    fridgeSealedDays: 6,
    freezerMonths: 10,
    handlingTip: 'Store with a dry paper towel to absorb condensation. Cook immediately if wilted.',
  },
  {
    id: 'chicken-raw',
    name: 'Raw Chicken / Poultry',
    category: 'Meat',
    fridgeOpenedDays: 1,
    fridgeSealedDays: 2,
    freezerMonths: 9,
    handlingTip: 'Keep on lowest fridge shelf below ready-to-eat foods to prevent cross-contamination.',
  },
  {
    id: 'ground-beef',
    name: 'Ground Beef / Meat',
    category: 'Meat',
    fridgeOpenedDays: 1,
    fridgeSealedDays: 2,
    freezerMonths: 4,
    handlingTip: 'Cook to safe internal temperature of 160°F or freeze on arrival.',
  },
  {
    id: 'salmon-fish',
    name: 'Fresh Fish / Salmon',
    category: 'Meat',
    fridgeOpenedDays: 1,
    fridgeSealedDays: 2,
    freezerMonths: 3,
    handlingTip: 'Store on ice in refrigerator; consume within 48 hours of purchase.',
  },
  {
    id: 'milk-dairy',
    name: 'Milk (Cow / Plant-based)',
    category: 'Dairy',
    fridgeOpenedDays: 4,
    fridgeSealedDays: 7,
    freezerMonths: 3,
    handlingTip: 'Store in main fridge compartment, not door shelves where temperature fluctuates.',
  },
  {
    id: 'yogurt-greek',
    name: 'Yogurt / Greek Yogurt',
    category: 'Dairy',
    fridgeOpenedDays: 7,
    fridgeSealedDays: 14,
    freezerMonths: 2,
    handlingTip: 'Water separation (whey) is natural; stir back in. Discard if mold appears.',
  },
  {
    id: 'cheddar-cheese',
    name: 'Cheddar & Hard Cheese',
    category: 'Dairy',
    fridgeOpenedDays: 21,
    fridgeSealedDays: 60,
    freezerMonths: 6,
    handlingTip: 'Wrap in parchment paper then foil to preserve breathing without drying.',
  },
  {
    id: 'eggs-shell',
    name: 'Fresh Eggs in Shell',
    category: 'Dairy',
    fridgeOpenedDays: 21,
    fridgeSealedDays: 35,
    freezerMonths: 0,
    handlingTip: 'Do not freeze in shell. Keep in original carton to prevent odor absorption.',
  },
  {
    id: 'canned-beans',
    name: 'Canned Beans / Vegetables',
    category: 'Pantry',
    pantryDays: 730, // 2 years
    fridgeOpenedDays: 4,
    freezerMonths: 2,
    handlingTip: 'After opening, transfer unused contents from metal can to an airtight glass container.',
  },
  {
    id: 'canned-tuna',
    name: 'Canned Tuna / Seafood',
    category: 'Pantry',
    pantryDays: 1095, // 3 years
    fridgeOpenedDays: 3,
    handlingTip: 'Pantry shelf-stable. Transfer to airtight dish once opened.',
  },
  {
    id: 'dry-pasta-rice',
    name: 'Dry Pasta / Rice / Grains',
    category: 'Pantry',
    pantryDays: 730,
    handlingTip: 'Keep in cool dry airtight container away from light.',
  },
  {
    id: 'sourdough-bread',
    name: 'Artisan Bread / Sliced Bread',
    category: 'Bakery',
    pantryDays: 5,
    fridgeOpenedDays: 10,
    freezerMonths: 3,
    handlingTip: 'Freezing sliced bread retains moisture better than refrigerating, which speeds staling.',
  },
  {
    id: 'bell-peppers',
    name: 'Bell Peppers',
    category: 'Produce',
    fridgeOpenedDays: 3,
    fridgeSealedDays: 10,
    freezerMonths: 8,
    handlingTip: 'Store unwashed in produce drawer. Slice and freeze seeds-out for stir fries.',
  },
  {
    id: 'berries-strawberries',
    name: 'Berries / Strawberries',
    category: 'Produce',
    fridgeOpenedDays: 2,
    fridgeSealedDays: 5,
    freezerMonths: 10,
    handlingTip: 'Do not rinse until immediately before eating to inhibit fungal spore growth.',
  },
  {
    id: 'apples',
    name: 'Fresh Apples',
    category: 'Produce',
    pantryDays: 7,
    fridgeOpenedDays: 7,
    fridgeSealedDays: 28,
    freezerMonths: 8,
    handlingTip: 'Refrigerate away from other greens; apples emit ethylene gas which ripens neighbors.',
  },
  {
    id: 'cooked-leftovers',
    name: 'Cooked Leftovers / Prepared Meals',
    category: 'Prepared',
    fridgeOpenedDays: 3,
    fridgeSealedDays: 4,
    freezerMonths: 3,
    handlingTip: 'Cool to below 40°F within 2 hours of cooking. Reheat thoroughly to 165°F.',
  },
];

/**
 * Searches the USDA FoodKeeper dataset for the closest matching item
 */
export function lookupFoodKeeper(itemName: string): FoodKeeperRecord {
  const normalized = itemName.toLowerCase().trim();
  const direct = USDA_FOODKEEPER_DATABASE.find(item =>
    normalized.includes(item.name.toLowerCase().split('/')[0].trim()) ||
    item.name.toLowerCase().includes(normalized)
  );

  if (direct) return direct;

  if (normalized.includes('spinach') || normalized.includes('lettuce') || normalized.includes('kale') || normalized.includes('salad')) {
    return USDA_FOODKEEPER_DATABASE[0];
  }
  if (normalized.includes('chicken') || normalized.includes('poultry') || normalized.includes('turkey')) {
    return USDA_FOODKEEPER_DATABASE[1];
  }
  if (normalized.includes('beef') || normalized.includes('pork') || normalized.includes('steak')) {
    return USDA_FOODKEEPER_DATABASE[2];
  }
  if (normalized.includes('fish') || normalized.includes('salmon') || normalized.includes('trout') || normalized.includes('shrimp')) {
    return USDA_FOODKEEPER_DATABASE[3];
  }
  if (normalized.includes('milk') || normalized.includes('creamer') || normalized.includes('oat milk')) {
    return USDA_FOODKEEPER_DATABASE[4];
  }
  if (normalized.includes('yogurt') || normalized.includes('kefir')) {
    return USDA_FOODKEEPER_DATABASE[5];
  }
  if (normalized.includes('cheese')) {
    return USDA_FOODKEEPER_DATABASE[6];
  }
  if (normalized.includes('egg')) {
    return USDA_FOODKEEPER_DATABASE[7];
  }
  if (normalized.includes('can') || normalized.includes('bean') || normalized.includes('lentil') || normalized.includes('soup')) {
    return USDA_FOODKEEPER_DATABASE[8];
  }
  if (normalized.includes('bread') || normalized.includes('bagel') || normalized.includes('muffin')) {
    return USDA_FOODKEEPER_DATABASE[11];
  }
  if (normalized.includes('pepper') || normalized.includes('carrot') || normalized.includes('onion') || normalized.includes('celery')) {
    return USDA_FOODKEEPER_DATABASE[12];
  }
  if (normalized.includes('berry') || normalized.includes('fruit')) {
    return USDA_FOODKEEPER_DATABASE[13];
  }

  // Default conservative estimate
  return {
    id: 'generic-item',
    name: itemName,
    category: 'Pantry',
    fridgeOpenedDays: 3,
    fridgeSealedDays: 7,
    pantryDays: 14,
    freezerMonths: 3,
    handlingTip: 'Store at safe temperature; consume within standard FoodKeeper timeframe.',
  };
}

/**
 * Calculates estimated expiration date based on USDA FoodKeeper guidelines [NEW 3]
 */
export function calculateEstimatedExpiry(
  name: string,
  storage: StorageLocation,
  packageState: PackageState,
  baseDate: Date = new Date()
): { daysRemaining: number; expirationDate: string; isEstimated: boolean; record: FoodKeeperRecord } {
  const record = lookupFoodKeeper(name);
  let days = 3;

  if (storage === 'freezer') {
    days = (record.freezerMonths || 3) * 30;
  } else if (storage === 'pantry') {
    days = record.pantryDays || (packageState === 'opened' ? 7 : 30);
  } else {
    // fridge
    days = packageState === 'opened' ? (record.fridgeOpenedDays || 2) : (record.fridgeSealedDays || 6);
  }

  const expDate = new Date(baseDate);
  expDate.setDate(expDate.getDate() + days);

  return {
    daysRemaining: days,
    expirationDate: expDate.toISOString(),
    isEstimated: true, // Labeled estimate unless user typed real printed date
    record,
  };
}

/**
 * Evaluates the deterministic Action Board status & single next step [NEW 1]
 */
export function determineActionBoardStep(
  name: string,
  category: string,
  storage: StorageLocation,
  packageState: PackageState,
  daysRemaining: number,
  isHomemadeOrLeftover: boolean = false,
  isDamaged: boolean = false
): { actionStatus: ActionStatus; nextStepText: string } {
  // [NEW 2] Donation Gate: An item is Donate-eligible only if it is sealed, shelf-stable, undamaged and comfortably in date.
  // Food pantries commonly refuse opened, homemade, refrigerated and expired food.
  const isDonateEligible =
    packageState === 'sealed' &&
    storage === 'pantry' &&
    !isHomemadeOrLeftover &&
    !isDamaged &&
    daysRemaining >= 30;

  if (isDonateEligible) {
    return {
      actionStatus: 'donate-eligible',
      nextStepText: '"Call your local pantry first"',
    };
  }

  // Next steps for perishables and items needing action
  if (daysRemaining <= 1) {
    if (name.toLowerCase().includes('spinach') || name.toLowerCase().includes('greens')) {
      return {
        actionStatus: 'use-today',
        nextStepText: 'Cook now: omelette or sauteed side',
      };
    }
    if (name.toLowerCase().includes('chicken') || name.toLowerCase().includes('meat') || name.toLowerCase().includes('fish')) {
      return {
        actionStatus: 'use-today',
        nextStepText: 'Cook tonight, or freeze today',
      };
    }
    return {
      actionStatus: 'use-today',
      nextStepText: `Cook today or freeze immediately`,
    };
  }

  if (daysRemaining <= 3) {
    if (name.toLowerCase().includes('milk') || name.toLowerCase().includes('yogurt')) {
      return {
        actionStatus: 'use-soon',
        nextStepText: 'Use in pancakes or a smoothie',
      };
    }
    if (name.toLowerCase().includes('pepper') || name.toLowerCase().includes('vegetable')) {
      return {
        actionStatus: 'use-soon',
        nextStepText: 'Use in stir-fry or sheet pan roast',
      };
    }
    return {
      actionStatus: 'use-soon',
      nextStepText: `Plan in tomorrow's dinner`,
    };
  }

  return {
    actionStatus: 'stable',
    nextStepText: `Keep sealed in ${storage}; good for ~${daysRemaining} days`,
  };
}
