import { RegionCode } from './region';

export type StorageLocation = 'fridge' | 'freezer' | 'pantry';

export type PackageState = 'opened' | 'sealed';

export type ActionStatus = 'use-today' | 'use-soon' | 'stable' | 'donate-eligible';

export interface FoodItem {
  id: string;
  name: string;
  category: 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Pantry' | 'Frozen' | 'Prepared' | 'Beverage';
  quantity: string;
  storage: StorageLocation;
  packageState: PackageState;
  dateAdded: string;
  expirationDate: string; // ISO string
  isEstimated: boolean; // [NEW 3] Every estimated date must be labeled "estimate"
  confidence: number;
  actionStatus: ActionStatus; // [NEW 1] Action Board status
  nextStepText: string; // [NEW 1] Exactly one next step shown
  isHomemadeOrLeftover?: boolean;
  isDamaged?: boolean;
}

export interface FoodKeeperRecord {
  id: string;
  name: string;
  category: string;
  pantryDays?: number;
  fridgeOpenedDays?: number;
  fridgeSealedDays?: number;
  freezerMonths?: number;
  handlingTip: string;
}

export interface Recipe {
  id: string;
  title: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Intermediate';
  rescuedIngredients: string[];
  otherIngredients: string[];
  estimatedDollarsSaved: number;
  instructions: string[];
  zeroWasteTip: string;
  allergensDetected?: string[];
  allergySafe: boolean; // Verified by post-Gemini allergy filter
  description?: string;
  servings?: number;
}

export interface FoodBank {
  id: string;
  name: string;
  distanceMiles: number;
  address: string;
  acceptsRefrigerated: boolean; // [NEW 2] Whether it accepts cold/refrigerated food
  requiresSealedPackaging: boolean; // [NEW 2] Requires sealed in-date packaging
  capacityRemainingLbs: number;
  operatingHours: string;
  contactPerson: string;
  phone: string;
  matchingScore?: number;
  acceptedCategories: string[]; // e.g. ['Produce', 'Dairy', 'Meat & Seafood', 'Bakery', 'Pantry']
  certifications?: string[];
}

export interface SurplusLot {
  id: string;
  storeId: string;
  storeName: string;
  storeAddress?: string;
  storeContact?: string;
  department: 'Produce' | 'Dairy' | 'Bakery' | 'Prepared Deli' | 'Meat & Seafood';
  itemsSummary: string;
  totalPounds: number;
  estimatedValue: number;
  spoilageWindowHours: number;
  requiresColdStorage: boolean;
  requiresSealedPackaging: boolean;
  status: 'forecasted' | 'offered' | 'matched' | 'dispatched' | 'completed';
  matchedFoodBankId?: string;
  matchedFoodBankName?: string;
  pickupWindow?: string;
  uncertaintyNarrative?: string;
  forecastConfidence: number;
  createdAt: string;
}

export interface SurplusClaimRequest {
  id: string;
  lotId: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  department: string;
  itemsSummary: string;
  foodBankId: string;
  foodBankName: string;
  requestedPounds: number;
  proposedPickupTime: string;
  requiresColdStorage: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'in_transit' | 'delivered';
  requestedAt: string;
  driverEtaMinutes?: number;
  rejectionReason?: string;
  driverNotes?: string;
}

export interface AllergyProfile {
  allergies: string[];
  dietaryPreferences: string[];
}

export type AppPortal =
  | 'fridge-to-plate'
  | 'meal-planner'
  | 'community-fridge'
  | 'donor-portal'
  | 'foodbank-portal'
  | 'impact-dashboard'
  | 'admin-console';

export type UserRole = 'household' | 'donor_store' | 'foodbank_coordinator' | 'dual_user' | 'admin';

export interface UserCapabilities {
  canUseFridgeToPlate: boolean;
  canUseMealPlanner?: boolean;
  canUseCommunityFridge?: boolean;
  canUseSurplusDonor: boolean;
  canUseFoodBankInbox: boolean;
  canUseImpactDashboard: boolean;
  canAccessAdminConsole: boolean;
}

export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organization?: string;
  capabilities: UserCapabilities;
  isDemoUser?: boolean;
  registeredRegion?: RegionCode;
  registeredLocation?: string;
  registeredFacilityId?: string;
  registeredAddress?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  capabilities: UserCapabilities;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin: string;
  registeredRegion?: RegionCode;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    targetPortal: AppPortal;
  };
}
