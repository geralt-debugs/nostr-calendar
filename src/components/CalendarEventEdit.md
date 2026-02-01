# CalendarEventEdit Component

A reusable component for creating and editing calendar events without using global state.

## Features

- **No Global State**: Accepts event data as props instead of using `useEventDetails` store
- **Create and Edit Modes**: Can be used for both creating new events and editing existing ones
- **Date/Time from Click**: Receives initial date/time from where user clicked on the calendar
- **All CalendarEvent Fields**: Supports all fields displayed in CalendarEvent component:
  - Title
  - Description
  - Image URL
  - Begin/End date and time
  - Location
  - Participants (with add/remove)
  - Recurring frequency
  - Privacy (public/private)

## Props

```typescript
interface CalendarEventEditProps {
  open: boolean; // Control dialog visibility
  event: ICalendarEvent | null; // Event to edit (null for new event)
  initialDateTime?: number; // Unix timestamp for initial date/time (for new events)
  onClose: () => void; // Called when dialog closes
  onSave?: (event: ICalendarEvent) => void; // Called after successful save
  mode?: "create" | "edit"; // Mode: "create" (default) or "edit"
}
```

## Usage Examples

### Example 1: Create New Event from Week/Day View Click

```tsx
import { useState } from "react";
import { CalendarEventEdit } from "./CalendarEventEdit";
import { ICalendarEvent } from "../utils/types";

function WeekView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedDateTime, setClickedDateTime] = useState<number | undefined>();

  const handleCellClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Calculate date/time from click position
    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;

    // Assuming 60px per hour
    const hour = Math.floor(clickY / 60);
    const minute = Math.floor((clickY % 60) / 30) * 30; // Round to nearest 30 min

    // Get date from the cell's data
    const cellDate = new Date(event.currentTarget.dataset.date!);
    const clickedDate = new Date(
      cellDate.getFullYear(),
      cellDate.getMonth(),
      cellDate.getDate(),
      hour,
      minute,
    );

    setClickedDateTime(clickedDate.getTime());
    setDialogOpen(true);
  };

  const handleSave = (savedEvent: ICalendarEvent) => {
    console.log("Event saved:", savedEvent);
    // Refresh events or update state
  };

  return (
    <>
      {/* Calendar cells with click handlers */}
      <div onClick={handleCellClick} data-date="2026-02-01">
        {/* ... cell content ... */}
      </div>

      <CalendarEventEdit
        open={dialogOpen}
        event={null}
        initialDateTime={clickedDateTime}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        mode="create"
      />
    </>
  );
}
```

### Example 2: Edit Existing Event

```tsx
import { useState } from "react";
import { CalendarEventEdit } from "./CalendarEventEdit";
import { ICalendarEvent } from "../utils/types";

function EventCard({ event }: { event: ICalendarEvent }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div onClick={() => setDialogOpen(true)}>{event.title}</div>

      <CalendarEventEdit
        open={dialogOpen}
        event={event}
        onClose={() => setDialogOpen(false)}
        onSave={(updatedEvent) => {
          console.log("Event updated:", updatedEvent);
        }}
        mode="edit"
      />
    </>
  );
}
```

### Example 3: Direct Date/Time Passing (No Dataset)

```tsx
function DayViewCell({ date, hour }: { date: Date; hour: number }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialTime, setInitialTime] = useState<number>();

  const handleClick = (minute: number) => {
    const clickedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute,
    );
    setInitialTime(clickedDate.getTime());
    setDialogOpen(true);
  };

  return (
    <>
      <div onClick={() => handleClick(0)}>{/* Hour slot */}</div>

      <CalendarEventEdit
        open={dialogOpen}
        event={null}
        initialDateTime={initialTime}
        onClose={() => setDialogOpen(false)}
        mode="create"
      />
    </>
  );
}
```

## Key Differences from CalendarEventDialog

1. **No Global State**: Does not use `useEventDetails` store
2. **Prop-based**: Event data passed as props
3. **Flexible DateTime**: Accepts `initialDateTime` prop instead of using HTML dataset
4. **Callback Pattern**: Uses `onSave` callback for parent component to handle save
5. **Controlled**: Parent component controls open/close state

## Integration with Week/Day Views

The Week/Day views should:

1. Calculate the date/time from click position
2. Pass calculated timestamp to `initialDateTime` prop
3. Handle the dialog state (`open`/`onClose`)
4. Optionally handle the `onSave` callback to refresh events

```tsx
// Example calculation in WeekView
const handleDayClick = (event: React.MouseEvent, dayDate: Date) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const clickY = event.clientY - rect.top;
  const pixelsPerHour = 60;
  const hour = Math.min(Math.floor(clickY / pixelsPerHour), 23);
  const minuteInHour = clickY % pixelsPerHour;
  const minute = Math.floor(minuteInHour / 30) * 30; // Round to 30-min intervals

  const clickedDateTime = new Date(
    dayDate.getFullYear(),
    dayDate.getMonth(),
    dayDate.getDate(),
    hour,
    minute,
  );

  setInitialDateTime(clickedDateTime.getTime());
  setDialogOpen(true);
};
```

## Notes

- Default event duration is 1 hour
- Uses native HTML date/time inputs instead of custom components
- Maintains the same styling as CalendarEventDialog
- Publishes events to Nostr (private or public based on toggle)
- Validates that title is present and end time is after start time
