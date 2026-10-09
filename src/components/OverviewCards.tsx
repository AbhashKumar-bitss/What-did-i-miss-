import React from 'react';
import {
  MessageSquare,
  AtSign,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import { PlatformStatus, Priority, Platform } from '../types';
import { PlatformIcon } from './PlatformIcons';

interface OverviewCardsProps {
  totalUnread: number;
  mentionsCount: number;
  channelChatterCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  platformStatuses: PlatformStatus[];
  onSelectPriorityFilter: (priority: Priority | 'all') => void;
  activePriorityFilter: Priority | 'all';
  onSelectPlatformFilter: (platform: Platform | 'all') => void;
  activePlatformFilter: Platform | 'all';
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  totalUnread,
  mentionsCount,
  channelChatterCount,
  highCount,
  mediumCount,
  lowCount,
  platformStatuses,
  onSelectPriorityFilter,
  activePriorityFilter,
  onSelectPlatformFilter,
  activePlatformFilter,
}) => {
  // Estimated reading time calculation (avg 1.5 min per chat thread reading vs 45 sec executive glance)
  const estimatedReadingMinutes = Math.max(1, Math.round(totalUnread * 1.4));
  const mentionPercentage = totalUnread > 0 ? Math.round((mentionsCount / totalUnread) * 100) : 0;
  const chatterPercentage = 100 - mentionPercentage;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {/* 1. Total Unread Across Platforms */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Total Unread Messages
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {totalUnread}
          </span>
          <span className="text-xs text-slate-400">across 4 platforms</span>
        </div>

        {/* Platform breakdown badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {platformStatuses.map((st) => (
            <button
              key={st.platform}
              onClick={() => onSelectPlatformFilter(activePlatformFilter === st.platform ? 'all' : st.platform)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border transition cursor-pointer ${
                activePlatformFilter === st.platform
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-900/80 hover:bg-slate-850 text-slate-300 border-slate-700/60'
              }`}
              title={`Filter by ${st.platform}`}
            >
              <PlatformIcon platform={st.platform} size={12} />
              <span>{st.unreadCount}</span>
            </button>
          ))}
          {activePlatformFilter !== 'all' && (
            <button
              onClick={() => onSelectPlatformFilter('all')}
              className="text-[10px] text-indigo-400 hover:underline px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 2. Direct Mentions vs Channel Chatter */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Mentions vs Chatter
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <AtSign className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-extrabold text-purple-300">
              {mentionsCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">Direct @You</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {channelChatterCount} Chatter
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${mentionPercentage}%` }}
            title={`Direct Mentions: ${mentionPercentage}%`}
          />
          <div
            className="h-full bg-slate-700/80 transition-all duration-500"
            style={{ width: `${chatterPercentage}%` }}
            title={`Channel Chatter: ${chatterPercentage}%`}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            {mentionPercentage}% Needs You
          </span>
          <span>{chatterPercentage}% Background</span>
        </div>
      </div>

      {/* 3. Urgency Breakdown */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
            Urgency Breakdown
            <Filter className="w-3 h-3 text-slate-500" />
          </span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 my-1">
          {/* High Urgency */}
          <button
            onClick={() => onSelectPriorityFilter(activePriorityFilter === 'high' ? 'all' : 'high')}
            className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
              activePriorityFilter === 'high'
                ? 'bg-rose-500/30 border-rose-400 text-white shadow-sm'
                : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
            }`}
          >
            <span className="block text-base font-bold font-mono">{highCount}</span>
            <span className="text-[10px] uppercase font-semibold">High / P0</span>
          </button>

          {/* Medium Urgency */}
          <button
            onClick={() => onSelectPriorityFilter(activePriorityFilter === 'medium' ? 'all' : 'medium')}
            className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
              activePriorityFilter === 'medium'
                ? 'bg-amber-500/30 border-amber-400 text-white shadow-sm'
                : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
            }`}
          >
            <span className="block text-base font-bold font-mono">{mediumCount}</span>
            <span className="text-[10px] uppercase font-semibold">Medium</span>
          </button>

          {/* Low Urgency */}
          <button
            onClick={() => onSelectPriorityFilter(activePriorityFilter === 'low' ? 'all' : 'low')}
            className={`p-1.5 rounded-xl border text-center transition cursor-pointer ${
              activePriorityFilter === 'low'
                ? 'bg-sky-500/30 border-sky-400 text-white shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className="block text-base font-bold font-mono">{lowCount}</span>
            <span className="text-[10px] uppercase font-semibold">Low / FYI</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 mt-2 text-center">
          {activePriorityFilter !== 'all' ? (
            <span className="text-indigo-400 font-semibold cursor-pointer" onClick={() => onSelectPriorityFilter('all')}>
              Showing {activePriorityFilter.toUpperCase()} only • Click to show all
            </span>
          ) : (
            'Click any badge to filter feed'
          )}
        </p>
      </div>

      {/* 4. Estimated Time Saved */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden bg-gradient-to-br from-indigo-950/40 to-slate-900/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Estimated Time Saved
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            ~{estimatedReadingMinutes}m
          </span>
          <span className="text-xs text-slate-400">manual reading saved</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mt-1">
          Digest synthesized in <span className="text-indigo-300 font-mono font-semibold">45 seconds</span> with zero context switching.
        </p>

        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>94% cognitive load reduction</span>
        </div>
      </div>
    </div>
  );
};
