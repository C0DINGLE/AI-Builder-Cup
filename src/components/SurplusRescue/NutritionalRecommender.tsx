import React, { useState } from 'react';
import { FoodBank, SurplusLot, SurplusClaimRequest } from '../../types';
import { Card, StatusDot } from '../common/Primitives';
import {
  Apple,
  Beef,
  Wheat,
  Milk,
  Sparkles,
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { useRegion } from '../../context/RegionContext';

interface NutritionalRecommenderProps {
  currentFoodBank: FoodBank;
  availableLots: SurplusLot[];
  claimedRequests: SurplusClaimRequest[];
  onRequestLot: (lot: SurplusLot) => void;
}

interface CategoryBreakdown {
  category: string;
  currentPercent: number;
  targetPercent: number;
  status: 'deficit' | 'slight-deficit' | 'balanced' | 'adequate' | 'excess';
}

interface Recommendation {
  lotId: string;
  title?: string;
  reason: string;
}

export const NutritionalRecommender: React.FC<NutritionalRecommenderProps> = ({
  currentFoodBank,
  availableLots,
  claimedRequests,
  onRequestLot,
}) => {
  const { config, formatWeightUnit } = useRegion();
  const [loading, setLoading] = useState(false);
  const [equityScore, setEquityScore] = useState(78);
  const [statusLabel, setStatusLabel] = useState('Moderate Balance · Protein Deficit');
  const [criticalDeficit, setCriticalDeficit] = useState(`Lean Proteins (${config.nutrition.issuingBody} standard)`);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([
    { category: 'Fresh Produce', currentPercent: 32, targetPercent: config.nutrition.produceTarget, status: 'slight-deficit' },
    { category: 'Lean Proteins', currentPercent: 14, targetPercent: config.nutrition.proteinTarget, status: 'deficit' },
    { category: 'Bakery & Grains', currentPercent: 39, targetPercent: config.nutrition.grainsTarget, status: 'excess' },
    { category: 'Dairy & Calcium', currentPercent: 15, targetPercent: config.nutrition.dairyOrCalciumTarget, status: 'balanced' },
  ]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      lotId: 'lot-102',
      title: 'Fresh Packaged Protein Lots',
      reason: `Directly addresses the lean protein deficit, lifting community equity score under ${config.nutrition.issuingBody} guidelines.`,
    },
    {
      lotId: 'lot-104',
      title: 'Calcium & Dairy Crates',
      reason: 'Strengthens calcium & protein buffer for families with young children.',
    },
  ]);
  const [executiveSummary, setExecutiveSummary] = useState(
    'Pantry inventories traditionally receive excess carbohydrates and bakery surplus. Claiming active cold-chain protein lots closes the nutritional gap before weekend distribution.'
  );

  const fetchNutritionalBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nutritional-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodBankId: currentFoodBank.id,
          foodBankName: currentFoodBank.name,
          availableLots,
          claimedRequests,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.score) setEquityScore(data.score);
        if (data.status) setStatusLabel(data.status);
        if (data.breakdown) setBreakdown(data.breakdown);
        if (data.recommendations) setRecommendations(data.recommendations);
        if (data.executiveSummary) setExecutiveSummary(data.executiveSummary);
        if (data.criticalDeficit) setCriticalDeficit(data.criticalDeficit);
      }
    } catch (err) {
      console.error('Failed to fetch AI nutritional balance', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'fresh produce':
        return <Apple className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />;
      case 'lean proteins':
        return <Beef className="w-4 h-4 text-rose-500" strokeWidth={1.5} />;
      case 'bakery & grains':
        return <Wheat className="w-4 h-4 text-amber-500" strokeWidth={1.5} />;
      case 'dairy & calcium':
        return <Milk className="w-4 h-4 text-sky-500" strokeWidth={1.5} />;
      default:
        return <Apple className="w-4 h-4 text-[#86868B]" strokeWidth={1.5} />;
    }
  };

  const exportAuditReport = () => {
    const reportText = `NourishLoop Nutritional Equity Audit
Facility: ${currentFoodBank.name}
Community Equity Score: ${equityScore}/100 (${statusLabel})
Priority Deficit: ${criticalDeficit}

Category Breakdown:
${breakdown.map((b) => `- ${b.category}: ${b.currentPercent}% (Target: ${b.targetPercent}%) [${b.status}]`).join('\n')}

Executive Strategy:
${executiveSummary}
`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritional-equity-${currentFoodBank.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[26px] p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
              <span className="w-2 h-2 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" aria-hidden="true" />
              <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">Dietary Standards</span>
              <span aria-hidden="true">·</span>
              <span>{config.nutrition.name}</span>
              <span aria-hidden="true">·</span>
              <span>{config.nutrition.issuingBody}</span>
            </div>

            <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Nutritional Balance &amp; Distribution Equity
            </h2>

            <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] max-w-2xl leading-relaxed">
              Prevents carbohydrate surplus dumping by monitoring incoming macro proportions and prioritizing protein, produce, and calcium intake.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={fetchNutritionalBalance}
              disabled={loading}
              className="p-2.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50 cursor-pointer"
              title="Recalculate with fresh claims"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </button>

            <button
              onClick={exportAuditReport}
              className="px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.03] dark:hover:bg-white/[0.06] font-medium text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={1.5} />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {/* Nutritional Equity Score Card & Deficit Highlight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1F7A4D]/10 dark:bg-[#34C77B]/10 text-[#1F7A4D] dark:text-[#34C77B] flex flex-col items-center justify-center shrink-0">
              <span className="text-[24px] font-semibold tracking-tight leading-none">{equityScore}</span>
              <span className="text-[10px] text-[#86868B] mt-0.5">/ 100</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-[#86868B]">
                Community Equity Score
              </div>
              <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {statusLabel}
              </div>
              <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B]">
                Macro balance across distributed meals
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-5 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
            <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Active Priority Gap: {criticalDeficit}
            </div>
            <p className="text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
              {executiveSummary}
            </p>
          </div>
        </div>

        {/* Category Breakdown Bars */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Current Intake Mix vs. Targets</span>
            <span className="text-[12px] text-[#86868B]">Standards set by {config.nutrition.issuingBody}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {breakdown.map((item) => (
              <div
                key={item.category}
                className="p-4 rounded-[18px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </div>
                  <span className="text-[11px] text-[#86868B] capitalize">{item.status.replace('-', ' ')}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{item.currentPercent}%</span>
                    <span className="text-[#86868B]">Target: {item.targetPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.status === 'deficit'
                          ? 'bg-rose-500'
                          : item.status === 'slight-deficit'
                          ? 'bg-amber-500'
                          : item.status === 'excess'
                          ? 'bg-purple-500'
                          : 'bg-[#1F7A4D] dark:bg-[#34C77B]'
                      }`}
                      style={{ width: `${Math.min(100, item.currentPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Lots to Balance Nutrition */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[26px] p-6 sm:p-8 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
        <div>
          <h3 className="text-[18px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Recommended Surplus Lots
          </h3>
          <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
            Available nearby lots that directly close your active protein and calcium deficits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const matchedLot = availableLots.find((l) => l.id === rec.lotId);

            return (
              <div
                key={rec.lotId}
                className="p-5 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#1F7A4D] dark:text-[#34C77B] font-medium">
                      High Nutritional Impact
                    </span>
                    {matchedLot && (
                      <span className="text-[#86868B]">
                        {matchedLot.totalPounds} lbs
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-[15px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {matchedLot ? matchedLot.itemsSummary : rec.title || 'Fresh Surplus Lot'}
                  </h4>

                  <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                    {rec.reason}
                  </p>

                  {matchedLot && (
                    <div className="text-[11px] text-[#86868B] flex items-center gap-1.5 pt-1">
                      <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{matchedLot.storeName} ({matchedLot.storeAddress || 'Commercial Dock'})</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B]">
                    Closes community gap
                  </span>
                  {matchedLot ? (
                    <button
                      onClick={() => onRequestLot(matchedLot)}
                      className="px-4 py-1.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[12px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Claim lot</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#86868B]">Available on radar</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
