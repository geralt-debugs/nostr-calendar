import { ICalendarEvent } from "../utils/types";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { PX_PER_MINUTE } from "../utils/constants";

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

  return columns.flatMap((col, colIndex) =>
    col.map((e) => ({
      ...e,
      col: colIndex,
      colSpan,
      top: dayjs(e.begin).hour() * 60 + dayjs(e.begin).minute(),
      height: dayjs(e.end).diff(dayjs(e.begin), "minute") * PX_PER_MINUTE,
    })),
  );
}
