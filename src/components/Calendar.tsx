import { useTimeBasedEvents } from "../stores/events";
import { useSettings } from "../stores/settings";
import { useUser } from "../stores/user";
import { DayView } from "./DayView";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { useLayout } from "../hooks/useLayout";
import { CalendarHeader } from "./CalendarHeader";
import { Box } from "@mui/material";
import { SwipeableView } from "./SwipeableView";

function Calendar() {
  // const { history, match } = props
  // const theme = useTheme()
  const {
    settings: { filters },
  } = useSettings((state) => state);
  const { user } = useUser();
  const events = useTimeBasedEvents((state) => state);
  if (filters?.showPublicEvents) {
    events.fetchEvents();
  }
  if (user) {
    events.fetchPrivateEvents();
  }

  const { layout } = useLayout();

  return (
    <Box p={2}>
      <CalendarHeader />
      {layout === "day" && (
        <SwipeableView View={DayView} events={events.events} />
      )}
      {layout === "week" && (
        <SwipeableView View={WeekView} events={events.events} />
      )}
      {layout === "month" && <MonthView events={events.events} />}
    </Box>
  );
}

// export default withRouter(Calendar)
export default Calendar;
