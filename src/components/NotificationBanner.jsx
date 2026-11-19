import { useSOS } from '../hooks/useSOS';
import { AlertTriangle, MapPin, Clock, Radio } from 'lucide-react';

export default function NotificationBanner() {
  const { activeEvent } = useSOS();

  if (!activeEvent) return null;

  const getTimeSince = (timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp.toDate?.().getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getTypeEmoji = (type) => {
    switch (type) {
      case 'fire': return '🔥';
      case 'medical': return '🏥';
      case 'violence': return '⚔️';
      default: return '❓';
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'not_resolved': return { label: 'NOT RESOLVED', color: 'bg-red-500' };
      case 'on_rescue': return { label: 'ON RESCUE', color: 'bg-orange-500' };
      case 'resolved': return { label: 'RESOLVED', color: 'bg-green-500' };
      default: return { label: 'UNKNOWN', color: 'bg-gray-500' };
    }
  };

  const statusInfo = getStatusInfo(activeEvent.status);

  return (
    <div className="animate-slide-down">
      <div className="bg-gradient-to-r from-red-900/90 to-red-800/90 backdrop-blur-lg border-b border-red-500/30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AlertTriangle className="w-5 h-5 text-red-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                🚨 {getTypeEmoji(activeEvent.type)} {activeEvent.type?.toUpperCase()} EMERGENCY
              </p>
              <p className="text-red-200/70 text-xs flex items-center gap-2">
                <span>By {activeEvent.triggeredByName}</span>
                <span>•</span>
                <Clock className="w-3 h-3 inline" /> {getTimeSince(activeEvent.timestamp)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-bold text-white`}>
              {statusInfo.label}
            </span>
            <button
              onClick={() => document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white font-medium transition-all"
            >
              <MapPin className="w-3 h-3" /> View Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
