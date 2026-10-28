import React from 'react';
import {
  MapPin,
  Car,
  Navigation,
  Copy,
  Check,
  AlertOctagon,
  FileText,
  Truck,
  Coffee,
  Info,
} from 'lucide-react';
import type { ShootLocation } from '../types/callsheet';

interface LocationTabProps {
  locations: ShootLocation[];
  etiquetteRules: string[];
}

export const LocationTab: React.FC<LocationTabProps> = ({
  locations,
  etiquetteRules,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyAddress = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGoogleMapsUrl = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const getAppleMapsUrl = (address: string) =>
    `https://maps.apple.com/?q=${encodeURIComponent(address)}`;

  const getLocationIcon = (type: ShootLocation['type']) => {
    switch (type) {
      case 'shoot':
        return <MapPin className="w-4 h-4 text-rose-400" />;
      case 'basecamp':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'equipment_trucks':
        return <Truck className="w-4 h-4 text-blue-400" />;
      case 'catering':
        return <Coffee className="w-4 h-4 text-emerald-400" />;
      default:
        return <MapPin className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-base font-black text-white tracking-tight">Shoot Locations & Parking</h2>
        <p className="text-xs text-zinc-400">Verified GPS coordinates, gate codes & shuttle instructions</p>
      </div>

      {/* Locations List */}
      <div className="space-y-3">
        {locations.map((loc) => {
          const fullAddr = `${loc.address}, ${loc.cityStateZip}`;
          return (
            <div
              key={loc.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-md space-y-2.5"
            >
              {/* Type Badge & Name */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    {getLocationIcon(loc.type)}
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      {loc.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white">{loc.name}</h3>
                  <p className="text-xs text-zinc-300 font-mono mt-0.5">{fullAddr}</p>
                </div>
              </div>

              {/* Parking Instructions */}
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-zinc-400 font-bold">
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] uppercase tracking-wider">Parking & Arrival Notes</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px] pl-5">{loc.parkingNotes}</p>
              </div>

              {/* Special Stage Instructions */}
              {loc.specialInstructions && (
                <div className="p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/40 text-[11px] text-zinc-300 flex items-start space-x-2">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{loc.specialInstructions}</span>
                </div>
              )}

              {/* Action Buttons: Maps & Copy */}
              <div className="pt-1 flex items-center space-x-2 text-xs">
                <a
                  href={getGoogleMapsUrl(fullAddr)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-semibold flex items-center justify-center space-x-1 border border-zinc-700 transition-all text-xs"
                >
                  <Navigation className="w-3 h-3 text-rose-400" />
                  <span>Google Maps</span>
                </a>
                <a
                  href={getAppleMapsUrl(fullAddr)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-semibold flex items-center justify-center space-x-1 border border-zinc-700 transition-all text-xs"
                >
                  <span>Apple Maps</span>
                </a>
                <button
                  onClick={() => copyAddress(loc.id, fullAddr)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                  title="Copy address"
                >
                  {copiedId === loc.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Location Etiquette Guidelines (Mandatory on commercial sets) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-md space-y-3">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Location Etiquette & Code of Conduct
          </h3>
        </div>

        <div className="space-y-2">
          {etiquetteRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-300 flex items-start space-x-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed flex-1">{rule}</p>
            </div>
          ))}
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>Violations of NDA or safety etiquette are subject to immediate removal from set.</span>
        </div>
      </div>
    </div>
  );
};
