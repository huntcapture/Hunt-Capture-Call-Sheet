export interface ProductionInfo {
  jobTitle: string;
  client: string;
  agency: string;
  productionCompany: string;
  shootDay: number;
  totalDays: number;
  date: string;
  weather: {
    condition: string;
    high: string;
    low: string;
    sunrise: string;
    sunset: string;
    summary: string;
  };
  generalCallTime: string;
  breakfastTime: string;
  safetyBriefingTime: string;
  shootingCallTime: string;
  estimatedLunchTime: string;
  estimatedWrapTime: string;
  bulletin: {
    urgent: boolean;
    headline: string;
    message: string;
    updatedAt: string;
    author: string;
  };
}

export interface ScheduleItem {
  id: string;
  sceneOrSetup: string;
  timeEstimate: string;
  intExt: 'INT' | 'EXT' | 'INT/EXT';
  dayNight: 'DAY' | 'NIGHT' | 'DUSK' | 'DAWN' | 'GOLDEN HOUR';
  setAndDescription: string;
  castIds: string[];
  pagesOrCount: string;
  specialNotes?: string;
  status: 'upcoming' | 'in-progress' | 'wrapped' | 'delayed';
  actualStartTime?: string;
}

export type PersonRoleCategory = 'crew' | 'cast' | 'agency' | 'client';

export interface PersonCall {
  id: string;
  name: string;
  department: string;
  role: string;
  callTime: string;
  callLocation?: string;
  category: PersonRoleCategory;
  phone?: string;
  email?: string;
  notes?: string;
  walkieChannel?: string;
  dietaryRestrictions?: string;
}

export interface ShootLocation {
  id: string;
  type: 'shoot' | 'basecamp' | 'crew_parking' | 'catering' | 'equipment_trucks';
  name: string;
  address: string;
  cityStateZip: string;
  parkingNotes: string;
  specialInstructions?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SafetyHospitalInfo {
  hospitalName: string;
  address: string;
  cityStateZip: string;
  emergencyPhone: string;
  generalPhone: string;
  distanceMiles: string;
  driveTimeMinutes: string;
  medicName: string;
  medicPhone: string;
  safetyOfficerName?: string;
  safetyOfficerPhone?: string;
  emergencyChannel: string;
  etiquetteRules: string[];
  hazardWarnings: string[];
}

export interface WalkieChannel {
  channel: number;
  department: string;
  notes: string;
}

export interface CallSheetData {
  production: ProductionInfo;
  schedule: ScheduleItem[];
  personnel: PersonCall[];
  locations: ShootLocation[];
  safety: SafetyHospitalInfo;
  walkieChannels: WalkieChannel[];
  lastSyncedAt: string;
  sourceSheetId?: string;
  sourceSheetName?: string;
}
