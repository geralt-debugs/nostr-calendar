import { LocalNotifications } from "@capacitor/local-notifications";
import { isNative } from "./platform";
import type { ICalendarEvent } from "./types";

const scheduledEventIds = new Set<string>();
let initialized = false;

/**
 * Load already-pending notification IDs so we don't re-schedule
 * after an app restart.
 */
async function initScheduledIds(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    const { notifications } = await LocalNotifications.getPending();
    for (const n of notifications) {
      const eventId = (n.extra as Record<string, string> | undefined)?.eventId;
      if (eventId) {
        scheduledEventIds.add(eventId);
      }
    }
  } catch (err) {
    console.warn("Failed to load pending notifications", err);
  }
}

/**
 * Generate a stable numeric ID from a string event ID.
 * Uses two IDs per event: base for "10 min before", base+1 for "at event time".
 */
function hashToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  // Ensure positive and leave room for +1 (at-time notification)
  return (Math.abs(hash) >> 1) * 2;
}

export async function scheduleEventNotifications(
  event: ICalendarEvent,
): Promise<void> {
  if (!isNative) return;

  await initScheduledIds();

  if (scheduledEventIds.has(event.eventId)) return;

  const now = Date.now();
  const tenMinBefore = event.begin - 10 * 60 * 1000;

  // Skip if the event has already started
  if (event.begin <= now) return;

  const baseId = hashToNumber(event.eventId);
  const notifications: Array<{
    id: number;
    title: string;
    body: string;
    schedule: { at: Date; allowWhileIdle: boolean };
    extra: { eventId: string };
  }> = [];

  if (tenMinBefore > now) {
    notifications.push({
      id: baseId,
      title: `Upcoming: ${event.title}`,
      body: `Starts in 10 minutes`,
      schedule: { at: new Date(tenMinBefore), allowWhileIdle: true },
      extra: { eventId: event.eventId },
    });
  }

  notifications.push({
    id: baseId + 1,
    title: event.title,
    body: `Starting now`,
    schedule: { at: new Date(event.begin), allowWhileIdle: true },
    extra: { eventId: event.eventId },
  });

  if (notifications.length === 0) return;

  try {
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display !== "granted") return;

    await LocalNotifications.schedule({ notifications });
    scheduledEventIds.add(event.eventId);
    console.log(`Scheduling notifications for ${event.eventId}`);
  } catch (err) {
    console.warn("Failed to schedule notification", err);
  }
}

export function addNotificationClickListener(
  onEventClick: (eventId: string) => void,
): () => void {
  if (!isNative) return () => {};

  const listener = LocalNotifications.addListener(
    "localNotificationActionPerformed",
    (action) => {
      const eventId = (
        action.notification.extra as Record<string, string> | undefined
      )?.eventId;
      if (eventId) {
        onEventClick(eventId);
      }
    },
  );

  return () => {
    listener.then((l) => l.remove());
  };
}

export async function cancelAllNotifications(): Promise<void> {
  if (!isNative) return;
  try {
    const { notifications } = await LocalNotifications.getPending();
    if (notifications.length > 0) {
      await LocalNotifications.cancel({ notifications });
    }
    scheduledEventIds.clear();
  } catch (err) {
    console.warn("Failed to cancel all notifications", err);
  }
}

export async function cancelEventNotifications(eventId: string): Promise<void> {
  if (!isNative) return;
  if (!scheduledEventIds.has(eventId)) return;

  const baseId = hashToNumber(eventId);
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: baseId }, { id: baseId + 1 }],
    });
    scheduledEventIds.delete(eventId);
  } catch (err) {
    console.warn("Failed to cancel notification", err);
  }
}
