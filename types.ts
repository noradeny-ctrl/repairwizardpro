
export enum RegionMode {
  WESTERN = 'WESTERN',
  BADINAN = 'BADINAN',
  SORANI = 'SORANI',
  ARABIC = 'ARABIC'
}

export type ResultType = 'FIX' | 'TEST' | 'LEARN';

export interface AnalysisResult {
  diagnosis: string;
  partName: string;
  toolsNeeded: string[];
  instructions: string[];
  safetyWarning?: string;
  tip: string;
  isKurdish: boolean;
  resultType: ResultType;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PartnerPolicy {
  fair_price_guarantee: boolean;
  description: string;
}

export interface Partner {
  id: string;
  business_name: string;
  business_name_ar?: string;
  is_verified: boolean;
  rating: number;
  location: {
    city: string;
    address: string;
    coordinates: Coordinates;
  };
  contact: {
    phone_display: string;
    whatsapp_link: string;
    email: string | null;
  };
  images: {
    profile: string;
    verified_badge: string;
  };
  specialties: string[];
  services_offered: string[];
  policy?: PartnerPolicy;
  distance?: number;
}

export interface AppState {
  userInput: string;
  image?: string;
  isAnalyzing: boolean;
  result?: AnalysisResult;
  error?: string;
  mode: RegionMode;
  isStarted: boolean;
}
