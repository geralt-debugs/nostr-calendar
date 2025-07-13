import { useContext } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { styled, Theme, useTheme } from "@mui/material";
import getWeekDays from "../common/getWeekDays";
import getSelectedWeekIndex from "../common/getSelectedWeekIndex";
import CalendarLayoutMonth from "./CalendarLayoutMonth";
import CalendarLayoutDayWeek from "./CalendarLayoutDayWeek";
import { IGetStyles } from "../common/types";

const drawerWidth = 260;
const DrawerHeader = styled("div")(({ theme }: { theme: Theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-center",
  ...theme.mixins.toolbar,
}));

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

function CalendarMain(props: any) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { stateCalendar } = useContext(CalendarContext);
  const { selectedDate, locale, layout } = stateCalendar;
  console.log(theme.mixins.toolbar);
  const { open, runAnimation } = props;

  const weeks = getWeekDays(selectedDate, 7);
  const selectedWeekIndex = getSelectedWeekIndex(selectedDate, weeks, 0);
  const selectedWeek = weeks[selectedWeekIndex];

  return (
    <div
      style={{
        ...styles.content,
        ...(open ? styles.contentShift : {}),
      }}
    >
      <DrawerHeader />

      {layout === "month" && (
        <CalendarLayoutMonth
          weeks={weeks}
          runAnimation={runAnimation}
          locale={locale}
        />
      )}

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
