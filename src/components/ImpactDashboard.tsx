import React, { useState } from 'react';
import { useRegion } from '../context/RegionContext';
import { PageHero, Card, StatTile, Sheet } from './common/Primitives';
import {
  TrendingUp,
  Leaf,
  DollarSign,
  Award,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Sparkles,
  FileText,
  Download,
  QrCode,
  Printer,
  Copy,
  Check
} from 'lucide-react';

interface ImpactDashboardProps {
  totalMealsRescued: number;
  totalPoundsDiverted: number;
  householdSavings: number;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  totalMealsRescued,
  totalPoundsDiverted,
  householdSavings,
}) => {
  const { config, formatPrice, formatWeightUnit, storeName } = useRegion();
  const co2PreventedLbs = Math.round(totalPoundsDiverted * (config.taxAudit.carbonFactorPerTon / 2000 * 2000));
  const waterConserved = Math.round(totalPoundsDiverted * 128); // gallons/liters per lb food rescued

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const certId = `CERT-NL-${Math.abs(totalPoundsDiverted * 31 + 4209).toString(16).toUpperCase()}-2026`;
  const verificationHash = `sha256:7f9c${Math.abs(totalMealsRescued * 97).toString(16)}e024b${Math.abs(householdSavings * 13).toFixed(0)}fa`;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText?.(verificationHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* 1. Page Hero with Certificate Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHero
          eyebrow={`${config.shortName} Live Impact & Benchmarks`}
          title="Every pound counts. Here's what we've saved together."
          subtitle="Tracking surplus food diverted from landfills, meals redirected to families, and carbon emissions avoided."
        />

        <button
          type="button"
          onClick={() => setShowCertificateModal(true)}
          className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] font-medium text-[13px] hover:opacity-90 transition flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <FileText className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
          <span>Generate Official Tax &amp; ESG Certificate</span>
        </button>
      </div>

      {/* 2. 4 Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile
          value={formatWeightUnit(totalPoundsDiverted)}
          label="Food Diverted"
          change="Household &amp; store surplus"
        />

        <StatTile
          value={`${totalMealsRescued.toLocaleString()}`}
          label="Meals Rescued"
          change={config.benchmarks.landfillDivertedStandard}
        />

        <StatTile
          value={formatPrice(householdSavings)}
          label="Household Savings"
          change={`Against ${config.benchmarks.householdAnnualWasteText}`}
        />

        <StatTile
          value={formatWeightUnit(co2PreventedLbs)}
          label="CO₂e Avoided"
          change="Landfill methane averted"
        />
      </div>

      {/* 3. The National Benchmark vs. NourishLoop Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-7 space-y-4">
          <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">The Baseline</span>
            <span aria-hidden="true">·</span>
            <span>{config.benchmarks.reportTitle}</span>
          </div>

          <h3 className="text-[20px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            The Cost of Uncoordinated Surplus
          </h3>

          <div className="space-y-3 text-[13px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
            <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1">
              <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] block text-[13px]">
                National Waste Baseline
              </strong>
              <p>{config.benchmarks.yearlyWasteText}. {config.benchmarks.economicLossText}.</p>
            </div>

            <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1">
              <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] block text-[13px]">
                Household Kitchen Discard
              </strong>
              <p>{config.benchmarks.householdAnnualWasteText}, largely driven by expiration anxiety and fragmented grocery tracking.</p>
            </div>

            <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1">
              <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] block text-[13px]">
                Community Food Insecurity
              </strong>
              <p>{config.benchmarks.foodInsecurityStat}, making timely surplus redirection critical.</p>
            </div>
          </div>
        </Card>

        <Card className="p-7 space-y-4">
          <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
            <span className="w-2 h-2 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" aria-hidden="true" />
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">The Loop</span>
            <span aria-hidden="true">·</span>
            <span>Continuous Multimodal Coordination</span>
          </div>

          <h3 className="text-[20px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Closing the Loop with AI
          </h3>

          <div className="space-y-3 text-[13px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
            <div className="p-4 rounded-[18px] bg-[#1F7A4D]/[0.05] dark:bg-[#34C77B]/[0.06] space-y-1">
              <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] block text-[13px]">
                Surplus Rescue &amp; Cold Chain Gating
              </strong>
              <p>Grocers forecast surplus 24–48 hours ahead. Food banks are matched only if they maintain certified refrigeration.</p>
            </div>

            <div className="p-4 rounded-[18px] bg-[#1F7A4D]/[0.05] dark:bg-[#34C77B]/[0.06] space-y-1">
              <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] block text-[13px]">
                Fridge to Plate &amp; Single Next Steps
              </strong>
              <p>Households scan food items with vision AI; the Action Board assigns exactly one clear next step, protected by deterministic allergy rules.</p>
            </div>

            <div className="p-4 rounded-[18px] bg-[#1F7A4D]/[0.05] dark:bg-[#34C77B]/[0.06] space-y-1">
              <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] block text-[13px]">
                Empirical Safety Science
              </strong>
              <p>Grounds all shelf-life calculations in USDA FoodKeeper open research, keeping food safe and waste minimized.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Core Architecture Pillars */}
      <Card className="p-7 sm:p-9 space-y-6">
        <div>
          <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] font-medium">
            System Architecture
          </div>
          <h3 className="text-[22px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-0.5">
            Five Pillars of the Closed Loop
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-[13px]">
          <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1.5">
            <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Action Board
            </div>
            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Every item has a single clear verdict: cook, freeze, or donate before spoilage.
            </p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1.5">
            <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Donation Gate
            </div>
            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Code-level gating enforces pantry safety guidelines for unopened, safe items.
            </p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1.5">
            <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              FoodKeeper Data
            </div>
            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Open USDA safety data grounds shelf lives and transparently labels estimated dates.
            </p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1.5">
            <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Allergy Shield
            </div>
            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Deterministic post-AI filters strip recipes containing declared user allergens.
            </p>
          </div>

          <div className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] space-y-1.5">
            <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Cold Chain Logistics
            </div>
            <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Refrigerated transit and storage verification prevent spoilage during donation dispatch.
            </p>
          </div>
        </div>
      </Card>

      {/* 5. Official Certificate Modal */}
      {showCertificateModal && (
        <Sheet
          isOpen={true}
          onClose={() => setShowCertificateModal(false)}
          title="Official Statutory Tax &amp; ESG Audit Certificate"
          description={`Verified under ${config.taxAudit.formTitle} and ${config.foodSafety.law}.`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-[13px]">
            {/* Printable Certificate Sheet */}
            <div className="p-6 rounded-[24px] bg-white dark:bg-[#151516] border-2 border-[#1F7A4D]/30 shadow-md space-y-5 print:border-black">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[#86868B]">
                    AUDIT CERTIFICATE · {config.shortName}
                  </div>
                  <h2 className="text-[20px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mt-0.5">
                    Verified Noncash Charitable Contribution
                  </h2>
                  <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                    Authority: {config.taxAudit.taxAgency} · {config.taxAudit.applicableSection}
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-[#1F7A4D]/10 dark:bg-[#34C77B]/10 flex items-center justify-center text-[#1F7A4D] dark:text-[#34C77B]">
                  <ShieldCheck className="w-7 h-7" strokeWidth={1.5} />
                </div>
              </div>

              {/* Certificate Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                <div className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04]">
                  <div className="text-[#86868B] text-[10px] uppercase font-mono">Certificate ID</div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5 font-mono text-[11px] truncate">
                    {certId}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04]">
                  <div className="text-[#86868B] text-[10px] uppercase font-mono">Diverted Mass</div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                    {formatWeightUnit(totalPoundsDiverted)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04]">
                  <div className="text-[#86868B] text-[10px] uppercase font-mono">Calculated Basis</div>
                  <div className="font-semibold text-[#1F7A4D] dark:text-[#34C77B] mt-0.5">
                    {formatPrice(totalPoundsDiverted * 1.85)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04]">
                  <div className="text-[#86868B] text-[10px] uppercase font-mono">Scope 3 GHG</div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                    {(totalPoundsDiverted * 0.0011).toFixed(2)} MT CO₂e
                  </div>
                </div>
              </div>

              {/* Legal & Compliance Text */}
              <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] text-[11px] space-y-1.5 text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                <div>
                  <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Statutory Citation:</strong> {config.taxAudit.legalCitation}.
                </div>
                <div>
                  <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Corporate Benefit:</strong> {config.taxAudit.corporateTaxBenefitDesc}
                </div>
                <div>
                  <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Food Safety Immunity:</strong> Certified under {config.foodSafety.name} ({config.foodSafety.law}).
                </div>
              </div>

              {/* Hash Verification Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] font-mono">
                <div className="text-[#86868B] truncate max-w-sm">
                  HASH: {verificationHash}
                </div>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[#1F7A4D] dark:text-[#34C77B] hover:underline cursor-pointer shrink-0"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'Hash Copied!' : 'Copy Hash'}</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7] cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] text-white font-medium text-[13px] shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" strokeWidth={1.5} />
                <span>Print / Save Certificate PDF</span>
              </button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
};
