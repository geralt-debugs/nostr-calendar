import { Box, Divider, Typography } from "@mui/material";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { ICalendarEvent } from "../utils/types";
import { layoutDayEvents } from "../common/calendarEngine";
import { CalendarEvent } from "./CalendarEvent";
import { DndContext } from "@dnd-kit/core";
import { useDateWithRouting } from "../hooks/useDateWithRouting";
import { TimeMarker } from "./TimeMarker";

dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface DayViewProps {
  events: ICalendarEvent[];
}

export function DayView({ events }: DayViewProps) {
  const { date } = useDateWithRouting();

  const dayEvents = layoutDayEvents(
    events.filter((e) => dayjs(e.begin).isSame(date, "day")),
  );

  return (
    <DndContext>
      <Box display="flex" height={24 * 60}>
        {/* Time column */}
        <Box width={60} borderRight="1px solid #ddd">
          {Array.from({ length: 24 }).map((_, h) => (
            <Box key={h} height={60} px={0.5}>
              <Typography variant="caption">{h}:00</Typography>
            </Box>
          ))}
        </Box>

        {/* Events */}
        <Box flex={1} position="relative" border="1px solid #eee">
          <TimeMarker offset="0px" />
          {/* Hour Divider */}
          <Box display={"flex"} flexDirection={"column"}>
            {Array.from({ length: 24 }).map((_, h) => (
              <Box key={h} height={60} px={0.5}>
                <Divider />
              </Box>
            ))}
          </Box>
          {dayEvents.map((e) => (
            <CalendarEvent key={e.id} event={e} onClick={() => {}} />
          ))}
        </Box>
      </Box>
    </DndContext>
  );
}
