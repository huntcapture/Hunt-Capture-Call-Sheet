export type NotificationType = 'call_time' | 'bulletin' | 'schedule' | 'general';

export interface CallSheetNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  isUrgent?: boolean;
  personName?: string;
  previousValue?: string;
  newValue?: string;
}

export interface NotificationSettings {
  browserNotificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  notifyPersonalCallTime: boolean;
  notifyBulletins: boolean;
  notifyScheduleChanges: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  browserNotificationsEnabled: true,
  soundEnabled: true,
  vibrateEnabled: true,
  notifyPersonalCallTime: true,
  notifyBulletins: true,
  notifyScheduleChanges: true,
};
