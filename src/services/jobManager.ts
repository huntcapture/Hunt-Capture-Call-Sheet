import type { ProductionJob } from '../types/job';
import type { CallSheetData } from '../types/callsheet';
import { INITIAL_SAMPLE_JOBS } from '../data/sampleJobs';

export const STORAGE_KEY_MULTI_JOBS = 'hunt_capture_jobs_v1';
export const STORAGE_KEY_ACTIVE_JOB_ID = 'hunt_capture_active_job_id';

/**
 * Load all stored jobs from localStorage or fallback to default production slate
 */
export const loadStoredJobs = (): ProductionJob[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MULTI_JOBS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored jobs, using defaults:', err);
  }
  return INITIAL_SAMPLE_JOBS;
};

/**
 * Save full jobs array to localStorage
 */
export const saveStoredJobs = (jobs: ProductionJob[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_MULTI_JOBS, JSON.stringify(jobs));
  } catch (err) {
    console.warn('Failed to save jobs to localStorage:', err);
  }
};

/**
 * Inspect URL search parameters for ?job=ID or ?code=CODE
 * to lock a crew member directly into their specific assigned job!
 */
export const detectJobFromUrl = (jobs: ProductionJob[]): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const jobParam = params.get('job');
    const codeParam = params.get('code');

    if (jobParam) {
      const found = jobs.find((j) => j.id.toLowerCase() === jobParam.toLowerCase());
      if (found) return found.id;
    }

    if (codeParam) {
      const found = jobs.find((j) => j.jobCode.toLowerCase() === codeParam.toLowerCase());
      if (found) return found.id;
    }
  } catch (err) {
    console.warn('Error reading URL params:', err);
  }

  return null;
};

/**
 * Get active job ID from URL param, localStorage, or fallback
 */
export const getInitialActiveJobId = (jobs: ProductionJob[]): string => {
  // 1. URL deep-link takes priority (for Crew 1 vs Crew 2 links)
  const urlJobId = detectJobFromUrl(jobs);
  if (urlJobId) return urlJobId;

  // 2. Local storage
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_JOB_ID);
    if (saved && jobs.some((j) => j.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }

  // 3. Fallback to first job
  return jobs[0]?.id || 'job-apex-kinetic';
};

/**
 * Generates direct crew link for a specific commercial job
 */
export const generateCrewShareUrl = (job: ProductionJob): string => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('job', job.id);
  return url.toString();
};

/**
 * Generates an SMS / Slack invite message formatted for a specific crew
 */
export const generateCrewInviteText = (job: ProductionJob): string => {
  const shareUrl = generateCrewShareUrl(job);
  const data = job.callSheetData;
  const shootLoc = data.locations.find((l) => l.type === 'shoot') || data.locations[0];

  return `🎬 CALL SHEET INVITE: ${job.jobTitle}
Client: ${job.client} | Day ${job.shootDay} of ${job.totalDays} (${job.shootDate})
Director: ${job.director} | DP: ${job.dp}

⏰ General Crew Call: ${data.production.generalCallTime}
📍 Location: ${shootLoc ? `${shootLoc.name} (${shootLoc.address})` : 'See Call Sheet'}
🔑 Job Access Code: ${job.jobCode}

📱 Tap here to open your live mobile call sheet:
${shareUrl}`;
};
