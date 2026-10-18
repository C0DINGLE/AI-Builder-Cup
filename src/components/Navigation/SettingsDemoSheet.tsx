import React from 'react';
import { Sheet } from '../common/Primitives';
import { UserSession, AllergyProfile } from '../../types';
import { useRegion } from '../../context/RegionContext';
import { RegionCode } from '../../types/region';
import {
  User,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Compass,
  RefreshCw,
  ChevronRight,
  Check,
  Volume2,
  VolumeX,
  Download,
} from 'lucide-react';
import { sounds } from '../../utils/audioEffects';

export interface SettingsDemoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onOpenAuth: () => void;
  allergyProfile: AllergyProfile;
  onOpenAllergySettings: () => void;
  onStartTour: () => void;
  onReplayIntro: () => void;
  onLoadDemoPreset: (presetId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const SettingsDemoSheet: React.FC<SettingsDemoSheetProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  allergyProfile,
  onOpenAllergySettings,
  onStartTour,
  onReplayIntro,
  onLoadDemoPreset,
  theme,
  onToggleTheme,
}) => {
  const { region, setRegion, config, allRegions } = useRegion();
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [showInstallHelp, setShowInstallHelp] = React.useState(false);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Demos"
      description="Manage role, dietary preferences, region, and sample data."
      maxWidth="md"
    >
      <div className="space-y-6 text-[14px]">
        {/* Group 1: Profile & Active Persona */}
        <div>
          <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-2 mb-2">
            Account & Role
          </div>
          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] overflow-hidden">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B] text-white flex items-center justify-center font-semibold text-[15px]">
                  {currentUser.displayName ? currentUser.displayName.charAt(0) : <User className="w-5 h-5" strokeWidth={1.5} />}
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {currentUser.displayName || 'Current User'}
                  </div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1.5 mt-0.5">
                    <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{currentUser.organization || currentUser.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[13px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                <span>Switch</span>
                <ChevronRight className="w-4 h-4 text-[#86868B]" strokeWidth={1.5} />
              </div>
            </button>
          </div>
        </div>

        {/* Group 2: Diet & Allergies */}
        <div>
          <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-2 mb-2">
            Safety & Diet
          </div>
          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] overflow-hidden">
            <button
              onClick={() => {
                onClose();
                onOpenAllergySettings();
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <ShieldCheck className="w-5 h-5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Allergies & Dietary Safeguards
                  </div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                    {allergyProfile.allergies.length > 0
                      ? `${allergyProfile.allergies.join(', ')} protected`
                      : 'No active allergies configured'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[13px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                <span>Configure</span>
                <ChevronRight className="w-4 h-4 text-[#86868B]" strokeWidth={1.5} />
              </div>
            </button>
          </div>
        </div>

        {/* Group 3: Region & Compliance Engine */}
        <div>
          <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-2 mb-2">
            Operational Hub & Statutory Framework
          </div>
          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] p-3 space-y-1">
            <div className="px-2 py-1 text-[12px] text-[#6E6E73] dark:text-[#86868B] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#86868B]" strokeWidth={1.5} />
                <span>Operating under <strong>{config.foodSafety.name}</strong></span>
              </span>
              <span>{config.currency.code} ({config.currency.symbol})</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
              {allRegions.map((r) => {
                const isSelected = r.code === region;
                return (
                  <button
                    key={r.code}
                    onClick={() => setRegion(r.code as RegionCode)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-white dark:bg-[#2C2C2E] border-black/[0.08] dark:border-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm font-semibold'
                        : 'border-transparent text-[#6E6E73] dark:text-[#86868B] hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none">{r.flag}</span>
                      <span className="text-[13px] truncate">{r.shortName}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#1F7A4D] dark:text-[#34C77B] shrink-0" strokeWidth={2} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Group 4: Demo Presets */}
        <div>
          <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-2 mb-2">
            Sample Demo Presets
          </div>
          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.06]">
            <button
              onClick={() => {
                onLoadDemoPreset('preset-fridge');
                onClose();
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Fridge Scan Demo
                  </div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    Fresh produce & dairy inventory sample
                  </div>
                </div>
              </div>
              <span className="text-[13px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">Load</span>
            </button>

            <button
              onClick={() => {
                onLoadDemoPreset('preset-receipt');
                onClose();
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Receipt OCR Demo
                  </div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    Supermarket grocery run sample
                  </div>
                </div>
              </div>
              <span className="text-[13px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">Load</span>
            </button>
          </div>
        </div>

        {/* Group 5: Appearance & Tour */}
        <div>
          <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-2 mb-2">
            Appearance & System
          </div>
          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.06]">
            {/* Theme row */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-[#F5F5F7]" strokeWidth={1.5} />
                  ) : (
                    <Sun className="w-5 h-5 text-[#1D1D1F]" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Appearance
                  </div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    Currently in {theme === 'dark' ? 'Dark' : 'Light'} Mode
                  </div>
                </div>
              </div>
              <button
                onClick={onToggleTheme}
                className="apple-pill-btn px-4 py-1.5 rounded-full bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.12] text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm cursor-pointer"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* UI Audio Feedback row */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
                  ) : (
                    <VolumeX className="w-5 h-5 text-[#86868B]" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    UI Audio Feedback
                  </div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    {soundEnabled ? 'Synthesized chimes active' : 'Muted'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  sounds.setMuted(!next);
                  if (next) sounds.playSuccessChime();
                }}
                className="apple-pill-btn px-4 py-1.5 rounded-full bg-white dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.12] text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm cursor-pointer"
              >
                {soundEnabled ? 'Mute' : 'Enable'}
              </button>
            </div>

            {/* PWA Install row */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center">
                    <Download className="w-5 h-5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      Install App to Device
                    </div>
                    <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                      PWA home-screen launcher &amp; offline cache
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallHelp(!showInstallHelp)}
                  className="apple-pill-btn px-4 py-1.5 rounded-full bg-[#1F7A4D] text-white text-[13px] font-medium shadow-sm hover:bg-[#18603C] cursor-pointer"
                >
                  Install Guide
                </button>
              </div>

              {showInstallHelp && (
                <div className="mt-2 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] text-[12px] text-[#6E6E73] dark:text-[#86868B] space-y-1">
                  <div><strong>iOS Safari:</strong> Tap the Share button (⎋), then scroll down and tap &quot;Add to Home Screen&quot;.</div>
                  <div><strong>Chrome / Android / Desktop:</strong> Click the Install icon in the browser address bar or menu (⋮) $\rightarrow$ &quot;Install NourishLoop&quot;.</div>
                </div>
              )}
            </div>

            {/* Tour row */}
            <button
              onClick={() => {
                onClose();
                onStartTour();
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-[#86868B]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Interactive Platform Tour
                  </div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    Walkthrough of the full closed loop
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#86868B]" strokeWidth={1.5} />
            </button>

            {/* Replay Intro */}
            <button
              onClick={() => {
                onClose();
                onReplayIntro();
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-[#86868B]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Replay Introduction
                  </div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    View opening message
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#86868B]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
