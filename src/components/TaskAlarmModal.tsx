import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Calendar,
  Volume2,
  Play,
  X,
  Check,
  ExternalLink,
  Download,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ActionItem, TaskAlarm } from '../types';
import {
  playChimeTone,
  playDigitalAlarm,
  playRadarSound,
  playVoiceNotification,
} from '../utils/alarmAudio';
import { createGoogleCalendarUrl, downloadTaskIcs } from '../utils/deadlines';

interface TaskAlarmModalProps {
  task: ActionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAlarm: (taskId: string, alarm: TaskAlarm | undefined, newDeadlineIso?: string) => void;
}

export const TaskAlarmModal: React.FC<TaskAlarmModalProps> = ({
  task,
  isOpen,
  onClose,
  onSaveAlarm,
}) => {
  if (!isOpen || !task) return null;

  // Initial state derived from task
  const initialIso =
    task.deadlineIso ||
    new Date(Date.now() + 3600000).toISOString().slice(0, 16);

  const [deadlineIso, setDeadlineIso] = useState<string>(initialIso);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(task.alarm?.enabled ?? true);
  const [sound, setSound] = useState<'chime' | 'digital' | 'radar' | 'voice'>(
    task.alarm?.sound || 'digital'
  );
  const [remindMinutesBefore, setRemindMinutesBefore] = useState<number>(
    task.alarm?.remindMinutesBefore ?? 0
  );

  // Quick preset handlers
  const setQuickTime = (minutesFromNow: number) => {
    const d = new Date(Date.now() + minutesFromNow * 60000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
    setDeadlineIso(iso);
  };

  const setSpecificHourToday = (hour: number, minute = 0) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    if (d.getTime() <= Date.now()) {
      d.setDate(d.getDate() + 1); // tomorrow if passed
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
    setDeadlineIso(iso);
  };

  const handleTestSound = () => {
    switch (sound) {
      case 'chime':
        playChimeTone();
        break;
      case 'digital':
        playDigitalAlarm();
        break;
      case 'radar':
        playRadarSound();
        break;
      case 'voice':
        playChimeTone();
        setTimeout(() => playVoiceNotification(task.task), 400);
        break;
    }
  };

  const handleSave = () => {
    const targetDate = new Date(deadlineIso);
    const timestamp = targetDate.getTime();
    const formatted = targetDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });

    if (!alarmEnabled) {
      onSaveAlarm(task.id, undefined, deadlineIso);
    } else {
      const alarm: TaskAlarm = {
        enabled: true,
        targetTimestamp: timestamp,
        timeFormatted: formatted,
        sound,
        remindMinutesBefore,
        triggered: false,
        alarmId: `alarm-${task.id}-${Date.now()}`,
      };
      onSaveAlarm(task.id, alarm, deadlineIso);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Set Task Deadline & Alarm</h3>
              <p className="text-xs text-slate-400">
                Connect alarms with Web Audio, Google Calendar & device clocks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task preview */}
        <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Target Task:</span>
          <p className="text-slate-200 font-medium">{task.task}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <span>Assignee: <strong className="text-indigo-300">{task.assignee}</strong></span>
            <span>•</span>
            <span className="capitalize">Platform: {task.platform}</span>
          </div>
        </div>

        {/* Deadline Date & Time Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Deadline Date & Time
            </span>
            <span className="text-[11px] text-slate-400">Local Timezone</span>
          </label>

          <input
            type="datetime-local"
            value={deadlineIso}
            onChange={(e) => setDeadlineIso(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => setQuickTime(15)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] border border-slate-700 transition"
            >
              +15 mins
            </button>
            <button
              type="button"
              onClick={() => setQuickTime(60)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] border border-slate-700 transition"
            >
              +1 hour
            </button>
            <button
              type="button"
              onClick={() => setSpecificHourToday(17, 0)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] border border-slate-700 transition"
            >
              Today 5:00 PM
            </button>
            <button
              type="button"
              onClick={() => setSpecificHourToday(9, 0)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] border border-slate-700 transition"
            >
              Tomorrow 9:00 AM
            </button>
          </div>
        </div>

        {/* Alarm Settings Toggle */}
        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className={`w-4 h-4 ${alarmEnabled ? 'text-rose-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-xs font-bold text-white">Enable Audio Alarm & Push</span>
                <p className="text-[10px] text-slate-400">Rings loud audio chime when time arrives</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={(e) => setAlarmEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600" />
            </label>
          </div>

          {alarmEnabled && (
            <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fadeIn">
              {/* Sound Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Alarm Sound Tone
                  </label>
                  <button
                    type="button"
                    onClick={handleTestSound}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition"
                  >
                    <Play className="w-3 h-3 fill-rose-400" />
                    <span>Test Sound</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'digital', label: 'Digital Pulse' },
                    { id: 'chime', label: 'Soothing Chime' },
                    { id: 'radar', label: 'Radar Ping' },
                    { id: 'voice', label: 'Voice Alert' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSound(s.id as any)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                        sound === s.id
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remind in advance */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Trigger Timing
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { mins: 0, label: 'At Deadline' },
                    { mins: 5, label: '5m Before' },
                    { mins: 15, label: '15m Before' },
                    { mins: 30, label: '30m Before' },
                  ].map((m) => (
                    <button
                      key={m.mins}
                      type="button"
                      onClick={() => setRemindMinutesBefore(m.mins)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition ${
                        remindMinutesBefore === m.mins
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* External Alarm Syncs */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <a
              href={createGoogleCalendarUrl(task)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="Add task with reminder to Google Calendar"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Google Calendar</span>
            </a>

            <button
              type="button"
              onClick={() => downloadTaskIcs(task)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="Download iCal alarm file (.ics) for phone/desktop"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download .ICS Alarm</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>Save Alarm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
