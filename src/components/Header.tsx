import React from 'react';
import {
  RefreshCw,
  Clapperboard,
  Wifi,
  WifiOff,
  Share2,
  FileSpreadsheet,
  Bell,
  Layers,
  ChevronDown,
} from 'lucide-react';
import type { CallSheetData } from '../types/callsheet';

interface HeaderProps {
  callSheet: CallSheetData;
  activeJobCode?: string;
  allJobsCount?: number;
  onOpenJobSwitcher: () => void;
  onOpenSyncModal: () => void;
  onOpenShareModal: () => void;
  onOpenNotificationCenter: () => void;
  unreadNotificationCount: number;
  onManualRefresh: () => void;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncedText: string;
}

export const Header: React.FC<HeaderProps> = ({
  callSheet,
  activeJobCode,
  allJobsCount = 1,
  onOpenJobSwitcher,
  onOpenSyncModal,
  onOpenShareModal,
  onOpenNotificationCenter,
  unreadNotificationCount,
  onManualRefresh,
  isSyncing,
  isOnline,
  lastSyncedText,
}) => {
  const { production } = callSheet;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100 shadow-xl">
      {/* Film Slate Top Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-black text-xs tracking-wider px-3 py-1 flex items-center justify-between shadow-inner">
        <button
          onClick={onOpenJobSwitcher}
          className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity text-left"
          title="Switch Active Job / Production Slate"
        >
          <Clapperboard className="w-3.5 h-3.5" />
          <span className="font-black tracking-widest text-[11px] uppercase">
            HUNT + CAPTURE
          </span>
          <span className="opacity-40">•</span>
          <span className="uppercase font-mono">
            DAY {production.shootDay} OF {production.totalDays}
          </span>
          {activeJobCode && (
            <>
              <span className="opacity-40">•</span>
              <span className="px-1 py-0.2 rounded bg-zinc-950/20 text-zinc-950 font-mono font-bold text-[10px]">
                {activeJobCode} ▾
              </span>
            </>
          )}
        </button>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span>{production.date}</span>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="px-3 py-2.5 max-w-4xl mx-auto flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate text-white">
              {production.jobTitle}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 truncate">
            {production.client} • {production.agency}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          {/* Multi-Job Slate Switcher Button */}
          <button
            onClick={onOpenJobSwitcher}
            title="Production Slate & Crew Links"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white transition-all border border-zinc-800 text-xs font-semibold"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Jobs ({allJobsCount})</span>
            <span className="sm:hidden">{activeJobCode || 'Jobs'}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>
          {/* Notification Center Button */}
          <button
            onClick={onOpenNotificationCenter}
            title="Push Notifications & Alert Log"
            className="relative p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white transition-all border border-zinc-800"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm ring-1 ring-zinc-950 animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Quick Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isSyncing}
            title="Refresh from Google Sheet"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white transition-all border border-zinc-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShareModal}
            title="Share Call Sheet"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white transition-all border border-zinc-800"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Google Sheet Sync Modal Trigger */}
          <button
            onClick={onOpenSyncModal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 active:scale-95 text-emerald-300 border border-emerald-700/50 text-xs font-semibold transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Google Sheet</span>
            <span className="sm:hidden">Sheet</span>
          </button>
        </div>
      </div>

      {/* Sync Status Micro-Bar */}
      <div className="px-3 py-1 bg-zinc-900/90 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="truncate font-mono">
            Sheet: {callSheet.sourceSheetName || 'Connected'} ({lastSyncedText})
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0 font-mono text-[10px]">
          {isOnline ? (
            <span className="flex items-center text-emerald-400">
              <Wifi className="w-3 h-3 mr-1" /> Online
            </span>
          ) : (
            <span className="flex items-center text-amber-400">
              <WifiOff className="w-3 h-3 mr-1" /> Offline Cache
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
