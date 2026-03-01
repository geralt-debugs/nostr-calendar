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

/**
 * Calculate the start timestamp of the Nth occurrence of a recurring event.
 */
function getOccurrenceStart(
  eventStart: Date,
  freq: RepeatingFrequency,
  occurrences: number,
): number {
  const interval = 1;
  const d = new Date(eventStart);
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
    case RepeatingFrequency.Weekday: {
      const weekdaysToAdd = interval * occurrences;
      let totalDays = 0;
      let added = 0;
      while (added < weekdaysToAdd) {
        totalDays++;
        const test = new Date(eventStart.getTime());
        test.setUTCDate(test.getUTCDate() + totalDays);
        const day = test.getUTCDay();
        if (day !== 0 && day !== 6) added++;
      }
      d.setUTCDate(d.getUTCDate() + totalDays);
      break;
    }
  }
  return d.getTime();
}

/**
 * Estimate how many occurrences have elapsed between event start and a given time.
 */
function estimateOccurrencesToSkip(
  eventStart: Date,
  rangeStartDate: Date,
  freq: RepeatingFrequency,
): number {
  const interval = 1;
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
    case RepeatingFrequency.Weekday: {
      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
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
  }

  return Math.max(0, occurrencesToSkip);
}

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
  const eventStart = new Date(begin);
  const rangeStartDate = new Date(rangeStart);

  const occurrencesToSkip = estimateOccurrencesToSkip(
    eventStart,
    rangeStartDate,
    freq,
  );

  // Compute the first possible occurrence within or after rangeStart
  const nextStart = getOccurrenceStart(eventStart, freq, occurrencesToSkip);
  const nextEnd = nextStart + duration;

  // If the first computed occurrence ends before the range, try the next one
  if (nextEnd < rangeStart) {
    const nextNextStart = getOccurrenceStart(
      eventStart,
      freq,
      occurrencesToSkip + 1,
    );
    const nextNextEnd = nextNextStart + duration;
    return nextNextStart <= rangeEnd && nextNextEnd >= rangeStart;
  }

  // Otherwise, check this occurrence
  return nextStart <= rangeEnd && nextEnd >= rangeStart;
}

/**
 * Get the start timestamp of the next occurrence of a recurring event
 * that falls within [rangeStart, rangeEnd], or null if none.
 */
export function getNextOccurrenceInRange(
  event: ICalendarEvent,
  rangeStart: number,
  rangeEnd: number,
): number | null {
  const { begin, repeat } = event;

  if (!repeat?.frequency || repeat.frequency === RepeatingFrequency.None) {
    // Non-repeating: return begin if it's in range
    if (begin >= rangeStart && begin <= rangeEnd) {
      return begin;
    }
    return null;
  }

  const freq = repeat.frequency;
  const eventStart = new Date(begin);
  const rangeStartDate = new Date(rangeStart);

  const occurrencesToSkip = estimateOccurrencesToSkip(
    eventStart,
    rangeStartDate,
    freq,
  );

  // Check this occurrence and the next (in case estimate is off by one)
  for (let i = 0; i <= 1; i++) {
    const start = getOccurrenceStart(eventStart, freq, occurrencesToSkip + i);
    if (start >= rangeStart && start <= rangeEnd) {
      return start;
    }
  }

  return null;
}
