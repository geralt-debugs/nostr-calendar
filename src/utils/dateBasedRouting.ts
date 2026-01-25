import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Layout } from "../hooks/useLayout";

dayjs.extend(utc);

type DayRouteParams = {
  year: string;
  month: string;
  day: string;
};

type MonthRouteParams = {
  year: string;
  monthNumber: string;
};

type WeekRouteParams = {
  year: string;
  weekNumber: string;
};

type CalendarRouteParams =
  | Partial<DayRouteParams>
  | Partial<MonthRouteParams>
  | Partial<WeekRouteParams>;

export function getDateFromRoute(params: CalendarRouteParams): Dayjs {
  const { year } = params;

  // Day route: /d/:year/:month/:day
  if (year && "month" in params && "day" in params) {
    return dayjs(`${year}-${params.month}-${params.day}`);
  }

  // Month route: /m/:year/:monthNumber
  if (year && "monthNumber" in params) {
    // default to 1st of the month
    return dayjs(`${year}-${params.monthNumber}-01`);
  }

  // Week route: /w/:year/:weekNumber
  if (year && "weekNumber" in params) {
    // ISO week → Monday
    return dayjs()
      .utc()
      .year(Number(year))
      .week(Number(params.weekNumber))
      .startOf("week");
  }

  // fallback (optional)
  return dayjs();
}

export function getRouteFromDate(date: Dayjs, type: Layout): string {
  const year = date.year();

  switch (type) {
    case "day": {
      const month = date.month() + 1; // dayjs months are 0-based
      const day = date.date();

      return `/d/${year}/${month}/${day}`;
    }

    case "month": {
      const month = date.month() + 1;

      return `/m/${year}/${month}`;
    }

    case "week": {
      const weekNumber = date.week();

      return `/w/${year}/${weekNumber}`;
    }
  }
}
