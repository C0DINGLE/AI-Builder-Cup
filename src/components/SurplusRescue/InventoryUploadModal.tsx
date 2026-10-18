import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Check, Database, Sparkles, CloudRain, Calendar, X, ArrowRight } from 'lucide-react';
import { SurplusLot } from '../../types';
import { Sheet, SegmentedControl } from '../common/Primitives';

interface InventoryUploadModalProps {
  onClose: () => void;
  onApplyNewInventory: (newLots: SurplusLot[], narrative: string) => void;
}

export const InventoryUploadModal: React.FC<InventoryUploadModalProps> = ({
  onClose,
  onApplyNewInventory,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'greenmarket' | 'bakery' | 'dairy'>('greenmarket');
  const [weatherCondition, setWeatherCondition] = useState<'clear' | 'rain' | 'heatwave'>('rain');
  const [holidayEvent, setHolidayEvent] = useState<string>('Upcoming Long Weekend');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const handleRunForecast = () => {
    setIsProcessing(true);

    setTimeout(() => {
      let generatedLots: SurplusLot[] = [];
      let narrative = '';

      if (selectedPreset === 'bakery') {
        generatedLots = [
          {
            id: `lot-bakery-${Date.now()}`,
            storeId: 'GM-104',
            storeName: 'Artisan Bakery Dept',
            department: 'Bakery',
            itemsSummary: 'Sourdough loaves (24), brioche buns (30 pkgs), rye rolls (18)',
            totalPounds: 52,
            estimatedValue: 220.0,
            spoilageWindowHours: 24,
            requiresColdStorage: false,
            requiresSealedPackaging: true,
            status: 'forecasted',
            forecastConfidence: 96,
            createdAt: new Date().toISOString(),
            uncertaintyNarrative: `${weatherCondition === 'rain' ? 'Rainy evening forecasted: Footfall reduced by ~18%.' : 'Standard mid-week sales velocity.'} Bakery items will stale within 24 hours without donation.`,
          },
        ];
        narrative = 'Bakery forecast updated from inventory POS logs. Ambient shelf life 24 hours.';
      } else if (selectedPreset === 'dairy') {
        generatedLots = [
          {
            id: `lot-dairy-${Date.now()}`,
            storeId: 'GM-104',
            storeName: 'GreenMarket Dairy Dept',
            department: 'Dairy',
            itemsSummary: 'Organic 2% milk (20 gal), Greek yogurt cartons (28), Monterey Jack (14 blocks)',
            totalPounds: 84,
            estimatedValue: 310.0,
            spoilageWindowHours: 48,
            requiresColdStorage: true,
            requiresSealedPackaging: true,
            status: 'forecasted',
            forecastConfidence: 93,
            createdAt: new Date().toISOString(),
            uncertaintyNarrative: 'Supplier over-delivery with 4-day Use-By dates. Demands cold-storage certified food bank pairing immediately.',
          },
        ];
        narrative = 'Dairy batch synced. Requires refrigerated transport custody.';
      } else {
        generatedLots = [
          {
            id: `lot-greenmarket-${Date.now()}-1`,
            storeId: 'GM-104',
            storeName: 'Supermarket #104',
            department: 'Produce',
            itemsSummary: 'Organic kale crates (18), honeycrisp apples (35 lbs), heirloom carrots (22 lbs)',
            totalPounds: 75,
            estimatedValue: 240.0,
            spoilageWindowHours: 36,
            requiresColdStorage: true,
            requiresSealedPackaging: false,
            status: 'forecasted',
            forecastConfidence: 95,
            createdAt: new Date().toISOString(),
            uncertaintyNarrative: `${weatherCondition === 'heatwave' ? 'Ambient heat acceleration: Shelf life reduced by ~12 hours.' : 'Standard register velocity.'} Fresh produce requires morning distribution.`,
          },
          {
            id: `lot-greenmarket-${Date.now()}-2`,
            storeId: 'GM-104',
            storeName: 'Supermarket #104',
            department: 'Prepared Deli',
            itemsSummary: 'Rotisserie chicken meal boxes (16), artisan grain salads (24 containers)',
            totalPounds: 42,
            estimatedValue: 195.0,
            spoilageWindowHours: 18,
            requiresColdStorage: true,
            requiresSealedPackaging: true,
            status: 'forecasted',
            forecastConfidence: 91,
            createdAt: new Date().toISOString(),
            uncertaintyNarrative: 'Prepared deli surplus nearing same-day consumption window. Same-day pickup required.',
          },
        ];
        narrative = 'Supermarket #104 multi-department POS sync complete. 2 surplus lots generated.';
      }

      onApplyNewInventory(generatedLots, narrative);
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  const weatherOptions = [
    { value: 'clear' as const, label: 'Clear' },
    { value: 'rain' as const, label: 'Rain (-14%)' },
    { value: 'heatwave' as const, label: 'Heat (+8%)' },
  ];

  return (
    <Sheet
      isOpen={true}
      onClose={onClose}
      title="POS &amp; Weather Integration"
      description="Simulate register velocity and weather demand anomalies modifying the 30-day baseline."
      maxWidth="md"
    >
      <div className="space-y-6 text-[13px]">
        {/* Continuous Stream explanation */}
        <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
          <div className="text-[12px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
            Continuous Stream
          </div>
          <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
            In production, POS/ERP APIs (Toast, Square, SAP Retail) stream live register sales and write-offs. Store managers never have to re-upload files manually.
          </p>
        </div>

        {/* 1. Choose Sample POS Inventory Scenario */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
            1. Select Sample Inventory Scenario
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedPreset('greenmarket')}
              className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                selectedPreset === 'greenmarket'
                  ? 'bg-[#1F7A4D]/[0.06] dark:bg-[#34C77B]/[0.08] border-[#1F7A4D] dark:border-[#34C77B]'
                  : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12]'
              }`}
            >
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px]">Supermarket #104</div>
              <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">Produce &amp; Deli</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPreset('bakery')}
              className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                selectedPreset === 'bakery'
                  ? 'bg-[#1F7A4D]/[0.06] dark:bg-[#34C77B]/[0.08] border-[#1F7A4D] dark:border-[#34C77B]'
                  : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12]'
              }`}
            >
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px]">Artisan Bakery</div>
              <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">Sourdough Loaves</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPreset('dairy')}
              className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                selectedPreset === 'dairy'
                  ? 'bg-[#1F7A4D]/[0.06] dark:bg-[#34C77B]/[0.08] border-[#1F7A4D] dark:border-[#34C77B]'
                  : 'bg-white dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12]'
              }`}
            >
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px]">Organic Dairy</div>
              <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">Milk &amp; Yogurt</div>
            </button>
          </div>
        </div>

        {/* 2. Drag & Drop CSV */}
        <div className="p-4 rounded-[20px] border border-dashed border-black/[0.12] dark:border-white/[0.14] text-center space-y-2 bg-[#FBFBFD] dark:bg-[#161618]">
          <input
            type="file"
            id="csvFileInput"
            accept=".csv,.xlsx,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="csvFileInput"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-[12px] hover:border-black/[0.16] cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
            <span>{uploadedFileName || 'Or Choose Custom Inventory CSV / Excel'}</span>
          </label>
          <div className="text-[11px] text-[#86868B]">
            Columns: SKU, Department, OnHandQty, UnitCost, ExpirationDate
          </div>
        </div>

        {/* 3. External Signals: Weather & Events */}
        <div className="space-y-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
          <label className="text-[12px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
            2. External Signal Modifiers
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Weather Anomaly:</span>
              </span>
              <SegmentedControl
                options={weatherOptions}
                value={weatherCondition}
                onChange={(w) => setWeatherCondition(w)}
                size="sm"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Calendar Demand Shift:</span>
              </span>
              <select
                value={holidayEvent}
                onChange={(e) => setHolidayEvent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.08] text-[12px] text-[#1D1D1F] dark:text-[#F5F5F7] outline-none"
              >
                <option value="Upcoming Long Weekend">Long Weekend (+15% Demand)</option>
                <option value="Downtown Concert / Game">Downtown Event (+12% Deli)</option>
                <option value="Normal Workday Week">Standard Mid-Week</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7] transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isProcessing}
            onClick={handleRunForecast}
            className="px-5 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18633e] text-white font-medium text-[13px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{isProcessing ? 'Syncing...' : 'Sync POS & Run Prediction'}</span>
          </button>
        </div>
      </div>
    </Sheet>
  );
};
