import React, { useState } from 'react';
import { FoodItem } from '../../types';
import { useRegion } from '../../context/RegionContext';
import { PageHero, Card, SegmentedControl, Sheet, StatTile } from '../common/Primitives';
import { sounds } from '../../utils/audioEffects';
import {
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  ShieldCheck,
  QrCode,
  Sparkles,
  Thermometer,
  Calendar,
  AlertTriangle,
  UserCheck,
  PackageCheck
} from 'lucide-react';

interface CommunityFridge {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  distanceMiles: number;
  capacityPercent: number;
  temperatureF: number;
  status: 'active' | 'cleaning' | 'restock-needed';
  lastCleaned: string;
  caretaker: string;
  stock: Array<{
    id: string;
    item: string;
    category: string;
    quantity: string;
    addedTime: string;
    isReserved?: boolean;
  }>;
}

const INITIAL_FRIDGES: Record<string, CommunityFridge[]> = {
  US: [
    {
      id: 'fridge-1',
      name: 'Capitol Hill Community Fridge & Pantry',
      address: '1120 E Pine St, Seattle, WA',
      neighborhood: 'Capitol Hill',
      distanceMiles: 1.2,
      capacityPercent: 72,
      temperatureF: 37.8,
      status: 'active',
      lastCleaned: 'Today, 11:30 AM',
      caretaker: 'Sarah Jenkins (Mutual Aid Lead)',
      stock: [
        { id: 's-1', item: 'Fresh Organic Apples & Oranges', category: 'Produce', quantity: '8 lbs', addedTime: '1 hour ago' },
        { id: 's-2', item: 'Artisan Sourdough Loaves', category: 'Bakery', quantity: '4 loaves', addedTime: '2 hours ago' },
        { id: 's-3', item: 'Whole Milk & Oat Milk Cartons', category: 'Dairy', quantity: '5 half-gallons', addedTime: '30 mins ago' },
        { id: 's-4', item: 'Canned Black Beans & Diced Tomatoes', category: 'Pantry', quantity: '12 cans', addedTime: 'Yesterday' },
      ],
    },
    {
      id: 'fridge-2',
      name: 'Central District Solidarity Fridge',
      address: '2301 S Jackson St, Seattle, WA',
      neighborhood: 'Central District',
      distanceMiles: 2.4,
      capacityPercent: 45,
      temperatureF: 38.2,
      status: 'restock-needed',
      lastCleaned: 'Today, 9:00 AM',
      caretaker: 'Marcus Vance (Community Volunteer)',
      stock: [
        { id: 's-5', item: 'Baby Spinach & Mixed Greens', category: 'Produce', quantity: '3 bags', addedTime: '3 hours ago' },
        { id: 's-6', item: 'Peanut Butter & Jelly Jars', category: 'Pantry', quantity: '6 jars', addedTime: 'Yesterday' },
        { id: 's-7', item: 'Cheddar Cheese Blocks', category: 'Dairy', quantity: '3 packs', addedTime: '4 hours ago' },
      ],
    },
    {
      id: 'fridge-3',
      name: 'Ballard Free Little Pantry & Fridge',
      address: '5420 Ballard Ave NW, Seattle, WA',
      neighborhood: 'Ballard',
      distanceMiles: 4.1,
      capacityPercent: 88,
      temperatureF: 36.9,
      status: 'active',
      lastCleaned: 'Yesterday, 6:00 PM',
      caretaker: 'Elena Rostova',
      stock: [
        { id: 's-8', item: 'Greek Yogurt Tubs', category: 'Dairy', quantity: '6 tubs', addedTime: '45 mins ago' },
        { id: 's-9', item: 'Bagels & Cream Cheese', category: 'Bakery', quantity: '3 dozen', addedTime: '2 hours ago' },
        { id: 's-10', item: 'Pre-Packaged Vegetable Soups', category: 'Prepared', quantity: '8 containers', addedTime: 'Today' },
      ],
    },
  ],
};

interface CommunityFridgeViewProps {
  userInventory?: FoodItem[];
  onItemDonatedToFridge?: (itemName: string) => void;
}

export const CommunityFridgeView: React.FC<CommunityFridgeViewProps> = ({
  userInventory = [],
  onItemDonatedToFridge,
}) => {
  const { region, config, formatDistanceUnit } = useRegion();
  const fridges = INITIAL_FRIDGES[region] || INITIAL_FRIDGES.US;

  const [selectedFridgeId, setSelectedFridgeId] = useState<string>(fridges[0]?.id || '');
  const [selectedFridge, setSelectedFridge] = useState<CommunityFridge>(fridges[0]);
  const [showDropOffModal, setShowDropOffModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState<any | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [dropOffItemName, setDropOffItemName] = useState('');
  const [dropOffCategory, setDropOffCategory] = useState('Produce');
  const [dropOffQuantity, setDropOffQuantity] = useState('1 unit');
  const [dropOffGeneratedPass, setDropOffGeneratedPass] = useState<string | null>(null);

  const handleSelectFridge = (fridge: CommunityFridge) => {
    setSelectedFridgeId(fridge.id);
    setSelectedFridge(fridge);
  };

  const handleConfirmDropOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropOffItemName.trim()) return;

    sounds.playSuccessChime();
    const passCode = `DROP-${Math.floor(1000 + Math.random() * 9000)}-${dropOffCategory.toUpperCase().slice(0, 3)}`;
    setDropOffGeneratedPass(passCode);

    if (onItemDonatedToFridge) {
      onItemDonatedToFridge(dropOffItemName);
    }
  };

  const handleConfirmReservation = (item: any) => {
    sounds.playSuccessChime();
    setReserveSuccess(true);
    setTimeout(() => {
      setReserveSuccess(false);
      setShowReserveModal(null);
    }, 2200);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* 1. Header */}
      <PageHero
        eyebrow="Neighborhood Loop · Hyperlocal Sharing"
        title="Share surplus with your immediate community."
        subtitle="Free community fridges and mutual aid pantries keep nutritious food accessible 24/7 without bureaucracy."
      />

      {/* 2. Stat Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          value={`${fridges.length} Active`}
          label="Community Hubs"
          change="Monitored 24/7 by neighbors"
        />
        <StatTile
          value={`${selectedFridge.capacityPercent}% Full`}
          label="Current Stock"
          change="Available for intake"
        />
        <StatTile
          value={`${selectedFridge.temperatureF}°F`}
          label="Cold-Chain Check"
          change="Safe below 40°F"
        />
        <StatTile
          value="42 Families"
          label="Weekly Reach"
          change="Zero sign-up required"
        />
      </div>

      {/* 3. Main Fridge Browser & Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: List of community fridges */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Nearby Pantries &amp; Fridges</span>
            <span>{config.metroHub}</span>
          </div>

          <div className="space-y-3">
            {fridges.map((fridge) => {
              const isSelected = fridge.id === selectedFridgeId;
              return (
                <button
                  key={fridge.id}
                  type="button"
                  onClick={() => handleSelectFridge(fridge)}
                  className={`w-full p-4 rounded-[22px] text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white dark:bg-[#1C1C1E] border-[#1F7A4D] dark:border-[#34C77B] shadow-md ring-1 ring-[#1F7A4D]/20'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.04] dark:border-white/[0.06] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-[14px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {fridge.name}
                      </h4>
                      <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#1F7A4D]" />
                        <span>{fridge.address}</span>
                      </p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#1F7A4D]/10 text-[#1F7A4D] dark:text-[#34C77B]">
                      {fridge.distanceMiles} {config.distanceUnit}
                    </span>
                  </div>

                  {/* Stock Bar */}
                  <div className="mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868B]">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-sky-500" />
                      <span>{fridge.temperatureF}°F</span>
                    </div>
                    <span>{fridge.stock.length} fresh item batches</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Drop Off CTA */}
          <button
            type="button"
            onClick={() => {
              setDropOffGeneratedPass(null);
              setShowDropOffModal(true);
            }}
            className="w-full py-3.5 px-4 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] text-white font-medium text-[13px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Drop Off Surplus Food at This Fridge</span>
          </button>
        </div>

        {/* Right column: Fridge Live Inventory & Reservation */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08] gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                  <span className="w-2 h-2 rounded-full bg-[#1F7A4D] animate-ping" />
                  <span>Live Community Fridge Feed</span>
                </div>
                <h3 className="text-[20px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-1">
                  {selectedFridge.name}
                </h3>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5 flex flex-wrap items-center gap-3">
                  <span>Caretaker: {selectedFridge.caretaker}</span>
                  <span>·</span>
                  <span>Cleaned {selectedFridge.lastCleaned}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.04] text-center border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="text-[10px] text-[#86868B] uppercase">Temp</div>
                  <div className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {selectedFridge.temperatureF}°F
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.04] text-center border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="text-[10px] text-[#86868B] uppercase">Capacity</div>
                  <div className="text-[14px] font-bold text-[#1F7A4D] dark:text-[#34C77B]">
                    {selectedFridge.capacityPercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* Current In-Stock Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">
                <span>Available Food Items ({selectedFridge.stock.length})</span>
                <span className="text-[11px] text-[#1F7A4D] dark:text-[#34C77B] normal-case">Free for anyone in need</span>
              </div>

              <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] rounded-[20px] overflow-hidden">
                {selectedFridge.stock.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {item.item}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#86868B]">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#86868B] mt-0.5 flex items-center gap-3">
                        <span>Quantity: {item.quantity}</span>
                        <span>·</span>
                        <span>Added {item.addedTime}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowReserveModal(item)}
                      className="px-3.5 py-1.5 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[12px] font-medium hover:opacity-90 transition self-start sm:self-auto cursor-pointer"
                    >
                      Hold for Pickup (2h)
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe Community Food Guidelines Box */}
            <div className="p-4 rounded-[20px] bg-[#1F7A4D]/[0.05] dark:bg-[#34C77B]/[0.06] border border-[#1F7A4D]/10 text-[12px] text-[#6E6E73] dark:text-[#86868B] space-y-1.5 leading-relaxed">
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B]" />
                <span>Good Samaritan Community Safe Sharing Code</span>
              </div>
              <p>
                All items must be commercially sealed, whole raw produce, or properly labeled with the date added.
                Protected under {config.foodSafety.law}. Take what you need, leave what you can.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Drop-off Modal */}
      {showDropOffModal && (
        <Sheet
          isOpen={true}
          onClose={() => setShowDropOffModal(false)}
          title="Community Fridge Drop-Off"
          description={`Donating to ${selectedFridge.name}. Please ensure items comply with food safety standards.`}
          maxWidth="md"
        >
          {dropOffGeneratedPass ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#1F7A4D]/10 dark:bg-[#34C77B]/10 mx-auto flex items-center justify-center text-[#1F7A4D] dark:text-[#34C77B]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Drop-Off Pass Generated!
                </h4>
                <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1 max-w-sm mx-auto">
                  Write this code on tape or label when placing {dropOffItemName} in {selectedFridge.name}:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.06] font-mono text-[20px] font-bold text-[#1F7A4D] dark:text-[#34C77B] tracking-wider">
                {dropOffGeneratedPass}
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] text-[11px] text-[#86868B] text-left space-y-1">
                <div>• Drop item in the fridge compartment within 2 hours.</div>
                <div>• Verified under {config.foodSafety.name}.</div>
                <div>• Neighbors will see this item appear live on the neighborhood feed!</div>
              </div>

              <button
                type="button"
                onClick={() => setShowDropOffModal(false)}
                className="w-full py-2.5 rounded-full bg-[#1F7A4D] text-white font-medium text-[13px] hover:bg-[#18603C] transition cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmDropOff} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., 6 fresh bell peppers or sourdough loaf"
                  value={dropOffItemName}
                  onChange={(e) => setDropOffItemName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#1F7A4D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                    Category
                  </label>
                  <select
                    value={dropOffCategory}
                    onChange={(e) => setDropOffCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Pantry">Pantry Staples</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={dropOffQuantity}
                    onChange={(e) => setDropOffQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  />
                </div>
              </div>

              {/* Safety Confirmation Checkbox */}
              <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] space-y-2">
                <div className="text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Food Safety Requirements:
                </div>
                <label className="flex items-start gap-2 text-[11px] text-[#6E6E73] dark:text-[#86868B] cursor-pointer">
                  <input type="checkbox" required className="mt-0.5 rounded text-[#1F7A4D]" />
                  <span>Item is clean, not past its expiration date, and packaged hygienically.</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDropOffModal(false)}
                  className="px-4 py-2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#1F7A4D] text-white font-medium hover:bg-[#18603C] transition cursor-pointer"
                >
                  Generate Drop-Off Label
                </button>
              </div>
            </form>
          )}
        </Sheet>
      )}

      {/* 5. Reservation Sheet */}
      {showReserveModal && (
        <Sheet
          isOpen={true}
          onClose={() => setShowReserveModal(null)}
          title="Discreet 2-Hour Item Hold"
          description={`Holding ${showReserveModal.item} at ${selectedFridge.name}.`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-[13px] text-center py-2">
            {reserveSuccess ? (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-[#1F7A4D]/10 mx-auto flex items-center justify-center text-[#1F7A4D]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-[16px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Item Held for You!
                </h4>
                <p className="text-[12px] text-[#86868B]">
                  Pickup anytime within the next 2 hours. Simply visit the fridge and claim your item with zero identification needed.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[#6E6E73] dark:text-[#86868B] text-left">
                  We will place a discreet 2-hour digital hold on <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">{showReserveModal.item}</strong> ({showReserveModal.quantity}) so you can walk over with peace of mind.
                </p>

                <div className="p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04] text-left text-[12px] space-y-1">
                  <div className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{selectedFridge.name}</div>
                  <div className="text-[#86868B]">{selectedFridge.address}</div>
                  <div className="text-[#1F7A4D] dark:text-[#34C77B] text-[11px] font-medium pt-1">
                    Open 24/7 · Free &amp; Anonymous
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReserveModal(null)}
                    className="px-4 py-2 text-[#86868B] hover:text-[#1D1D1F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmReservation(showReserveModal)}
                    className="px-5 py-2.5 rounded-full bg-[#1F7A4D] text-white font-medium hover:bg-[#18603C] transition cursor-pointer"
                  >
                    Confirm 2-Hour Hold
                  </button>
                </div>
              </>
            )}
          </div>
        </Sheet>
      )}
    </div>
  );
};
