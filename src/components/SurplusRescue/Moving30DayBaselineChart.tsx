import React, { useState, useMemo } from 'react';
import { useRegion } from '../../context/RegionContext';
import { SegmentedControl } from '../common/Primitives';
import {
  TrendingUp,
  TrendingDown,
  CloudRain,
  Sun,
  CloudSun,
  Flame,
  Calendar,
  Layers,
  BarChart2,
  LineChart as LineChartIcon,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Package,
  Clock,
  Info,
} from 'lucide-react';

export interface DayDataPoint {
  dayIndex: number;
  dateStr: string;
  dayOfWeek: string;
  baselineLbs: number;
  actualSalesLbs: number;
  surplusWasteLbs: number;
  deviationPercent: number;
  ema7Lbs: number;
  confidenceLowerLbs: number;
  confidenceUpperLbs: number;
  weather: 'rain' | 'sun' | 'hot' | 'cloudy';
  weatherFactorText: string;
  confidence: number;
  spoilageRisk: 'low' | 'moderate' | 'urgent';
  recommendedAction: string;
}

type DepartmentType = 'All' | 'Produce' | 'Dairy' | 'Bakery' | 'Prepared Deli' | 'Meat & Seafood';

interface DepartmentProfile {
  name: DepartmentType;
  baseAvg: number;
  volatilityScale: number;
  spoilageHours: number;
  rainSensitivity: number;
  weekendMultiplier: number;
  primaryRisk: string;
}

const DEPARTMENT_PROFILES: Record<DepartmentType, DepartmentProfile> = {
  All: {
    name: 'All',
    baseAvg: 2850,
    volatilityScale: 1.0,
    spoilageHours: 36,
    rainSensitivity: -0.12,
    weekendMultiplier: 1.28,
    primaryRisk: 'Composite multi-category evening turnover',
  },
  Produce: {
    name: 'Produce',
    baseAvg: 920,
    volatilityScale: 1.25,
    spoilageHours: 48,
    rainSensitivity: -0.08,
    weekendMultiplier: 1.35,
    primaryRisk: 'Post-arrival temperature shock & visual markdown threshold',
  },
  Dairy: {
    name: 'Dairy',
    baseAvg: 680,
    volatilityScale: 0.9,
    spoilageHours: 48,
    rainSensitivity: -0.05,
    weekendMultiplier: 1.22,
    primaryRisk: 'Strict cold custody temperature control (≤40°F / 4°C)',
  },
  Bakery: {
    name: 'Bakery',
    baseAvg: 410,
    volatilityScale: 1.45,
    spoilageHours: 28,
    rainSensitivity: -0.18,
    weekendMultiplier: 1.4,
    primaryRisk: 'Ambient moisture staling window (<36h)',
  },
  'Prepared Deli': {
    name: 'Prepared Deli',
    baseAvg: 460,
    volatilityScale: 1.35,
    spoilageHours: 18,
    rainSensitivity: -0.15,
    weekendMultiplier: 1.15,
    primaryRisk: 'Same-day meal consumption deadline (<18h)',
  },
  'Meat & Seafood': {
    name: 'Meat & Seafood',
    baseAvg: 380,
    volatilityScale: 1.1,
    spoilageHours: 24,
    rainSensitivity: -0.06,
    weekendMultiplier: 1.3,
    primaryRisk: 'Critical cold-chain safety gate & verified intake needed',
  },
};

// Generate deterministic, rich 30-day continuous baseline series
const generate30DaySeries = (dept: DepartmentType): DayDataPoint[] => {
  const profile = DEPARTMENT_PROFILES[dept];
  const points: DayDataPoint[] = [];

  const weatherCycle: Array<{
    type: 'rain' | 'sun' | 'hot' | 'cloudy';
    text: string;
    factorMod: number;
    wasteBoost: number;
  }> = [
    { type: 'sun', text: 'Clear sunny sky (+14% footfall)', factorMod: 0.14, wasteBoost: -18 },
    { type: 'cloudy', text: 'Overcast normal baseline', factorMod: -0.01, wasteBoost: 5 },
    { type: 'rain', text: 'Heavy rainfall & cold breeze (-16% walk-in)', factorMod: -0.16, wasteBoost: 38 },
    { type: 'cloudy', text: 'Seasonal overcast trading pattern', factorMod: 0.02, wasteBoost: 4 },
    { type: 'hot', text: 'Warm afternoon heat spike (+20% perishables risk)', factorMod: 0.08, wasteBoost: 42 },
    { type: 'sun', text: 'Sunny weekend family outdoor surge', factorMod: 0.18, wasteBoost: -12 },
    { type: 'rain', text: 'Evening thunderstorm footfall dip (-12%)', factorMod: -0.12, wasteBoost: 32 },
  ];

  let runningEma = profile.baseAvg;

  for (let i = 1; i <= 30; i++) {
    const dayOfWeekIndex = (i + 3) % 7; // Deterministic day index
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayOfWeek = days[dayOfWeekIndex];
    const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';

    const weather = weatherCycle[(i * 2 + 1) % weatherCycle.length];
    const weekendFactor = isWeekend ? profile.weekendMultiplier : 1.0;

    // Baseline calculation: rolling expected POS scan velocity
    const baseline = Math.round(profile.baseAvg * weekendFactor);

    // Actual volume introduces seasonal drift, weather impact, and periodic delivery spikes
    const periodicSine = Math.sin((i / 30) * Math.PI * 4) * 0.08;
    const actualMultiplier = 1 + weather.factorMod * (profile.volatilityScale * 0.7) + periodicSine;
    const actualSales = Math.max(120, Math.round(baseline * actualMultiplier));

    // Surplus waste volume diverges when actual sales drop below expected or shipment arrives
    const deviation = parseFloat((((actualSales - baseline) / baseline) * 100).toFixed(1));
    const rawWaste = Math.round(
      (profile.baseAvg * 0.075 + weather.wasteBoost * 0.7) * profile.volatilityScale +
        (deviation < 0 ? Math.abs(deviation) * 2.8 : 12)
    );
    const surplusWaste = Math.max(18, rawWaste);

    // Exponential Moving Average (7-day alpha ~ 0.25)
    runningEma = Math.round(runningEma * 0.75 + actualSales * 0.25);

    // Bayesian confidence intervals (+/- 7.5% error margin)
    const confidenceMargin = Math.round(baseline * 0.075);
    const confidenceLower = Math.max(0, baseline - confidenceMargin);
    const confidenceUpper = baseline + confidenceMargin;

    // Date generation
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    const dateStr =
      i === 30
        ? 'Today (Forecast)'
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    // Spoilage risk evaluation
    let spoilageRisk: 'low' | 'moderate' | 'urgent' = 'low';
    let recommendedAction = 'Routine shelf rotation. Regular markdown scheduled.';

    if (i === 30) {
      spoilageRisk = 'urgent';
      recommendedAction = `Active dispatch window <${profile.spoilageHours}h: 1-Click Offer Lot to verified local food banks.`;
    } else if (surplusWaste > 95 || deviation < -10) {
      spoilageRisk = 'moderate';
      recommendedAction = 'Early automated markdown triggered via POS price-audit sync.';
    }

    points.push({
      dayIndex: i,
      dateStr,
      dayOfWeek,
      baselineLbs: baseline,
      actualSalesLbs: actualSales,
      surplusWasteLbs: surplusWaste,
      deviationPercent: deviation,
      ema7Lbs: runningEma,
      confidenceLowerLbs: confidenceLower,
      confidenceUpperLbs: confidenceUpper,
      weather: weather.type,
      weatherFactorText: weather.text,
      confidence: i === 30 ? 94.6 : Math.min(99, 91 + (i % 6)),
      spoilageRisk,
      recommendedAction,
    });
  }

  return points;
};

// Generates smooth cubic Bezier path for SVG rendering without jaggedness
const buildSmoothPath = (
  points: { x: number; y: number }[]
): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

interface Moving30DayBaselineChartProps {
  initialDepartment?: DepartmentType;
  storeTitle?: string;
  onSelectDepartment?: (dept: string) => void;
}

export const Moving30DayBaselineChart: React.FC<Moving30DayBaselineChartProps> = ({
  initialDepartment = 'All',
  storeTitle,
  onSelectDepartment,
}) => {
  const { config, formatWeightUnit } = useRegion();
  const [selectedDept, setSelectedDept] = useState<DepartmentType>(initialDepartment);
  const [viewWindow, setViewWindow] = useState<'30day' | '14day' | '7day'>('30day');
  const [chartMode, setChartMode] = useState<'spline' | 'bars' | 'variance'>('spline');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Re-generate dataset whenever selected department changes
  const fullDataset = useMemo(() => generate30DaySeries(selectedDept), [selectedDept]);

  // Window slicing
  const displayedPoints = useMemo(() => {
    if (viewWindow === '7day') return fullDataset.slice(-7);
    if (viewWindow === '14day') return fullDataset.slice(-14);
    return fullDataset;
  }, [fullDataset, viewWindow]);

  const activePoint =
    hoveredIndex !== null && displayedPoints[hoveredIndex]
      ? displayedPoints[hoveredIndex]
      : displayedPoints[displayedPoints.length - 1];

  // Aggregate Metrics
  const totalSurplus = displayedPoints.reduce((sum, p) => sum + p.surplusWasteLbs, 0);
  const avgBaseline = Math.round(
    displayedPoints.reduce((sum, p) => sum + p.baselineLbs, 0) / displayedPoints.length
  );
  const avgSurplus = Math.round(totalSurplus / displayedPoints.length);
  const avgDeviation = (
    displayedPoints.reduce((sum, p) => sum + p.deviationPercent, 0) / displayedPoints.length
  ).toFixed(1);

  // SVG Dimension & Layout coordinates
  const svgWidth = 860;
  const svgHeight = 220;
  const padLeft = 68;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

  const chartInnerWidth = svgWidth - padLeft - padRight;
  const chartInnerHeight = svgHeight - padTop - padBottom;

  const minVal = Math.min(
    ...displayedPoints.map((p) => Math.min(p.baselineLbs, p.actualSalesLbs, p.confidenceLowerLbs))
  ) * 0.90;
  const maxVal = Math.max(
    ...displayedPoints.map((p) => Math.max(p.baselineLbs, p.actualSalesLbs, p.confidenceUpperLbs))
  ) * 1.08;

  const getX = (index: number) => {
    if (displayedPoints.length <= 1) return padLeft;
    return padLeft + (index / (displayedPoints.length - 1)) * chartInnerWidth;
  };

  const getY = (val: number) => {
    return padTop + chartInnerHeight - ((val - minVal) / (maxVal - minVal)) * chartInnerHeight;
  };

  // Coordinates arrays for paths
  const actualCoords = displayedPoints.map((p, i) => ({ x: getX(i), y: getY(p.actualSalesLbs) }));
  const baselineCoords = displayedPoints.map((p, i) => ({ x: getX(i), y: getY(p.baselineLbs) }));
  const emaCoords = displayedPoints.map((p, i) => ({ x: getX(i), y: getY(p.ema7Lbs) }));

  // Smooth spline paths
  const actualPath = buildSmoothPath(actualCoords);
  const baselinePath = buildSmoothPath(baselineCoords);
  const emaPath = buildSmoothPath(emaCoords);

  // Area under curve
  const areaPath = `${actualPath} L ${getX(displayedPoints.length - 1).toFixed(1)} ${(
    padTop + chartInnerHeight
  ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + chartInnerHeight).toFixed(1)} Z`;

  // Render weather icon
  const renderWeatherIcon = (weather: DayDataPoint['weather']) => {
    switch (weather) {
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'hot':
        return <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'sun':
        return <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default:
        return <CloudSun className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
    }
  };

  const handleDeptChange = (dept: DepartmentType) => {
    setSelectedDept(dept);
    if (onSelectDepartment) onSelectDepartment(dept);
  };

  const horizonOptions = [
    { value: '30day' as const, label: '30 Days' },
    { value: '14day' as const, label: '14 Days' },
    { value: '7day' as const, label: '7 Days' },
  ];

  const modeOptions = [
    { value: 'spline' as const, label: 'Spline Curve' },
    { value: 'bars' as const, label: 'Surplus Bars' },
    { value: 'variance' as const, label: 'Variance %' },
  ];

  const deptOptions = [
    { value: 'All' as const, label: 'All' },
    { value: 'Produce' as const, label: 'Produce' },
    { value: 'Dairy' as const, label: 'Dairy' },
    { value: 'Bakery' as const, label: 'Bakery' },
    { value: 'Prepared Deli' as const, label: 'Deli' },
    { value: 'Meat & Seafood' as const, label: 'Meat & Seafood' },
  ];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-[26px] p-6 sm:p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
      {/* Top Header: Title, Horizon Toggle & View Mode */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-[#6E6E73] dark:text-[#86868B] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1F7A4D] dark:bg-[#34C77B]" aria-hidden="true" />
            <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">POS Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Continuous 30-Day Baseline</span>
            <span aria-hidden="true">·</span>
            <span>Confidence: 94.6%</span>
          </div>

          <h3 className="text-[22px] sm:text-[26px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Sales Velocity &amp; Spoilage Volatility
            {storeTitle && (
              <span className="text-[15px] font-normal text-[#6E6E73] dark:text-[#86868B] ml-2">({storeTitle})</span>
            )}
          </h3>

          <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mt-1 max-w-2xl leading-relaxed">
            Time-series analysis tracking register velocity, rolling averages, weather footfall anomalies, and surplus forecasting.
          </p>
        </div>

        {/* View Horizon and Visual Mode Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
          <SegmentedControl
            options={horizonOptions}
            value={viewWindow}
            onChange={(val) => setViewWindow(val)}
            size="sm"
          />

          <SegmentedControl
            options={modeOptions}
            value={chartMode}
            onChange={(val) => setChartMode(val)}
            size="sm"
          />
        </div>
      </div>

      {/* Department Selector Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B] shrink-0 font-medium">Department:</span>
        <SegmentedControl
          options={deptOptions}
          value={selectedDept}
          onChange={(dept) => handleDeptChange(dept)}
          size="sm"
        />
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
          <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-medium">
            30-Day Rolling Mean
          </div>
          <div className="text-[24px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            {formatWeightUnit(avgBaseline)}
            <span className="text-[11px] text-[#86868B] font-normal ml-1">/ day</span>
          </div>
          <div className="text-[11px] text-[#86868B]">Baseline POS expectation</div>
        </div>

        <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
          <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-medium">
            POS Volatility Variance
          </div>
          <div className="text-[24px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight flex items-center gap-1.5">
            {Number(avgDeviation) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#1F7A4D] dark:text-[#34C77B] shrink-0" strokeWidth={1.5} />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={1.5} />
            )}
            <span className={Number(avgDeviation) >= 0 ? 'text-[#1F7A4D] dark:text-[#34C77B]' : 'text-amber-500'}>
              {Number(avgDeviation) >= 0 ? `+${avgDeviation}%` : `${avgDeviation}%`}
            </span>
          </div>
          <div className="text-[11px] text-[#86868B]">Deviation from standard</div>
        </div>

        <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
          <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-medium">
            Tomorrow Predicted Lot
          </div>
          <div className="text-[24px] font-semibold text-amber-600 dark:text-amber-400 tracking-tight">
            {formatWeightUnit(fullDataset[fullDataset.length - 1].surplusWasteLbs)}
          </div>
          <div className="text-[11px] text-[#86868B] flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" strokeWidth={1.5} />
            <span>&lt;{DEPARTMENT_PROFILES[selectedDept].spoilageHours}h dispatch window</span>
          </div>
        </div>

        <div className="p-4 rounded-[20px] bg-[#F5F5F7] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
          <div className="text-[11px] text-[#6E6E73] dark:text-[#86868B] font-medium">
            Period Total Rescued
          </div>
          <div className="text-[24px] font-semibold text-[#1F7A4D] dark:text-[#34C77B] tracking-tight">
            {formatWeightUnit(totalSurplus)}
          </div>
          <div className="text-[11px] text-[#86868B]">
            {displayedPoints.length}-day cumulative diverted
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="relative rounded-[22px] bg-[#FBFBFD] dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] p-5 overflow-hidden">
        {/* Canvas Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[12px] text-[#6E6E73] dark:text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-[#1F7A4D] dark:bg-[#34C77B] rounded-full" />
              <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">Actual POS Volume</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t border-dashed border-[#86868B]" />
              <span>30-Day Moving Baseline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t border-dotted border-[#1F7A4D] dark:border-[#34C77B]" />
              <span>7-Day Smoothed EMA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#1F7A4D]/50 dark:bg-[#34C77B]/50" />
              <span>Surplus Rescued</span>
            </div>
          </div>

          <div className="text-[11px] text-[#86868B] flex items-center gap-1">
            <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Hover or drag to inspect day</span>
          </div>
        </div>

        {/* View Mode: Spline Curve */}
        {chartMode === 'spline' && (
          <div className="relative h-56 w-full select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const ratio = mouseX / rect.width;
                const calculatedIndex = Math.round(ratio * (displayedPoints.length - 1));
                const clamped = Math.max(0, Math.min(displayedPoints.length - 1, calculatedIndex));
                setHoveredIndex(clamped);
              }}
            >
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F7A4D" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#1F7A4D" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#86868B" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#86868B" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid */}
              <line x1={padLeft} y1={padTop} x2={svgWidth - padRight} y2={padTop} stroke="currentColor" opacity="0.06" strokeDasharray="4 4" />
              <line x1={padLeft} y1={padTop + chartInnerHeight / 2} x2={svgWidth - padRight} y2={padTop + chartInnerHeight / 2} stroke="currentColor" opacity="0.06" strokeDasharray="4 4" />
              <line x1={padLeft} y1={padTop + chartInnerHeight} x2={svgWidth - padRight} y2={padTop + chartInnerHeight} stroke="currentColor" opacity="0.1" />

              {/* Y-Axis Numerical Reference Values */}
              <text x={padLeft - 8} y={padTop + 4} textAnchor="end" fill="#86868B" fontSize="9" fontFamily="sans-serif">
                {formatWeightUnit(Math.round(maxVal))}
              </text>
              <text x={padLeft - 8} y={padTop + chartInnerHeight / 2 + 3} textAnchor="end" fill="#86868B" fontSize="9" fontFamily="sans-serif">
                {formatWeightUnit(Math.round((maxVal + minVal) / 2))}
              </text>
              <text x={padLeft - 8} y={padTop + chartInnerHeight + 3} textAnchor="end" fill="#86868B" fontSize="9" fontFamily="sans-serif">
                {formatWeightUnit(Math.round(minVal))}
              </text>

              {/* Shaded Area Under Curve */}
              <path d={areaPath} fill="url(#curveGradient)" />

              {/* 30-Day Moving Baseline (Dashed) */}
              <path
                d={baselinePath}
                fill="none"
                stroke="#86868B"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* 7-Day Smoothed EMA Trendline (Dotted Green) */}
              <path
                d={emaPath}
                fill="none"
                stroke="#34C77B"
                strokeWidth="1.5"
                strokeDasharray="2 3"
                opacity="0.8"
              />

              {/* Actual Daily POS Volume (Solid Curved Spline) */}
              <path
                d={actualPath}
                fill="none"
                stroke="#1F7A4D"
                className="dark:stroke-[#34C77B]"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Vertical Guide Line on Hover */}
              {activePoint && (
                <line
                  x1={getX(displayedPoints.findIndex((p) => p.dayIndex === activePoint.dayIndex))}
                  y1={padTop}
                  x2={getX(displayedPoints.findIndex((p) => p.dayIndex === activePoint.dayIndex))}
                  y2={padTop + chartInnerHeight}
                  stroke="#86868B"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
              )}

              {/* Data points */}
              {displayedPoints.map((pt, idx) => {
                const cx = getX(idx);
                const cy = getY(pt.actualSalesLbs);
                const isHovered = activePoint.dayIndex === pt.dayIndex;
                const isToday = idx === displayedPoints.length - 1;

                return (
                  <g key={pt.dayIndex} className="cursor-pointer">
                    {isToday && (
                      <circle cx={cx} cy={cy} r="8" fill="#1F7A4D" opacity="0.25" className="animate-ping" />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5.5 : isToday ? 4.5 : 3}
                      fill={isToday ? '#1F7A4D' : isHovered ? '#1D1D1F' : '#1F7A4D'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="transition-all"
                    />
                  </g>
                );
              })}

              {/* Interactive Floating HUD Tooltip on Hover */}
              {hoveredIndex !== null && activePoint && (
                <g
                  transform={`translate(${Math.min(
                    svgWidth - padRight - 180,
                    Math.max(padLeft, getX(hoveredIndex) - 90)
                  )}, ${Math.max(padTop - 5, Math.min(chartInnerHeight - 40, getY(activePoint.actualSalesLbs) - 78))})`}
                  className="pointer-events-none transition-all duration-75"
                >
                  <rect
                    width="175"
                    height="68"
                    rx="14"
                    fill="#1C1C1E"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                    filter="drop-shadow(0 8px 16px rgba(0,0,0,0.18))"
                    opacity="0.96"
                  />
                  <text x="12" y="16" fill="#86868B" fontSize="9.5" fontWeight="500">
                    {activePoint.dateStr} · {activePoint.dayOfWeek}
                  </text>
                  <text x="12" y="32" fill="#F5F5F7" fontSize="12" fontWeight="600">
                    POS: {formatWeightUnit(activePoint.actualSalesLbs)}
                  </text>
                  <text x="12" y="46" fill="#86868B" fontSize="9.5">
                    Baseline: {formatWeightUnit(activePoint.baselineLbs)} ({activePoint.deviationPercent >= 0 ? '+' : ''}{activePoint.deviationPercent}%)
                  </text>
                  <text x="12" y="60" fill="#34C77B" fontSize="9.5" fontWeight="600">
                    Surplus: {formatWeightUnit(activePoint.surplusWasteLbs)}
                  </text>
                </g>
              )}
            </svg>

            {/* X-Axis Dynamic Labels */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1.5 px-3">
              <span>{displayedPoints[0].dateStr}</span>
              <span>{displayedPoints[Math.floor(displayedPoints.length / 2)].dateStr}</span>
              <span className="text-amber-300 font-bold">
                {displayedPoints[displayedPoints.length - 1].dateStr}
              </span>
            </div>
          </div>
        )}

        {/* View Mode: Daily Surplus Volume Bars */}
        {chartMode === 'bars' && (
          <div className="space-y-2 select-none">
            <div
              className="grid gap-1.5 items-end h-52 pt-4 px-2"
              style={{ gridTemplateColumns: `repeat(${displayedPoints.length}, minmax(0, 1fr))` }}
            >
              {displayedPoints.map((pt, idx) => {
                const maxSurplusLbs = Math.max(...displayedPoints.map((p) => p.surplusWasteLbs)) * 1.15;
                const barHeight = Math.min(100, Math.max(12, Math.round((pt.surplusWasteLbs / maxSurplusLbs) * 100)));
                const isHovered = activePoint.dayIndex === pt.dayIndex;
                const isToday = idx === displayedPoints.length - 1;

                return (
                  <div
                    key={pt.dayIndex}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className="flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    <div
                      style={{ height: `${barHeight}%` }}
                      className={`w-full max-w-[18px] rounded-t-md transition-all ${
                        isToday
                          ? 'bg-amber-400 shadow-lg shadow-amber-400/40 animate-pulse'
                          : isHovered
                          ? 'bg-white'
                          : pt.deviationPercent < -8
                          ? 'bg-emerald-400'
                          : 'bg-emerald-600/80 hover:bg-emerald-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-3 pt-1 border-t border-white/5">
              <span>{displayedPoints[0].dateStr}</span>
              <span className="text-slate-500">Mid-Period Handoff</span>
              <span className="text-amber-300 font-bold">
                {displayedPoints[displayedPoints.length - 1].dateStr}
              </span>
            </div>
          </div>
        )}

        {/* View Mode: Deviation Variance % */}
        {chartMode === 'variance' && (
          <div className="space-y-2 select-none">
            <div
              className="grid gap-1.5 items-center h-52 pt-4 px-2"
              style={{ gridTemplateColumns: `repeat(${displayedPoints.length}, minmax(0, 1fr))` }}
            >
              {displayedPoints.map((pt, idx) => {
                const isPositive = pt.deviationPercent >= 0;
                const magnitude = Math.min(100, Math.max(15, Math.abs(pt.deviationPercent) * 4));
                const isHovered = activePoint.dayIndex === pt.dayIndex;
                const isToday = idx === displayedPoints.length - 1;

                return (
                  <div
                    key={pt.dayIndex}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className="flex flex-col items-center h-full justify-center cursor-pointer relative"
                  >
                    <div className="w-full h-full flex flex-col justify-center items-center">
                      <div
                        style={{ height: `${magnitude / 2}%` }}
                        className={`w-full max-w-[14px] rounded-sm transition-all ${
                          isPositive
                            ? 'bg-emerald-500/80 mb-auto'
                            : 'bg-amber-500/80 mt-auto'
                        } ${isHovered ? 'ring-2 ring-white' : ''} ${isToday ? 'animate-pulse' : ''}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-3 pt-1 border-t border-white/5">
              <span>{displayedPoints[0].dateStr}</span>
              <span className="text-slate-400 text-[10px]">Zero Baseline (Model Expected)</span>
              <span className="text-amber-300 font-bold">
                {displayedPoints[displayedPoints.length - 1].dateStr}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Scrubbed Inspector Card */}
        {activePoint && (
          <div className="mt-4 p-4 sm:p-5 rounded-[20px] bg-white dark:bg-[#1C1C1E] border border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] shadow-sm">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1F7A4D]/10 text-[#1F7A4D] dark:text-[#34C77B] flex items-center justify-center font-medium shrink-0">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                  <span className="text-[15px]">{activePoint.dateStr}</span>
                  <span className="text-[12px] text-[#86868B] font-normal">
                    {activePoint.dayOfWeek} · Day #{activePoint.dayIndex}
                  </span>
                  <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">
                    · {selectedDept}
                  </span>
                </div>
                <div className="text-[12px] text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1.5 mt-0.5">
                  {renderWeatherIcon(activePoint.weather)}
                  <span>{activePoint.weatherFactorText}</span>
                </div>
              </div>
            </div>

            {/* Data readouts */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 sm:text-right border-t sm:border-t-0 border-black/[0.04] dark:border-white/[0.06] pt-2 sm:pt-0">
              <div>
                <span className="text-[11px] text-[#86868B] font-medium block">
                  Expected Baseline
                </span>
                <span className="text-[#6E6E73] dark:text-[#86868B] font-medium">
                  {formatWeightUnit(activePoint.baselineLbs)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#86868B] font-medium block">
                  POS Volume
                </span>
                <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">
                  {formatWeightUnit(activePoint.actualSalesLbs)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#86868B] font-medium block">
                  Variance
                </span>
                <span
                  className={`font-semibold ${
                    activePoint.deviationPercent >= 0 ? 'text-[#1F7A4D] dark:text-[#34C77B]' : 'text-amber-500'
                  }`}
                >
                  {activePoint.deviationPercent >= 0
                    ? `+${activePoint.deviationPercent}%`
                    : `${activePoint.deviationPercent}%`}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#86868B] font-medium block">
                  Surplus Rescued
                </span>
                <span className="font-semibold text-[#1F7A4D] dark:text-[#34C77B]">
                  {formatWeightUnit(activePoint.surplusWasteLbs)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#86868B] font-medium block">
                  Confidence
                </span>
                <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {activePoint.confidence}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
