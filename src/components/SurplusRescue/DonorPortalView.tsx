import React, { useState } from 'react';
import { SurplusLot, SurplusClaimRequest, FoodBank, UserSession } from '../../types';
import { TaxAndESGAuditView } from './TaxAndESGAuditView';
import { Moving30DayBaselineChart } from './Moving30DayBaselineChart';
import {
  Card,
  SegmentedControl,
  StatusDot,
  ConfidenceIndicator,
  Popover,
} from '../common/Primitives';
import {
  Building2,
  Sparkles,
  Clock,
  Snowflake,
  Package,
  CheckCircle2,
  XCircle,
  Users,
  Truck,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Upload,
  Layers,
  FileText,
  Store,
  HelpCircle,
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';

interface DonorPortalViewProps {
  lots: SurplusLot[];
  claimRequests: SurplusClaimRequest[];
  onApproveClaim: (claimId: string) => void;
  onRejectClaim: (claimId: string, reason: string) => void;
  onOfferLot: (lot: SurplusLot) => void;
  onInspectLot: (lot: SurplusLot) => void;
  onOpenPOSModal: () => void;
  storeName?: string;
  storeId?: string;
  currentUser?: UserSession;
}

export const DonorPortalView: React.FC<DonorPortalViewProps> = ({
  lots,
  claimRequests,
  onApproveClaim,
  onRejectClaim,
  onOfferLot,
  onInspectLot,
  onOpenPOSModal,
  storeName: propStoreName,
  storeId: propStoreId,
  currentUser,
}) => {
  const { config, formatWeightUnit, formatPrice, foodBanks, donorStores, storeName: regionStoreName } = useRegion();

  const activeStore = donorStores.find(
    (s) =>
      (propStoreId && s.id === propStoreId) ||
      (currentUser?.registeredFacilityId && s.id === currentUser.registeredFacilityId) ||
      (currentUser?.organization && s.name.toLowerCase().includes(currentUser.organization.toLowerCase())) ||
      (propStoreName && s.name.toLowerCase().includes(propStoreName.toLowerCase()))
  ) || donorStores[0];

  const [activeTab, setActiveTab] = useState<'lots' | 'claims' | 'baseline' | 'partners' | 'tax-audit'>('lots');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStoreScope, setSelectedStoreScope] = useState<string>('my_store');
  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [whyPopoverLotId, setWhyPopoverLotId] = useState<string | null>(null);

  const currentStoreName = activeStore ? activeStore.name : (propStoreName || regionStoreName);
  const currentStoreAddress = activeStore ? activeStore.address : 'Commercial Operating Hub';
  const currentStoreManager = activeStore ? activeStore.managerName : 'Marcus Vance';

  const storeSpecificClaims = claimRequests.filter((claim) => {
    if (selectedStoreScope === 'all_regional') return true;
    if (selectedStoreScope === 'my_store') {
      return (
        (activeStore && claim.storeId === activeStore.id) ||
        claim.storeName.toLowerCase().includes(currentStoreName.toLowerCase()) ||
        currentStoreName.toLowerCase().includes(claim.storeName.toLowerCase())
      );
    }
    return claim.storeId === selectedStoreScope;
  });

  const incomingClaims = storeSpecificClaims.filter((r) => r.status === 'pending');

  const filteredLots = selectedDept === 'All'
    ? lots
    : lots.filter((l) => l.department === selectedDept);

  const handleConfirmReject = (claimId: string) => {
    onRejectClaim(claimId, rejectReason || 'Stock committed to another intake route.');
    setRejectingClaimId(null);
    setRejectReason('');
  };

  const departmentOptions = [
    { value: 'All', label: 'All' },
    { value: 'Dairy', label: 'Dairy' },
    { value: 'Produce', label: 'Produce' },
    { value: 'Bakery', label: 'Bakery' },
    { value: 'Prepared Deli', label: 'Deli' },
    { value: 'Meat & Seafood', label: 'Meat & Seafood' },
  ];

  const portalTabOptions = [
    { value: 'lots' as const, label: 'Forecasted Surplus', count: filteredLots.length },
    { value: 'claims' as const, label: 'Incoming Requests', count: incomingClaims.length > 0 ? incomingClaims.length : undefined },
    { value: 'baseline' as const, label: '30-Day Baseline' },
    { value: 'partners' as const, label: `Partners (${foodBanks.length})` },
    { value: 'tax-audit' as const, label: 'Tax & ESG Audit' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Apple-style Clean Store Header */}
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[26px] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            <span className="w-2 h-2 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" aria-hidden="true" />
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Retailer Command</span>
            <span aria-hidden="true">·</span>
            <span>{config.shortName}</span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5 text-[#1F7A4D] dark:text-[#34C77B]">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>POS connected</span>
            </div>
          </div>

          <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {currentStoreName}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#6E6E73] dark:text-[#86868B]">
            <span>Manager: {currentStoreManager}</span>
            <span aria-hidden="true">·</span>
            <span>{currentStoreAddress}</span>
            <span aria-hidden="true">·</span>
            <span>Confidence: 94.6%</span>
          </div>
        </div>

        <button
          onClick={onOpenPOSModal}
          className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium bg-[#F5F5F7] hover:bg-[#E8E8ED] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] border border-black/[0.06] dark:border-white/[0.08] transition-all cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Sync POS &amp; Weather Signals</span>
        </button>
      </div>

      {/* 2. Primary Tabs as SegmentedControl */}
      <div className="flex justify-start overflow-x-auto pb-1">
        <SegmentedControl
          options={portalTabOptions}
          value={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          size="md"
        />
      </div>

      {/* TAB 1: FORECASTED SURPLUS LOTS */}
      {activeTab === 'lots' && (
        <div className="space-y-6">
          {/* Department Filter & Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Forecasted Surplus Lots
              </h2>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                Predicted 24–48 hours ahead of standard markdowns
              </p>
            </div>

            <SegmentedControl
              options={departmentOptions}
              value={selectedDept}
              onChange={(dept) => setSelectedDept(dept)}
              size="sm"
            />
          </div>

          {/* Lots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLots.map((lot) => {
              const isColdChain = lot.requiresColdStorage;
              const spoilageHours = lot.spoilageWindowHours || 36;
              const progressPct = Math.max(10, Math.min(100, (spoilageHours / 48) * 100));

              return (
                <Card
                  key={lot.id}
                  hoverable
                  className="flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Dept unboxed text, status dot */}
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-1.5 text-[#6E6E73] dark:text-[#86868B]">
                        <span>{lot.department}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[11px] text-[#86868B]">Estimated</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <StatusDot
                          status={
                            lot.status === 'forecasted'
                              ? 'neutral'
                              : lot.status === 'offered'
                              ? 'soon'
                              : lot.status === 'matched'
                              ? 'urgent'
                              : 'neutral'
                          }
                        />
                        <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] capitalize">
                          {lot.status}
                        </span>
                      </div>
                    </div>

                    {/* Weight & Summary */}
                    <div>
                      <h3 className="text-[22px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-snug">
                        {formatWeightUnit(lot.totalPounds)} surplus
                      </h3>
                      <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1 line-clamp-2 leading-relaxed">
                        {lot.itemsSummary}
                      </p>
                    </div>

                    {/* Meta specs */}
                    <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] space-y-2.5 text-[12px]">
                      <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#86868B]">
                        <span>Retail value</span>
                        <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{formatPrice(lot.estimatedValue)}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#86868B]">
                          <span>Window remaining</span>
                          <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">&lt; {spoilageHours}h</span>
                        </div>
                        <div className="h-1 w-full bg-black/[0.04] dark:bg-white/[0.08] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              spoilageHours <= 24 ? 'bg-amber-500' : 'bg-[#1F7A4D] dark:bg-[#34C77B]'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[#6E6E73] dark:text-[#86868B]">
                        <span>Custody</span>
                        <span className="flex items-center gap-1 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {isColdChain ? (
                            <>
                              <Snowflake className="w-3.5 h-3.5 text-sky-500" strokeWidth={1.5} />
                              <span>Refrigerated</span>
                            </>
                          ) : (
                            <>
                              <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>Ambient Dry</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[#86868B]">Forecast confidence</span>
                        <ConfidenceIndicator score={0.92} size="sm" showLabel={false} />
                      </div>
                    </div>
                  </div>

                  {/* Actions & Why popover */}
                  <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-2">
                    <Popover
                      trigger={
                        <button
                          onClick={() => setWhyPopoverLotId(whyPopoverLotId === lot.id ? null : lot.id)}
                          className="inline-flex items-center gap-1 text-[12px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7] transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Why this forecast?</span>
                        </button>
                      }
                      isOpen={whyPopoverLotId === lot.id}
                      onClose={() => setWhyPopoverLotId(null)}
                      title="Forecast Rationale"
                    >
                      <div className="space-y-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                        <p>
                          Correlated with 30-day register velocity, weather shocks (+4°F above normal), and evening turnover patterns for the {lot.department} department.
                        </p>
                        <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                          <span>Model Confidence</span>
                          <span className="font-medium text-[#1F7A4D] dark:text-[#34C77B]">High (94.6%)</span>
                        </div>
                      </div>
                    </Popover>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInspectLot(lot)}
                        className="px-4 py-2 rounded-full text-[12px] font-medium bg-[#1F7A4D] hover:bg-[#18633e] text-white transition-all cursor-pointer shadow-sm"
                      >
                        Offer lot
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INCOMING FOOD BANK REQUESTS */}
      {activeTab === 'claims' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Incoming Pickup Requests
              </h3>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                Submitted by accredited hunger relief organizations for this facility
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">Facility Scope:</span>
              <select
                value={selectedStoreScope}
                onChange={(e) => setSelectedStoreScope(e.target.value)}
                className="bg-[#F5F5F7] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] rounded-full px-3 py-1.5 text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] outline-none cursor-pointer"
              >
                <option value="my_store">My Store: {currentStoreName.split('(')[0].trim()}</option>
                <option value="all_regional">All {config.shortName} Stores ({claimRequests.length})</option>
                {donorStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {storeSpecificClaims.length === 0 ? (
            <Card className="py-16 text-center">
              <Truck className="w-8 h-8 text-[#86868B] mx-auto mb-3" strokeWidth={1.5} />
              <h4 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">No Incoming Requests</h4>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1 max-w-sm mx-auto">
                No active pickup requests targeting this store. Once accredited food banks claim surplus lots, they appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {storeSpecificClaims.map((claim) => (
                <Card key={claim.id} className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-[13px]">
                        <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {claim.foodBankName}
                        </span>
                        <span aria-hidden="true" className="text-[#86868B]">·</span>
                        <span className="text-[#6E6E73] dark:text-[#86868B]">
                          {formatWeightUnit(claim.requestedPounds)} ({claim.department})
                        </span>
                        {claim.requiresColdStorage && (
                          <>
                            <span aria-hidden="true" className="text-[#86868B]">·</span>
                            <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1 text-[12px]">
                              <Snowflake className="w-3 h-3" strokeWidth={1.5} />
                              Refrigerated
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                        <span>Pickup: {claim.proposedPickupTime}</span>
                        <span aria-hidden="true">·</span>
                        <span>Facility: {claim.storeName}</span>
                        {claim.driverEtaMinutes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#1F7A4D] dark:text-[#34C77B] font-medium">ETA: {claim.driverEtaMinutes}m</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div>
                      {claim.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRejectingClaimId(claim.id)}
                            className="px-4 py-1.5 rounded-full text-[12px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7] border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.03] transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onApproveClaim(claim.id)}
                            className="px-4 py-1.5 rounded-full text-[12px] font-medium bg-[#1F7A4D] hover:bg-[#18633e] text-white transition-all cursor-pointer shadow-sm"
                          >
                            Approve &amp; Dispatch
                          </button>
                        </div>
                      )}

                      {claim.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Approved · Awaiting Pickup</span>
                        </span>
                      )}

                      {claim.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#86868B]">
                          <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>Declined</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] bg-[#F5F5F7] dark:bg-white/[0.04] p-3 rounded-[16px]">
                    {claim.itemsSummary}
                  </p>

                  {/* Decline input if toggled */}
                  {rejectingClaimId === claim.id && (
                    <div className="p-4 rounded-[18px] bg-red-500/[0.05] border border-red-500/20 space-y-2">
                      <label className="text-[12px] font-medium text-red-600 dark:text-red-400 block">
                        Reason for Declining:
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Stock committed to another route"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[13px] outline-none"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setRejectingClaimId(null)}
                          className="px-3 py-1 rounded-full text-[12px] text-[#6E6E73] hover:text-[#1D1D1F]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmReject(claim.id)}
                          className="px-4 py-1 rounded-full text-[12px] font-medium bg-red-600 hover:bg-red-700 text-white"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 30-DAY MOVING BASELINE */}
      {activeTab === 'baseline' && (
        <Moving30DayBaselineChart
          storeTitle={currentStoreName}
          initialDepartment={selectedDept as any}
          onSelectDepartment={(d) => setSelectedDept(d)}
        />
      )}

      {/* TAB 4: VERIFIED FOOD BANK PARTNERS */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-[20px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Accredited Relief Network ({foodBanks.length})
              </h2>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                Certified 501(c)(3) / SFA / MAFF hunger relief partners in {config.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {foodBanks.map((fb) => (
              <Card key={fb.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[18px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {fb.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{fb.address}</span>
                    </div>
                  </div>

                  <span className="text-[12px] text-[#1F7A4D] dark:text-[#34C77B] font-medium flex items-center gap-1">
                    {fb.acceptsRefrigerated && <Snowflake className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    <span>{fb.acceptsRefrigerated ? 'Cold Storage' : 'Ambient Dry'}</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-[#86868B] uppercase tracking-wider font-medium">
                    Accepted Categories
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    {fb.acceptedCategories.map((cat, idx) => (
                      <React.Fragment key={cat}>
                        <span>{cat}</span>
                        {idx < fb.acceptedCategories.length - 1 && <span aria-hidden="true">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-[12px] text-[#6E6E73] dark:text-[#86868B] flex items-center justify-between">
                  <span>Lead: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">{fb.contactPerson}</strong></span>
                  <span>Room: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">{formatWeightUnit(fb.capacityRemainingLbs)}</strong></span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TAX DEDUCTION & ESG AUDIT */}
      {activeTab === 'tax-audit' && (
        <TaxAndESGAuditView
          storeName={currentStoreName}
          completedLots={lots}
          claimRequests={claimRequests}
        />
      )}
    </div>
  );
};
