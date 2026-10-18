import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  animated = false,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 54, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 72, text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 
        COLOR THEORY LOGO:
        - Emerald Green (#10B981): Nature, fresh agricultural supply, sustainable zero-waste
        - Harvest Amber (#F59E0B / #EA580C): Warmth, appetite, community meals, food bank care
        - Circular Mobius Loop: Continuous transition from surplus to access (circular economy)
        - AI Star Core: Gemini multi-agent predictive coordination
      */}
      <div className={`relative flex items-center justify-center shrink-0 ${animated ? 'transition-transform duration-500 hover:rotate-6' : ''}`}>
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <defs>
            {/* Emerald Gradient for Fresh Supply / Sprout */}
            <linearGradient id="emeraldGradient" x1="10" y1="10" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Amber Warmth Gradient for Meals & Community Pantry */}
            <linearGradient id="amberGradient" x1="20" y1="90" x2="90" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* AI Core Glow */}
            <linearGradient id="sparkleGradient" x1="45" y1="45" x2="55" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left / Upper Ribbon: Fresh Leaf & Circular Flow (Emerald) */}
          <path
            d="M 50 15 
               C 28 15, 12 30, 12 50 
               C 12 68, 26 80, 42 75 
               C 56 70, 48 40, 68 28 
               C 62 19, 56 15, 50 15 Z"
            fill="url(#emeraldGradient)"
            opacity="0.95"
          />

          {/* Sprout Leaf Accent */}
          <path
            d="M 36 28 
               C 36 28, 48 24, 52 32 
               C 52 32, 44 42, 36 28 Z"
            fill="#6EE7B7"
          />

          {/* Right / Lower Ribbon: Nourishing Plate Contour & Shared Table (Harvest Amber) */}
          <path
            d="M 50 85 
               C 72 85, 88 70, 88 50 
               C 88 32, 74 20, 58 25 
               C 44 30, 52 60, 32 72 
               C 38 81, 44 85, 50 85 Z"
            fill="url(#amberGradient)"
            opacity="0.95"
          />

          {/* Plate Rim Accent */}
          <path
            d="M 64 72 
               C 64 72, 52 76, 48 68 
               C 48 68, 56 58, 64 72 Z"
            fill="#FDE68A"
          />

          {/* Central AI Coordination Sparkle */}
          <circle cx="50" cy="50" r="7" className="fill-slate-900 dark:fill-slate-800" />
          <path
            d="M 50 42 
               Q 50 50, 58 50 
               Q 50 50, 50 58 
               Q 50 50, 42 50 
               Q 50 50, 50 42 Z"
            fill="url(#sparkleGradient)"
            filter="url(#glowFilter)"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left select-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-slate-900 dark:text-white transition-colors ${currentSize.text}`}>
              Nourish<span className="text-emerald-600 dark:text-emerald-400">Loop</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 dark:border dark:border-amber-700/50 tracking-wide uppercase transition-colors">
              AI
            </span>
          </div>
          <span className={`text-slate-500 dark:text-slate-400 font-medium tracking-normal -mt-0.5 transition-colors ${currentSize.sub}`}>
            From Food Waste to Food Access
          </span>
        </div>
      )}
    </div>
  );
};
