import React, { useState } from 'react';
import {
  AtSign,
  AlertOctagon,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UrgentAlert, ChatMessage } from '../types';
import { PlatformIcon } from './PlatformIcons';

interface MentionsAlertsTabProps {
  urgentAlerts: UrgentAlert[];
  messages: ChatMessage[];
  onSendReply: (recipient: string, message: string, platform: string) => void;
}

export const MentionsAlertsTab: React.FC<MentionsAlertsTabProps> = ({
  urgentAlerts,
  messages,
  onSendReply,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<UrgentAlert | null>(
    urgentAlerts.length > 0 ? urgentAlerts[0] : null
  );
  const [replyText, setReplyText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const cannedReplies = [
    'On it right now! Will report back in 15 minutes.',
    'Approved. Please proceed with the rollout.',
    'Reviewed and looks solid. Green light from me.',
    'Checking into the root cause now, hold off on deploy.',
    'In a sync until 11:30 AM, will review immediately after.',
  ];

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim() || !selectedAlert) return;
    onSendReply(selectedAlert.sender, textToSend, selectedAlert.platform);
    setSentSuccess(true);
    setReplyText('');
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Direct Mentions & Urgent Alerts
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                {urgentAlerts.length} Requiring Attention
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Questions directed at you, blocking requests, and P0 escalation alerts
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Alerts List (Left Column) */}
        <div className="lg:col-span-7 space-y-3">
          {urgentAlerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-slate-200">No urgent mentions pending</p>
              <p className="text-xs text-slate-400 mt-1">
                You are completely caught up with no direct questions waiting for you!
              </p>
            </div>
          ) : (
            urgentAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`glass-panel p-4 rounded-2xl border transition cursor-pointer relative ${
                  selectedAlert?.id === alert.id
                    ? 'border-indigo-500 bg-slate-900 shadow-lg ring-1 ring-indigo-500/40'
                    : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800">
                      <PlatformIcon platform={alert.platform} size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">{alert.sender}</span>
                      <span className="text-[11px] font-mono text-slate-400 ml-1.5">
                        in {alert.channel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {alert.isDirectMention && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <AtSign className="w-3 h-3" /> @You
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{alert.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-1">
                  {alert.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Quick Reply Drawer / Card (Right Column) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 sticky top-24 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Instant Quick Reply
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Draft & dispatch without context switching
                  </p>
                </div>
              </div>
            </div>

            {selectedAlert ? (
              <div className="space-y-3 text-xs">
                {/* Target Message Recap */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      Replying to {selectedAlert.sender}
                    </span>
                    <span className="capitalize font-mono">{selectedAlert.platform}</span>
                  </div>
                  <p className="text-slate-300 line-clamp-2 italic text-[11px]">
                    "{selectedAlert.message}"
                  </p>
                </div>

                {/* Sent feedback banner */}
                {sentSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dispatched reply to {selectedAlert.platform} channel!</span>
                  </div>
                )}

                {/* Canned 1-Click Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    1-Click Smart Replies
                  </span>
                  <div className="space-y-1.5">
                    {cannedReplies.map((canned, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(canned)}
                        className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center justify-between group cursor-pointer"
                      >
                        <span className="line-clamp-1">{canned}</span>
                        <Send className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom text response */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Custom Response
                  </label>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type your reply to ${selectedAlert.sender}...`}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  <button
                    onClick={() => handleSend(replyText)}
                    disabled={!replyText.trim()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply via {selectedAlert.platform}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">Select any alert from the left to dispatch a reply.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
