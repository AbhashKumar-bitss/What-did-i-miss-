import React from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Volume2,
  X,
  RotateCcw,
} from 'lucide-react';
import { ActionItem } from '../types';
import { PlatformIcon } from './PlatformIcons';

interface AlarmRingingModalProps {
  activeAlarmTask: ActionItem | null;
  onDismiss: () => void;
  onSnooze: (task: ActionItem, minutes: number) => void;
  onCompleteTask: (taskId: string) => void;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  activeAlarmTask,
  onDismiss,
  onSnooze,
  onCompleteTask,
}) => {
  if (!activeAlarmTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-slate-900 border-2 border-rose-500/80 rounded-3xl shadow-2xl text-slate-100 ring-4 ring-rose-500/20 text-center space-y-5">
        {/* Animated Ringing Bell Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
          <div className="relative p-5 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-xl shadow-rose-600/40">
            <BellRing className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-2">
            ⏰ Task Reminder Alarm Ringing!
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {activeAlarmTask.task}
          </h2>
        </div>

        {/* Task Details Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <PlatformIcon platform={activeAlarmTask.platform} size={14} />
              <span>{activeAlarmTask.channel || 'Unread Chat'}</span>
            </span>
            <span className="font-mono text-amber-400 font-semibold">
              Due: {activeAlarmTask.deadline}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-slate-400">
            <span>Assignee: <strong className="text-slate-200">{activeAlarmTask.assignee}</strong></span>
            <span className="capitalize font-mono text-rose-400 font-semibold">
              Priority: {activeAlarmTask.priority}
            </span>
          </div>
        </div>

        {/* Sound playing indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-rose-400 font-medium">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>Alarm sound is ringing. Action required!</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {/* Complete Task */}
          <button
            onClick={() => {
              onCompleteTask(activeAlarmTask.id);
              onDismiss();
            }}
            className="sm:col-span-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Mark Task Done & Stop Alarm</span>
          </button>

          {/* Snooze 5 mins */}
          <button
            onClick={() => onSnooze(activeAlarmTask, 5)}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Snooze 5 Min</span>
          </button>

          {/* Snooze 15 mins */}
          <button
            onClick={() => onSnooze(activeAlarmTask, 15)}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Snooze 15 Min</span>
          </button>

          {/* Dismiss Alarm */}
          <button
            onClick={onDismiss}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            <span>Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
};
