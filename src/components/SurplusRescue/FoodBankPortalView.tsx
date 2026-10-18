import React, { useState } from 'react';
import { SurplusLot, SurplusClaimRequest, FoodBank } from '../../types';
import { VicinityRadarMap } from './VicinityRadarMap';
import { NutritionalRecommender } from './NutritionalRecommender';
import {
  Card,
  SegmentedControl,
  StatusDot,
  Sheet,
} from '../common/Primitives';
import {
  Store,
  Building2,
  Search,
  Clock,
  Snowflake,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  MapPin,
  ShieldCheck,
  Navigation,
  Map,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';

interface FoodBankPortalViewProps {
  lots: SurplusLot[];
  claimRequests: SurplusClaimRequest[];
  onPlaceClaimRequest: (request: SurplusClaimRequest) => void;
  onConfirmReceipt: (requestId: string) => void;
  currentFoodBank?: FoodBank;
}

export const FoodBankPortalView: React.FC<FoodBankPortalViewProps> = ({
  lots,
  claimRequests,
  onPlaceClaimRequest,
  onConfirmReceipt,
  currentFoodBank: propFoodBank,
}) => {
  const { config, formatWeightUnit, formatPrice, foodBanks } = useRegion();
  const [selectedFoodBankId, setSelectedFoodBankId] = useState<string>(() => propFoodBank?.id || foodBanks[0]?.id || 'fb-1');
  const currentFoodBank = foodBanks.find((f) => f.id === selectedFoodBankId) || propFoodBank || foodBanks[0];
  const [claimScope, setClaimScope] = useState<'my_bank' | 'all_region'>('my_bank');

  const [activeTab, setActiveTab] = useState<'map' | 'marketplace' | 'requests' | 'nutrition'>('map');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchStore, setSearchStore] = useState<string>('');
  const [claimingLot, setClaimingLot] = useState<SurplusLot | null>(null);

  // Claim Request Form Modal State
  const [requestPounds, setRequestPounds] = useState<number>(0);
  const [pickupTime, setPickupTime] = useState<string>('Today 4:30 PM – 5:30 PM');
  const [driverNotes, setDriverNotes] = useState<string>('Refrigerated Van #2 with temperature log monitor.');
  const [coldStorageGateBlocked, setColdStorageGateBlocked] = useState<boolean>(false);

  const availableLots = lots.filter((lot) => {
    const matchesCategory = selectedCategory === 'All' || lot.department === selectedCategory;
    const matchesStore =
      lot.storeName.toLowerCase().includes(searchStore.toLowerCase()) ||
      (lot.storeAddress && lot.storeAddress.toLowerCase().includes(searchStore.toLowerCase())) ||
      lot.itemsSummary.toLowerCase().includes(searchStore.toLowerCase());
    return matchesCategory && matchesStore && lot.status !== 'completed';
  });

  const myRequests = claimRequests.filter((req) => req.foodBankId === currentFoodBank.id);
  const displayedRequests = claimScope === 'my_bank' ? myRequests : claimRequests;
  const activePendingCount = displayedRequests.filter(
    (r) => r.status === 'pending' || r.status === 'accepted' || r.status === 'in_transit'
  ).length;

  const coldCount = lots.filter((l) => l.requiresColdStorage && l.status !== 'completed').length;
  const ambientCount = lots.filter((l) => !l.requiresColdStorage && l.status !== 'completed').length;

  const handleOpenClaimModal = (lot: SurplusLot) => {
    setClaimingLot(lot);
    setRequestPounds(lot.totalPounds);

    if (lot.requiresColdStorage && !currentFoodBank.acceptsRefrigerated) {
      setColdStorageGateBlocked(true);
    } else {
      setColdStorageGateBlocked(false);
    }
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingLot || coldStorageGateBlocked) return;

    const newRequest: SurplusClaimRequest = {
      id: `req-${Date.now()}`,
      lotId: claimingLot.id,
      storeId: claimingLot.storeId,
      storeName: claimingLot.storeName,
      storeAddress: claimingLot.storeAddress || 'Main Commercial Dock',
      department: claimingLot.department,
      itemsSummary: claimingLot.itemsSummary,
      foodBankId: currentFoodBank.id,
      foodBankName: currentFoodBank.name,
      requestedPounds: requestPounds || claimingLot.totalPounds,
      proposedPickupTime: pickupTime,
      requiresColdStorage: claimingLot.requiresColdStorage,
      status: 'pending',
      requestedAt: 'Just now',
      driverNotes: driverNotes,
    };

    onPlaceClaimRequest(newRequest);
    setClaimingLot(null);
    setActiveTab('requests');
  };

  // Apple-Fitness style ring calculation
  const totalCapacity = 2000;
  const capacityUsed = Math.max(0, totalCapacity - currentFoodBank.capacityRemainingLbs);
  const capacityPct = Math.min(100, Math.round((capacityUsed / totalCapacity) * 100));
  const ringRadius = 24;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (capacityPct / 100) * ringCircumference;

  const portalTabOptions = [
    { value: 'map' as const, label: 'Vicinity Radar' },
    { value: 'marketplace' as const, label: 'Store Marketplace', count: availableLots.length },
    { value: 'requests' as const, label: 'Live Tracking', count: activePendingCount > 0 ? activePendingCount : undefined },
    { value: 'nutrition' as const, label: 'Nutrition' },
  ];

  const categoryOptions = [
    { value: 'All', label: 'All' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'Produce', label: 'Produce' },
    { value: 'Bakery', label: 'Bakery' },
    { value: 'Meat & Seafood', label: 'Meat & Seafood' },
    { value: 'Prepared Deli', label: 'Deli' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Apple-style Clean Facility Header */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[26px] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            <span className="w-2 h-2 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" aria-hidden="true" />
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Food Bank Intake Hub</span>
            <span aria-hidden="true">·</span>
            <span>{config.name}</span>
            <span aria-hidden="true">·</span>
            <span>{currentFoodBank.operatingHours}</span>
          </div>

          <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {currentFoodBank.name}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#6E6E73] dark:text-[#86868B]">
            <span>Intake Lead: {currentFoodBank.contactPerson}</span>
            <span aria-hidden="true">·</span>
            <span>{currentFoodBank.address}</span>
          </div>

          {/* Facility Switcher */}
          <div className="flex items-center gap-2 pt-2 text-[12px]">
            <span className="text-[#86868B]">Operating Facility:</span>
            <select
              value={currentFoodBank.id}
              onChange={(e) => setSelectedFoodBankId(e.target.value)}
              className="bg-[#F5F5F7] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] rounded-full px-3 py-1 text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] outline-none cursor-pointer"
            >
              {foodBanks.map((fb) => (
                <option key={fb.id} value={fb.id}>
                  {fb.name} ({fb.address.split(',')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Apple Fitness Style Cold Storage Capacity Gauge */}
        <div className="flex items-center gap-4 p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] self-start md:self-auto shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-black/[0.06] dark:text-white/[0.08]"
              />
              <circle
                cx="28"
                cy="28"
                r={ringRadius}
                fill="none"
                stroke="#1F7A4D"
                strokeWidth="4"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className="dark:stroke-[#34C77B] transition-all duration-500"
              />
            </svg>
            <span className="absolute text-[12px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {capacityPct}%
            </span>
          </div>

          <div className="space-y-0.5 text-[12px]">
            <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Refrigerated Capacity
            </div>
            <div className="text-[#6E6E73] dark:text-[#86868B]">
              {formatWeightUnit(currentFoodBank.capacityRemainingLbs)} space remaining
            </div>
            <div className="text-[11px] text-[#86868B] flex items-center gap-1">
              <Snowflake className="w-3 h-3 text-sky-500" strokeWidth={1.5} />
              <span>{currentFoodBank.acceptsRefrigerated ? 'Certified Active Cold Custody' : 'Ambient Dry Only'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quiet Vicinity Summary Bar */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[22px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1F7A4D]/10 text-[#1F7A4D] dark:text-[#34C77B] flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
              Vicinity Radar: {availableLots.length} Active Surplus Lots
            </span>
            <span aria-hidden="true" className="text-[#86868B]">·</span>
            <span className="text-[#6E6E73] dark:text-[#86868B]">{coldCount} cold chain · {ambientCount} ambient</span>
            <span aria-hidden="true" className="text-[#86868B]">·</span>
            <span className="text-[#86868B]">Within 15 {config.distanceUnit}</span>
          </div>
        </div>

        {activeTab !== 'map' && (
          <button
            onClick={() => setActiveTab('map')}
            className="text-[12px] font-medium text-[#1F7A4D] dark:text-[#34C77B] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Radar Map</span>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* 3. Primary Portal Tabs as SegmentedControl */}
      <div className="flex justify-start overflow-x-auto pb-1">
        <SegmentedControl
          options={portalTabOptions}
          value={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          size="md"
        />
      </div>

      {/* TAB 1: GEOGRAPHIC VICINITY RADAR MAP */}
      {activeTab === 'map' && (
        <VicinityRadarMap
          lots={lots}
          foodBankName={currentFoodBank.name}
          onClaimLot={handleOpenClaimModal}
          acceptsRefrigerated={currentFoodBank.acceptsRefrigerated}
        />
      )}

      {/* TAB 2: STORE MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search store, item, or address..."
                value={searchStore}
                onChange={(e) => setSearchStore(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none"
              />
            </div>

            <SegmentedControl
              options={categoryOptions}
              value={selectedCategory}
              onChange={(cat) => setSelectedCategory(cat)}
              size="sm"
            />
          </div>

          {/* Available Marketplace Cards */}
          {availableLots.length === 0 ? (
            <Card className="py-16 text-center">
              <Store className="w-8 h-8 text-[#86868B] mx-auto mb-3" strokeWidth={1.5} />
              <h4 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">No Matching Lots</h4>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1 max-w-sm mx-auto">
                No surplus lots currently match your filter criteria in {config.name}.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableLots.map((lot) => {
                const isColdChain = lot.requiresColdStorage;
                const canAcceptThis = !isColdChain || currentFoodBank.acceptsRefrigerated;

                return (
                  <Card
                    key={lot.id}
                    hoverable
                    className="flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                            <span>{lot.department}</span>
                            <span aria-hidden="true" className="mx-1">·</span>
                            <span>{lot.storeAddress?.split(',')[0] || 'Metro'}</span>
                          </div>
                          <h3 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                            {lot.storeName}
                          </h3>
                        </div>

                        <div className="text-right">
                          <div className="text-[17px] font-semibold text-[#1F7A4D] dark:text-[#34C77B]">
                            {formatWeightUnit(lot.totalPounds)}
                          </div>
                          <div className="text-[11px] text-[#86868B]">
                            {formatPrice(lot.estimatedValue)}
                          </div>
                        </div>
                      </div>

                      <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] line-clamp-2 leading-relaxed bg-[#F5F5F7] dark:bg-white/[0.04] p-3 rounded-[16px]">
                        {lot.itemsSummary}
                      </p>

                      <div className="flex items-center justify-between text-[12px] text-[#6E6E73] dark:text-[#86868B] pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                          <span>&lt; {lot.spoilageWindowHours}h window</span>
                        </span>

                        <span className="flex items-center gap-1 font-medium">
                          {isColdChain ? (
                            <>
                              <Snowflake className="w-3.5 h-3.5 text-sky-500" strokeWidth={1.5} />
                              <span className="text-sky-600 dark:text-sky-400">Cold Chain</span>
                            </>
                          ) : (
                            <>
                              <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>Ambient Dry</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                      <div className="text-[11px] text-[#86868B]">
                        Drive time: ~12m
                      </div>

                      <button
                        onClick={() => handleOpenClaimModal(lot)}
                        className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all cursor-pointer shadow-sm ${
                          canAcceptThis
                            ? 'bg-[#1F7A4D] hover:bg-[#18633e] text-white'
                            : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#86868B] cursor-not-allowed'
                        }`}
                      >
                        {canAcceptThis ? 'Claim lot' : 'Cold Gate Blocked'}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE TRACKING & HORIZONTAL STEPPER */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <h3 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Active Surplus Claims &amp; Driver Tracking
              </h3>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                Real-time dispatch and temperature-logged route tracking
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setClaimScope('my_bank')}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  claimScope === 'my_bank'
                    ? 'bg-[#1D1D1F] text-white dark:bg-white dark:text-[#1D1D1F]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B]'
                }`}
              >
                {currentFoodBank.name.split('(')[0].trim()} ({myRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setClaimScope('all_region')}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  claimScope === 'all_region'
                    ? 'bg-[#1D1D1F] text-white dark:bg-white dark:text-[#1D1D1F]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B]'
                }`}
              >
                All {config.shortName} Claims ({claimRequests.length})
              </button>
            </div>
          </div>

          {displayedRequests.length === 0 ? (
            <Card className="py-16 text-center">
              <Truck className="w-8 h-8 text-[#86868B] mx-auto mb-3" strokeWidth={1.5} />
              <h4 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">No Active Claims</h4>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1 max-w-sm mx-auto">
                No open pickup requests right now. Browse the Store Marketplace to claim surplus lots.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayedRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isAccepted = req.status === 'accepted';
                const isInTransit = req.status === 'in_transit';
                const isDelivered = req.status === 'delivered';
                const isRejected = req.status === 'rejected';

                // Stepper stage: 1=Requested, 2=Confirmed, 3=Dispatched, 4=Delivered
                const currentStage = isDelivered ? 4 : isInTransit ? 3 : isAccepted ? 2 : 1;

                return (
                  <Card key={req.id} className="p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[14px]">
                          <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                            {req.storeName}
                          </span>
                          <span aria-hidden="true" className="text-[#86868B]">·</span>
                          <span className="text-[#6E6E73] dark:text-[#86868B]">
                            {formatWeightUnit(req.requestedPounds)} ({req.department})
                          </span>
                          {req.requiresColdStorage && (
                            <>
                              <span aria-hidden="true" className="text-[#86868B]">·</span>
                              <span className="text-sky-600 dark:text-sky-400 text-[12px] flex items-center gap-1">
                                <Snowflake className="w-3 h-3" strokeWidth={1.5} />
                                Refrigerated
                              </span>
                            </>
                          )}
                        </div>

                        <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                          {req.storeAddress} · Pickup: {req.proposedPickupTime}
                        </div>
                      </div>

                      {/* Right badge / countdown */}
                      <div className="flex items-center gap-2">
                        {isInTransit && (
                          <span className="text-[12px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                            ETA {req.driverEtaMinutes || 14}m
                          </span>
                        )}
                        <StatusDot
                          status={
                            isDelivered
                              ? 'neutral'
                              : isInTransit
                              ? 'soon'
                              : isAccepted
                              ? 'neutral'
                              : isPending
                              ? 'soon'
                              : 'urgent'
                          }
                        />
                        <span className="text-[12px] font-medium capitalize text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Clean Horizontal Apple Stepper */}
                    {!isRejected && (
                      <div className="py-2">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-black/[0.06] dark:bg-white/[0.08] -z-0" />
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#1F7A4D] dark:bg-[#34C77B] transition-all duration-500 -z-0"
                            style={{ width: `${((currentStage - 1) / 3) * 100}%` }}
                          />

                          {[
                            { label: 'Requested', step: 1 },
                            { label: 'Store Confirmed', step: 2 },
                            { label: 'Driver Dispatched', step: 3 },
                            { label: 'Delivered', step: 4 },
                          ].map((s) => {
                            const isDone = currentStage >= s.step;
                            return (
                              <div key={s.step} className="flex flex-col items-center gap-1.5 z-10 bg-white dark:bg-[#1C1C1E] px-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                                    isDone
                                      ? 'bg-[#1F7A4D] text-white dark:bg-[#34C77B] dark:text-[#1D1D1F]'
                                      : 'bg-black/[0.06] dark:bg-white/[0.08] text-[#86868B]'
                                  }`}
                                >
                                  {isDone ? '✓' : s.step}
                                </div>
                                <span className={`text-[11px] font-medium hidden sm:block ${
                                  isDone ? 'text-[#1D1D1F] dark:text-[#F5F5F7]' : 'text-[#86868B]'
                                }`}>
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] bg-[#F5F5F7] dark:bg-white/[0.04] p-3 rounded-[16px]">
                      {req.itemsSummary}
                    </p>

                    <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                      <div>
                        {req.driverNotes && <span>Notes: {req.driverNotes}</span>}
                        {isRejected && req.rejectionReason && (
                          <span className="text-red-600 dark:text-red-400 font-medium">Reason: {req.rejectionReason}</span>
                        )}
                      </div>

                      {(isAccepted || isInTransit) && (
                        <button
                          onClick={() => onConfirmReceipt(req.id)}
                          className="px-4 py-2 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[12px] shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Confirm Intake ({req.requestedPounds} lbs)</span>
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: NUTRITIONAL BALANCE */}
      {activeTab === 'nutrition' && (
        <NutritionalRecommender
          currentFoodBank={currentFoodBank}
          availableLots={availableLots}
          claimedRequests={myRequests}
          onRequestLot={handleOpenClaimModal}
        />
      )}

      {/* Claim / Order Request Sheet */}
      {claimingLot && (
        <Sheet
          isOpen={true}
          onClose={() => setClaimingLot(null)}
          title={`Request Lot from ${claimingLot.storeName}`}
          description={`Submit a surplus claim for ${claimingLot.department} inventory.`}
          maxWidth="md"
        >
          {coldStorageGateBlocked ? (
            <div className="p-4 rounded-[20px] bg-red-500/[0.06] border border-red-500/20 text-red-700 dark:text-red-400 text-[13px] space-y-3">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Cold Storage Gate Enforced</span>
              </div>
              <p className="text-[12px] leading-relaxed">
                Your registered facility does not maintain active cold storage or refrigeration certification. Under food safety compliance, you cannot claim perishable dairy or meat lots.
              </p>
              <button
                type="button"
                onClick={() => setClaimingLot(null)}
                className="px-4 py-2 rounded-full bg-[#1D1D1F] text-white dark:bg-white dark:text-[#1D1D1F] text-[12px] font-medium"
              >
                Return to Marketplace
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitClaim} className="space-y-4 text-[13px]">
              <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1">
                <div className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {claimingLot.department} Dept: {claimingLot.itemsSummary}
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                  Available: {claimingLot.totalPounds} lbs · Window: &lt;{claimingLot.spoilageWindowHours}h
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">
                  Pounds to Request
                </label>
                <input
                  type="number"
                  min="1"
                  max={claimingLot.totalPounds}
                  value={requestPounds}
                  onChange={(e) => setRequestPounds(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">
                  Pickup Time Window
                </label>
                <input
                  type="text"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
                  placeholder="e.g. Today 4:00 PM – 5:30 PM"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">
                  Driver &amp; Transport Vehicle Notes
                </label>
                <input
                  type="text"
                  value={driverNotes}
                  onChange={(e) => setDriverNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
                  placeholder="e.g. Refrigerated Van #2, Driver: Sam"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setClaimingLot(null)}
                  className="px-4 py-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Submit Claim</span>
                </button>
              </div>
            </form>
          )}
        </Sheet>
      )}
    </div>
  );
};
