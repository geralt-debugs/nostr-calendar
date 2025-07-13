import { HTMLAttributes, useContext, useMemo } from "react";
import { CalendarContext } from "../common/CalendarContext";
import clsx from "clsx";
import { injectIntl, useIntl } from "react-intl";
import { i18nPreviousLabel, i18nNextLabel } from "../common/i18nLabels";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
// import MenuIcon from "@mui/icons-material/Menu"
import TodayIcon from "@mui/icons-material/Today";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import CalendarViewDayIcon from "@mui/icons-material/CalendarViewDay";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Select from "react-select";
// import Select from "react-select"
import { format } from "date-fns";
import getWeekDays from "../common/getWeekDays";
import getSelectedWeekIndex from "../common/getSelectedWeekIndex";
import { useTheme } from "@mui/material";

const drawerWidth = 260;

const languageOptions = [
  {
    value: "en-US",
    label: "English",
  },
  {
    value: "de-DE",
    label: "Deutsch",
  },
];

function CalendarToolbar(props) {
  const theme = useTheme();
  const styles: Record<string, HTMLAttributes<HTMLDivElement>["style"]> = {
    root: {
      flexGrow: 1,
      position: "fixed",
      backgroundColor: theme.palette.background.paper,
      width: "100%",
      borderBottom: "1px solid #E0E0E0",
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      paddingLeft: theme.spacing(1),
      fontWeight: 400,
      fontSize: theme.spacing(3),
      textTransform: "capitalize",
    },
    button: {
      paddingRight: theme.spacing(1),
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    hide: {
      display: "none",
    },
    tooltip: {
      marginTop: 2,
    },
    select: {
      width: theme.spacing(15),
    },
  };
  const {
    // open,
    // handleDrawerOpen,
    // handleDrawerClose,
    changeLanguage,
    goToToday,
    next,
    previous,
    // match,
  } = props;

  const intl = useIntl();

  const { stateCalendar, setStateCalendar } = useContext(CalendarContext);
  const { selectedDate, locale, i18nLocale, layout } = stateCalendar;

  return useMemo(() => {
    const setLayout = (props: any) => {
      const { option } = props;
      setStateCalendar({ ...stateCalendar, layout: option });
    };

    const weeks = getWeekDays(selectedDate, 7);
    const selectedWeekIndex = getSelectedWeekIndex(selectedDate, weeks, 0);
    const selectedWeek = weeks[selectedWeekIndex];

    const firstDayOfWeekMonth = format(selectedWeek[0], "MMM", {
      locale: locale,
    });
    const lastDayOfWeekMonth = format(selectedWeek[6], "MMM", {
      locale: locale,
    });
    const firstDayOfWeekYear = format(selectedWeek[0], "yyyy", {
      locale: locale,
    });
    const lastDayOfWeekYear = format(selectedWeek[6], "yyyy", {
      locale: locale,
    });

    const showMonthsAndYears =
      layout === "week" &&
      firstDayOfWeekMonth !== lastDayOfWeekMonth &&
      firstDayOfWeekYear !== lastDayOfWeekYear
        ? `${firstDayOfWeekMonth} ${firstDayOfWeekYear} - ${lastDayOfWeekMonth} ${lastDayOfWeekYear}`
        : false;
    const showMonthsAndYear =
      !showMonthsAndYears &&
      layout === "week" &&
      firstDayOfWeekMonth !== lastDayOfWeekMonth
        ? `${firstDayOfWeekMonth} - ${lastDayOfWeekMonth} ${firstDayOfWeekYear}`
        : false;
    const showMonthAndYear = !showMonthsAndYear
      ? format(selectedDate, "MMMM yyyy", { locale: locale })
      : false;

    return (
      <div
        style={{
          ...styles.root,
          ...styles.appBar,
        }}
      >
        <Toolbar>
          {/* <IconButton
                        color='inherit'
                        aria-label='Open drawer'
                        onClick={open ? handleDrawerClose : handleDrawerOpen}
                        edge='start'
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton> */}

          <Tooltip
            title={`${format(new Date(), "dddd, d MMMM", { locale: locale })}`}
            style={{ ...styles.tooltip }}
          >
            <IconButton
              color="inherit"
              aria-label="Today"
              onClick={goToToday}
              edge="start"
              style={{ ...styles.menuButton }}
            >
              <TodayIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({ id: i18nPreviousLabel(layout) })}
            style={{ ...styles.tooltip }}
          >
            <IconButton onClick={previous}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({ id: i18nNextLabel(layout) })}
            style={{ ...styles.tooltip }}
          >
            <IconButton onClick={next}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>

          <Typography style={{ ...styles.title }}>
            {showMonthsAndYears || showMonthsAndYear || showMonthAndYear}
          </Typography>

          <Tooltip
            title={intl.formatMessage({ id: "navigation.day" })}
            style={{ ...styles.tooltip }}
          >
            <IconButton
              color="inherit"
              aria-label="Day View"
              onClick={(e) => setLayout({ e, option: "day" })}
              edge="start"
              style={{ ...styles.menuButton }}
            >
              <CalendarViewDayIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({ id: "navigation.week" })}
            style={{ ...styles.tooltip }}
          >
            <IconButton
              color="inherit"
              aria-label="Week View"
              onClick={(e) => setLayout({ e, option: "week" })}
              edge="start"
              style={{ ...styles.menuButton }}
            >
              <ViewWeekIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({ id: "navigation.month" })}
            style={{ ...styles.tooltip }}
          >
            <IconButton
              color="inherit"
              aria-label="Month View"
              onClick={(e) => setLayout({ e, option: "month" })}
              edge="start"
              style={{ ...styles.menuButton }}
            >
              <ViewModuleIcon />
            </IconButton>
          </Tooltip>

          <Select
            options={languageOptions}
            defaultValue={languageOptions.find((option: any) => {
              return option.value === i18nLocale;
            })}
            onChange={changeLanguage}
          />
        </Toolbar>
      </div>
    );
    // ....
    // for stateCalendar and setStateCalendar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDate,
    layout,
    intl,
    locale,
    i18nLocale,
    goToToday,
    next,
    previous,
    changeLanguage,
  ]);
}

export default CalendarToolbar;
