import { HTMLAttributes, useContext } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { useIntl } from "react-intl";
import { i18nPreviousLabel, i18nNextLabel } from "../common/i18nLabels";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import TodayIcon from "@mui/icons-material/Today";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Select from "react-select";
import { format } from "date-fns";
import getWeekDays from "../common/getWeekDays";
import getSelectedWeekIndex from "../common/getSelectedWeekIndex";
import { useTheme } from "@mui/material";
import { UserMenu } from "./UserMenu";
import { ISettings, useSettings } from "../stores/settings";
import { isMobile } from "../common/utils";

const drawerWidth = 260;

// Layout options with better labels and icons
const layoutOptions = [
  {
    value: "day",
    label: "Day",
  },
  {
    value: "week", 
    label: "Week",
  },
  {
    value: "month",
    label: "Month", 
  }
];

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

interface CalendarToolbarProps {
  open: boolean;
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
  toggleDrawer: () => void;
  changeLanguage: (language: { value: string; label: string } | null) => void;
  goToToday: () => void;
  next: () => void;
  previous: () => void;
}

function CalendarToolbar({
  open,
  handleDrawerOpen,
  handleDrawerClose,
  toggleDrawer,
  changeLanguage,
  goToToday,
  next,
  previous,
}: CalendarToolbarProps) {
  const theme = useTheme();
  const {
    settings: { layout },
    updateSetting,
  } = useSettings((state) => state);
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
      marginRight: theme.spacing(1),
    },
  };

  const intl = useIntl();

  const { stateCalendar } = useContext(CalendarContext);
  const { selectedDate, locale, i18nLocale } = stateCalendar;

  const setLayout = (newLayout: ISettings["layout"]) => {
    updateSetting("layout", newLayout);
  };

  // Handle layout change from dropdown
  const handleLayoutChange = (selectedOption: { value: string; label: string } | null) => {
    if (selectedOption) {
      setLayout(selectedOption.value as ISettings["layout"]);
    }
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
    ? format(selectedDate, "MMMM", { locale: locale })
    : false;

  return (
    <div
      style={{
        ...styles.root,
        ...styles.appBar,
        width: "100vw",
      }}
    >
      <Toolbar>
        <Tooltip
          title={open ? "Close sidebar" : "Open sidebar"}
          style={{ ...styles.tooltip }}
        >
          <IconButton
            color="inherit"
            aria-label="Toggle sidebar"
            onClick={toggleDrawer}
            edge="start"
            style={{
              ...styles.menuButton,
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        <Tooltip
          title={`${format(new Date(), "ccc, d MMMM", { locale: locale })}`}
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

        {!isMobile && (
          <>
            {/* Layout Dropdown */}
            <div style={{ ...styles.select }}>
              <Select
                options={layoutOptions}
                value={layoutOptions.find(option => option.value === layout)}
                onChange={handleLayoutChange}
                isSearchable={false}
                placeholder="View"
                aria-label="Select calendar layout"
              />
            </div>
          </>
        )}

        <Select
          options={languageOptions}
          defaultValue={languageOptions.find((option) => {
            return option.value === i18nLocale;
          })}
          onChange={changeLanguage}
        />
        <UserMenu />
      </Toolbar>
    </div>
  );
}

export default CalendarToolbar;