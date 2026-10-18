import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/* 1. PageHero */
export interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  subtitle,
  actions,
  align = 'center',
  className = '',
}) => {
  return (
    <div
      className={`py-10 md:py-16 ${
        align === 'center' ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-3xl'
      } ${className}`}
    >
      {eyebrow && (
        <p className="text-[13px] font-semibold tracking-wider text-[#1F7A4D] dark:text-[#34C77B] uppercase mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[36px] sm:text-[48px] md:text-[56px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight leading-[1.08]">
        {title}
      </h1>
      {subtitle && (
        <div className="mt-3.5 text-[17px] md:text-[19px] text-[#6E6E73] dark:text-[#86868B] font-normal leading-relaxed">
          {subtitle}
        </div>
      )}
      {actions && (
        <div
          className={`mt-6 flex flex-wrap items-center gap-3 ${
            align === 'center' ? 'justify-center' : 'justify-start'
          }`}
        >
          {actions}
        </div>
      )}
    </div>
  );
};

/* 2. SectionHeading */
export interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 ${className}`}>
      <div>
        <h2 className="text-[21px] sm:text-[24px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

/* 3. Card */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] rounded-[26px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-200 ${
        hoverable ? 'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:hover:border-white/[0.14]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* 4. FeaturedCard */
export interface FeaturedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-white to-[#FAFAFC] dark:from-[#1C1C1E] dark:to-[#161618] border border-black/[0.08] dark:border-white/[0.12] rounded-[28px] p-7 sm:p-9 shadow-[0_12px_36px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* 5. SegmentedControl (iOS style) */
export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 bg-black/[0.05] dark:bg-white/[0.08] rounded-full border border-black/[0.03] dark:border-white/[0.04] select-none ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`apple-pill-btn relative flex items-center justify-center gap-1.5 font-medium transition-all duration-200 cursor-pointer ${
              size === 'sm' ? 'px-3 py-1 text-[12px]' : 'px-4 py-1.5 text-[13px]'
            } ${
              active
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-semibold'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
            }`}
          >
            <span>{opt.label}</span>
            {typeof opt.count === 'number' && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                  active
                    ? 'bg-black/[0.06] dark:bg-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7]'
                    : 'text-[#86868B]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* 6. Sheet (Translucent Modal Sheet) */
export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className = '',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        className={`w-full ${widthClasses} bg-white dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] rounded-[28px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] dark:shadow-[0_28px_72px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] flex flex-col transition-all duration-300 animate-in zoom-in-95 ${className}`}
      >
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <div>
              {title && (
                <h3 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-[#6E6E73] hover:text-[#1D1D1F] dark:text-[#86868B] dark:hover:text-[#F5F5F7] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

/* 7. Popover */
export interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const Popover: React.FC<PopoverProps> = ({
  isOpen,
  onClose,
  children,
  trigger,
  title,
  className = '',
  align = 'right',
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const alignClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  }[align];

  const content = isOpen ? (
    <div
      ref={popoverRef}
      className={`absolute top-full mt-2 z-40 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] rounded-[20px] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-w-[240px] max-w-xs ${alignClasses} ${className}`}
    >
      {title && (
        <div className="font-semibold text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5 pb-1.5 border-b border-black/[0.04] dark:border-white/[0.06]">
          {title}
        </div>
      )}
      {children}
    </div>
  ) : null;

  if (trigger) {
    return (
      <div className="relative inline-block">
        {trigger}
        {content}
      </div>
    );
  }

  return content;
};

/* 8. StatTile */
export interface StatTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  accent?: boolean;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  subtext,
  change,
  accent = false,
  className = '',
}) => {
  const subtitle = subtext || change;

  return (
    <div
      className={`p-6 rounded-[24px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${className}`}
    >
      <div className="text-[13px] font-medium text-[#6E6E73] dark:text-[#86868B]">
        {label}
      </div>
      <div
        className={`text-[36px] sm:text-[44px] font-semibold tracking-tight leading-none mt-2 ${
          accent ? 'text-[#1F7A4D] dark:text-[#34C77B]' : 'text-[#1D1D1F] dark:text-[#F5F5F7]'
        }`}
      >
        {value}
      </div>
      {subtitle && (
        <div className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-2">
          {subtitle}
        </div>
      )}
    </div>
  );
};

/* 9. StatusDot */
export interface StatusDotProps {
  status: 'safe' | 'soon' | 'urgent' | 'neutral';
  pulse?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, pulse = false }) => {
  const colorClasses = {
    safe: 'bg-[#1F7A4D] dark:bg-[#34C77B]',
    soon: 'bg-[#D97706] dark:bg-[#F59E0B]',
    urgent: 'bg-[#DC2626] dark:bg-[#EF4444]',
    neutral: 'bg-[#86868B]',
  }[status];

  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {pulse && (
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClasses}`}
        />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colorClasses}`} />
    </span>
  );
};

/* 10. ConfidenceIndicator (Never a raw number, 3 calm dots) */
export interface ConfidenceIndicatorProps {
  level?: 'high' | 'medium' | 'low';
  score?: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  title?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  level,
  score,
  size = 'md',
  showLabel = true,
  title = 'AI Confidence',
}) => {
  const resolvedLevel: 'high' | 'medium' | 'low' =
    level ||
    (typeof score === 'number'
      ? score >= 0.85 || score >= 85
        ? 'high'
        : score >= 0.6 || score >= 60
        ? 'medium'
        : 'low'
      : 'high');

  const activeCount = resolvedLevel === 'high' ? 3 : resolvedLevel === 'medium' ? 2 : 1;
  const labelText = resolvedLevel === 'high' ? 'High' : resolvedLevel === 'medium' ? 'Moderate' : 'Low';

  return (
    <div
      className="inline-flex items-center gap-1.5 text-[11px] text-[#6E6E73] dark:text-[#86868B]"
      title={`${title}: ${labelText}`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`rounded-full ${
              size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'
            } ${
              dot <= activeCount
                ? 'bg-[#1F7A4D] dark:bg-[#34C77B]'
                : 'bg-black/[0.12] dark:bg-white/[0.16]'
            }`}
          />
        ))}
      </div>
      {showLabel && <span className="text-[11px] font-medium">{labelText}</span>}
    </div>
  );
};

/* 11. SkeletonShimmer */
export const SkeletonShimmer: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse rounded-full bg-black/[0.06] dark:bg-white/[0.08] ${className}`}
    />
  );
};

/* 12. EmptyState */
export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div className="py-14 text-center max-w-sm mx-auto">
      {icon && <div className="mb-3 text-[#86868B] flex justify-center">{icon}</div>}
      <h3 className="text-[17px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
        {title}
      </h3>
      <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mt-1 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
