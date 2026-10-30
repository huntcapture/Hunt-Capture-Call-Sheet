import React, { useState } from 'react';
import {
  Clapperboard,
  Check,
  Copy,
  ExternalLink,
  Plus,
  Share2,
  Lock,
  Calendar,
  Users,
  MapPin,
  X,
  FileSpreadsheet,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import type { ProductionJob } from '../types/job';
import { generateCrewShareUrl, generateCrewInviteText } from '../services/jobManager';
import { DEFAULT_CALL_SHEET } from '../data/defaultCallSheet';

interface JobSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: ProductionJob[];
  activeJobId: string;
  onSelectJob: (jobId: string) => void;
  onCreateJob: (newJob: ProductionJob) => void;
}

export const JobSwitcherModal: React.FC<JobSwitcherModalProps> = ({
  isOpen,
  onClose,
  jobs,
  activeJobId,
  onSelectJob,
  onCreateJob,
}) => {
  const [activeTab, setActiveTab] = useState<'slate' | 'new_job' | 'crew_links'>('slate');
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newAgency, setNewAgency] = useState('');
  const [newDirector, setNewDirector] = useState('');
  const [newDp, setNewDp] = useState('');
  const [newDate, setNewDate] = useState('Monday, November 2, 2026');
  const [newShootDay, setNewShootDay] = useState(1);
  const [newTotalDays, setNewTotalDays] = useState(2);
  const [newJobCode, setNewJobCode] = useState('');
  const [newSheetId, setNewSheetId] = useState('');

  if (!isOpen) return null;

  const handleCopyCrewLink = (job: ProductionJob) => {
    const link = generateCrewShareUrl(job);
    navigator.clipboard.writeText(link);
    setCopiedJobId(job.id);
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  const handleShareInvite = (job: ProductionJob) => {
    const text = generateCrewInviteText(job);
    if (navigator.share) {
      navigator.share({
        title: `Call Sheet: ${job.jobTitle}`,
        text,
        url: generateCrewShareUrl(job),
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedJobId(`invite-${job.id}`);
      setTimeout(() => setCopiedJobId(null), 2500);
    }
  };

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) return;

    const code =
      newJobCode.trim().toUpperCase() ||
      newClient.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() + '26';
    const id = `job-${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25)}-${Date.now()
      .toString()
      .slice(-4)}`;

    // Clone base template and update metadata
    const clonedData = JSON.parse(JSON.stringify(DEFAULT_CALL_SHEET));
    clonedData.production.jobTitle = newTitle;
    clonedData.production.client = newClient;
    clonedData.production.agency = newAgency || 'Agency Creative';
    clonedData.production.shootDay = Number(newShootDay);
    clonedData.production.totalDays = Number(newTotalDays);
    clonedData.production.date = newDate;
    clonedData.sourceSheetId = newSheetId.trim() || undefined;
    clonedData.sourceSheetName = newSheetId.trim() ? `${newClient}_CallSheet` : undefined;

    const createdJob: ProductionJob = {
      id,
      jobCode: code,
      jobTitle: newTitle,
      client: newClient,
      agency: newAgency || 'Agency Creative',
      productionCompany: 'Beacon & Reel Commercials',
      director: newDirector || 'Commercial Director',
      dp: newDp || 'Director of Photography',
      shootDate: newDate,
      shootDay: Number(newShootDay),
      totalDays: Number(newTotalDays),
      googleSheetId: newSheetId.trim() || undefined,
      crewCount: clonedData.personnel.length,
      callSheetData: clonedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateJob(createdJob);
    setActiveTab('slate');
    // Reset form
    setNewTitle('');
    setNewClient('');
    setNewAgency('');
    setNewDirector('');
    setNewDp('');
    setNewJobCode('');
    setNewSheetId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Multi-Job Production Slate</h3>
              <p className="text-[11px] text-zinc-400">
                Manage simultaneous commercials & route crew to specific call sheets
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

        {/* Tab Controls */}
        <div className="px-4 pt-3 flex space-x-2 border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setActiveTab('slate')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'slate'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Active Jobs Slate ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('crew_links')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'crew_links'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Crew 1 vs Crew 2 Links</span>
          </button>

          <button
            onClick={() => setActiveTab('new_job')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'new_job'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Job</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* TAB 1: ACTIVE JOBS SLATE */}
          {activeTab === 'slate' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Simultaneous Production Operations</span>
                  <span className="text-zinc-400">
                    Switch between active commercials or copy tailored direct links for each crew.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('new_job')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1 transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Job</span>
                </button>
              </div>

              <div className="space-y-3">
                {jobs.map((job) => {
                  const isActive = job.id === activeJobId;
                  const data = job.callSheetData;
                  const shootLoc =
                    data.locations.find((l) => l.type === 'shoot') || data.locations[0];

                  return (
                    <div
                      key={job.id}
                      className={`rounded-2xl border p-4 transition-all ${
                        isActive
                          ? 'bg-zinc-900 border-amber-500 shadow-xl ring-1 ring-amber-500/40'
                          : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Top Bar: Code & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md font-mono font-black text-xs bg-zinc-800 text-amber-400 border border-zinc-700">
                            {job.jobCode}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                            {job.client}
                          </span>
                        </div>

                        {isActive ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                            VIEWING CALL SHEET
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Day {job.shootDay}/{job.totalDays}
                          </span>
                        )}
                      </div>

                      {/* Main Title & Key Personnel */}
                      <div className="mb-2">
                        <h4 className="text-sm font-black text-white">{job.jobTitle}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Dir: <span className="text-zinc-200">{job.director}</span> • DP:{' '}
                          <span className="text-zinc-200">{job.dp}</span> • {job.shootDate}
                        </p>
                      </div>

                      {/* Metadata Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 border-y border-zinc-800/80 text-[11px] text-zinc-300">
                        <div className="flex items-center space-x-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{shootLoc ? shootLoc.name : 'TBD Stage'}</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{data.personnel.length} Crew & Cast</span>
                        </div>

                        <div className="flex items-center space-x-1.5 col-span-2 sm:col-span-1">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">
                            {job.googleSheetId ? 'Google Sheet Linked' : 'Sample Sheet'}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleCopyCrewLink(job)}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1 border border-zinc-700 transition-colors"
                          >
                            {copiedJobId === job.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied Link!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Copy Crew Link</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleShareInvite(job)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                            title="Share Crew SMS Invite"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!isActive ? (
                          <button
                            onClick={() => {
                              onSelectJob(job.id);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-black text-xs flex items-center space-x-1 transition-all shadow-md"
                          >
                            <span>Open Call Sheet</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-mono italic">
                            Currently Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CREW LINK DISTRIBUTION GUIDE */}
          {activeTab === 'crew_links' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>How to Show Call Sheet 1 to Crew 1, Call Sheet 2 to Crew 2</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Each commercial job has a unique deep-link and access code. When you send the specific link to your crew, their mobile browser automatically opens <strong>only their designated job's call sheet</strong> with real-time updates and schedule notifications.
                </p>
              </div>

              <div className="space-y-3">
                {jobs.map((job, idx) => {
                  const shareUrl = generateCrewShareUrl(job);
                  return (
                    <div
                      key={job.id}
                      className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-[11px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-black text-white text-xs">{job.jobTitle}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-amber-400">
                          Code: {job.jobCode}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-400 flex items-center justify-between overflow-x-auto">
                        <span className="truncate pr-2">{shareUrl}</span>
                        <button
                          onClick={() => handleCopyCrewLink(job)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold shrink-0 flex items-center space-x-1"
                        >
                          {copiedJobId === job.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-400">
                        Crew target:{' '}
                        <strong className="text-zinc-200">
                          {job.client} ({job.callSheetData.personnel.length} crew & cast members)
                        </strong>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CREATE NEW PRODUCTION JOB */}
          {activeTab === 'new_job' && (
            <form onSubmit={handleCreateJobSubmit} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-bold text-white text-xs block">
                  Add Commercial Production to Slate
                </span>
                <p className="text-[11px] text-zinc-400">
                  Creates an independent call sheet with its own schedule, crew roster, locations, safety team, and optional Google Sheet feed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">
                    Job Title / Commercial Spot *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nike 'Air Max' 60s"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Client / Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nike Global"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Advertising Agency</label>
                  <input
                    type="text"
                    placeholder="e.g. Wieden+Kennedy Portland"
                    value={newAgency}
                    onChange={(e) => setNewAgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">
                    Crew Access Code (4-8 chars)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NIKE26"
                    value={newJobCode}
                    onChange={(e) => setNewJobCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono uppercase focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Director</label>
                  <input
                    type="text"
                    placeholder="Director's Name"
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Director of Photography (DP)</label>
                  <input
                    type="text"
                    placeholder="DP's Name"
                    value={newDp}
                    onChange={(e) => setNewDp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Shoot Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Monday, Nov 2, 2026"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300">Shoot Day</label>
                    <input
                      type="number"
                      min={1}
                      value={newShootDay}
                      onChange={(e) => setNewShootDay(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300">Total Days</label>
                    <input
                      type="number"
                      min={1}
                      value={newTotalDays}
                      onChange={(e) => setNewTotalDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Distinct Google Sheet input */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center space-x-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Job-Specific Google Sheet URL or ID (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Paste separate Google Sheet link for this production..."
                  value={newSheetId}
                  onChange={(e) => setNewSheetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
                />
                <p className="text-[10px] text-zinc-500">
                  Each job can link to its own separate Google Sheet to feed distinct crew call times and schedules.
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('slate')}
                  className="px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Job & Initialize Call Sheet</span>
                </button>
              </div>
            </form>
          )}
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
