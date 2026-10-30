import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from 'firebase/auth';
import type { CallSheetData, ScheduleItem } from './types/callsheet';
import { DEFAULT_CALL_SHEET } from './data/defaultCallSheet';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebaseAuth';
import {
  extractSpreadsheetId,
  fetchSpreadsheetMetadata,
  fetchBatchSheetValues,
  parseGoogleSheetData,
} from './services/googleSheets';
import { Header } from './components/Header';
import { PersonalCallCard } from './components/PersonalCallCard';
import { Navigation, type TabType } from './components/Navigation';
import { OverviewTab } from './components/OverviewTab';
import { ScheduleTab } from './components/ScheduleTab';
import { CrewTab } from './components/CrewTab';
import { LocationTab } from './components/LocationTab';
import { SafetyTab } from './components/SafetyTab';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { GoogleSheetBlueprintModal } from './components/GoogleSheetBlueprintModal';
import { ShareModal } from './components/ShareModal';
import { NotificationBanner } from './components/NotificationBanner';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { JobSwitcherModal } from './components/JobSwitcherModal';
import type { ProductionJob } from './types/job';
import {
  loadStoredJobs,
  saveStoredJobs,
  getInitialActiveJobId,
  STORAGE_KEY_ACTIVE_JOB_ID,
} from './services/jobManager';
import type { CallSheetNotification, NotificationSettings } from './types/notification';
import { DEFAULT_NOTIFICATION_SETTINGS } from './types/notification';
import {
  detectCallSheetChanges,
  dispatchNotificationAlerts,
} from './services/notificationService';

const STORAGE_KEY_CALLSHEET = 'hunt_capture_callsheet_cache_v1';
const STORAGE_KEY_PERSON_ID = 'hunt_capture_my_person_id';
const STORAGE_KEY_SHEET_ID = 'hunt_capture_sheet_id';
const STORAGE_KEY_AUTO_REFRESH = 'hunt_capture_auto_refresh_sec';
const STORAGE_KEY_NOTIFS = 'hunt_capture_notifications_v1';
const STORAGE_KEY_NOTIF_SETTINGS = 'hunt_capture_notif_settings_v1';

export default function App() {
  // Multi-job commercial production slate
  const [jobs, setJobs] = useState<ProductionJob[]>(() => loadStoredJobs());
  const [activeJobId, setActiveJobId] = useState<string>(() => getInitialActiveJobId(jobs));
  const [isJobSwitcherOpen, setIsJobSwitcherOpen] = useState(false);

  // Active Job & Active CallSheet
  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];
  const callSheet = activeJob.callSheetData;

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_PERSON_ID);
  });

  const [sheetIdInput, setSheetIdInput] = useState<string>(() => {
    return activeJob.googleSheetId || localStorage.getItem(STORAGE_KEY_SHEET_ID) || '';
  });

  // Sync sheetIdInput when activeJob changes
  useEffect(() => {
    if (activeJob.googleSheetId) {
      setSheetIdInput(activeJob.googleSheetId);
    }
  }, [activeJobId, activeJob.googleSheetId]);

  // Persist activeJobId and sync URL search param (?job=ID)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_JOB_ID, activeJobId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('job', activeJobId);
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeJobId]);

  // Persist full jobs array to localStorage
  useEffect(() => {
    saveStoredJobs(jobs);
  }, [jobs]);

  // Updater for active job's call sheet
  const setCallSheet = (
    updater: CallSheetData | ((prev: CallSheetData) => CallSheetData)
  ) => {
    setJobs((prevJobs) =>
      prevJobs.map((j) => {
        if (j.id === activeJobId) {
          const updatedData =
            typeof updater === 'function' ? updater(j.callSheetData) : updater;
          return {
            ...j,
            callSheetData: updatedData,
            crewCount: updatedData.personnel.length,
            updatedAt: new Date().toISOString(),
          };
        }
        return j;
      })
    );
  };

  const handleSelectJob = (jobId: string) => {
    setActiveJobId(jobId);
    setSelectedPersonId(null);
    localStorage.removeItem(STORAGE_KEY_PERSON_ID);
  };

  const handleCreateJob = (newJob: ProductionJob) => {
    setJobs((prev) => [newJob, ...prev]);
    setActiveJobId(newJob.id);
    setSelectedPersonId(null);
    localStorage.removeItem(STORAGE_KEY_PERSON_ID);
  };

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTO_REFRESH);
    return saved ? Number(saved) : 60; // 60s default
  });

  // Notification states
  const [notifications, setNotifications] = useState<CallSheetNotification[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return [];
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_NOTIF_SETTINGS);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  const [activeBannerNotification, setActiveBannerNotification] =
    useState<CallSheetNotification | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState('Just now');

  // Sync ref for interval
  const syncRef = useRef<() => void>(() => {});

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Persist callsheet changes to localStorage for offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CALLSHEET, JSON.stringify(callSheet));
    } catch {
      // ignore storage quota errors
    }
  }, [callSheet]);

  // Persist selected person ID
  const handleSelectPerson = (id: string | null) => {
    setSelectedPersonId(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY_PERSON_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_PERSON_ID);
    }
  };

  // Persist sheet input ID
  const handleSheetIdChange = (val: string) => {
    setSheetIdInput(val);
    localStorage.setItem(STORAGE_KEY_SHEET_ID, val);
  };

  // Persist auto-refresh interval
  const handleAutoRefreshChange = (sec: number) => {
    setAutoRefreshInterval(sec);
    localStorage.setItem(STORAGE_KEY_AUTO_REFRESH, String(sec));
  };

  // Format last synced text relative
  useEffect(() => {
    const updateRelativeTime = () => {
      if (!callSheet.lastSyncedAt) {
        setLastSyncedText('Ready');
        return;
      }
      const diffSec = Math.floor((Date.now() - new Date(callSheet.lastSyncedAt).getTime()) / 1000);
      if (diffSec < 10) setLastSyncedText('Just now');
      else if (diffSec < 60) setLastSyncedText(`${diffSec}s ago`);
      else if (diffSec < 3600) setLastSyncedText(`${Math.floor(diffSec / 60)}m ago`);
      else setLastSyncedText(`${Math.floor(diffSec / 3600)}h ago`);
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000);
    return () => clearInterval(interval);
  }, [callSheet.lastSyncedAt]);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setSyncError(null);
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        setSyncSuccessMessage('Signed in successfully! You can now sync your Google Sheets.');
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setSyncError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Google Sign-Out
  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setSyncSuccessMessage('Disconnected Google account.');
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Notification refs to ensure syncCallback has latest state
  const callSheetRef = useRef(callSheet);
  useEffect(() => {
    callSheetRef.current = callSheet;
  }, [callSheet]);

  const selectedPersonIdRef = useRef(selectedPersonId);
  useEffect(() => {
    selectedPersonIdRef.current = selectedPersonId;
  }, [selectedPersonId]);

  const notificationSettingsRef = useRef(notificationSettings);
  useEffect(() => {
    notificationSettingsRef.current = notificationSettings;
    try {
      localStorage.setItem(STORAGE_KEY_NOTIF_SETTINGS, JSON.stringify(notificationSettings));
    } catch {
      // ignore
    }
  }, [notificationSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Core Sync from Google Sheet Function
  const syncFromGoogleSheet = useCallback(async () => {
    const cleanId = extractSpreadsheetId(sheetIdInput);
    if (!cleanId) {
      setSyncError('Please provide a valid Google Sheet URL or Spreadsheet ID.');
      return;
    }

    let token = await getAccessToken();

    // If user is not signed in yet, prompt them to sign in
    if (!token) {
      try {
        setIsSigningIn(true);
        const signResult = await googleSignIn();
        token = signResult?.accessToken || null;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google sign-in cancelled or failed.';
        setSyncError(message);
        setIsSigningIn(false);
        setIsSyncModalOpen(true);
        return;
      } finally {
        setIsSigningIn(false);
      }
    }

    if (!token) {
      setSyncError('Google authorization required to read your spreadsheet.');
      setIsSyncModalOpen(true);
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      // 1. Fetch spreadsheet metadata & tabs
      const metadata = await fetchSpreadsheetMetadata(cleanId, token);

      // 2. Determine ranges to fetch from existing sheets
      const tabNames = metadata.sheets;
      const rangesToFetch = tabNames.map((name) => `'${name}'!A1:Z100`);

      // 3. Batch get all sheets
      const rawData = await fetchBatchSheetValues(cleanId, token, rangesToFetch);

      // 4. Parse sheet tabs into CallSheetData
      const parsedCallSheet = parseGoogleSheetData(rawData, metadata.title, cleanId);

      // 5. DETECT CALL SHEET CHANGES & TRIGGER PUSH NOTIFICATIONS
      const previousData = callSheetRef.current;
      const detectedNotifs = detectCallSheetChanges(
        previousData,
        parsedCallSheet,
        selectedPersonIdRef.current,
        notificationSettingsRef.current
      );

      if (detectedNotifs.length > 0) {
        dispatchNotificationAlerts(detectedNotifs, notificationSettingsRef.current);
        setNotifications((prev) => [...detectedNotifs, ...prev].slice(0, 50));
        setActiveBannerNotification(detectedNotifs[0]);
      }

      setCallSheet(parsedCallSheet);
      setSyncSuccessMessage(
        `Successfully synced "${metadata.title}"! Found ${tabNames.length} tabs (${tabNames.join(
          ', '
        )}), ${parsedCallSheet.personnel.length} cast & crew records.${
          detectedNotifs.length > 0 ? ` 🔔 ${detectedNotifs.length} alert(s) dispatched to crew.` : ''
        }`
      );
    } catch (err: unknown) {
      console.error('Error syncing sheet:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to fetch data from Google Sheet.';
      setSyncError(message);
      // Open sync modal so user can see what happened
      setIsSyncModalOpen(true);
    } finally {
      setIsSyncing(false);
    }
  }, [sheetIdInput]);

  syncRef.current = syncFromGoogleSheet;

  // Background Auto-Refresh Polling
  useEffect(() => {
    if (autoRefreshInterval <= 0 || !sheetIdInput.trim()) return;

    const timer = setInterval(() => {
      // Only poll if window is visible and online
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncRef.current();
      }
    }, autoRefreshInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, sheetIdInput]);

  // Update scene status on floor
  const handleUpdateSceneStatus = (sceneId: string, status: ScheduleItem['status']) => {
    setCallSheet((prev) => ({
      ...prev,
      schedule: prev.schedule.map((s) => (s.id === sceneId ? { ...s, status } : s)),
    }));
  };

  // Reset demo data
  const handleLoadDefaultDemo = () => {
    setCallSheet(DEFAULT_CALL_SHEET);
    setSheetIdInput('');
    localStorage.removeItem(STORAGE_KEY_SHEET_ID);
    setSyncSuccessMessage('Reset to sample commercial advertising production call sheet.');
    setSyncError(null);
  };

  // Simulate push notification alert for testing on set
  const handleSimulateTestAlert = (type: 'call_time' | 'bulletin') => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const selectedPerson =
      callSheet.personnel.find((p) => p.id === selectedPersonId) || callSheet.personnel[0];

    let testNotif: CallSheetNotification;
    if (type === 'call_time') {
      testNotif = {
        id: `test-call-${Date.now()}`,
        title: `🚨 YOUR CALL TIME UPDATED: 06:15 AM`,
        body: `${selectedPerson.name}, your call time was moved from ${selectedPerson.callTime} to 06:15 AM by the 1st AD due to early morning sun conditions on Stage 4.`,
        type: 'call_time',
        timestamp: now,
        read: false,
        isUrgent: true,
        personName: selectedPerson.name,
        previousValue: selectedPerson.callTime,
        newValue: '06:15 AM',
      };
    } else {
      testNotif = {
        id: `test-bulletin-${Date.now()}`,
        title: `📢 1st AD BULLETIN: STAGE 4 RAIN SYSTEM READY AT 13:45`,
        body: 'Wet deck safety protocols initiated 15 mins early. Grip & Electric must confirm waterproof cable ramps across pedestrian corridors.',
        type: 'bulletin',
        timestamp: now,
        read: false,
        isUrgent: true,
        previousValue: 'Previous Notice',
        newValue: 'STAGE 4 RAIN SYSTEM READY AT 13:45',
      };
    }

    dispatchNotificationAlerts([testNotif], notificationSettings);
    setNotifications((prev) => [testNotif, ...prev].slice(0, 50));
    setActiveBannerNotification(testNotif);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Floating Real-Time In-App Notification Alert Banner */}
      <NotificationBanner
        notification={activeBannerNotification}
        onDismiss={() => setActiveBannerNotification(null)}
        onOpenCenter={() => {
          setActiveBannerNotification(null);
          setIsNotificationCenterOpen(true);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
      />

      {/* Sticky Film Slate Header */}
      <Header
        callSheet={callSheet}
        activeJobCode={activeJob.jobCode}
        allJobsCount={jobs.length}
        onOpenJobSwitcher={() => setIsJobSwitcherOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenNotificationCenter={() => {
          setIsNotificationCenterOpen(true);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        unreadNotificationCount={unreadCount}
        onManualRefresh={() => {
          if (sheetIdInput.trim()) {
            syncFromGoogleSheet();
          } else {
            setIsSyncModalOpen(true);
          }
        }}
        isSyncing={isSyncing}
        isOnline={isOnline}
        lastSyncedText={lastSyncedText}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* Sticky Personalized Call Time Card */}
        <PersonalCallCard
          personnel={callSheet.personnel}
          selectedPersonId={selectedPersonId}
          onSelectPerson={handleSelectPerson}
        />

        {/* Tab Content Panels */}
        {currentTab === 'overview' && (
          <OverviewTab callSheet={callSheet} onNavigateToTab={(tab) => setCurrentTab(tab)} />
        )}

        {currentTab === 'schedule' && (
          <ScheduleTab
            schedule={callSheet.schedule}
            onUpdateSceneStatus={handleUpdateSceneStatus}
          />
        )}

        {currentTab === 'crew' && (
          <CrewTab
            personnel={callSheet.personnel}
            selectedPersonId={selectedPersonId}
            onSelectPerson={handleSelectPerson}
          />
        )}

        {currentTab === 'locations' && (
          <LocationTab
            locations={callSheet.locations}
            etiquetteRules={callSheet.safety.etiquetteRules}
          />
        )}

        {currentTab === 'safety' && (
          <SafetyTab safety={callSheet.safety} walkieChannels={callSheet.walkieChannels} />
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <Navigation
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        urgentAlert={callSheet.production.bulletin?.urgent || false}
      />

      {/* Google Sheet Sync Modal */}
      <GoogleSheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUser={currentUser}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        isSigningIn={isSigningIn}
        sheetIdInput={sheetIdInput}
        onSheetIdChange={handleSheetIdChange}
        onSync={syncFromGoogleSheet}
        isSyncing={isSyncing}
        syncError={syncError}
        syncSuccessMessage={syncSuccessMessage}
        autoRefreshInterval={autoRefreshInterval}
        onAutoRefreshChange={handleAutoRefreshChange}
        onLoadDefaultDemo={handleLoadDefaultDemo}
        onOpenBlueprint={() => {
          setIsSyncModalOpen(false);
          setIsBlueprintModalOpen(true);
        }}
      />

      {/* Google Sheet Blueprint & Admin Guide Modal */}
      <GoogleSheetBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        callSheet={callSheet}
      />

      {/* Share Call Sheet Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        callSheet={callSheet}
        jobId={activeJob.id}
        jobCode={activeJob.jobCode}
      />

      {/* Multi-Job Slate & Crew Access Hub Modal */}
      <JobSwitcherModal
        isOpen={isJobSwitcherOpen}
        onClose={() => setIsJobSwitcherOpen(false)}
        jobs={jobs}
        activeJobId={activeJobId}
        onSelectJob={handleSelectJob}
        onCreateJob={handleCreateJob}
      />

      {/* Notification Center & Settings Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
        settings={notificationSettings}
        onUpdateSettings={setNotificationSettings}
        onSimulateTestAlert={handleSimulateTestAlert}
      />
    </div>
  );
}
