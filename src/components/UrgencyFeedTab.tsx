import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  Filter,
  AtSign,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { ChatMessage, Priority, Platform } from '../types';
import { PlatformIcon, getPlatformBadgeStyle } from './PlatformIcons';

interface UrgencyFeedTabProps {
  messages: ChatMessage[];
  initialPriorityFilter?: Priority | 'all';
  initialPlatformFilter?: Platform | 'all';
  onQuickReply: (message: ChatMessage) => void;
}

export const UrgencyFeedTab: React.FC<UrgencyFeedTabProps> = ({
  messages,
  initialPriorityFilter = 'all',
  initialPlatformFilter = 'all',
  onQuickReply,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>(initialPriorityFilter);
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>(initialPlatformFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const filteredMessages = messages.filter(msg => {
    if (dismissedIds.has(msg.id)) return false;
    if (priorityFilter !== 'all' && msg.priority !== priorityFilter) return false;
    if (platformFilter !== 'all' && msg.platform !== platformFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = msg.text.toLowerCase().includes(q);
      const matchSender = msg.sender.toLowerCase().includes(q);
      const matchChannel = msg.channel.toLowerCase().includes(q);
      if (!matchText && !matchSender && !matchChannel) return false;
    }
    return true;
  });

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          indicator: 'bg-rose-500',
          label: 'High / Blocker',
          icon: AlertCircle,
        };
      case 'medium':
        return {
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          indicator: 'bg-amber-400',
          label: 'Medium Attention',
          icon: AlertTriangle,
        };
      case 'low':
        return {
          badge: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
          indicator: 'bg-slate-400',
          label: 'Low / FYI',
          icon: Info,
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search urgent messages, senders, channels..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Priority:
          </span>
          {(['all', 'high', 'medium', 'low'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition cursor-pointer ${
                priorityFilter === p
                  ? p === 'high'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                    : p === 'medium'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                    : 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Platform Filter dropdown */}
        <div className="flex items-center gap-1 text-xs">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Platforms</option>
            <option value="slack">Slack</option>
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="discord">Discord</option>
          </select>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-slate-200">No matching unread messages</p>
            <p className="text-xs text-slate-400 mt-1">All caught up or filtered out!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const pStyle = getPriorityStyle(msg.priority);
            const IconComponent = pStyle.icon;
            const platformBadge = getPlatformBadgeStyle(msg.platform);

            return (
              <div
                key={msg.id}
                className="glass-panel p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 shadow-md transition space-y-2.5"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800/80">
                      <PlatformIcon platform={msg.platform} size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{msg.sender}</span>
                        <span className="text-[11px] font-mono text-slate-400">in {msg.channel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority & Platform tags */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${pStyle.badge}`}
                    >
                      <IconComponent className="w-3 h-3" />
                      {pStyle.label}
                    </span>

                    {msg.isDirectMention && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        <AtSign className="w-3 h-3" /> @You
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {msg.text}
                </div>

                {/* Footer action buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    {msg.extractedDeadline && (
                      <span className="text-[11px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        Deadline: {msg.extractedDeadline}
                      </span>
                    )}
                    {msg.extractedAssignee && (
                      <span className="text-[11px] font-mono text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        Assignee: {msg.extractedAssignee}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDismiss(msg.id)}
                      className="px-2.5 py-1 text-slate-400 hover:text-slate-200 text-xs rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => onQuickReply(msg)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-600/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Quick Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
