import { Box, Divider, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { ICalendarEvent } from "../utils/types";
import React from "react";
import { Layout } from "../hooks/useLayout";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { PX_PER_MINUTE } from "../utils/constants";
import { layoutDayEvents } from "../common/calendarEngine";
import { CalendarEvent } from "./CalendarEvent";

dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface WeekViewProps {
  date: Dayjs;
  events: ICalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<ICalendarEvent[]>>;
  setView: (v: Layout) => void;
  setDate: (d: Dayjs) => void;
}

export function WeekView({
  date,
  events,
  setEvents,
  setView,
  setDate,
}: WeekViewProps) {
  const start = date.startOf("week");
  const days = Array.from({ length: 7 }, (_, i) => start.add(i, "day"));

  const onDragEnd = ({ delta, active }: DragEndEvent) => {
    if (!delta.y) return;
    setEvents((prev) =>
      prev.map((e) =>
        e.id === active.id
          ? {
              ...e,
              start: dayjs(e.begin)
                .add(delta.y / PX_PER_MINUTE, "minute")
                .toDate()
                .getTime(),
              end: dayjs(e.end)
                .add(delta.y / PX_PER_MINUTE, "minute")
                .toDate()
                .getTime(),
            }
          : e,
      ),
    );
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <Box display="flex" height={24 * 60}>
        {/* Time column */}
        <Box width={60} borderRight="1px solid #ddd">
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
                onDoubleClick={() => {
                  setDate(day);
                  setView("day");
                }}
              >
                {/* Day header */}
                <Box
                  position="sticky"
                  top={0}
                  zIndex={1}
                  bgcolor="background.paper"
                  borderBottom="1px solid #ddd"
                  textAlign="center"
                >
                  <Typography variant="caption" fontWeight={600}>
                    {day.format("ddd D")}
                  </Typography>
                </Box>
                {Array.from({ length: 24 }).map((_, h) => (
                  <Box key={h} height={60} px={0.5}>
                    <Divider />
                  </Box>
                ))}
                {laidOut.map((e) => (
                  <CalendarEvent
                    key={e.id}
                    event={e}
                    onClick={() => setDate(day)}
                  />
                ))}
              </Box>
            );
          })}
        </Box>
      </Box>
    </DndContext>
  );
}
