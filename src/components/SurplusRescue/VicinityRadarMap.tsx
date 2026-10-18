import React, { useState } from 'react';
import { SurplusLot } from '../../types';
import { useRegion } from '../../context/RegionContext';
import { SegmentedControl, StatusDot } from '../common/Primitives';
import {
  Snowflake,
  Package,
  MapPin,
  Navigation,
  Clock,
  Send,
  Building2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface VicinityRadarMapProps {
  lots: SurplusLot[];
  foodBankName: string;
  onClaimLot: (lot: SurplusLot) => void;
  acceptsRefrigerated: boolean;
}

export const VicinityRadarMap: React.FC<VicinityRadarMapProps> = ({
  lots,
  foodBankName,
  onClaimLot,
  acceptsRefrigerated,
}) => {
  const { config, radarCoordinates, formatDistanceUnit, formatWeightUnit, formatPrice } = useRegion();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(lots[0]?.id || null);
  const [filterType, setFilterType] = useState<'all' | 'cold' | 'ambient'>('all');
  const [maxRadius, setMaxRadius] = useState<number>(15);

  const filteredLots = lots.filter((lot) => {
    const geo = radarCoordinates[lot.storeId] || radarCoordinates[lot.id] || { distance: 3.5, driveMins: 12, neighborhood: config.metroHub, x: 50, y: 50 };
    const matchesRadius = geo.distance <= maxRadius;
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'cold'
        ? lot.requiresColdStorage
        : !lot.requiresColdStorage;
    return matchesRadius && matchesType && lot.status !== 'completed';
  });

  const selectedLot = lots.find((l) => l.id === selectedLotId) || filteredLots[0];
  const selectedGeo = selectedLot
    ? radarCoordinates[selectedLot.storeId] || radarCoordinates[selectedLot.id] || { x: 50, y: 50, distance: 3.5, driveMins: 12, neighborhood: config.metroHub }
    : null;

  const coldCount = lots.filter((l) => l.requiresColdStorage && l.status !== 'completed').length;
  const ambientCount = lots.filter((l) => !l.requiresColdStorage && l.status !== 'completed').length;

  const filterOptions = [
    { value: 'all' as const, label: `All (${lots.length})` },
    { value: 'cold' as const, label: `Cold Chain (${coldCount})` },
    { value: 'ambient' as const, label: `Ambient (${ambientCount})` },
  ];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[26px] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none p-6 sm:p-8 space-y-6 transition-colors">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/[0.04] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            <span className="w-2 h-2 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" aria-hidden="true" />
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Vicinity Radar</span>
            <span aria-hidden="true">·</span>
            <span>{config.metroHub}</span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-1">
            Store Proximity &amp; Temperature-Controlled Routing
          </h2>
        </div>

        {/* Temperature & Radius Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={filterOptions}
            value={filterType}
            onChange={(val) => setFilterType(val)}
            size="sm"
          />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-[12px]">
            <span className="text-[#86868B]">Max:</span>
            <input
              type="range"
              min="5"
              max="25"
              step="5"
              value={maxRadius}
              onChange={(e) => setMaxRadius(Number(e.target.value))}
              className="w-16 h-1 accent-[#1F7A4D] cursor-pointer"
            />
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{maxRadius} {config.distanceUnit}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Vector Canvas & Selected Lot Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Vector Radar Map */}
        <div className="lg:col-span-7 bg-[#0B0B0D] rounded-[22px] p-5 text-white relative overflow-hidden min-h-[400px] sm:min-h-[440px] flex flex-col justify-between border border-white/[0.08] select-none">
          {/* Background Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="2 2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#radarGrid)" />
          </svg>

          {/* Concentric Proximity Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[160px] h-[160px] rounded-full border border-white/[0.08]" />
            <div className="w-[300px] h-[300px] rounded-full border border-white/[0.06]" />
            <div className="w-[440px] h-[440px] rounded-full border border-white/[0.04]" />
          </div>

          {/* Top HUD */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-[#86868B]">
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.08]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C77B] animate-ping" />
              <span className="text-[#F5F5F7] font-medium tracking-wide">
                {config.code} RADAR · {config.metroHub.split('(')[0]}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white/[0.06] px-3 py-1 rounded-full border border-white/[0.08]">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Cold Chain</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Ambient</span>
              </span>
            </div>
          </div>

          {/* Active SVG Map Markers Layer */}
          <div className="absolute inset-0 z-10">
            {/* Center Food Bank Pin */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-default"
              style={{ left: '50%', top: '50%' }}
            >
              <div className="w-8 h-8 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B] text-white dark:text-[#1D1D1F] flex items-center justify-center font-medium shadow-lg shadow-[#1F7A4D]/40">
                <Building2 className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1C1C1E]/90 text-[#34C77B] border border-white/[0.1] whitespace-nowrap shadow-md">
                {foodBankName.split(' ')[0]} (Intake)
              </span>
            </div>

            {/* Connecting Route Line */}
            {selectedGeo && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <line
                  x1="50%"
                  y1="50%"
                  x2={`${selectedGeo.x}%`}
                  y2={`${selectedGeo.y}%`}
                  stroke="#34C77B"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
              </svg>
            )}

            {/* Donor Store Markers */}
            {filteredLots.map((lot) => {
              const geo = radarCoordinates[lot.storeId] || radarCoordinates[lot.id] || { x: 45, y: 45, distance: 3.5, driveMins: 12, neighborhood: config.metroHub };
              const isSelected = selectedLotId === lot.id;
              const isCold = lot.requiresColdStorage;

              return (
                <div
                  key={lot.id}
                  onClick={() => setSelectedLotId(lot.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-115 z-20"
                  style={{ left: `${geo.x}%`, top: `${geo.y}%` }}
                >
                  <div
                    className={`relative flex items-center justify-center rounded-full p-2 transition-all shadow-md ${
                      isCold
                        ? isSelected
                          ? 'bg-sky-400 text-[#0B0B0D] ring-4 ring-sky-400/30'
                          : 'bg-sky-500/80 text-white hover:bg-sky-400'
                        : isSelected
                        ? 'bg-amber-400 text-[#0B0B0D] ring-4 ring-amber-400/30'
                        : 'bg-amber-500/80 text-white hover:bg-amber-400'
                    }`}
                  >
                    {isCold ? <Snowflake className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Package className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  </div>

                  <div
                    className={`mt-1 px-2 py-0.5 rounded-full text-[9px] font-medium text-center whitespace-nowrap shadow-md transition-all ${
                      isSelected
                        ? 'bg-white text-[#1D1D1F]'
                        : 'bg-[#1C1C1E]/90 text-[#86868B] border border-white/[0.08]'
                    }`}
                  >
                    {lot.storeName.split(' ')[0]} · {formatWeightUnit(lot.totalPounds)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom HUD Legend */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-[#86868B] pt-2 border-t border-white/[0.08]">
            <span>Radius: {maxRadius} {config.distanceUnit}</span>
            <span>Tap any marker to inspect transit route</span>
          </div>
        </div>

        {/* Selected Lot Detail & Route Handoff Card */}
        <div className="lg:col-span-5 space-y-4">
          {selectedLot && selectedGeo ? (
            <div className="p-6 rounded-[22px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-4 text-[13px]">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    <span>{selectedLot.department}</span>
                    <span aria-hidden="true" className="mx-1">·</span>
                    <span>{selectedLot.requiresColdStorage ? 'Cold Chain' : 'Ambient'}</span>
                  </div>

                  <h3 className="text-[18px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                    {selectedLot.storeName}
                  </h3>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span className="truncate">{selectedLot.storeAddress || selectedGeo.neighborhood}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[13px] font-semibold text-[#1F7A4D] dark:text-[#34C77B] flex items-center gap-1 justify-end">
                    <Navigation className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{formatDistanceUnit(selectedGeo.distance)}</span>
                  </div>
                  <div className="text-[11px] text-[#86868B] mt-0.5">
                    ~{selectedGeo.driveMins}m drive
                  </div>
                </div>
              </div>

              {/* Items summary */}
              <div className="p-3.5 rounded-[16px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                {selectedLot.itemsSummary}
              </div>

              {/* Key Indicators */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-[16px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="text-[11px] text-[#86868B]">Weight</div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[15px] mt-0.5">
                    {formatWeightUnit(selectedLot.totalPounds)}
                  </div>
                </div>

                <div className="p-3 rounded-[16px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="text-[11px] text-[#86868B]">Est Value</div>
                  <div className="font-semibold text-[#1F7A4D] dark:text-[#34C77B] text-[15px] mt-0.5">
                    {formatPrice(selectedLot.estimatedValue)}
                  </div>
                </div>

                <div className="p-3 rounded-[16px] bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
                  <div className="text-[11px] text-[#86868B]">Spoilage</div>
                  <div className="font-semibold text-amber-600 dark:text-amber-400 text-[15px] mt-0.5">
                    &lt; {selectedLot.spoilageWindowHours}h
                  </div>
                </div>
              </div>

              {/* Cold Storage Safety Verification Check */}
              {selectedLot.requiresColdStorage && !acceptsRefrigerated ? (
                <div className="p-3 rounded-[16px] bg-red-500/[0.06] border border-red-500/20 text-red-600 dark:text-red-400 text-[12px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>Intake blocked: Facility lacks verified cold storage under {config.foodSafety.coldChainStandard}.</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-[16px] bg-[#1F7A4D]/[0.06] text-[#1F7A4D] dark:text-[#34C77B] text-[12px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>Cold chain certified under {config.foodSafety.coldChainStandard}.</span>
                </div>
              )}

              {/* 1-Click Claim Action */}
              <button
                disabled={selectedLot.requiresColdStorage && !acceptsRefrigerated}
                onClick={() => onClaimLot(selectedLot)}
                className="w-full py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Claim Lot &amp; Send Dispatch</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#F5F5F7] dark:bg-white/[0.04] rounded-[22px] text-[#86868B] text-[13px]">
              Tap any marker on the map to inspect surplus details and transit route.
            </div>
          )}

          {/* Quick List */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-medium text-[#86868B]">
              Active Nearby Lots ({filteredLots.length})
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {filteredLots.map((lot) => {
                const geo = radarCoordinates[lot.storeId] || radarCoordinates[lot.id] || { distance: 3.5, driveMins: 12, neighborhood: config.metroHub };
                const isSelected = selectedLotId === lot.id;

                return (
                  <div
                    key={lot.id}
                    onClick={() => setSelectedLotId(lot.id)}
                    className={`p-3 rounded-[16px] border text-[12px] flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-[#1C1C1E] border-[#1F7A4D] dark:border-[#34C77B] shadow-sm'
                        : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot status={lot.requiresColdStorage ? 'soon' : 'neutral'} />
                      <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate max-w-[140px]">{lot.storeName}</span>
                      <span className="text-[#86868B]">({lot.department})</span>
                    </div>

                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="text-[#6E6E73] dark:text-[#86868B]">{formatWeightUnit(lot.totalPounds)}</span>
                      <span aria-hidden="true" className="text-[#86868B]">·</span>
                      <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">{formatDistanceUnit(geo.distance)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
