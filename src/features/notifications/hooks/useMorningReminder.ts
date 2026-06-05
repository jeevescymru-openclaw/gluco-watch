import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { useReminderTime } from '@/features/settings/hooks/useReminderTime';

import { MORNING_ROUTE } from '../constants';
import {
  ensureNotificationPermission,
  scheduleMorningReminder,
} from '../services/notificationService';

/**
 * Keeps the daily morning reminder scheduled at the stored time and routes a tapped
 * reminder to the morning screen. Mounted once from the (configured) home screen.
 */
export const useMorningReminder = (): void => {
  const router = useRouter();
  const { reminderTime, isLoaded } = useReminderTime();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    void (async () => {
      if (await ensureNotificationPermission()) {
        await scheduleMorningReminder(reminderTime);
      }
    })();
  }, [isLoaded, reminderTime]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push(MORNING_ROUTE);
    });
    return () => subscription.remove();
  }, [router]);
};
