import React from 'react';
import {
  ShieldCheck,
  Moon,
  Sun,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { PlatformStatus, PresetData } from '../types';
import { PlatformIcon } from './PlatformIcons';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  openPrivacyModal: () => void;
  presets: PresetData[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  platformStatuses: PlatformStatus[];
  onFetchUnread: () => void;
  isFetching: boolean;
  totalUnread: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  openPrivacyModal,
  presets,
  selectedPresetId,
  onSelectPreset,
  platformStatuses,
  onFetchUnread,
  isFetching,
  totalUnread,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="w-6 h-6 animate-pulse-slow" />
            {totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-sm ring-2 ring-slate-950 animate-bounce">
                {totalUnread}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                What Did I Miss?
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Unread AI Assistant
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Privacy-first executive digest across Slack, Telegram, WhatsApp & Discord
            </p>
          </div>
        </div>

        {/* Center: Quick Presets & Platform Sync Pills (hidden on mobile, responsive) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
            <span className="px-2 text-slate-400 flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5" /> Preset:
            </span>
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.messages.length} msgs)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Platform status indicators */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            {platformStatuses.map((st) => (
              <div
                key={st.platform}
                title={`${st.platform.toUpperCase()}: ${st.unreadCount} unread (${st.connected ? 'Connected' : 'Offline'})`}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition ${
                  st.connected ? 'opacity-100' : 'opacity-40 grayscale'
                }`}
              >
                <PlatformIcon platform={st.platform} size={14} />
                <span className="font-mono text-[11px] text-slate-300 font-semibold">
                  {st.unreadCount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Privacy Badge & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Privacy Badge */}
          <button
            onClick={openPrivacyModal}
            className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-semibold transition cursor-pointer shadow-sm hover:border-emerald-500/40"
            title="Click for zero-cloud privacy verification"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">100% On-Device</span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 px-1 py-0.2 bg-emerald-500/20 rounded">
              Zero Cloud
            </span>
          </button>

          {/* Quick Fetch Button */}
          <button
            onClick={onFetchUnread}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/60 text-white text-xs font-medium transition cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Fetch All</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
