import React, { useState } from 'react';
import { Logo } from './Logo';
import { AppPortal, UserSession, AllergyProfile } from '../types';
import { SettingsDemoSheet } from './Navigation/SettingsDemoSheet';
import {
  UtensilsCrossed,
  Store,
  Building2,
  BarChart3,
  Shield,
  User,
  Calendar,
  HeartHandshake,
} from 'lucide-react';

interface NavbarProps {
  currentPortal: AppPortal;
  onSelectPortal: (portal: AppPortal) => void;
  currentUser: UserSession;
  onOpenAuth: () => void;
  allergyProfile: AllergyProfile;
  onOpenAllergySettings: () => void;
  onReplayIntro: () => void;
  onStartTour: () => void;
  onLoadDemoPreset: (presetId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPortal,
  onSelectPortal,
  currentUser,
  onOpenAuth,
  allergyProfile,
  onOpenAllergySettings,
  onReplayIntro,
  onStartTour,
  onLoadDemoPreset,
  theme,
  onToggleTheme,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const caps = currentUser.capabilities;

  const portals: { id: AppPortal; label: string; icon: React.ReactNode; permitted: boolean }[] = [
    {
      id: 'fridge-to-plate',
      label: 'Kitchen',
      icon: <UtensilsCrossed className="w-4 h-4" strokeWidth={1.5} />,
      permitted: caps.canUseFridgeToPlate,
    },
    {
      id: 'meal-planner',
      label: 'Planner',
      icon: <Calendar className="w-4 h-4" strokeWidth={1.5} />,
      permitted: caps.canUseFridgeToPlate,
    },
    {
      id: 'community-fridge',
      label: 'Neighborhood',
      icon: <HeartHandshake className="w-4 h-4" strokeWidth={1.5} />,
      permitted: true,
    },
    {
      id: 'donor-portal',
      label: 'Store',
      icon: <Store className="w-4 h-4" strokeWidth={1.5} />,
      permitted: caps.canUseSurplusDonor,
    },
    {
      id: 'foodbank-portal',
      label: 'Food Bank',
      icon: <Building2 className="w-4 h-4" strokeWidth={1.5} />,
      permitted: caps.canUseFoodBankInbox,
    },
    {
      id: 'impact-dashboard',
      label: 'Impact',
      icon: <BarChart3 className="w-4 h-4" strokeWidth={1.5} />,
      permitted: caps.canUseImpactDashboard,
    },
    {
      id: 'admin-console',
      label: 'Admin',
      icon: <Shield className="w-4 h-4" strokeWidth={1.5} />,
      permitted: caps.canAccessAdminConsole,
    },
  ];

  const permittedPortals = portals.filter((p) => p.permitted);

  return (
    <>
      {/* Desktop & Mobile Top Bar: Slim 52px Translucent Glass */}
      <header className="sticky top-0 z-40 w-full h-[52px] apple-glass border-b border-black/[0.06] dark:border-white/[0.08] transition-colors">
        <div className="max-w-[1080px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <button
            onClick={() => {
              if (caps.canUseFridgeToPlate) onSelectPortal('fridge-to-plate');
              else if (caps.canUseSurplusDonor) onSelectPortal('donor-portal');
              else if (caps.canUseFoodBankInbox) onSelectPortal('foodbank-portal');
              else onSelectPortal('impact-dashboard');
            }}
            className="flex items-center gap-2 focus:outline-none cursor-pointer"
            title="Return to home"
          >
            <Logo size="sm" />
          </button>

          {/* Center: Desktop Permitted Portal Links */}
          <nav className="hidden md:flex items-center gap-1">
            {permittedPortals.map((portal) => {
              const active = currentPortal === portal.id;
              return (
                <button
                  key={portal.id}
                  onClick={() => onSelectPortal(portal.id)}
                  className={`relative px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                    active
                      ? 'text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold'
                      : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  <span>{portal.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#1F7A4D] dark:bg-[#34C77B] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: ONLY the Avatar Button */}
          <div className="flex items-center">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.09] dark:bg-white/[0.10] dark:hover:bg-white/[0.16] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center font-medium text-[13px] border border-black/[0.06] dark:border-white/[0.10] transition-transform active:scale-95 cursor-pointer"
              title="Open Settings & Demos"
              aria-label="Settings and Demo Profiles"
            >
              {currentUser.displayName ? (
                currentUser.displayName.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (iOS style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[56px] apple-glass border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {permittedPortals.map((portal) => {
          const active = currentPortal === portal.id;
          return (
            <button
              key={portal.id}
              onClick={() => onSelectPortal(portal.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                active
                  ? 'text-[#1F7A4D] dark:text-[#34C77B]'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              <div className="transition-transform active:scale-95">
                {portal.icon}
              </div>
              <span className="text-[10px] font-medium mt-0.5 tracking-tight">
                {portal.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Settings & Demo Sheet */}
      <SettingsDemoSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        allergyProfile={allergyProfile}
        onOpenAllergySettings={onOpenAllergySettings}
        onStartTour={onStartTour}
        onReplayIntro={onReplayIntro}
        onLoadDemoPreset={onLoadDemoPreset}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    </>
  );
};
