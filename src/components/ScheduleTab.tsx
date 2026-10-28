import React, { useState } from 'react';
import {
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { ScheduleItem } from '../types/callsheet';

interface ScheduleTabProps {
  schedule: ScheduleItem[];
  onUpdateSceneStatus: (sceneId: string, status: ScheduleItem['status']) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  schedule,
  onUpdateSceneStatus,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'wrapped'>('all');

  const filteredSchedule = schedule.filter((item) => {
    if (filter === 'active') return item.status === 'in-progress';
    if (filter === 'upcoming') return item.status === 'upcoming';
    if (filter === 'wrapped') return item.status === 'wrapped';
    return true;
  });

  return (
    <div className="space-y-3.5 pb-20">
      {/* Header and Filter Pills */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-white tracking-tight">Shooting Timeline</h2>
          <p className="text-xs text-zinc-400">Real-time setup order & camera setups</p>
        </div>
        <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
          {(['all', 'active', 'upcoming', 'wrapped'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setFilter(tabKey)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                filter === tabKey
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tabKey}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {filteredSchedule.map((item, index) => {
          const isCurrent = item.status === 'in-progress';
          const isWrapped = item.status === 'wrapped';
          const isDelayed = item.status === 'delayed';

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all p-3.5 ${
                isCurrent
                  ? 'bg-zinc-900 border-amber-500/80 shadow-lg ring-1 ring-amber-500/50'
                  : isWrapped
                  ? 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
                  : isDelayed
                  ? 'bg-rose-950/30 border-rose-800/70'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* Top Meta: Time & Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-amber-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {item.timeEstimate}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">
                    {item.intExt} • {item.dayNight}
                  </span>
                </div>

                {/* Status Indicator */}
                <div>
                  {isCurrent && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                      SHOOTING NOW
                    </span>
                  )}
                  {isWrapped && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-zinc-800 text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-0.5" />
                      WRAPPED
                    </span>
                  )}
                  {isDelayed && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-rose-500/20 text-rose-300">
                      <AlertCircle className="w-3 h-3 text-rose-400 mr-0.5" />
                      DELAYED
                    </span>
                  )}
                  {item.status === 'upcoming' && (
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">UPCOMING</span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-2">
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <Video className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{item.sceneOrSetup}</span>
                </h3>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed pl-6">
                  {item.setAndDescription}
                </p>
              </div>

              {/* Cast & Technical Notes */}
              <div className="pl-6 space-y-1.5 pt-1 text-xs">
                {item.castIds.length > 0 && (
                  <div className="flex items-center space-x-1.5 text-zinc-400">
                    <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-zinc-300">Cast:</strong> {item.castIds.join(', ')}
                    </span>
                  </div>
                )}

                {item.specialNotes && (
                  <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-amber-200/90 flex items-start space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item.specialNotes}</span>
                  </div>
                )}
              </div>

              {/* Live 1st AD / Floor Status Controls */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {item.pagesOrCount || '1 Setup'}
                </span>

                <div className="flex items-center space-x-1.5">
                  {!isCurrent && !isWrapped && (
                    <button
                      onClick={() => onUpdateSceneStatus(item.id, 'in-progress')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-[11px] flex items-center space-x-1 transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Shooting</span>
                    </button>
                  )}

                  {isCurrent && (
                    <button
                      onClick={() => onUpdateSceneStatus(item.id, 'wrapped')}
                      className="px-2.5 py-1 rounded bg-zinc-700 hover:bg-zinc-600 active:scale-95 text-white font-bold text-[11px] flex items-center space-x-1 transition-all"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Mark Wrapped</span>
                    </button>
                  )}

                  {isWrapped && (
                    <button
                      onClick={() => onUpdateSceneStatus(item.id, 'upcoming')}
                      className="px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 text-[10px] flex items-center space-x-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchedule.length === 0 && (
          <div className="p-8 text-center text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/40">
            No scenes match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
