import { useTheme, Theme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { HTMLAttributes } from "react";
import { Locale } from "date-fns";
import CalendarSmall from "../engine_components/CalendarSmall";
import { Filters } from "./Filters";
import { isMobile } from "../common/utils";

const drawerWidth = 260;
const getStyles = (
  theme: Theme,
): Record<string, HTMLAttributes<HTMLDivElement>["style"]> => ({
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  calendarSmall: {
    marginTop: theme.spacing(4),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(4),
    marginLeft: theme.spacing(1),
    minHeight: 265,
    minWidth: 240,
    background: theme.palette.background.paper,
  },
});

interface CalendarDrawerProps {
  selectedDate: Date;
  next: () => void;
  previous: () => void;
  open: boolean;
  handleDrawerClose: () => void;
  layout: "month" | "week" | "day";
  locale: Locale | null;
}

function CalendarDrawer(props: CalendarDrawerProps) {
  const { open, handleDrawerClose } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <Drawer
      style={{ ...styles.drawer, ...styles.drawerPaper }}
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={handleDrawerClose}
    >
      <div style={{ ...styles.drawerHeader }}>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </div>
      <Divider />
      <div style={{ ...styles.calendarSmall }}>{<CalendarSmall />}</div>
      <Divider />
      <Filters />
    </Drawer>
  );
}

export default CalendarDrawer;
