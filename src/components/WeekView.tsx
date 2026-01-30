import { alpha, Box, Divider, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { ICalendarEvent } from "../utils/types";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { layoutDayEvents } from "../common/calendarEngine";
import { CalendarEventCard } from "./CalendarEvent";
import { DateLabel } from "./DateLabel";
import { useDateWithRouting } from "../hooks/useDateWithRouting";
import { isWeekend } from "../utils/dateHelper";
import { StyledSecondaryHeader } from "./StyledComponents";
import { TimeMarker } from "./TimeMarker";

dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface WeekViewProps {
  events: ICalendarEvent[];
}

export function WeekView({ events }: WeekViewProps) {
  const { date } = useDateWithRouting();
  const start = date.startOf("week");
  const days = Array.from({ length: 7 }, (_, i) => start.add(i, "day"));

  const onDragEnd = ({ delta, active }: DragEndEvent) => {
    if (!delta.y) return;
    // setEvents((prev) =>
    //   prev.map((e) =>
    //     e.id === active.id
    //       ? {
    //           ...e,
    //           start: dayjs(e.begin)
    //             .add(delta.y / PX_PER_MINUTE, "minute")
    //             .toDate()
    //             .getTime(),
    //           end: dayjs(e.end)
    //             .add(delta.y / PX_PER_MINUTE, "minute")
    //             .toDate()
    //             .getTime(),
    //         }
    //       : e,
    //   ),
    // );
  };
  const theme = useTheme();

  return (
    <DndContext onDragEnd={onDragEnd}>
      <Box display="flex" height={24 * 60}>
        {/* Time column */}
        <Box width={60} marginTop={"65px"}>
          {Array.from({ length: 24 }).map((_, h) => (
            <Box key={h} height={60} px={0.5}>
              <Typography variant="caption">{h}:00</Typography>
            </Box>
          ))}
        </Box>

        {/* Days */}
        <Box flex={1} display="grid" gridTemplateColumns="repeat(7, 1fr)">
          {days.map((day) => {
            const laidOut = layoutDayEvents(
              events.filter((e) => dayjs(e.begin).isSame(day, "day")),
            );

            return (
              <Box
                key={day.toString()}
                position="relative"
                borderLeft="1px solid #eee"
                sx={{
                  background: isWeekend(day)
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                }}
              >
                {/* Day header */}
                <StyledSecondaryHeader
                  zIndex={1}
                  topOffset={40 + 8}
                  textAlign="center"
                  display={"flex"}
                  flexDirection={"column"}
                  alignItems={"center"}
                  paddingY={theme.spacing(1)}
                  bgcolor={"white"}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {day.format("ddd")}
                  </Typography>
                  <DateLabel day={day}></DateLabel>
                </StyledSecondaryHeader>
                <TimeMarker offset={"76px"} />
                {Array.from({ length: 24 }).map((_, h) => (
                  <Box key={h} height={60} px={0.5}>
                    <Divider />
                  </Box>
                ))}
                {laidOut.map((e) => (
                  <CalendarEventCard key={e.id} event={e} />
                ))}
              </Box>
            );
          })}
        </Box>
      </Box>
    </DndContext>
  );
}
