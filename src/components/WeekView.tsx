import { alpha, Box, Divider, Typography, useTheme } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { getTimeFromCell, layoutDayEvents } from "../common/calendarEngine";
import { CalendarEventCard } from "./CalendarEvent";
import { DateLabel } from "./DateLabel";
import { isWeekend } from "../utils/dateHelper";
import { StyledSecondaryHeader } from "./StyledComponents";
import { TimeMarker } from "./TimeMarker";
import { useRef, useState } from "react";
import CalendarEventEdit from "./CalendarEventEdit";
import { ViewProps } from "./SwipeableView";

dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const WeekHeader = ({ date }: { date: Dayjs }) => {
  const start = date.startOf("week");
  const days = Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
  const theme = useTheme();
  return (
    <StyledSecondaryHeader
      zIndex={1}
      topOffset={40 + 8}
      textAlign="center"
      display="grid"
      gridTemplateColumns="repeat(7, 1fr)"
      flexDirection={"row"}
      alignItems={"center"}
      paddingY={theme.spacing(1)}
      bgcolor={"white"}
      paddingLeft={"60px"}
    >
      {days.map((day) => (
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
          <Typography variant="body1" fontWeight={600}>
            {day.format("ddd")}
          </Typography>
          <DateLabel day={day}></DateLabel>
        </Box>
      ))}
    </StyledSecondaryHeader>
  );
};

export function WeekView({ events, date }: ViewProps) {
  const start = date.startOf("week");

  const days = Array.from({ length: 7 }, (_, i) => start.add(i, "day"));

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedDateTime, setClickedDateTime] = useState<number | undefined>();

  const handleCellClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const time = getTimeFromCell(event, containerRef, 1);
    if (time) {
      setClickedDateTime(time);
    }
    setDialogOpen(true);
  };

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
        <Box width={60}>
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
                ref={containerRef}
                sx={{
                  cursor: "pointer",
                  background: isWeekend(day)
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                }}
              >
                {/* Day header */}

                <TimeMarker />
                {Array.from({ length: 24 }).map((_, h) => (
                  <Box
                    onClick={handleCellClick}
                    data-date={day.format("YYYY-MM-DD")}
                    key={h}
                    height={60}
                    px={0.5}
                  >
                    <Divider />
                  </Box>
                ))}
                {laidOut.map((e) => (
                  <CalendarEventCard key={e.id} event={e} />
                ))}
                {dialogOpen && (
                  <CalendarEventEdit
                    open={dialogOpen}
                    event={null}
                    initialDateTime={clickedDateTime}
                    onClose={() => setDialogOpen(false)}
                    mode="create"
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </DndContext>
  );
}
