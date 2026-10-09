import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  User,
  Plus,
  Copy,
  Check,
  CheckCircle2,
  Trash2,
  Bell,
  BellRing,
  ExternalLink,
  Download,
  Calendar,
  AlertCircle,
  Volume2,
  Play,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { ActionItem, Platform, Priority, TaskAlarm } from '../types';
import { PlatformIcon } from './PlatformIcons';
import {
  formatTimeRemaining,
  createGoogleCalendarUrl,
  downloadTaskIcs,
  parseDeadlineToTimestamp,
} from '../utils/deadlines';
import { TaskAlarmModal } from './TaskAlarmModal';

interface ActionItemsTabProps {
  actionItems: ActionItem[];
  onToggleDone: (id: string) => void;
  onAddTask: (task: Omit<ActionItem, 'id' | 'done'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateAlarm: (taskId: string, alarm: TaskAlarm | undefined, newDeadlineIso?: string) => void;
  onTestAlarm: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
}

export const ActionItemsTab: React.FC<ActionItemsTabProps> = ({
  actionItems,
  onToggleDone,
  onAddTask,
  onDeleteTask,
  onUpdateAlarm,
  onTestAlarm,
  notificationPermission,
  onRequestNotificationPermission,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'alarms' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'assignee'>('deadline');
  const [isAdding, setIsAdding] = useState(false);
  const [editingAlarmTask, setEditingAlarmTask] = useState<ActionItem | null>(null);

  // New task form state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('@You');
  const [newTaskDeadlineIso, setNewTaskDeadlineIso] = useState(
    new Date(Date.now() + 7200000).toISOString().slice(0, 16)
  );
  const [newTaskPlatform, setNewTaskPlatform] = useState<Platform>('slack');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('high');
  const [newTaskEnableAlarm, setNewTaskEnableAlarm] = useState(true);
  const [copied, setCopied] = useState(false);

  const completedCount = actionItems.filter((a) => a.done).length;
  const totalCount = actionItems.length;
  const activeAlarmsCount = actionItems.filter(
    (a) => !a.done && a.alarm?.enabled && !a.alarm?.triggered
  ).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter items
  const filteredItems = actionItems.filter((item) => {
    if (filter === 'pending') return !item.done;
    if (filter === 'completed') return item.done;
    if (filter === 'alarms') return !item.done && item.alarm?.enabled;
    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'deadline') {
      const timeA = a.deadlineTimestamp || 9999999999999;
      const timeB = b.deadlineTimestamp || 9999999999999;
      return timeA - timeB;
    }
    if (sortBy === 'priority') {
      const score = { high: 3, medium: 2, low: 1 };
      return score[b.priority] - score[a.priority];
    }
    if (sortBy === 'assignee') {
      return a.assignee.localeCompare(b.assignee);
    }
    return 0;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const targetDate = new Date(newTaskDeadlineIso);
    const timestamp = targetDate.getTime();
    const formatted = targetDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });

    const alarm: TaskAlarm | undefined = newTaskEnableAlarm
      ? {
          enabled: true,
          targetTimestamp: timestamp,
          timeFormatted: formatted,
          sound: newTaskPriority === 'high' ? 'digital' : 'chime',
          remindMinutesBefore: 0,
          triggered: false,
          alarmId: `alarm-${Date.now()}`,
        }
      : undefined;

    onAddTask({
      task: newTaskText.trim(),
      assignee: newTaskAssignee.trim() || '@You',
      deadline: formatted,
      deadlineIso: newTaskDeadlineIso,
      deadlineTimestamp: timestamp,
      platform: newTaskPlatform,
      priority: newTaskPriority,
      alarm,
    });

    setNewTaskText('');
    setIsAdding(false);
  };

  const handleCopyTodoList = () => {
    const list = actionItems
      .map(
        (a) =>
          `[${a.done ? 'x' : ' '}] ${a.task} (Assignee: ${a.assignee}, Due: ${a.deadline}, Alarm: ${
            a.alarm?.enabled ? 'ON' : 'OFF'
          }, Platform: ${a.platform.toUpperCase()})`
      )
      .join('\n');
    navigator.clipboard.writeText(list);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 1. Friendly Alarm & Reminder Status Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-lg bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-rose-950/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-md shadow-rose-600/30">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Task Reminders & Alarm System
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {activeAlarmsCount} Active Alarms
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Connected to Web Audio chimes, browser desktop notifications, and calendar sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Permission Prompt if default */}
            {notificationPermission !== 'granted' && (
              <button
                onClick={onRequestNotificationPermission}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                title="Enable desktop notifications for alarms"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Push Alarms</span>
              </button>
            )}

            {/* Test Alarm sound button */}
            <button
              onClick={onTestAlarm}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-rose-600/20"
              title="Test the alarm sound tone right now"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Alarm Tone</span>
            </button>
          </div>
        </div>

        {/* Progress & Quick stats */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="text-slate-400 text-[11px] font-medium shrink-0">
              Completion: {completedCount}/{totalCount} ({progressPercent}%)
            </span>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTodoList}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied To-Do' : 'Export To-Do'}</span>
            </button>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task with Alarm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter & Sort Toolbar */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> View:
          </span>
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'alarms', label: `🔔 Alarms (${activeAlarmsCount})` },
            { id: 'pending', label: `Pending (${totalCount - completedCount})` },
            { id: 'completed', label: `Done (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl font-medium transition cursor-pointer ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="deadline">Soonest Deadline</option>
            <option value="priority">Priority (High first)</option>
            <option value="assignee">Assignee</option>
          </select>
        </div>
      </div>

      {/* 3. Inline Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="glass-panel p-4 sm:p-5 rounded-2xl border border-indigo-500/40 shadow-2xl space-y-3.5 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Add Task with Deadline & Reminder Alarm
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <input
            type="text"
            required
            placeholder="e.g. Rollback DB connection pool commit and verify replica latency"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Assignee</label>
              <input
                type="text"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Deadline (Date & Time)
              </label>
              <input
                type="datetime-local"
                value={newTaskDeadlineIso}
                onChange={(e) => setNewTaskDeadlineIso(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Platform</label>
              <select
                value={newTaskPlatform}
                onChange={(e) => setNewTaskPlatform(e.target.value as Platform)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs"
              >
                <option value="slack">Slack</option>
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="discord">Discord</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs"
              >
                <option value="high">High / Urgent</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={newTaskEnableAlarm}
                onChange={(e) => setNewTaskEnableAlarm(e.target.checked)}
                className="rounded accent-rose-500 w-4 h-4"
              />
              <span className="flex items-center gap-1 font-semibold text-rose-300">
                <Bell className="w-3.5 h-3.5" />
                Schedule Audio Alarm & Reminder at Deadline
              </span>
            </label>

            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/30"
            >
              Add Task & Arm Alarm
            </button>
          </div>
        </form>
      )}

      {/* 4. Task Items List with Countdown & Alarms */}
      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-slate-200">No tasks in this view</p>
            <p className="text-xs text-slate-400 mt-1">
              All caught up or try switching your filter tab.
            </p>
          </div>
        ) : (
          sortedItems.map((item) => {
            const timeRemaining = item.deadlineTimestamp
              ? formatTimeRemaining(item.deadlineTimestamp)
              : null;

            return (
              <div
                key={item.id}
                className={`glass-panel p-4 rounded-2xl border transition space-y-3 group ${
                  item.done
                    ? 'border-slate-800/40 bg-slate-950/40 opacity-75'
                    : timeRemaining?.isOverdue
                    ? 'border-rose-500/50 bg-slate-900/80 shadow-rose-950/20 shadow-md ring-1 ring-rose-500/20'
                    : timeRemaining?.isDueSoon
                    ? 'border-amber-500/50 bg-slate-900/80 shadow-amber-950/20 shadow-md ring-1 ring-amber-500/20'
                    : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60 shadow-md'
                }`}
              >
                {/* Top Row: Checkbox, Task Text, Delete */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleDone(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-400 transition cursor-pointer shrink-0"
                    title={item.done ? 'Mark as pending' : 'Mark as done'}
                  >
                    {item.done ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-medium transition leading-snug ${
                        item.done ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {item.task}
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteTask(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Row: Deadline badges, Alarm status, External connect */}
                <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Left: Metadata badges & countdown */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Deadline & countdown badge */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-medium border ${
                        timeRemaining?.isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : timeRemaining?.isDueSoon
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.deadline}</span>
                      {timeRemaining && !item.done && (
                        <span className="font-bold ml-0.5">• {timeRemaining.label}</span>
                      )}
                    </div>

                    {/* Assignee */}
                    <span className="flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                      <User className="w-3 h-3" />
                      {item.assignee}
                    </span>

                    {/* Platform */}
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                      <PlatformIcon platform={item.platform} size={12} />
                      <span className="capitalize">{item.platform}</span>
                    </span>

                    {/* Priority tag */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        item.priority === 'high'
                          ? 'text-rose-400 bg-rose-500/15'
                          : item.priority === 'medium'
                          ? 'text-amber-400 bg-amber-500/15'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  {/* Right: Alarm Controller & Calendar Sync */}
                  <div className="flex items-center gap-1.5">
                    {/* Alarm Toggle / Edit Button */}
                    <button
                      onClick={() => setEditingAlarmTask(item)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        item.alarm?.enabled && !item.done
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 shadow-sm'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                      }`}
                      title="Configure deadline & audio alarm"
                    >
                      <Bell
                        className={`w-3.5 h-3.5 ${
                          item.alarm?.enabled && !item.done ? 'text-rose-400 fill-rose-400' : ''
                        }`}
                      />
                      <span>{item.alarm?.enabled ? 'Alarm ON' : 'Set Alarm'}</span>
                    </button>

                    {/* Google Calendar Link */}
                    <a
                      href={createGoogleCalendarUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-sky-400 border border-slate-700 transition"
                      title="Add to Google Calendar with reminder notification"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Download .ICS */}
                    <button
                      onClick={() => downloadTaskIcs(item)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-emerald-400 border border-slate-700 transition"
                      title="Download iCal alarm file (.ics) for your phone or clock"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Alarm Modal */}
      <TaskAlarmModal
        task={editingAlarmTask}
        isOpen={!!editingAlarmTask}
        onClose={() => setEditingAlarmTask(null)}
        onSaveAlarm={(taskId, alarm, newDeadlineIso) => {
          onUpdateAlarm(taskId, alarm, newDeadlineIso);
          setEditingAlarmTask(null);
        }}
      />
    </div>
  );
};
