import { useState, useEffect, useContext, useMemo, JSX } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { useTheme } from "@mui/material/styles";
import { format, differenceInMinutes } from "date-fns";
import Grid from "@mui/material/Grid";
import { useDrop } from "react-dnd";
import LineDivisor from "./LineDivisor";
import createEditEvent from "./createEditEvent";
import EventMark from "./EventMark";
import { IGetStyles } from "../common/types";
import { useTimeBasedEvents } from "../stores/events";
import { useEventDetails } from "../stores/eventDetails";
import { useSettings } from "../stores/settings";

const getStyles: IGetStyles = () => ({
  board: {
    minWidth: "100%",
    height: "100%",
    flex: "none",
    verticalAlign: "top",
    overflow: "hidden",
    position: "relative",
  },
  columnDivisor: {
    height: "100%",
    paddingLeft: 8,
    borderRight: "1px solid #dadce0",
  },
  dayContainer: {
    borderRight: "1px solid #dadce0",
    position: "relative",
    paddingRight: 12,
    flex: "1 1 auto",
    height: "100%",
  },
  eventsContainer: {
    backgroundColor: "transparent",
    position: "relative",
    height: "100%",
    width: "100%",
  },
  currentTimeDot: {
    background: "rgb(226, 57, 43)",
    borderRadius: "50%",
    content: "''",
    position: "absolute",
    height: 12,
    width: 12,
    zIndex: 52,
    marginTop: -1000,
    marginLeft: -6.5,
  },
  currentTimeLine: {
    position: "absolute",
    zIndex: 51,
    borderTop: "2px solid rgb(226, 57, 43)",
    left: 0,
    right: -1,
  },
});

function CalendarBoard({
  selectedWeek,
  selectedWeekIndex,
}: {
  selectedWeek: Date[];
  selectedWeekIndex: number;
}) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const openEventDetails = useEventDetails((state) => state.updateEvent);

  const events = useTimeBasedEvents((state) => state.events);
  const { layout } = useSettings((state) => state.settings);
  const { stateCalendar } = useContext(CalendarContext);
  const { selectedDate, defaultEventDuration, draggingEventId } = stateCalendar;

  const [currentTimePosition, setCurrentTimePosition] = useState<number>();

  useEffect(() => {
    setInterval(() => {
      const now = new Date();
      const initTime = new Date(format(now, "yyyy/MM/dd 0:0:0"));
      const position = differenceInMinutes(now, initTime);
      setCurrentTimePosition(position);
    }, 1000);
  }, []);

  const viewLayout = Array.from(
    Array(layout === "week" ? 7 : layout === "day" ? 1 : 0).keys(),
  );

  const getEventData: (day: Date) => JSX.Element[][] = (day) => {
    const dayEvents = events.filter(
      (event) =>
        format(new Date(event.begin), "yyyyMMdd") === format(day, "yyyyMMdd"),
    );

    const dayHoursEvents = dayEvents
      .map((event) => new Date(event.begin).getHours())
      .sort((numberA: number, numberB: number) => numberA - numberB);

    const eventsByHour = dayHoursEvents.reduce<{ hour: number; len: number }[]>(
      (acc, hour: number) => {
        const len = dayHoursEvents.filter(
          (eventHour: number) => eventHour === hour,
        ).length;
        if (!acc.some((accItem) => accItem.hour === hour)) {
          acc.push({ hour, len });
        }
        return acc;
      },
      [],
    );

    const markers = eventsByHour.map((evHour) => {
      return dayEvents
        .filter((event) => new Date(event.begin).getHours() === evHour.hour)
        .map((event, index: number) => (
          <EventMark
            key={`event-${event.id}`}
            calendarEvent={event}
            sq={index}
            len={evHour.len}
          />
        ));
    });
    return markers;
  };

  // }, [localStorageMarkers])

  const CurrentTimeMark = ({ marginTop = -1000 }: { marginTop?: number }) => {
    return (
      <>
        <div
          className="currentTime"
          style={{ ...styles.currentTimeDot, marginTop: marginTop - 5 }}
        />
        <div style={{ ...styles.currentTimeLine, marginTop: marginTop }} />
      </>
    );
  };

  const onDrop = () => {
    const eventID = draggingEventId;

    const eventMarkGhost =
      document.querySelector<HTMLDivElement>("[data-ghost]");
    if (!eventMarkGhost || !eventMarkGhost.dataset.date) return false;

    const eventBeginDate = new Date(eventMarkGhost.dataset.date);

    const localStorageMarkers = window.localStorage.getItem("markers");
    const markers =
      (localStorageMarkers && JSON.parse(localStorageMarkers)) || [];

    // const draggedEvent = markers.find(
    //   (markEvent: any) => markEvent.id === eventID,
    // );

    // const duration = differenceInMinutes(
    //   new Date(draggedEvent.end),
    //   new Date(draggedEvent.begin),
    // );

    // const marker = {
    //   ...draggedEvent,
    //   begin: format(eventBeginDate, "yyyy/MM/dd HH:mm"),
    //   end: format(addMinutes(eventBeginDate, duration), "yyyy/MM/dd HH:mm"),
    // };

    // window.localStorage.setItem(
    //   "markers",
    //   JSON.stringify([
    //     ...markers.filter((markEvent: any) => markEvent.id !== eventID),
    //     marker,
    //   ]),
    // );

    // setStateCalendar({ ...stateCalendar, draggingEventId: -1 });
  };

  const [, drop] = useDrop({
    accept: "box",
    drop(item: any, monitor: any) {
      return undefined;
    },
  });

  const viewLayoutEl = viewLayout.map((index) => {
    const day = layout === "week" ? selectedWeek[index] : selectedDate;
    const isToday = format(day, "ddMMyyyy") === format(new Date(), "ddMMyyyy");
    const eventsOfDay = getEventData(day);
    return (
      <Grid
        id={`day${index + 1}`}
        data-group="day-column"
        data-date={day}
        style={{ ...styles.dayContainer }}
        key={`board-day-column-${layout}-${selectedWeekIndex}-${day}-${index}`}
        onClick={async (event) => {
          event.persist();
          const tempEvent = await createEditEvent({
            event,
            defaultEventDuration,
          });
          if (!tempEvent) {
            return;
          }
          openEventDetails(tempEvent, "create");
        }}
      >
        {isToday && <CurrentTimeMark marginTop={currentTimePosition} />}

        {eventsOfDay && eventsOfDay.length > 0 && (
          <div style={{ ...styles.eventsContainer }} data-date={day}>
            {eventsOfDay}
          </div>
        )}
      </Grid>
    );
  });

  return (
    <Grid
      ref={drop}
      onDrop={onDrop}
      container
      component={"div"}
      spacing={0}
      direction="row"
      justifyContent="center"
      alignItems="flex-start"
      style={{ ...styles.board }}
    >
      <LineDivisor />
      <div style={{ ...styles.columnDivisor }} />

      {viewLayoutEl}
    </Grid>
  );
}

export default CalendarBoard;
