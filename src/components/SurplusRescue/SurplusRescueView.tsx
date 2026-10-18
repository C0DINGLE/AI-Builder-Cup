import React, { useState } from 'react';
import { SurplusLot, FoodBank } from '../../types';
import { ForecasterDashboard } from './ForecasterDashboard';
import { MatcherGrid } from './MatcherGrid';
import { FoodBankInbox } from './FoodBankInbox';
import { LogisticsModal } from './LogisticsModal';
import { SurplusExplanationBanner } from './SurplusExplanationBanner';
import { InventoryUploadModal } from './InventoryUploadModal';

interface SurplusRescueViewProps {
  lots: SurplusLot[];
  onUpdateLots: (lots: SurplusLot[]) => void;
  onLogMealRescue: (pounds: number) => void;
}

export const SurplusRescueView: React.FC<SurplusRescueViewProps> = ({
  lots,
  onUpdateLots,
  onLogMealRescue,
}) => {
  const [subPortal, setSubPortal] = useState<'donor' | 'foodbank'>('donor');
  const [matchingLot, setMatchingLot] = useState<SurplusLot | null>(null);
  const [activeLogisticsLot, setActiveLogisticsLot] = useState<SurplusLot | null>(null);
  const [selectedFoodBank, setSelectedFoodBank] = useState<FoodBank | null>(null);
  const [showInventoryUpload, setShowInventoryUpload] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleOfferLot = (lot: SurplusLot) => {
    setMatchingLot(lot);
  };

  const handleConfirmMatch = (lot: SurplusLot, foodBank: FoodBank) => {
    setSelectedFoodBank(foodBank);
    const updated = lots.map(l => {
      if (l.id === lot.id) {
        return {
          ...l,
          status: 'offered' as const,
          matchedFoodBankId: foodBank.id,
          matchedFoodBankName: foodBank.name,
          pickupWindow: 'Today 4:00 PM – 5:30 PM',
        };
      }
      return l;
    });

    onUpdateLots(updated);
    setMatchingLot(null);

    // Provide friendly notification and automatically encourage viewing the Food Bank Inbox!
    setSyncToast(`Surplus lot offered to ${foodBank.name}! Switch to the Food Bank Lead tab to see it arrive.`);
    setTimeout(() => {
      setSyncToast(null);
    }, 6000);
  };

  const handleAcceptLot = (lot: SurplusLot) => {
    const updated = lots.map(l => {
      if (l.id === lot.id) {
        return {
          ...l,
          status: 'dispatched' as const,
        };
      }
      return l;
    });

    onUpdateLots(updated);
    setActiveLogisticsLot({ ...lot, status: 'dispatched' });
  };

  const handleDeclineLot = (lot: SurplusLot) => {
    const updated = lots.map(l => {
      if (l.id === lot.id) {
        return {
          ...l,
          status: 'forecasted' as const,
          matchedFoodBankId: undefined,
          matchedFoodBankName: undefined,
        };
      }
      return l;
    });
    onUpdateLots(updated);
  };

  const handleMarkDelivered = (lot: SurplusLot) => {
    const updated = lots.map(l => {
      if (l.id === lot.id) {
        return {
          ...l,
          status: 'completed' as const,
        };
      }
      return l;
    });

    onUpdateLots(updated);
    onLogMealRescue(lot.totalPounds);
    setActiveLogisticsLot(null);
    setSyncToast(`✓ Successfully delivered ${lot.totalPounds} lbs (${Math.round(lot.totalPounds / 1.2)} meals) to food bank!`);
    setTimeout(() => setSyncToast(null), 5000);
  };

  const handleApplyNewInventory = (newLots: SurplusLot[], narrative: string) => {
    onUpdateLots([...newLots, ...lots]);
    setSyncToast(`✓ ${narrative}`);
    setTimeout(() => setSyncToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Explanatory Educational & Journey Banner */}
      <SurplusExplanationBanner
        activeRole={subPortal}
        onSwitchRole={setSubPortal}
        onOpenInventoryUpload={() => setShowInventoryUpload(true)}
      />

      {/* Sync Alert Toast */}
      {syncToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <span>{syncToast}</span>
          {subPortal === 'donor' && (
            <button
              onClick={() => setSubPortal('foodbank')}
              className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
            >
              Switch to Food Bank Inbox →
            </button>
          )}
        </div>
      )}

      {/* 2. Main Role View */}
      {subPortal === 'donor' ? (
        <ForecasterDashboard
          lots={lots}
          onOfferLot={handleOfferLot}
          onInspectLot={lot => setMatchingLot(lot)}
          onOpenInventoryUpload={() => setShowInventoryUpload(true)}
        />
      ) : (
        <FoodBankInbox
          lots={lots}
          onAcceptLot={handleAcceptLot}
          onDeclineLot={handleDeclineLot}
        />
      )}

      {/* Matcher Grid Modal [NEW 2: Cold Storage Verification] */}
      {matchingLot && (
        <MatcherGrid
          lot={matchingLot}
          onConfirmMatch={handleConfirmMatch}
          onClose={() => setMatchingLot(null)}
        />
      )}

      {/* Logistics & Route Manifest Modal */}
      {activeLogisticsLot && (
        <LogisticsModal
          lot={activeLogisticsLot}
          foodBank={selectedFoodBank}
          onClose={() => setActiveLogisticsLot(null)}
          onMarkDelivered={handleMarkDelivered}
        />
      )}

      {/* POS & Inventory Integration Modal */}
      {showInventoryUpload && (
        <InventoryUploadModal
          onClose={() => setShowInventoryUpload(false)}
          onApplyNewInventory={handleApplyNewInventory}
        />
      )}
    </div>
  );
};
