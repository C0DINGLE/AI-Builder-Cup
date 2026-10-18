import React, { useState } from 'react';
import { FoodItem } from '../../types';
import {
  FeaturedCard,
  Card,
  SegmentedControl,
  StatusDot,
  ConfidenceIndicator,
  Popover,
} from '../common/Primitives';
import {
  Utensils,
  Snowflake,
  Check,
  HeartHandshake,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface ActionBoardProps {
  items: FoodItem[];
  onCookItem: (item: FoodItem) => void;
  onFreezeItem: (item: FoodItem) => void;
  onDonateItem: (item: FoodItem) => void;
  onMarkUsed: (item: FoodItem) => void;
  onInspectItem: (item: FoodItem) => void;
}

export const ActionBoard: React.FC<ActionBoardProps> = ({
  items,
  onCookItem,
  onFreezeItem,
  onDonateItem,
  onMarkUsed,
  onInspectItem,
}) => {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'soon' | 'stable' | 'pantry'>('all');
  const [openWhyPopoverId, setOpenWhyPopoverId] = useState<string | null>(null);

  // Group items by urgency
  const urgentItems = items.filter((i) => i.actionStatus === 'use-today');
  const soonItems = items.filter((i) => i.actionStatus === 'use-soon');
  const stableItems = items.filter((i) => i.actionStatus === 'stable');
  const pantryItems = items.filter((i) => i.actionStatus === 'donate-eligible');

  // Single most urgent item for FeaturedCard
  const mostUrgentItem = urgentItems[0] || soonItems[0] || items[0];

  const filterOptions = [
    { value: 'all' as const, label: 'All Items', count: items.length },
    { value: 'urgent' as const, label: 'Urgent (0–2d)', count: urgentItems.length },
    { value: 'soon' as const, label: 'Soon (3–5d)', count: soonItems.length },
    { value: 'stable' as const, label: 'Stable (6d+)', count: stableItems.length },
    { value: 'pantry' as const, label: 'Pantry', count: pantryItems.length },
  ];

  const renderItemCard = (item: FoodItem) => {
    const isUrgent = item.actionStatus === 'use-today';
    const isSoon = item.actionStatus === 'use-soon';
    const isPantry = item.actionStatus === 'donate-eligible';
    const statusType = isUrgent ? 'urgent' : isSoon ? 'soon' : 'safe';
    const isWhyOpen = openWhyPopoverId === item.id;

    return (
      <Card
        key={item.id}
        hoverable
        className="w-[280px] sm:w-[310px] shrink-0 flex flex-col justify-between p-5 space-y-4"
      >
        <div>
          {/* Top metadata & estimated pill */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#6E6E73] dark:text-[#86868B]">
              <StatusDot status={statusType} />
              <span className="capitalize">{item.actionStatus.replace('-', ' ')}</span>
            </div>
            {item.isEstimated && (
              <span className="text-[10px] text-[#86868B] bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full font-medium">
                estimated
              </span>
            )}
          </div>

          {/* Item Name & Details */}
          <div className="mt-2.5">
            <h4 className="text-[16px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight truncate">
              {item.name}
            </h4>
            <div className="text-[12px] text-[#86868B] mt-0.5 flex items-center gap-1.5">
              <span>{item.quantity}</span>
              <span>•</span>
              <span className="capitalize">{item.storage}</span>
              <span>•</span>
              <span className="capitalize">{item.packageState}</span>
            </div>
          </div>

          {/* Action Callout */}
          <div className="mt-3 py-2 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] text-[12px] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium flex items-center justify-between">
            <span className="truncate">{item.nextStepText}</span>
            {/* "Why?" Popover trigger */}
            <div className="relative">
              <button
                onClick={() => setOpenWhyPopoverId(isWhyOpen ? null : item.id)}
                className="text-[11px] font-semibold text-[#1F7A4D] dark:text-[#34C77B] hover:underline shrink-0 ml-1.5 cursor-pointer"
              >
                Why?
              </button>
              <Popover
                isOpen={isWhyOpen}
                onClose={() => setOpenWhyPopoverId(null)}
                align="right"
                className="w-64 text-[12px] text-[#1D1D1F] dark:text-[#F5F5F7] space-y-2"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>FoodKeeper Reasoning</span>
                  <ConfidenceIndicator level="high" />
                </div>
                <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                  Based on USDA shelf-life datasets for {item.name.toLowerCase()} stored in {item.storage} ({item.packageState}).
                </p>
                <div className="pt-1 border-t border-black/[0.06] dark:border-white/[0.08] text-[10px] text-[#86868B]">
                  No AI hallucination • Deterministic baseline
                </div>
              </Popover>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between gap-1.5">
          {isPantry ? (
            <button
              onClick={() => onDonateItem(item)}
              className="apple-pill-btn px-4 py-1.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white text-[12px] font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Pass on</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onCookItem(item)}
                className="apple-pill-btn px-3.5 py-1.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white text-[12px] font-medium flex items-center gap-1 cursor-pointer"
                title="Cook recipe"
              >
                <Utensils className="w-3 h-3" strokeWidth={1.5} />
                <span>Cook</span>
              </button>

              {item.storage !== 'freezer' && (
                <button
                  onClick={() => onFreezeItem(item)}
                  className="apple-pill-btn px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] text-[12px] font-medium flex items-center gap-1 cursor-pointer"
                  title="Move to freezer"
                >
                  <Snowflake className="w-3 h-3 text-[#86868B]" strokeWidth={1.5} />
                  <span>Freeze</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => onMarkUsed(item)}
            className="apple-pill-btn w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#6E6E73] hover:text-[#1F7A4D] dark:text-[#86868B] dark:hover:text-[#34C77B] flex items-center justify-center transition-colors cursor-pointer"
            title="Mark as eaten / consumed"
          >
            <Check className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Large FeaturedCard for the Single Most Urgent Item */}
      {mostUrgentItem && (
        <FeaturedCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <StatusDot status={mostUrgentItem.actionStatus === 'use-today' ? 'urgent' : 'soon'} pulse />
                <span className="text-[12px] font-semibold tracking-wider uppercase text-[#1F7A4D] dark:text-[#34C77B]">
                  Needs Attention First
                </span>
                <span className="text-[12px] text-[#86868B]">•</span>
                <span className="text-[12px] text-[#86868B]">{mostUrgentItem.storage}</span>
              </div>
              <h3 className="text-[26px] sm:text-[32px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                {mostUrgentItem.name}
              </h3>
              <p className="text-[15px] text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
                {mostUrgentItem.nextStepText}. Enjoy it today or preserve it in the freezer to halt food waste.
              </p>
            </div>

            {/* Quiet Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onCookItem(mostUrgentItem)}
                className="apple-pill-btn px-6 py-2.5 rounded-full bg-[#1F7A4D] hover:bg-[#18603C] dark:bg-[#34C77B] dark:hover:bg-[#2EB36E] text-white text-[13px] font-medium shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Utensils className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Cook with this</span>
              </button>

              {mostUrgentItem.storage !== 'freezer' && (
                <button
                  onClick={() => onFreezeItem(mostUrgentItem)}
                  className="apple-pill-btn px-5 py-2.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px] font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Snowflake className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={1.5} />
                  <span>Freeze</span>
                </button>
              )}

              <button
                onClick={() => onMarkUsed(mostUrgentItem)}
                className="apple-pill-btn px-4 py-2.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#1D1D1F] dark:text-[#F5F5F7] text-[13px] font-medium flex items-center gap-1 cursor-pointer"
                title="Mark as eaten"
              >
                <Check className="w-3.5 h-3.5 text-[#1F7A4D] dark:text-[#34C77B]" strokeWidth={1.5} />
                <span>Done</span>
              </button>
            </div>
          </div>
        </FeaturedCard>
      )}

      {/* 2. Group Filter as iOS SegmentedControl */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div>
          <h3 className="text-[20px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Kitchen Inventory
          </h3>
          <p className="text-[13px] text-[#86868B] mt-0.5">
            Organized by safe consumption urgency
          </p>
        </div>

        <SegmentedControl
          options={filterOptions}
          value={filter}
          onChange={(val) => setFilter(val)}
        />
      </div>

      {/* 3. Urgency Groups (Horizontally Snap-scrolling Rows or Clean Grid) */}
      <div className="space-y-7">
        {(filter === 'all' || filter === 'urgent') && urgentItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusDot status="urgent" />
              <h4 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Today & Tomorrow (0–2 Days)
              </h4>
              <span className="text-[12px] text-[#86868B]">({urgentItems.length})</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
              {urgentItems.map(renderItemCard)}
            </div>
          </div>
        )}

        {(filter === 'all' || filter === 'soon') && soonItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusDot status="soon" />
              <h4 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                This Week (3–5 Days)
              </h4>
              <span className="text-[12px] text-[#86868B]">({soonItems.length})</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
              {soonItems.map(renderItemCard)}
            </div>
          </div>
        )}

        {(filter === 'all' || filter === 'stable') && stableItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusDot status="safe" />
              <h4 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Stable & Frozen (6+ Days)
              </h4>
              <span className="text-[12px] text-[#86868B]">({stableItems.length})</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
              {stableItems.map(renderItemCard)}
            </div>
          </div>
        )}

        {(filter === 'all' || filter === 'pantry') && pantryItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusDot status="neutral" />
              <h4 className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Pantry & Condiments
              </h4>
              <span className="text-[12px] text-[#86868B]">({pantryItems.length})</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
              {pantryItems.map(renderItemCard)}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-16 bg-black/[0.01] dark:bg-white/[0.01] rounded-[26px] border border-black/[0.04] dark:border-white/[0.06]">
            <p className="text-[15px] text-[#86868B]">No items currently recorded in your kitchen.</p>
          </div>
        )}
      </div>
    </div>
  );
};
