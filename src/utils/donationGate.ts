import { FoodItem } from '../types';

export interface DonationEligibilityResult {
  isEligible: boolean;
  status: 'eligible' | 'rejected';
  reasons: string[];
  recommendedAlternative: 'Cook now' | 'Freeze today' | 'Safe storage' | 'Dispose safely';
  legalDisclaimer: string;
}

/**
 * Deterministic Donation Gate based on K-State MF3352 & Virginia Tech FST-431 Extension guidelines [NEW 2]
 * AI is NEVER allowed to override these pantry safety standards.
 */
export function evaluateDonationEligibility(item: Partial<FoodItem>, daysRemaining: number): DonationEligibilityResult {
  const reasons: string[] = [];

  // Rule 1: Must be sealed
  if (item.packageState !== 'sealed') {
    reasons.push('Package is opened or unsealed (food pantries legally cannot accept open packages due to contamination risk).');
  }

  // Rule 2: Must be shelf-stable (pantry), not refrigerated or requiring cold chain
  if (item.storage !== 'pantry') {
    reasons.push('Requires refrigeration or freezing (household donations cannot guarantee cold-chain continuity).');
  }

  // Rule 3: No homemade or leftovers
  if (item.isHomemadeOrLeftover) {
    reasons.push('Homemade or prepared leftovers cannot be accepted by food pantries under public health regulations.');
  }

  // Rule 4: No damaged packaging
  if (item.isDamaged) {
    reasons.push('Packaging is dented, rusted, or damaged, posing botulism or microbial risk.');
  }

  // Rule 5: Comfortably in date (at least 21 days remaining for pantry processing)
  if (daysRemaining < 21) {
    reasons.push(`Too close to expiration date (${daysRemaining} days left). Pantries require minimum 3 weeks buffer for distribution.`);
  }

  const isEligible = reasons.length === 0;

  let recommendedAlternative: 'Cook now' | 'Freeze today' | 'Safe storage' | 'Dispose safely' = 'Safe storage';
  if (!isEligible) {
    if (daysRemaining <= 1) {
      recommendedAlternative = 'Cook now';
    } else if (item.storage === 'fridge' && daysRemaining <= 3) {
      recommendedAlternative = 'Freeze today';
    } else {
      recommendedAlternative = 'Cook now';
    }
  }

  return {
    isEligible,
    status: isEligible ? 'eligible' : 'rejected',
    reasons,
    recommendedAlternative,
    legalDisclaimer: 'Always call your local food pantry first before bringing donations to confirm their current intake policies and hours.',
  };
}
