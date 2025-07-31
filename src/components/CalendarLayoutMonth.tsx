import { useContext } from "react";
import { CalendarContext } from "../common/CalendarContext";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { styled, Theme, useTheme } from "@mui/material";
import { format } from "date-fns";
import createEditEvent from "./createEditEvent";
import { IGetStyles } from "../common/types";
import clsx from "clsx";
import { useTimeBasedEvents } from "../stores/events";
import { useEventDetails } from "../stores/eventDetails";
// import EventMark from './EventMark'

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
    transition: background-color 0.1s ease; /* Add transition for smoother hover */

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
  min-height: 23;
  border: ${({ borderColour }) => `1px solid ${borderColour}`};
  background-color: ${({ primaryColour }) => `${primaryColour}`};
  padding: 1px 3px;
  margin-bottom: 2px;
  border-radius: 3px;
  border-top-right-radius: 3px;
  cursor: pointer;
  z-index: 50;
  &:hover {
    z-index: 53;
    background-color: ${({ hoverColour }) => `${hoverColour}`};
  }
`;

const getStyles: IGetStyles = (theme: Theme) => ({
  paperHeader: {
    borderBottom: "1px solid #dadce0",
    borderRight: "1px solid #dadce0",
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 0,
    minWidth: 64.38,
  },
  title: {
    textTransform: "capitalize",
  },

  paper: {
    borderBottom: "1px solid #dadce0",
    borderRight: "1px solid #dadce0",
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 0,
    minWidth: 64.38,
    height: "100%",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  paperWeekend: {
    backgroundColor: theme.palette.grey[100],
  },

  centerContent: {
    display: "flex",
    justifyContent: "center",
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

    if (size === 5) {
      return {
        height: "calc((100% / 5) - 21.2px)",
      };
    }

    return {
      height: "calc((100% / 6) - 17.5px)",
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
          >
            {event.title}
          </MonthMarkerStyle>
        ));
    });
    return markers;

    // const markers = dayEvents.map((event: any, index: number) => {
    //     const hour = new Date(event.begin).getHours()
    //     const thisHoursHas = eventsByHour.find((evHour: any) => evHour.hour === hour)

    //     console.log(
    //         `key=event-${event.id}`,
    //         `calendarEvent=${event.begin}`,
    //         `sq=${index}`,
    //         `len=${thisHoursHas ? thisHoursHas.len : 0}`,
    //     )

    //     return (
    //         <EventMark
    //             key={`event-${event.id}`}
    //             calendarEvent={event}
    //             sq={index}
    //             len={thisHoursHas ? thisHoursHas.len : 0}
    //         />
    //     )
    // })
    // return markers
  };

  return (
    <>
      <Grid
        container
        spacing={0}
        direction="row"
        justifyContent="center"
        alignItems="center"
        wrap="nowrap"
      >
        {weeks[0].map((weekDay: Date, index: number) => {
          const day = format(weekDay, "ccc").toUpperCase();
          const isWeekend = day === "SUN" || day === "SAT";

          return (
            <Grid
              style={{
                flexGrow: "1",
              }}
              key={`calendar-column-header-label-${index}`}
            >
              <div
                style={{
                  ...styles.paperHeader,
                  ...(isWeekend ? styles.paperWeekend : {}),
                }}
              >
                <Typography style={{ ...styles.title }}>
                  {format(weekDay, "ccc", { locale: locale })}
                </Typography>
              </div>
            </Grid>
          );
        })}
      </Grid>

      {weeks.map((week, weekIndex) => (
        <Grid
          container
          spacing={0}
          direction="row"
          justifyContent="space-evenly"
          alignItems="stretch"
          wrap="nowrap"
          key={`calendar-main-line-${weekIndex}`}
          style={maxHeight(weeks)}
        >
          {week.map((day, dayIndex: number) => {
            const isToday =
              format(day, "ddMMyyy") === format(new Date(), "ddMMyyy");
            const eventsOfDay = getEventData(day);

            const dayName = format(day, "ccc").toUpperCase();
            const isWeekend = dayName === "SUN" || dayName === "SAT";

            return (
              <Grid
                style={{
                  flexGrow: "1",
                }}
                key={`calendar-main-line-${weekIndex}-column-${dayIndex}`}
              >
                <div
                  style={{
                    ...styles.paper,
                    ...(isWeekend ? styles.paperWeekend : {}),
                  }}
                >
                  <Typography component={"div"} style={{ ...styles.title }}>
                    <DayStyle
                      primaryColour={theme.palette.primary.main}
                      hoverColour={theme.palette.primary.dark}
                      spacing={theme.spacing(1)}
                      paperColour={theme.palette.background.paper}
                      className={clsx({ today: isToday })}
                    >
                      {day.getDate()}
                    </DayStyle>
                    <div>
                      {day.getDate() === 1
                        ? format(new Date(day), " MMM", {
                            locale: locale,
                          })
                        : null}
                    </div>
                  </Typography>

                  {eventsOfDay && eventsOfDay.length > 0 && (
                    <div style={{ ...styles.eventsContainer }} data-date={day}>
                      {eventsOfDay}
                    </div>
                  )}

                  {/* {false && (
                                        <div className={classes.centerContent}>
                                            <Typography className={clsx(classes.title)}>
                                                <span className={clsx({ [classes.today]: isToday })}>
                                                    {day.getDate()}
                                                </span>

                                                {day.getDate() === 1
                                                    ? format(new Date(day), " MMM", {
                                                          locale: locale,
                                                      })
                                                    : null}
                                            </Typography>
                                        </div>
                                    )} */}
                </div>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </>
  );
}

export default CalendarLayoutMonth;
