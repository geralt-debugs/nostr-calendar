import { useDraggable } from "@dnd-kit/core";
import { Paper, Typography } from "@mui/material";
import { ICalendarEvent } from "../utils/types";
import { PositionedEvent } from "../common/calendarEngine";

interface CalendarEventProps {
  event: PositionedEvent;
  onClick: (e: ICalendarEvent) => void;
}

export function CalendarEvent({ event, onClick }: CalendarEventProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: event.id });

  return (
    <Paper
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onClick(event)}
      sx={{
        position: "absolute",
        top: event.top,
        left: `${(event.col / event.colSpan) * 100}%`,
        width: `${100 / event.colSpan}%`,
        height: event.height,
        bgcolor: "primary.light",
        p: 0.5,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <Typography variant="caption" fontWeight={600}>
        {event.title}
      </Typography>
    </Paper>
  );
}
