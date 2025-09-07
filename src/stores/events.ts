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

export type RSVPResponse = "accepted" | "declined" | "maybe" | "pending";

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

const processPrivateEvent = (event: Event) => {
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
        parsedEvent.begin = Number(value) * 1000;
        break;
      case "end":
        parsedEvent.end = Number(value) * 1000;
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
          const rsvpData = JSON.parse(value) as { participantId: string; response: RSVPResponse; timestamp: number };
          parsedEvent.rsvpResponses.push(rsvpData);
        } catch (error) {
          console.warn("Failed to parse RSVP data:", value);
        }
        break;
    }
  });

  if (
    !isValid(new Date(parsedEvent.begin)) ||
    !isValid(new Date(parsedEvent.end))
  ) {
    console.warn("invalid date", parsedEvent, event);
  } else {
    if (store.allKeys.includes(parsedEvent.id)) {
      const previousEvent = store.byKey[event.id];
      if (parsedEvent.createdAt > previousEvent.createdAt) {
        store = removeOne(store, event.id);
        store = appendOne(store, event.id, parsedEvent);
      }
    } else {
      store = appendOne(store, event.id, parsedEvent);
    }
  }
  useTimeBasedEvents.setState({
    eventById: store.byKey,
    events: denormalize(store),
  });
};

const processedEventIds: string[] = [];

const processGiftWraps = (rumor: { viewKey: string; eventId: string }) => {
  if (processedEventIds.includes(rumor.eventId)) {
    return;
  }
  processedEventIds.push(rumor.eventId);
  fetchPrivateCalendarEvents({ eventIds: [rumor.eventId] }, async (event) => {
    const decryptedEvent = await viewPrivateEvent(event, rumor.viewKey);
    processPrivateEvent(decryptedEvent);
  });
};

export const useTimeBasedEvents = create<{
  events: ICalendarEvent[];
  eventById: Record<string, ICalendarEvent>;
  fetchEvents: () => void;
  fetchPrivateEvents: () => void;
}>((set) => ({
  events: [],
  eventIds: [],
  eventById: {},
  async fetchPrivateEvents() {
    if (privateSubloser) {
      return;
    }
    const userPublicKey = await getUserPublicKey();
    privateSubloser = fetchCalendarGiftWraps(
      { participants: [userPublicKey] },
      (event) => {
        processGiftWraps(event);
      },
    );
  },
  fetchEvents: () => {
    if (subscriptionCloser) {
      return;
    }
    subscriptionCloser = fetchCalendarEvents((event: Event) => {
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
              parsedEvent.begin = Number(value) * 1000;
              break;
            case "end":
              parsedEvent.end = Number(value) * 1000;
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
                const rsvpData = JSON.parse(value) as { participantId: string; response: RSVPResponse; timestamp: number };
                parsedEvent.rsvpResponses.push(rsvpData);
              } catch (error) {
                console.warn("Failed to parse RSVP data:", value);
              }
              break;
          }
        });

        if (
          !isValid(new Date(parsedEvent.begin)) ||
          !isValid(new Date(parsedEvent.end))
        ) {
          console.warn("invalid date", parsedEvent, event);
          return { events, eventById };
        }
        if (store.allKeys.includes(parsedEvent.id)) {
          const previousEvent = store.byKey[event.id];
          if (parsedEvent.createdAt > previousEvent.createdAt) {
            store = removeOne(store, event.id);
            store = appendOne(store, event.id, parsedEvent);
          }
        } else {
          store = appendOne(store, event.id, parsedEvent);
        }
        return {
          eventById: store.byKey,
          events: denormalize(store),
        };
      });
    });
  },
  clearEvents: () => set({ events: [], eventById: {} }),
}));
