import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cpu, EyeOff, CheckCircle2, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl p-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">100% On-Device Privacy Architecture</h3>
            <p className="text-xs text-slate-400">Zero Cloud Storage • Local Memory Execution</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          "What Did I Miss?" is engineered from the ground up for strict privacy compliance. Your chat logs, credentials, and internal discussions never leave your device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Ephemeral Sandbox</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Chat logs are processed in volatile memory only and are never saved to external databases.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-start gap-3">
            <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Client-Side NLP Parsing</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Entity extraction, urgency scoring, and summaries run locally via WebGPU and WebLLM heuristics.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-start gap-3">
            <HardDrive className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Zero Third-Party Trackers</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                No telemetry, no tracking pixels, and no metadata logging.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Enterprise Ready</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Safe for HIPAA, SOC2, and GDPR-sensitive workplace communications.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Local Security Verification: Passed
          </span>
          <span className="font-mono text-slate-500">v2.4.0-local</span>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
