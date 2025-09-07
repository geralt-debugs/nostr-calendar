import { useContext } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { Theme, useTheme } from "@mui/material";
import getWeekDays from "../common/getWeekDays";
import getSelectedWeekIndex from "../common/getSelectedWeekIndex";
import CalendarLayoutMonth from "./CalendarLayoutMonth";
import CalendarLayoutDayWeek from "./CalendarLayoutDayWeek";
import { IGetStyles } from "../common/types";
import { DrawerHeader } from "./DrawerHeader";
import { useSettings } from "../stores/settings";
import { isMobile } from "../common/utils";

const drawerWidth = 260;

const getStyles: IGetStyles = (theme: Theme) => ({
  content: {
    flexGrow: 1,
    // padding: theme.spacing(0),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
    height: "100%",
    width: "100%",
    minWidth: 1000,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
});

interface CalendarMainProps {
  open: boolean;
  runAnimation: boolean;
}

function CalendarMain(props: CalendarMainProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { stateCalendar } = useContext(CalendarContext);
  const { selectedDate } = stateCalendar;
  const { open } = props;
  const { layout } = useSettings((state) => state.settings);

  const weeks = getWeekDays(selectedDate, 7);
  const selectedWeekIndex = getSelectedWeekIndex(selectedDate, weeks, 0);
  const selectedWeek = weeks[selectedWeekIndex];
  return (
    <div
      style={{
        ...styles.content,
        ...(open && !isMobile ? styles.contentShift : {}),
      }}
    >
      <DrawerHeader style={{ justifyContent: "center" }} />

      {layout === "month" && <CalendarLayoutMonth weeks={weeks} />}

      {(layout === "week" || layout === "day") && (
        <CalendarLayoutDayWeek
          selectedWeekIndex={selectedWeekIndex}
          selectedWeek={selectedWeek}
        />
      )}
    </div>
  );
}

export default CalendarMain;
