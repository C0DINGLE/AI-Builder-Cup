import React, { useState } from 'react';
import { HelpCircle, Building2, Mail, Sparkles, CloudRain, Calendar, Database, Upload, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface SurplusExplanationBannerProps {
  activeRole: 'donor' | 'foodbank';
  onSwitchRole: (role: 'donor' | 'foodbank') => void;
  onOpenInventoryUpload: () => void;
}

export const SurplusExplanationBanner: React.FC<SurplusExplanationBannerProps> = ({
  activeRole,
  onSwitchRole,
  onOpenInventoryUpload,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Primary Role Switcher & Summary */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Proposal A: Commercial &amp; Non-Profit
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 underline underline-offset-4"
              >
                <span>How does this work?</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Surplus Rescue: Closing the Retailer Gap
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Supermarket managers forecast surplus 24–48 hours before spoilage, and the AI Matcher automatically pairs lots with certified food banks.
            </p>
          </div>

          {/* Perspective Toggle Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="p-1 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-1">
              <button
                onClick={() => onSwitchRole('donor')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeRole === 'donor'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Store Manager view"
              >
                <Building2 className="w-4 h-4" />
                <span>1. Store Manager (Donor)</span>
              </button>

              <button
                onClick={() => onSwitchRole('foodbank')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeRole === 'foodbank'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to Food Bank Coordinator view"
              >
                <Mail className="w-4 h-4" />
                <span>2. Food Bank Lead (Receiver)</span>
              </button>
            </div>

            <button
              onClick={onOpenInventoryUpload}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              title="Upload your own store inventory CSV or POS sheet"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>Import POS Data</span>
            </button>
          </div>
        </div>

        {/* 4-Step Journey Diagram */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-2xl border transition-all ${
            activeRole === 'donor'
              ? 'bg-amber-500/15 border-amber-400 text-amber-200'
              : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <div className="flex items-center justify-between font-bold text-[11px] text-amber-300 mb-1">
              <span>STEP 1: PREDICT</span>
              <span className="text-[10px] text-slate-400">Store Manager</span>
            </div>
            <p className="text-[11px] leading-snug">
              POS sales + weather data forecast tomorrow&apos;s unsold goods before closing time.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300">
            <div className="flex items-center justify-between font-bold text-[11px] text-sky-300 mb-1">
              <span>STEP 2: OFFER</span>
              <span className="text-[10px] text-slate-400">Store Manager</span>
            </div>
            <p className="text-[11px] leading-snug">
              Store manager reviews the surplus lot and clicks &ldquo;1-Click Offer to Food Banks&rdquo;.
            </p>
          </div>

          <div className={`p-3 rounded-2xl border transition-all ${
            activeRole === 'foodbank'
              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200'
              : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <div className="flex items-center justify-between font-bold text-[11px] text-emerald-300 mb-1">
              <span>STEP 3: MATCH &amp; ACCEPT</span>
              <span className="text-[10px] text-slate-400">Food Bank Lead</span>
            </div>
            <p className="text-[11px] leading-snug">
              Food Bank receives alert in inbox, checks cold storage [NEW 2], and accepts the donation.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300">
            <div className="flex items-center justify-between font-bold text-[11px] text-purple-300 mb-1">
              <span>STEP 4: DISPATCH</span>
              <span className="text-[10px] text-slate-400">Driver &amp; Logistics</span>
            </div>
            <p className="text-[11px] leading-snug">
              Pickup route manifest, cold-chain checks (38°F), and driver notes are auto-generated.
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Educational Deep-Dive on Data & Learning */}
      {isExpanded && (
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4 text-xs animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Q1 & Q2: Who are the roles? */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-amber-800">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>The Two Distinct Roles</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                • <strong>Donor Portal (Store Manager):</strong> Used by grocery stores, supermarket departments, and bakeries. They own the food and decide to donate instead of trashing.
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                • <strong>Food Bank Inbox (Receiver):</strong> Used by non-profit coordinators (pantries, soup kitchens). They receive notifications of incoming food, check their facility space, and accept.
              </p>
            </div>

            {/* Q3: How did 30-day analysis happen? */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-sky-800">
                <Database className="w-4 h-4 text-sky-600" />
                <span>How the 30-Day Analysis Works</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                In retail, Point-of-Sale (POS) systems (like Toast or SAP) log sales and waste daily. For this hackathon, we pre-loaded 30 days of synthetic sales for 5 departments.
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                <strong>Do you upload every month?</strong> No! In production, inventory connects via automated POS API webhooks. The model uses a moving 30-day baseline to predict demand volatility.
              </p>
            </div>

            {/* Q3 Part B: Weather, Holidays & Proximity Events */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>External Context Signals</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Gemini doesn&apos;t just read past sales; it blends external proximity signals:
              </p>
              <div className="space-y-1 text-[11px]">
                <div className="p-1.5 rounded-lg bg-slate-100 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span><strong>Weather Forecasts:</strong> Rain reduces bakery foot traffic by 14%.</span>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-100 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Holidays:</strong> Anticipates overstock shifts around long weekends.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
