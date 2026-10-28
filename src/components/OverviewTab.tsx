import React from 'react';
import {
  Clock,
  Sun,
  Sunrise,
  Sunset,
  AlertTriangle,
  MapPin,
  HeartPulse,
  Navigation as NavIcon,
  Phone,
  Utensils,
  Camera,
  Film,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { CallSheetData } from '../types/callsheet';

interface OverviewTabProps {
  callSheet: CallSheetData;
  onNavigateToTab: (tab: 'schedule' | 'crew' | 'locations' | 'safety') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  callSheet,
  onNavigateToTab,
}) => {
  const { production, schedule, locations, safety } = callSheet;
  const shootLoc = locations.find((l) => l.type === 'shoot') || locations[0];
  const activeScene = schedule.find((s) => s.status === 'in-progress') || schedule[0];

  const mapsUrl = (addr: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

  return (
    <div className="space-y-4 pb-20">
      {/* Urgent 1st AD Bulletin */}
      {production.bulletin && (
        <div
          className={`rounded-xl p-3.5 border shadow-md ${
            production.bulletin.urgent
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-100'
              : 'bg-zinc-900 border-zinc-800 text-zinc-200'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-black tracking-wider uppercase text-rose-400">
                  {production.bulletin.headline}
                </span>
                <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                  {production.bulletin.updatedAt}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-200">{production.bulletin.message}</p>
              <p className="text-[10px] text-zinc-400 mt-1.5 font-medium">
                Issued by: {production.bulletin.author}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Production Key Milestones Times Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Official Production Call Times
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">PST Standard Time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* General Crew Call */}
          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              General Crew Call
            </span>
            <span className="text-xl font-black font-mono text-white mt-1">
              {production.generalCallTime}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Main soundstage check-in</span>
          </div>

          {/* Breakfast */}
          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Breakfast Ready
              </span>
              <Utensils className="w-3 h-3 text-zinc-500" />
            </div>
            <span className="text-xl font-black font-mono text-zinc-200 mt-1">
              {production.breakfastTime}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Catering pavilion</span>
          </div>

          {/* Safety Meeting */}
          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Safety Briefing
              </span>
              <AlertTriangle className="w-3 h-3 text-amber-500" />
            </div>
            <span className="text-xl font-black font-mono text-zinc-200 mt-1">
              {production.safetyBriefingTime}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Mandatory all departments</span>
          </div>

          {/* Shooting Call */}
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Camera / Ready
              </span>
              <Camera className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-xl font-black font-mono text-emerald-200 mt-1">
              {production.shootingCallTime}
            </span>
            <span className="text-[10px] text-emerald-500/80 mt-0.5">First shot up on deck</span>
          </div>

          {/* Est Lunch */}
          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Est. Company Lunch
            </span>
            <span className="text-xl font-black font-mono text-zinc-200 mt-1">
              {production.estimatedLunchTime}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">60 min meal penalty rule</span>
          </div>

          {/* Est Wrap */}
          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Estimated Wrap
            </span>
            <span className="text-xl font-black font-mono text-zinc-200 mt-1">
              {production.estimatedWrapTime}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Day 1 wrap call</span>
          </div>
        </div>
      </div>

      {/* Currently On Set / Shooting Highlight Card */}
      {activeScene && (
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-amber-500/40 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                ACTIVE ON SET NOW
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab('schedule')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-0.5"
            >
              <span>Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-black text-white">{activeScene.sceneOrSetup}</h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-amber-300 font-mono">
                  {activeScene.intExt} • {activeScene.dayNight}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                {activeScene.setAndDescription}
              </p>
              {activeScene.specialNotes && (
                <p className="text-[11px] text-amber-300/80 mt-1 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{activeScene.specialNotes}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shoot Location Quick Navigation */}
      {shootLoc && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Main Shooting Stage
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('locations')}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center"
            >
              All Locations <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <p className="text-sm font-bold text-white">{shootLoc.name}</p>
          <p className="text-xs text-zinc-300 mt-0.5">
            {shootLoc.address}, {shootLoc.cityStateZip}
          </p>

          <div className="flex items-center space-x-2 mt-3">
            <a
              href={mapsUrl(`${shootLoc.address}, ${shootLoc.cityStateZip}`)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all border border-zinc-700"
            >
              <NavIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Open in Maps</span>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${shootLoc.address}, ${shootLoc.cityStateZip}`);
                alert('Location address copied to clipboard!');
              }}
              className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors border border-zinc-700"
            >
              Copy Address
            </button>
          </div>
        </div>
      )}

      {/* Emergency Nearest Hospital Rapid Card */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-black uppercase tracking-wider text-rose-400">
              Nearest Emergency Hospital ({safety.driveTimeMinutes})
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab('safety')}
            className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center"
          >
            Safety Protocols <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <p className="text-sm font-bold text-white">{safety.hospitalName}</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          {safety.address}, {safety.cityStateZip} • {safety.distanceMiles}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <a
            href={`tel:${safety.emergencyPhone.replace(/[^0-9]/g, '')}`}
            className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call ER: {safety.emergencyPhone}</span>
          </a>
          <a
            href={mapsUrl(`${safety.address}, ${safety.cityStateZip}`)}
            target="_blank"
            rel="noreferrer"
            className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all border border-zinc-700"
          >
            <NavIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency Route</span>
          </a>
        </div>
      </div>

      {/* Weather on Set */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-2 border-b border-zinc-800/80 pb-2">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Location Weather & Sun Timings
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-400">{production.weather.high}</span>
        </div>

        <p className="text-xs text-zinc-300 font-medium">{production.weather.condition}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
          {production.weather.summary}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-zinc-800 text-xs">
          <div className="flex items-center space-x-2 text-zinc-300">
            <Sunrise className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <strong className="text-zinc-500">Sunrise:</strong> {production.weather.sunrise}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-300">
            <Sunset className="w-3.5 h-3.5 text-orange-400" />
            <span>
              <strong className="text-zinc-500">Sunset:</strong> {production.weather.sunset}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
