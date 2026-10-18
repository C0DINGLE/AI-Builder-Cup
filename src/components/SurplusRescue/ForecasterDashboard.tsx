import React, { useState } from 'react';
import { SurplusLot } from '../../types';
import { Moving30DayBaselineChart } from './Moving30DayBaselineChart';
import { TrendingUp, Sparkles, Building2, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Layers, HelpCircle, Snowflake, Package } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';

interface ForecasterDashboardProps {
  lots: SurplusLot[];
  onOfferLot: (lot: SurplusLot) => void;
  onInspectLot: (lot: SurplusLot) => void;
  onOpenInventoryUpload: () => void;
}

export const ForecasterDashboard: React.FC<ForecasterDashboardProps> = ({
  lots,
  onOfferLot,
  onInspectLot,
  onOpenInventoryUpload,
}) => {
  const { config, storeName, formatWeightUnit, formatPrice } = useRegion();
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const filteredLots = selectedDept === 'All'
    ? lots
    : lots.filter(l => l.department === selectedDept);

  return (
    <div className="space-y-5">
      {/* Role Context Header */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">
                {storeName} — Donor Command
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                {config.shortName} Store Manager View
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Review tomorrow&apos;s predicted unsold inventory in {config.name}. Click &ldquo;1-Click Offer Lot&rdquo; to notify local food banks before closing.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenInventoryUpload}
          className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-amber-900 font-bold text-xs shadow-2xs self-start sm:self-auto shrink-0 transition-all"
        >
          <span>Sync POS / Weather Data</span>
        </button>
      </div>

      {/* Continuous 30-Day POS Baseline & Volatility Chart */}
      <Moving30DayBaselineChart
        storeTitle="Store Forecaster Module"
        initialDepartment={selectedDept as any}
        onSelectDepartment={(dept) => setSelectedDept(dept)}
      />

      {/* Forecasted Lots Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Tomorrow&apos;s Predicted Surplus Lots ({filteredLots.length})</span>
          </h3>

          <div className="flex items-center gap-1 text-xs">
            {['All', 'Bakery', 'Dairy', 'Produce', 'Prepared Deli'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedDept === d
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLots.map(lot => (
            <div
              key={lot.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {lot.department} Dept
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-1">
                      {formatWeightUnit(lot.totalPounds)} Predicted Surplus
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      lot.status === 'forecasted'
                        ? 'bg-blue-100 text-blue-800'
                        : lot.status === 'offered'
                        ? 'bg-amber-100 text-amber-800'
                        : lot.status === 'matched'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {lot.status.toUpperCase()}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Est Value: {formatPrice(lot.estimatedValue)}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium mt-2">
                  {lot.itemsSummary}
                </p>

                {/* Plain-Language Uncertainty Explanation */}
                <div className="mt-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gemini Uncertainty Reasoning:</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {lot.uncertaintyNarrative}
                  </p>
                </div>

                {/* Storage requirement tags [NEW 2] */}
                <div className="mt-3 flex items-center gap-2 text-[10px]">
                  {lot.requiresColdStorage ? (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1">
                      <Snowflake className="w-3 h-3" />
                      <span>Cold Chain Required [NEW 2]</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      <span>Ambient Shelf-Stable</span>
                    </span>
                  )}

                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">
                    Spoilage Window: <strong>{lot.spoilageWindowHours} hrs</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Forecast Confidence: <strong>{lot.forecastConfidence}%</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onInspectLot(lot)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
                  >
                    Match Food Banks
                  </button>

                  {lot.status === 'forecasted' && (
                    <button
                      onClick={() => onOfferLot(lot)}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
                    >
                      <span>1-Click Offer Lot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
