import React, { useState } from 'react';
import {
  Search,
  Phone,
  MessageSquare,
  Mail,
  Lock,
  Radio,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import type { PersonCall } from '../types/callsheet';

interface CrewTabProps {
  personnel: PersonCall[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string | null) => void;
}

export const CrewTab: React.FC<CrewTabProps> = ({
  personnel,
  selectedPersonId,
  onSelectPerson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [producerUnlocked, setProducerUnlocked] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Extract unique departments
  const departments = [
    'All',
    'Production',
    'Direction',
    'Camera',
    'Electric',
    'Grip',
    'Sound',
    'Art & Props',
    'Wardrobe & Styling',
    'Hair & Makeup',
    'Cast',
    'Agency & Client',
  ];

  const filteredPersonnel = personnel.filter((person) => {
    // Search match
    const matchesSearch =
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.callLocation && person.callLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Dept filter match
    if (deptFilter === 'All') return true;
    if (deptFilter === 'Agency & Client') {
      return person.category === 'agency' || person.category === 'client';
    }
    return person.department.toLowerCase().includes(deptFilter.toLowerCase());
  });

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple production passcode
    if (adminPinInput === '2026' || adminPinInput.toLowerCase() === 'producer') {
      setProducerUnlocked(true);
      setShowAdminPrompt(false);
      setPinError('');
      setAdminPinInput('');
    } else {
      setPinError('Incorrect producer authorization passcode.');
    }
  };

  return (
    <div className="space-y-3.5 pb-20">
      {/* Search & Privacy Notice Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white tracking-tight">Cast & Crew Directory</h2>
            <p className="text-xs text-zinc-400">
              {personnel.length} total call entries • Individual call times & contacts
            </p>
          </div>

          {/* Producer Unlock Toggle for Protected Contacts */}
          <button
            onClick={() => {
              if (producerUnlocked) {
                setProducerUnlocked(false);
              } else {
                setShowAdminPrompt(!showAdminPrompt);
              }
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg border flex items-center space-x-1 transition-all bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
          >
            {producerUnlocked ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Lock Agency Info</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Producer Access</span>
              </>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, role, department, or stage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Department Filter Chips */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-all ${
                deptFilter === dept
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Unlock Modal / Card */}
      {showAdminPrompt && (
        <form
          onSubmit={handleAdminUnlock}
          className="p-3 rounded-xl bg-zinc-900 border border-amber-500/40 space-y-2 text-xs"
        >
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Lock className="w-4 h-4" />
            <span>Authorized Producer Unlock</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Client and agency phone numbers are shielded for crew privacy. Enter Producer PIN (default: <code className="text-amber-300">2026</code>) to reveal:
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="password"
              placeholder="Enter PIN (2026)"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs"
            >
              Authorize
            </button>
            <button
              type="button"
              onClick={() => setShowAdminPrompt(false)}
              className="px-2 py-1.5 text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          {pinError && <p className="text-rose-400 text-[10px]">{pinError}</p>}
        </form>
      )}

      {/* Roster Cards */}
      <div className="space-y-2.5">
        {filteredPersonnel.map((person) => {
          const isShielded =
            (person.category === 'agency' || person.category === 'client') && !producerUnlocked;
          const isPinned = person.id === selectedPersonId;

          return (
            <div
              key={person.id}
              className={`rounded-xl border p-3.5 transition-all ${
                isPinned
                  ? 'bg-zinc-900 border-amber-500/70 shadow-md ring-1 ring-amber-500/30'
                  : isShielded
                  ? 'bg-zinc-950/80 border-zinc-800/90'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* Header: Name, Role, Call Time */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-sm font-black text-white">{person.name}</h3>

                    {/* Category Badges */}
                    {person.category === 'agency' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                        Advertising Agency
                      </span>
                    )}
                    {person.category === 'client' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60">
                        Client / Brand
                      </span>
                    )}
                    {person.category === 'cast' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">
                        Cast / Talent
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 font-medium mt-0.5">
                    {person.role}{' '}
                    <span className="text-zinc-500">• {person.department}</span>
                  </p>
                </div>

                {/* Call Time Badge */}
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/80 text-amber-400 font-mono font-black text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{person.callTime}</span>
                  </div>
                </div>
              </div>

              {/* Call Location & Walkie */}
              <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-400 flex-wrap gap-y-1">
                {person.callLocation && (
                  <div className="flex items-center space-x-1 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{person.callLocation}</span>
                  </div>
                )}
                {person.walkieChannel && !isShielded && (
                  <div className="flex items-center space-x-1 text-zinc-300">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{person.walkieChannel}</span>
                  </div>
                )}
              </div>

              {/* Personal Notes */}
              {person.notes && (
                <p className="text-[11px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg mt-2 border border-zinc-800/60 leading-relaxed">
                  {person.notes}
                </p>
              )}

              {/* Contact Actions Area */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                {isShielded ? (
                  /* Client & Agency Contact Shielded Banner */
                  <div className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400">
                    <div className="flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-zinc-300 font-medium">
                        Contact Info Hidden (Privacy Policy)
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Route via UPM / 1st AD</span>
                  </div>
                ) : (
                  /* Visible Crew Contact Options */
                  <div className="flex items-center space-x-2 w-full justify-between">
                    <div className="flex items-center space-x-1.5">
                      {person.phone && person.phone !== 'CONFIDENTIAL' && (
                        <>
                          <a
                            href={`tel:${person.phone.replace(/[^0-9]/g, '')}`}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 font-bold text-xs flex items-center space-x-1 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                          <a
                            href={`sms:${person.phone.replace(/[^0-9]/g, '')}`}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium text-xs flex items-center space-x-1 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-zinc-400" />
                            <span>SMS</span>
                          </a>
                        </>
                      )}

                      {person.email && person.email !== 'CONFIDENTIAL' && (
                        <a
                          href={`mailto:${person.email}`}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium text-xs flex items-center space-x-1 transition-colors"
                        >
                          <Mail className="w-3 h-3 text-zinc-400" />
                          <span className="hidden sm:inline">Email</span>
                        </a>
                      )}
                    </div>

                    {/* Pin as 'My Call' button */}
                    <button
                      onClick={() => onSelectPerson(isPinned ? null : person.id)}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1 ${
                        isPinned
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isPinned ? 'My Call (Pinned)' : 'This is Me'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredPersonnel.length === 0 && (
          <div className="p-8 text-center text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/40">
            No cast or crew members found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
