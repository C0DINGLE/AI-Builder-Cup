import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { FoodItem, SurplusLot, SurplusClaimRequest, UserSession, UserRole, UserCapabilities } from './types';
import { RegionCode } from './types/region';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore Error Handling matching Skill Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network connectivity.');
    } else {
      console.log('Firebase online check completed.');
    }
    return false;
  }
}

// Run test connection asynchronously on module load
testConnection();

// Authentication helpers
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logOut(): Promise<void> {
  await fbSignOut(auth);
}

// User Profile Sync with Firestore
export async function syncUserProfile(
  user: FirebaseUser,
  preferredRole?: UserRole,
  organization?: string,
  capabilities?: UserCapabilities,
  locationSegregation?: {
    registeredRegion?: RegionCode;
    registeredLocation?: string;
    registeredFacilityId?: string;
    registeredAddress?: string;
  }
): Promise<UserSession> {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(userRef);
    const isOwnerEmail = user.email === 'mujtabakhurram2@gmail.com';

    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: user.uid,
        email: user.email || data.email,
        displayName: user.displayName || data.displayName || 'Authenticated User',
        role: isOwnerEmail ? 'admin' : (data.role as UserRole) || 'household',
        organization: data.organization || organization || 'Community Kitchen',
        capabilities: data.capabilities || capabilities || {
          canUseFridgeToPlate: true,
          canUseSurplusDonor: isOwnerEmail || data.role === 'donor_store' || data.role === 'dual_user',
          canUseFoodBankInbox: isOwnerEmail || data.role === 'foodbank_coordinator',
          canUseImpactDashboard: true,
          canAccessAdminConsole: isOwnerEmail || data.role === 'admin',
        },
        isDemoUser: false,
        registeredRegion: data.registeredRegion || locationSegregation?.registeredRegion,
        registeredLocation: data.registeredLocation || locationSegregation?.registeredLocation,
        registeredFacilityId: data.registeredFacilityId || locationSegregation?.registeredFacilityId,
        registeredAddress: data.registeredAddress || locationSegregation?.registeredAddress,
      };
    } else {
      // Create initial profile
      const role: UserRole = isOwnerEmail ? 'admin' : (preferredRole || 'household');
      const defaultCaps: UserCapabilities = capabilities || {
        canUseFridgeToPlate: role === 'household' || role === 'dual_user' || role === 'admin',
        canUseSurplusDonor: role === 'donor_store' || role === 'dual_user' || role === 'admin',
        canUseFoodBankInbox: role === 'foodbank_coordinator' || role === 'admin',
        canUseImpactDashboard: true,
        canAccessAdminConsole: role === 'admin',
      };

      const newUserData = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Community Member',
        role,
        organization: organization || (role === 'donor_store' ? 'Local Grocer' : role === 'foodbank_coordinator' ? 'Community Food Bank' : 'Household Kitchen'),
        capabilities: defaultCaps,
        allergies: [],
        dietaryPreferences: [],
        createdAt: new Date().toISOString(),
        registeredRegion: locationSegregation?.registeredRegion || 'US',
        registeredLocation: locationSegregation?.registeredLocation || organization || 'Registered Facility',
        registeredFacilityId: locationSegregation?.registeredFacilityId || '',
        registeredAddress: locationSegregation?.registeredAddress || '',
      };

      await setDoc(userRef, newUserData);

      return {
        uid: user.uid,
        email: newUserData.email,
        displayName: newUserData.displayName,
        role: newUserData.role,
        organization: newUserData.organization,
        capabilities: newUserData.capabilities,
        isDemoUser: false,
        registeredRegion: newUserData.registeredRegion as RegionCode,
        registeredLocation: newUserData.registeredLocation,
        registeredFacilityId: newUserData.registeredFacilityId,
        registeredAddress: newUserData.registeredAddress,
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to User's Household Inventory
export function subscribeToInventory(
  userId: string,
  onUpdate: (items: FoodItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const invPath = 'inventory';
  const q = query(collection(db, invPath), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FoodItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name,
          category: data.category,
          quantity: data.quantity,
          storage: data.storage,
          packageState: data.packageState,
          dateAdded: data.dateAdded,
          expirationDate: data.expirationDate,
          isEstimated: data.isEstimated,
          confidence: data.confidence,
          actionStatus: data.actionStatus,
          nextStepText: data.nextStepText,
        });
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, invPath);
      onError?.(error);
    }
  );
}

// Inventory CRUD
export async function saveInventoryItem(userId: string, item: FoodItem): Promise<void> {
  const path = `inventory/${item.id}`;
  try {
    await setDoc(doc(db, 'inventory', item.id), {
      ...item,
      userId,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeInventoryItem(itemId: string): Promise<void> {
  const path = `inventory/${itemId}`;
  try {
    await deleteDoc(doc(db, 'inventory', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Surplus Lots Subscriptions and Updates
export function subscribeToSurplusLots(
  onUpdate: (lots: SurplusLot[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'surplus_lots';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const lots: SurplusLot[] = [];
      snapshot.forEach((d) => {
        lots.push({ id: d.id, ...d.data() } as SurplusLot);
      });
      onUpdate(lots);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError?.(error);
    }
  );
}

export async function saveSurplusLot(lot: SurplusLot): Promise<void> {
  const path = `surplus_lots/${lot.id}`;
  try {
    await setDoc(doc(db, 'surplus_lots', lot.id), lot);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Claim Requests Subscriptions and Updates
export function subscribeToClaimRequests(
  userId: string,
  isStore: boolean,
  onUpdate: (claims: SurplusClaimRequest[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'claim_requests';
  const filterField = isStore ? 'storeId' : 'foodBankId';
  const q = query(collection(db, path), where(filterField, '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const claims: SurplusClaimRequest[] = [];
      snapshot.forEach((d) => {
        claims.push({ id: d.id, ...d.data() } as SurplusClaimRequest);
      });
      onUpdate(claims);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError?.(error);
    }
  );
}

export async function saveClaimRequest(claim: SurplusClaimRequest): Promise<void> {
  const path = `claim_requests/${claim.id}`;
  try {
    await setDoc(doc(db, 'claim_requests', claim.id), claim);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateClaimRequestStatus(
  claimId: string,
  status: SurplusClaimRequest['status'],
  extras?: { rejectionReason?: string; driverEtaMinutes?: number; driverNotes?: string }
): Promise<void> {
  const path = `claim_requests/${claimId}`;
  try {
    await updateDoc(doc(db, 'claim_requests', claimId), {
      status,
      ...extras,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
