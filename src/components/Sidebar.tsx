import React, { useState, useRef } from 'react';
import {
  RefreshCw,
  Upload,
  Download,
  Sliders,
  Sparkles,
  ShieldCheck,
  Check,
  FileText,
  Search,
  Zap,
} from 'lucide-react';
import {
  Platform,
  PlatformStatus,
  FocusMode,
  SummaryLength,
  PresetData,
} from '../types';
import { PlatformIcon } from './PlatformIcons';

interface SidebarProps {
  platformStatuses: PlatformStatus[];
  onTogglePlatform: (platform: Platform) => void;
  onSyncPlatform: (platform: Platform) => void;
  onFetchAllUnread: () => void;
  isFetching: boolean;
  fetchProgress: { stage: string; percent: number };
  presets: PresetData[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onCustomLogUpload: (content: string, filename: string) => void;

  // AI Controls
  selectedModel: string;
  onChangeModel: (model: string) => void;
  focusMode: FocusMode;
  onChangeFocusMode: (mode: FocusMode) => void;
  summaryLength: SummaryLength;
  onChangeSummaryLength: (len: SummaryLength) => void;
  temperature: number;
  onChangeTemperature: (temp: number) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  onReanalyze: () => void;
  isReanalyzing: boolean;
  openPrivacyModal: () => void;

  // Exports
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onCopyBrief: () => void;
  copiedBrief: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  platformStatuses,
  onTogglePlatform,
  onSyncPlatform,
  onFetchAllUnread,
  isFetching,
  fetchProgress,
  presets,
  selectedPresetId,
  onSelectPreset,
  onCustomLogUpload,
  selectedModel,
  onChangeModel,
  focusMode,
  onChangeFocusMode,
  summaryLength,
  onChangeSummaryLength,
  temperature,
  onChangeTemperature,
  customPrompt,
  onChangeCustomPrompt,
  onReanalyze,
  isReanalyzing,
  openPrivacyModal,
  onExportMarkdown,
  onExportJson,
  onCopyBrief,
  copiedBrief,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onCustomLogUpload(content, file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onCustomLogUpload(content, file.name);
    };
    reader.readAsText(file);
  };

  const modelsList = [
    { id: 'Llama 3.2 8B (On-Device WebGPU)', label: 'Llama 3.2 8B (Local WebGPU)', badge: 'Private' },
    { id: 'Gemini Nano (Chrome Built-in AI)', label: 'Gemini Nano (Chrome AI)', badge: 'On-Device' },
    { id: 'Mistral 7B Local (WebLLM)', label: 'Mistral 7B (WebLLM)', badge: 'Private' },
    { id: 'Gemini 3.8 Flash (Cloud Fast API)', label: 'Gemini 3.8 Flash (Live Cloud)', badge: 'Fast API' },
  ];

  return (
    <aside className="w-full lg:w-84 xl:w-92 shrink-0 space-y-4">
      {/* 1. Fetch & Platforms Hub Card */}
      <div className="glass-panel p-4 rounded-2xl space-y-4 shadow-xl border border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">Sync & Import Bar</h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            4 / 4 Live
          </span>
        </div>

        {/* Fetch Unread CTA with animated progress */}
        <div className="space-y-2">
          <button
            onClick={onFetchAllUnread}
            disabled={isFetching}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 disabled:opacity-70 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Fetching Unread...' : 'Fetch Unread Messages'}
          </button>

          {isFetching && (
            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-indigo-500/30 space-y-1.5 text-xs animate-fadeIn">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-300 font-medium">{fetchProgress.stage}</span>
                <span className="font-mono text-slate-400">{fetchProgress.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300 rounded-full"
                  style={{ width: `${fetchProgress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Platform Status List */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Connected Channels
          </p>
          <div className="space-y-1.5">
            {platformStatuses.map((st) => (
              <div
                key={st.platform}
                className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-slate-800/80">
                    <PlatformIcon platform={st.platform} size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 capitalize">
                        {st.platform}
                      </span>
                      {st.connected ? (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ) : (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {st.connected ? `${st.unreadCount} unread` : 'Disconnected'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSyncPlatform(st.platform)}
                    disabled={st.syncing || !st.connected}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition text-xs"
                    title={`Sync ${st.platform}`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${st.syncing ? 'animate-spin text-sky-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => onTogglePlatform(st.platform)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-md border transition cursor-pointer ${
                      st.connected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {st.connected ? 'Active' : 'Muted'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
            <span>Mock Presets</span>
            <span className="text-[10px] text-indigo-400 lowercase font-normal">instant demo</span>
          </label>
          <select
            value={selectedPresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.title}
              </option>
            ))}
          </select>
        </div>

        {/* Dropzone / Upload Log */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-3 rounded-xl border border-dashed transition cursor-pointer text-center ${
            dragOver
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.json,.log,.csv"
            className="hidden"
          />
          <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
          <p className="text-xs font-medium text-slate-300">
            Drop or click to upload chat log
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Accepts .txt, .json, or exported logs
          </p>
        </div>
      </div>

      {/* 2. Local-First AI Engine Card */}
      <div className="glass-panel p-4 rounded-2xl space-y-4 shadow-xl border border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">Local-First AI Engine</h2>
          </div>
          <button
            onClick={openPrivacyModal}
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0% Cloud</span>
          </button>
        </div>

        {/* Privacy Assurance Badge */}
        <div
          onClick={openPrivacyModal}
          className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-300">100% On-Device / Zero Cloud Storage</p>
              <p className="text-[10px] text-slate-400">Tokens stay in client RAM • Fully offline</p>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Inference Engine
          </label>
          <div className="space-y-1">
            {modelsList.map((m) => (
              <button
                key={m.id}
                onClick={() => onChangeModel(m.id)}
                className={`w-full p-2 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition cursor-pointer ${
                  selectedModel === m.id
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedModel === m.id ? 'bg-indigo-400 ring-2 ring-indigo-400/30' : 'bg-slate-600'
                    }`}
                  />
                  <span>{m.label}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {m.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Mode Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            Focus Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'all-round', label: 'All-Round' },
              { id: 'action-items', label: 'Action Items' },
              { id: 'executive-brief', label: 'Exec Brief' },
              { id: 'deep-dive', label: 'Deep Dive' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => onChangeFocusMode(f.id as FocusMode)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition cursor-pointer text-center ${
                  focusMode === f.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Length & Temperature */}
        <div className="space-y-3 pt-1 border-t border-slate-800/60">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Summary Length
              </span>
              <span className="text-[10px] text-indigo-400 capitalize">{summaryLength}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['concise', 'balanced', 'comprehensive'] as SummaryLength[]).map((len) => (
                <button
                  key={len}
                  onClick={() => onChangeSummaryLength(len)}
                  className={`py-1 px-1.5 rounded-lg text-[11px] font-medium capitalize border transition ${
                    summaryLength === len
                      ? 'bg-slate-700/80 text-white border-indigo-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Creativity / Temp
              </span>
              <span className="font-mono text-[11px] text-slate-300">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => onChangeTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Strict / Factual (0.0)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>
        </div>

        {/* Custom Prompt & Re-analyze */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
            <span>Custom Focus Prompt</span>
            <Search className="w-3 h-3 text-slate-500" />
          </label>
          <div className="relative">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => onChangeCustomPrompt(e.target.value)}
              placeholder="e.g. Focus on PR reviews or blockers..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={onReanalyze}
            disabled={isReanalyzing}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isReanalyzing ? 'animate-spin' : ''}`} />
            {isReanalyzing ? 'Processing...' : 'Re-analyze with AI'}
          </button>
        </div>

        {/* Export / Download Buttons */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
          <button
            onClick={onCopyBrief}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            title="Copy TL;DR Briefing"
          >
            {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedBrief ? 'Copied!' : 'Copy TL;DR'}</span>
          </button>
          <button
            onClick={onExportMarkdown}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Export as Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onExportJson}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Export JSON payload"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
