import { Event } from "nostr-tools";
import { create } from "zustand";
import { fetchCalendarEvents } from "../common/nostr";
import { isValid } from "date-fns";

let areEventsFetching = false;

export interface ICalendarEvent {
  begin: number;
  description: string;
  end: number;
  id: string;
  title: string;
}
export const useTimeBasedEvents = create<{
  events: ICalendarEvent[];
  fetchEvents: () => void;
}>((set) => ({
  events: [],
  fetchEvents: () => {
    if (areEventsFetching) {
      return;
    }
    areEventsFetching = true;
    fetchCalendarEvents((event: Event) => {
      set(({ events }) => {
        const parsedEvent = {
          description: event.content,
          begin: 0,
          end: 0,
          id: "",
          title: "",
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
          console.warn("invalid date", parsedEvent);
          return { events };
        }

        return { events: [...events, parsedEvent] };
      });
    });
  },
  clearEvents: () => set({ events: [] }),
}));
