import { Event } from "nostr-tools";
import { create } from "zustand";
import { fetchCalendarEvents } from "../common/nostr";
import { isValid } from "date-fns";
import { appendOne, denormalize, normalize, removeOne } from "normal-store";

let areEventsFetching = false;

export interface ICalendarEvent {
  begin: number;
  description: string;
  end: number;
  id: string;
  title: string;
  createdAt: number;
}

export const useTimeBasedEvents = create<{
  events: ICalendarEvent[];
  eventById: Record<string, ICalendarEvent>;
  fetchEvents: () => void;
}>((set) => ({
  events: [],
  eventIds: [],
  eventById: {},
  fetchEvents: () => {
    if (areEventsFetching) {
      return;
    }
    areEventsFetching = true;
    fetchCalendarEvents((event: Event) => {
      set(({ events, eventById }) => {
        let store = normalize(events);
        const parsedEvent = {
          description: event.content,
          begin: 0,
          end: 0,
          id: "",
          title: "",
          createdAt: event.created_at,
        };
        event.tags.forEach(([key, value]) => {
          if (key === "start") {
            parsedEvent.begin = Number(value) * 1000;
          } else if (key === "end") {
            parsedEvent.end = Number(value) * 1000;
          } else if (key === "d") {
            parsedEvent.id = value;
          } else if (key === "name") {
            parsedEvent.title = value;
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
