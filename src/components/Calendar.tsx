import { useState } from "react";
import dictionary from "../common/dictionary";
import { de } from "date-fns/locale/de"; // <<<< I18N   (DO NOT REMOVE!!!)
import { CalendarContext } from "../common/CalendarContext";
import CalendarEventViewDialog from "./CalendarEventViewDialog";
import CalendarEventDialog from "./CalendarEventDialog";
import { useTimeBasedEvents } from "../stores/events";
import { useSettings } from "../stores/settings";
import { useUser } from "../stores/user";
import { DayView } from "./DayView";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { useLayout } from "../hooks/useLayout";
import { CalendarHeader } from "./CalendarHeader";

let _locale =
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  "en-US";
_locale = ~Object.keys(dictionary).indexOf(_locale) ? _locale : "en-US";

const locale = _locale === "de-DE" ? de : null;

const openDialog = false;
const openViewDialog = false;
const selectedDate = new Date();
const defaultEventDuration = 60; // in minutes

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

  const [stateCalendar, setStateCalendar] = useState({
    selectedDate,
    locale,
    i18nLocale: _locale,
    openDialog,
    openViewDialog,
    eventBeginDate: null,
    eventBeginTime: { value: null, label: null },
    eventEndDate: null,
    eventEndTime: { value: null, label: null },
    defaultEventDuration,
    modal: false,
    eventDialogMaxWidth: "md",
    fullscreen: false,
    allowFullScreen: false,
    withCloseIcon: true,
    title: "",
    content: "",
    actions: "",
    calendarEvent: {},
    draggingEventId: -1,
    startDragging: false,
    ghostProperties: { width: 0, height: 0, date: new Date() },
    // handleCloseDialog,
    // handleCloseViewDialog,
  });

  return (
    <CalendarContext.Provider value={{ stateCalendar, setStateCalendar }}>
      <Box p={2}>
        <CalendarHeader />
        {layout === "day" && <DayView events={events.events} />}
        {layout === "week" && <WeekView events={events.events} />}
        {layout === "month" && <MonthView events={events.events} />}
      </Box>
      <CalendarEventDialog />
      <CalendarEventViewDialog />
    </CalendarContext.Provider>
  );
}

// export default withRouter(Calendar)
export default Calendar;
