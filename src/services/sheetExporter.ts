import * as XLSX from 'xlsx';
import type { CallSheetData } from '../types/callsheet';
import { DEFAULT_CALL_SHEET } from '../data/defaultCallSheet';

/**
 * Builds and downloads a production-grade multi-tab .xlsx workbook
 * ready to be dragged and dropped into Google Sheets.
 */
export const downloadGoogleSheetWorkbook = (data: CallSheetData = DEFAULT_CALL_SHEET) => {
  const wb = XLSX.utils.book_new();

  // 1. PRODUCTION TAB
  const prodData = [
    [
      'Job Title',
      'Client',
      'Agency',
      'Production Company',
      'Shoot Day',
      'Total Days',
      'Date',
      'General Call Time',
      'Breakfast Time',
      'Safety Briefing Time',
      'Shooting Call Time',
      'Est Lunch Time',
      'Est Wrap Time',
      'Weather Condition',
      'Weather High/Low',
      'Sunrise/Sunset',
      'Urgent Bulletin Headline',
      'Urgent Bulletin Message',
    ],
    [
      data.production.jobTitle,
      data.production.client,
      data.production.agency,
      data.production.productionCompany,
      data.production.shootDay,
      data.production.totalDays,
      data.production.date,
      data.production.generalCallTime,
      data.production.breakfastTime,
      data.production.safetyBriefingTime,
      data.production.shootingCallTime,
      data.production.estimatedLunchTime,
      data.production.estimatedWrapTime,
      data.production.weather.condition,
      `${data.production.weather.high} / ${data.production.weather.low}`,
      `${data.production.weather.sunrise} / ${data.production.weather.sunset}`,
      data.production.bulletin?.headline || 'SAFETY NOTICE',
      data.production.bulletin?.message || 'Standard set safety protocols active.',
    ],
  ];
  const wsProd = XLSX.utils.aoa_to_sheet(prodData);
  wsProd['!cols'] = [
    { wch: 32 },
    { wch: 22 },
    { wch: 24 },
    { wch: 22 },
    { wch: 10 },
    { wch: 10 },
    { wch: 26 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 30 },
    { wch: 16 },
    { wch: 18 },
    { wch: 35 },
    { wch: 60 },
  ];
  XLSX.utils.book_append_sheet(wb, wsProd, 'Production');

  // 2. SCHEDULE TAB
  const schedHeaders = [
    'Setup / Scene',
    'Time Window',
    'INT / EXT',
    'Day / Night',
    'Set & Action Description',
    'Cast Involved',
    'Page / Setup Count',
    'Special Notes',
    'Status (upcoming / in-progress / wrapped)',
  ];
  const schedRows = data.schedule.map((s) => [
    s.sceneOrSetup,
    s.timeEstimate,
    s.intExt,
    s.dayNight,
    s.setAndDescription,
    s.castIds.join(', '),
    s.pagesOrCount,
    s.specialNotes || '',
    s.status,
  ]);
  const wsSched = XLSX.utils.aoa_to_sheet([schedHeaders, ...schedRows]);
  wsSched['!cols'] = [
    { wch: 22 },
    { wch: 22 },
    { wch: 10 },
    { wch: 14 },
    { wch: 50 },
    { wch: 25 },
    { wch: 18 },
    { wch: 40 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSched, 'Schedule');

  // 3. PERSONNEL TAB
  const personHeaders = [
    'Name',
    'Department',
    'Role / Position',
    'Call Time',
    'Call Location',
    'Category (crew / cast / agency / client)',
    'Phone (Visible for Crew, Hidden for Agency/Client)',
    'Email (Visible for Crew, Hidden for Agency/Client)',
    'Walkie Channel',
    'Notes & Instructions',
  ];
  const personRows = data.personnel.map((p) => [
    p.name,
    p.department,
    p.role,
    p.callTime,
    p.callLocation || '',
    p.category,
    p.category === 'agency' || p.category === 'client' ? '(Protected)' : p.phone || '',
    p.category === 'agency' || p.category === 'client' ? '(Protected)' : p.email || '',
    p.walkieChannel || '',
    p.notes || '',
  ]);
  const wsPerson = XLSX.utils.aoa_to_sheet([personHeaders, ...personRows]);
  wsPerson['!cols'] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 30 },
    { wch: 12 },
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
    { wch: 30 },
    { wch: 15 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPerson, 'Personnel');

  // 4. LOCATIONS TAB
  const locHeaders = [
    'Type (shoot / basecamp / crew_parking / catering)',
    'Location Name',
    'Street Address',
    'City, State, Zip',
    'Parking Notes',
    'Special Instructions',
  ];
  const locRows = data.locations.map((l) => [
    l.type,
    l.name,
    l.address,
    l.cityStateZip,
    l.parkingNotes,
    l.specialInstructions || '',
  ]);
  const wsLoc = XLSX.utils.aoa_to_sheet([locHeaders, ...locRows]);
  wsLoc['!cols'] = [
    { wch: 20 },
    { wch: 35 },
    { wch: 30 },
    { wch: 25 },
    { wch: 50 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsLoc, 'Locations');

  // 5. SAFETY & HOSPITAL TAB
  const safetyHeaders = [
    'Hospital Name',
    'Hospital Address',
    'Hospital City/State/Zip',
    'Emergency Dept Phone',
    'Distance / Drive Time',
    'Set Medic Name',
    'Set Medic Phone',
    'Emergency Radio Channel',
    'Etiquette Rule 1',
    'Etiquette Rule 2',
    'Etiquette Rule 3',
    'Etiquette Rule 4',
    'Hazard Warning 1',
    'Hazard Warning 2',
  ];
  const safetyRow = [
    data.safety.hospitalName,
    data.safety.address,
    data.safety.cityStateZip,
    data.safety.emergencyPhone,
    `${data.safety.distanceMiles} / ${data.safety.driveTimeMinutes}`,
    data.safety.medicName,
    data.safety.medicPhone,
    data.safety.emergencyChannel,
    data.safety.etiquetteRules[0] || 'Closed set: Strict NDA in effect. No social media photos.',
    data.safety.etiquetteRules[1] || 'Shoe booties required on polished soundstage floor.',
    data.safety.etiquetteRules[2] || 'Sound curfew: Exterior generators off strictly at 20:00.',
    data.safety.etiquetteRules[3] || 'Beverages must be in sealed containers only around gear.',
    data.safety.hazardWarnings[0] || 'Water rain effect active on Stage 4.',
    data.safety.hazardWarnings[1] || 'High voltage feeder cabling in Lot A.',
  ];
  const wsSafety = XLSX.utils.aoa_to_sheet([safetyHeaders, safetyRow]);
  wsSafety['!cols'] = [
    { wch: 35 },
    { wch: 25 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 25 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
    { wch: 50 },
    { wch: 45 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSafety, 'Safety');

  // 6. WALKIE CHANNELS TAB
  const walkieHeaders = ['Channel', 'Department', 'Notes'];
  const walkieRows = data.walkieChannels.map((w) => [w.channel, w.department, w.notes]);
  const wsWalkie = XLSX.utils.aoa_to_sheet([walkieHeaders, ...walkieRows]);
  wsWalkie['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsWalkie, 'Walkie_Channels');

  // 7. ADMIN GUIDE TAB
  const guideHeaders = ['Section', 'Instruction for Producers & ADs'];
  const guideRows = [
    ['1. How to upload to Google Drive', 'Go to drive.google.com -> Click + New -> File Upload -> Select this .xlsx file -> Right click and choose "Open with Google Sheets".'],
    ['2. Sharing Permissions', 'Click the top right Share button in Google Sheets. Add production department heads (1st AD, UPM) as "Editor". Under General Access, select "Anyone with the link can View" so crew can read real-time data.'],
    ['3. Privacy Rule', 'Keep Agency & Client contact columns shielded. Hunt + Capture automatically hides phone numbers for members categorized as "agency" or "client" on crew mobile devices.'],
    ['4. Triggering Live Push Alerts', 'Whenever you update a crew member\'s "Call Time" in the Personnel tab or change the "Urgent Bulletin Headline", Hunt + Capture detects the change during background sync and fires push notifications & chime to cast and crew!'],
    ['5. Connecting to App', 'Copy the URL from your browser address bar (e.g. https://docs.google.com/spreadsheets/d/1BxiMVs.../edit) and paste it into the Google Sheet Sync modal in Hunt + Capture.'],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet([guideHeaders, ...guideRows]);
  wsGuide['!cols'] = [{ wch: 25 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Admin_Instructions');

  // Trigger browser file download
  const filename = `Hunt_Capture_Commercial_CallSheet_${data.production.jobTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.xlsx`;
  XLSX.writeFile(wb, filename);
};
