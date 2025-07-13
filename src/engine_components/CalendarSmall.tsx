import {
  useState,
  useContext,
  useEffect,
  useMemo,
  HTMLAttributes,
} from "react";
import { CalendarContext } from "../common/CalendarContext";
import { Theme, useTheme } from "@mui/material";
import { useIntl } from "react-intl";
import { i18nPreviousLabel, i18nNextLabel } from "../common/i18nLabels";
import { format, getMonth, addMonths, subMonths } from "date-fns";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import Typography from "@mui/material/Typography";
import { lightBlue } from "@mui/material/colors";
import getWeekDays from "../common/getWeekDays";

const getStyles = (
  theme: Theme,
): Record<string, HTMLAttributes<HTMLDivElement>["style"]> => ({
  root: {
    minHeight: 264,
    minWidth: 240,
    background: theme.palette.background.paper,
  },
  title: {
    marginLeft: theme.spacing(1),
    textTransform: "capitalize",
  },

  dayHeader: {
    textAlign: "center",
    fontSize: 12,
    color: lightBlue[800],
    lineHeight: "26px",
    padding: theme.spacing(0.2),
    borderColor: theme.palette.background.paper,
    borderStyle: "solid",
    textTransform: "capitalize",
    background: theme.palette.background.paper,
    height: 34.3,
    width: 34.3,
  },
  day: {
    textAlign: "center",
    fontSize: 12,
    cursor: "pointer",
    borderRadius: "50%",
    borderWidth: theme.spacing(0.4),
    lineHeight: "26px",
    padding: theme.spacing(0.2),
    background: theme.palette.background.paper,
    height: 34.3,
    width: 34.3,
  },
  today: {
    color: theme.palette.background.paper,
    background: theme.palette.background.paper,
    borderColor: theme.palette.background.paper,
    borderStyle: "solid",
    backgroundColor: lightBlue[700],
    // "&:hover": {
    //   backgroundColor: lightBlue[800],
    // },
  },
  notToday: {
    background: theme.palette.background.paper,
    borderColor: theme.palette.background.paper,
    borderStyle: "solid",
    // "&:hover": {
    //   backgroundColor: theme.palette.grey[100],
    // },
  },
  selected: {
    color: "#ffffff",
    borderColor: theme.palette.background.paper,
    borderStyle: "solid",
    backgroundColor: lightBlue[500],
    // "&:hover": {
    //   color: "#ffffff",
    //   backgroundColor: lightBlue[600],
    // },
  },
  notCurrentMonth: {
    color: theme.palette.grey[500],
    background: theme.palette.background.paper,
  },
  navigation: {
    marginRight: theme.spacing(0.5),
  },
  tooltip: {
    marginTop: 2,
  },
  todayButton: {
    marginRight: 2,
  },
  todayIcon: {
    fontSize: "1.5rem",
    padding: 2,
  },
});

function CalendarSmall(props: any) {
  const theme = useTheme();
  const intl = useIntl();

  const styles = getStyles(theme);
  const {
    isDatepicker = false,
    datepickerOnChange = () => {},
    datepickerValue,
  } = props;
  const { stateCalendar, setStateCalendar } = useContext(CalendarContext);
  const { selectedDate, locale } = stateCalendar;

  const [internalDate, setInternalDate] = useState(
    isDatepicker ? datepickerValue : selectedDate,
  );
  const [selectedInternalDate, setSelectedInternalDate] = useState(
    isDatepicker ? datepickerValue : null,
  );

  useEffect(() => {
    // console.group("CalendarSmall : useEffect")
    // console.log(selectedDate)
    // console.log(selectedInternalDate)
    // console.groupEnd()
    setInternalDate(isDatepicker ? datepickerValue : selectedDate);
    if (!isDatepicker && selectedDate !== selectedInternalDate) {
      setSelectedInternalDate(null);
    }
  }, [selectedDate, selectedInternalDate, isDatepicker, datepickerValue]);

  return useMemo(() => {
    // console.log('small...')
    const weeks = getWeekDays(internalDate, 7);

    const findNewDate = (props: any) => {
      const { direction } = props;
      setInternalDate(
        direction === "<"
          ? subMonths(internalDate, 1)
          : addMonths(internalDate, 1),
      );
    };

    const selectDate = (props: any) => {
      const { newDate } = props;

      if (!isDatepicker) {
        setStateCalendar({ ...stateCalendar, selectedDate: newDate });
        setSelectedInternalDate(newDate);
      } else {
        datepickerOnChange(newDate);
      }
    };

    return (
      <section style={{ ...styles.root }}>
        <Grid
          component={"div"}
          container
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={0}
          wrap="nowrap"
        >
          <Grid component={"div"} size={8}>
            <Typography style={{ ...styles.title }}>
              {format(internalDate, "MMMM yyyy", { locale: locale })}
            </Typography>
          </Grid>
          <Grid
            size={4}
            component={"div"}
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={0}
            wrap="nowrap"
            style={{ ...styles.navigation }}
          >
            {isDatepicker && (
              <Tooltip
                title={`${format(new Date(), "dddd, D MMMM", { locale: locale })}`}
                style={{ ...styles.tooltip }}
              >
                <IconButton
                  size="small"
                  aria-label="Today"
                  onClick={() => {
                    setInternalDate(new Date());
                  }}
                  style={{ ...styles.todayButton }}
                >
                  <TodayOutlinedIcon style={{ ...styles.todayIcon }} />
                </IconButton>
              </Tooltip>
            )}{" "}
            <Tooltip
              title={intl.formatMessage({ id: i18nPreviousLabel("month") })}
              style={{ ...styles.tooltip }}
            >
              <IconButton
                size="small"
                onClick={(event) => findNewDate({ event, direction: "<" })}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>{" "}
            <Tooltip
              title={intl.formatMessage({ id: i18nNextLabel("month") })}
              style={{ ...styles.tooltip }}
            >
              <IconButton
                size="small"
                onClick={(event) => findNewDate({ event, direction: ">" })}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={0}
          component={"div"}
          direction="row"
          justifyContent="center"
          alignItems="center"
          wrap="nowrap"
        >
          {weeks[0].map((weekDay: Date, index: number) => {
            return (
              <Grid
                component={"div"}
                key={`small-calendar-column-header-${index}`}
              >
                <Typography style={{ ...styles.dayHeader }}>
                  {format(weekDay, "ccc", { locale: locale }).substr(0, 1)}
                </Typography>
              </Grid>
            );
          })}
        </Grid>

        {weeks.map((week: any, weekIndex: number) => (
          <Grid
            container
            spacing={0}
            direction="row"
            component={"div"}
            justifyContent="center"
            alignItems="center"
            wrap="nowrap"
            key={`small-calendar-line-${weekIndex}`}
          >
            {week.map((day: any, dayIndex: number) => {
              const isToday =
                format(day, "ddMMyyyy") === format(new Date(), "ddMMyyyy");
              const isSelected =
                selectedInternalDate !== null &&
                !isToday &&
                format(day, "ddMMyyyy") ===
                  format(selectedInternalDate, "ddMMyyyy");

              const isCurrentMonth = getMonth(internalDate) === getMonth(day);

              return (
                <Grid
                  key={`small-calendar-line-${weekIndex}-column-${dayIndex}`}
                >
                  <Typography
                    style={{
                      ...styles.day,
                      ...(isToday ? styles.today : {}),
                      ...(!isToday ? styles.notToday : {}),
                      ...(!isToday && isSelected ? styles.selected : {}),
                      ...(!isCurrentMonth ? styles.notCurrentMonth : {}),
                    }}
                    onClick={() => selectDate({ newDate: day })}
                  >
                    {day.getDate()}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </section>
    );
    // eslint-disable-next-line
    }, [internalDate, locale, selectedInternalDate])
}

export default CalendarSmall;
