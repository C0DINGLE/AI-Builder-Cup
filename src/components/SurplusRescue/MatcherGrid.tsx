import React, { useState } from 'react';
import { SurplusLot, FoodBank } from '../../types';
import { useRegion } from '../../context/RegionContext';
import { Sheet, StatusDot } from '../common/Primitives';
import { ShieldAlert, ShieldCheck, MapPin, Clock, Scale, Truck, Snowflake, Package, Ban } from 'lucide-react';

interface MatcherGridProps {
  lot: SurplusLot;
  onConfirmMatch: (lot: SurplusLot, foodBank: FoodBank) => void;
  onClose: () => void;
}

export const MatcherGrid: React.FC<MatcherGridProps> = ({
  lot,
  onConfirmMatch,
  onClose,
}) => {
  const { config, foodBanks, formatWeightUnit, formatPrice, formatDistanceUnit } = useRegion();
  const [selectedFoodBankId, setSelectedFoodBankId] = useState<string | null>(null);

  const scoredFoodBanks = foodBanks.map((fb) => {
    let eligible = true;
    const disqualificationReasons: string[] = [];

    if (lot.requiresColdStorage && !fb.acceptsRefrigerated) {
      eligible = false;
      disqualificationReasons.push('Lacks required cold storage capacity for perishable lot.');
    }

    if (fb.requiresSealedPackaging && !lot.requiresSealedPackaging) {
      eligible = false;
      disqualificationReasons.push('Requires manufacturer-sealed packaging; lot contains loose crates.');
    }

    if (fb.capacityRemainingLbs < lot.totalPounds) {
      eligible = false;
      disqualificationReasons.push(`Insufficient capacity (needs ${formatWeightUnit(lot.totalPounds)}, has ${formatWeightUnit(fb.capacityRemainingLbs)}).`);
    }

    let score = 95 - fb.distanceMiles * 3;
    if (fb.capacityRemainingLbs > 500) score += 5;
    if (!eligible) score = 0;

    return {
      ...fb,
      eligible,
      disqualificationReasons,
      computedScore: Math.round(score),
    };
  }).sort((a, b) => b.computedScore - a.computedScore);

  const selectedBank = scoredFoodBanks.find((fb) => fb.id === selectedFoodBankId);

  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="Match Relief Partner"
      description={`Pairing ${formatWeightUnit(lot.totalPounds)} (${lot.department}) with accredited non-profits in ${config.name}.`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-[13px]">
        {/* Target Lot Safety Requirements Callout */}
        <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[14px]">
              {lot.itemsSummary}
            </span>
            <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
              <span>Value: {formatPrice(lot.estimatedValue)}</span>
              <span aria-hidden="true">·</span>
              <span>Window: &lt;{lot.spoilageWindowHours}h</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] font-medium">
            {lot.requiresColdStorage ? (
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                <Snowflake className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Refrigerated Custody Required</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#6E6E73] dark:text-[#86868B]">
                <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Ambient Dry Goods</span>
              </span>
            )}
          </div>
        </div>

        {/* Scored Food Bank Options */}
        <div className="space-y-3">
          <div className="text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B]">
            Eligible Regional Partners ({scoredFoodBanks.length})
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {scoredFoodBanks.map((fb) => (
              <div
                key={fb.id}
                onClick={() => fb.eligible && setSelectedFoodBankId(fb.id)}
                className={`p-4 rounded-[20px] border transition-all ${
                  !fb.eligible
                    ? 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.04] opacity-50 cursor-not-allowed'
                    : selectedFoodBankId === fb.id
                    ? 'bg-[#1F7A4D]/[0.06] dark:bg-[#34C77B]/[0.08] border-[#1F7A4D] dark:border-[#34C77B] shadow-sm cursor-pointer'
                    : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.16] cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[15px]">
                        {fb.name}
                      </h4>
                      {fb.eligible ? (
                        <span className="text-[12px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                          {fb.computedScore}% match
                        </span>
                      ) : (
                        <span className="text-[12px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Ban className="w-3 h-3" strokeWidth={1.5} />
                          Gate Ineligible
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                      <span>{formatDistanceUnit(fb.distanceMiles)} away</span>
                      <span aria-hidden="true">·</span>
                      <span>{fb.operatingHours}</span>
                      <span aria-hidden="true">·</span>
                      <span>Capacity: {formatWeightUnit(fb.capacityRemainingLbs)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    {fb.acceptsRefrigerated ? (
                      <span className="text-sky-600 dark:text-sky-400 font-medium">Refrigerated</span>
                    ) : (
                      <span>Ambient only</span>
                    )}
                  </div>
                </div>

                {!fb.eligible && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={1.5} />
                    <span>{fb.disqualificationReasons.join(' ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            {selectedBank ? `Selected: ${selectedBank.name}` : 'Select a partner to proceed'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7] transition-colors"
            >
              Cancel
            </button>

            <button
              disabled={!selectedBank}
              onClick={() => {
                if (selectedBank) {
                  onConfirmMatch(lot, selectedBank);
                }
              }}
              className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" strokeWidth={1.5} />
              <span>Confirm Match &amp; Dispatch</span>
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
