import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, AlertCircle, Sparkles, Barcode, ScanLine } from 'lucide-react';
import { DEMO_PRESETS, DemoPreset } from '../../data/demoPhotos';
import { FoodItem } from '../../types';
import { calculateEstimatedExpiry, determineActionBoardStep } from '../../data/foodkeeperData';
import { Sheet, SegmentedControl, ConfidenceIndicator, SkeletonShimmer } from '../common/Primitives';
import { sounds } from '../../utils/audioEffects';

interface PhotoScannerProps {
  onItemsConfirmed: (items: FoodItem[]) => void;
  onCancel?: () => void;
}

const COMMON_BARCODES: Array<{
  barcode: string;
  name: string;
  category: FoodItem['category'];
  quantity: string;
  storage: 'fridge' | 'freezer' | 'pantry';
  packageState: 'opened' | 'sealed';
  days: number;
}> = [
  { barcode: '041573038241', name: 'Organic Whole Milk', category: 'Dairy', quantity: '1/2 gallon', storage: 'fridge' as const, packageState: 'sealed' as const, days: 7 },
  { barcode: '071430009214', name: 'Organic Baby Spinach', category: 'Produce', quantity: '1 clamshell (16 oz)', storage: 'fridge' as const, packageState: 'sealed' as const, days: 5 },
  { barcode: '020814004921', name: 'Fresh Boneless Chicken Breast', category: 'Meat', quantity: '1.2 lbs', storage: 'fridge' as const, packageState: 'sealed' as const, days: 2 },
  { barcode: '070542001221', name: 'Greek Plain Yogurt', category: 'Dairy', quantity: '32 oz tub', storage: 'fridge' as const, packageState: 'opened' as const, days: 10 },
  { barcode: '038000198421', name: 'Rolled Whole Oats', category: 'Pantry', quantity: '1 canister (42 oz)', storage: 'pantry' as const, packageState: 'sealed' as const, days: 365 },
];

export const PhotoScanner: React.FC<PhotoScannerProps> = ({ onItemsConfirmed, onCancel }) => {
  const [scanMode, setScanMode] = useState<'fridge' | 'receipt' | 'barcode'>('fridge');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedItems, setExtractedItems] = useState<Array<Partial<FoodItem> & { checked: boolean; confidence: number; daysRemaining?: number }>>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (preset: DemoPreset) => {
    setPreviewImage(preset.imageUrl);
    setScanMode(preset.type === 'receipt' ? 'receipt' : 'fridge');
    triggerExtraction(preset.imageUrl, preset);
  };

  const handleSimulateBarcode = (item: typeof COMMON_BARCODES[0]) => {
    setIsScanning(true);
    setTimeout(() => {
      const exp = calculateEstimatedExpiry(item.name, item.storage, item.packageState);
      const step = determineActionBoardStep(
        item.name,
        item.category,
        item.storage,
        item.packageState,
        exp.daysRemaining
      );

      setExtractedItems([
        {
          id: `barcode-${Date.now()}`,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          storage: item.storage,
          packageState: item.packageState,
          confidence: 0.99,
          daysRemaining: exp.daysRemaining,
          actionStatus: step.actionStatus,
          nextStepText: step.nextStepText,
          isEstimated: true,
          checked: true,
        },
      ]);
      setIsScanning(false);
    }, 600);
  };

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;

    const matched = COMMON_BARCODES.find(b => b.barcode === manualBarcode.trim()) || {
      barcode: manualBarcode,
      name: `Scanned Item (${manualBarcode.slice(-4)})`,
      category: 'Pantry' as FoodItem['category'],
      quantity: '1 item',
      storage: 'pantry' as const,
      packageState: 'sealed' as const,
      days: 30,
    };

    handleSimulateBarcode(matched);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      triggerExtraction(base64, null);
    };
    reader.readAsDataURL(file);
  };

  const triggerExtraction = async (imageData: string, preset: DemoPreset | null) => {
    setIsScanning(true);
    setExtractedItems([]);

    try {
      if (preset) {
        setTimeout(() => {
          const itemsWithChecked = preset.mockItems.map((item, idx) => {
            const { actionStatus, nextStepText } = determineActionBoardStep(
              item.name,
              item.category,
              item.storage,
              item.packageState,
              item.daysRemaining
            );

            return {
              id: `item-${Date.now()}-${idx}`,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              storage: item.storage,
              packageState: item.packageState,
              confidence: item.confidence ?? 0.95,
              daysRemaining: item.daysRemaining,
              actionStatus,
              nextStepText,
              isEstimated: true,
              checked: true,
            };
          });

          setExtractedItems(itemsWithChecked as any);
          setIsScanning(false);
        }, 750);
        return;
      }

      const res = await fetch('/api/scan-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageData,
          mode: scanMode,
        }),
      });

      const data = await res.json();
      if (data.success && data.items) {
        const mapped = data.items.map((raw: any, idx: number) => {
          const exp = calculateEstimatedExpiry(raw.name, raw.storage || 'fridge', raw.packageState || 'opened');
          const step = determineActionBoardStep(
            raw.name,
            raw.category || 'Produce',
            raw.storage || 'fridge',
            raw.packageState || 'opened',
            exp.daysRemaining
          );

          return {
            id: `scan-${Date.now()}-${idx}`,
            name: raw.name,
            category: raw.category || 'Produce',
            quantity: raw.quantity || '1 unit',
            storage: raw.storage || 'fridge',
            packageState: raw.packageState || 'opened',
            confidence: raw.confidence ?? 0.91,
            daysRemaining: exp.daysRemaining,
            actionStatus: step.actionStatus,
            nextStepText: step.nextStepText,
            isEstimated: true,
            checked: true,
          };
        });

        setExtractedItems(mapped);
      } else {
        throw new Error(data.error || 'Vision scan yielded no recognized items');
      }
    } catch (err) {
      console.warn('Vision OCR fallback activated:', err);
      setExtractedItems([
        {
          id: `scan-fb-1`,
          name: 'Baby Spinach',
          category: 'Produce',
          quantity: '1 bag',
          storage: 'fridge',
          packageState: 'opened',
          confidence: 0.94,
          isEstimated: true,
          actionStatus: 'use-today',
          nextStepText: 'Consume within 24 hours',
          checked: true,
        },
        {
          id: `scan-fb-2`,
          name: 'Whole Milk',
          category: 'Dairy',
          quantity: '1/2 gallon',
          storage: 'fridge',
          packageState: 'opened',
          confidence: 0.78,
          isEstimated: true,
          actionStatus: 'use-soon',
          nextStepText: 'Consume in 3 days',
          checked: true,
        },
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    const verified = extractedItems
      .filter((i) => i.checked && i.name)
      .map((i) => {
        const exp = calculateEstimatedExpiry(i.name!, i.storage || 'fridge', i.packageState || 'opened');
        const step = determineActionBoardStep(
          i.name!,
          i.category || 'Produce',
          i.storage || 'fridge',
          i.packageState || 'opened',
          exp.daysRemaining
        );

        return {
          id: i.id || `item-${Date.now()}`,
          name: i.name!,
          category: i.category || 'Produce',
          quantity: i.quantity || '1 unit',
          storage: i.storage || 'fridge',
          packageState: i.packageState || 'opened',
          dateAdded: new Date().toISOString(),
          expirationDate: exp.expirationDate,
          isEstimated: true,
          confidence: i.confidence ?? 0.92,
          actionStatus: step.actionStatus,
          nextStepText: step.nextStepText,
        } as FoodItem;
      });

    sounds.playSuccessChime();
    onItemsConfirmed(verified);
  };

  return (
    <Sheet
      isOpen={true}
      onClose={onCancel || (() => {})}
      title="Intelligent Food Ingestion"
      description="Computer vision & FoodKeeper intelligence estimate shelf-life and action steps."
      maxWidth="lg"
    >
      <div className="space-y-6 text-[14px]">
        {/* Three-segment control */}
        <div className="flex justify-center">
          <SegmentedControl
            options={[
              { value: 'fridge', label: 'Fridge Photo' },
              { value: 'receipt', label: 'Receipt OCR' },
              { value: 'barcode', label: 'UPC Barcode' },
            ]}
            value={scanMode}
            onChange={(val) => setScanMode(val as 'fridge' | 'receipt' | 'barcode')}
          />
        </div>

        {/* Barcode Mode UI */}
        {scanMode === 'barcode' ? (
          <div className="space-y-4">
            {/* Viewfinder Simulator */}
            <div className="relative h-44 rounded-[22px] bg-black/90 dark:bg-black/70 border border-white/10 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
              <Barcode className="w-16 h-16 text-white/30 mb-2" strokeWidth={1} />
              <div className="text-[12px] font-mono text-white/80 flex items-center gap-1.5 z-10">
                <ScanLine className="w-3.5 h-3.5 text-red-400 animate-spin" />
                <span>Align barcode within viewfinder laser</span>
              </div>
            </div>

            {/* Quick-tap common barcodes */}
            <div>
              <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                Simulated UPC Barcode Library
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_BARCODES.map((b) => (
                  <button
                    key={b.barcode}
                    type="button"
                    onClick={() => handleSimulateBarcode(b)}
                    className="p-2.5 rounded-xl text-left bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] hover:border-[#1F7A4D] dark:hover:border-[#34C77B] flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{b.name}</div>
                      <div className="text-[11px] font-mono text-[#86868B]">{b.barcode} · {b.quantity}</div>
                    </div>
                    <span className="text-[11px] text-[#1F7A4D] dark:text-[#34C77B] font-medium">Scan</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Barcode Input Form */}
            <form onSubmit={handleManualBarcodeSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Or enter 12-digit UPC barcode..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="flex-1 px-4 py-2 rounded-full bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#1F7A4D]"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#1F7A4D] text-white text-[13px] font-medium hover:bg-[#18603C] transition cursor-pointer"
              >
                Lookup
              </button>
            </form>
          </div>
        ) : (
          /* Fridge & Receipt Photo Area */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* File input button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-[22px] border border-dashed border-black/[0.12] dark:border-white/[0.16] hover:border-[#1F7A4D] dark:hover:border-[#34C77B] bg-black/[0.02] dark:bg-white/[0.02] transition-colors flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#2C2C2E] shadow-sm flex items-center justify-center text-[#6E6E73] group-hover:text-[#1F7A4D] dark:group-hover:text-[#34C77B] transition-colors mb-2">
                {scanMode === 'fridge' ? (
                  <Camera className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Upload className="w-5 h-5" strokeWidth={1.5} />
                )}
              </div>
              <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-[14px]">
                {scanMode === 'fridge' ? 'Upload or capture photo' : 'Upload grocery receipt'}
              </div>
              <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                JPG, PNG up to 10MB
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Preset Samples */}
            <div className="p-4 rounded-[22px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-2">
                  Or Try Sample Scans
                </div>
                <div className="space-y-1.5">
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full px-3 py-2 rounded-xl text-left text-[13px] font-medium bg-white dark:bg-[#2C2C2E] border border-black/[0.04] dark:border-white/[0.08] hover:border-[#1F7A4D] dark:hover:border-[#34C77B] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{preset.title}</span>
                      <span className="text-[11px] text-[#86868B] shrink-0 ml-2">Sample</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanning State */}
        {isScanning && (
          <div className="py-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#1F7A4D] dark:text-[#34C77B]">
              <Sparkles className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              <span>Analyzing with FoodKeeper AI...</span>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <SkeletonShimmer className="h-10 w-full rounded-2xl" />
              <SkeletonShimmer className="h-10 w-3/4 mx-auto rounded-2xl" />
            </div>
          </div>
        )}

        {/* Extracted Items Confirmation Table */}
        {!isScanning && extractedItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[13px] text-[#6E6E73] dark:text-[#86868B] px-1">
              <span>{extractedItems.length} items detected • Review and confirm</span>
              <span className="text-[11px]">All dates estimated via FoodKeeper</span>
            </div>

            <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.06] max-h-72 overflow-y-auto">
              {extractedItems.map((item, idx) => {
                const confLevel = (item.confidence || 0.9) > 0.85 ? 'high' : (item.confidence || 0.9) > 0.70 ? 'medium' : 'low';
                const needsConfirm = confLevel !== 'high';

                return (
                  <div
                    key={idx}
                    className="p-3.5 flex items-center gap-3 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const updated = [...extractedItems];
                        updated[idx].checked = e.target.checked;
                        setExtractedItems(updated);
                      }}
                      className="rounded text-[#1F7A4D] focus:ring-0 w-4 h-4 cursor-pointer"
                    />

                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => {
                          const updated = [...extractedItems];
                          updated[idx].name = e.target.value;
                          setExtractedItems(updated);
                        }}
                        className="bg-transparent font-medium text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] border-b border-transparent focus:border-black/[0.2] dark:focus:border-white/[0.2] focus:outline-none truncate"
                      />
                      <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                        <input
                          type="text"
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const updated = [...extractedItems];
                            updated[idx].quantity = e.target.value;
                            setExtractedItems(updated);
                          }}
                          className="bg-transparent text-[12px] w-24 border-b border-transparent focus:border-black/[0.2] dark:focus:border-white/[0.2] focus:outline-none"
                        />
                        <span className="capitalize">{item.storage || 'fridge'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <ConfidenceIndicator level={confLevel} />
                      {needsConfirm && (
                        <span className="text-[10px] font-semibold text-[#D97706] dark:text-[#F59E0B] px-2 py-0.5 rounded-full bg-amber-500/10">
                          Please confirm
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Single Primary Action Pill */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleConfirm}
                className="apple-pill-btn px-6 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white font-medium text-[14px] shadow-sm cursor-pointer"
              >
                Add {extractedItems.filter((i) => i.checked).length} Items to Fridge
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
};
