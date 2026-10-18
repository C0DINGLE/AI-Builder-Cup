import React, { useState } from 'react';
import { useRegion } from '../../context/RegionContext';
import { RegionCode, RegionConfig } from '../../types/region';
import { UserSession } from '../../types';
import {
  Globe,
  Check,
  Search,
  X,
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  Scale,
  Sparkles,
  AlertCircle,
  Lock
} from 'lucide-react';

interface LocationSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserSession;
}

export const LocationSwitcherModal: React.FC<LocationSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { region, setRegion, config, allRegions } = useRegion();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const isB2BUser = currentUser?.role === 'donor_store' || currentUser?.role === 'foodbank_coordinator';
  const registeredRegion = currentUser?.registeredRegion;

  const filteredRegions = allRegions.filter((reg) => {
    const q = search.toLowerCase();
    return (
      reg.name.toLowerCase().includes(q) ||
      reg.shortName.toLowerCase().includes(q) ||
      reg.code.toLowerCase().includes(q) ||
      reg.metroHub.toLowerCase().includes(q) ||
      reg.currency.code.toLowerCase().includes(q) ||
      reg.foodSafety.name.toLowerCase().includes(q)
    );
  });

  const handleSelectRegion = (code: RegionCode) => {
    setRegion(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden my-6 transition-colors">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Globe className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 flex items-center gap-1.5">
                <span>Multi-Region Architecture</span>
                <span>•</span>
                <span>US &amp; APAC Operating Hubs</span>
              </div>
              <h3 className="text-xl font-black mt-0.5">
                Select Operational Jurisdiction &amp; Currency
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Close location switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Organization Binding Banner (For Food Banks & Donors) */}
          {isB2BUser && registeredRegion && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">
                  Organization Registered Jurisdiction: {allRegions.find(r => r.code === registeredRegion)?.name || registeredRegion}
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  {currentUser?.organization || 'Your facility'} is certified under {allRegions.find(r => r.code === registeredRegion)?.foodSafety.name || 'local food regulations'}. You can switch views to test regional simulation or preview other jurisdictions.
                </p>
              </div>
            </div>
          )}

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by country, currency (USD, JPY, AUD), metro hub (Tokyo, Sydney), or authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Country Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredRegions.map((reg) => {
              const isSelected = reg.code === region;
              const isRegistered = reg.code === registeredRegion;

              return (
                <div
                  key={reg.code}
                  onClick={() => handleSelectRegion(reg.code)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top line: Flag, Name, Currency Tag, Checkmark */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl leading-none select-none">{reg.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">
                              {reg.name}
                            </h4>
                            {isRegistered && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                Registered
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {reg.metroHub}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                          {reg.currency.symbol} {reg.currency.code}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Regional Attributes Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        📏 {reg.weightUnit} • {reg.distanceUnit} • {reg.tempUnit}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-medium truncate max-w-[210px]" title={reg.foodSafety.name}>
                        🛡️ {reg.foodSafety.name.split('&')[0]}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      🏛️ Tax Form: <strong className="text-slate-700 dark:text-slate-300">{reg.taxAudit.formTitle.split(':')[0]}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Dietary: {reg.nutrition.name.split(' ')[0]}
                    </span>
                    <span className={`font-bold transition-colors ${
                      isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                    }`}>
                      {isSelected ? 'Active Location' : 'Switch to this Region →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Informational Footer */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                All currencies, radar coordinates, donation laws, dietary guidelines, and tax deductions auto-adapt instantly upon selection.
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
