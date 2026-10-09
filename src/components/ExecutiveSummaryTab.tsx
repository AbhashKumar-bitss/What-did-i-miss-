import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Share2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { SummaryResult } from '../types';

interface ExecutiveSummaryTabProps {
  summary: SummaryResult | null;
  onCopySummary: () => void;
  copied: boolean;
  onNavigateToTab: (tabId: string) => void;
}

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({
  summary,
  onCopySummary,
  copied,
  onNavigateToTab,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = `${summary?.executiveSummary || ''}. Key highlights: ${
        summary?.bulletHighlights.join('. ') || ''
      }`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!summary) {
    return (
      <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl">
        <Sparkles className="w-8 h-8 mx-auto text-indigo-400 mb-2 animate-spin" />
        <p className="text-sm font-medium">Synthesizing executive brief...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Executive TL;DR Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Executive TL;DR Brief
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {summary.isLocal ? '100% On-Device' : 'Gemini Cloud'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Generated at {summary.generatedAt} • {summary.sourceMessageCount} messages digested
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeak}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title={isSpeaking ? 'Stop Audio Read-Aloud' : 'Read Aloud via Web Speech Audio'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Pause Voice' : 'Listen Brief'}</span>
            </button>

            <button
              onClick={onCopySummary}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* The Briefing Text */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5 relative">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {summary.executiveSummary}
          </p>

          {isSpeaking && (
            <div className="mt-3 flex items-center gap-2 text-xs text-sky-400">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Voice read-aloud active...</span>
            </div>
          )}
        </div>

        {/* Bullet Highlights */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Key High-Impact Highlights
          </h4>
          <div className="space-y-2.5">
            {summary.bulletHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 text-xs sm:text-sm text-slate-200 flex items-start gap-3 transition"
              >
                <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="leading-snug">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              {summary.isLocal ? 'Zero Cloud Footprint' : 'Encrypted Pipeline'}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Processed in {summary.processingTimeMs}ms
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">
              Model: {summary.modelUsed}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Jump Callout Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigateToTab('actions')}
          className="p-3 rounded-xl glass-panel hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between text-left transition cursor-pointer group"
        >
          <div>
            <p className="text-xs text-slate-400">Pending Tasks</p>
            <p className="text-sm font-bold text-white mt-0.5 group-hover:text-indigo-400 transition">
              {summary.actionItems.length} Action Items
            </p>
          </div>
          <span className="text-xs text-indigo-400">View →</span>
        </button>

        <button
          onClick={() => onNavigateToTab('decisions')}
          className="p-3 rounded-xl glass-panel hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between text-left transition cursor-pointer group"
        >
          <div>
            <p className="text-xs text-slate-400">Team Consensus</p>
            <p className="text-sm font-bold text-white mt-0.5 group-hover:text-sky-400 transition">
              {summary.decisions.length} Decisions Logged
            </p>
          </div>
          <span className="text-xs text-sky-400">View →</span>
        </button>

        <button
          onClick={() => onNavigateToTab('mentions')}
          className="p-3 rounded-xl glass-panel hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between text-left transition cursor-pointer group"
        >
          <div>
            <p className="text-xs text-slate-400">Urgent Mentions</p>
            <p className="text-sm font-bold text-rose-300 mt-0.5 group-hover:text-rose-200 transition">
              {summary.urgentAlerts.length} Direct Alerts
            </p>
          </div>
          <span className="text-xs text-rose-400">Reply →</span>
        </button>
      </div>
    </div>
  );
};
