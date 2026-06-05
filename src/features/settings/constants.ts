import type { ReminderTime } from '@/features/notifications/notification.types';

export const DEFAULT_REMINDER_TIME: ReminderTime = { hour: 7, minute: 0 };

export const REMINDER_TIME_STORAGE_KEY = 'glucowatch.reminderTime';
