import { Event } from "nostr-tools";
import { create } from "zustand";
import {
  fetchCalendarEvents,
  fetchCalendarGiftWraps,
  fetchPrivateCalendarEvents,
  getUserPublicKey,
  viewPrivateEvent,
} from "../common/nostr";
import { isValid } from "date-fns";
import {
  appendOne,
  denormalize,
  normalize,
  removeOne,
} from "@voiceflow/normal-store";
import { SubCloser } from "nostr-tools/abstract-pool";
import { nostrEventToCalendar } from "../utils/parser";
import { RSVPResponse } from "../utils/types";
import type {ICalendarEvent} from "../utils/types";

let subscriptionCloser: SubCloser | undefined;
let privateSubloser: SubCloser | undefined;

export { ICalendarEvent, RSVPResponse }

interface TimeRangeConfig {
  daysBefore: number;
  daysAfter: number;
}
// Configuration for time range - can be modified in one place
export const getTimeRangeConfig = (): TimeRangeConfig => ({
  daysBefore: 7,
  daysAfter: 21,
});

// Helper function to get configurable time range
const getTimeRange = (customConfig?: {
  daysBefore?: number;
  daysAfter?: number;
}) => {
  const config = { ...getTimeRangeConfig(), ...customConfig };
  const now = new Date();

  const daysBefore = new Date(now);
  daysBefore.setDate(now.getDate() - config.daysBefore);

  const daysAfter = new Date(now);
  daysAfter.setDate(now.getDate() + config.daysAfter);

  return {
    since: Math.floor(daysBefore.getTime() / 1000),
    until: Math.floor(daysAfter.getTime() / 1000),
    daysBefore: config.daysBefore,
    daysAfter: config.daysAfter,
  };
};

const processPrivateEvent = (
  event: Event,
  _timeRange: ReturnType<typeof getTimeRange>,
  viewKey?: string
) => {
  const { events } = useTimeBasedEvents.getState();
  let store = normalize(events);
  const parsedEvent = nostrEventToCalendar(event, {viewKey, isPrivateEvent: true})
  // Check if we have valid begin/end times after processing all tags
  if (parsedEvent.begin === 0 || parsedEvent.end === 0) {
    return;
  }

  if (
    !isValid(new Date(parsedEvent.begin)) ||
    !isValid(new Date(parsedEvent.end))
  ) {
    console.warn("invalid date", parsedEvent, event);
  } else {
    if (store.allKeys.includes(parsedEvent.id)) {
      const previousEvent = store.byKey[parsedEvent.id];
      if (parsedEvent.createdAt > previousEvent.createdAt) {
        store = removeOne(store, parsedEvent.id);
        store = appendOne(store, parsedEvent.id, parsedEvent);
      }
    } else {
      store = appendOne(store, parsedEvent.id, parsedEvent);
    }
  }
  useTimeBasedEvents.setState({
    eventById: store.byKey,
    events: denormalize(store),
  });
};

const processedEventIds: string[] = [];

const processGiftWraps = (
  rumor: { viewKey: string; eventId: string },
  timeRange: ReturnType<typeof getTimeRange>,
) => {
  if (processedEventIds.includes(rumor.eventId)) {
    return;
  }
  processedEventIds.push(rumor.eventId);
  fetchPrivateCalendarEvents({ eventIds: [rumor.eventId] }, async (event) => {
    const decryptedEvent = viewPrivateEvent(event, rumor.viewKey);
    processPrivateEvent(decryptedEvent, timeRange, rumor.viewKey);
  });
};

export const useTimeBasedEvents = create<{
  events: ICalendarEvent[];
  eventById: Record<string, ICalendarEvent>;
  fetchEvents: (customTimeRange?: {
    daysBefore?: number;
    daysAfter?: number;
  }) => void;
  fetchPrivateEvents: (customTimeRange?: {
    daysBefore?: number;
    daysAfter?: number;
  }) => void;
  resetPrivateEvents: () => void;
  getTimeRangeConfig: () => { daysBefore: number; daysAfter: number };
  updateTimeRangeConfig: (config: {
    daysBefore?: number;
    daysAfter?: number;
  }) => void;
}>((set) => ({
  resetPrivateEvents: () => {
    set(({ events }) => {
      const publicEvents = events.filter((evt) => !evt.isPrivateEvent);
      return {
        events: publicEvents,
      };
    });
  },
  events: [],
  eventIds: [],
  eventById: {},
  getTimeRangeConfig,
  updateTimeRangeConfig: (newConfig) => {
    Object.assign(getTimeRangeConfig(), newConfig);
  },
  async fetchPrivateEvents(customTimeRange) {
    if (privateSubloser) {
      privateSubloser.close();
    }
    const userPublicKey = await getUserPublicKey();
    if (!userPublicKey) {
      return;
    }

    const timeRange = getTimeRange(customTimeRange);

    privateSubloser = fetchCalendarGiftWraps(
      {
        participants: [userPublicKey],
        since: timeRange.since,
        until: timeRange.until,
      },
      (event) => {
        processGiftWraps(event, timeRange);
      },
    );
  },
  fetchEvents: (customTimeRange) => {
    if (subscriptionCloser) {
      return;
    }

    const timeRange = getTimeRange(customTimeRange);

    subscriptionCloser = fetchCalendarEvents(
      {
        since: timeRange.since,
        until: timeRange.until,
      },
      (event: Event) => {
        set(({ events, eventById }) => {
          let store = normalize(events);
          const parsedEvent = nostrEventToCalendar(event)

          // Check if we have valid begin/end times after processing all tags
          if (parsedEvent.begin === 0 || parsedEvent.end === 0) {
            return { events, eventById }; // Skip this event
          }

          // Client-side filter for events within time range (backup check)
          const eventStart = parsedEvent.begin / 1000;
          const eventEnd = parsedEvent.end / 1000;

          if (eventEnd < timeRange.since || eventStart > timeRange.until) {
            return { events, eventById }; // Skip this event
          }

          if (
            !isValid(new Date(parsedEvent.begin)) ||
            !isValid(new Date(parsedEvent.end))
          ) {
            return { events, eventById };
          }
          if (store.allKeys.includes(parsedEvent.id)) {
            const previousEvent = store.byKey[parsedEvent.id];
            if (parsedEvent.createdAt > previousEvent.createdAt) {
              store = removeOne(store, parsedEvent.id);
              store = appendOne(store, parsedEvent.id, parsedEvent);
            }
          } else {
            store = appendOne(store, parsedEvent.id, parsedEvent);
          }
          return {
            eventById: store.byKey,
            events: denormalize(store),
          };
        });
      },
    );
  },
  clearEvents: () => set({ events: [], eventById: {} }),
}));
