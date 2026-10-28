import React from 'react';
import {
  HeartPulse,
  Phone,
  Navigation,
  ShieldAlert,
  AlertTriangle,
  Radio,
  UserCheck,
  Siren,
  ChevronRight,
} from 'lucide-react';
import type { SafetyHospitalInfo, WalkieChannel } from '../types/callsheet';

interface SafetyTabProps {
  safety: SafetyHospitalInfo;
  walkieChannels: WalkieChannel[];
}

export const SafetyTab: React.FC<SafetyTabProps> = ({ safety, walkieChannels }) => {
  const getMapsUrl = (address: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const fullHospitalAddress = `${safety.address}, ${safety.cityStateZip}`;

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-base font-black text-white tracking-tight">Safety & Emergency Protocols</h2>
        <p className="text-xs text-zinc-400">Nearest emergency trauma center, on-set medic & radio channels</p>
      </div>

      {/* Emergency Nearest Hospital Card */}
      <div className="bg-gradient-to-br from-rose-950/60 via-zinc-900 to-zinc-950 border-2 border-rose-600/80 rounded-xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-rose-600 text-white animate-pulse">
              <Siren className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-rose-400">
              DESIGNATED EMERGENCY HOSPITAL
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {safety.driveTimeMinutes} ({safety.distanceMiles})
          </span>
        </div>

        <h3 className="text-lg font-black text-white tracking-tight">{safety.hospitalName}</h3>
        <p className="text-xs text-zinc-300 mt-1 font-mono">{fullHospitalAddress}</p>

        {/* Action Buttons for Hospital */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <a
            href={`tel:${safety.emergencyPhone.replace(/[^0-9]/g, '')}`}
            className="py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Call ER: {safety.emergencyPhone}</span>
          </a>
          <a
            href={getMapsUrl(fullHospitalAddress)}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-zinc-700 transition-all shadow-sm"
          >
            <Navigation className="w-4 h-4 text-rose-400" />
            <span>Start Route</span>
          </a>
        </div>
      </div>

      {/* On-Set Medical Team */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-md space-y-3">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
          <HeartPulse className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            On-Set Medical & Safety Contacts
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Medic */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold uppercase">
                <UserCheck className="w-3 h-3" />
                <span>Lead Set Medic</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{safety.medicName}</h4>
              <p className="text-[11px] text-zinc-400 font-mono">Walkie: {safety.emergencyChannel}</p>
            </div>
            <a
              href={`tel:${safety.medicPhone.replace(/[^0-9]/g, '')}`}
              className="p-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 transition-colors"
              title="Call Medic"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Safety Officer */}
          {safety.safetyOfficerName && (
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1 text-amber-400 text-[10px] font-bold uppercase">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Safety Officer</span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">{safety.safetyOfficerName}</h4>
                <p className="text-[11px] text-zinc-400 font-mono">Stage Safety Lead</p>
              </div>
              {safety.safetyOfficerPhone && (
                <a
                  href={`tel:${safety.safetyOfficerPhone.replace(/[^0-9]/g, '')}`}
                  className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
                  title="Call Safety Officer"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Specific Active Hazards on Set */}
      {safety.hazardWarnings.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-md space-y-2.5">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Active Set Hazards & Precautionary Warnings
            </h3>
          </div>

          <div className="space-y-2">
            {safety.hazardWarnings.map((warning, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 flex items-start space-x-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Walkie-Talkie Channel Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-md space-y-2.5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Walkie-Talkie Channel Guide
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Standard CP200/BPR40</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {walkieChannels.map((item) => {
            const isEmergency = item.channel === 8;
            return (
              <div
                key={item.channel}
                className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                  isEmergency
                    ? 'bg-rose-950/40 border-rose-700/60 text-rose-200'
                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center font-mono font-black text-xs ${
                      isEmergency
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-amber-400'
                    }`}
                  >
                    {item.channel}
                  </span>
                  <div>
                    <span className="font-bold block text-white">{item.department}</span>
                    <span className="text-[10px] text-zinc-400">{item.notes}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
