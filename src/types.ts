export type Platform = 'slack' | 'telegram' | 'whatsapp' | 'discord';

export type Priority = 'high' | 'medium' | 'low';

export interface ChatMessage {
  id: string;
  platform: Platform;
  sender: string;
  avatar?: string;
  channel: string;
  text: string;
  timestamp: string;
  isDirectMention: boolean;
  priority: Priority;
  isDecision?: boolean;
  isAction?: boolean;
  extractedDeadline?: string;
  extractedAssignee?: string;
}

export interface TaskAlarm {
  enabled: boolean;
  targetTimestamp: number; // timestamp in ms when alarm will ring
  timeFormatted: string; // e.g. "10:00 AM" or "Today 10:00 AM"
  sound: 'chime' | 'digital' | 'radar' | 'voice';
  remindMinutesBefore: number; // 0 for at deadline, or 5, 15, 30
  triggered: boolean;
  alarmId: string;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
  deadlineIso?: string; // YYYY-MM-DDTHH:mm
  deadlineTimestamp?: number;
  platform: Platform;
  priority: Priority;
  done: boolean;
  channel?: string;
  originalMessageId?: string;
  alarm?: TaskAlarm;
}

export interface DecisionItem {
  id: string;
  title: string;
  detail: string;
  channel: string;
  platform: Platform;
  agreedBy: string[];
  timestamp: string;
}

export interface UrgentAlert {
  id: string;
  sender: string;
  platform: Platform;
  channel: string;
  message: string;
  timestamp: string;
  isDirectMention: boolean;
  severity: 'critical' | 'warning' | 'info';
}

export interface SummaryResult {
  executiveSummary: string;
  bulletHighlights: string[];
  actionItems: ActionItem[];
  decisions: DecisionItem[];
  urgentAlerts: UrgentAlert[];
  generatedAt: string;
  modelUsed: string;
  processingTimeMs: number;
  isLocal: boolean;
  sourceMessageCount: number;
}

export type FocusMode = 'all-round' | 'action-items' | 'executive-brief' | 'deep-dive';

export type SummaryLength = 'concise' | 'balanced' | 'comprehensive';

export interface PlatformStatus {
  platform: Platform;
  connected: boolean;
  syncing: boolean;
  unreadCount: number;
  lastSynced: string;
}

export interface PresetData {
  id: string;
  title: string;
  description: string;
  badge: string;
  messages: ChatMessage[];
}
