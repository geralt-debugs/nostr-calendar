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
import { appendOne, denormalize, normalize, removeOne } from "normal-store";
import { SubCloser } from "nostr-tools/abstract-pool";

export type RSVPResponse = "accepted" | "declined" | "tentative" | "pending";

export interface IRSVPResponse {
  participantId: string;
  response: RSVPResponse;
  timestamp: number;
}

export interface ICalendarEvent {
  begin: number;
  description: string;
  end: number;
  id: string;
  title: string;
  createdAt: number;
  categories: string[];
  participants: string[];
  rsvpResponses: IRSVPResponse[];
  reference: string[];
  image?: string;
  location: string[];
  geoHash: string[];
  website: string;
  user: string;
  isPrivateEvent: boolean;
}

let subscriptionCloser: SubCloser | undefined;
let privateSubloser: SubCloser | undefined;

interface TimeRangeConfig {
  daysBefore: number;
  daysAfter: number;
}
// Configuration for time range - can be modified in one place
export const getTimeRangeConfig = () : TimeRangeConfig => ({
  daysBefore: 7,
  daysAfter: 7,
});

// Helper function to get configurable time range
const getTimeRange = (customConfig?: { daysBefore?: number; daysAfter?: number }) => {
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
    daysAfter: config.daysAfter
  };
};

const processPrivateEvent = (event: Event, timeRange: ReturnType<typeof getTimeRange>) => {
  const { events } = useTimeBasedEvents.getState();
  let store = normalize(events);
  const parsedEvent: ICalendarEvent = {
    description: "",
    user: event.pubkey,
    begin: 0,
    end: 0,
    id: "",
    title: "",
    createdAt: event.created_at,
    categories: [],
    reference: [],
    website: "",
    location: [],
    geoHash: [],
    participants: [],
    isPrivateEvent: true,
    rsvpResponses: [],
  };

  event.tags.forEach(([key, value]) => {
    switch (key) {
      case "description":
        parsedEvent.description = value;
        break;
      case "start":
        const startNum = Number(value);
        if (isNaN(startNum) || startNum <= 0) {
          return;
        }
        parsedEvent.begin = startNum * 1000;
        break;
      case "end":
        const endNum = Number(value);
        if (isNaN(endNum) || endNum <= 0) {
          return;
        }
        parsedEvent.end = endNum * 1000;
        break;
      case "d":
        parsedEvent.id = value;
        break;
      case "title":
      case "name":
        parsedEvent.title = value;
        break;
      case "r":
        parsedEvent.reference.push(value);
        break;
      case "image":
        parsedEvent.image = value;
        break;
      case "t":
        parsedEvent.categories.push(value);
        break;
      case "location":
        parsedEvent.location.push(value);
        break;
      case "p":
        parsedEvent.participants.push(value);
        break;
      case "g":
        parsedEvent.geoHash.push(value);
        break;
      case "rsvp":
        try {
          const rsvpData = JSON.parse(value) as {
            participantId: string;
            response: RSVPResponse;
            timestamp: number;
          };
          parsedEvent.rsvpResponses.push(rsvpData);
        } catch (error) {
          console.warn("Failed to parse RSVP data:", value);
        }
        break;
    }
  });

  // Check if we have valid begin/end times after processing all tags
  if (parsedEvent.begin === 0 || parsedEvent.end === 0) {
    return;
  }

  // Filter: check if event is within our time range
  const eventStart = parsedEvent.begin / 1000;
  const eventEnd = parsedEvent.end / 1000;
  
  // Skip events that are completely outside our time range
  if (eventEnd < timeRange.since || eventStart > timeRange.until) {
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

const processGiftWraps = (rumor: { viewKey: string; eventId: string }, timeRange: ReturnType<typeof getTimeRange>) => {
  if (processedEventIds.includes(rumor.eventId)) {
    return;
  }
  processedEventIds.push(rumor.eventId);
  fetchPrivateCalendarEvents({ eventIds: [rumor.eventId] }, async (event) => {
    const decryptedEvent = await viewPrivateEvent(event, rumor.viewKey);
    processPrivateEvent(decryptedEvent, timeRange);
  });
};

export const useTimeBasedEvents = create<{
  events: ICalendarEvent[];
  eventById: Record<string, ICalendarEvent>;
  fetchEvents: (customTimeRange?: { daysBefore?: number; daysAfter?: number }) => void;
  fetchPrivateEvents: (customTimeRange?: { daysBefore?: number; daysAfter?: number }) => void;
  resetPrivateEvents: () => void;
  getTimeRangeConfig: () => { daysBefore: number; daysAfter: number };
  updateTimeRangeConfig: (config: { daysBefore?: number; daysAfter?: number }) => void;
}>((set, get) => ({
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
        until: timeRange.until
      },
      (event) => {
        processGiftWraps(event, timeRange);
      }
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
        until: timeRange.until
      },
      (event: Event) => {
        set(({ events, eventById }) => {
          let store = normalize(events);
          const parsedEvent: ICalendarEvent = {
            description: event.content,
            user: event.pubkey,
            begin: 0,
            end: 0,
            id: "",
            title: "",
            createdAt: event.created_at,
            categories: [],
            reference: [],
            website: "",
            location: [],
            geoHash: [],
            participants: [],
            isPrivateEvent: false,
            rsvpResponses: [],
          };

          event.tags.forEach(([key, value]) => {
            switch (key) {
              case "start":
                const startNum = Number(value);
                if (isNaN(startNum) || startNum <= 0) {
                  return;
                }
                parsedEvent.begin = startNum * 1000;
                break;
              case "end":
                const endNum = Number(value);
                if (isNaN(endNum) || endNum <= 0) {
                  return;
                }
                parsedEvent.end = endNum * 1000;
                break;
              case "d":
                parsedEvent.id = value;
                break;
              case "name":
                parsedEvent.title = value;
                break;
              case "r":
                parsedEvent.reference.push(value);
                break;
              case "image":
                parsedEvent.image = value;
                break;
              case "t":
                parsedEvent.categories.push(value);
                break;
              case "location":
                parsedEvent.location.push(value);
                break;
              case "p":
                parsedEvent.participants.push(value);
                break;
              case "g":
                parsedEvent.geoHash.push(value);
                break;
              case "rsvp":
                try {
                  const rsvpData = JSON.parse(value) as {
                    participantId: string;
                    response: RSVPResponse;
                    timestamp: number;
                  };
                  parsedEvent.rsvpResponses.push(rsvpData);
                } catch (error) {
                  console.warn("Failed to parse RSVP data:", value);
                }
                break;
            }
          });

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
      }
    );
  },
  clearEvents: () => set({ events: [], eventById: {} }),
}));
