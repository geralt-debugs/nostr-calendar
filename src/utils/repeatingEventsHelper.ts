import { ICalendarEvent } from "../stores/events";
import { RepeatingFrequency } from "./types";

export const getRepeatFrequency = (
  repeatValue: string,
): RepeatingFrequency | null => {
  const value = Object.values(RepeatingFrequency).find(
    (val) => val === repeatValue,
  );
  if (!value) {
    return null;
  }
  return value as RepeatingFrequency;
};

export function isEventInDateRange(
  event: ICalendarEvent,
  rangeStart: number,
  rangeEnd: number,
): boolean {
  const { begin, end, repeat } = event;
  const duration = end - begin;

  // Non-repeating: simple overlap check
  if (!repeat?.frequency || repeat.frequency === RepeatingFrequency.None) {
    return (
      (begin >= rangeStart && begin <= rangeEnd) ||
      (end >= rangeStart && end <= rangeEnd) ||
      (begin <= rangeStart && end >= rangeEnd)
    );
  }

  const freq = repeat.frequency;
  const interval = 1; // default to every 1 frequency unit
  // const interval = repeat.interval ?? 1; // default to every 1 frequency unit

  const eventStart = new Date(begin);
  const rangeStartDate = new Date(rangeStart);

  // Helper to calculate the next occurrence start timestamp
  const getNextOccurrenceStart = (
    startDate: Date,
    occurrences: number,
  ): number => {
    const d = new Date(startDate);
    switch (freq) {
      case RepeatingFrequency.Daily:
        d.setUTCDate(d.getUTCDate() + interval * occurrences);
        break;
      case RepeatingFrequency.Weekly:
        d.setUTCDate(d.getUTCDate() + 7 * interval * occurrences);
        break;
      case RepeatingFrequency.Monthly:
        d.setUTCMonth(d.getUTCMonth() + interval * occurrences);
        break;
      case RepeatingFrequency.Quarterly:
        d.setUTCMonth(d.getUTCMonth() + 3 * interval * occurrences);
        break;
      case RepeatingFrequency.Yearly:
        d.setUTCFullYear(d.getUTCFullYear() + interval * occurrences);
        break;
      case RepeatingFrequency.Weekday:
        // Weekday recurrence = Mon–Fri only (skip weekends)
        // 1 "interval" means +N * weekdays (not calendar days)
        // Compute using weekday arithmetic:
        // eslint-disable-next-line no-case-declarations
        const weekdaysToAdd = interval * occurrences;
        // eslint-disable-next-line no-case-declarations
        let totalDays = 0;
        // eslint-disable-next-line no-case-declarations
        let added = 0;
        while (added < weekdaysToAdd) {
          totalDays++;
          const test = new Date(startDate.getTime());
          test.setUTCDate(test.getUTCDate() + totalDays);
          const day = test.getUTCDay();
          if (day !== 0 && day !== 6) added++;
        }
        d.setUTCDate(d.getUTCDate() + totalDays);
        break;
    }
    return d.getTime();
  };

  // How many recurrences have passed before the rangeStart?
  const diff = rangeStartDate.getTime() - eventStart.getTime();
  let occurrencesToSkip = 0;

  switch (freq) {
    case RepeatingFrequency.Daily:
      occurrencesToSkip = Math.floor(diff / (1000 * 60 * 60 * 24 * interval));
      break;
    case RepeatingFrequency.Weekly:
      occurrencesToSkip = Math.floor(
        diff / (1000 * 60 * 60 * 24 * 7 * interval),
      );
      break;
    case RepeatingFrequency.Monthly:
      occurrencesToSkip =
        ((rangeStartDate.getUTCFullYear() - eventStart.getUTCFullYear()) * 12 +
          (rangeStartDate.getUTCMonth() - eventStart.getUTCMonth())) /
        interval;
      occurrencesToSkip = Math.floor(occurrencesToSkip);
      break;
    case RepeatingFrequency.Quarterly:
      occurrencesToSkip =
        ((rangeStartDate.getUTCFullYear() - eventStart.getUTCFullYear()) * 12 +
          (rangeStartDate.getUTCMonth() - eventStart.getUTCMonth())) /
        (3 * interval);
      occurrencesToSkip = Math.floor(occurrencesToSkip);
      break;
    case RepeatingFrequency.Yearly:
      occurrencesToSkip =
        (rangeStartDate.getUTCFullYear() - eventStart.getUTCFullYear()) /
        interval;
      occurrencesToSkip = Math.floor(occurrencesToSkip);
      break;
    case RepeatingFrequency.Weekday:
      // Count only weekdays between event start and range start
      // eslint-disable-next-line no-case-declarations
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      // eslint-disable-next-line no-case-declarations
      let weekdayCount = 0;
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(eventStart.getTime());
        d.setUTCDate(d.getUTCDate() + i);
        const day = d.getUTCDay();
        if (day !== 0 && day !== 6) weekdayCount++;
      }
      occurrencesToSkip = Math.floor(weekdayCount / interval);
      break;
  }

  if (occurrencesToSkip < 0) occurrencesToSkip = 0;

  // Compute the first possible occurrence within or after rangeStart
  const nextStart = getNextOccurrenceStart(eventStart, occurrencesToSkip);
  const nextEnd = nextStart + duration;

  // If the first computed occurrence ends before the range, try the next one
  if (nextEnd < rangeStart) {
    const nextNextStart = getNextOccurrenceStart(
      eventStart,
      occurrencesToSkip + 1,
    );
    const nextNextEnd = nextNextStart + duration;
    return nextNextStart <= rangeEnd && nextNextEnd >= rangeStart;
  }

  // Otherwise, check this occurrence
  return nextStart <= rangeEnd && nextEnd >= rangeStart;
}
