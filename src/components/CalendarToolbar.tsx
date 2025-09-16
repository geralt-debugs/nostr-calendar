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
import { format } from "date-fns";
import getWeekDays from "../common/getWeekDays";
import getSelectedWeekIndex from "../common/getSelectedWeekIndex";
import { useTheme } from "@mui/material";
import { UserMenu } from "./UserMenu";
import { useSettings } from "../stores/settings";
import { isMobile } from "../common/utils";
import LayoutSelector from "./LayoutSelector";

const drawerWidth = 260;

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
      marginLeft: isMobile ? theme.spacing(0.5) : theme.spacing(0),
      marginRight: isMobile ? theme.spacing(0.5) : theme.spacing(2),
    },
    title: {
      fontWeight: 400,
      fontSize: isMobile ? theme.spacing(2.2) : theme.spacing(3),
      textTransform: "capitalize",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      minWidth: 0,
      textAlign: "center",
      margin: `0 ${theme.spacing(1)}px`,
    },
    button: {
      paddingRight: isMobile ? theme.spacing(0.5) : theme.spacing(1),
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
      width: isMobile ? theme.spacing(12) : theme.spacing(18),
      marginRight: isMobile ? theme.spacing(0.5) : theme.spacing(1),
      minWidth: isMobile ? theme.spacing(12) : theme.spacing(18),
    },
    logo: {
      cursor: "pointer",
      marginRight: isMobile ? theme.spacing(2) : theme.spacing(2),
      height: isMobile ? 30 : 40,
      objectFit: "contain",
      flexShrink: 0, 
    },
    toolbar: {
      minHeight: isMobile ? 56 : 64,
      paddingLeft: isMobile ? theme.spacing(1) : theme.spacing(2),
      paddingRight: isMobile ? theme.spacing(1) : theme.spacing(2),
      display: "flex",
      alignItems: "center",
    },
    iconButton: {
      padding: isMobile ? theme.spacing(0.75) : theme.spacing(1),
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      flex: isMobile ? "0 0 auto" : "1 1 0",
      minWidth: 0,
    },
    centerSection: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: isMobile ? "1 1 auto" : "1 1 0",
      maxWidth: isMobile ? "50%" : "none",
      minWidth: 0,
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      flex: isMobile ? "0 0 auto" : "1 1 0",
      justifyContent: "flex-end",
      gap: theme.spacing(1),
      minWidth: 0,
    },
    navigationButtons: {
      display: "flex",
      alignItems: "center",
    }
  };

  const intl = useIntl();

  const { stateCalendar } = useContext(CalendarContext);
  const { selectedDate, locale, i18nLocale } = stateCalendar;
  
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
    ? format(selectedDate, isMobile ? "MMM yyyy" : "MMMM", { locale: locale })
    : false;

  return (
    <div
      style={{
        ...styles.root,
        ...styles.appBar,
        width: "100vw",
      }}
    >
      <Toolbar style={styles.toolbar}>
        {/* Left Section - Menu and Logo */}
        <div style={styles.leftSection}>
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
                ...styles.iconButton,
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          
          <img 
            src="/formstr.png" 
            alt="Calendar Logo" 
            style={styles.logo}
          />

          <Tooltip
            title={`${format(new Date(), "ccc, d MMMM", { locale: locale })}`}
            style={{ ...styles.tooltip }}
          >
            <IconButton
              color="inherit"
              aria-label="Today"
              onClick={goToToday}
              edge="start"
              style={{ 
                ...styles.menuButton,
                ...styles.iconButton,
              }}
            >
              <TodayIcon />
            </IconButton>
          </Tooltip>
        </div>

        {/* Center Section - Navigation */}
        <div style={styles.centerSection}>
          <div style={styles.navigationButtons}>
            <Tooltip
              title={intl.formatMessage({ id: i18nPreviousLabel(layout) })}
              style={{ ...styles.tooltip }}
            >
              <IconButton 
                onClick={previous}
                style={styles.iconButton}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>

            <Typography style={{ ...styles.title }}>
              {showMonthsAndYears || showMonthsAndYear || showMonthAndYear}
            </Typography>

            <Tooltip
              title={intl.formatMessage({ id: i18nNextLabel(layout) })}
              style={{ ...styles.tooltip }}
            >
              <IconButton 
                onClick={next}
                style={styles.iconButton}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Right Section - Dropdown and User Menu */}
        <div style={styles.rightSection}>
          {!isMobile && (
            <LayoutSelector style={styles.select} />
          )}

          <UserMenu />
        </div>
      </Toolbar>
    </div>
  );
}

export default CalendarToolbar;