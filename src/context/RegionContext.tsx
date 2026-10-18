import React, { createContext, useContext, useState, useEffect } from 'react';
import { RegionCode, RegionConfig } from '../types/region';
import {
  REGIONS_DATA,
  REGIONAL_FOOD_BANKS,
  REGIONAL_STORE_NAMES,
  REGIONAL_DONOR_STORES,
  DonorStoreInfo,
  REGIONAL_RADAR_MAP,
  getRegionalSurplusLots,
  getRegionalClaimRequests,
  formatCurrency,
  formatWeight,
  formatDistance,
} from '../data/regionsData';
import { FoodBank, SurplusLot, SurplusClaimRequest } from '../types';

interface RegionContextType {
  region: RegionCode;
  setRegion: (region: RegionCode) => void;
  config: RegionConfig;
  allRegions: RegionConfig[];
  formatPrice: (amountInUSD: number) => string;
  formatWeightUnit: (pounds: number) => string;
  formatDistanceUnit: (miles: number) => string;
  foodBanks: FoodBank[];
  donorStores: DonorStoreInfo[];
  storeName: string;
  radarCoordinates: Record<string, { x: number; y: number; distance: number; driveMins: number; neighborhood: string }>;
  getSurplusLots: () => SurplusLot[];
  getClaimRequests: () => SurplusClaimRequest[];
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<RegionCode>(() => {
    const saved = localStorage.getItem('nourishloop_region') as RegionCode;
    if (saved && REGIONS_DATA[saved]) {
      return saved;
    }
    return 'US';
  });

  const setRegion = (newRegion: RegionCode) => {
    if (REGIONS_DATA[newRegion]) {
      setRegionState(newRegion);
      localStorage.setItem('nourishloop_region', newRegion);
    }
  };

  const config = REGIONS_DATA[region] || REGIONS_DATA.US;
  const allRegions = Object.values(REGIONS_DATA);
  const foodBanks = REGIONAL_FOOD_BANKS[region] || REGIONAL_FOOD_BANKS.US;
  const donorStores = REGIONAL_DONOR_STORES[region] || REGIONAL_DONOR_STORES.US;
  const storeName = REGIONAL_STORE_NAMES[region] || REGIONAL_STORE_NAMES.US;
  const radarCoordinates = REGIONAL_RADAR_MAP[region] || REGIONAL_RADAR_MAP.US;

  return (
    <RegionContext.Provider
      value={{
        region,
        setRegion,
        config,
        allRegions,
        formatPrice: (amt) => formatCurrency(amt, region),
        formatWeightUnit: (lbs) => formatWeight(lbs, region),
        formatDistanceUnit: (miles) => formatDistance(miles, region),
        foodBanks,
        donorStores,
        storeName,
        radarCoordinates,
        getSurplusLots: () => getRegionalSurplusLots(region),
        getClaimRequests: () => getRegionalClaimRequests(region),
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextType => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
