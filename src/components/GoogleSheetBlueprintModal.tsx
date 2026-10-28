import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Users,
  Shield,
  Bell,
  CheckCircle2,
  Table,
  HelpCircle,
} from 'lucide-react';
import type { CallSheetData } from '../types/callsheet';
import { downloadGoogleSheetWorkbook } from '../services/sheetExporter';
import { CALL_SHEET_TEMPLATE_TABS, generateTemplateCsv } from '../data/googleSheetTemplate';

interface GoogleSheetBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  callSheet: CallSheetData;
}

export const GoogleSheetBlueprintModal: React.FC<GoogleSheetBlueprintModalProps> = ({
  isOpen,
  onClose,
  callSheet,
}) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTab = CALL_SHEET_TEMPLATE_TABS[activeTabIdx];

  const handleCopyTabCsv = (tabName: string) => {
    const csv = generateTemplateCsv(currentTab);
    navigator.clipboard.writeText(csv);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Google Sheet Blueprint & Admin Guide</h3>
              <p className="text-[11px] text-zinc-400">
                Multi-tab schema and admin workflow for live production updates
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

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar text-xs text-zinc-300 flex-1">
          {/* Main Action Banner: Instant Download */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 to-zinc-900 border border-emerald-700/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400 block mb-0.5">
                READY-TO-UPLOAD WORKBOOK
              </span>
              <h4 className="text-sm font-black text-white">
                Download Complete Multi-Tab Call Sheet (.xlsx)
              </h4>
              <p className="text-[11px] text-zinc-300 mt-1 max-w-md leading-relaxed">
                Contains all 6 pre-formatted tabs with bold headers, column widths, sample crew, locations, and safety protocols ready for Google Drive.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => downloadGoogleSheetWorkbook(callSheet)}
                className="py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-black text-xs flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download .xlsx File</span>
              </button>
            </div>
          </div>

          {/* Quick Setup in Google Drive (3 Steps) */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>How Admins Set Up the Google Sheet (In 60 Seconds)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
                <span className="text-amber-400 font-bold block">Step 1: Upload</span>
                <p className="text-zinc-400 leading-snug">
                  Download the <code>.xlsx</code> file above, open{' '}
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 underline"
                  >
                    Google Drive
                  </a>
                  , drag the file in, and open it with Google Sheets.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
                <span className="text-amber-400 font-bold block">Step 2: Set Permissions</span>
                <p className="text-zinc-400 leading-snug">
                  Click <strong>Share</strong>. Add your 1st AD & UPM as <strong>Editors</strong>. Set General Access to <strong>Anyone with the link can View</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
                <span className="text-amber-400 font-bold block">Step 3: Connect & Sync</span>
                <p className="text-zinc-400 leading-snug">
                  Copy the Google Sheet link from your browser and paste it into Hunt + Capture's Google Sheet modal. Cast and crew will receive real-time updates!
                </p>
              </div>
            </div>
          </div>

          {/* Tab Structure Breakdown & Schema Inspector */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Table className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">Tab-by-Tab Schema & CSV Blueprint</span>
              </div>
              <button
                onClick={() => handleCopyTabCsv(currentTab.tabName)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[11px] font-bold flex items-center space-x-1 transition-colors border border-zinc-700"
              >
                {copiedTab === currentTab.tabName ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied CSV!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy "{currentTab.tabName}" CSV</span>
                  </>
                )}
              </button>
            </div>

            {/* Tab Chips */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs">
              {CALL_SHEET_TEMPLATE_TABS.map((tab, idx) => (
                <button
                  key={tab.tabName}
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all ${
                    activeTabIdx === idx
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {tab.tabName}
                </button>
              ))}
            </div>

            {/* Current Tab Details */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">
                  Tab Name: <code className="text-amber-400">{currentTab.tabName}</code>
                </span>
                <span className="text-[10px] text-zinc-500">{currentTab.columns.length} columns</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">{currentTab.description}</p>

              {/* Columns List */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                  Required Header Columns (Exact match not required; Hunt + Capture auto-maps synonyms):
                </span>
                <div className="flex flex-wrap gap-1">
                  {currentTab.columns.map((col) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-200 font-mono"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Row Preview */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                  Sample Data Row:
                </span>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800/80 text-[10px] font-mono text-zinc-400 overflow-x-auto whitespace-nowrap custom-scrollbar">
                  {currentTab.sampleRows[0]?.join(' | ')}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Best Practices & Collaboration Protocol */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin & Multi-User Collaboration Guidelines</span>
            </span>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start space-x-2">
                <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Triggering Live Push Notifications:</strong>
                  Whenever you update a crew member's call time in the <code>Personnel</code> tab or edit the <code>Urgent Bulletin Headline</code> in <code>Production</code>, Hunt + Capture triggers an audible chime, vibration, and push notification on the crew's phones upon sync.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start space-x-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Multi-User Sheet Protection (Google Sheets Range Locks):</strong>
                  Producers can protect specific ranges (<em>Data &gt; Protect sheets and ranges</em>) so that the 1st AD only edits the <code>Schedule</code> tab, the Transportation Coordinator only edits <code>Locations</code>, and the Line Producer maintains <code>Personnel</code>.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start space-x-2">
                <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Privacy Rules for Client & Agency Rows:</strong>
                  In the <code>Personnel</code> tab, if a row's category is <code>agency</code> or <code>client</code>, Hunt + Capture automatically masks the phone and email on all cast and crew mobile screens.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
          <a
            href="https://docs.google.com/spreadsheets/create"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center space-x-1"
          >
            <span>Create Blank Sheet in Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
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
