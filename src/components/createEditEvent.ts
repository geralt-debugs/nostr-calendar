import { getYear, getMonth, getDate, addMinutes, format } from "date-fns";
import { ICalendarEvent } from "../stores/events";
import { TEMP_CALENDAR_ID } from "../stores/eventDetails";

export default function createEditEvent({
  calendarEvent,
  defaultEventDuration,
  event,
}: {
  calendarEvent?: ICalendarEvent;
  defaultEventDuration: number;
  event: React.MouseEvent<HTMLDivElement>;
}): ICalendarEvent | null {
  if (calendarEvent) {
    return {
      ...calendarEvent,
    };
  }

  if (!event.currentTarget.dataset || !event.currentTarget.dataset.date) {
    return null;
  }

  let datasetDate = new Date(event.currentTarget.dataset.date);

  let position =
    event.clientY - event.currentTarget.getBoundingClientRect().top;
  if (Object.keys(event.currentTarget.dataset).length === 0) {
    position =
      event.clientY -
      (event.clientY - +event.currentTarget.style.marginTop.replace("px", ""));
    if (!event.currentTarget.parentElement?.dataset?.date) {
      return null;
    }
    datasetDate = new Date(event.currentTarget.parentElement.dataset.date);
  }

  const hour = Math.trunc(position / 60);
  const isHalfHour = Math.trunc(position / 30) % 2 === 0 ? false : true;
  const minute = isHalfHour ? 30 : 0;

  const eventBeginDate = new Date(
    getYear(datasetDate),
    getMonth(datasetDate),
    getDate(datasetDate),
    hour > 23 ? 23 : hour,
    hour > 23 ? 30 : minute,
  );
  const eventEndDate = addMinutes(eventBeginDate, defaultEventDuration);
  return {
    begin: eventBeginDate.getTime(),
    end: eventEndDate.getTime(),
    id: TEMP_CALENDAR_ID,
    title: "",
    createdAt: Date.now(),
    description: "",
  };
}
