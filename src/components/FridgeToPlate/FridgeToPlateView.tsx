import React, { useState } from 'react';
import { FoodItem, AllergyProfile, Recipe } from '../../types';
import { ActionBoard } from './ActionBoard';
import { PhotoScanner } from './PhotoScanner';
import { RecipeGenerator } from './RecipeGenerator';
import { DonationModal } from './DonationModal';
import { CookingAssistantModal } from './CookingAssistantModal';
import {
  PageHero,
  SegmentedControl,
  Card,
  StatusDot,
} from '../common/Primitives';
import {
  Camera,
  Utensils,
  HeartHandshake,
  Mic,
  Plus,
  ShieldCheck,
  Search,
  BookOpen,
} from 'lucide-react';
import { calculateEstimatedExpiry, determineActionBoardStep, USDA_FOODKEEPER_DATABASE } from '../../data/foodkeeperData';
import { useRegion } from '../../context/RegionContext';

interface FridgeToPlateViewProps {
  items: FoodItem[];
  onUpdateItems: (items: FoodItem[]) => void;
  allergyProfile: AllergyProfile;
  weeklySavingsDollars: number;
  onAddSavings: (dollars: number) => void;
}

export const FridgeToPlateView: React.FC<FridgeToPlateViewProps> = ({
  items,
  onUpdateItems,
  allergyProfile,
  weeklySavingsDollars,
  onAddSavings,
}) => {
  const { config, formatPrice } = useRegion();
  const [showScanner, setShowScanner] = useState(false);
  const [showSousChef, setShowSousChef] = useState(false);
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);
  const [foodKeeperQuery, setFoodKeeperQuery] = useState('');
  const [donatingItem, setDonatingItem] = useState<FoodItem | null>(null);
  const [prioritizedItem, setPrioritizedItem] = useState<FoodItem | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'recipes' | 'foodkeeper'>('board');

  // Manual Quick Add
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickQty, setQuickQty] = useState('1 unit');
  const [quickStorage, setQuickStorage] = useState<'fridge' | 'pantry' | 'freezer'>('fridge');
  const [quickState, setQuickState] = useState<'opened' | 'sealed'>('opened');

  const handleAddConfirmedItems = (newItems: FoodItem[]) => {
    onUpdateItems([...newItems, ...items]);
    setShowScanner(false);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const exp = calculateEstimatedExpiry(quickName, quickStorage, quickState);
    const step = determineActionBoardStep(quickName, 'Produce', quickStorage, quickState, exp.daysRemaining);

    const newItem: FoodItem = {
      id: `food-${Date.now()}`,
      name: quickName.trim(),
      category: 'Produce',
      quantity: quickQty,
      storage: quickStorage,
      packageState: quickState,
      dateAdded: new Date().toISOString(),
      expirationDate: exp.expirationDate,
      isEstimated: true,
      confidence: 0.99,
      actionStatus: step.actionStatus,
      nextStepText: step.nextStepText,
    };

    onUpdateItems([newItem, ...items]);
    setQuickName('');
    setShowQuickAdd(false);
  };

  const handleCookItem = (item: FoodItem) => {
    setPrioritizedItem(item);
    setActiveTab('recipes');
  };

  const handleFreezeItem = (item: FoodItem) => {
    const updated = items.map((i) => {
      if (i.id === item.id) {
        const exp = calculateEstimatedExpiry(i.name, 'freezer', i.packageState);
        return {
          ...i,
          storage: 'freezer' as const,
          expirationDate: exp.expirationDate,
          actionStatus: 'stable' as const,
          nextStepText: `Frozen safely; good for ~${exp.daysRemaining} days`,
        };
      }
      return i;
    });
    onUpdateItems(updated);
    onAddSavings(4.50);
  };

  const handleMarkUsed = (item: FoodItem) => {
    onUpdateItems(items.filter((i) => i.id !== item.id));
    onAddSavings(5.20);
  };

  const handleMealCooked = (recipe: Recipe) => {
    onAddSavings(recipe.estimatedDollarsSaved);
    const rescuedNames = recipe.rescuedIngredients.map((n) => n.toLowerCase());
    onUpdateItems(items.filter((i) => !rescuedNames.some((r) => i.name.toLowerCase().includes(r))));
  };

  const filteredFoodKeeper = USDA_FOODKEEPER_DATABASE.filter(
    (r) =>
      r.name.toLowerCase().includes(foodKeeperQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(foodKeeperQuery.toLowerCase())
  );

  const urgentCount = items.filter((i) => i.actionStatus === 'use-today').length;

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Apple-style Centered Hero with Dynamic Live Metrics */}
      <PageHero
        eyebrow="Kitchen Intelligence"
        title="Know what's in your fridge. Waste none of it."
        subtitle={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>{formatPrice(weeklySavingsDollars)} saved this week.</span>
            <span>•</span>
            <span>
              {urgentCount > 0
                ? `${urgentCount} item${urgentCount > 1 ? 's' : ''} need${urgentCount === 1 ? 's' : ''} you today.`
                : 'All items safe and accounted for.'}
            </span>
            {allergyProfile.allergies.length > 0 && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1F7A4D] dark:text-[#34C77B]">
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                  <span>Allergy Shield on</span>
                </span>
              </>
            )}
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Primary Action Pill */}
            <button
              onClick={() => setShowScanner(true)}
              className="apple-pill-btn px-6 py-3 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white text-[14px] font-medium shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" strokeWidth={1.5} />
              <span>Scan fridge or receipt</span>
            </button>

            {/* Secondary Quiet Actions */}
            <button
              onClick={() => setActiveTab('recipes')}
              className="apple-pill-btn px-5 py-3 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] text-[14px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Utensils className="w-4 h-4 text-[#6E6E73]" strokeWidth={1.5} />
              <span>Generate recipes</span>
            </button>

            <button
              onClick={() => {
                const cand = items.find((i) => i.actionStatus === 'donate-eligible') || items[0];
                if (cand) setDonatingItem(cand);
              }}
              className="apple-pill-btn px-5 py-3 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] text-[14px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-[#6E6E73]" strokeWidth={1.5} />
              <span>Donate surplus</span>
            </button>

            {/* Hands-Free Sous Chef Secondary Button (Not a loud colored block) */}
            <button
              onClick={() => {
                setActiveCookingRecipe(null);
                setShowSousChef(true);
              }}
              className="apple-pill-btn px-4 py-3 rounded-full border border-black/[0.08] dark:border-white/[0.12] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
              title="Hands-free voice assistant"
            >
              <Mic className="w-3.5 h-3.5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
              <span>Cooking assistant</span>
            </button>

            <button
              onClick={() => setShowQuickAdd(true)}
              className="apple-pill-btn p-3 rounded-full border border-black/[0.08] dark:border-white/[0.12] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#6E6E73] dark:text-[#86868B] cursor-pointer"
              title="Quick manual add"
              aria-label="Add item manually"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        }
      />

      {/* 2. Sub-Navigation Tabs as Apple SegmentedControl */}
      <div className="flex justify-center">
        <SegmentedControl
          options={[
            { value: 'board', label: 'Action Board', count: items.length },
            { value: 'recipes', label: 'Recipes' },
            { value: 'foodkeeper', label: 'FoodKeeper Database' },
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'board' | 'recipes' | 'foodkeeper')}
        />
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'board' && (
        <ActionBoard
          items={items}
          onCookItem={handleCookItem}
          onFreezeItem={handleFreezeItem}
          onDonateItem={(item) => setDonatingItem(item)}
          onMarkUsed={handleMarkUsed}
          onInspectItem={() => setActiveTab('foodkeeper')}
        />
      )}

      {activeTab === 'recipes' && (
        <RecipeGenerator
          inventory={items}
          allergyProfile={allergyProfile}
          prioritizedItem={prioritizedItem}
          onMealCooked={handleMealCooked}
        />
      )}

      {activeTab === 'foodkeeper' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-[20px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                USDA FoodKeeper Reference
              </h3>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                Official scientific shelf-life and storage guidelines
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search food item..."
                value={foodKeeperQuery}
                onChange={(e) => setFoodKeeperQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white dark:bg-[#1C1C1E] text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-[#1F7A4D]"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden">
            {filteredFoodKeeper.slice(0, 20).map((row, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-black/[0.01]">
                <div>
                  <div className="font-semibold text-[14px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {row.name}
                  </div>
                  <div className="text-[12px] text-[#86868B] mt-0.5">
                    Category: {row.category}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                  <span>Fridge: {row.fridgeOpenedDays}–{row.fridgeSealedDays} days</span>
                  <span>Freezer: ~{row.freezerMonths} months</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Quick Add Modal */}
      {showQuickAdd && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQuickAdd(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[28px] border border-black/[0.08] dark:border-white/[0.12] p-6 shadow-2xl space-y-4">
            <h3 className="text-[18px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Add Kitchen Item
            </h3>
            <form onSubmit={handleManualAdd} className="space-y-3.5 text-[13px]">
              <div>
                <label className="text-[12px] text-[#86868B] font-medium block mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Baby Spinach"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:ring-1 focus:ring-[#1F7A4D]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium block mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={quickQty}
                    onChange={(e) => setQuickQty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] text-[#1D1D1F] dark:text-[#F5F5F7]"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium block mb-1">
                    Storage
                  </label>
                  <select
                    value={quickStorage}
                    onChange={(e) => setQuickStorage(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] text-[#1D1D1F] dark:text-[#F5F5F7]"
                  >
                    <option value="fridge">Refrigerator</option>
                    <option value="freezer">Freezer</option>
                    <option value="pantry">Pantry Shelf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[12px] text-[#86868B] font-medium block mb-1">
                  Package State
                </label>
                <div className="flex gap-2">
                  {(['opened', 'sealed'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setQuickState(st)}
                      className={`flex-1 py-1.5 rounded-xl border text-[12px] font-medium capitalize transition-colors ${
                        quickState === st
                          ? 'bg-[#1F7A4D] dark:bg-[#34C77B] text-white border-transparent'
                          : 'border-black/[0.08] dark:border-white/[0.12] text-[#6E6E73]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="apple-pill-btn px-4 py-2 text-[#6E6E73]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-pill-btn px-5 py-2 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] text-white font-medium"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Scanner Sheet */}
      {showScanner && (
        <PhotoScanner
          onItemsConfirmed={handleAddConfirmedItems}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Donation "Pass It On" Modal */}
      {donatingItem && (
        <DonationModal
          item={donatingItem}
          onClose={() => setDonatingItem(null)}
          onConfirmDonationPledge={(item) => {
            onUpdateItems(items.filter((i) => i.id !== item.id));
            setDonatingItem(null);
          }}
        />
      )}

      {/* Cooking Assistant Modal */}
      <CookingAssistantModal
        isOpen={showSousChef}
        onClose={() => setShowSousChef(false)}
        inventory={items}
        allergyProfile={allergyProfile}
        activeRecipe={activeCookingRecipe}
      />
    </div>
  );
};
