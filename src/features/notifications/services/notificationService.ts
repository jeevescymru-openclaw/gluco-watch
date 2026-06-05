import * as Notifications from 'expo-notifications';

import { REMINDER_CHANNEL_ID, REMINDER_CHANNEL_NAME, REMINDER_CONTENT } from '../constants';

import type { ReminderTime } from '../notification.types';

// Foreground notifications still show a banner so a missed-morning reminder is visible
// even with the app open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const ensureNotificationPermission = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

/** Replaces any existing schedule with a single daily reminder at the given local time. */
export const scheduleMorningReminder = async ({ hour, minute }: ReminderTime): Promise<void> => {
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: REMINDER_CHANNEL_NAME,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: REMINDER_CONTENT.title, body: REMINDER_CONTENT.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
};
