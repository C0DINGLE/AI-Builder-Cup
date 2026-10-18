import React, { useState } from 'react';
import { FoodItem } from '../../types';
import { Sheet, StatusDot } from '../common/Primitives';
import { evaluateDonationEligibility } from '../../utils/donationGate';
import { useRegion } from '../../context/RegionContext';
import {
  HeartHandshake,
  Check,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

interface DonationModalProps {
  item: FoodItem | null;
  onClose: () => void;
  onConfirmDonationPledge: (item: FoodItem) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  item,
  onClose,
  onConfirmDonationPledge,
}) => {
  const { config, foodBanks, formatPrice } = useRegion();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFoodBankId, setSelectedFoodBankId] = useState(foodBanks[0]?.id || 'fb-1');
  const [selectedSlot, setSelectedSlot] = useState('Tomorrow, 9:00 AM – 11:30 AM');
  const [packagingConfirmed, setPackagingConfirmed] = useState(false);

  if (!item) return null;

  const expTime = new Date(item.expirationDate).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.round((expTime - now) / (1000 * 60 * 60 * 24)));
  const eligibility = evaluateDonationEligibility(item, daysLeft);
  const selectedFoodBank = foodBanks.find((fb) => fb.id === selectedFoodBankId) || foodBanks[0];
  const estimatedTaxValue = 4.80;

  const handleFinishPledge = () => {
    onConfirmDonationPledge(item);
    onClose();
  };

  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="Pass It On"
      description="You probably won't use this in time. A food bank nearby can."
      maxWidth="md"
    >
      <div className="space-y-6 text-[14px]">
        {/* Step Indicator (Thin Apple Progress Bar) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px] text-[#86868B]">
            <span>
              Step {step} of 4: {step === 1 ? 'Eligibility' : step === 2 ? 'Local Food Bank' : step === 3 ? 'Drop-off Window' : 'Receipt & Confirmation'}
            </span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-1 w-full bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1F7A4D] dark:bg-[#34C77B] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Safety & Eligibility Check */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[15px]">
                  {item.name}
                </div>
                <div className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                  {item.quantity} • {item.packageState} • ~{daysLeft} days estimated remaining
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                <StatusDot status={eligibility.isEligible ? 'safe' : 'urgent'} />
                <span>{eligibility.isEligible ? 'Eligible' : 'Restricted'}</span>
              </div>
            </div>

            {eligibility.isEligible ? (
              <div className="space-y-3">
                <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                  Under <strong>{config.foodSafety.name}</strong> guidelines, non-profits accept commercially sealed items with intact packaging.
                </p>

                <label className="p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01] flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={packagingConfirmed}
                    onChange={(e) => setPackagingConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-[#1F7A4D] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-[13px] leading-snug">
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                      Packaging is unopened and sealed
                    </span>
                    <span className="text-[#6E6E73] dark:text-[#86868B] text-[12px]">
                      No leaks, dents, or broken tamper seals.
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[13px] space-y-2">
                <div className="font-semibold text-[#D97706] dark:text-[#F59E0B] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                  <span>Not eligible for pantry donation</span>
                </div>
                <p className="text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                  Food banks cannot accept opened packages or home-cooked leftovers for food safety reasons.
                </p>
                <div className="pt-2 text-[12px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Recommendation: {eligibility.recommendedAlternative}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              {eligibility.isEligible ? (
                <button
                  disabled={!packagingConfirmed}
                  onClick={() => setStep(2)}
                  className="apple-pill-btn px-6 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white font-medium text-[13px] disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="apple-pill-btn px-5 py-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[13px]"
                >
                  Return to Kitchen
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Matched Food Bank */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
              Select an accredited non-profit intake pantry in {config.name}:
            </p>

            <div className="space-y-2">
              {foodBanks.map((fb) => {
                const isSelected = fb.id === selectedFoodBankId;
                return (
                  <button
                    key={fb.id}
                    onClick={() => setSelectedFoodBankId(fb.id)}
                    className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-black/[0.02] dark:bg-white/[0.04] border-[#1F7A4D] dark:border-[#34C77B] ring-1 ring-[#1F7A4D]/20 shadow-sm'
                        : 'border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.01]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-[#1F7A4D] dark:text-[#34C77B]">
                        <Building2 className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[14px]">
                          {fb.name}
                        </div>
                        <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                          {fb.address.split(',')[0]} • Hours: {fb.operatingHours}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B] shrink-0" strokeWidth={2} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="apple-pill-btn px-6 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white font-medium text-[13px] flex items-center gap-1 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pickup / Drop-off Slot */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
              Choose a convenient drop-off time slot for <strong>{selectedFoodBank.name}</strong>:
            </p>

            <div className="space-y-2">
              {[
                'Today, 3:00 PM – 5:00 PM',
                'Tomorrow, 9:00 AM – 11:30 AM',
                'Tomorrow, 1:00 PM – 4:00 PM',
                'Saturday, 10:00 AM – 1:00 PM',
              ].map((slot) => {
                const isSelected = slot === selectedSlot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-black/[0.02] dark:bg-white/[0.04] border-[#1F7A4D] dark:border-[#34C77B] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]'
                        : 'border-black/[0.06] dark:border-white/[0.08] text-[#6E6E73] dark:text-[#86868B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-[13px]">
                      <Calendar className="w-4 h-4 text-[#86868B]" strokeWidth={1.5} />
                      <span>{slot}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={2} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="apple-pill-btn px-6 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white font-medium text-[13px] flex items-center gap-1 cursor-pointer"
              >
                <span>View Receipt</span>
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Digital Receipt & Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-6 rounded-[24px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1F7A4D]/10 text-[#1F7A4D] dark:text-[#34C77B] mx-auto flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-[19px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Donation Pledge Ready
              </h4>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] max-w-sm mx-auto">
                {item.name} will be transferred to {selectedFoodBank.name} during your selected window.
              </p>

              {/* Receipt Summary Box */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] text-left text-[12px] space-y-2 shadow-xs">
                <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                  <span className="text-[#86868B]">Pledged Item</span>
                  <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{item.name} ({item.quantity})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                  <span className="text-[#86868B]">Designated Food Bank</span>
                  <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{selectedFoodBank.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.06]">
                  <span className="text-[#86868B]">Drop-off Slot</span>
                  <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{selectedSlot}</span>
                </div>
                <div className="flex justify-between py-1 pt-2">
                  <span className="text-[#86868B]">Estimated Tax Credit ({config.currency.code})</span>
                  <span className="font-semibold text-[#1F7A4D] dark:text-[#34C77B]">{formatPrice(estimatedTaxValue)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(3)}
                className="text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleFinishPledge}
                className="apple-pill-btn px-6 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white font-medium text-[13px] shadow-sm cursor-pointer"
              >
                Confirm Pledge & Complete
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
};
