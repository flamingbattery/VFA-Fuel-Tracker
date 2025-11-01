export interface FuelHistoryEntry {
  fuelGallons: number;
  timestamp: string;
}

export interface Aircraft {
  tailNumber: string;
  fuelGallons: number;
  lastUpdated: string;
  history: FuelHistoryEntry[];
}