import { useState } from "react";
import { isMobile } from "../common/utils";
import dictionary from "../common/dictionary";
import {
  addMonths,
  addWeeks,
  addDays,
  subMonths,
  subWeeks,
  subDays,
} from "date-fns";
import { de } from "date-fns/locale/de"; // <<<< I18N   (DO NOT REMOVE!!!)
import { CalendarContext } from "../common/CalendarContext";
import CalendarToolbar from "./CalendarToolbar";
import CalendarDrawer from "./CalendarDrawer";
import CalendarMain from "./CalendarMain";
import CalendarEventViewDialog from "./CalendarEventViewDialog";
import CalendarEventDialog from "./CalendarEventDialog";
import { useTimeBasedEvents } from "../stores/events";
import { useSettings } from "../stores/settings";

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
    settings: { layout, filters },
  } = useSettings((state) => state);
  const events = useTimeBasedEvents((state) => state);
  if (filters?.showPublicEvents) {
    events.fetchEvents();
  }
  events.fetchPrivateEvents();
  const changeLanguage = (newLang: { value: string; label: string } | null) => {
    if (!newLang) return;
    
    const i18nLocale = newLang.value;
    const newDateFnLocale = i18nLocale === "de-DE" ? de : null;

    console.group("changeLanguage");
    console.log("locale: ", newDateFnLocale);
    console.groupEnd();
    setStateCalendar({ ...stateCalendar, locale: newDateFnLocale, i18nLocale });
  };

  // const handleCloseDialog = () => {
  //     console.group('on handleCloseDialog')
  //     console.log({ stateCalendar })
  //     console.groupEnd()
  //     // const {open} = props
  //     setStateCalendar({ ...stateCalendar, openDialog: false })
  // }

  // const handleCloseViewDialog = () => {
  //     console.group('on handleCloseViewDialog')
  //     console.log({ stateCalendar })
  //     console.groupEnd()

  //     // const {open} = props
  //     setStateCalendar({ ...stateCalendar, openViewDialog: false })
  // }

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

  const [open, setOpen] = useState(!isMobile); // Start closed on mobile, open on desktop

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [runAnimation, setRunAnimation] = useState(true);

  // const applyLink = (newDate: Date) => {
  //     history.push(`/d/${layout}/${format(newDate, "yyyy/MM/dd")}`)
  // }

  const goToToday = () => {
    setRunAnimation(false);
    const newDate = new Date();
    setStateCalendar({ ...stateCalendar, selectedDate: newDate });
    // applyLink(newDate)
  };

  const next = () => {
    setRunAnimation(false);
    let newDate;

    switch (layout) {
      case "week":
        newDate = addWeeks(stateCalendar.selectedDate, 1);
        break;

      case "day":
        newDate = addDays(stateCalendar.selectedDate, 1);
        break;

      default:
        // month
        newDate = addMonths(stateCalendar.selectedDate, 1);
        break;
    }
    setStateCalendar({ ...stateCalendar, selectedDate: newDate });
    // applyLink(newDate)
  };

  const previous = () => {
    setRunAnimation(false);
    let newDate;

    switch (layout) {
      case "week":
        newDate = subWeeks(stateCalendar.selectedDate, 1);
        break;

      case "day":
        newDate = subDays(stateCalendar.selectedDate, 1);
        break;

      default:
        // month
        newDate = subMonths(stateCalendar.selectedDate, 1);
        break;
    }
    setStateCalendar({ ...stateCalendar, selectedDate: newDate });
    // applyLink(newDate)
  };

  // useEffect(() => {
  //     // selectedDate !== null && applyLink(selectedDate)
  //     setTimeout(() => {
  //         setRunAnimation(true)
  //     }, 1)
  // }, [selectedDate])

  return (
    <CalendarContext.Provider value={{ stateCalendar, setStateCalendar }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <CalendarToolbar
          goToToday={goToToday}
          next={next}
          previous={previous}
          open={open}
          handleDrawerOpen={handleDrawerOpen}
          handleDrawerClose={handleDrawerClose}
          toggleDrawer={toggleDrawer}
          changeLanguage={changeLanguage}
        />
        <CalendarDrawer
          selectedDate={selectedDate}
          next={next}
          previous={previous}
          open={open}
          handleDrawerClose={handleDrawerClose}
          layout={"month"}
          locale={locale}
        />

        <CalendarMain
          // selectedDate={selectedDate}
          open={open}
          // layout={layout}
          runAnimation={runAnimation}
        />

        <CalendarEventDialog />
        <CalendarEventViewDialog />
      </div>
    </CalendarContext.Provider>
  );
}

// export default withRouter(Calendar)
export default Calendar;
