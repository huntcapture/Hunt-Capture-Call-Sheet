import React, { useState } from 'react';
import {
  FileSpreadsheet,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Lock,
  Download,
  Sparkles,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { CALL_SHEET_TEMPLATE_TABS, generateTemplateCsv } from '../data/googleSheetTemplate';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  isSigningIn: boolean;
  sheetIdInput: string;
  onSheetIdChange: (val: string) => void;
  onSync: () => Promise<void>;
  isSyncing: boolean;
  syncError: string | null;
  syncSuccessMessage: string | null;
  autoRefreshInterval: number;
  onAutoRefreshChange: (seconds: number) => void;
  onLoadDefaultDemo: () => void;
  onOpenBlueprint: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignIn,
  onSignOut,
  isSigningIn,
  sheetIdInput,
  onSheetIdChange,
  onSync,
  isSyncing,
  syncError,
  syncSuccessMessage,
  autoRefreshInterval,
  onAutoRefreshChange,
  onLoadDefaultDemo,
  onOpenBlueprint,
}) => {
  const [activeTemplateTab, setActiveTemplateTab] = useState(0);
  const [copiedCsv, setCopiedCsv] = useState(false);

  if (!isOpen) return null;

  const currentTabDef = CALL_SHEET_TEMPLATE_TABS[activeTemplateTab];

  const handleCopyCsv = () => {
    const csv = generateTemplateCsv(currentTabDef);
    navigator.clipboard.writeText(csv);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Google Sheet Sync Settings</h3>
              <p className="text-[11px] text-zinc-400">Live call sheet data feed from Google Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar text-xs text-zinc-300 flex-1">
          {/* Section 1: Google Account Connection */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                1. Google Account Authorization
              </span>
              {currentUser && (
                <span className="text-emerald-400 text-[10px] flex items-center font-bold">
                  <CheckCircle className="w-3 h-3 mr-1" /> Connected
                </span>
              )}
            </div>

            {currentUser ? (
              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                <div className="flex items-center space-x-2.5 min-w-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-7 h-7 rounded-full border border-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 font-bold text-white flex items-center justify-center shrink-0">
                      {currentUser.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-bold text-white truncate text-xs">
                      {currentUser.displayName || 'Google Account'}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div>
                <p className="text-zinc-400 text-[11px] mb-2 leading-relaxed">
                  Sign in with your Google account to read your production spreadsheets directly from Google Drive.
                </p>
                {/* Official Google Sign-In Styled Button */}
                <button
                  type="button"
                  onClick={onSignIn}
                  disabled={isSigningIn}
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-zinc-100 active:scale-98 text-zinc-800 font-bold text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Enter Google Sheet Link / ID */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              2. Google Sheet URL or ID
            </span>

            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Paste Google Sheet URL or Spreadsheet ID..."
                value={sheetIdInput}
                onChange={(e) => onSheetIdChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
              <p className="text-[10px] text-zinc-500">
                Example: <code>https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit</code>
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing || !sheetIdInput.trim()}
                className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-98 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Sheet Data Now'}</span>
              </button>

              <button
                type="button"
                onClick={onLoadDefaultDemo}
                className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors"
                title="Load built-in high profile commercial production template"
              >
                Reset Demo
              </button>
            </div>

            {/* Error or Success Feedback */}
            {syncError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-[11px] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{syncError}</span>
              </div>
            )}

            {syncSuccessMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-[11px] flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{syncSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Section 3: Live Auto-Refresh Settings */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-[11px] block">Auto-Sync on Set</span>
              <span className="text-[10px] text-zinc-400">Background polling interval</span>
            </div>
            <select
              value={autoRefreshInterval}
              onChange={(e) => onAutoRefreshChange(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
            >
              <option value={0}>Manual Only</option>
              <option value={30}>Every 30 Seconds</option>
              <option value={60}>Every 1 Minute</option>
              <option value={300}>Every 5 Minutes</option>
            </select>
          </div>

          {/* Section 4: Recommended Google Sheet Template Guide */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-[11px]">
                  Google Sheet Column & Tab Templates
                </span>
              </div>
              <button
                onClick={handleCopyCsv}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[10px] font-bold flex items-center space-x-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedCsv ? 'Copied CSV!' : 'Copy Tab CSV'}</span>
              </button>
            </div>

            {/* Launch Full Blueprint Hub Button */}
            <button
              type="button"
              onClick={onOpenBlueprint}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950 to-zinc-900 hover:from-emerald-900 hover:to-zinc-850 active:scale-98 border border-emerald-600/70 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Open Blueprint & Download Ready-to-Use .xlsx</span>
            </button>

            {/* Tab selector */}
            <div className="flex space-x-1 overflow-x-auto pb-1 text-[11px]">
              {CALL_SHEET_TEMPLATE_TABS.map((tab, idx) => (
                <button
                  key={tab.tabName}
                  onClick={() => setActiveTemplateTab(idx)}
                  className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-all ${
                    activeTemplateTab === idx
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {tab.tabName}
                </button>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5 text-[11px]">
              <p className="text-zinc-300 font-medium">{currentTabDef.description}</p>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Column Headers:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentTabDef.columns.map((col) => (
                    <span
                      key={col}
                      className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-mono"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
