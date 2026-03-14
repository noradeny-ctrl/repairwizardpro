
export enum RegionMode {
  WESTERN = 'English',
  SORANI = 'Soranî',
  BADINAN = 'Badînî',
  ARABIC = 'العربية'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Partner {
  id: string;
  business_name: string;
  is_verified: boolean;
  specialties: string[];
  services_offered: string[];
  phone?: string;
  contact: {
    whatsapp_link: string;
  };
  images: {
    profile: string;
  };
  location: {
    city: string;
    coordinates: Coordinates;
  };
  policy?: {
    fair_price_guarantee: boolean;
    description: string;
  };
  distance?: number;
}

export interface AnalysisResult {
  diagnosis: string;
  resultType: 'FIX' | 'TEST' | 'LEARN' | 'VIN_SCAN';
  partName: string;
  toolsNeeded: string[];
  instructions: string[];
  safetyWarning?: string;
  tip: string;
  isKurdish: boolean;
  markdownOutput: string; // The full dashboard output
  vinScanData?: {
    vin: string;
    make: string;
    model: string;
    year: string;
    engine?: string;
    trim?: string;
  };
  repairCost?: number;
  marketValue?: number;
}

export interface AppState {
  userInput: string;
  mode: RegionMode;
  isAnalyzing: boolean;
  isStarted: boolean;
  image?: string;
  result?: AnalysisResult;
  error?: string;
}
