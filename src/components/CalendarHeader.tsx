import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import {
  Box,
  IconButton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Layout } from "../hooks/useLayout";
import { Dayjs } from "dayjs";

interface CalendarHeaderProps {
  view: Layout;
  date: Dayjs;
  setDate: (d: Dayjs) => void;
  setView: (v: Layout) => void;
}

export function CalendarHeader({
  view,
  date,
  setDate,
  setView,
}: CalendarHeaderProps) {
  const move = (dir: number) => setDate(date.add(dir, view));

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Box display="flex" alignItems="center">
        <IconButton onClick={() => move(-1)}>
          <ChevronLeft />
        </IconButton>
        <IconButton onClick={() => move(1)}>
          <ChevronRight />
        </IconButton>
        <Typography ml={2} fontWeight={600}>
          {view === "month" && date.format("MMMM YYYY")}
          {view === "week" &&
            `${date.startOf("week").format("MMM D")} – ${date.endOf("week").format("MMM D")}`}
          {view === "day" && date.format("MMMM D, YYYY")}
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(_, v) => v && setView(v)}
      >
        <ToggleButton value="day">Day</ToggleButton>
        <ToggleButton value="week">Week</ToggleButton>
        <ToggleButton value="month">Month</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
