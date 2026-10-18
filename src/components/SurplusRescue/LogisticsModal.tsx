import React, { useState, useEffect } from 'react';
import { SurplusLot, FoodBank } from '../../types';
import { Sheet } from '../common/Primitives';
import {
  Truck,
  MapPin,
  CheckCircle,
  Navigation,
  Clock,
  ShieldCheck,
  Thermometer,
  MessageSquare,
  Play,
  RotateCcw,
  Radio,
  FileText,
  Send,
  AlertCircle
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';

interface LogisticsModalProps {
  lot: SurplusLot;
  foodBank?: FoodBank | null;
  onClose: () => void;
  onMarkDelivered: (lot: SurplusLot) => void;
}

export const LogisticsModal: React.FC<LogisticsModalProps> = ({
  lot,
  foodBank,
  onClose,
  onMarkDelivered,
}) => {
  const { config, formatWeightUnit, formatDistanceUnit } = useRegion();
  const destination = foodBank?.name || lot.matchedFoodBankName || 'River Valley Regional Food Bank';
  const distance = foodBank?.distanceMiles || 2.4;

  // Transit Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [transitProgress, setTransitProgress] = useState(lot.status === 'dispatched' ? 45 : 0);
  const [simulatedMinutesRemaining, setSimulatedMinutesRemaining] = useState(14);
  const [tempReading, setTempReading] = useState(lot.requiresColdStorage ? 37.2 : 68.4);
  const [humidityReading, setHumidityReading] = useState(86);
  const [messageSent, setMessageSent] = useState(false);
  const [showManifestDoc, setShowManifestDoc] = useState(false);

  // Live IoT telemetry jitter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (lot.requiresColdStorage) {
        // Safe 36.5°F - 38.0°F range
        setTempReading(prev => +(37.0 + (Math.random() * 0.8 - 0.4)).toFixed(1));
        setHumidityReading(prev => Math.min(92, Math.max(82, prev + Math.floor(Math.random() * 3 - 1))));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [lot.requiresColdStorage]);

  // Transit simulation timer
  useEffect(() => {
    let timer: any;
    if (isSimulating) {
      timer = setInterval(() => {
        setTransitProgress((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            setSimulatedMinutesRemaining(0);
            return 100;
          }
          const next = prev + 5;
          setSimulatedMinutesRemaining(Math.max(0, Math.round(14 * (1 - next / 100))));
          return next;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isSimulating]);

  const handleStartSimulation = () => {
    if (transitProgress >= 100) {
      setTransitProgress(0);
      setSimulatedMinutesRemaining(14);
    }
    setIsSimulating(true);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setTransitProgress(0);
    setSimulatedMinutesRemaining(14);
  };

  const handleSendMessage = () => {
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 4000);
  };

  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="Surplus Dispatch &amp; Cold-Chain Manifest"
      description={`Dispatched to ${destination} (${distance} ${config.distanceUnit}, ~14m estimated transit).`}
      maxWidth="lg"
    >
      <div className="space-y-6 text-[13px]">
        {/* Real-time Telemetry & Simulation Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Temperature Telemetry */}
          <div className="p-3.5 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-sky-500" strokeWidth={1.5} />
                <span>Cargo Temp</span>
              </div>
              <div className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                {tempReading}°{config.tempUnit || 'F'}
              </div>
              <div className="text-[10px] text-[#1F7A4D] dark:text-[#34C77B] flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>{lot.requiresColdStorage ? 'HACCP Safe Zone' : 'Ambient Cargo'}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Live IoT
              </span>
              <span className="text-[10px] text-[#86868B] mt-1">{humidityReading}% RH</span>
            </div>
          </div>

          {/* Transit Status & Progress */}
          <div className="p-3.5 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#86868B] uppercase tracking-wider">
              <span>Transit Status</span>
              <span className="text-[#1F7A4D] dark:text-[#34C77B] font-semibold">
                {transitProgress === 100 ? 'Arrived' : transitProgress > 0 ? `${transitProgress}% Complete` : 'At Loading Dock'}
              </span>
            </div>
            <div className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
              {transitProgress === 100 ? 'At Intake Hub' : `${simulatedMinutesRemaining} min ETA`}
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#1F7A4D] dark:bg-[#34C77B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${transitProgress}%` }}
              />
            </div>
          </div>

          {/* Carrier & Driver */}
          <div className="p-3.5 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#1F7A4D]" strokeWidth={1.5} />
                <span>Logistics Unit</span>
              </div>
              <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                Squad #4 · David Chen
              </div>
              <div className="text-[10px] text-[#86868B] mt-0.5">
                Refrig. Sprinter #WA-782
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleStartSimulation}
                disabled={isSimulating}
                className="p-2 rounded-full bg-[#1F7A4D] text-white hover:bg-[#18633e] disabled:opacity-50 transition cursor-pointer"
                title="Run GPS Simulation"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              {transitProgress > 0 && (
                <button
                  type="button"
                  onClick={handleResetSimulation}
                  className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] cursor-pointer"
                  title="Reset GPS Run"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Route Steps Timeline */}
        <div className="p-5 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] space-y-4">
          <div className="text-[12px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-between">
            <span>Optimized GPS Chain of Custody</span>
            <span className="text-[#1F7A4D] dark:text-[#34C77B] font-medium flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{distance} {config.distanceUnit} · Door-to-Door</span>
            </span>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1F7A4D]/30 dark:before:bg-[#34C77B]/30">
            {/* Origin */}
            <div className="relative">
              <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ${transitProgress >= 5 ? 'bg-[#1F7A4D] text-white' : 'bg-[#1D1D1F] dark:bg-white'}`}>
                {transitProgress >= 5 && <CheckCircle className="w-2.5 h-2.5" />}
              </div>
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Pickup Origin: {lot.storeName}
              </div>
              <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                Loading Dock #2 · {lot.totalPounds} {config.weightUnit} {lot.department} ({lot.itemsSummary})
              </div>
            </div>

            {/* In-Transit Compliance Check */}
            <div className="relative">
              <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ${transitProgress >= 50 ? 'bg-[#1F7A4D] text-white' : 'bg-sky-500'}`}>
                {transitProgress >= 50 && <CheckCircle className="w-2.5 h-2.5" />}
              </div>
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-sky-500" strokeWidth={1.5} />
                <span>Cold Chain IoT Checkpoint (En Route)</span>
              </div>
              <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                {lot.requiresColdStorage
                  ? `Active reefer chiller set to 36.0°F. Continuous sensor log: ${tempReading}°F. No breach recorded.`
                  : 'Ambient dry cargo. Sealed clean transport compliance verified.'}
              </div>
            </div>

            {/* Destination */}
            <div className="relative">
              <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ${transitProgress >= 100 ? 'bg-[#1F7A4D] text-white' : 'bg-[#86868B]'}`}>
                {transitProgress >= 100 && <CheckCircle className="w-2.5 h-2.5" />}
              </div>
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Intake Destination: {destination}
              </div>
              <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                Window: {lot.pickupWindow || 'Today by 5:30 PM'} · Receiving Coordinator: Intake Dock B
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch Notification & Proof of Custody */}
        <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#86868B]">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Automated Dispatch Alert</span>
            </span>
            <button
              type="button"
              onClick={handleSendMessage}
              className="text-[#1F7A4D] dark:text-[#34C77B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>{messageSent ? 'Alert Dispatched!' : 'Notify Intake Hub'}</span>
            </button>
          </div>
          <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
            &quot;{lot.storeName} has dispatched Lot #{lot.id.slice(-6).toUpperCase()} ({lot.totalPounds} {config.weightUnit} {lot.department}) to {destination}. Driver ETA is {simulatedMinutesRemaining} min. Temperature {tempReading}°{config.tempUnit || 'F'} certified under {config.foodSafety.name}.&quot;
          </p>
        </div>

        {/* Digital Manifest Accordion */}
        <div>
          <button
            type="button"
            onClick={() => setShowManifestDoc(!showManifestDoc)}
            className="text-[12px] text-[#1F7A4D] dark:text-[#34C77B] font-medium flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showManifestDoc ? 'Hide Official Bill of Lading' : 'View Official Bill of Lading & Legal Good Samaritan Release'}</span>
          </button>

          {showManifestDoc && (
            <div className="mt-3 p-4 rounded-[18px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] text-[11px] space-y-2 font-mono text-[#6E6E73] dark:text-[#86868B]">
              <div className="flex justify-between font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                <span>BILL OF LADING / BILL EMERSON RELEASE #NL-{lot.id.slice(-8).toUpperCase()}</span>
                <span>STATUS: DISPATCHED</span>
              </div>
              <div>TRANSFER DATE: {new Date().toLocaleDateString()} | CARRIER: Volunteer Fleet Squad #4</div>
              <div>DONOR STORE: {lot.storeName} | BENEFICIARY: {destination}</div>
              <div>CARGO: {lot.itemsSummary} | WEIGHT: {lot.totalPounds} {config.weightUnit} | BASIS: {config.currency.symbol}{lot.estimatedValue.toFixed(2)}</div>
              <div>STATUTORY LAW: {config.foodSafety.law} (Good Samaritan Protection Applies)</div>
              <div>TEMPERATURE LOG: {tempReading}°{config.tempUnit || 'F'} | VERIFICATION: SHA256-AUTHENTICATED</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7] cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onMarkDelivered(lot);
              onClose();
            }}
            className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            <span>Confirm Delivery &amp; Log Meals</span>
          </button>
        </div>
      </div>
    </Sheet>
  );
};
