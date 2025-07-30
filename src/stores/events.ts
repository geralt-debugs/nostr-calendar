import { Event } from "nostr-tools";
import { create } from "zustand";
import { fetchCalendarEvents } from "../common/nostr";
import { isValid } from "date-fns";
import { appendOne, denormalize, normalize, removeOne } from "normal-store";
import { SubCloser } from "nostr-tools/abstract-pool";

export interface ICalendarEvent {
  begin: number;
  description: string;
  end: number;
  id: string;
  title: string;
  createdAt: number;
  categories: string[];
  reference: string[];
  image?: string;
  location: string[];
  geoHash: string[];
  website: string;
  user: string;
}

let subscriptionCloser: SubCloser | undefined;

export const useTimeBasedEvents = create<{
  events: ICalendarEvent[];
  eventById: Record<string, ICalendarEvent>;
  fetchEvents: () => void;
}>((set) => ({
  events: [],
  eventIds: [],
  eventById: {},
  fetchEvents: () => {
    if (subscriptionCloser) {
      console.log("closing previous subscription");
      subscriptionCloser.close();
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
            case "g":
              parsedEvent.geoHash.push(value);
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
