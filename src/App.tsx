import React, { useState, useEffect } from 'react';
import { FoodItem, SurplusLot, SurplusClaimRequest, AllergyProfile, UserSession, AppPortal, UserAccount, FoodBank } from './types';
import { INITIAL_SURPLUS_LOTS, INITIAL_CLAIM_REQUESTS, FICTIONAL_FOOD_BANKS } from './data/mockSurplusData';
import { DEMO_PRESETS } from './data/demoPhotos';
import { determineActionBoardStep, calculateEstimatedExpiry } from './data/foodkeeperData';
import { Navbar } from './components/Navbar';
import { LaunchAnimation } from './components/LaunchAnimation';
import { OnboardingTour } from './components/OnboardingTour';
import { AIChatbot } from './components/Chatbot/AIChatbot';
import { FridgeToPlateView } from './components/FridgeToPlate/FridgeToPlateView';
import { MealPlannerView } from './components/FridgeToPlate/MealPlannerView';
import { CommunityFridgeView } from './components/CommunityFridge/CommunityFridgeView';
import { DonorPortalView } from './components/SurplusRescue/DonorPortalView';
import { FoodBankPortalView } from './components/SurplusRescue/FoodBankPortalView';
import { MatcherGrid } from './components/SurplusRescue/MatcherGrid';
import { InventoryUploadModal } from './components/SurplusRescue/InventoryUploadModal';
import { ImpactDashboard } from './components/ImpactDashboard';
import { UserManagementView } from './components/Admin/UserManagementView';
import { AllergySettingsModal } from './components/AllergySettingsModal';
import { AuthModal } from './components/AuthModal';
import { Logo } from './components/Logo';
import {
  auth,
  syncUserProfile,
  subscribeToInventory,
  saveInventoryItem,
  subscribeToSurplusLots,
  saveSurplusLot,
  subscribeToClaimRequests,
  saveClaimRequest,
  updateClaimRequestStatus,
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Cloud, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRegion } from './context/RegionContext';

export default function App() {
  const { region, config, foodBanks, storeName, getSurplusLots, getClaimRequests } = useRegion();
  const [showLaunchIntro, setShowLaunchIntro] = useState<boolean>(() => {
    return localStorage.getItem('nourishloop_intro_seen') !== 'true';
  });

  const [showTour, setShowTour] = useState<boolean>(false);
  const [currentPortal, setCurrentPortal] = useState<AppPortal>('fridge-to-plate');
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'demo'>('demo');

  // Light / Dark Theme State with persistence and system preference detection
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nourishloop_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nourishloop_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Registered user accounts for Admin User Management
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([
    {
      id: 'acc-1',
      name: 'Maria Sanchez',
      email: 'maria.chef@household.org',
      role: 'household',
      organization: 'Sanchez Family Kitchen',
      capabilities: {
        canUseFridgeToPlate: true,
        canUseSurplusDonor: false,
        canUseFoodBankInbox: false,
        canUseImpactDashboard: true,
        canAccessAdminConsole: false,
      },
      status: 'active',
      createdAt: 'Oct 10, 2026',
      lastLogin: 'Today, 8:45 AM',
    },
    {
      id: 'acc-2',
      name: 'Marcus Vance',
      email: 'marcus.vance@greenmarket.com',
      role: 'donor_store',
      organization: 'GreenMarket Superstore #104',
      capabilities: {
        canUseFridgeToPlate: false,
        canUseSurplusDonor: true,
        canUseFoodBankInbox: false,
        canUseImpactDashboard: true,
        canAccessAdminConsole: false,
      },
      status: 'active',
      createdAt: 'Oct 8, 2026',
      lastLogin: 'Today, 7:15 AM',
    },
    {
      id: 'acc-3',
      name: 'Elena Rostova',
      email: 'elena@rivervalleyfoodbank.org',
      role: 'foodbank_coordinator',
      organization: 'River Valley Regional Food Bank',
      capabilities: {
        canUseFridgeToPlate: false,
        canUseSurplusDonor: false,
        canUseFoodBankInbox: true,
        canUseImpactDashboard: true,
        canAccessAdminConsole: false,
      },
      status: 'active',
      createdAt: 'Oct 5, 2026',
      lastLogin: 'Yesterday',
    },
    {
      id: 'acc-4',
      name: 'Jordan Lee',
      email: 'jordan.lee@communitychef.org',
      role: 'dual_user',
      organization: 'Community Kitchen & Pantry',
      capabilities: {
        canUseFridgeToPlate: true,
        canUseSurplusDonor: true,
        canUseFoodBankInbox: false,
        canUseImpactDashboard: true,
        canAccessAdminConsole: false,
      },
      status: 'active',
      createdAt: 'Oct 12, 2026',
      lastLogin: 'Today, 9:10 AM',
    },
    {
      id: 'acc-5',
      name: 'Alex Thorne',
      email: 'admin@nourishloop.org',
      role: 'admin',
      organization: 'NourishLoop Operations Hub',
      capabilities: {
        canUseFridgeToPlate: true,
        canUseSurplusDonor: true,
        canUseFoodBankInbox: true,
        canUseImpactDashboard: true,
        canAccessAdminConsole: true,
      },
      status: 'active',
      createdAt: 'Oct 1, 2026',
      lastLogin: 'Just now',
    },
  ]);

  // Active User session state (Defaults to Household cook, or adapts)
  const [currentUser, setCurrentUser] = useState<UserSession>({
    uid: 'demo-household-01',
    email: 'maria.chef@household.org',
    displayName: 'Maria Sanchez',
    role: 'household',
    organization: 'Sanchez Family Kitchen',
    capabilities: {
      canUseFridgeToPlate: true,
      canUseSurplusDonor: false,
      canUseFoodBankInbox: false,
      canUseImpactDashboard: true,
      canAccessAdminConsole: false,
    },
    isDemoUser: true,
  });

  // Household inventory initialized with the staged examples from Hackathon Proposal Page 2
  const [inventoryItems, setInventoryItems] = useState<FoodItem[]>(() => {
    const rawStaged = [
      { name: 'Spinach (opened bag)', category: 'Produce' as const, quantity: '1 bag', storage: 'fridge' as const, packageState: 'opened' as const, daysRemaining: 1 },
      { name: 'Raw Chicken Breast', category: 'Meat' as const, quantity: '2 cutlets (1 lb)', storage: 'fridge' as const, packageState: 'sealed' as const, daysRemaining: 2 },
      { name: 'Whole Milk (opened)', category: 'Dairy' as const, quantity: '1/3 gallon', storage: 'fridge' as const, packageState: 'opened' as const, daysRemaining: 3 },
      { name: 'Canned Black Beans (3 sealed)', category: 'Pantry' as const, quantity: '3 cans (15 oz)', storage: 'pantry' as const, packageState: 'sealed' as const, daysRemaining: 540 },
      { name: 'Greek Yogurt (Plain)', category: 'Dairy' as const, quantity: '1 tub (32 oz)', storage: 'fridge' as const, packageState: 'opened' as const, daysRemaining: 4 },
      { name: 'Red Bell Pepper', category: 'Produce' as const, quantity: '2 whole', storage: 'fridge' as const, packageState: 'sealed' as const, daysRemaining: 6 },
    ];

    return rawStaged.map((item, idx) => {
      const exp = calculateEstimatedExpiry(item.name, item.storage, item.packageState);
      const step = determineActionBoardStep(
        item.name,
        item.category,
        item.storage,
        item.packageState,
        item.daysRemaining
      );

      return {
        id: `initial-item-${idx}`,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        storage: item.storage,
        packageState: item.packageState,
        dateAdded: new Date().toISOString(),
        expirationDate: exp.expirationDate,
        isEstimated: true,
        confidence: 0.96,
        actionStatus: step.actionStatus,
        nextStepText: step.nextStepText,
      };
    });
  });

  // Commercial surplus lots across stores
  const [surplusLots, setSurplusLots] = useState<SurplusLot[]>(() => getSurplusLots());

  // Active claim requests placed by food banks
  const [claimRequests, setClaimRequests] = useState<SurplusClaimRequest[]>(() => getClaimRequests());

  // Automatically refresh surplus lots and claim requests when region is switched
  useEffect(() => {
    if (currentUser.isDemoUser) {
      setSurplusLots(getSurplusLots());
      setClaimRequests(getClaimRequests());
    }
  }, [region, currentUser.isDemoUser]);

  // Modals for Donor matching & POS upload
  const [matchingLot, setMatchingLot] = useState<SurplusLot | null>(null);
  const [showPOSModal, setShowPOSModal] = useState<boolean>(false);

  // Allergy Profile with Peanuts pre-set
  const [allergyProfile, setAllergyProfile] = useState<AllergyProfile>({
    allergies: ['Peanuts'],
    dietaryPreferences: [],
  });

  // Household dollar savings and community impact trackers
  const [weeklySavingsDollars, setWeeklySavingsDollars] = useState(24.50);
  const [totalMealsRescued, setTotalMealsRescued] = useState(148);
  const [totalPoundsDiverted, setTotalPoundsDiverted] = useState(177);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const session = await syncUserProfile(fbUser);
          setCurrentUser(session);
          setFirebaseStatus('connected');
        } catch (err) {
          console.error('Error syncing user profile:', err);
        }
      } else {
        setFirebaseStatus('demo');
      }
    });

    return () => unsubAuth();
  }, []);

  // Firestore Real-Time Subscriptions for Authenticated Users
  useEffect(() => {
    if (!currentUser.isDemoUser && auth.currentUser) {
      const unsubInv = subscribeToInventory(
        auth.currentUser.uid,
        (items) => {
          if (items.length > 0) {
            setInventoryItems(items);
          }
        },
        (err) => console.warn('Inventory subscribe notice:', err)
      );

      const unsubLots = subscribeToSurplusLots(
        (lots) => {
          if (lots.length > 0) {
            setSurplusLots(lots);
          }
        },
        (err) => console.warn('Surplus lots subscribe notice:', err)
      );

      const isStore = currentUser.role === 'donor_store';
      const unsubClaims = subscribeToClaimRequests(
        auth.currentUser.uid,
        isStore,
        (claims) => {
          if (claims.length > 0) {
            setClaimRequests(claims);
          }
        },
        (err) => console.warn('Claims subscribe notice:', err)
      );

      return () => {
        unsubInv();
        unsubLots();
        unsubClaims();
      };
    }
  }, [currentUser.isDemoUser, currentUser.uid, currentUser.role]);

  const handleLaunchComplete = (targetPortal?: AppPortal) => {
    localStorage.setItem('nourishloop_intro_seen', 'true');
    setShowLaunchIntro(false);

    const tourDone = localStorage.getItem('nourishloop_tour_done');
    if (tourDone !== 'true') {
      setShowTour(true);
    }

    if (targetPortal) {
      if (targetPortal === ('surplus-rescue' as any)) {
        setCurrentPortal('donor-portal');
      } else {
        setCurrentPortal(targetPortal);
      }
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem('nourishloop_tour_done', 'true');
    setShowTour(false);
  };

  const handleLoadDemoPreset = (presetId: string) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const mappedItems: FoodItem[] = preset.mockItems.map((m, idx) => {
      const exp = calculateEstimatedExpiry(m.name, m.storage, m.packageState);
      const step = determineActionBoardStep(m.name, m.category, m.storage, m.packageState, m.daysRemaining);

      return {
        id: `preset-item-${Date.now()}-${idx}`,
        name: m.name,
        category: m.category,
        quantity: m.quantity,
        storage: m.storage,
        packageState: m.packageState,
        dateAdded: new Date().toISOString(),
        expirationDate: exp.expirationDate,
        isEstimated: true,
        confidence: m.confidence,
        actionStatus: step.actionStatus,
        nextStepText: step.nextStepText,
      };
    });

    setInventoryItems(mappedItems);
    setCurrentPortal('fridge-to-plate');
  };

  const handleAddSavings = (dollars: number) => {
    setWeeklySavingsDollars((prev) => prev + dollars);
    setTotalPoundsDiverted((prev) => prev + Math.max(1, Math.round(dollars * 0.4)));
    setTotalMealsRescued((prev) => prev + Math.max(1, Math.round(dollars * 0.3)));
  };

  const handleLogCommercialRescue = (pounds: number) => {
    setTotalPoundsDiverted((prev) => prev + pounds);
    setTotalMealsRescued((prev) => prev + Math.round(pounds / 1.2));
  };

  // Sync user updates from AuthModal or Admin User Management
  const handleUpdateActiveUser = (updated: UserSession) => {
    setCurrentUser(updated);

    if (updated.role === 'household') {
      setCurrentPortal('fridge-to-plate');
    } else if (updated.role === 'donor_store') {
      setCurrentPortal('donor-portal');
    } else if (updated.role === 'foodbank_coordinator') {
      setCurrentPortal('foodbank-portal');
    } else if (updated.role === 'admin') {
      setCurrentPortal('admin-console');
    } else {
      setCurrentPortal('fridge-to-plate');
    }
  };

  // Update Inventory with Firestore Sync
  const handleUpdateInventory = async (newItems: FoodItem[]) => {
    setInventoryItems(newItems);
    if (!currentUser.isDemoUser && auth.currentUser) {
      for (const item of newItems) {
        await saveInventoryItem(auth.currentUser.uid, item).catch(console.error);
      }
    }
  };

  // Food Bank places a claim request
  const handlePlaceClaimRequest = async (newRequest: SurplusClaimRequest) => {
    setClaimRequests((prev) => [newRequest, ...prev]);
    if (!currentUser.isDemoUser && auth.currentUser) {
      await saveClaimRequest(newRequest).catch(console.error);
    }
  };

  // Donor Store approves a claim request
  const handleApproveClaim = async (claimId: string) => {
    setClaimRequests((prev) =>
      prev.map((c) =>
        c.id === claimId ? { ...c, status: 'accepted' as const, driverEtaMinutes: 14 } : c
      )
    );
    if (!currentUser.isDemoUser && auth.currentUser) {
      await updateClaimRequestStatus(claimId, 'accepted', { driverEtaMinutes: 14 }).catch(console.error);
    }
  };

  // Donor Store rejects a claim request
  const handleRejectClaim = async (claimId: string, reason: string) => {
    setClaimRequests((prev) =>
      prev.map((c) =>
        c.id === claimId ? { ...c, status: 'rejected' as const, rejectionReason: reason } : c
      )
    );
    if (!currentUser.isDemoUser && auth.currentUser) {
      await updateClaimRequestStatus(claimId, 'rejected', { rejectionReason: reason }).catch(console.error);
    }
  };

  // Food bank confirms receipt of items
  const handleConfirmReceipt = async (claimId: string) => {
    const claim = claimRequests.find((c) => c.id === claimId);
    if (claim) {
      handleLogCommercialRescue(claim.requestedPounds);
      setClaimRequests((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: 'delivered' as const } : c))
      );
      if (!currentUser.isDemoUser && auth.currentUser) {
        await updateClaimRequestStatus(claimId, 'delivered').catch(console.error);
      }
    }
  };

  // Donor confirms matching a lot with a specific food bank
  const handleConfirmLotMatch = async (lot: SurplusLot, foodBank: FoodBank) => {
    const updatedLot: SurplusLot = {
      ...lot,
      status: 'matched' as const,
      matchedFoodBankId: foodBank.id,
      matchedFoodBankName: foodBank.name,
      pickupWindow: 'Today 4:00 PM – 5:30 PM',
    };

    setSurplusLots((prev) => prev.map((l) => (l.id === lot.id ? updatedLot : l)));
    setMatchingLot(null);

    if (!currentUser.isDemoUser && auth.currentUser) {
      await saveSurplusLot(updatedLot).catch(console.error);
    }

    const autoReq: SurplusClaimRequest = {
      id: `req-${Date.now()}`,
      lotId: lot.id,
      storeId: lot.storeId,
      storeName: lot.storeName,
      storeAddress: lot.storeAddress || 'Main Dock',
      department: lot.department,
      itemsSummary: lot.itemsSummary,
      foodBankId: foodBank.id,
      foodBankName: foodBank.name,
      requestedPounds: lot.totalPounds,
      proposedPickupTime: 'Today 4:00 PM – 5:30 PM',
      requiresColdStorage: lot.requiresColdStorage,
      status: 'accepted',
      requestedAt: 'Just now',
      driverEtaMinutes: 14,
      driverNotes: 'Store approved direct match. Refrigerated transport dispatched.',
    };
    setClaimRequests((prev) => [autoReq, ...prev]);

    if (!currentUser.isDemoUser && auth.currentUser) {
      await saveClaimRequest(autoReq).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col font-sans selection:bg-[#1F7A4D] selection:text-white transition-colors duration-200">
      {/* 1. Launch Animation & Intro Screen */}
      {showLaunchIntro && (
        <LaunchAnimation
          onComplete={(target) => {
            if (target === ('surplus-rescue' as any)) {
              handleLaunchComplete('donor-portal');
            } else {
              handleLaunchComplete(target);
            }
          }}
        />
      )}

      {/* 2. Interactive Guided Walkthrough Tour */}
      {showTour && (
        <OnboardingTour
          onComplete={handleTourComplete}
          onNavigatePortal={setCurrentPortal}
        />
      )}

      {/* 3. Main Segregated Navigation */}
      <Navbar
        currentPortal={currentPortal}
        onSelectPortal={setCurrentPortal}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        allergyProfile={allergyProfile}
        onOpenAllergySettings={() => setShowAllergyModal(true)}
        onReplayIntro={() => setShowLaunchIntro(true)}
        onStartTour={() => setShowTour(true)}
        onLoadDemoPreset={handleLoadDemoPreset}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Firebase Cloud Sync Banner */}
      {!currentUser.isDemoUser && (
        <div className="bg-black/[0.02] dark:bg-white/[0.04] border-b border-black/[0.04] dark:border-white/[0.06] px-4 py-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
          <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" />
              <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Cloud Sync</span>
              <span aria-hidden="true">·</span>
              <span>Firestore connected ({currentUser.email})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Segregated Workspace */}
      <main className="flex-1 max-w-[1080px] lg:max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-16">
        {/* A. Household Fridge to Plate View */}
        {currentPortal === 'fridge-to-plate' && currentUser.capabilities.canUseFridgeToPlate && (
          <FridgeToPlateView
            items={inventoryItems}
            onUpdateItems={handleUpdateInventory}
            allergyProfile={allergyProfile}
            weeklySavingsDollars={weeklySavingsDollars}
            onAddSavings={handleAddSavings}
          />
        )}

        {/* A2. Smart 7-Day Zero-Waste Meal Planner */}
        {currentPortal === 'meal-planner' && currentUser.capabilities.canUseFridgeToPlate && (
          <MealPlannerView
            inventory={inventoryItems}
            allergyProfile={allergyProfile}
            onCookRecipe={(recipe) => {
              // launches cooking assistant directly in the view
            }}
          />
        )}

        {/* A3. Neighborhood Loop Community Fridge Network */}
        {currentPortal === 'community-fridge' && (
          <CommunityFridgeView
            userInventory={inventoryItems}
            onItemDonatedToFridge={(itemName) => {
              // log community impact
              handleAddSavings(6.00);
            }}
          />
        )}

        {/* B. Store Donor Portal View (for Grocers & Store Managers) */}
        {currentPortal === 'donor-portal' && currentUser.capabilities.canUseSurplusDonor && (
          <DonorPortalView
            lots={surplusLots}
            claimRequests={claimRequests}
            onApproveClaim={handleApproveClaim}
            onRejectClaim={handleRejectClaim}
            onOfferLot={(lot) => {
              const updatedLot: SurplusLot = { ...lot, status: 'offered' as const };
              setSurplusLots((prev) =>
                prev.map((l) => (l.id === lot.id ? updatedLot : l))
              );
              if (!currentUser.isDemoUser && auth.currentUser) {
                saveSurplusLot(updatedLot).catch(console.error);
              }
            }}
            onInspectLot={(lot) => setMatchingLot(lot)}
            onOpenPOSModal={() => setShowPOSModal(true)}
            storeName={
              currentUser.registeredLocation ||
              (currentUser.organization && currentUser.organization !== 'GreenMarket Superstore #104'
                ? currentUser.organization
                : storeName)
            }
            storeId={currentUser.registeredFacilityId}
            currentUser={currentUser}
          />
        )}

        {/* C. Food Bank Portal View (for Non-Profit Food Banks & Pantries) */}
        {currentPortal === 'foodbank-portal' && currentUser.capabilities.canUseFoodBankInbox && (
          <FoodBankPortalView
            lots={surplusLots}
            claimRequests={claimRequests}
            onPlaceClaimRequest={handlePlaceClaimRequest}
            onConfirmReceipt={handleConfirmReceipt}
            currentFoodBank={
              foodBanks.find((fb) =>
                fb.name.toLowerCase().includes(currentUser.organization?.toLowerCase() || '')
              ) || foodBanks[0]
            }
          />
        )}

        {/* D. Impact Dashboard (Visible to all) */}
        {currentPortal === 'impact-dashboard' && (
          <ImpactDashboard
            totalMealsRescued={totalMealsRescued}
            totalPoundsDiverted={totalPoundsDiverted}
            householdSavings={weeklySavingsDollars}
          />
        )}

        {/* E. Admin Console (for System Operations) */}
        {currentPortal === 'admin-console' && currentUser.capabilities.canAccessAdminConsole && (
          <UserManagementView
            accounts={userAccounts}
            onUpdateAccount={(updated) => {
              setUserAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
              if (currentUser.email === updated.email) {
                setCurrentUser({
                  ...currentUser,
                  capabilities: updated.capabilities,
                  role: updated.role,
                });
              }
            }}
            onAddAccount={(created) => {
              setUserAccounts((prev) => [...prev, created]);
            }}
            onSwitchToUser={(targetAccount) => {
              handleUpdateActiveUser({
                uid: targetAccount.id,
                email: targetAccount.email,
                displayName: targetAccount.name,
                role: targetAccount.role,
                organization: targetAccount.organization,
                capabilities: targetAccount.capabilities,
                isDemoUser: true,
              });
            }}
          />
        )}
      </main>

      {/* Matcher Grid Modal [NEW 2: Cold Storage Enforcement] */}
      {matchingLot && (
        <MatcherGrid
          lot={matchingLot}
          onConfirmMatch={handleConfirmLotMatch}
          onClose={() => setMatchingLot(null)}
        />
      )}

      {/* POS Inventory Sync Modal */}
      {showPOSModal && (
        <InventoryUploadModal
          onClose={() => setShowPOSModal(false)}
          onApplyNewInventory={(newLots) => {
            setSurplusLots((prev) => [...newLots, ...prev]);
            if (!currentUser.isDemoUser && auth.currentUser) {
              for (const lot of newLots) {
                saveSurplusLot(lot).catch(console.error);
              }
            }
          }}
        />
      )}

      {/* 5. 24/7 AI Guide Chatbot */}
      <AIChatbot
        currentPortal={currentPortal}
        userRole={currentUser.role}
        capabilities={Object.entries(currentUser.capabilities)
          .filter(([_, v]) => v)
          .map(([k]) => k)}
        onNavigatePortal={setCurrentPortal}
      />

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onUpdateUser={handleUpdateActiveUser}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showAllergyModal && (
        <AllergySettingsModal
          profile={allergyProfile}
          onSaveProfile={setAllergyProfile}
          onClose={() => setShowAllergyModal(false)}
        />
      )}

      {/* Minimalist Apple Footer */}
      <footer className="mt-12 border-t border-black/[0.06] dark:border-white/[0.08] py-8 text-[12px] text-[#86868B]">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              NourishLoop
            </span>
            <span>•</span>
            <span>From food waste to food access</span>
          </div>

          <div className="text-[11px] text-[#86868B] text-center sm:text-right">
            ReFED 2026 • USDA FoodKeeper Dataset • Safe Pantry Extension Guidelines
          </div>
        </div>
      </footer>
    </div>
  );
}
