import { useContext } from "react";
import { CalendarContext } from "../common/CalendarContext";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { styled, Theme, useTheme } from "@mui/material";
import { format } from "date-fns";
import { IGetStyles } from "../common/types";
import clsx from "clsx";
import { useTimeBasedEvents } from "../stores/events";
import { useEventDetails } from "../stores/eventDetails";

const DayStyle = styled("div")<{
  paperColour: string;
  spacing: string;
  primaryColour: string;
  hoverColour: string;
}>`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;

  &.today {
    color: ${({ paperColour }) => paperColour};
    background-color: ${({ primaryColour }) => primaryColour};
    border-radius: 50%;
    padding: ${({ spacing }) => spacing};
    cursor: pointer;
    transition: background-color 0.1s ease;

    &:hover {
      background-color: ${({ hoverColour }) => hoverColour};
    }
  }
`;

const MonthMarkerStyle = styled("div")<{
  borderColour: string;
  primaryColour: string;
  hoverColour: string;
}>`
  display: flex;
  align-items: center;
  overflow: hidden;
  min-height: 23px;
  border: ${({ borderColour }) => `1px solid ${borderColour}`};
  background-color: ${({ primaryColour }) => `${primaryColour}`};
  padding: 1px 3px;
  margin-bottom: 2px;
  border-radius: 3px;
  border-top-right-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1.2;

  &:hover {
    background-color: ${({ hoverColour }) => `${hoverColour}`};
  }
`;

const getStyles: IGetStyles = (theme: Theme) => ({
  calendarContainer: {
    width: "100%",
    overflow: "hidden",
  },

  paperHeader: {
    borderBottom: "1px solid #dadce0",
    borderRight: "1px solid #dadce0",
    padding: theme.spacing(0.5),
    textAlign: "center",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 0,
    width: "100%",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(1),
      minHeight: "48px",
    },
  },

  title: {
    textTransform: "capitalize",
    fontSize: "0.75rem",

    [theme.breakpoints.up("sm")]: {
      fontSize: "0.875rem",
    },
  },

  paper: {
    borderBottom: "1px solid #dadce0",
    borderRight: "1px solid #dadce0",
    padding: theme.spacing(0.5),
    textAlign: "center",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",

    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(1),
    },
  },

  paperWeekend: {
    backgroundColor: theme.palette.grey[100],
  },

  centerContent: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },

  eventsContainer: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "column",
    textAlign: "left",
    backgroundColor: "transparent",
    position: "relative",
    height: "calc(100% - 25px)",
    width: "100%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    gap: "2px",
    marginTop: theme.spacing(0.5),
  },

  gridItem: {
    flex: 1,
    minWidth: 0,
  },

  dayNumber: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(0.5),
  },

  monthLabel: {
    fontSize: "0.6rem",
    marginTop: "2px",

    [theme.breakpoints.up("sm")]: {
      fontSize: "0.75rem",
    },
  },
});

function CalendarLayoutMonth({ weeks }: { weeks: Date[][] }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const events = useTimeBasedEvents((state) => state.events);

  const { stateCalendar } = useContext(CalendarContext);
  const { locale } = stateCalendar;
  const updateEvent = useEventDetails((state) => state.updateEvent);

  const maxHeight = (weeks: Date[][]) => {
    const size = weeks.length;
    const baseHeight = window.innerHeight < 600 ? "80px" : "120px";

    if (size === 5) {
      return {
        height: `calc((100vh - 200px) / 5)`,
        minHeight: baseHeight,
      };
    }

    return {
      height: `calc((100vh - 200px) / 6)`,
      minHeight: baseHeight,
    };
  };

  const getEventData = (day: Date) => {
    const dayEvents = events.filter(
      (event) =>
        format(new Date(event.begin), "yyyMMdd") === format(day, "yyyMMdd"),
    );

    const dayHoursEvents = dayEvents
      .map((event) => new Date(event.begin).getHours())
      .sort((numberA: number, numberB: number) => numberA - numberB);

    const eventsByHour = dayHoursEvents.reduce<{ hour: number; len: number }[]>(
      (acc, hour) => {
        const len = dayHoursEvents.filter(
          (eventHour) => eventHour === hour,
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
        .map((event) => (
          <MonthMarkerStyle
            primaryColour={theme.palette.primary.main}
            borderColour={theme.palette.primary.dark}
            hoverColour={theme.palette.primary.light}
            key={`event-${event.id}`}
            onClick={() => {
              updateEvent(event);
            }}
            title={event.title}
          >
            {event.title}
          </MonthMarkerStyle>
        ));
    });
    return markers;
  };

  return (
    <div style={styles.calendarContainer}>
      {/* Header Row */}
      <Grid
        container
        spacing={0}
        direction="row"
        justifyContent="center"
        alignItems="center"
        wrap="nowrap"
        style={{ width: "100%" }}
      >
        {weeks[0].map((weekDay: Date, index: number) => {
          const day = format(weekDay, "ccc").toUpperCase();
          const isWeekend = day === "SUN" || day === "SAT";

          return (
            <Grid
              item
              key={`calendar-column-header-label-${index}`}
              style={styles.gridItem}
            >
              <div
                style={{
                  ...styles.paperHeader,
                  ...(isWeekend ? styles.paperWeekend : {}),
                }}
              >
                <Typography style={styles.title}>
                  {format(weekDay, "ccc", { locale: locale })}
                </Typography>
              </div>
            </Grid>
          );
        })}
      </Grid>

      {/* Calendar Weeks */}
      {weeks.map((week, weekIndex) => (
        <Grid
          container
          spacing={0}
          direction="row"
          justifyContent="space-evenly"
          alignItems="stretch"
          wrap="nowrap"
          key={`calendar-main-line-${weekIndex}`}
          style={{ ...maxHeight(weeks), width: "100%" }}
        >
          {week.map((day, dayIndex: number) => {
            const isToday =
              format(day, "ddMMyyy") === format(new Date(), "ddMMyyy");
            const eventsOfDay = getEventData(day);

            const dayName = format(day, "ccc").toUpperCase();
            const isWeekend = dayName === "SUN" || dayName === "SAT";

            return (
              <Grid
                item
                key={`calendar-main-line-${weekIndex}-column-${dayIndex}`}
                style={styles.gridItem}
              >
                <div
                  style={{
                    ...styles.paper,
                    ...(isWeekend ? styles.paperWeekend : {}),
                  }}
                >
                  <div style={styles.dayNumber}>
                    <Typography component={"div"} style={styles.title}>
                      <DayStyle
                        primaryColour={theme.palette.primary.main}
                        hoverColour={theme.palette.primary.dark}
                        spacing={theme.spacing(1)}
                        paperColour={theme.palette.background.paper}
                        className={clsx({ today: isToday })}
                      >
                        {day.getDate()}
                      </DayStyle>
                      {day.getDate() === 1 && (
                        <div style={styles.monthLabel}>
                          {format(new Date(day), " MMM", {
                            locale: locale,
                          })}
                        </div>
                      )}
                    </Typography>
                  </div>

                  {eventsOfDay && eventsOfDay.length > 0 && (
                    <div style={styles.eventsContainer} data-date={day}>
                      {eventsOfDay}
                    </div>
                  )}
                </div>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </div>
  );
}

export default CalendarLayoutMonth;
