import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  ShieldAlert,
  MapPin,
  MessageSquare,
  Printer,
  Smartphone,
} from 'lucide-react';
import type { CallSheetData } from '../types/callsheet';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  callSheet: CallSheetData;
  jobId?: string;
  jobCode?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  callSheet,
  jobId,
  jobCode,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareUrl =
    typeof window !== 'undefined'
      ? jobId
        ? `${window.location.origin}${window.location.pathname}?job=${encodeURIComponent(jobId)}`
        : window.location.href
      : '';

  const { production, locations, safety } = callSheet;
  const shootLoc = locations.find((l) => l.type === 'shoot') || locations[0];
  const basecamp = locations.find((l) => l.type === 'basecamp') || locations[1];

  // Full Call Sheet Text Summary
  const generateFullSummaryText = () => {
    return `🎬 CALL SHEET: ${production.jobTitle}
📅 Day ${production.shootDay} of ${production.totalDays} — ${production.date}
Client: ${production.client} | Agency: ${production.agency}

⏰ KEY TIMES:
• General Crew Call: ${production.generalCallTime}
• Breakfast Ready: ${production.breakfastTime}
• Safety Briefing: ${production.safetyBriefingTime}
• Camera Ready / Shooting Call: ${production.shootingCallTime}
• Est. Lunch: ${production.estimatedLunchTime}
• Est. Wrap: ${production.estimatedWrapTime}

📍 SHOOT LOCATION:
${shootLoc ? `${shootLoc.name}\n${shootLoc.address}, ${shootLoc.cityStateZip}` : 'TBD'}

🚗 BASECAMP & CREW PARKING:
${basecamp ? `${basecamp.name}\n${basecamp.address}, ${basecamp.cityStateZip}\nParking: ${basecamp.parkingNotes}` : 'See Production Office'}

🏥 NEAREST EMERGENCY HOSPITAL:
${safety.hospitalName}
Address: ${safety.address}, ${safety.cityStateZip}
Emergency ER Direct Phone: ${safety.emergencyPhone}
Distance: ${safety.distanceMiles} (${safety.driveTimeMinutes} drive)

🚑 SET MEDIC & EMERGENCY RADIO:
Medic: ${safety.medicName} (${safety.medicPhone})
Emergency Channel: ${safety.emergencyChannel}

⚠️ LOCATION ETIQUETTE & CODE OF CONDUCT:
${safety.etiquetteRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

📱 Access Live Mobile Call Sheet:
${shareUrl}`;
  };

  // Safety & Hospital Only Summary
  const generateSafetyOnlyText = () => {
    return `🚨 EMERGENCY & LOCATION ETIQUETTE BRIEFING
Project: ${production.jobTitle} (Day ${production.shootDay} of ${production.totalDays})

🏥 NEAREST EMERGENCY HOSPITAL:
Hospital: ${safety.hospitalName}
Address: ${safety.address}, ${safety.cityStateZip}
Emergency Room Phone: ${safety.emergencyPhone}
Drive Time: ${safety.driveTimeMinutes} (${safety.distanceMiles})

🚑 ON-SET MEDIC:
Name: ${safety.medicName}
Direct Phone: ${safety.medicPhone}
Radio Channel: ${safety.emergencyChannel}

📍 PRIMARY SHOOT ADDRESS:
${shootLoc ? `${shootLoc.name} — ${shootLoc.address}, ${shootLoc.cityStateZip}` : 'Main Stage'}

⚠️ MANDATORY LOCATION ETIQUETTE:
${safety.etiquetteRules.map((rule, i) => `• ${rule}`).join('\n')}

Live Call Sheet App: ${shareUrl}`;
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleNativeShare = async (title: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy(text, 'native');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Share Production Call Sheet</h3>
              <p className="text-[11px] text-zinc-400">
                Send to cast & crew via text, WhatsApp, or group chat
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
        <div className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar text-xs text-zinc-300 flex-1">
          {/* Direct Crew Link Card */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                <span>Crew Direct Job Link</span>
                {jobCode && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] font-mono">
                    Code: {jobCode}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleCopy(shareUrl, 'crew_url')}
                className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] flex items-center space-x-1 transition-colors"
              >
                {copiedType === 'crew_url' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400">
              Sends crew directly to this call sheet. They won't see other commercial jobs.
            </p>
            <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 truncate">
              {shareUrl}
            </div>
          </div>

          {/* Quick Share to Mobile Apps */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold text-xs">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Native Mobile Share (iMessage / WhatsApp / Slack)</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Opens your device's native share menu to send the call sheet link and times directly to crew group chats.
            </p>
            <button
              onClick={() =>
                handleNativeShare(
                  `Call Sheet: ${production.jobTitle}`,
                  generateFullSummaryText()
                )
              }
              className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-98 text-zinc-950 font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Call Sheet via Mobile Apps</span>
            </button>
          </div>

          {/* Copy Full Call Sheet Summary */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Copy Full Day SMS / Text Summary</span>
              </div>
              <button
                onClick={() => handleCopy(generateFullSummaryText(), 'full')}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[11px] flex items-center space-x-1 transition-colors"
              >
                {copiedType === 'full' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[10px] text-zinc-400 max-h-28 overflow-y-auto whitespace-pre-wrap font-mono custom-scrollbar">
              {generateFullSummaryText()}
            </pre>
          </div>

          {/* Share Safety & Hospital Only (Specific prompt requirement) */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Share Safety, ER Hospital & Etiquette Only</span>
              </div>
              <button
                onClick={() => handleCopy(generateSafetyOnlyText(), 'safety')}
                className="px-2.5 py-1 rounded bg-rose-900/50 hover:bg-rose-900/80 text-rose-200 font-semibold text-[11px] flex items-center space-x-1 transition-colors border border-rose-800/60"
              >
                {copiedType === 'safety' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Safety</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-300">
              Quick emergency card containing Nearest ER Hospital address, direct ER phone, Set Medic, and mandatory location etiquette rules.
            </p>
          </div>

          {/* Print Friendly */}
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-zinc-400">
              <Printer className="w-4 h-4" />
              <span>Printable Call Sheet View</span>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
