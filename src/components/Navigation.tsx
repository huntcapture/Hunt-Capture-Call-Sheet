import React from 'react';
import { Calendar, Users, MapPin, ShieldAlert, Clock } from 'lucide-react';

export type TabType = 'overview' | 'schedule' | 'crew' | 'locations' | 'safety';

interface NavigationProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  urgentAlert: boolean;
}

interface NavTab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasAlert?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onChangeTab,
  urgentAlert,
}) => {
  const tabs: NavTab[] = [
    { id: 'overview', label: 'Call Sheet', icon: Clock },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'crew', label: 'Crew & Calls', icon: Users },
    { id: 'locations', label: 'Locations', icon: MapPin },
    {
      id: 'safety',
      label: 'Safety / ER',
      icon: ShieldAlert,
      hasAlert: urgentAlert,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-2 py-1.5 shadow-2xl safe-area-pb">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as TabType)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-400 font-bold bg-zinc-900/90 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.hasAlert && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-zinc-950 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
