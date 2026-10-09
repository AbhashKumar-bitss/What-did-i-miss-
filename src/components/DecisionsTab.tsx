import React from 'react';
import {
  FileCheck2,
  Users,
  Calendar,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { DecisionItem } from '../types';
import { PlatformIcon } from './PlatformIcons';

interface DecisionsTabProps {
  decisions: DecisionItem[];
}

export const DecisionsTab: React.FC<DecisionsTabProps> = ({ decisions }) => {
  return (
    <div className="space-y-4">
      {/* Overview header banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Decisions & Consensus Log
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                {decisions.length} Captured
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Cross-platform agreements, policy locks, and architecture decisions
            </p>
          </div>
        </div>
      </div>

      {/* Decisions List */}
      <div className="space-y-3">
        {decisions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl">
            <FileCheck2 className="w-8 h-8 mx-auto text-sky-400 mb-2" />
            <p className="text-sm font-semibold text-slate-200">No decisions recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">
              The AI will automatically log consensus statements like "agreed", "approved", or "decided".
            </p>
          </div>
        ) : (
          decisions.map((dec) => (
            <div
              key={dec.id}
              className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 shadow-lg space-y-3 transition"
            >
              {/* Top meta row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800/80">
                    <PlatformIcon platform={dec.platform} size={16} />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 font-mono">
                    {dec.channel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3" /> Consensus Reached
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {dec.timestamp}
                  </span>
                </div>
              </div>

              {/* Title & Core Decision */}
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>{dec.title}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 pl-3.5 leading-relaxed">
                  {dec.detail}
                </p>
              </div>

              {/* Participants and Context */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    Agreed by:
                  </span>
                  <div className="flex items-center gap-1">
                    {dec.agreedBy.map((person, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] font-medium"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Verified via {dec.platform}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
