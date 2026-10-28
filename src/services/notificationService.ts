import type { CallSheetData } from '../types/callsheet';
import type { CallSheetNotification, NotificationSettings } from '../types/notification';
import { playCallTimeAlert, playBulletinAlert } from './soundEffects';

/**
 * Request permission for browser system push notifications
 */
export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return false;
  }
};

/**
 * Check current notification permission
 */
export const getBrowserNotificationPermission = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Send native browser system notification
 */
export const sendBrowserNotification = (title: string, body: string, tag?: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: tag || 'hunt-capture-alert',
      });
    } catch (err) {
      console.warn('Native notification failed:', err);
    }
  }
};

/**
 * Trigger device vibration if supported
 */
export const triggerHapticFeedback = (pattern: number[] = [200, 100, 200]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
};

/**
 * Compares old CallSheetData with new CallSheetData from Google Sheet sync
 * and extracts all meaningful updates for the user.
 */
export const detectCallSheetChanges = (
  prevData: CallSheetData,
  nextData: CallSheetData,
  selectedPersonId: string | null,
  settings: NotificationSettings
): CallSheetNotification[] => {
  const notifications: CallSheetNotification[] = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. SPECIFIC PERSONAL CALL TIME CHANGE (Highest Priority)
  if (settings.notifyPersonalCallTime) {
    if (selectedPersonId) {
      const prevPerson = prevData.personnel.find((p) => p.id === selectedPersonId);
      const nextPerson = nextData.personnel.find(
        (p) => p.id === selectedPersonId || (prevPerson && p.name.toLowerCase() === prevPerson.name.toLowerCase())
      );

      if (prevPerson && nextPerson) {
        // Did call time change?
        if (prevPerson.callTime.trim() !== nextPerson.callTime.trim()) {
          notifications.push({
            id: `notif-call-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: `🚨 YOUR CALL TIME UPDATED: ${nextPerson.callTime}`,
            body: `${nextPerson.name}, your call time was moved from ${prevPerson.callTime} to ${nextPerson.callTime} by the production office.`,
            type: 'call_time',
            timestamp: now,
            read: false,
            isUrgent: true,
            personName: nextPerson.name,
            previousValue: prevPerson.callTime,
            newValue: nextPerson.callTime,
          });
        }
        // Did report location change?
        else if (
          prevPerson.callLocation &&
          nextPerson.callLocation &&
          prevPerson.callLocation.trim() !== nextPerson.callLocation.trim()
        ) {
          notifications.push({
            id: `notif-loc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: `📍 YOUR REPORT LOCATION CHANGED`,
            body: `${nextPerson.name}, report location updated to "${nextPerson.callLocation}".`,
            type: 'call_time',
            timestamp: now,
            read: false,
            isUrgent: false,
            personName: nextPerson.name,
            previousValue: prevPerson.callLocation,
            newValue: nextPerson.callLocation,
          });
        }
      }
    } else {
      // General crew call time change if no individual selected
      if (
        prevData.production.generalCallTime.trim() !== nextData.production.generalCallTime.trim()
      ) {
        notifications.push({
          id: `notif-gencall-${Date.now()}`,
          title: `⏰ GENERAL CREW CALL CHANGED: ${nextData.production.generalCallTime}`,
          body: `General crew call time shifted from ${prevData.production.generalCallTime} to ${nextData.production.generalCallTime}.`,
          type: 'call_time',
          timestamp: now,
          read: false,
          isUrgent: true,
          previousValue: prevData.production.generalCallTime,
          newValue: nextData.production.generalCallTime,
        });
      }
    }
  }

  // 2. 1st AD / PRODUCTION BULLETIN NOTICE (High Priority)
  if (settings.notifyBulletins) {
    const prevB = prevData.production.bulletin;
    const nextB = nextData.production.bulletin;

    if (nextB) {
      const isNewHeadline = prevB?.headline.trim() !== nextB.headline.trim();
      const isNewMessage = prevB?.message.trim() !== nextB.message.trim();

      if (isNewHeadline || isNewMessage) {
        notifications.push({
          id: `notif-bulletin-${Date.now()}`,
          title: `📢 1st AD BULLETIN: ${nextB.headline}`,
          body: nextB.message,
          type: 'bulletin',
          timestamp: now,
          read: false,
          isUrgent: nextB.urgent ?? true,
          previousValue: prevB?.headline,
          newValue: nextB.headline,
        });
      }
    }
  }

  // 3. SCHEDULE UPDATES (e.g. Scene started shooting)
  if (settings.notifyScheduleChanges) {
    // Check if any scene just went to in-progress
    nextData.schedule.forEach((nextScene) => {
      const prevScene = prevData.schedule.find((s) => s.id === nextScene.id);
      if (prevScene && prevScene.status !== 'in-progress' && nextScene.status === 'in-progress') {
        notifications.push({
          id: `notif-sched-${nextScene.id}-${Date.now()}`,
          title: `🎬 SHOOTING NOW: ${nextScene.sceneOrSetup}`,
          body: `Floor call: ${nextScene.setAndDescription}`,
          type: 'schedule',
          timestamp: now,
          read: false,
          isUrgent: false,
        });
      }
    });
  }

  return notifications;
};

/**
 * Dispatch notifications via native browser, audio, and haptic feedback
 */
export const dispatchNotificationAlerts = (
  notifications: CallSheetNotification[],
  settings: NotificationSettings
) => {
  if (notifications.length === 0) return;

  const hasUrgent = notifications.some((n) => n.isUrgent);
  const hasCallTimeChange = notifications.some((n) => n.type === 'call_time');

  // Audio Chime
  if (settings.soundEnabled) {
    if (hasCallTimeChange) {
      playCallTimeAlert();
    } else if (hasUrgent) {
      playBulletinAlert();
    }
  }

  // Haptic Feedback
  if (settings.vibrateEnabled) {
    if (hasUrgent || hasCallTimeChange) {
      triggerHapticFeedback([250, 100, 250, 100, 350]);
    } else {
      triggerHapticFeedback([150, 80, 150]);
    }
  }

  // Browser System Push Notification
  if (settings.browserNotificationsEnabled) {
    notifications.forEach((n) => {
      sendBrowserNotification(n.title, n.body, n.id);
    });
  }
};
