import { Box, Paper, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { ICalendarEvent } from "../utils/types";
import { Layout } from "../hooks/useLayout";
import { DateLabel } from "./DateLabel";

interface MonthViewProps {
  date: Dayjs;
  events: ICalendarEvent[];
  setDate: (d: Dayjs) => void;
  setView: (v: Layout) => void;
}

export function MonthView({ date, events, setDate, setView }: MonthViewProps) {
  const start = date.startOf("month").startOf("week");
  const end = date.endOf("month").endOf("week");

  const days: Dayjs[] = [];
  let d = start;
  while (d.isBefore(end)) {
    days.push(d);
    d = d.add(1, "day");
  }

  return (
    <Box display="grid" gridTemplateColumns="repeat(7, 1fr)">
      {days.map((day) => (
        <Paper
          key={day.toString()}
          sx={{ minHeight: 120, p: 0.5 }}
          onClick={() => {
            setDate(day);
            setView("week");
          }}
        >
          <DateLabel day={day} />
          <Box display={"flex"} flexDirection={"column"}>
            {events
              .filter((e) => dayjs(e.begin).isSame(day, "day"))
              .slice(0, 3)
              .map((e) => (
                <Typography key={e.id} variant="caption" noWrap>
                  • {e.title}
                </Typography>
              ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
