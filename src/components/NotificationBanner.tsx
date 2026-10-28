import React, { useEffect } from 'react';
import { AlertTriangle, Clock, Volume2, X, ChevronRight } from 'lucide-react';
import type { CallSheetNotification } from '../types/notification';

interface NotificationBannerProps {
  notification: CallSheetNotification | null;
  onDismiss: () => void;
  onOpenCenter: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  onOpenCenter,
}) => {
  useEffect(() => {
    if (!notification) return;
    // Auto-dismiss after 9 seconds if user doesn't touch it
    const timer = setTimeout(() => {
      onDismiss();
    }, 9000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isCallTime = notification.type === 'call_time';
  const isBulletin = notification.type === 'bulletin';

  return (
    <aside
      aria-label="Production Alert Notification"
      className="fixed top-2 left-2 right-2 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div
        className={`rounded-2xl border-2 p-3.5 shadow-2xl backdrop-blur-md flex items-start space-x-3 transition-all ${
          isCallTime
            ? 'bg-amber-950/95 border-amber-400 text-white shadow-amber-500/20'
            : isBulletin
            ? 'bg-rose-950/95 border-rose-500 text-white shadow-rose-500/20'
            : 'bg-zinc-900/95 border-zinc-700 text-white shadow-zinc-950/40'
        }`}
      >
        {/* Pulsing Icon */}
        <div
          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
            isCallTime
              ? 'bg-amber-400 text-zinc-950 animate-pulse'
              : isBulletin
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-zinc-800 text-amber-400'
          }`}
        >
          {isCallTime ? <Clock className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onOpenCenter}>
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isCallTime
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {isCallTime ? 'Call Time Alert' : 'Production Bulletin'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">{notification.timestamp}</span>
          </div>

          <h4 className="text-xs font-black tracking-tight text-white leading-snug">
            {notification.title}
          </h4>
          <p className="text-[11px] text-zinc-200 mt-1 leading-relaxed line-clamp-2">
            {notification.body}
          </p>

          <div className="mt-2 flex items-center space-x-2 text-[10px] text-amber-300 font-bold cursor-pointer">
            <Volume2 className="w-3 h-3" />
            <span>Alert Sound Played</span>
            <span>•</span>
            <span className="underline flex items-center">
              View All Alerts <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
