import type {
  CallSheetData,
  ProductionInfo,
  ScheduleItem,
  PersonCall,
  ShootLocation,
  SafetyHospitalInfo,
  WalkieChannel,
  PersonRoleCategory,
} from '../types/callsheet';
import { DEFAULT_CALL_SHEET } from '../data/defaultCallSheet';

export interface SheetFetchResult {
  data: CallSheetData;
  sourceTitle: string;
  tabsFound: string[];
}

/**
 * Extracts a Google Spreadsheet ID from a URL or raw ID string.
 */
export const extractSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  // Standard Google Docs spreadsheet URL pattern
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  // If it's already a clean ID
  if (/^[a-zA-Z0-9-_]{20,80}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
};

/**
 * Fetch spreadsheet metadata to get tab names and sheet title.
 */
export const fetchSpreadsheetMetadata = async (
  spreadsheetId: string,
  accessToken: string
): Promise<{ title: string; sheets: string[] }> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}?includeGridData=false`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Google authorization token has expired or is invalid. Please sign in again.');
    }
    if (response.status === 403) {
      throw new Error(
        'Access denied: You do not have permission to view this Google Sheet. Ensure your Google account has at least "Viewer" access.'
      );
    }
    if (response.status === 404) {
      throw new Error('Spreadsheet not found. Please verify the Google Sheet URL or ID.');
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `Failed to fetch sheet (HTTP ${response.status})`);
  }

  const data = await response.json();
  const sheets = (data.sheets || []).map((s: { properties?: { title?: string } }) => s.properties?.title || '');
  return {
    title: data.properties?.title || 'Untitled Production Call Sheet',
    sheets: sheets.filter(Boolean),
  };
};

/**
 * Fetches range values for specific sheet tabs.
 */
export const fetchBatchSheetValues = async (
  spreadsheetId: string,
  accessToken: string,
  ranges: string[]
): Promise<Record<string, string[][]>> => {
  const queryParams = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values:batchGet?${queryParams}&valueRenderOption=FORMATTED_VALUE`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet ranges: HTTP ${response.status}`);
  }

  const result = await response.json();
  const valueRanges = result.valueRanges || [];
  const map: Record<string, string[][]> = {};

  valueRanges.forEach((vr: { range?: string; values?: string[][] }) => {
    const rawRange = vr.range || '';
    // Extract sheet name before "!"
    const sheetName = rawRange.split('!')[0].replace(/^'/, '').replace(/'$/, '');
    map[sheetName] = vr.values || [];
  });

  return map;
};

/**
 * Parse headers and rows into a list of key-value objects.
 */
const rowsToObjects = (rows: string[][]): Record<string, string>[] => {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map((h) => (h || '').trim().toLowerCase());
  const objects: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || row.every((c) => !c || c.trim() === '')) continue;
    const obj: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      obj[header] = (row[colIndex] || '').trim();
    });
    objects.push(obj);
  }
  return objects;
};

const getVal = (obj: Record<string, string>, possibleKeys: string[]): string => {
  for (const key of possibleKeys) {
    const lower = key.toLowerCase();
    if (obj[lower] !== undefined && obj[lower] !== '') {
      return obj[lower];
    }
    // Partial substring match
    const found = Object.keys(obj).find((k) => k.includes(lower));
    if (found && obj[found]) {
      return obj[found];
    }
  }
  return '';
};

/**
 * Parses multi-tab or single-tab Google Sheet data into the structured CallSheetData model.
 */
export const parseGoogleSheetData = (
  rawTabs: Record<string, string[][]>,
  sourceTitle: string,
  spreadsheetId: string
): CallSheetData => {
  const result: CallSheetData = JSON.parse(JSON.stringify(DEFAULT_CALL_SHEET));
  result.sourceSheetId = spreadsheetId;
  result.sourceSheetName = sourceTitle;
  result.lastSyncedAt = new Date().toISOString();

  // Find corresponding tab by loose matching
  const findTab = (candidates: string[]): string[][] | null => {
    for (const [name, rows] of Object.entries(rawTabs)) {
      const lower = name.toLowerCase();
      if (candidates.some((c) => lower.includes(c.toLowerCase()))) {
        return rows;
      }
    }
    return null;
  };

  // 1. PRODUCTION TAB
  const prodRows = findTab(['production', 'general', 'overview', 'info']);
  if (prodRows && prodRows.length > 1) {
    const prodObjs = rowsToObjects(prodRows);
    if (prodObjs.length > 0) {
      const p = prodObjs[0];
      result.production.jobTitle = getVal(p, ['job title', 'job', 'project', 'commercial', 'title']) || result.production.jobTitle;
      result.production.client = getVal(p, ['client', 'brand']) || result.production.client;
      result.production.agency = getVal(p, ['agency', 'ad agency']) || result.production.agency;
      result.production.productionCompany = getVal(p, ['production company', 'prod co', 'company']) || result.production.productionCompany;
      
      const dayVal = getVal(p, ['shoot day', 'day']);
      if (dayVal) result.production.shootDay = parseInt(dayVal, 10) || 1;
      const totalVal = getVal(p, ['total days', 'days']);
      if (totalVal) result.production.totalDays = parseInt(totalVal, 10) || 1;

      result.production.date = getVal(p, ['date', 'shoot date']) || result.production.date;
      result.production.generalCallTime = getVal(p, ['general call time', 'general call', 'crew call']) || result.production.generalCallTime;
      result.production.breakfastTime = getVal(p, ['breakfast time', 'breakfast']) || result.production.breakfastTime;
      result.production.safetyBriefingTime = getVal(p, ['safety briefing time', 'safety briefing', 'safety meeting']) || result.production.safetyBriefingTime;
      result.production.shootingCallTime = getVal(p, ['shooting call time', 'shooting call', 'camera call']) || result.production.shootingCallTime;
      result.production.estimatedLunchTime = getVal(p, ['est lunch time', 'lunch time', 'lunch']) || result.production.estimatedLunchTime;
      result.production.estimatedWrapTime = getVal(p, ['est wrap time', 'wrap time', 'wrap']) || result.production.estimatedWrapTime;

      const weatherCond = getVal(p, ['weather condition', 'weather', 'forecast']);
      if (weatherCond) result.production.weather.condition = weatherCond;
      const highLow = getVal(p, ['weather high/low', 'high/low', 'temp']);
      if (highLow) {
        const parts = highLow.split('/');
        result.production.weather.high = parts[0]?.trim() || result.production.weather.high;
        if (parts[1]) result.production.weather.low = parts[1]?.trim();
      }
      const sunriseSunset = getVal(p, ['sunrise/sunset', 'sun', 'sunrise']);
      if (sunriseSunset) {
        const sParts = sunriseSunset.split('/');
        result.production.weather.sunrise = sParts[0]?.trim() || result.production.weather.sunrise;
        if (sParts[1]) result.production.weather.sunset = sParts[1]?.trim();
      }

      const bulletinHead = getVal(p, ['urgent bulletin headline', 'bulletin headline', 'notice headline']);
      const bulletinMsg = getVal(p, ['urgent bulletin message', 'bulletin message', 'notice message', 'ad notice']);
      if (bulletinHead || bulletinMsg) {
        result.production.bulletin = {
          urgent: true,
          headline: bulletinHead || 'PRODUCTION NOTICE',
          message: bulletinMsg || '',
          updatedAt: 'Live from Google Sheet',
          author: 'Production Office / 1st AD',
        };
      }
    }
  }

  // 2. SCHEDULE TAB
  const schedRows = findTab(['schedule', 'scenes', 'shooting schedule', 'timeline']);
  if (schedRows && schedRows.length > 1) {
    const schedObjs = rowsToObjects(schedRows);
    if (schedObjs.length > 0) {
      result.schedule = schedObjs.map((s, idx) => {
        const rawStatus = (getVal(s, ['status', 'state']) || 'upcoming').toLowerCase();
        let status: 'upcoming' | 'in-progress' | 'wrapped' | 'delayed' = 'upcoming';
        if (rawStatus.includes('progress') || rawStatus.includes('current') || rawStatus.includes('shooting')) status = 'in-progress';
        else if (rawStatus.includes('wrap') || rawStatus.includes('done') || rawStatus.includes('completed')) status = 'wrapped';
        else if (rawStatus.includes('delay') || rawStatus.includes('hold')) status = 'delayed';

        const rawIntExt = (getVal(s, ['int / ext', 'int/ext', 'i/e']) || 'INT').toUpperCase();
        const intExt = rawIntExt.includes('EXT') && rawIntExt.includes('INT') ? 'INT/EXT' : rawIntExt.includes('EXT') ? 'EXT' : 'INT';

        const rawDayNight = (getVal(s, ['day / night', 'day/night', 'd/n']) || 'DAY').toUpperCase();
        let dayNight: 'DAY' | 'NIGHT' | 'DUSK' | 'DAWN' | 'GOLDEN HOUR' = 'DAY';
        if (rawDayNight.includes('GOLD')) dayNight = 'GOLDEN HOUR';
        else if (rawDayNight.includes('NIGHT')) dayNight = 'NIGHT';
        else if (rawDayNight.includes('DUSK')) dayNight = 'DUSK';
        else if (rawDayNight.includes('DAWN')) dayNight = 'DAWN';

        return {
          id: `sched-live-${idx + 1}`,
          sceneOrSetup: getVal(s, ['setup / scene', 'setup', 'scene', 'scene/setup']) || `Setup ${idx + 1}`,
          timeEstimate: getVal(s, ['time window', 'time estimate', 'time', 'est time']) || 'TBD',
          intExt,
          dayNight,
          setAndDescription: getVal(s, ['set & action description', 'description', 'action', 'set']) || 'Production Setup',
          castIds: (getVal(s, ['cast involved', 'cast', 'talent']) || '')
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
          pagesOrCount: getVal(s, ['page / setup count', 'pages', 'setups', 'count']) || '1 Setup',
          specialNotes: getVal(s, ['special notes', 'notes', 'remarks']) || undefined,
          status,
        };
      });
    }
  }

  // 3. PERSONNEL TAB (CRITICAL PRIVACY CHECK FOR AGENCY & CLIENT)
  const personRows = findTab(['personnel', 'crew', 'cast', 'roster', 'contacts']);
  if (personRows && personRows.length > 1) {
    const personObjs = rowsToObjects(personRows);
    if (personObjs.length > 0) {
      result.personnel = personObjs.map((p, idx) => {
        const name = getVal(p, ['name', 'crew member', 'person', 'cast / crew']) || `Crew Member ${idx + 1}`;
        const department = getVal(p, ['department', 'dept', 'division']) || 'Production';
        const role = getVal(p, ['role / position', 'role', 'position', 'title']) || 'Crew';
        const rawCategory = (getVal(p, ['category', 'type', 'group']) || '').toLowerCase();

        // Categorize accurately
        let category: PersonRoleCategory = 'crew';
        if (
          rawCategory.includes('client') ||
          department.toLowerCase().includes('client') ||
          department.toLowerCase().includes('brand') ||
          role.toLowerCase().includes('client')
        ) {
          category = 'client';
        } else if (
          rawCategory.includes('agency') ||
          department.toLowerCase().includes('agency') ||
          role.toLowerCase().includes('agency') ||
          role.toLowerCase().includes('creative director') ||
          role.toLowerCase().includes('art director') ||
          role.toLowerCase().includes('account')
        ) {
          category = 'agency';
        } else if (rawCategory.includes('cast') || department.toLowerCase().includes('cast') || role.toLowerCase().includes('actor') || role.toLowerCase().includes('talent')) {
          category = 'cast';
        }

        // PRIVACY ENFORCEMENT: Client and agency contact info MUST be hidden
        const rawPhone = getVal(p, ['phone (visible for crew, hidden for agency/client)', 'phone', 'mobile', 'cell']);
        const rawEmail = getVal(p, ['email (visible for crew, hidden for agency/client)', 'email']);

        const isShielded = category === 'agency' || category === 'client';
        const phone = isShielded ? 'CONFIDENTIAL' : rawPhone || undefined;
        const email = isShielded ? 'CONFIDENTIAL' : rawEmail || undefined;

        return {
          id: `person-live-${idx + 1}`,
          name,
          department,
          role,
          callTime: getVal(p, ['call time', 'call', 'individual call', 'time']) || result.production.generalCallTime,
          callLocation: getVal(p, ['call location', 'location', 'stage']) || undefined,
          category,
          phone,
          email,
          walkieChannel: isShielded ? undefined : getVal(p, ['walkie channel', 'walkie', 'radio']) || undefined,
          notes: getVal(p, ['notes & instructions', 'notes', 'instructions', 'special instructions']) || undefined,
        };
      });
    }
  }

  // 4. LOCATIONS TAB
  const locRows = findTab(['locations', 'location', 'venues', 'stages', 'parking']);
  if (locRows && locRows.length > 1) {
    const locObjs = rowsToObjects(locRows);
    if (locObjs.length > 0) {
      result.locations = locObjs.map((l, idx) => {
        const rawType = (getVal(l, ['type (shoot / basecamp / crew_parking / catering)', 'type', 'category']) || 'shoot').toLowerCase();
        let type: ShootLocation['type'] = 'shoot';
        if (rawType.includes('basecamp')) type = 'basecamp';
        else if (rawType.includes('parking')) type = 'crew_parking';
        else if (rawType.includes('cater') || rawType.includes('food')) type = 'catering';
        else if (rawType.includes('truck')) type = 'equipment_trucks';

        return {
          id: `loc-live-${idx + 1}`,
          type,
          name: getVal(l, ['location name', 'name', 'venue']) || `Location ${idx + 1}`,
          address: getVal(l, ['street address', 'address', 'street']) || 'Location Address',
          cityStateZip: getVal(l, ['city, state, zip', 'city state zip', 'city', 'state']) || '',
          parkingNotes: getVal(l, ['parking notes', 'parking', 'parking instructions']) || 'Check with Basecamp Parking PA upon arrival.',
          specialInstructions: getVal(l, ['special instructions', 'instructions', 'notes']) || undefined,
        };
      });
    }
  }

  // 5. SAFETY & HOSPITAL TAB
  const safetyRows = findTab(['safety', 'hospital', 'emergency', 'medical', 'etiquette']);
  if (safetyRows && safetyRows.length > 1) {
    const sObjs = rowsToObjects(safetyRows);
    if (sObjs.length > 0) {
      const s = sObjs[0];
      result.safety.hospitalName = getVal(s, ['hospital name', 'hospital', 'emergency room']) || result.safety.hospitalName;
      result.safety.address = getVal(s, ['hospital address', 'hospital street', 'address']) || result.safety.address;
      result.safety.cityStateZip = getVal(s, ['hospital city/state/zip', 'city state zip', 'city']) || result.safety.cityStateZip;
      result.safety.emergencyPhone = getVal(s, ['emergency dept phone', 'er phone', 'emergency phone']) || result.safety.emergencyPhone;
      
      const distTime = getVal(s, ['distance / drive time', 'distance', 'drive time']);
      if (distTime) {
        result.safety.distanceMiles = distTime;
      }

      result.safety.medicName = getVal(s, ['set medic name', 'medic name', 'medic']) || result.safety.medicName;
      result.safety.medicPhone = getVal(s, ['set medic phone', 'medic phone', 'medic cell']) || result.safety.medicPhone;
      result.safety.emergencyChannel = getVal(s, ['emergency radio channel', 'emergency channel', 'medic channel']) || result.safety.emergencyChannel;

      // Extract etiquette rules & hazard warnings if columns exist
      const etiquetteList: string[] = [];
      Object.keys(s).forEach((key) => {
        if (key.includes('etiquette') || key.includes('rule')) {
          if (s[key]) etiquetteList.push(s[key]);
        }
      });
      if (etiquetteList.length > 0) {
        result.safety.etiquetteRules = etiquetteList;
      }

      const hazardList: string[] = [];
      Object.keys(s).forEach((key) => {
        if (key.includes('hazard') || key.includes('warning') || key.includes('caution')) {
          if (s[key]) hazardList.push(s[key]);
        }
      });
      if (hazardList.length > 0) {
        result.safety.hazardWarnings = hazardList;
      }
    }
  }

  return result;
};
