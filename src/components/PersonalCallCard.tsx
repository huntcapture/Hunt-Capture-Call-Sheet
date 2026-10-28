import React, { useState } from 'react';
import { UserCheck, Clock, MapPin, Radio, AlertCircle, ChevronDown, Check } from 'lucide-react';
import type { PersonCall } from '../types/callsheet';

interface PersonalCallCardProps {
  personnel: PersonCall[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string | null) => void;
}

export const PersonalCallCard: React.FC<PersonalCallCardProps> = ({
  personnel,
  selectedPersonId,
  onSelectPerson,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedPerson = personnel.find((p) => p.id === selectedPersonId);

  const filtered = personnel.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
      {/* Accent edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500" />

      {selectedPerson ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>YOUR PERSONAL CALL TIME</span>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs text-zinc-400 hover:text-zinc-200 underline flex items-center space-x-1"
            >
              <span>Change Person</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-baseline justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">{selectedPerson.name}</h2>
              <p className="text-xs text-zinc-300 font-medium">
                {selectedPerson.role}{' '}
                <span className="text-zinc-500">• {selectedPerson.department}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-black text-lg tracking-tight shadow-md">
                <Clock className="w-4 h-4 mr-0.5" />
                <span>{selectedPerson.callTime}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs">
            {selectedPerson.callLocation && (
              <div className="flex items-start space-x-1.5 text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="truncate">
                  <strong className="text-zinc-400 block text-[10px] uppercase">Report To:</strong>
                  {selectedPerson.callLocation}
                </span>
              </div>
            )}

            {selectedPerson.walkieChannel && (
              <div className="flex items-start space-x-1.5 text-zinc-300">
                <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-400 block text-[10px] uppercase">Walkie:</strong>
                  {selectedPerson.walkieChannel}
                </span>
              </div>
            )}
          </div>

          {selectedPerson.notes && (
            <div className="mt-2.5 p-2 rounded-lg bg-zinc-800/70 border border-zinc-700/50 text-xs text-amber-200/90 flex items-start space-x-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{selectedPerson.notes}</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Find Your Individual Call Time</h3>
                <p className="text-xs text-zinc-400">Select your name to pin your call time and staging notes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs tracking-tight transition-all"
            >
              Select Name
            </button>
          </div>
        </div>
      )}

      {/* Dropdown Modal / Drawer */}
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <input
            type="text"
            placeholder="Search your name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 mb-2"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filtered.map((person) => (
              <button
                key={person.id}
                onClick={() => {
                  onSelectPerson(person.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                  person.id === selectedPersonId
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                    : 'hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <div>
                  <div className="font-medium text-white">{person.name}</div>
                  <div className="text-[11px] text-zinc-400">
                    {person.role} • {person.department}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-amber-400">{person.callTime}</span>
                  {person.id === selectedPersonId && <Check className="w-3.5 h-3.5 text-amber-400 ml-1 inline" />}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-3">No matching crew member found.</p>
            )}
          </div>
          {selectedPerson && (
            <button
              onClick={() => {
                onSelectPerson(null);
                setIsOpen(false);
              }}
              className="mt-2 text-xs text-rose-400 hover:text-rose-300 block text-center w-full py-1"
            >
              Clear My Selection
            </button>
          )}
        </div>
      )}
    </div>
  );
};
