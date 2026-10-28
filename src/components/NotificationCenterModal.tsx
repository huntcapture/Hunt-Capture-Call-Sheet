import React, { useState } from 'react';
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  Vibrate,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Send,
  Smartphone,
  Shield,
  Sparkles,
} from 'lucide-react';
import type { CallSheetNotification, NotificationSettings } from '../types/notification';
import {
  requestBrowserNotificationPermission,
  getBrowserNotificationPermission,
} from '../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CallSheetNotification[];
  onClearNotifications: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  onSimulateTestAlert: (type: 'call_time' | 'bulletin') => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  settings,
  onUpdateSettings,
  onSimulateTestAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() =>
    getBrowserNotificationPermission()
  );

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserPermission(getBrowserNotificationPermission());
    if (granted) {
      onUpdateSettings({ ...settings, browserNotificationsEnabled: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Live Push Notifications</h3>
              <p className="text-[11px] text-zinc-400">
                Instant alerts for call time changes & 1st AD bulletins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-3 flex space-x-2 border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Alert Log</span>
            {notifications.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-zinc-950 font-black">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Alert Preferences & Test</span>
          </button>
        </div>

        {/* Tab 1: Alert History */}
        {activeTab === 'history' && (
          <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1 text-xs">
            {notifications.length > 0 && (
              <div className="flex items-center justify-between text-zinc-400 text-[11px] pb-1">
                <span>Recent changes from background sync</span>
                <button
                  onClick={onClearNotifications}
                  className="text-rose-400 hover:text-rose-300 flex items-center space-x-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>
            )}

            {notifications.map((notif) => {
              const isCall = notif.type === 'call_time';
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border space-y-1 ${
                    isCall
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : notif.type === 'bulletin'
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center space-x-1.5">
                      {isCall ? (
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span className="font-bold text-white text-[11px]">{notif.title}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{notif.timestamp}</span>
                  </div>

                  <p className="text-zinc-300 text-[11px] leading-relaxed pl-5">{notif.body}</p>

                  {notif.previousValue && notif.newValue && (
                    <div className="pl-5 pt-1 flex items-center space-x-2 text-[10px] font-mono">
                      <span className="text-zinc-500 line-through">{notif.previousValue}</span>
                      <span className="text-zinc-400">→</span>
                      <span className="text-amber-400 font-bold">{notif.newValue}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {notifications.length === 0 && (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-zinc-600 stroke-[1.5]" />
                <p className="text-xs">No alerts received yet today.</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  When a call time is shifted or a new 1st AD notice is posted in your Google Sheet, it will trigger an immediate push notification here.
                </p>
                <button
                  onClick={() => onSimulateTestAlert('call_time')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs inline-flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Test Alert</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Settings & Simulation */}
        {activeTab === 'settings' && (
          <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs text-zinc-300">
            {/* System Push Permission */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">Browser Push Notifications</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    browserPermission === 'granted'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {browserPermission}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Receive banners on your lock screen even when you are reviewing camera monitor or away from the browser tab.
              </p>
              {browserPermission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors"
                >
                  Request System Notification Permission
                </button>
              )}
            </div>

            {/* Sound & Haptics Toggles */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <span className="font-bold text-white text-xs block">Audio & Vibration</span>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                  )}
                  <div>
                    <span className="font-semibold block text-white text-xs">Audio Chime on Set</span>
                    <span className="text-[10px] text-zinc-400">Plays distinct attention tone on call updates</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Vibrate className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-semibold block text-white text-xs">Haptic Vibration</span>
                    <span className="text-[10px] text-zinc-400">Vibrates phone when call changes</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.vibrateEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, vibrateEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>
            </div>

            {/* Notification triggers */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <span className="font-bold text-white text-xs block">Alert Triggers</span>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold block text-white text-xs">My Personal Call Time</span>
                  <span className="text-[10px] text-zinc-400">Alerts when my individual call time changes</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyPersonalCallTime}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, notifyPersonalCallTime: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-zinc-800">
                <div>
                  <span className="font-semibold block text-white text-xs">1st AD / Safety Bulletins</span>
                  <span className="text-[10px] text-zinc-400">Alerts when urgent set notices are published</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyBulletins}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, notifyBulletins: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-zinc-800">
                <div>
                  <span className="font-semibold block text-white text-xs">Scene Shooting Now</span>
                  <span className="text-[10px] text-zinc-400">Alerts when a setup moves to "Shooting Now"</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyScheduleChanges}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, notifyScheduleChanges: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>
            </div>

            {/* Simulation & Test Buttons */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Real-Time Google Sheet Updates</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Test how on-set crew members will receive notifications with sound, vibration, and banners:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onSimulateTestAlert('call_time')}
                  className="py-2 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1 border border-zinc-700 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Call Change</span>
                </button>
                <button
                  onClick={() => onSimulateTestAlert('bulletin')}
                  className="py-2 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold text-xs flex items-center justify-center space-x-1 border border-zinc-700 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Test 1st AD Bulletin</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
