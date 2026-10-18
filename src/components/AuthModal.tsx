import React, { useState, useEffect } from 'react';
import { UserSession, UserRole, UserCapabilities } from '../types';
import { RegionCode } from '../types/region';
import { Sheet, SegmentedControl } from './common/Primitives';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Check,
  Building2,
  UtensilsCrossed,
  Shield,
  LogIn,
  LogOut,
  CheckCircle2,
  Globe,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { auth, signInWithGoogle, logOut, syncUserProfile } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { REGIONS_DATA, REGIONAL_DONOR_STORES, REGIONAL_FOOD_BANKS } from '../data/regionsData';
import { useRegion } from '../context/RegionContext';

interface AuthModalProps {
  currentUser: UserSession;
  onUpdateUser: (user: UserSession) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  const { region: currentAppRegion, setRegion } = useRegion();
  const [activeTab, setActiveTab] = useState<'register' | 'demos'>('register');
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role || 'household');
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [emailInput, setEmailInput] = useState(currentUser.email || '');

  // Location segregation registration state
  const [regRegion, setRegRegion] = useState<RegionCode>(currentUser.registeredRegion || currentAppRegion || 'US');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    currentUser.registeredFacilityId || (selectedRole === 'donor_store' ? 'GM-104' : 'fb-river-valley')
  );
  const [customFacilityName, setCustomFacilityName] = useState('');
  const [customAddress, setCustomAddress] = useState('');

  const [notification, setNotification] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
    });
    return () => unsub();
  }, []);

  // Update default facility id when role or region changes
  useEffect(() => {
    if (selectedRole === 'donor_store') {
      const stores = REGIONAL_DONOR_STORES[regRegion] || REGIONAL_DONOR_STORES.US;
      if (stores.length > 0 && selectedFacilityId !== 'custom') {
        setSelectedFacilityId(stores[0].id);
      }
    } else if (selectedRole === 'foodbank_coordinator') {
      const fbs = REGIONAL_FOOD_BANKS[regRegion] || REGIONAL_FOOD_BANKS.US;
      if (fbs.length > 0 && selectedFacilityId !== 'custom') {
        setSelectedFacilityId(fbs[0].id);
      }
    }
  }, [selectedRole, regRegion]);

  const availableDonorStores = REGIONAL_DONOR_STORES[regRegion] || REGIONAL_DONOR_STORES.US;
  const availableFoodBanks = REGIONAL_FOOD_BANKS[regRegion] || REGIONAL_FOOD_BANKS.US;

  const demoPresets: Array<{
    role: UserRole;
    name: string;
    email: string;
    org: string;
    desc: string;
    region: RegionCode;
    facilityId: string;
    address: string;
    caps: UserCapabilities;
    icon: any;
  }> = [
    {
      role: 'household',
      name: 'Maria Sanchez',
      email: 'maria.chef@household.org',
      org: 'Sanchez Family Kitchen',
      desc: 'Household Cook: Flexible location. Unrestricted switching across all regions.',
      region: 'US',
      facilityId: 'household-us',
      address: '742 Evergreen Terrace, Seattle, WA',
      caps: { canUseFridgeToPlate: true, canUseSurplusDonor: false, canUseFoodBankInbox: false, canUseImpactDashboard: true, canAccessAdminConsole: false },
      icon: UtensilsCrossed,
    },
    {
      role: 'donor_store',
      name: 'Marcus Vance',
      email: 'marcus.vance@greenmarket.com',
      org: 'GreenMarket Superstore #104',
      desc: 'Store Manager: Locked to GreenMarket #104 (Seattle, US). Location-segregated.',
      region: 'US',
      facilityId: 'GM-104',
      address: '820 Oak Avenue, Downtown, Seattle',
      caps: { canUseFridgeToPlate: false, canUseSurplusDonor: true, canUseFoodBankInbox: false, canUseImpactDashboard: true, canAccessAdminConsole: false },
      icon: Building2,
    },
    {
      role: 'foodbank_coordinator',
      name: 'Elena Rostova',
      email: 'elena@rivervalleyfoodbank.org',
      org: 'River Valley Regional Food Bank',
      desc: 'Food Bank Director: Locked to River Valley (Seattle, US). Location-segregated.',
      region: 'US',
      facilityId: 'fb-river-valley',
      address: '1420 River Valley Rd, Industrial Dock 4, Seattle',
      caps: { canUseFridgeToPlate: false, canUseSurplusDonor: false, canUseFoodBankInbox: true, canUseImpactDashboard: true, canAccessAdminConsole: false },
      icon: ShieldCheck,
    },
    {
      role: 'donor_store',
      name: 'Kenji Takahashi (高橋 健司)',
      email: 'takahashi.k@seven-i.co.jp',
      org: 'Seven & i Mart Shinjuku Central (セブン＆アイ 新宿中央店)',
      desc: 'Tokyo Store Manager: Locked to Shinjuku Central (Tokyo, JP). Location-segregated.',
      region: 'JP',
      facilityId: 'GM-104',
      address: '1-4-8 Nishi-Shinjuku, Shinjuku-ku, Tokyo (東京都新宿区西新宿)',
      caps: { canUseFridgeToPlate: false, canUseSurplusDonor: true, canUseFoodBankInbox: false, canUseImpactDashboard: true, canAccessAdminConsole: false },
      icon: Building2,
    },
    {
      role: 'foodbank_coordinator',
      name: 'Yumi Tanaka (田中 由美)',
      email: 'ytanaka@2ndharvestjapan.org',
      org: 'Second Harvest Japan (セカンドハーベスト・ジャパン)',
      desc: 'Tokyo Food Bank Coordinator: Locked to Second Harvest (Tokyo, JP). Location-segregated.',
      region: 'JP',
      facilityId: 'fb-second-harvest-japan',
      address: '4-5-12 Asakusabashi, Taito-ku, Tokyo (東京都台東区浅草橋)',
      caps: { canUseFridgeToPlate: false, canUseSurplusDonor: false, canUseFoodBankInbox: true, canUseImpactDashboard: true, canAccessAdminConsole: false },
      icon: ShieldCheck,
    },
    {
      role: 'dual_user',
      name: 'Jordan Lee',
      email: 'jordan.lee@communitychef.org',
      org: 'Community Kitchen & Pantry',
      desc: 'Dual Chef: Combines household cooking recipes and community surplus donations.',
      region: 'US',
      facilityId: 'dual-seattle',
      address: '500 Pike St, Seattle, WA',
      caps: { canUseFridgeToPlate: true, canUseSurplusDonor: true, canUseFoodBankInbox: false, canUseImpactDashboard: true, canAccessAdminConsole: false },
      icon: Sparkles,
    },
    {
      role: 'admin',
      name: 'Alex Thorne',
      email: 'admin@nourishloop.org',
      org: 'NourishLoop Global Operations',
      desc: 'System Administrator: Full access + global user management console.',
      region: 'US',
      facilityId: 'admin-hq',
      address: 'NourishLoop Headquarters, Seattle & Remote',
      caps: { canUseFridgeToPlate: true, canUseSurplusDonor: true, canUseFoodBankInbox: true, canUseImpactDashboard: true, canAccessAdminConsole: true },
      icon: Shield,
    },
  ];

  const handleRegisterOrUpdate = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      let resolvedOrg = 'Household Kitchen';
      let resolvedFacilityId = '';
      let resolvedAddress = '';

      if (selectedRole === 'donor_store') {
        if (selectedFacilityId === 'custom') {
          resolvedOrg = customFacilityName || 'Certified Supermarket Facility';
          resolvedFacilityId = `custom-store-${Date.now()}`;
          resolvedAddress = customAddress || 'Registered Commercial Premises';
        } else {
          const matched = availableDonorStores.find((s) => s.id === selectedFacilityId) || availableDonorStores[0];
          resolvedOrg = matched.name;
          resolvedFacilityId = matched.id;
          resolvedAddress = matched.address;
        }
      } else if (selectedRole === 'foodbank_coordinator') {
        if (selectedFacilityId === 'custom') {
          resolvedOrg = customFacilityName || 'Certified Relief Distribution Hub';
          resolvedFacilityId = `custom-foodbank-${Date.now()}`;
          resolvedAddress = customAddress || 'Registered Non-Profit Warehouse';
        } else {
          const matched = availableFoodBanks.find((f) => f.id === selectedFacilityId) || availableFoodBanks[0];
          resolvedOrg = matched.name;
          resolvedFacilityId = matched.id;
          resolvedAddress = matched.address;
        }
      } else if (selectedRole === 'dual_user') {
        resolvedOrg = 'Community Kitchen & Pantry';
        resolvedFacilityId = 'dual-hub';
        resolvedAddress = '500 Pike St, Seattle, WA';
      }

      const caps: UserCapabilities = {
        canUseFridgeToPlate: selectedRole === 'household' || selectedRole === 'dual_user' || selectedRole === 'admin',
        canUseSurplusDonor: selectedRole === 'donor_store' || selectedRole === 'dual_user' || selectedRole === 'admin',
        canUseFoodBankInbox: selectedRole === 'foodbank_coordinator' || selectedRole === 'admin',
        canUseImpactDashboard: true,
        canAccessAdminConsole: selectedRole === 'admin',
      };

      const updatedUser: UserSession = {
        uid: fbUser?.uid || `usr-${Date.now()}`,
        displayName: displayName || (fbUser?.displayName || 'Registered Chef'),
        email: emailInput || (fbUser?.email || 'chef@nourishloop.org'),
        role: selectedRole,
        organization: resolvedOrg,
        capabilities: caps,
        isDemoUser: !fbUser,
        registeredRegion: selectedRole === 'household' ? undefined : regRegion,
        registeredLocation: selectedRole === 'household' ? undefined : resolvedOrg,
        registeredFacilityId: selectedRole === 'household' ? undefined : resolvedFacilityId,
        registeredAddress: selectedRole === 'household' ? undefined : resolvedAddress,
      };

      if (selectedRole === 'donor_store' || selectedRole === 'foodbank_coordinator') {
        setRegion(regRegion);
      }

      if (fbUser) {
        await syncUserProfile(fbUser, selectedRole);
      }

      onUpdateUser(updatedUser);
      setNotification('Profile saved successfully.');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to update profile.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (!user) {
        setNotification('Google sign-in completed in demo fallback mode.');
        return;
      }
      setFbUser(user);

      const caps: UserCapabilities = {
        canUseFridgeToPlate: selectedRole === 'household' || selectedRole === 'dual_user' || selectedRole === 'admin',
        canUseSurplusDonor: selectedRole === 'donor_store' || selectedRole === 'dual_user' || selectedRole === 'admin',
        canUseFoodBankInbox: selectedRole === 'foodbank_coordinator' || selectedRole === 'admin',
        canUseImpactDashboard: true,
        canAccessAdminConsole: selectedRole === 'admin',
      };

      const session: UserSession = {
        uid: user.uid,
        displayName: user.displayName || displayName || 'Google User',
        email: user.email || emailInput || 'user@example.com',
        role: selectedRole,
        organization: selectedRole === 'household' ? 'Household Kitchen' : 'Registered Commercial Partner',
        capabilities: caps,
        isDemoUser: false,
        registeredRegion: selectedRole === 'household' ? undefined : regRegion,
        registeredLocation: selectedRole === 'household' ? undefined : 'Registered Commercial Partner',
        registeredFacilityId: selectedRole === 'household' ? undefined : selectedFacilityId,
      };

      if (selectedRole === 'donor_store' || selectedRole === 'foodbank_coordinator') {
        setRegion(regRegion);
      }

      onUpdateUser(session);
      setNotification(`Authenticated as ${session.displayName}.`);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';

      if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
        setNotification('Sign-in window closed. You can switch personas below.');
      } else if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
        setAuthError('Sign-in popup was blocked by your browser. Use the demo personas below.');
      } else {
        setAuthError(message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      const fallback = demoPresets[0];
      onUpdateUser({
        uid: 'demo-household-01',
        displayName: fallback.name,
        email: fallback.email,
        role: fallback.role,
        organization: fallback.org,
        capabilities: fallback.caps,
        isDemoUser: true,
        registeredRegion: 'US',
        registeredLocation: fallback.org,
        registeredFacilityId: fallback.facilityId,
        registeredAddress: fallback.address,
      });
      setNotification('Signed out from Firebase Authentication.');
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to sign out.');
    }
  };

  const handleSelectDemoUser = (demo: (typeof demoPresets)[0]) => {
    const updated: UserSession = {
      uid: `demo-${demo.role}-${Date.now()}`,
      displayName: demo.name,
      email: demo.email,
      role: demo.role,
      organization: demo.org,
      capabilities: demo.caps,
      isDemoUser: true,
      registeredRegion: demo.region,
      registeredLocation: demo.org,
      registeredFacilityId: demo.facilityId,
      registeredAddress: demo.address,
    };
    setRegion(demo.region);
    onUpdateUser(updated);
    setNotification(`Switched profile to ${demo.name}.`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const isLocationSegregatedRole = selectedRole === 'donor_store' || selectedRole === 'foodbank_coordinator';

  const modalTabOptions = [
    { value: 'register' as const, label: 'Profile & Registration' },
    { value: 'demos' as const, label: `Personas (${demoPresets.length})` },
  ];

  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="Account &amp; Role Settings"
      description="Manage role-based permissions, regional registration, and test personas."
      maxWidth="md"
    >
      <div className="space-y-5 text-[13px]">
        {/* Segmented Control */}
        <SegmentedControl
          options={modalTabOptions}
          value={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          size="sm"
        />

        {notification && (
          <div className="p-3 rounded-[16px] bg-[#1F7A4D]/10 text-[#1F7A4D] dark:text-[#34C77B] text-[12px] font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>{notification}</span>
          </div>
        )}

        {authError && (
          <div className="p-3 rounded-[16px] bg-red-500/[0.08] text-red-600 dark:text-red-400 text-[12px]">
            {authError}
          </div>
        )}

        {/* TAB 1: REGISTRATION */}
        {activeTab === 'register' && (
          <div className="space-y-4">
            {/* Google Firebase Card */}
            <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px]">
                  {fbUser ? fbUser.displayName || 'Google Account' : 'Demo Profile'}
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                  {fbUser ? fbUser.email : 'Sign in to sync your cloud profile'}
                </div>
              </div>

              {fbUser ? (
                <button
                  onClick={handleSignOut}
                  className="px-4 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[12px] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="px-4 py-1.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[12px] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSigningIn ? 'Connecting...' : 'Connect Google'}
                </button>
              )}
            </div>

            {/* Role Options */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
                Primary Account Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'household' as const, title: 'Household Kitchen', desc: 'Fridge to plate, cooking, and flexible location.' },
                  { id: 'donor_store' as const, title: 'Store Donor', desc: 'Surplus forecasting, dispatch, locked to facility.' },
                  { id: 'foodbank_coordinator' as const, title: 'Food Bank Hub', desc: 'Surplus intake, cold custody, locked to facility.' },
                  { id: 'dual_user' as const, title: 'Dual Chef & Donor', desc: 'Household recipes plus community surplus rescue.' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                      selectedRole === r.id
                        ? 'bg-[#1F7A4D]/[0.06] dark:bg-[#34C77B]/[0.08] border-[#1F7A4D] dark:border-[#34C77B]'
                        : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12]'
                    }`}
                  >
                    <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px]">{r.title}</div>
                    <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 leading-snug">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maria Sanchez"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. maria@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
                />
              </div>
            </div>

            {/* Location Segregation */}
            {isLocationSegregatedRole ? (
              <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <Lock className="w-3.5 h-3.5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
                  <span>Facility Registration &amp; Location Lock</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#86868B] block">Jurisdiction</label>
                  <select
                    value={regRegion}
                    onChange={(e) => setRegRegion(e.target.value as RegionCode)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[12px] outline-none"
                  >
                    {Object.values(REGIONS_DATA).map((reg) => (
                      <option key={reg.code} value={reg.code}>
                        {reg.flag} {reg.name} ({reg.metroHub})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-[#86868B] block">Registered Facility</label>
                  {selectedRole === 'donor_store' ? (
                    <select
                      value={selectedFacilityId}
                      onChange={(e) => setSelectedFacilityId(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[12px] outline-none"
                    >
                      {availableDonorStores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name} — {store.address}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={selectedFacilityId}
                      onChange={(e) => setSelectedFacilityId(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[12px] outline-none"
                    >
                      {availableFoodBanks.map((fb) => (
                        <option key={fb.id} value={fb.id}>
                          {fb.name} — {fb.capacityRemainingLbs} lbs capacity
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ) : null}

            {/* Action button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRegisterOrUpdate}
                disabled={isSigningIn}
                className="w-full py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" strokeWidth={1.5} />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DEMO PERSONAS */}
        {activeTab === 'demos' && (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {demoPresets.map((demo) => {
              const isActive = currentUser.email === demo.email;

              return (
                <div
                  key={demo.email}
                  onClick={() => handleSelectDemoUser(demo)}
                  className={`p-3.5 rounded-[18px] border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isActive
                      ? 'bg-[#1F7A4D]/[0.06] dark:bg-[#34C77B]/[0.08] border-[#1F7A4D] dark:border-[#34C77B]'
                      : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px]">
                        {demo.name}
                      </span>
                      <span className="text-[11px] text-[#86868B] capitalize">
                        · {demo.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">{demo.org}</div>
                  </div>

                  <div className="shrink-0">
                    {isActive ? (
                      <span className="text-[11px] font-medium text-[#1F7A4D] dark:text-[#34C77B] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" strokeWidth={2} />
                        Active
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#86868B]" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
};
