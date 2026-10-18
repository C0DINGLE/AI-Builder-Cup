export type RegionCode = 'US' | 'JP' | 'AU' | 'SG' | 'IN' | 'KR';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateFromUSD: number;
  decimals: number;
  symbolPrefix: boolean;
}

export interface FoodSafetyAuthority {
  name: string;
  law: string;
  coldChainStandard: string;
  temperatureSafeHot: string;
  temperatureSafeCold: string;
  summary: string;
}

export interface TaxAndAuditStandard {
  countryName: string;
  taxAgency: string;
  formTitle: string;
  applicableSection: string;
  legalCitation: string;
  enhancedMultiplierText: string;
  corporateTaxBenefitDesc: string;
  esgFramework: string;
  tippingFeeUnitRatePerTon: number; // in local currency
  carbonFactorPerTon: number; // metric tons CO2e avoided per ton diverted
  waterFactorPerUnit: number; // liters/gallons preserved
  waterUnit: 'gal' | 'L';
}

export interface NutritionGuideline {
  name: string;
  issuingBody: string;
  produceTarget: number;
  proteinTarget: number;
  grainsTarget: number;
  dairyOrCalciumTarget: number;
  criticalNutrients: string;
  description: string;
}

export interface CulinaryProfile {
  cuisineTitle: string;
  pantryStaples: string[];
  commonSubstitutions: Record<string, string>;
  seasoningBase: string;
}

export interface NationalWasteBenchmark {
  reportTitle: string;
  yearlyWasteText: string;
  economicLossText: string;
  householdAnnualWasteText: string;
  foodInsecurityStat: string;
  landfillDivertedStandard: string;
}

export interface RegionConfig {
  code: RegionCode;
  name: string;
  shortName: string;
  flag: string;
  metroHub: string;
  currency: CurrencyConfig;
  weightUnit: 'lbs' | 'kg';
  distanceUnit: 'miles' | 'km';
  tempUnit: '°F' | '°C';
  foodSafety: FoodSafetyAuthority;
  taxAudit: TaxAndAuditStandard;
  nutrition: NutritionGuideline;
  culinary: CulinaryProfile;
  benchmarks: NationalWasteBenchmark;
}
