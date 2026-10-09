import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  FileText,
  Compass,
  MessageSquare,
  FileCode,
  ShieldCheck,
  Check,
  Bell,
  BellRing,
  Volume2,
} from 'lucide-react';
import {
  ChatMessage,
  Platform,
  Priority,
  PlatformStatus,
  SummaryResult,
  FocusMode,
  SummaryLength,
  ActionItem,
  TaskAlarm,
} from './types';
import { PRESETS } from './data/presets';
import { analyzeUnreadMessages } from './services/aiService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewCards } from './components/OverviewCards';
import { ExecutiveSummaryTab } from './components/ExecutiveSummaryTab';
import { UrgencyFeedTab } from './components/UrgencyFeedTab';
import { ActionItemsTab } from './components/ActionItemsTab';
import { DecisionsTab } from './components/DecisionsTab';
import { MentionsAlertsTab } from './components/MentionsAlertsTab';
import { RawChatInspectorTab } from './components/RawChatInspectorTab';
import { PrivacyModal } from './components/PrivacyModal';
import { AlarmRingingModal } from './components/AlarmRingingModal';
import { startAlarmRinging, stopAlarmRinging } from './utils/alarmAudio';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Active Preset & Messages
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-engineering');
  const [messages, setMessages] = useState<ChatMessage[]>(PRESETS[0].messages);

  // Platform Statuses
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([
    { platform: 'slack', connected: true, syncing: false, unreadCount: 14, lastSynced: 'Just now' },
    { platform: 'telegram', connected: true, syncing: false, unreadCount: 8, lastSynced: 'Just now' },
    { platform: 'whatsapp', connected: true, syncing: false, unreadCount: 5, lastSynced: 'Just now' },
    { platform: 'discord', connected: true, syncing: false, unreadCount: 9, lastSynced: 'Just now' },
  ]);

  // AI Controls
  const [selectedModel, setSelectedModel] = useState<string>('Llama 3.2 8B (On-Device WebGPU)');
  const [focusMode, setFocusMode] = useState<FocusMode>('all-round');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('balanced');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Summarized Result State
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<{ stage: string; percent: number }>({
    stage: 'Idle',
    percent: 0,
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'tldr' | 'urgency' | 'actions' | 'decisions' | 'mentions' | 'raw'
  >('tldr');

  // Filters from Overview Cards
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');

  // Feedback Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);

  // Reminders & Active Alarm Ringing State
  const [activeAlarmTask, setActiveAlarmTask] = useState<ActionItem | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          showToast('Desktop push notifications enabled for alarms!');
        } else {
          showToast('Notifications denied. Web Audio alarms will still ring.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Run analysis function
  const triggerAnalysis = async (
    targetMessages = messages,
    promptToUse = customPrompt,
    modelToUse = selectedModel,
    modeToUse = focusMode,
    lengthToUse = summaryLength
  ) => {
    setIsAnalyzing(true);
    try {
      const { result, usedFallback, notice } = await analyzeUnreadMessages({
        messages: targetMessages,
        focusMode: modeToUse,
        summaryLength: lengthToUse,
        temperature,
        model: modelToUse,
        userPrompt: promptToUse,
      });

      setSummaryResult(result);
      if (notice) {
        showToast(notice);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Local processing completed with fallback engine');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial load
  useEffect(() => {
    triggerAnalysis(messages);
  }, []);

  // Real-time alarm monitor loop (checks every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!summaryResult?.actionItems) return;
      const now = Date.now();

      summaryResult.actionItems.forEach((item) => {
        if (!item.done && item.alarm?.enabled && !item.alarm?.triggered) {
          const remindOffset = (item.alarm.remindMinutesBefore || 0) * 60000;
          const targetTime = item.alarm.targetTimestamp - remindOffset;

          if (now >= targetTime) {
            // Trigger alarm!
            item.alarm.triggered = true;
            setActiveAlarmTask(item);

            // Ring sound
            startAlarmRinging(item.alarm.sound || 'digital', item.task);

            // Trigger browser notification
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification(`⏰ Alarm: ${item.task}`, {
                body: `Assigned: ${item.assignee} | Due: ${item.deadline}`,
                icon: '/vite.svg',
              });
            }

            // Update state so triggered flag persists
            setSummaryResult((prev) =>
              prev
                ? {
                    ...prev,
                    actionItems: [...prev.actionItems],
                  }
                : null
            );
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [summaryResult]);

  // Test Alarm action
  const handleTestAlarm = () => {
    const testTask: ActionItem = {
      id: 'test-alarm-task',
      task: 'Review hotfix rollback branch PR #419 connection pool',
      assignee: '@You',
      deadline: 'Immediate (ASAP)',
      platform: 'slack',
      priority: 'high',
      done: false,
      channel: '#engineering',
      alarm: {
        enabled: true,
        targetTimestamp: Date.now(),
        timeFormatted: 'Now',
        sound: 'digital',
        remindMinutesBefore: 0,
        triggered: true,
        alarmId: 'test-alarm',
      },
    };

    setActiveAlarmTask(testTask);
    startAlarmRinging('digital', testTask.task);
    showToast('Alarm ringing! You can test snooze, complete, or dismiss.');
  };

  const handleDismissAlarm = () => {
    stopAlarmRinging();
    setActiveAlarmTask(null);
  };

  const handleSnoozeAlarm = (task: ActionItem, minutes: number) => {
    stopAlarmRinging();
    const newTimestamp = Date.now() + minutes * 60000;
    const formatted = new Date(newTimestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (summaryResult) {
      const updated = summaryResult.actionItems.map((item) => {
        if (item.id === task.id && item.alarm) {
          return {
            ...item,
            alarm: {
              ...item.alarm,
              targetTimestamp: newTimestamp,
              timeFormatted: formatted,
              triggered: false,
            },
          };
        }
        return item;
      });
      setSummaryResult({
        ...summaryResult,
        actionItems: updated,
      });
    }

    setActiveAlarmTask(null);
    showToast(`Alarm snoozed for ${minutes} minutes (rings at ${formatted})`);
  };

  const handleCompleteAlarmTask = (taskId: string) => {
    stopAlarmRinging();
    setActiveAlarmTask(null);
    handleToggleActionDone(taskId);
    showToast('Task marked done & alarm cleared');
  };

  // Preset switch
  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setSelectedPresetId(presetId);
    setMessages(found.messages);

    setPlatformStatuses((prev) =>
      prev.map((ps) => {
        const count = found.messages.filter((m) => m.platform === ps.platform).length;
        return {
          ...ps,
          unreadCount: count > 0 ? count * 4 : 2,
        };
      })
    );

    triggerAnalysis(found.messages);
    showToast(`Loaded preset: ${found.title}`);
  };

  // Toggle platform connection
  const handleTogglePlatform = (platform: Platform) => {
    setPlatformStatuses((prev) =>
      prev.map((ps) => (ps.platform === platform ? { ...ps, connected: !ps.connected } : ps))
    );
  };

  // Sync specific platform
  const handleSyncPlatform = (platform: Platform) => {
    setPlatformStatuses((prev) =>
      prev.map((ps) => (ps.platform === platform ? { ...ps, syncing: true } : ps))
    );

    setTimeout(() => {
      setPlatformStatuses((prev) =>
        prev.map((ps) =>
          ps.platform === platform
            ? { ...ps, syncing: false, lastSynced: 'Just now', unreadCount: Math.floor(Math.random() * 8) + 3 }
            : ps
        )
      );
      showToast(`Synced ${platform.toUpperCase()} in local buffer`);
    }, 1200);
  };

  // Fetch all unread with realistic animation
  const handleFetchAllUnread = () => {
    setIsFetching(true);
    setFetchProgress({ stage: 'Connecting to local secure sockets...', percent: 15 });

    setTimeout(() => {
      setFetchProgress({ stage: 'Reading unread threads across Slack & Discord...', percent: 45 });
    }, 450);

    setTimeout(() => {
      setFetchProgress({ stage: 'Sanitizing logs & tokenizing in local memory...', percent: 75 });
    }, 900);

    setTimeout(() => {
      setFetchProgress({ stage: 'Generating executive summaries and alerts...', percent: 95 });
    }, 1300);

    setTimeout(() => {
      setIsFetching(false);
      setFetchProgress({ stage: 'Complete', percent: 100 });

      const updatedMessages = messages.map((m) => ({
        ...m,
        timestamp: 'Just now',
      }));
      setMessages(updatedMessages);
      triggerAnalysis(updatedMessages);
      showToast('Successfully fetched all unread messages');
    }, 1650);
  };

  // Custom chat log drop / upload
  const handleCustomLogUpload = (content: string, filename: string) => {
    try {
      if (filename.endsWith('.json')) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const formatted: ChatMessage[] = parsed.map((item, idx) => ({
            id: item.id || `uploaded-${idx}`,
            platform: item.platform || 'slack',
            sender: item.sender || 'Participant',
            channel: item.channel || '#imported-log',
            text: item.text || item.message || JSON.stringify(item),
            timestamp: item.timestamp || 'Imported',
            isDirectMention:
              !!item.isDirectMention ||
              (item.text || '').includes('@you') ||
              (item.text || '').includes('@You'),
            priority: item.priority || 'medium',
          }));
          setMessages(formatted);
          triggerAnalysis(formatted);
          showToast(`Imported ${formatted.length} messages from ${filename}`);
          return;
        }
      }

      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const formatted: ChatMessage[] = lines.slice(0, 30).map((line, idx) => {
        const isMention = line.includes('@') || line.toLowerCase().includes('you');
        const isUrgent = line.toLowerCase().includes('urgent') || line.toLowerCase().includes('asap');
        return {
          id: `custom-txt-${idx}`,
          platform: (['slack', 'telegram', 'whatsapp', 'discord'] as Platform[])[idx % 4],
          sender: `User_${idx + 1}`,
          channel: '#custom-log',
          text: line,
          timestamp: 'Imported',
          isDirectMention: isMention,
          priority: isUrgent ? 'high' : isMention ? 'medium' : 'low',
        };
      });

      setMessages(formatted);
      triggerAnalysis(formatted);
      showToast(`Imported ${formatted.length} lines from ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to parse file. Please upload standard .txt or .json');
    }
  };

  // Action item callbacks
  const handleToggleActionDone = (id: string) => {
    if (!summaryResult) return;
    const updated = summaryResult.actionItems.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setSummaryResult({
      ...summaryResult,
      actionItems: updated,
    });
  };

  const handleAddActionTask = (task: Omit<ActionItem, 'id' | 'done'>) => {
    if (!summaryResult) return;
    const newItem: ActionItem = {
      ...task,
      id: `manual-act-${Date.now()}`,
      done: false,
    };
    setSummaryResult({
      ...summaryResult,
      actionItems: [newItem, ...summaryResult.actionItems],
    });
    showToast('Action item and alarm scheduled');
  };

  const handleDeleteActionTask = (id: string) => {
    if (!summaryResult) return;
    setSummaryResult({
      ...summaryResult,
      actionItems: summaryResult.actionItems.filter((i) => i.id !== id),
    });
    showToast('Action item removed');
  };

  const handleUpdateAlarm = (
    taskId: string,
    alarm: TaskAlarm | undefined,
    newDeadlineIso?: string
  ) => {
    if (!summaryResult) return;
    const updated = summaryResult.actionItems.map((item) => {
      if (item.id === taskId) {
        let newDeadline = item.deadline;
        let newTimestamp = item.deadlineTimestamp;

        if (newDeadlineIso) {
          const date = new Date(newDeadlineIso);
          newTimestamp = date.getTime();
          newDeadline = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric',
          });
        }

        return {
          ...item,
          deadline: newDeadline,
          deadlineIso: newDeadlineIso || item.deadlineIso,
          deadlineTimestamp: newTimestamp,
          alarm,
        };
      }
      return item;
    });

    setSummaryResult({
      ...summaryResult,
      actionItems: updated,
    });

    showToast(alarm ? 'Alarm and reminder updated!' : 'Alarm disabled for task');
  };

  // Add raw message
  const handleAddRawMessage = (newMsg: ChatMessage) => {
    const updated = [newMsg, ...messages];
    setMessages(updated);
    triggerAnalysis(updated);
    showToast('Simulated incoming message received');
  };

  // Quick reply dispatch
  const handleSendReply = (recipient: string, reply: string, platform: string) => {
    showToast(`Dispatched reply to ${recipient} via ${platform.toUpperCase()}`);
  };

  // Copy Briefing to Clipboard
  const handleCopyBrief = () => {
    if (!summaryResult) return;
    const text =
      `WHAT DID I MISS? — EXECUTIVE DIGEST (${summaryResult.generatedAt})\n\n` +
      `Summary: ${summaryResult.executiveSummary}\n\n` +
      `Key Highlights:\n${summaryResult.bulletHighlights.map((h) => `• ${h}`).join('\n')}\n\n` +
      `Pending Action Items:\n${summaryResult.actionItems
        .map(
          (a) =>
            `[${a.done ? 'x' : ' '}] ${a.task} (@${a.assignee}, Due: ${a.deadline}, Alarm: ${
              a.alarm?.enabled ? 'ON' : 'OFF'
            })`
        )
        .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    showToast('Copied executive briefing to clipboard');
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  // Export Markdown (.md)
  const handleExportMarkdown = () => {
    if (!summaryResult) return;
    const md = `# What Did I Miss? — Unread Executive Digest
Generated: ${summaryResult.generatedAt}
Model: ${summaryResult.modelUsed} (${summaryResult.isLocal ? '100% On-Device' : 'Cloud'})
Messages Processed: ${summaryResult.sourceMessageCount}

## 📋 Executive TL;DR
${summaryResult.executiveSummary}

## ⚡ High-Impact Highlights
${summaryResult.bulletHighlights.map((h) => `- ${h}`).join('\n')}

## ✅ Action Items & Alarms
${summaryResult.actionItems
  .map(
    (a) =>
      `- [${a.done ? 'x' : ' '}] **${a.task}** (Assignee: ${a.assignee} | Due: ${a.deadline} | Alarm: ${
        a.alarm?.enabled ? 'Active 🔔' : 'None'
      } | Origin: ${a.platform})`
  )
  .join('\n')}

## 🤝 Team Consensus & Decisions
${summaryResult.decisions
  .map(
    (d) =>
      `### ${d.title}\n- **Detail:** ${d.detail}\n- **Channel:** ${d.channel} (${d.platform})\n- **Agreed by:** ${d.agreedBy.join(
        ', '
      )}`
  )
  .join('\n\n')}

## 🚨 Urgent Alerts & Mentions
${summaryResult.urgentAlerts
  .map((u) => `- **[${u.severity.toUpperCase()}] ${u.sender}** (${u.channel}): ${u.message}`)
  .join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unread-digest-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    showToast('Downloaded unread-digest.md');
  };

  // Export JSON (.json)
  const handleExportJson = () => {
    if (!summaryResult) return;
    const jsonStr = JSON.stringify(
      {
        summary: summaryResult,
        rawMessages: messages,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unread-digest-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    showToast('Downloaded digest.json');
  };

  // Stats calculation
  const totalUnread = messages.length;
  const mentionsCount = messages.filter((m) => m.isDirectMention).length;
  const channelChatterCount = totalUnread - mentionsCount;
  const highCount = messages.filter((m) => m.priority === 'high').length;
  const mediumCount = messages.filter((m) => m.priority === 'medium').length;
  const lowCount = messages.filter((m) => m.priority === 'low').length;
  const activeAlarmsCount =
    summaryResult?.actionItems.filter((a) => !a.done && a.alarm?.enabled && !a.alarm?.triggered)
      .length || 0;

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900 light'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-2xl animate-fadeIn">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        openPrivacyModal={() => setIsPrivacyModalOpen(true)}
        presets={PRESETS}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        platformStatuses={platformStatuses}
        onFetchUnread={handleFetchAllUnread}
        isFetching={isFetching}
        totalUnread={totalUnread}
      />

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Sidebar Controls */}
          <Sidebar
            platformStatuses={platformStatuses}
            onTogglePlatform={handleTogglePlatform}
            onSyncPlatform={handleSyncPlatform}
            onFetchAllUnread={handleFetchAllUnread}
            isFetching={isFetching}
            fetchProgress={fetchProgress}
            presets={PRESETS}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
            onCustomLogUpload={handleCustomLogUpload}
            selectedModel={selectedModel}
            onChangeModel={(m) => {
              setSelectedModel(m);
              triggerAnalysis(messages, customPrompt, m);
              showToast(`Switched inference to ${m}`);
            }}
            focusMode={focusMode}
            onChangeFocusMode={(f) => {
              setFocusMode(f);
              triggerAnalysis(messages, customPrompt, selectedModel, f);
            }}
            summaryLength={summaryLength}
            onChangeSummaryLength={(l) => {
              setSummaryLength(l);
              triggerAnalysis(messages, customPrompt, selectedModel, focusMode, l);
            }}
            temperature={temperature}
            onChangeTemperature={setTemperature}
            customPrompt={customPrompt}
            onChangeCustomPrompt={setCustomPrompt}
            onReanalyze={() =>
              triggerAnalysis(messages, customPrompt, selectedModel, focusMode, summaryLength)
            }
            isReanalyzing={isAnalyzing}
            openPrivacyModal={() => setIsPrivacyModalOpen(true)}
            onExportMarkdown={handleExportMarkdown}
            onExportJson={handleExportJson}
            onCopyBrief={handleCopyBrief}
            copiedBrief={copiedBrief}
          />

          {/* Right: Dashboard Overview & Tabs */}
          <div className="flex-1 w-full min-w-0 space-y-5">
            {/* 1. Overview Counters Cards */}
            <OverviewCards
              totalUnread={totalUnread}
              mentionsCount={mentionsCount}
              channelChatterCount={channelChatterCount}
              highCount={highCount}
              mediumCount={mediumCount}
              lowCount={lowCount}
              platformStatuses={platformStatuses}
              onSelectPriorityFilter={(p) => {
                setPriorityFilter(p);
                if (p !== 'all') {
                  setActiveTab('urgency');
                }
              }}
              activePriorityFilter={priorityFilter}
              onSelectPlatformFilter={(pl) => {
                setPlatformFilter(pl);
                if (pl !== 'all') {
                  setActiveTab('urgency');
                }
              }}
              activePlatformFilter={platformFilter}
            />

            {/* 2. Dynamic Navigation Tabs with Alarm Counter */}
            <div className="glass-panel p-1.5 rounded-2xl border border-slate-800/80 flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'tldr', label: 'Executive TL;DR', icon: Sparkles, count: undefined },
                { id: 'urgency', label: 'Priority Urgency Feed', icon: AlertCircle, count: highCount },
                {
                  id: 'actions',
                  label: 'Tasks & Alarms',
                  icon: ListTodo,
                  count: summaryResult?.actionItems.length,
                  badge: activeAlarmsCount > 0 ? `${activeAlarmsCount} 🔔` : undefined,
                },
                {
                  id: 'decisions',
                  label: 'Decisions Log',
                  icon: Compass,
                  count: summaryResult?.decisions.length,
                },
                {
                  id: 'mentions',
                  label: 'Direct Mentions',
                  icon: MessageSquare,
                  count: mentionsCount,
                },
                { id: 'raw', label: 'Raw Log Inspector', icon: FileCode, count: messages.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                        {tab.badge}
                      </span>
                    )}
                    {typeof tab.count === 'number' && tab.count > 0 && !tab.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          isActive ? 'bg-indigo-900/60 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 3. Active Tab Content Views */}
            <div className="transition-all duration-200">
              {activeTab === 'tldr' && (
                <ExecutiveSummaryTab
                  summary={summaryResult}
                  onCopySummary={handleCopyBrief}
                  copied={copiedBrief}
                  onNavigateToTab={(tabId) => setActiveTab(tabId as any)}
                />
              )}

              {activeTab === 'urgency' && (
                <UrgencyFeedTab
                  messages={messages}
                  initialPriorityFilter={priorityFilter}
                  initialPlatformFilter={platformFilter}
                  onQuickReply={(msg) => {
                    setActiveTab('mentions');
                  }}
                />
              )}

              {activeTab === 'actions' && (
                <ActionItemsTab
                  actionItems={summaryResult?.actionItems || []}
                  onToggleDone={handleToggleActionDone}
                  onAddTask={handleAddActionTask}
                  onDeleteTask={handleDeleteActionTask}
                  onUpdateAlarm={handleUpdateAlarm}
                  onTestAlarm={handleTestAlarm}
                  notificationPermission={notificationPermission}
                  onRequestNotificationPermission={handleRequestNotificationPermission}
                />
              )}

              {activeTab === 'decisions' && (
                <DecisionsTab decisions={summaryResult?.decisions || []} />
              )}

              {activeTab === 'mentions' && (
                <MentionsAlertsTab
                  urgentAlerts={summaryResult?.urgentAlerts || []}
                  messages={messages}
                  onSendReply={handleSendReply}
                />
              )}

              {activeTab === 'raw' && (
                <RawChatInspectorTab messages={messages} onAddMessage={handleAddRawMessage} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Privacy Guarantee Modal */}
      <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />

      {/* Real-Time Alarm Ringing Modal */}
      <AlarmRingingModal
        activeAlarmTask={activeAlarmTask}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
        onCompleteTask={handleCompleteAlarmTask}
      />
    </div>
  );
}
