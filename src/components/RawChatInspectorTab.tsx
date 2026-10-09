import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  MessageSquare,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, Platform } from '../types';
import { PlatformIcon } from './PlatformIcons';

interface RawChatInspectorTabProps {
  messages: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
}

export const RawChatInspectorTab: React.FC<RawChatInspectorTabProps> = ({
  messages,
  onAddMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New message form state
  const [newSender, setNewSender] = useState('');
  const [newChannel, setNewChannel] = useState('#general');
  const [newPlatform, setNewPlatform] = useState<Platform>('slack');
  const [newText, setNewText] = useState('');
  const [newIsMention, setNewIsMention] = useState(false);

  const filtered = messages.filter((m) => {
    if (platformFilter !== 'all' && m.platform !== platformFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.text.toLowerCase().includes(q) ||
        m.sender.toLowerCase().includes(q) ||
        m.channel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSender.trim() || !newText.trim()) return;

    onAddMessage({
      id: `custom-msg-${Date.now()}`,
      platform: newPlatform,
      sender: newSender.trim(),
      channel: newChannel.trim(),
      text: newText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDirectMention: newIsMention,
      priority: newIsMention ? 'high' : 'medium',
    });

    setNewSender('');
    setNewText('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search raw messages, timestamps, channels..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Platforms ({messages.length})</option>
            <option value="slack">Slack</option>
            <option value="telegram">Telegram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="discord">Discord</option>
          </select>

          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Incoming Msg</span>
          </button>
        </div>
      </div>

      {/* Add Message Form Modal / Inline */}
      {showAddModal && (
        <form
          onSubmit={handleCreate}
          className="glass-panel p-4 rounded-2xl border border-indigo-500/40 shadow-xl space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Simulate Live Inbound Chat Message
            </h4>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Sender Name</label>
              <input
                type="text"
                required
                placeholder="e.g. CTO Sarah"
                value={newSender}
                onChange={(e) => setNewSender(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Channel / Group</label>
              <input
                type="text"
                required
                placeholder="e.g. #security-ops"
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Platform</label>
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as Platform)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
              >
                <option value="slack">Slack</option>
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="discord">Discord</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Message Content</label>
            <textarea
              required
              rows={2}
              placeholder="@Alex can you verify the staging API key credentials before noon?"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsMention}
                onChange={(e) => setNewIsMention(e.target.checked)}
                className="rounded text-indigo-600 accent-indigo-500"
              />
              <span>Tag as Direct Mention (@You)</span>
            </label>

            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/20"
            >
              Inject Message
            </button>
          </div>
        </form>
      )}

      {/* Messages Feed */}
      <div className="space-y-2">
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 transition flex items-start gap-3 text-xs"
          >
            <div className="p-1.5 rounded-lg bg-slate-800 shrink-0 mt-0.5">
              <PlatformIcon platform={msg.platform} size={15} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">{msg.sender}</span>
                  <span className="text-[11px] font-mono text-slate-400">in {msg.channel}</span>
                </div>
                <div className="flex items-center gap-2">
                  {msg.isDirectMention && (
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-500/30">
                      @Mention
                    </span>
                  )}
                  <span className="font-mono text-slate-500 text-[11px]">{msg.timestamp}</span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
