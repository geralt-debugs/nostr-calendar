import { ICalendarEvent } from "../utils/types";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { PX_PER_MINUTE } from "../utils/constants";
import { RefObject } from "react";

dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export interface PositionedEvent extends ICalendarEvent {
  top: number;
  height: number;
  col: number;
  colSpan: number;
}

export function layoutDayEvents(events: ICalendarEvent[]): PositionedEvent[] {
  const sorted = [...events].sort(
    (a, b) => dayjs(a.begin).valueOf() - dayjs(b.begin).valueOf(),
  );
  const columns: ICalendarEvent[][] = [];

  sorted.forEach((event) => {
    let placed = false;
    for (const col of columns) {
      if (dayjs(col[col.length - 1].end).isSameOrBefore(dayjs(event.begin))) {
        col.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([event]);
  });

  const colSpan = columns.length;

  const DAY_MINUTES = 24 * 60;

  return columns.flatMap((col, colIndex) =>
    col.map((e) => {
      const startMinutes = dayjs(e.begin).hour() * 60 + dayjs(e.begin).minute();
      const rawDuration = dayjs(e.end).diff(dayjs(e.begin), "minute");

      const clippedDuration = Math.max(
        0,
        Math.min(rawDuration, DAY_MINUTES - startMinutes),
      );
      return {
        ...e,
        col: colIndex,
        colSpan,
        top: dayjs(e.begin).hour() * 60 + dayjs(e.begin).minute(),
        height: clippedDuration * PX_PER_MINUTE,
      };
    }),
  );
}

export const getTimeFromCell = (
  event: React.MouseEvent<HTMLDivElement>,
  containerRef: RefObject<HTMLDivElement | null>,
  offsetHours = 0,
) => {
  if (containerRef.current) {
    // Calculate date/time from click position
    const rect = containerRef.current.getBoundingClientRect();
    const clickY = event.clientY - rect.top;

    // Assuming 60px per hour
    const hour = Math.floor(clickY / 60) - offsetHours;
    const minute = Math.floor((clickY % 60) / 30) * 30; // Round to nearest 30 min

    // Get date from the cell's data
    const cellDate = new Date(event.currentTarget.dataset.date!);
    const clickedDate = new Date(
      cellDate.getFullYear(),
      cellDate.getMonth(),
      cellDate.getDate(),
      hour,
      minute,
    );

    return clickedDate.getTime();
  }
  return null;
};
