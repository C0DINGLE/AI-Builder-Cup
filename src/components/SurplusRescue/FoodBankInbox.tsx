import React from 'react';
import { SurplusLot } from '../../types';
import { Mail, CheckCircle2, Clock, Truck, ShieldCheck, MapPin, Building2, ChevronRight, XCircle, Snowflake, Package } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';

interface FoodBankInboxProps {
  lots: SurplusLot[];
  onAcceptLot: (lot: SurplusLot) => void;
  onDeclineLot: (lot: SurplusLot) => void;
}

export const FoodBankInbox: React.FC<FoodBankInboxProps> = ({
  lots,
  onAcceptLot,
  onDeclineLot,
}) => {
  const { config, foodBanks, formatWeightUnit, formatPrice } = useRegion();
  const currentFoodBank = foodBanks[0] || {
    name: 'Regional Food Bank Intake',
    capacityRemainingLbs: 950,
  };

  const incomingOffers = lots.filter(l => l.status === 'offered' || l.status === 'matched');
  const activeDispatches = lots.filter(l => l.status === 'dispatched');

  return (
    <div className="space-y-5">
      {/* Role Context Header */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">
                {currentFoodBank.name} — Intake Portal
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase">
                {config.shortName} Intake Coordinator
              </span>
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Incoming surplus lots offered by local {config.name} supermarkets. Verify your refrigerated capacity and accept to dispatch a driver.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700 font-semibold self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px]">
            ❄️ Cold Storage Room: <strong>{formatWeightUnit(currentFoodBank.capacityRemainingLbs || 950)} available</strong>
          </span>
        </div>
      </div>

      {/* Pending Offers List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Active Incoming Supermarket Offers ({incomingOffers.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Click &ldquo;Accept&rdquo; to confirm drop-off and route
          </span>
        </div>

        {incomingOffers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-slate-700">Inbox is Clear</div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Switch back to the Store Manager tab to offer a surplus lot, and it will appear here instantly!
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {incomingOffers.map(lot => (
              <div
                key={lot.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{lot.storeName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                      {lot.department}
                    </span>
                    {lot.requiresColdStorage ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 flex items-center gap-1">
                        <Snowflake className="w-3 h-3" />
                        <span>Refrigerated Lot [NEW 2]</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>Ambient Dry Goods</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {lot.itemsSummary}
                  </p>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="font-bold text-slate-800">
                      Total: {lot.totalPounds} lbs
                    </span>
                    <span>•</span>
                    <span>Retail Value: ${lot.estimatedValue.toFixed(2)}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      Pickup Window: {lot.pickupWindow || 'Today 4:00 PM – 5:30 PM'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDeclineLot(lot)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Decline this lot"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onAcceptLot(lot)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-102"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept &amp; Generate Pickup Route</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispatched / Route Active lots */}
      {activeDispatches.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Vehicles Dispatched / En Route ({activeDispatches.length})</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {activeDispatches.map(lot => (
              <div
                key={lot.id}
                className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {lot.storeName} ➔ {currentFoodBank.name.split('(')[0].trim()}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      {formatWeightUnit(lot.totalPounds)} • Driver ETA 14 minutes • Temp Sensor: 37.4°F (OK)
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase">
                  Route Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
