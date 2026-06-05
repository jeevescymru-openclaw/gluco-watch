import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_REMINDER_TIME, REMINDER_TIME_STORAGE_KEY } from '../constants';

import type { ReminderTime } from '@/features/notifications/notification.types';

interface UseReminderTimeResult {
  readonly reminderTime: ReminderTime;
  readonly isLoaded: boolean;
  readonly saveReminderTime: (time: ReminderTime) => Promise<void>;
}

const parseReminderTime = (raw: string | null): ReminderTime => {
  if (!raw) {
    return DEFAULT_REMINDER_TIME;
  }
  try {
    const value = JSON.parse(raw) as Partial<ReminderTime>;
    if (typeof value.hour === 'number' && typeof value.minute === 'number') {
      return { hour: value.hour, minute: value.minute };
    }
  } catch {
    return DEFAULT_REMINDER_TIME;
  }
  return DEFAULT_REMINDER_TIME;
};

export const useReminderTime = (): UseReminderTimeResult => {
  const [reminderTime, setReminderTime] = useState<ReminderTime>(DEFAULT_REMINDER_TIME);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;
    void AsyncStorage.getItem(REMINDER_TIME_STORAGE_KEY).then((raw) => {
      if (isActive) {
        setReminderTime(parseReminderTime(raw));
        setIsLoaded(true);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  const saveReminderTime = useCallback(async (time: ReminderTime): Promise<void> => {
    await AsyncStorage.setItem(REMINDER_TIME_STORAGE_KEY, JSON.stringify(time));
    setReminderTime(time);
  }, []);

  return { reminderTime, isLoaded, saveReminderTime };
};
