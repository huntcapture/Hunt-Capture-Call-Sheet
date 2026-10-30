import type { CallSheetData } from './callsheet';

export interface ProductionJob {
  id: string;
  jobCode: string; // e.g. "APEX26", "PORSCHE", "SEPHORA"
  jobTitle: string;
  client: string;
  agency: string;
  productionCompany: string;
  director: string;
  dp: string;
  shootDate: string;
  shootDay: number;
  totalDays: number;
  googleSheetId?: string;
  googleSheetName?: string;
  accessPin?: string; // Optional PIN for restricted crew access
  isArchived?: boolean;
  crewCount?: number;
  callSheetData: CallSheetData;
  createdAt: string;
  updatedAt: string;
}

export interface MultiJobState {
  jobs: ProductionJob[];
  activeJobId: string;
}
