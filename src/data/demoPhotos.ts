export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  type: 'fridge' | 'receipt' | 'crisper';
  imageUrl: string;
  mockItems: Array<{
    name: string;
    category: 'Produce' | 'Dairy' | 'Meat' | 'Bakery' | 'Pantry' | 'Frozen' | 'Prepared' | 'Beverage';
    quantity: string;
    storage: 'fridge' | 'freezer' | 'pantry';
    packageState: 'opened' | 'sealed';
    confidence: number;
    daysRemaining: number;
    isEstimated: boolean;
    isHomemadeOrLeftover?: boolean;
    isDamaged?: boolean;
  }>;
}

// Crisp inline SVGs so demo never depends on external network image fetches
const FRIDGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" rx="16" fill="%230F172A"/>
  <rect x="20" y="20" width="560" height="360" rx="12" fill="%231E293B" stroke="%23334155" stroke-width="2"/>
  <line x1="20" y1="140" x2="580" y2="140" stroke="%23475569" stroke-width="3" stroke-dasharray="6 6"/>
  <line x1="20" y1="260" x2="580" y2="260" stroke="%23475569" stroke-width="3" stroke-dasharray="6 6"/>
  <!-- Top Shelf Items -->
  <rect x="50" y="50" width="80" height="75" rx="6" fill="%23059669" fill-opacity="0.8"/>
  <text x="90" y="92" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Spinach</text>
  <text x="90" y="108" fill="%23A7F3D0" font-family="sans-serif" font-size="10" text-anchor="middle">(Opened)</text>

  <rect x="160" y="45" width="70" height="85" rx="6" fill="%23DC2626" fill-opacity="0.8"/>
  <text x="195" y="90" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Chicken</text>
  <text x="195" y="106" fill="%23FECACA" font-family="sans-serif" font-size="10" text-anchor="middle">2 cutlets</text>

  <rect x="260" y="40" width="65" height="90" rx="6" fill="%233B82F6" fill-opacity="0.8"/>
  <text x="292" y="85" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Milk</text>
  <text x="292" y="101" fill="%23BFDBFE" font-family="sans-serif" font-size="10" text-anchor="middle">Opened</text>

  <rect x="360" y="55" width="70" height="70" rx="6" fill="%238B5CF6" fill-opacity="0.8"/>
  <text x="395" y="95" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Yogurt</text>

  <!-- Middle Shelf -->
  <rect x="60" y="170" width="65" height="70" rx="6" fill="%23D97706" fill-opacity="0.8"/>
  <text x="92" y="210" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Peppers</text>

  <rect x="160" y="165" width="80" height="75" rx="6" fill="%230D9488" fill-opacity="0.8"/>
  <text x="200" y="205" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Beans</text>
  <text x="200" y="221" fill="%23CCFBF1" font-family="sans-serif" font-size="10" text-anchor="middle">3 Cans</text>

  <rect x="270" y="160" width="90" height="80" rx="6" fill="%23E11D48" fill-opacity="0.8"/>
  <text x="315" y="205" fill="%23FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Berries</text>

  <!-- Bottom Drawer -->
  <rect x="50" y="280" width="230" height="80" rx="8" fill="%23334155" stroke="%2364748B" stroke-width="2"/>
  <text x="165" y="325" fill="%2394A3B8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Crisper: Apples & Carrots</text>
  <rect x="310" y="280" width="230" height="80" rx="8" fill="%23334155" stroke="%2364748B" stroke-width="2"/>
  <text x="425" y="325" fill="%2394A3B8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Crisper: Greens & Herbs</text>
  <!-- HUD overlay banner -->
  <rect x="420" y="35" width="145" height="26" rx="13" fill="%2310B981" fill-opacity="0.2" stroke="%2310B981" stroke-width="1"/>
  <text x="492" y="52" fill="%2334D399" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PRESET 1: REFRIGERATOR</text>
</svg>`;

const CRISPER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" rx="16" fill="%23064E3B"/>
  <rect x="20" y="20" width="560" height="360" rx="12" fill="%23065F46" stroke="%23047857" stroke-width="2"/>
  <circle cx="150" cy="180" r="70" fill="%23059669" fill-opacity="0.9"/>
  <text x="150" y="185" fill="%23FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Spinach Bag</text>
  <text x="150" y="205" fill="%23A7F3D0" font-family="sans-serif" font-size="11" text-anchor="middle">1 Day Left (Wilting)</text>
  <circle cx="310" cy="160" r="55" fill="%23EA580C" fill-opacity="0.9"/>
  <text x="310" y="165" fill="%23FFFFFF" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Bell Peppers</text>
  <circle cx="450" cy="210" r="60" fill="%23E11D48" fill-opacity="0.9"/>
  <text x="450" y="215" fill="%23FFFFFF" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Strawberries</text>
  <rect x="380" y="35" width="180" height="26" rx="13" fill="%23F59E0B" fill-opacity="0.2" stroke="%23F59E0B" stroke-width="1"/>
  <text x="470" y="52" fill="%23FBBF24" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PRESET 2: CRISPER DRAWER</text>
</svg>`;

const RECEIPT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" rx="16" fill="%231E293B"/>
  <rect x="150" y="20" width="300" height="360" rx="8" fill="%23F8FAFC" stroke="%23CBD5E1" stroke-width="2"/>
  <text x="300" y="60" fill="%230F172A" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle">FRESH GROCERY MART</text>
  <text x="300" y="80" fill="%2364748B" font-family="monospace" font-size="10" text-anchor="middle">STORE #104 - 10/14/2026</text>
  <line x1="170" y1="95" x2="430" y2="95" stroke="%2394A3B8" stroke-dasharray="4 4"/>
  <text x="180" y="125" fill="%231E293B" font-family="monospace" font-size="12">1. ORGANIC SPINACH</text>
  <text x="410" y="125" fill="%231E293B" font-family="monospace" font-size="12" text-anchor="end">$3.49</text>
  <text x="180" y="155" fill="%231E293B" font-family="monospace" font-size="12">2. CHICKEN BREAST 1.4LB</text>
  <text x="410" y="155" fill="%231E293B" font-family="monospace" font-size="12" text-anchor="end">$7.99</text>
  <text x="180" y="185" fill="%231E293B" font-family="monospace" font-size="12">3. WHOLE MILK 1GAL</text>
  <text x="410" y="185" fill="%231E293B" font-family="monospace" font-size="12" text-anchor="end">$4.29</text>
  <text x="180" y="215" fill="%231E293B" font-family="monospace" font-size="12">4. BLACK BEANS (3X)</text>
  <text x="410" y="215" fill="%231E293B" font-family="monospace" font-size="12" text-anchor="end">$3.75</text>
  <text x="180" y="245" fill="%231E293B" font-family="monospace" font-size="12">5. SOURDOUGH LOAF</text>
  <text x="410" y="245" fill="%231E293B" font-family="monospace" font-size="12" text-anchor="end">$4.50</text>
  <line x1="170" y1="270" x2="430" y2="270" stroke="%2394A3B8" stroke-dasharray="4 4"/>
  <text x="180" y="300" fill="%230F172A" font-family="monospace" font-size="13" font-weight="bold">TOTAL</text>
  <text x="410" y="300" fill="%230F172A" font-family="monospace" font-size="13" font-weight="bold" text-anchor="end">$24.02</text>
  <!-- Verified Badge -->
  <rect x="235" y="325" width="130" height="24" rx="12" fill="%2310B981" fill-opacity="0.15" stroke="%2310B981" stroke-width="1"/>
  <text x="300" y="341" fill="%23059669" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">AI PARSED RECEIPT</text>
</svg>`;

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'preset-fridge',
    title: 'Family Refrigerator (Typical Household)',
    subtitle: 'Contains opened spinach (1 day), raw chicken, opened milk, and sealed canned beans',
    badge: 'Standard Demo [NEW 1, 2, 3]',
    type: 'fridge',
    imageUrl: FRIDGE_SVG,
    mockItems: [
      {
        name: 'Spinach (opened bag)',
        category: 'Produce',
        quantity: '1 opened bag (4 oz)',
        storage: 'fridge',
        packageState: 'opened',
        confidence: 0.97,
        daysRemaining: 1, // <= 1 day triggers 'use-today' [NEW 1]
        isEstimated: true,
      },
      {
        name: 'Raw Chicken Breast',
        category: 'Meat',
        quantity: '2 cutlets (1 lb)',
        storage: 'fridge',
        packageState: 'sealed',
        confidence: 0.95,
        daysRemaining: 2, // 2 days left triggers 'use-today' or freeze [NEW 1]
        isEstimated: true,
      },
      {
        name: 'Whole Milk (opened)',
        category: 'Dairy',
        quantity: '1/3 gallon',
        storage: 'fridge',
        packageState: 'opened',
        confidence: 0.94,
        daysRemaining: 3, // triggers 'use-soon' [NEW 1]
        isEstimated: true,
      },
      {
        name: 'Canned Black Beans (3 sealed)',
        category: 'Pantry',
        quantity: '3 cans (15 oz each)',
        storage: 'pantry',
        packageState: 'sealed',
        confidence: 0.99,
        daysRemaining: 540,
        isEstimated: true,
      },
      {
        name: 'Greek Yogurt (Plain)',
        category: 'Dairy',
        quantity: '1 tub (32 oz)',
        storage: 'fridge',
        packageState: 'opened',
        confidence: 0.91,
        daysRemaining: 4,
        isEstimated: true,
      },
      {
        name: 'Red Bell Pepper',
        category: 'Produce',
        quantity: '2 whole',
        storage: 'fridge',
        packageState: 'sealed',
        confidence: 0.96,
        daysRemaining: 6,
        isEstimated: true,
      },
    ],
  },
  {
    id: 'preset-crisper',
    title: 'Veggie Crisper Spoilage Emergency',
    subtitle: 'Demonstrates acute wilting rescue and freezing tips before waste occurs',
    badge: 'High Urgency',
    type: 'crisper',
    imageUrl: CRISPER_SVG,
    mockItems: [
      {
        name: 'Organic Baby Spinach',
        category: 'Produce',
        quantity: '1 bag (wilting)',
        storage: 'fridge',
        packageState: 'opened',
        confidence: 0.98,
        daysRemaining: 1,
        isEstimated: true,
      },
      {
        name: 'Strawberries (Ripe)',
        category: 'Produce',
        quantity: '1 pint carton',
        storage: 'fridge',
        packageState: 'opened',
        confidence: 0.93,
        daysRemaining: 2,
        isEstimated: true,
      },
      {
        name: 'Bell Peppers',
        category: 'Produce',
        quantity: '2 sweet peppers',
        storage: 'fridge',
        packageState: 'sealed',
        confidence: 0.95,
        daysRemaining: 3,
        isEstimated: true,
      },
    ],
  },
  {
    id: 'preset-receipt',
    title: 'Supermarket Grocery Receipt Upload',
    subtitle: '[NEW 5] Fail-safe alternate: reads printed receipt when camera or photo is unavailable',
    badge: 'Stage Backup [NEW 5]',
    type: 'receipt',
    imageUrl: RECEIPT_SVG,
    mockItems: [
      {
        name: 'Organic Baby Spinach',
        category: 'Produce',
        quantity: '1 bag',
        storage: 'fridge',
        packageState: 'sealed',
        confidence: 0.99,
        daysRemaining: 6,
        isEstimated: true,
      },
      {
        name: 'Chicken Thighs',
        category: 'Meat',
        quantity: '1.4 lbs',
        storage: 'fridge',
        packageState: 'sealed',
        confidence: 0.98,
        daysRemaining: 2,
        isEstimated: true,
      },
      {
        name: 'Whole Milk',
        category: 'Dairy',
        quantity: '1 gallon',
        storage: 'fridge',
        packageState: 'sealed',
        confidence: 0.99,
        daysRemaining: 7,
        isEstimated: true,
      },
      {
        name: 'Canned Black Beans',
        category: 'Pantry',
        quantity: '3 cans',
        storage: 'pantry',
        packageState: 'sealed',
        confidence: 0.99,
        daysRemaining: 720,
        isEstimated: true,
      },
      {
        name: 'Artisan Sourdough Loaf',
        category: 'Bakery',
        quantity: '1 loaf',
        storage: 'pantry',
        packageState: 'sealed',
        confidence: 0.97,
        daysRemaining: 5,
        isEstimated: true,
      },
    ],
  },
];
