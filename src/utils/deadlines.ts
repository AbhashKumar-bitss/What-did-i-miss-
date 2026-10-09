import { ActionItem } from '../types';

export function parseDeadlineToTimestamp(deadlineStr: string): {
  timestamp: number;
  iso: string;
  formatted: string;
} {
  const now = new Date();
  const lower = deadlineStr.toLowerCase().trim();
  const target = new Date(now);

  if (lower.includes('immediately') || lower.includes('asap') || lower.includes('live')) {
    target.setMinutes(target.getMinutes() + 15);
  } else if (lower.includes('10:00 am') || lower.includes('10 am')) {
    target.setHours(10, 0, 0, 0);
  } else if (lower.includes('11:30 am')) {
    target.setHours(11, 30, 0, 0);
  } else if (lower.includes('1:00 pm') || lower.includes('1 pm')) {
    target.setHours(13, 0, 0, 0);
  } else if (lower.includes('2:00 pm') || lower.includes('2 pm')) {
    target.setHours(14, 0, 0, 0);
  } else if (lower.includes('4:00 pm') || lower.includes('4 pm')) {
    target.setHours(16, 0, 0, 0);
  } else if (lower.includes('5:00 pm') || lower.includes('eod') || lower.includes('5 pm')) {
    target.setHours(17, 0, 0, 0);
  } else if (lower.includes('tomorrow')) {
    target.setDate(target.getDate() + 1);
    target.setHours(12, 0, 0, 0);
  } else if (lower.includes('friday')) {
    const day = target.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
    target.setHours(12, 0, 0, 0);
  } else {
    // Default to +2 hours from now
    target.setHours(target.getHours() + 2);
  }

  // Format ISO (YYYY-MM-DDTHH:mm)
  const pad = (n: number) => n.toString().padStart(2, '0');
  const iso = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(
    target.getHours()
  )}:${pad(target.getMinutes())}`;

  const formatted = target.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });

  return {
    timestamp: target.getTime(),
    iso,
    formatted,
  };
}

export function formatTimeRemaining(targetTimestamp: number): {
  isOverdue: boolean;
  isDueSoon: boolean; // within 1 hour
  label: string;
} {
  const diffMs = targetTimestamp - Date.now();
  if (diffMs < 0) {
    const mins = Math.abs(Math.round(diffMs / (1000 * 60)));
    return {
      isOverdue: true,
      isDueSoon: false,
      label: mins < 60 ? `Overdue by ${mins}m` : `Overdue by ${Math.round(mins / 60)}h`,
    };
  }

  const mins = Math.round(diffMs / (1000 * 60));
  if (mins < 60) {
    return {
      isOverdue: false,
      isDueSoon: true,
      label: `Due in ${mins}m`,
    };
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return {
    isOverdue: false,
    isDueSoon: hours < 2,
    label: `Due in ${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}`,
  };
}

export function createGoogleCalendarUrl(task: ActionItem): string {
  const title = encodeURIComponent(`[Task] ${task.task}`);
  const details = encodeURIComponent(
    `Extracted from unread chat on ${task.platform.toUpperCase()}.\nAssignee: ${task.assignee}\nPriority: ${task.priority}\n\nManaged with "What Did I Miss? — Unread AI Assistant"`
  );

  const start = task.deadlineTimestamp ? new Date(task.deadlineTimestamp) : new Date(Date.now() + 3600000);
  const end = new Date(start.getTime() + 30 * 60000); // 30 min duration

  const formatGCal = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const dates = `${formatGCal(start)}/${formatGCal(end)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

export function downloadTaskIcs(task: ActionItem): void {
  const start = task.deadlineTimestamp ? new Date(task.deadlineTimestamp) : new Date(Date.now() + 3600000);
  const end = new Date(start.getTime() + 30 * 60000);

  const formatIcs = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//What Did I Miss//Unread AI Assistant//EN
BEGIN:VEVENT
UID:${task.id}-${Date.now()}@whatdidimiss.ai
DTSTAMP:${formatIcs(new Date())}
DTSTART:${formatIcs(start)}
DTEND:${formatIcs(end)}
SUMMARY:${task.task}
DESCRIPTION:Task extracted from ${task.platform.toUpperCase()} (${task.assignee})\\nPriority: ${task.priority}
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${task.task}
END:VALARM
BEGIN:VALARM
TRIGGER:PT0M
ACTION:AUDIO
DESCRIPTION:Alarm: ${task.task}
END:VALARM
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `task-alarm-${task.id}.ics`;
  a.click();
}
